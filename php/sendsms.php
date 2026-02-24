<?php
//require("ChromePhp.php");
require "../db/mysql.php";
$api_token = $_POST["apitoken"];
$eventtype = $_POST["eventtype"];
$msgtext = $_POST["msgtext"];
$eventnum = $_POST["eventnum"];
$alarm_group = $_POST["alarm_group"];
require "../db/sqlLite.php";

if (!empty($api_token)) {
    //Send an SMS using Gatewayapi.com
    $url = "https://gatewayapi.com/rest/mtsms";
    //Set SMS recipients and content
    $readSMSUser = readSMSUsers($alarm_group);
    $recipients = [];
    if ($readSMSUser != false) {
        $recipients = $readSMSUser;
    }
    if (count($recipients) > 0) {
        //ChromePhp::log($recipients);        
        //for testing
        //$recipients = [+436504404932];
        $json = [
            'sender' => 'FFW Alarm',
            'message' => $msgtext,
            'recipients' => [],
        ];
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
        //ChromePhp::log($result);
        print($result);
        $json = json_decode($result);
        insertSMSHistory($eventnum);
        print_r($json->ids);
    } else {
        echo "NO_RECIEPIENTS_FOUND";
    }
} else {
    echo "NOK";
}





function insertSMSHistory($eventnum)
{
    $ini = parse_ini_file('../db/db.ini');
    $prefix = $ini["mysql_prefix"];
    if ($ini['mysql_enabled'] == true) {

        $date = new DateTime();
        $timeStamp = $date->getTimestamp();

        $db = new DbMysql();
        $sql = "INSERT INTO $prefix" . "smshistory (event, time) VALUES ('$eventnum', '$timeStamp')";
        $db->query($sql);
        echo "OK";
    } else {
        $ini["db_name"] = "../db/" . $ini["db_name"];
        $db = new DbSqlLite($ini);
        $db->busyTimeout(5000);
        $db->exec('PRAGMA journal_mode = wal;');
        $db->query("INSERT INTO smshistory (event, time) VALUES ('$eventnum', strftime('%s','now'))");
        echo "OK";
    }
}


function readSMSUsers($alarm_group): array
{
    //ChromePhp::log("READ SMS USERS");
    $ini = parse_ini_file('../db/db.ini');
    $prefix = $ini["mysql_prefix"];
    $result = [];
    if ($ini['mysql_enabled'] == true) {
        $db = new DbMysql();
        $sql = "SELECT phone FROM $prefix" . "smsusers where phone_group='$alarm_group' and kzloe='0'";
        $result = $db->select($sql);
        $resNew = [];
        foreach ($result as $user) {
            array_push($resNew, $user["phone"]);
        }
        return $resNew;
    } else {
        $ini["db_name"] = "../db/" . $ini["db_name"];
        $dbs = new DbSqlLite($ini);
        $dbs->busyTimeout(5000);
        $dbs->exec('PRAGMA journal_mode = wal;');
        $sql = "select phone from smsusers where phone_group='$alarm_group' and kzloe ='0'";
        $results = $dbs->query($sql);
        $out = [];
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            $out[] = $row["phone"];
        }
        return $out;
    }
}
