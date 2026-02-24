<?PHP
header('Access-Control-Allow-Origin: *');
$remote_url = base64Toggle($_POST['location']);
$eventnum=$_POST['eventnum'];
$postdata = http_build_query(
    array(
        'eventnum' => $eventnum,
    )
);

$opts = array('http' =>
    array(
        'method'  => 'POST',
        'header'  => 'Content-type: application/x-www-form-urlencoded',
        'content' => $postdata
    )
);

$context  = stream_context_create($opts);

$content = file_get_contents($remote_url, false, $context);

if($content == false){
    echo "nodata";
}else{
    echo $content;
}

function base64Toggle($str) {
    if (!preg_match('~[^0-9a-zA-Z+/=]~', $str)) {
        $check = str_split(base64_decode($str));
        $x = 0;
        foreach ($check as $char) if (ord($char) > 126) $x++;
        if ($x/count($check)*100 < 30) return base64_decode($str);
    }
    return $str;
}

?>