<?php


class Attachments {
    
    private $dir;
    
    function __construct($dir) {
        $this->dir = $dir;
    }

    function getDirectory() {
        return $this->dir."/attachments/";
    }
    
    function create() {
        mkdir($this->getDirectory());
    }
    
    function list() {
        if (file_exists($this->getDirectory()) === false) {
            throw new Exception("Failed to list attachments, no directory named ". $this->getDirectory());
        }
        
        $attachments = array_diff(scandir($this->getDirectory()), array('..', '.'));
        
        sort($attachments);
        
        return  $attachments;
    }
    
    function upload($files) {

        ensureUploadIsValid($files);

        if (count($files) === 0) {
            throw new Exception("No file uploaded");
        }
        
        $attachment = basename($files['name']);
        
        if (move_uploaded_file($files['tmp_name'], $this->getDirectory()."$attachment") === false) {
            throw new Exception("Uploading file $attachment failed");
        }
    }
    
    function delete($attachment) {
        $attachment = basename($attachment);

        if (file_exists($this->getDirectory().$attachment) === false)
          return;
        
        if (unlink($this->getDirectory().$attachment) === false) {
            throw new Exception("Deleting file $attachment failed");
        }
    }
    
}

?>