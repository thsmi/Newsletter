<?php


/**
 * Enforces roles based on the server's basic authentication.
 *
 * It compares the REMOTE_USER and REDIRECT_REMOTE_USER variables (which contain the username) against the role's permission.
 * In case the user is contained in the role access is granted otherwise denied.
 *
 * Keep in mind, it will grand access, in case no server authentication is defined. 
 * Which means in case there is neither a REMOTE_USER nor a REDIRECT_REMOTE_USER variable is defined. 
 */
class Principal {
    
    private static $roles = [];
    
    /**
     * Checks if the request's user is allowed to access the given resource
     *
     * @param $resource - the resource as a unique string identifier.
     * @return true in case access is granted otherwise false
     */
    static function canEdit($resource) {
        
        if ( array_key_exists($resource, Principal::$roles) === false) {
            $role = Settings::getProperty("roles.".$resource);
            Principal::$roles[$resource] = preg_split("/\r\n|\n|\r|;|,/", $role);
        }
        
        
        if (array_key_exists("REMOTE_USER", $_SERVER)) {
            if (in_array($_SERVER["REMOTE_USER"],Principal::$roles[$resource]) === false)
                return false;
        }
        
        if (array_key_exists("REDIRECT_REMOTE_USER", $_SERVER)) {
            if (in_array($_SERVER["REDIRECT_REMOTE_USER"], Principal::$roles[$resource]) === false)
                return false;
        }
        
        return true;
    }
}
?>