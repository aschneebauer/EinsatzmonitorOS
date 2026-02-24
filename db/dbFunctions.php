<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
//require("../php/ChromePhp.php");
require("./model/WaterLevel.php");
require("./model/Resources.php");
require("./model/Configuration.php");

$ini = parse_ini_file('db.ini');
$prefix = $ini["mysql_prefix"];
if ($ini['mysql_enabled'] == true) {
    require "mysql.php";
    require "functionsMysql.php";
    if (isset($_POST['action']) && !empty($_POST['action'])) {
        $action = $_POST['action'];
        switch ($action) {
            case 'readAllConfiguration':
                selectAllDataFromWhere("configuration", "feature='ENABLED'");
                break;
            case 'readAllResourcen':
                selectAllDataFrom("resources");
                break;
            case 'readAllEnabledResourceIds':
                selectAllEnabledResourceIds();
                break;
            case 'updateConfiguration':
                updateConfiguration();
                break;
            case 'updateResourcen':
                updateResourcen();
                break;
            case 'addWaterLevel':
                addWaterLevel();
                break;
            case 'deleteWaterLevel':
                deleteWaterLevel();
                break;
            case 'readAllWaterLevels':
                selectAllDataFrom("waterlevel");
                break;
            case 'saveLogin':
                saveLogin("configuration");
                break;
            case 'storeResourcesToDB':
                storeResourcesToDB();
                break;
            case 'selectAllWidgets':
                selectAllWidgetsFromWhere("widget", "feature='ENABLED'");
                break;
            case 'enableWidget':
                enableWidget();
                break;
            case 'disableWidget':
                disableWidget();
                break;
            case 'updateWidgetContent':
                updateWidgetContent();
                break;
            case 'readWidgetContent':
                readWidgetContent();
                break;
            case 'storeConfigToDB':
                storeConfigToDB();
                break;
            case 'upgradeToPro':
                upgradeToPro();
                break;
            case 'downgradeToFree':
                downgradeToFree();
                break;
            case 'updateCarPosition':
                updateCarPosition();
                break;
            case 'removeLock':
                removeLock();
                break;
            case 'insertSMSUser':
                insertSMSUser();
                break;
            case 'addGroupSms':
                addGroupSms();
                break;
            case 'deleteSMSUser':
                deleteSMSUser();
                break;
            case 'deleteSMSGroup':
                deleteSMSGroup();
                break;
            case 'insertSMSHistory':
                insertSMSHistory();
                break;
            case 'testSms':
                insertSMSHistory();
                break;
            case 'readSMSHistory':
                readSMSHistory();
                break;
            case 'readAllSMSUsers':
                readSMSUsers();
                break;
            case 'readSMSGroups':
                readSMSGroups();
                break;
        }
    }
} else {
    require "sqlLite.php";
    $db = new DbSqlLite($ini);
    $db->busyTimeout(5000);
    $db->exec('PRAGMA journal_mode = wal;');
    require "functionsSqllite.php";
    if (isset($_POST['action']) && !empty($_POST['action'])) {
        $action = $_POST['action'];

        switch ($action) {
            case 'readAllConfiguration':
                selectAllDataFromWhere("configuration", "feature='ENABLED'", $db);
                break;
            case 'readAllResourcen':
                selectAllDataFrom("resources", $db);
                break;
            case 'readAllEnabledResourceIds':
                selectAllEnabledResourceIds($db);
                break;
            case 'updateConfiguration':
                updateConfiguration($db);
                break;
            case 'updateResourcen':
                updateResourcen($db);
                break;
            case 'addWaterLevel':
                addWaterLevel($db);
                break;
            case 'deleteWaterLevel':
                deleteWaterLevel($db);
                break;
            case 'readAllWaterLevels':
                selectAllDataFrom("waterlevel", $db);
                break;
            case 'saveLogin':
                saveLogin("configuration", $db);
                break;
            case 'storeResourcesToDB':
                storeResourcesToDB($db);
                break;
            case 'selectAllWidgets':
                selectAllWidgetsFromWhere("widget", "feature='ENABLED'", $db);
                break;
            case 'enableWidget':
                enableWidget($db);
                break;
            case 'disableWidget':
                disableWidget($db);
                break;
            case 'updateWidgetContent':
                updateWidgetContent($db);
                break;
            case 'readWidgetContent':
                readWidgetContent($db);
                break;
            case 'storeConfigToDB':
                storeConfigToDB($db);
                break;
            case 'upgradeToPro':
                upgradeToPro($db);
                break;
            case 'downgradeToFree':
                downgradeToFree($db);
                break;
            case 'updateCarPosition':
                updateCarPosition($db);
                break;
            case 'removeLock':
                removeLock($db);
                break;
            case 'insertSMSUser':
                insertSMSUser($db);
                break;
            case 'addGroupSms':
                addGroupSms();
                break;
            case 'deleteSMSUser':
                deleteSMSUser($db);
                break;
            case 'deleteSMSGroup':
                deleteSMSGroup();
                break;
            case 'insertSMSHistory':
                insertSMSHistory($db);
                break;
            case 'testSms':
                insertSMSHistory();
                break;
            case 'readSMSHistory':
                readSMSHistory($db);
                break;
            case 'readAllSMSUsers':
                readSMSUsers($db);
                break;
            case 'readSMSGroups':
                readSMSGroups();
                break;
        }
    }


    $db->close();
}
