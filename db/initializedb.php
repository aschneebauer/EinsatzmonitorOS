<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$ini = parse_ini_file('db.ini');

if ($ini['mysql_enabled'] == true) {
    $prefix = $ini['mysql_prefix'];
    require "mysql.php";
    $db = new DbMysql();

    function table_exists(&$db, $table)
    {
        $result = $db->query("SHOW TABLES LIKE '{$table}'");
        if ($result->num_rows == 1) {
            return TRUE;
        } else {
            return FALSE;
        }
    }

    if (!table_exists($db, $prefix . "configuration")) {
        $db->initializeTableConfiguration();
    }

    if (!table_exists($db, $prefix . "widget")) {
        $db->createTableWidget();
    }

    if (!table_exists($db, $prefix . "waterlevel")) {
        $db->createTableWaterlevel();
    }

    if (!table_exists($db, $prefix . "resources")) {
        $db->createTableResources();
    }
    if (!table_exists($db, $prefix . "category")) {
        $db->createTableCategory();
    }

    if (!table_exists($db, $prefix . "smsusers")) {
        $db->createTableSMSUsers();
    }

    if (!table_exists($db, $prefix . "smshistory")) {
        $db->createTableSMSHistory();
    }

    if (!table_exists($db, $prefix . "smsgroup")) {
        $db->createTableSMSGroup();
    }


    echo "OK";
} else {
    require "sqlLite.php";
    $db = new DbSqlLite($ini);
    if (!$db) {
        echo $db->lastErrorMsg();
    } else {
        //TABLE CONFIGURATION
        $tableCheckConfiguration = $db->query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='configuration'"
        );
        if ($tableCheckConfiguration->fetchArray() === false) {
            $db->initializeTableConfiguration();
        }

        //TABLE WATERLEVEL

        $tableCheckWaterlevel = $db->query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='waterlevel'"
        );
        if ($tableCheckWaterlevel->fetchArray() === false) {
            $db->createTableWaterlevel();
        }

        //TABLE RESOURCES

        $tableCheckResources = $db->query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='resources'"
        );
        if ($tableCheckResources->fetchArray() === false) {
            $db->createTableResources();
        }

        //TABLE WIDGETS

        $tableCheckResources = $db->query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='widget'"
        );
        if ($tableCheckResources->fetchArray() === false) {
            $db->createTableWidget();
        }

        //TABLE CATEGORY
        $tableCheckResources = $db->query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='category'"
        );
        if ($tableCheckResources->fetchArray() === false) {
            $db->createTableCategory();
        }

        //TABLE SMSUSERS
        $tableCheckResources = $db->query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='smsusers'"
        );
        if ($tableCheckResources->fetchArray() === false) {
            $db->createTableSMSUsers();
        }

        //TABLE SMSHISTORY
        $tableCheckResources = $db->query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='smshistory'"
        );
        if ($tableCheckResources->fetchArray() === false) {
            $db->createTableSMSHistory();
        }

        //TABLE SMSGROUP
        $tableCheckResources = $db->query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='smsgroup'"
        );
        if ($tableCheckResources->fetchArray() === false) {
            $db->createTableSMSGroup();
        }

        echo "OK";
    }

    /*
    $results=$db->query('select * from configuration');
    while($row = $results -> fetchArray()){
        $row=(object)$row;
        echo $row->max_events . "," . $row->oei_types ;
    }
    */
    $db->close();
}
