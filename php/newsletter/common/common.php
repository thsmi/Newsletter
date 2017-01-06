<?php

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

function listItems($dir, $items, $cryptedItems = []) {

    $files = scandir($dir);

    if ($files === FALSE)
      throw new Exception("Failed to list $dir, no such directory");

    $files = array_diff($files, array('..', '.'));
    
    $messages = [];
    
    foreach ($files as $file) {
        $message = [];
        $message["id"] = "".$file;
        
        foreach ($items as $item) {
            $message[$item] = file_get_contents($dir.$file."/".$item);
        }
        
        foreach ($cryptedItems as $item) {
            $message[$item] = decrypt(file_get_contents($dir.$file."/".$item));
        }
        
        $messages[] = $message;
    }
    
    return $messages;
}

class AbstractItem{
    
    protected $id;
    protected $dir;
    
    function __construct($dir, $id) {
        $this->dir = $dir;
        $this->id = $id;
    }
    
    protected function getProperty($name) {
        $dir = $this->getDirectory().$this->getId();
        
        $name = basename($name);
        
        if (file_exists($dir."/".$name) === false) {
            throw new Exception("Failed to load $name for $this->id");
            }
        
        return file_get_contents($this->dir.$this->id."/".$name);
    }
    
    protected function setProperty($name, $value) {
        $dir = $this->getDirectory().$this->getId();
        
        if (file_put_contents($dir."/".$name, $value) === false) {
            throw new Exception("Failed to update $name for $this->id");
            }
    }
    
    function getId() {
        return $this->id;
    }
    
    function getDirectory() {
        return $this->dir;
    }
}

?>