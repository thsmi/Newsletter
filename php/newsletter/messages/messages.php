<?php

class MessageItem extends AbstractItem{
        
    function getSubject() {
        return $this->getProperty("subject");
    }
    
    function setSubject($subject) {
        $this->setProperty("subject", $subject);
    }
    
    function getMessage() {
        return $this->getProperty("message");
    }
    
    function setMessage($message) {
        $this->setProperty("message", $message );
        
        $teaser = strip_tags($message);
        $teaser = substr($teaser, 0, 255);
        $this->setProperty("teaser", $teaser);
    }
    
    function getTeaser() {
        return $this->getProperty("teaser");
    }
    
    function setModified() {
        $this->setProperty("modified", time());
    }
    
    function getModified() {
        return $this->getProperty("modified");
    }

    function getAttachments() {
        $dir = $this->getDirectory().$this->getId();
        return new Attachments($dir);
    }

    function getImages() {
         $dir = $this->getDirectory().$this->getId();
         return new EmbeddedImages($dir);
    }
}

class Archive {
    protected $dir;
    
    function __construct() {
        $this->dir = Settings::getProperty("paths.archive");
    }

    function getDirectory() {
      return $this->dir;
    }
    
    function enumerate() {
        return enumerateItems($this->dir, ["modified", "subject", "teaser"]);
    }
    
    function load($id) {
        
        $id = basename($id);
        
        if (file_exists($this->dir.$id) === false) {
            throw new Exception("Loading message for $id failed");
            }
        
        return new MessageItem($this->dir, $id);
    }
}

class Drafts extends Archive{
    
    function __construct() {
        $this->dir = Settings::getProperty("paths.drafts");
    }
    
    function create() {
        $id = createUniqueId();
        
        if (file_exists($this->dir.$id) ) {
            throw new Exception("Creating a unique id failed");
        }
        
        mkdir($this->dir.$id);

        $item = $this->load($id);

        $item->getImages()->create();
        $item->getAttachments()->create();
        
        return $item;
    }
    
    function delete($id) {
        
        if (file_exists($this->dir.$id) === false) {
            return;
        }
        
        if (unlinkr($this->dir.$id) === false) {
            throw new Exception("Deleting message failed");
        }
    }
    
    
}



?>