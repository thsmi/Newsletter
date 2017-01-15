<?php

require ("./php/newsletter/config.php");
require_once("php/newsletter/settings/settings.php");
require_once("php/newsletter/security/principal.php");
require_once("./php/newsletter/logic.php");

require ("./php/phpmailer/PHPMailerAutoload.php");


function doDrafts($action, $request) {
    
    $dir = Settings::getProperty("paths.drafts");
    
    if ($action === "enumerate")
        return doDraftsList();
    
    if ($action === "new")
        return doDraftsNew($request["subject"]);
    
    $id = $request["id"];
    ensureValidId($dir, $id);
    
    //$draftItem = (new Draft())->load($id);
    
    if ($action === "delete")
        return doDraftsDelete($id);
    
    if ($action === "load")
        return doDraftsLoad($id);
    
    if ($action === "save")
        return doDraftsSave($id, $request["subject"], $request["message"]);
    
    if ($action === "send")
        return doDraftsSend($id, $request["addresses"]);
    
    
    if ($action === "attachments.enumerate")
        return doDraftsAttachmentsEnumerate($id);
    
    if ($action === "attachments.upload")
        return doDraftsAttachmentsUpload($id, $_FILES['file'] );
    
    if ($action === "attachments.delete")
        return doDraftsAttachmentsDelete($id, $request["attachment"] );
    
    
    if ($action ==="images.upload")
        return doDraftsImagesUpload($id, $_FILES["file"]);
    
    
    throw new Excpetion ("Unkonw action $action");
}

function doArchive($action, $request) {
    
    $dir = Settings::getProperty("paths.archive");
    
    if ($action === "enumerate")
        return doArchivesList();
    
    $id = $request["id"];
    ensureValidId($dir, $id);
    
    if ($action === "load")
        return doArchiveLoad($id);
    
    if ($action === "send")
        return doArchiveSend($id, $request["addresses"]);
    
    
    if ($action === "attachments.enumerate")
        return doArchiveAttachmentsEnumerate($id);
    
    throw new Excpetion ("Unkonw action $action");
}

function doAddressBook($action, $request) {
    
    if ($action === "enumerate")
        return doAddressBookList();
    
    if (Principal::canEdit("addressbook") === false)
        throw new Exception("Insuficient permissions to change addressbooks");
    
    if ($action === "new")
        return doAddressBookNew($request["name"]);
    
    $id = $request["id"];
    ensureValidId(Settings::getProperty("paths.addressbook"), $id);
    
    if ($action === "delete")
        return doAddressBookDelete($id);
    
    if ($action === "load")
        return doAddressBookLoad($id);
    
    if ($action === "save")
        return doAddressBookSave($id, $request["name"], $request["addresses"]);
    
    throw new Excpetion ("Unkonw action $action");
}

function doSettings($action, $request) {
    
    if (Principal::canEdit("settings") === false)
        throw new Exception("Insuficient permissions to view and change settings");
    
    if($action === "paths.get") {
        
        return [
        "archive" => Settings::getProperty("paths.archive"),
        "archive.real" => realpath(Settings::getProperty("paths.archive")),
        "drafts" => Settings::getProperty("paths.drafts"),
        "drafts.real" => realpath(Settings::getProperty("paths.drafts")),
        "addressbook" => Settings::getProperty("paths.addressbook"),
        "addressbook.real" => realpath(Settings::getProperty("paths.addressbook")),
        "templates" => Settings::getProperty("paths.templates"),
        "templates.real" => realpath(Settings::getProperty("paths.templates"))
        ];
    }
    
    if($action === "mail.get") {
        return [
        "template" =>Settings::getProperty("mail.template"),
        "prefix" => Settings::getProperty("mail.prefix"),
        "from" => Settings::getProperty("mail.from"),
        "replyto" => Settings::getProperty("mail.replyto"),
        "sender" => Settings::getProperty("mail.sender")
        ];
    }
    
    if($action === "mail.set") {
        
        $template = Settings::getProperty("paths.templates").$request["template"];
        if (file_exists($template)=== false)
            throw new Exception("Invalid template, no such file");
        
        if (filter_var($request["from"], FILTER_VALIDATE_EMAIL) === false)
            throw new Exception("From is not a valid mail address");
        
        
        if (filter_var($request["replyto"], FILTER_VALIDATE_EMAIL) === false)
            throw new Exception("Reply-to is not a vaild mail address");
        
        Settings::setProperty("mail.template", $request["template"]);
        Settings::setProperty("mail.prefix", $request["prefix"]);
        Settings::setProperty("mail.from", $request["from"]);
        Settings::setProperty("mail.replyto", $request["replyto"]);
        Settings::setProperty("mail.sender", $request["sender"]);
        
        return [];
    }
    
    if ($action === "server.get") {
        return [
        //"timeout" =>Settings::getProperty("server.timeout"),
        "server.type" => Settings::getProperty("server.type"),
        ];
    }
    
    if($action === "server.set") {
        //Settings::setProperty("server.timeout", $request["timeout"]);
        Settings::setProperty("server.type", $request["type"]);
        return [];
    }
    
    if ($action === "server.smtp.get") {
        return [
        "host" => Settings::getProperty("server.smtp.host"),
        "port" => Settings::getProperty("server.smtp.port"),
        "security" => Settings::getProperty("server.smtp.security"),
        "authentication" => Settings::getProperty("server.smtp.authentication"),
        
        "username" => decrypt(Settings::getProperty("server.smtp.username")),
        "password" => decrypt(Settings::getProperty("server.smtp.password"))
        ];
    }
    
    if($action === "server.smtp.set") {
        Settings::setProperty("server.smtp.host", $request["host"]);
        Settings::setProperty("server.smtp.port", $request["port"]);
        Settings::setProperty("server.smtp.security", $request["security"]);
        Settings::setProperty("server.smtp.authentication", $request["authentication"]);
        
        Settings::setProperty("server.smtp.username", encrypt($request["username"]));
        Settings::setProperty("server.smtp.password", encrypt($request["password"]));
        return [];
    }
    
    if($action === "roles.get") {
        return [
        "settings" => Settings::getProperty("roles.settings"),
        "addressbook" => Settings::getProperty("roles.addressbook")
        ];
    }
    
    if($action === "roles.set") {
        Settings::setProperty("roles.settings", $request["settings"]);
        Settings::setProperty("roles.addressbook", $request["addressbook"]);
        return[];
    }
    
    throw new Exception ("Unknown action $action");
}

function doRequest($request) {
    
    if (!isset($_REQUEST['action'])) {
        throw new Exception("Unknown Request");
    }
    
    $action = $_REQUEST['action'];
    
    $action = explode(".", $action, 2);
    
    if ($action[0] === "drafts") {
        return doDrafts($action[1],$_REQUEST);
    }
    
    if ($action[0] === "archive") {
        return doArchive($action[1],$_REQUEST);
    }
    
    if ($action[0] === "addresses") {
        return doAddressBook($action[1],$_REQUEST);
    }
    
    if ($action[0] === "settings") {
        return doSettings($action[1],$_REQUEST);
    }
    
    throw new Exception("Invalid Request ".$action[0]);
}

try {
    $response = [];
    $response = doRequest($_REQUEST);
    echo json_encode($response);
    
} catch (Exception $e) {
    header("HTTP/1.1 500 Internal Server Error");
    echo $e->getMessage();
}

?>