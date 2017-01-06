<?php

/**
 * Reads and writes preferences. 
 *
 * Settings are identified by a unique cannonical path. 
 * The path is separated by dots.
 *
 * For perforance reasonse the settings are split into separate files.
 * The first path segement defines the json file which contains the setting. 
 */
class Settings {
    
    private static $items = [];    

    /**
     * Reads the given perference. 
     * The preferences are cached they are loaded for each request only once.
     *
     * @param $path the preference which should be read
     *
     * @return the preference read
     */
    static function getProperty($path) {
        $path = explode(".",$path,2);
        
        // TODO we nned to ensure path[0] is clean...
        if (isset($item[$path[1]]) === false) {
            Settings::$items[$path[0]] = json_decode(file_get_contents("settings/".$path[0].".json"), true);
        }
        
        return Settings::$items[$path[0]][$path[1]];
    }
    
    /**
     * Writes the given prefernce to file. The preference is written imediately.
     * Existing entries are replaced silently.
     *
     * @param $path the preference which should be written
     * @param $value the value which should be saved
     * 
     */
    static function setProperty($path, $value) {
        $path = explode(".",$path,2);
        Settings::$items[$path[0]] = json_decode(file_get_contents("settings/".$path[0].".json"), true);
        
        Settings::$items[$path[0]][$path[1]] = $value;
        
        file_put_contents( "settings/".$path[0].".json", json_encode(Settings::$items[$path[0]]));
    }
    
}

?>