<?PHP
header('Access-Control-Allow-Origin: *');
$remote_url = $_GET['location'];
$useAuthentication = $_GET['useAuthentication'];
if($useAuthentication === 'true'){
    $username = $_GET['username'];
    $password = is_base64_encoded($_GET['password']);

    $opts = array(
      "ssl"=>array(
            "verify_peer"=>false,
            "verify_peer_name"=>false,
        ),
      'http'=>array(
        'method'=>"GET",
        'header' => "Authorization: Basic " . base64_encode("$username:$password")
      )
    );

    $context = stream_context_create($opts);

    set_error_handler(
        function ($severity, $message, $file, $line) {
            throw new ErrorException($message, $severity, $severity, $file, $line);
        }
    );

    try {
        $content = file_get_contents($remote_url, false, $context);
        //for testing 401 error 
        //echo 'ERROR_CREDENTIALS';
        echo $content;
    }
    catch (Exception $e) {

        if (strpos($e->getMessage(), 'HTTP/1.1 401') !== false) {
            echo 'ERROR_CREDENTIALS';
        }else{
            echo "nodata";
        }
    }

    restore_error_handler();

}else{
    $content =@file_get_contents($remote_url);
    if($content == false){
        echo "nodata";
    }else{
        echo $content;
    }

}

function is_base64_encoded($data)
    {
            return $data;
    };


?>