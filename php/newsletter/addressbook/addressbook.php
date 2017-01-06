<?php

class AddressBookItem extends AbstractItem{
    
    function __construct($dir, $id) {

        parent::__construct($dir, $id);
    }
        
    function getAddresses() {
        return decrypt($this->getProperty("addresses"));
    }
    
    function setAddresses($addresses) {
        $dir = $this->dir.$this->id;
        
        //if (!checkdnsrr($domain, 'MX')) {
        // domain is not valid
        //}
        
        $this->setProperty("addresses", encrypt($addresses) );
        
        $teaser = substr($addresses, 0, 255);
        $this->setProperty("teaser", encrypt($teaser));
    }
    
    function getRecipients() {
        
        $recipients = $this->getAddresses();
        // Split the address book into individual entries. Delimiters are linebreaks and semicoli
        $recipients = preg_split("/\\r\\n|\\r|\\n|;/", $recipients);
        // then ignore all empty files.
        $recipients = array_map('trim', $recipients);
        $recipients = array_filter($recipients, function($value) { return $value !== ''; });
        
        return $recipients;
    }
    
    function getName() {
        return $this->getProperty("name");
    }
    
    function setName($name) {
        $this->setProperty("name", $name);
    }
    
    function getTeaser() {
        return decrypt($this->getProperty("teaser"));
    }
    
    function setModified() {
        $this->setProperty("modified", time());
    }
    
    function getModified() {
        return $this->getProperty("modified");
    }
    
}

class AddressBook {
    
    private $dir;
    
    function __construct() {
        $this->dir = Settings::getProperty("paths.addressbook");
    }
    
    function list() {
        return listItems($this->dir, ["name"],["teaser"]);
    }
    
    function load($id) {
        
        $id = basename($id);
        
        if (file_exists($this->dir.$id) === false) {
            throw new Exception("Loading address book entry for $id failed");
            }
        
        return new AddressBookItem($this->dir, $id);
    }
    
    function create() {
        $id = createUniqueId();
        
        if (file_exists($this->dir.$id) ) {
            throw new Exception("Creating a unique id failed");
        }
        
        mkdir($this->dir.$id);

        return  $this->load($id);
    }
    
    function delete($id) {

        if (file_exists($this->dir.$id) === false) {
            return;
        }        

        if (unlinkr($this->dir.$id) === false) {
            throw new Exception("Deleting address book entry failed");
        }
    }
}


?>