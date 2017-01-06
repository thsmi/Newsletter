<?php 
class Principal {
    
    private static $roles = [];
    
    static function canEdit($topic) {
        
        if ( array_key_exists($topic, Principal::$roles) === false) {
            $role = Settings::getProperty("roles.".$topic);
            Principal::$roles[$topic] = preg_split("/\r\n|\n|\r|;|,/", $role);
        }
        
        if (array_key_exists("REMOTE_USER", $_SERVER)
            && in_array($_SERVER["REMOTE_USER"],Principal::$roles[$topic]))
        return true;
        
        if (array_key_exists("REDIRECT_REMOTE_USER", $_SERVER)
            && in_array($_SERVER["REDIRECT_REMOTE_USER"], Principal::$roles[$topic]))
        return true;
        
        return false;
    }
}
?>