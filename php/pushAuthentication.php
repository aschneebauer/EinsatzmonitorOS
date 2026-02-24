<?PHP
header('Access-Control-Allow-Origin: *');
$remote_url = base64Toggle("https://www.ffw-einsatzmonitor.at/php/authfirestation.php");
$uuid=$_POST['uuid'];
$firestation=$_POST['firestation'];
$postdata = http_build_query(
    array(
        'uuid' => $uuid,
        'firestation' => $firestation,
        'action' => 'insertAuth'
    )
);



$arrContextOptions=array(
    "ssl"=>array(
        "verify_peer"=>false,
        "verify_peer_name"=>false,
    ),
    'http' =>array(
            'method'  => 'POST',
            'header'  => 'Content-type: application/x-www-form-urlencoded',
            'content' => $postdata
    )
);

$content = file_get_contents($remote_url, false, stream_context_create($arrContextOptions));

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