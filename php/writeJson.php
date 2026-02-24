<?php


$userLeitstelle = $_POST['userLeitstelle'];
$passLeitstelle = $_POST['passLeitstelle'];
$checkAlarmAfter = $_POST['checkAlarmAfter'];
$refreshAlarmsTirol = $_POST['refreshAlarmsTirol'];
$maxEvents = $_POST['maxEvents'];
$resourceStatus = $_POST['resourceStatus'];
$refreshResourceStatus = $_POST['refreshResourceStatus'];
$showOEIOpenStreetMap = $_POST['showOEIOpenStreetMap'];
$firestation = $_POST['firestation'];
$waterurlone = $_POST['waterurlone'];
$waterlabelone = $_POST['waterlabelone'];
$waterurltwo = $_POST['waterurltwo'];
$waterlabeltwo = $_POST['waterlabeltwo'];
$googlecalendar = $_POST['googlecalendar'];
$officecalendar = $_POST['officecalendar'];
$zoomlevel = $_POST['zoomlevel'];
$resourceArray = array();

if (isset($_POST['ownalarmsenabled'])) {
    $ownalarmsenabled = $_POST['ownalarmsenabled'];
} else {
    $ownalarmsenabled = "false";
}
if (isset($_POST['testalarmenabled'])) {
    $testalarmenabled = $_POST['testalarmenabled'];
} else {
    $testalarmenabled = "false";
}
if (empty($zoomlevel)) {
    $zoomlevel = "17";
}
if (empty($googlecalendar)) {
    $googlecalendar = "";
}
if (empty($officecalendar)) {
    $officecalendar = "";
}
if (isset($_POST['alarmstirolenabled'])) {
    $alarmstirolenabled = $_POST['alarmstirolenabled'];
} else {
    $alarmstirolenabled = "false";
}
if (isset($_POST['coloredresources'])) {
    $coloredresources = $_POST['coloredresources'];
} else {
    $coloredresources = "false";
}
if (isset($_POST['showUwz'])) {
    $showUwz = $_POST['showUwz'];
} else {
    $showUwz = "false";
}
if (isset($_POST['screensaverenabled'])) {
    $screensaverenabled = $_POST['screensaverenabled'];
} else {
    $screensaverenabled = "false";
}
if (empty($waterurlone)) {
    $waterurlone = "";
}
if (empty($waterlabelone)) {
    $waterlabelone = "";
}
if (empty($waterurltwo)) {
    $waterurltwo = "";
}
if (empty($waterlabeltwo)) {
    $waterlabeltwo = "";
}

if (isset($_POST['carposenabled'])) {
    $carposenabled = $_POST['carposenabled'];
} else {
    $carposenabled = "false";
}
$carposkey = $_POST['carposkey'];

if (isset($_POST['orthoenabled'])) {
    $orthoenabled = $_POST['orthoenabled'];
} else {
    $orthoenabled = "false";
}
$orthokey = $_POST['orthokey'];

if (empty($userLeitstelle)) {
    $userLeitstelle = "";
}
if (empty($passLeitstelle)) {
    $passLeitstelle = "";
}
if (empty($checkAlarmAfter)) {
    $checkAlarmAfter = "";
}
if (empty($refreshRssFeed)) {
    $refreshRssFeed = "";
}
if (empty($maxEvents)) {
    $maxEvents = "";
}
if (empty($resourceStatus)) {
    $resourceStatus = "";
} else {
    $resultlist = explode(",", $resourceStatus);
    for ($i = 0; $i < count($resultlist); $i++) {
        array_push($resourceArray, array("id" => $i, "name" => $resultlist[$i]));
    }
}
if (empty($refreshResourceStatus)) {
    $refreshResourceStatus = "";
}
if (empty($showOEIOpenStreetMap)) {
    $showOEIOpenStreetMap = "";
}
if (empty($firestation)) {
    $firestation = "";
}
if (empty($orthoenabled)) {
    $orthoenabled = "false";
}
if (empty($orthokey)) {
    $orthokey = "";
}

$result = array('userLeitstelle' => $userLeitstelle,
                'passLeitstelle' => $passLeitstelle,
                'checkAlarmAfter' => $checkAlarmAfter,
                'refreshAlarmsTirol' => $refreshAlarmsTirol,
                'maxEvents' => $maxEvents,
                'resourceStatus' => $resourceStatus,
                'refreshResourceStatus' => $refreshResourceStatus,
                'showOEIOpenStreetMap' => $showOEIOpenStreetMap,
                'firestation' => $firestation,
                'orthokey' => $orthokey,
                'orthoenabled' => $orthoenabled,
                'carposkey' => $carposkey,
                'carposenabled' => $carposenabled,
                'waterurlone' => $waterurlone,
                'waterurltwo' => $waterurltwo,
                'waterlabelone' => $waterlabelone,
                'waterlabeltwo' => $waterlabeltwo,
                'showUwz' => $showUwz,
                'coloredresources' => $coloredresources,
                'screensaverenabled' => $screensaverenabled,
                'resources' => $resourceArray,
                'alarmstirolenabled' => $alarmstirolenabled,
                'officecalendar' => $officecalendar,
                'googlecalendar' => $googlecalendar,
                'zoomlevel' => $zoomlevel,
                'testalarmenabled' => $testalarmenabled,
                'ownalarmsenabled' => $ownalarmsenabled
);
$fp = fopen('../configuration.json', 'w');
$hasWritten = fwrite($fp, json_encode($result));
fclose($fp);

if ($hasWritten === false) {
    echo "false";
} else {
    echo "true";
}

?>
