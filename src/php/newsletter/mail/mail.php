<?php

class ImageRewriter {
    
    private $images = [];
    
    function setHtml($message) {
        
        $this->doc = new DOMDocument();
        $this->doc->encoding='UTF-8';
        $this->doc->loadHTML(mb_convert_encoding($message, 'HTML-ENTITIES', 'UTF-8'));
    }
    
    function getHtml() {
        return $this->doc->saveHTML();
    }
    
    function getHtmlBody() {
        $newHtml = '';
        $nodes = (new DOMXPath($this->doc))->evaluate('//body/node()');
        foreach ($nodes as $node) {
            $newHtml .=  $this->doc->saveHTML($node);
        }
        return $newHtml;
        
    }
    
    function rewrite($dir, $dest="cid:") {
        $doc = $this->doc;
        $elements = $doc->getElementsByTagName ('img');
        
        $dir = realpath($dir);
        
        
        foreach ($elements as $element) {
            $src = $element->getAttribute('src');
            
            if (strtolower(substr($src, 0 , 7)) === "http://")
                continue;
            
            if (strtolower(substr($src, 0 , 8)) === "https://")
                continue;
            
            if (strtolower(substr($src, 0 , 7)) === "data://")
                continue;
            
            $name = basename($src);
            
            // we ensure the file is located inside the image directory.
            if ((realpath($src) !== realpath($dir."/".$name))
            &&       (realpath($dir."/".$src) !== realpath($dir."/".$name))) {
                continue;
            }
            
            $src = realpath($dir."/".$name);
            
            if (file_exists( $dir."/".$name) === false) {
                continue;
            }
            
            $element->setAttribute("src", $dest.$name);
            
            $this->images[] = [
            "filename" => realpath($dir."/".$name),
            "name" => $name,
            "cid" => $name
            ];
        }
    }
    
    function getImages() {
        return $this->images;
    }
}

class Mail {
    
    private $context = [
    "images" => []
    ];
    
    function setMessage(MessageItem $item) {
        $message = $item->getMessage();
        $subject = $item->getSubject();
        
        if (trim($message) === "") {
            throw new Exception("Can not send an empty newsletter");
        }
        
        if (trim($subject) === "") {
            throw new Exception("Can not send an newsletter without a subject");
        }
        
        $this->context["message"] = $message;
        
        $prefix = Settings::getProperty("mail.prefix");
        if (substr($subject, 0, strlen($prefix)) !== $prefix) {
            $subject = $prefix." ".$subject;
        }
        
        $this->context["subject"] = $subject;
        $this->context["id"] = $item->getId();
        $this->context["directory"] = $item->getDirectory();
        
        $this->context["from"] = Settings::getProperty("mail.from");
        $this->context["replyto"] = Settings::getProperty("mail.replyto");
        $this->context["sender"] = Settings::getProperty("mail.sender");
        
        $this->setAttachments($item->getAttachments());
        $this->setEmbeddedImages($item->getImages());
        $this->setTemplate(Settings::getProperty("paths.templates").Settings::getProperty("mail.template"));
    }
    
    private function setTemplate($path) {
        
        $template = @file_get_contents($path);
        if( $template === FALSE) {
            throw new Exception("Could not load template from $path");
        }
        
        
        $dir = pathinfo($path ,PATHINFO_DIRNAME);
        
        $rewriter = new ImageRewriter();
        $rewriter->setHtml($template);
        $rewriter->rewrite($dir);
        
        $template = $rewriter->getHtml();
        $this->context["images"] = array_merge($this->context["images"], $rewriter->getImages());
        
        $template = str_replace('${content}', $this->context["message"], $template);
        
        $this->context["template"] = $template;
    }
    
    private function setAttachments(Attachments $attachments) {
        
        $dir = $this->context["directory"].$this->context["id"];
        
        $items = $attachments->enumerate();
        
        // convert the base names to qualified paths
        foreach($items as &$item) {
            $item =  $attachments->getDirectory().$item;
        }
        
        $this->context["attachments"] = $items;
    }
    
    private function setEmbeddedImages(EmbeddedImages $images) {
        
        $rewriter = new ImageRewriter();
        
        $rewriter->setHtml($this->context["message"]);
        
        $rewriter->rewrite($images->getDirectory());
        
        $this->context["message"] = $rewriter->getHtmlBody();
        $this->context["images"] = array_merge($this->context["images"], $rewriter->getImages());
    }

    /**
     * Defines to which recipients the mail should be send.
     *
     *  @param $addresses - the address book which contains the recipients.
     *
     *  @throws throws an excpetion in case the addres book is empty.
     */
    function setAddresses(AddressBookItem $addresses) {

        $recipient = $addresses->getRecipients();

        if (count($recipient) === 0) {
            throw new Exception("Can not send a mail to an empty address book.");
        }

        $this->context["recipients"] = $recipient;
    }
    
    function createMailer() {
        $mail = new PhpMailer(true);
        
        $type = Settings::getProperty("server.type");
        
        if ($type === "sendmail") {
            $mail->isSendmail();
            return $mail;
        }
        
        if ($type === "smtp") {
            $mail->isSMTP();
            $mail->SMTPKeepAlive = true;
            //$mail->SMTPDebug = 3
            
            $mail->Host = Settings::getProperty("server.smtp.host");
            $mail->Port = Settings::getProperty("server.smtp.port");
            $mail->SMTPSecure = Settings::getProperty("server.smtp.security");
            $mail->SMTPAuth = Settings::getProperty("server.smtp.authentication");
            
            $mail->Username = decrypt(Settings::getProperty("server.smtp.username"));
            $mail->Password = decrypt(Settings::getProperty("server.smtp.password"));
            
            return $mail;
        }
        
        throw new Exception("Unknown or invalid mail configuration");
    }
    
    function send() {
        
        $mail = $this->createMailer();
        
        // We send the mail as ISO-8859-1 for compatibility reasons.
        $mail->CharSet = 'ISO-8859-1';
        
        $mail->setFrom($this->context["from"],$this->context["sender"]);
        $mail->addReplyTo($this->context["replyto"],$this->context["sender"]);
        $mail->Subject = utf8_decode($this->context["subject"]);
        
        $mail->isHTML(true);
        
        
        $mail->Body    = utf8_decode($this->context["template"]);
        $mail->AltBody = utf8_decode(trim(strip_tags($this->context["template"])));
        
        
        foreach($this->context["attachments"] as $attachment) {
            $mail->addAttachment($attachment);
        }
        
        foreach($this->context["images"] as $image) {
            $mail->AddEmbeddedImage($image["filename"], $image["cid"]);
        }
        
        $error = [];
        
        foreach ($this->context["recipients"] as $recipient) {
            $mail->addAddress($recipient);
            
            if (!$mail->send()) {
                $error[] = $mail->ErrorInfo;
            }
            
            $mail->clearAddresses();
        }
        
        
        if (count($error) !== 0) {
            throw new Exception("Sending message failed : ".implode(" ",$error[0]));
        }
        
    }
    
    function archive() {
        
        $id = $this->context["id"];
        $source = $this->context["directory"];
        
        $target = (new Archive())->getDirectory();
        
        // Rewrite initMessage
        $message = $this->context["message"];
        $message = rewriteImages($message,"cid:", "".$target.$id."/images/" );
        
        
        if (rename($source.$id, "".$target.$id) === false) {
            throw new Exception("Failed to move message $id to archive");
        };
        
        $archiveItem = (new Archive())->load($id);
        $archiveItem->setMessage($message);
        $archiveItem->setModified();
    }
    
}

?>