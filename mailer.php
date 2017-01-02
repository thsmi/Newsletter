<?php

require ("php/newsletter/config.php");
require ("php/phpmailer/PHPMailerAutoload.php");


function createUniqueId() {
    return sha1(uniqid('', true));
}

function unlinkr($dir) {
    
    $files = array_diff(scandir($dir), array('.','..'));
    
    foreach ($files as $file) {
        
        if (is_dir("$dir/$file"))
            unlinkr("$dir/$file");
        else
            unlink("$dir/$file");
    }
    
    return rmdir($dir);
}

function ensureValidId($dir, $id) {
    
    if (strlen($id) === 0)
        throw new Exception("Empty Identifier");
    
    if (!preg_match('/^[a-f0-9]{2,}$/i', $id)) {
        throw new Exception("Invalid Identifier $id");
    }
    
    if (!file_exists($dir.$id)) {
        throw new Exception("Unknown Identifier $id for directory $dir");
        }
    
    return true;
}

function listItems($dir, $items, $cryptedItems = []) {
    
    $files = array_diff(scandir($dir), array('..', '.'));
    
    $messages = [];
    
    foreach ($files as $file) {
        $message = [];
        $message["id"] = "".$file;
        
        foreach ($items as $item) {
            $message[$item] = file_get_contents($dir.$file."/".$item);
        }
        
        foreach ($cryptedItems as $item) {
            $message[$item] = xorString(file_get_contents($dir.$file."/".$item));
        }
        
        $messages[] = $message;
    }
    
    return $messages;
}

function loadMessage($dir, $id) {
    
    ensureValidId($dir, $id);
    
    if (!file_exists($dir.$id."/subject")) {
        throw new Exception("Failed to load subject for $id");
        }
    
    $subject = file_get_contents($dir.$id."/subject");
    
    if (!file_exists($dir.$id."/message")) {
        throw new Exception("Failed to load message for $id");
        }
    
    $message = file_get_contents($dir.$id."/message");
    
    return [
    "id" => $id,
    "message" => $message,
    "subject" => $subject
    ];
}

function listAttachments($dir, $id) {
    ensureValidId($dir, $id);
    
    $attachments = array_diff(scandir("$dir$id/attachments"), array('..', '.'));
    
    sort($attachments);
    
    return [
    "id" => $id,
    "attachments" => $attachments
    ];
}



function doDraftsList() {
    return listItems(getDraftsDirectory(),  ["modified", "subject", "teaser"]);
}

function doDraftsNew($subject) {
    $id = createUniqueId();
    $dir = getDraftsDirectory();
    
    if (file_exists($dir.$id)) {
        throw new Exception("Creating a unique id failed");
    }
    
    mkdir($dir.$id);
    mkdir($dir.$id."/attachments");
    mkdir($dir.$id."/images");
    
    return doDraftsSave($id, $subject, "");
}



function doDraftsDelete($id) {
    
    $dir = getDraftsDirectory();
    ensureValidId($dir, $id);
    
    unlinkr($dir.$id);
    
    return doDraftsList();
}


function doDraftsLoad($id) {
    $dir = getDraftsDirectory();
    return loadMessage($dir, $id);
}

function doDraftsSave($id, $subject, $message) {
    $dir = getDraftsDirectory();
    ensureValidId($dir, $id);
    
    if (file_put_contents($dir.$id."/subject", $subject)  === false) {
        throw new Exception("Failed to update subject for $id");
        }
    
    if (file_put_contents($dir.$id."/message", $message)  === false) {
        throw new Exception("Failed to update message for $id");
        }
    
    $teaser = substr(strip_tags($message), 0, 255);
    if (file_put_contents($dir.$id."/teaser", $teaser)  === false) {
        throw new Exception("Failed to update teaser for $id");
        }
    
    $modified = time();
    if (file_put_contents($dir.$id."/modified", $modified)  === false) {
        throw new Exception("Failed to update modified for $id");
        }
    
    return [
    "id" => $id,
    "subject" => $subject,
    "teaser" => $teaser,
    "modifier" => $modified,
    "message" => $message
    ];
    
}

function doDraftsAttachmentsList($id) {
    return listAttachments(getDraftsDirectory(), $id);
}

function ensureUploadIsValid($files) {

  if ($files["error"] === 0)
    return true;

  if ($files["error"] === 1 || $files["error"] === 2)
    throw new Exception('The uploaded file exceeds maximal allowed upload size');

  if ($files["error"] === 3 || $files["error"] === 4)
    throw new Exception('No valid file was uploaded');

  if ($files["error"] === 6 || $files["error"] === 7)
    throw new Exception('Error while processing the upload, file could not be stored on the server');

  if ($files["error"] === 8 || $files["error"] === 7)
    throw new Exception('File violates the server\'s policy');    

  throw new Exception("An error orccured while while uploading file.");
}

function doDraftsAttachmentsUpload($id, $files) {

    ensureUploadIsValid($files);

    $dir = getDraftsDirectory();
    ensureValidId($dir, $id);
    
    $attachment = basename($files['name']);

    throw new Exception(var_dump($files));
    
    if (move_uploaded_file($files['tmp_name'], "$dir$id/attachments/$attachment") === false) {
        throw new Exception("Uploading file $attachment failed");
    }
    
    return doDraftsAttachmentsList($id);
}

function doDraftsAttachmentsDelete($id, $attachment) {
    $dir = getDraftsDirectory();
    ensureValidId($dir, $id);
    
    $attachment = basename($attachment);
    
    if (unlink("$dir$id/attachments/$attachment") === false) {
        throw new Exception("Deleting file $attachment failed");
    }
    
    return doDraftsAttachmentsList($id);
}

function doDraftsImagesUpload($id, $files) {

    ensureUploadIsValid($files);
    
    $dir = getDraftsDirectory();
    ensureValidId($dir, $id);
    
    if (count($files) === 0) {
        throw new Exception("No file uploaded");
    }
    
    $ext = pathinfo($files['name'] , PATHINFO_EXTENSION);
    $name = createUniqueId();
    
    $path = "$dir$id/images/$name.$ext";
    
    if (move_uploaded_file($files['tmp_name'], $path) === false) {
        throw  new Exception("Could not process uploaded file");
    }
    
    return [
    "id" => $id,
    "src" => $path
    ];
}


function getBody($doc) {
    
    $newHtml = '';
    $nodes = (new DOMXPath($doc))->evaluate('//body/node()');
    foreach ($nodes as $node) {
        $newHtml .= $doc->saveHTML($node);
    }
    
    return $newHtml;
}

function rewriteImages($html, $old, $new) {
    $doc = new DOMDocument();
    $doc->encoding='UTF-8';
    $doc->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
    
    $images = $doc->getElementsByTagName ('img');
    foreach ($images as $image) {
        $src = $image->getAttribute('src');
        
        if (substr($src, 0, strlen($old)) !== $old)
            continue;
        
        $image->setAttribute("src", "".$new."".substr($src, strlen($old)));
    }
    
    return getBody($doc);
}

function initImages(&$context, $dir, $id) {
    
    $doc = new DOMDocument();
    $doc->encoding='UTF-8';
    $doc->loadHTML(mb_convert_encoding($context["message"], 'HTML-ENTITIES', 'UTF-8'));
    
    
    $context["images"]= [];
    
    $images = $doc->getElementsByTagName ('img');
    foreach ($images as $image) {
        $src = $image->getAttribute('src');
        
        if (strtolower(substr($src, 0 , 7)) === "http://")
            continue;
        
        if (strtolower(substr($src, 0 , 8)) === "https://")
            continue;
        
        if (strtolower(substr($src, 0 , 7)) === "data://")
            continue;
        
        if (file_exists($src) === false)
            continue;
        
        $name = basename($src);
        
        // we ensure the file is located inside the attachment directory.
        if (realpath($src) !== realpath("$dir$id/images/$name"))
            continue;
        
        $image->setAttribute("src", "cid:$name");
        
        $context["images"][] = [
        "filename" => $src,
        "name" => $name,
        "cid" => $name
        ];
    }
    
    $context["message"] = getBody($doc);
}

function initAttachments(&$context, $dir, $id) {
    // append path to each element...
    $attachments = listAttachments($dir, $id)["attachments"];

    foreach($attachments as &$attachment) {
      $attachment = $dir.$id."/attachments/".$attachment;
    }

    $context["attachments"] = $attachments;
}

function initRecipients(&$context, $id){
    
    $recipients = doAddressBookLoad($id)["addresses"];
    
    // Split the address book into individual entries. Delimiters are linebreaks and semicoli
    $recipients = preg_split("/\\r\\n|\\r|\\n|;/", $recipients);
    // then ignore all empty files.
    $recipients = array_map('trim', $recipients);
    $recipients = array_filter($recipients, function($value) { return $value !== ''; });
    
    $context["recipients"] = $recipients;
}

function initTemplate(&$context, $path) {
    
    $template = file_get_contents($path);
    if( $template === FALSE) {
        throw new Exception("Could not load template from $path");
    }
    
    $template = str_replace('${content}', $context["message"], $template);
    
    $context["template"] = $template;
}

function initMessage(&$context, $dir, $id) {
    $message = loadMessage($dir, $id);
    
    if (trim($message["message"]) === "") {
        throw new Exception("Can not send an empty newsletter");
    }
    
    if (trim($message["subject"]) === "") {
        throw new Exception("Can not send an newsletter without a subject");
    }
    
    $context["message"] = $message["message"];
    $context["subject"] = $message["subject"];
}

function prepareSend($dir, $id, $addresses) {
    
    $context = [];
    
    initMessage($context, $dir, $id);
    initImages($context, $dir, $id);
    initAttachments($context, $dir, $id);
    initRecipients($context, $addresses);
    initTemplate($context, getTemplate() );
    
    return $context;
}

function sendMessage(&$context) {
    
    $mail = new PhpMailer();
    $mail->isSMTP();
    $mail->SMTPKeepAlive = true;
    
    initPhpMailer($mail);
    
    // We send the mail as ISO-8859-1 for compatibility reasons.
    $mail->CharSet = 'ISO-8859-1';
    
    $mail->Subject = utf8_decode($context["subject"]);
    
    $mail->isHTML(true);
    
    
    $mail->Body    = utf8_decode($context["template"]);
    $mail->AltBody = utf8_decode(trim(strip_tags($context["template"])));


    foreach($context["attachments"] as $attachment) {
        $mail->addAttachment($attachment);
    }
    
    foreach($context["images"] as $image) {
        $mail->AddEmbeddedImage($image["filename"], $image["cid"]);
    }
    
    $error = [];
    
    foreach ($context["recipients"] as $recipient) {
        $mail->addAddress($recipient);
        
        if (!$mail->send()) {
            $error[] = $mail->ErrorInfo;
        }
        
        $mail->clearAddresses();
    }
    
    if (count($error) !== 0) {
        throw new Exception("Sending message failed ".implode(" ",$error[0]));
    }
}

function doDraftsSend($id, $addresses) {
  
    $dir = getDraftsDirectory();
    ensureValidId($dir, $id);
    
    $msg = prepareSend($dir, $id, $addresses);
    sendMessage($msg);
    
    // Rewrite initMessage    
    $modified = time();
    if (file_put_contents($dir.$id."/modified", $modified) === false) {
        throw new Exception("Failed to update modified for $id");
    }

    $msg = rewriteImages($msg["message"],"cid:", getArchiveDirectory().$id."/images/" );
    if (file_put_contents("$dir$id/message", $msg) === false) {
      throw new Exception("Failed to update message for $id");
    }

    if (rename("$dir$id", "".getArchiveDirectory().$id) == false) {
      throw new Exception("Failed to move message $id to archive");
    };

    return [];    
}



function doArchivesList() {
    return listItems(getArchiveDirectory(),  ["modified", "subject", "teaser"]);
}

function doArchiveLoad($id) {
    $dir = getArchiveDirectory();
    return loadMessage($dir, $id);
}

function doArchiveSend($id, $addresses) {
  
    $dir = getArchiveDirectory();
    ensureValidId($dir, $id);
    
    $msg = prepareSend($dir, $id, $addresses);
    sendMessage($msg);
    
    return [];    
}

function doArchiveAttachmentsList($id) {
    return listAttachments(getArchiveDirectory(), $id);
}





function doAddressBookList() {
    return listItems(getAddressBookDirectory(), ["name"],["teaser"]);
}

function doAddressBookNew($name) {
    $id = createUniqueId();
    $dir = getAddressBookDirectory();
    
    if (file_exists($dir.$id))
        throw new Exception("Creating a unique id failed");
    
    mkdir($dir.$id);
    
    return doAddressBookSave($id, $name, "");
}

function doAddressBookDelete($id) {
    
    $dir =  getAddressBookDirectory();
    ensureValidId($dir, $id);
    
    unlinkr($dir.$id);
    
    return doAddressBookList();
}

function doAddressBookLoad($id) {
    $dir = getAddressBookDirectory();
    ensureValidId($dir, $id);
    
    if (!file_exists("$dir$id/name")) {
        throw new Exception("Failed to load subject for $id");
        }
    
    $name = file_get_contents("$dir$id/name");
    
    if (!file_exists($dir.$id."/addresses")) {
        throw new Exception("Failed to load message for $id");
        }
    
    $addresses = xorString(file_get_contents($dir.$id."/addresses"));
    
    
    return [
    "id" => $id,
    "addresses" => $addresses,
    "name" => $name
    ];
}


function doAddressBookSave($id, $name, $addresses) {
    $dir = getAddressBookDirectory();
    ensureValidId($dir, $id);
    
    //if (!checkdnsrr($domain, 'MX')) {
    // domain is not valid
    //}
    
    if (file_put_contents($dir.$id."/name", $name) === false) {
        throw new Exception("Failed to update name for $id");
        }
    
    if (file_put_contents($dir.$id."/addresses", xorString($addresses)) === false) {
        throw new Exception("Failed to update addresses for $id");
        }
    
    $teaser = substr($addresses, 0, 255);
    if (file_put_contents($dir.$id."/teaser", xorString($teaser)) === false) {
        throw new Exception("Failed to update teaser for $id");
        }
    
    $modified = time();
    if (file_put_contents($dir.$id."/modified", $modified) === false) {
        throw new Exception("Failed to update modified for $id");
        }
    
    return [
    "id" => $id,
    "name" => $name,
    "teaser" => $teaser,
    "modifier" => $modified,
    "addresses" => $addresses
    ];
}


function doRequest($request) {
    
    if (!isset($_REQUEST['action'])) {
        throw new Exception("Unknown Request");
    }
    
    $action = $_REQUEST['action'];
    
    
    if ($action === "drafts.list")
        return doDraftsList();
    
    if ($action === "drafts.new")
        return  doDraftsNew($request["subject"]);
    
    if ($action === "drafts.delete")
        return doDraftsDelete($request["id"]);
    
    if ($action === "drafts.load")
        return doDraftsLoad($request["id"]);
    
    if ($action === "drafts.save")
        return doDraftsSave($request["id"], $request["subject"], $request["message"]);
    
    if ($action === "drafts.send")
        return doDraftsSend($request["id"], $request["addresses"]);
    
    if ($action === "drafts.attachments.list")
        return doDraftsAttachmentsList($request["id"]);
    
    if ($action === "drafts.attachments.upload")
        return doDraftsAttachmentsUpload($request["id"], $_FILES['file'] );
    
    if ($action === "drafts.attachments.delete")
        return doDraftsAttachmentsDelete($request["id"], $request["attachment"] );
    
    if ($action === "drafts.images.upload")
        return doDraftsImagesUpload($request["id"], $_FILES["file"]);    
    
    

    if ($action === "archive.list")
        return doArchivesList();
    
    if ($action === "archive.load")
        return doArchiveLoad($request["id"]);
    
    if ($action === "archive.attachments.list")
        return doArchiveAttachmentsList($request["id"]);

    if ($action === "archive.send")
        return doArchiveSend($request["id"], $request["addresses"]);        
        
    
    
    
    if ($action === "addresses.list")
        return doAddressBookList();
    
    if ($action === "addresses.new")
        return doAddressBookNew($request["name"]);
    
    if ($action === "addresses.delete")
        return doAddressBookDelete($request["id"]);
    
    if ($action === "addresses.load")
        return doAddressBookLoad($request["id"]);
    
    if ($action === "addresses.save")
        return doAddressBookSave($request["id"], $request["name"], $request["addresses"]);
    
    throw new Exception("Invalid Request $action");
}

$response = [];

try {
    
    $response = doRequest($_REQUEST);
    
    
    echo json_encode($response);
    /*
    
    
    drafts.send
    archive.send
    
    */
    
} catch (Exception $e) {
    header("HTTP/1.1 500 Internal Server Error");
    echo $e->getMessage();
}

?>