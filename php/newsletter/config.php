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

function xorString($string) {
    
    // TODO should be read from a config file
    $key = "Mu8reeshieraisoohaidaeyuleekohnayaighiechahthiebaosahheecahl";
    $length = min(strlen($key),strlen($string));
    
    
    for($i = 0; $i < $length; $i++) {
        $string[$i] = ($string[$i] ^ $key[$i % $length]);
    }
    
    return $string;
}

?>