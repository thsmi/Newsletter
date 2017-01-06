<?php


class Attachments {
    
    private $dir;
    
    function __construct($dir) {
        $this->dir = $dir;
    }

    public function getDirectory() {
        return $this->dir."/attachments/";
    }
    
    public function create() {
        mkdir($this->getDirectory());
    }
    
    public function enumerate() {
        if (file_exists($this->getDirectory()) === false) {
            throw new Exception("Failed to enumerate attachments, no directory named ". $this->getDirectory());
        }
        
        $attachments = array_diff(scandir($this->getDirectory()), array('..', '.'));
        
        sort($attachments);
        
        return  $attachments;
    }
    
    public function upload($files) {

        ensureUploadIsValid($files);

        if (count($files) === 0) {
            throw new Exception("No file uploaded");
        }
        
        $attachment = basename($files['name']);
        
        if (move_uploaded_file($files['tmp_name'], $this->getDirectory()."$attachment") === false) {
            throw new Exception("Uploading file $attachment failed");
        }
    }
    
    public function delete($attachment) {
        $attachment = basename($attachment);

        if (file_exists($this->getDirectory().$attachment) === false)
          return;
        
        if (unlink($this->getDirectory().$attachment) === false) {
            throw new Exception("Deleting file $attachment failed");
        }
    }
    
}

?>