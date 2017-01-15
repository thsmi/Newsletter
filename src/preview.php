<?php

require_once("php/newsletter/settings/settings.php");
require_once("php/newsletter/common/common.php");
require_once("php/newsletter/messages/messages.php");
require_once("php/newsletter/mail/mail.php");


function doRequest($request) {
    
    $item = null;

    $type = strtolower($request["type"]);
    $id = $request["id"];
    
    if ($type === "draft")
        $item = (new Drafts())->load($id);
    else if ($type === "archive")
        $item = (new Archive())->load($id);
    else
        throw new Exception("Invalid preview type ".$type);
    
    $template = Settings::getProperty("paths.templates").Settings::getProperty("mail.template");
    $dir = pathinfo($template ,PATHINFO_DIRNAME);
    
    $template = file_get_contents($template);
    if( $template === FALSE) {
        throw new Exception("Could not load template from $path");
    }
    
    $rewriter = new ImageRewriter();
    $rewriter->setHtml($template);
    $rewriter->rewrite($dir, $dir."/");
    $template = $rewriter->getHtml();
    
    $message = $item->getMessage();
    
    $template = str_replace('${content}', $message, $template);
    
    return $template;
    
}

try {
    
    $response = doRequest($_REQUEST);
    echo $response;
    
} catch (Exception $e) {
    header("HTTP/1.1 500 Internal Server Error");
    echo $e->getMessage();
}

?>