<?php

class EmbeddedImages {
    
    private $dir;
    
    function __construct($dir) {
        $this->dir = $dir;
    }

    function getDirectory() {
        return $this->dir."/images/";
    }    
    
    function create() {
        mkdir($this->getDirectory());
    }
    
    function upload($files) {
        
        ensureUploadIsValid($files);
        
        if (count($files) === 0) {
            throw new Exception("No file uploaded");
        }
        
        $ext = pathinfo($files['name'] , PATHINFO_EXTENSION);
        $name = createUniqueId();
        
        $path = $this->getDirectory()."$name.$ext";
        
        if (move_uploaded_file($files['tmp_name'], $path) === false) {
            throw  new Exception("Could not process uploaded file");
        }
        
        return $path;
    }
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


?>