<?php
//require("ChromePhp.php");
$api_token = $_POST["apitoken"];
$testEnabled = $_POST['testchkb'];
$phone = $_POST["phone"];
$titletext = $_POST["titletxt"];
$msgtext = $_POST["msgtext"];
//ChromePhp::log("Logging");
//ChromePhp::log("1 " . $testEnabled);
//ChromePhp::log("2 " . $titletext);
if (!empty($api_token)) {
    //Send an SMS using Gatewayapi.com
    $url = "https://gatewayapi.com/rest/mtsms";
    //Set SMS recipients and content
    $recipients = [$phone];
    if ($testEnabled == "testsms") {
        $json = [
            'sender' => 'FFW TEST',
            'message' => 'Das ist ein Test',
            'recipients' => [],
        ];
    } else {
        $json = [
            'sender' => $titletext,
            'message' => $msgtext,
            'recipients' => [],
        ];
    }

    foreach ($recipients as $msisdn) {
        $json['recipients'][] = ['msisdn' => $msisdn];
    }

    //Make and execute the http request
    //Using the built-in 'curl' library

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
    curl_setopt($ch, CURLOPT_USERPWD, $api_token . ":");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($json));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);
    curl_close($ch);
    print($result);
    $json = json_decode($result);
    print_r($json->ids);
} else {
    echo "NOK";
}
