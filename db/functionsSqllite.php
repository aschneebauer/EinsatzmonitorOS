<?php

function selectAllDataFrom($table, $db)
{
    $results = $db->query("select * from $table");
    $out = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $out[] = $row;
    }

    $jso = json_encode($out, JSON_PRETTY_PRINT);
    echo PHP_EOL . $jso;
}

function selectAllEnabledResourceIds($db)
{
    $results = $db->query("select resource_id,pos from resources where enabled=1 order by pos asc");
    $out = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        //ChromePhp::log($row);
        $out[] = $row;
    }
    $jso = json_encode($out, JSON_PRETTY_PRINT);
    echo PHP_EOL . $jso;
}

function selectAllDataFromWhere($table, $decision, $db)
{
    $results = $db->query("select * from $table where $decision");
    $out = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $out[] = $row;
    }

    $jso = json_encode($out, JSON_PRETTY_PRINT);
    echo PHP_EOL . $jso;
}

function selectAllWidgetsFromWhere($table, $decision, $db)
{
    $results = $db->query("select * from $table where $decision");
    $out = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $out[] = $row;
    }

    $jso = json_encode($out, JSON_PRETTY_PRINT);
    echo PHP_EOL . $jso;
}

function enableWidget($db)
{
    $widgetName = $_POST["widgetName"];
    $widgetSlot = $_POST["widgetSlot"];
    $updated = $db->exec("update widget set enabled=1, slot='$widgetSlot', time=strftime('%s','now') where widgetname='$widgetName'");
    if ($updated) {
        $results = $db->query("SELECT * FROM (SELECT * FROM widget ORDER BY time ASC) AS A ORDER BY time DESC LIMIT 1");
        $out = [];
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            $out[] = $row;
        }

        $jso = json_encode($out, JSON_PRETTY_PRINT);
        echo "OK";
    } else {
        echo "NOK";
    }
}

function disableWidget($db)
{
    $widgetName = $_POST["widgetName"];
    $updated = $db->exec("update widget set enabled=0, time=strftime('%s','now') where widgetname='$widgetName'");
    if ($updated) {
        $results = $db->query("SELECT * FROM (SELECT * FROM widget ORDER BY time ASC) AS A ORDER BY time DESC LIMIT 1");
        $out = [];
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            $out[] = $row;
        }

        $jso = json_encode($out, JSON_PRETTY_PRINT);
        echo "OK";
    } else {
        echo "NOK";
    }
}

function updateWidgetContent($db)
{
    $widgetName = $_POST["widgetname"];
    $content = $_POST["emptytextarea"];
    $updated = $db->exec("update widget set content='$content', time=strftime('%s','now') where widgetname='$widgetName'");
    if ($updated) {
        $results = $db->query("SELECT * FROM (SELECT * FROM widget ORDER BY time ASC) AS A ORDER BY time DESC LIMIT 1");
        $out = [];
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            $out[] = $row;
        }

        $jso = json_encode($out, JSON_PRETTY_PRINT);
        echo "OK";
    } else {
        echo "NOK";
    }
}

function readWidgetContent($db)
{
    $widgetName = $_POST["widgetname"];
    $result = $db->query("select content from widget where widgetname='$widgetName'");
    if ($result) {
        $out = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $out[] = $row;
        }

        $jso = json_encode($out, JSON_PRETTY_PRINT);
        echo PHP_EOL . $jso;
    } else {
        echo "NOK";
    }
}


function updateConfiguration($db)
{
    $config_value = $_POST["config_value"];
    $config_id = $_POST["config_uuid"];
    $updated = $db->exec("update configuration set config_value='$config_value', time=strftime('%s','now') where id=$config_id");
    if ($updated) {
        $results = $db->query("SELECT * FROM (SELECT * FROM configuration ORDER BY time ASC) AS A ORDER BY time DESC LIMIT 1");
        $out = [];
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            $out[] = $row;
        }

        $jso = json_encode($out, JSON_PRETTY_PRINT);
        echo PHP_EOL . $jso;
    } else {
        echo "something went wrong";
    }
}

function updateResourcen($db)
{
    $resource_value = $_POST["resource_value"];
    $resource_uuid = $_POST["resource_uuid"];
    $updated = $db->exec("update resources set enabled='$resource_value', time=strftime('%s','now') where resource_id=$resource_uuid");
    if ($updated) {
        $results = $db->query("SELECT * FROM (SELECT * FROM resources ORDER BY time ASC) AS A ORDER BY time DESC LIMIT 1");
        $out = [];
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            $out[] = $row;
        }

        $jso = json_encode($out, JSON_PRETTY_PRINT);
        echo PHP_EOL . $jso;
    } else {
        echo "something went wrong";
    }
}

function saveLogin($table, $db)
{
    $user = $_POST["user_leitstelle"];
    $pass = $_POST["pass_leitstelle"];
    $firestation = $_POST["firestation"];

    $db->exec("update $table set config_value='$user' where config_key='user_leitstelle'");
    $db->exec("update $table set config_value='$pass' where config_key='pass_leitstelle'");
    $db->exec("update $table set config_value='$firestation' where config_key='firestation'");
    echo "true";
}


function storeResourcesToDB($db)
{
    $count = $db->querySingle("SELECT COUNT(*) as count from resources");
    if ($count < 1) {
        $resourceString = $_POST['resourceList'];
        $resourceArray = json_decode($resourceString, true);
        $sort = 1;
        foreach ($resourceArray as $value) {
            $resource_id = $value['ID'];
            $call_sign = $value['CALL_SIGN'];
            $resource_type = $value['TYPE'];
            $sql = "INSERT INTO resources (pos, resource_id, call_sign, resource_type, enabled, time) VALUES ($sort,$resource_id, '$call_sign', '$resource_type', 0, strftime('%s','now'))";
            $db->exec($sql);
            $sort = $sort + 1;
        }
    }
}

function storeConfigToDB($db)
{
    $count = $db->querySingle("SELECT COUNT(*) as count from configuration where config_key='auth_token'");
    if ($count < 1) {
        $configlist = $_POST['configlist'];

        foreach ($configlist as $item) {
            $configkey = $item['configkey'];
            $configvalue = $item['configvalue'];
            $db->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('$configkey','$configvalue','STANDARD', 'Authentication', 'ENABLED','','',  strftime('%s','now')) ");
        }
        echo "OK";
    } else {
        echo "ALREADY_SET";
    }
}

function upgradeToPro($db)
{
    $db->exec("update configuration set feature='ENABLED' where config_key='max_ownalarms'");
    $db->exec("update configuration set feature='ENABLED' where config_key='oei_types'");

    $db->exec("update configuration set feature='ENABLED' where config_key='colored_res_enabled'");
    $db->exec("update configuration set feature='ENABLED' where config_key='screensaver_enabled'");
    $db->exec("update configuration set feature='ENABLED' where config_key='calender_enabled'");
    $db->exec("update configuration set feature='ENABLED' where config_key='ownalarms_enabled'");
    $db->exec("update configuration set config_value='PAID' where config_key='kind'");

    $db->exec("update configuration set feature='ENABLED' where config_key='zoom_level-map'");
    $db->exec("update configuration set feature='ENABLED' where config_key='zoom_level-map-small'");

    $db->exec("update widget set feature='ENABLED' where widgetname='EMPTY-THREE'");
    $db->exec("update widget set feature='ENABLED' where widgetname='GOOGLE'");
    $db->exec("update widget set feature='ENABLED' where widgetname='OWN-ALARMS'");
    $db->exec("update widget set feature='ENABLED' where widgetname='WEATHER'");

    echo "OK";
}

function downgradeToFree($db)
{
    $db->exec("update configuration set feature='DISABLED' where config_key='max_ownalarms'");
    $db->exec("update configuration set feature='DISABLED' where config_key='oei_types'");

    $db->exec("update configuration set feature='DISABLED' where config_key='colored_res_enabled'");
    $db->exec("update configuration set feature='DISABLED' where config_key='screensaver_enabled'");
    $db->exec("update configuration set feature='DISABLED' where config_key='calender_enabled'");
    $db->exec("update configuration set feature='DISABLED' where config_key='ownalarms_enabled'");
    $db->exec("update configuration set config_value='FREE' where config_key='kind'");

    $db->exec("update configuration set feature='DISABLED' where config_key='zoom_level-map'");
    $db->exec("update configuration set feature='DISABLED' where config_key='zoom_level-map-small'");

    $db->exec("update widget set feature='DISABLED' where widgetname='EMPTY-THREE'");
    $db->exec("update widget set feature='DISABLED' where widgetname='GOOGLE'");
    $db->exec("update widget set feature='DISABLED' where widgetname='OWN-ALARMS'");
    $db->exec("update widget set feature='DISABLED' where widgetname='WEATHER'");

    echo "OK";
}

function updateCarPosition($db)
{
    $cars = $_POST['cars'];
    foreach ($cars as $item) {
        $position = $item['position'];
        $id = $item['id'];
        $db->exec("update resources set pos=$position where resource_id=$id");
    }
    echo "OK";
}

function removeLock($db)
{
    $db->exec("update configuration set config_value='' where config_key='lock_configuration'");
    echo "OK";
}



function addWaterLevel($db)
{
    $pegel_station = $_POST['pegel_station'];
    $api_url = $_POST['api_url'];
    $hw1 = $_POST['hw1'];
    $hw5 = $_POST['hw5'];
    $hw30 = $_POST['hw30'];
    $hw100 = $_POST['hw100'];
    $add = $db->exec("INSERT INTO waterlevel (api_url, pegel_station, hw1, hw5, hw30,hw100, time) VALUES ('$api_url', '$pegel_station', '$hw1', '$hw5', '$hw30','$hw100', strftime('%s','now'))");
    if ($add) {
        $results = $db->query("SELECT * FROM (SELECT * FROM waterlevel ORDER BY time ASC) AS A ORDER BY time DESC LIMIT 1");
        $out = [];
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            $out[] = $row;
        }

        $jso = json_encode($out, JSON_PRETTY_PRINT);
        echo PHP_EOL . $jso;
    } else {
        echo "something went wrong";
    }
}

function deleteWaterLevel($db)
{
    $uuid = $_POST['uuid'];
    $db->exec("delete from waterlevel where id=$uuid");
    echo "OK";
}

function readSMSUsers($db)
{
    $group =  $_POST['alarm_group'];
    $sql = "select * from smsusers where phone_group='$group' and kzloe ='0'";
    $results = $db->query($sql);
    $out = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $out[] = $row;
    }
    $jso = json_encode($out, JSON_PRETTY_PRINT);
    echo PHP_EOL . $jso;
}

function readSMSGroups($db)
{
    $sql = "select * from smsgroup where kzloe ='0'";
    $results = $db->query($sql);
    $out = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $out[] = $row;
    }
    $jso = json_encode($out, JSON_PRETTY_PRINT);
    echo PHP_EOL . $jso;
}

function insertSMSUser($db)
{
    $name = $_POST['name'];
    $group =  $_POST['alarm_group'];
    $phone =  $_POST['phone'];

    $sql = "select * from smsusers where phone_group='$group' and kzloe ='0'";
    $results = $db->query($sql);
    $out = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $out[] = $row;
    }

    $count = count($out);
    if ($count > 0) {
        echo "NOK_NUMBER_EXISTS";
    } else {
        $sql = "INSERT INTO smsusers (name, phone_group, phone,kzloe, time) VALUES ('$name','$group', '$phone', '0', strftime('%s','now'))";
        $db->query($sql);

        $sql = "select * from smsusers where phone_group='$group' and kzloe ='0'";

        $results = $db->query($sql);
        $outusers = [];
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            $outusers[] = $row;
        }
        $jsousers = json_encode($outusers, JSON_PRETTY_PRINT);
        echo PHP_EOL . $jsousers;
    }
}

function addGroupSms($db)
{
    $group =  $_POST['smsgruppe'];

    $sql = "select * from smsgroup where smsgruppe='$group' and kzloe ='0'";
    $results = $db->query($sql);
    $out = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $out[] = $row;
    }

    $count = count($out);
    if ($count > 0) {
        echo "NOK_GROUP_EXISTS";
    } else {
        $sql = "INSERT INTO smsgroup (smsgruppe, kzloe) VALUES ('$group', '0')";
        $db->query($sql);
        echo "OK";
    }
}

function deleteSMSUser($db)
{
    $uuid = $_POST['userId'];
    $group = $_POST['groupId'];

    $sql = "update smsusers set kzloe='1' where id=$uuid";
    //ChromePhp::log($sql);
    $db->query($sql);

    $sqlusers = "select * from smsusers where phone_group='$group' and kzloe ='0'";
    $results = $db->query($sqlusers);
    $out = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $out[] = $row;
    }
    $jsousers = json_encode($out, JSON_PRETTY_PRINT);
    echo PHP_EOL . $jsousers;
}

function deleteSMSGroup($db)
{
    $uuid = $_POST['groupId'];
    $sql = "update smsgroup set kzloe='1' where id=$uuid";
    //ChromePhp::log($sql);
    $db->query($sql);
    echo "OK";
}

function insertSMSHistory($db)
{
    $sms_id = $_POST['sms_id'];
    $recipients =  $_POST['recipients'];
    $total_costs =  $_POST['total_costs'];

    $db->query("INSERT INTO smshistory (sms_id, recipients, total_costs, time) VALUES ($sms_id,$recipients, '$total_costs', strftime('%s','now'))");
    echo "OK";
}

function readSMSHistory($db)
{
    $event = $_POST['eventnum'];
    $sql = "select * from smshistory where event='$event'";
    $results = $db->query($sql);
    $out = [];
    while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
        $out[] = $row;
    }

    $count = count($out);
    if ($count < 1) {
        echo "SENDSMS";
    } else {
        echo "SMS_ALREADY_SEND";
    }
}
