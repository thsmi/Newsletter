<?php

class Settings {
    
    private static $items = [];    
    
    
    static function getProperty($path) {
        $path = explode(".",$path,2);
        
        // TODO we nned to ensure path[0] is clean...
        if (isset($item[$path[1]]) === false) {
            Settings::$items[$path[0]] = json_decode(file_get_contents("settings/".$path[0].".json"), true);
        }
        
        return Settings::$items[$path[0]][$path[1]];
    }
    
    static function setProperty($path, $value) {
        $path = explode(".",$path,2);
        Settings::$items[$path[0]] = json_decode(file_get_contents("settings/".$path[0].".json"), true);
        
        Settings::$items[$path[0]][$path[1]] = $value;
        
        file_put_contents( "settings/".$path[0].".json", json_encode(Settings::$items[$path[0]]));
    }
    
}
// Show
// cryptokey

// Path
//  AddressBook
//  Drafts
//  Archive
//  Template

// Mail
//  Prefix [FGWH]
//  From [newsletter@wolf-hirth.de]
//  Reply TO [newsletter@wolf-hirth.de]
//
// [] sendmail
//
// [] smtp
//   Host
//   Secure Auth
//   Secure = "TLS|SSL|NONE"
//   PORT
//   Username
//   Password

// admin users


?>