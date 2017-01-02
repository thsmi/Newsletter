<?php


function xorString($string) {
    
    // TODO should be read from a config file
    $key = "Mu8reeshieraisoohaidaeyuleekohnayaighiechahthiebaosahheecahl";
    $length = min(strlen($key),strlen($string));
    
    
    for($i = 0; $i < $length; $i++) {
        $string[$i] = ($string[$i] ^ $key[$i % $length]);
    }
    
    return $string;
}

function getDraftsDirectory() {
    return "data/drafts/";
}

function getArchiveDirectory() {
    return "data/archive/";
}

function getAddressBookDirectory() {
    return "data/addresses/";
}

function getTemplate() {
    return "templates/template.tpl";
}

function initPhpMailer($mail) {
    //$mail->SMTPDebug = 3;
    
    $mail->Host = "smtp.example.com";
    $mail->SMTPAuth = true;
    $mail->Username = "me@example.com";
    $mail->Password = "secret";
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;
    
    $mail->setFrom("me@example.com","Newsletter");
    $mail->addReplyTo("me@example.com", "Newsletter");
}

function getSubjectPrefix() {
    return "[ME] ";
}

?>