<?php

function encrypt($data) {
    return base64_encode(xorString($data));
}

function decrypt($data) {
    $data = base64_decode($data, true);
    if ($data === false)
        throw new Exception("Failed to decode stream");
    
    return xorString($data);
}

/**
 * XORs a string.
 *
 * The key which is loaded from the settings directory.
 * 
 * @param $string - the string which should be XORed.
 * @return the XORed string.
 *
 * @throws an exception in case the keyfile is empty or non existant.
 */
function xorString($string) {
    
    $key = file_get_contents("settings/keyfile");
    if ($key === FALSE)
        throw new Exception("Failed to load keyfile");

    if (strlen($key) === 0)
      throw new Exception("Keyfile is empty");
    
    $length = min(strlen($key),strlen($string));
    
    for($i = 0; $i < $length; $i++) {
        $string[$i] = ($string[$i] ^ $key[$i % $length]);
    }
    
    return $string;
}

?>