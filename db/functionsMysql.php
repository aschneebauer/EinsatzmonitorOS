<?php

function selectAllDataFromWhere($table, $decision)
{
    $db = new DbMysql();
    global  $prefix;
    $sql = "select * from $prefix" . "$table where $decision";
    $result = $db->select($sql);
    echo json_encode($result);
}

function selectAllDataFrom($table)
{
    $db = new DbMysql();
    global  $prefix;
    $sql = "select * from $prefix" . "$table";
    $result = $db->select($sql);
    echo json_encode($result);
}

function selectAllWidgetsFromWhere($table, $decision)
{
    $db = new DbMysql();
    global  $prefix;
    $sql = "select * from $prefix" . "$table where $decision";
    $result = $db->select($sql);
    echo json_encode($result);
}

function selectAllEnabledResourceIds()
{
    $db = new DbMysql();
    global  $prefix;
    $sql = "select resource_id,pos from $prefix" . "resources where enabled=1 order by pos asc";
    $result = $db->select($sql);
    //ChromePhp::log($result);
    echo json_encode($result);
}

function saveLogin($table)
{
    $db = new DbMysql();
    global  $prefix;
    $user = $_POST["user_leitstelle"];
    $pass = $_POST["pass_leitstelle"];
    $firestation = $_POST["firestation"];

    $db->query("update $prefix" . "$table set config_value='$user' where config_key='user_leitstelle'");
    $db->query("update $prefix" . "$table set config_value='$pass' where config_key='pass_leitstelle'");
    $db->query("update $prefix" . "$table set config_value='$firestation' where config_key='firestation'");
    echo "true";
}

function storeConfigToDB()
{
    $db = new DbMysql();
    global  $prefix;
    $count = $db->select("SELECT COUNT(*) as count from $prefix" . "configuration where config_key='auth_token'");
    if ($count[0]['count'] < 1) {
        $configlist = $_POST['configlist'];
        $date = new DateTime();
        $timeStamp = $date->getTimestamp();
        foreach ($configlist as $item) {
            $configkey = $item['configkey'];
            $configvalue = $item['configvalue'];
            $db->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('$configkey','$configvalue','STANDARD', 'Authentication', 'ENABLED','','',  $timeStamp) ");
        }
        echo "OK";
    } else {
        echo "ALREADY_SET";
    }
}

function storeResourcesToDB()
{
    #ChromePhp::log("bin im storeResourcestodb");
    $db = new DbMysql();
    global  $prefix;
    $count = $db->select("SELECT COUNT(*) as count from $prefix" . "resources");
    if ($count[0]["count"] < 1) {
        $resourceString = $_POST['resourceList'];
        $resourceArray = json_decode($resourceString, true);
        $sort = 1;
        $date = new DateTime();
        $timeStamp = $date->getTimestamp();
        foreach ($resourceArray as &$value) {
            $resource_id = $value['ID'];
            $call_sign = $value['CALL_SIGN'];
            $resource_type = $value['TYPE'];
            $db->query("INSERT INTO $prefix" . "resources (pos, resource_id, call_sign, resource_type, enabled, time) VALUES ($sort,$resource_id, '$call_sign', '$resource_type', 0, $timeStamp)");
            $sort = $sort + 1;
        }
    }else{
        #check new entries and resource id
        $resourceString = $_POST['resourceList'];
        $resourceArray = json_decode($resourceString, true);
        $date = new DateTime();
        $timeStamp = $date->getTimestamp();
        
        foreach ($resourceArray as &$value) {
            $resource_id = $value['ID'];
            
            $call_sign = $value['CALL_SIGN'];
            
            $resource_type = $value['TYPE'];
           #ChromePhp::log("Die ID: Bin da " );
            $entry = $db->select("SELECT call_sign, resource_id from $prefix" . "resources where call_sign='$call_sign'");
            if(count($entry) == 1){
                
                $entry_call_sign= $entry[0]["call_sign"];
                $entry_resource_id=$entry[0]["resource_id"];

                if($entry_resource_id != $resource_id){
                    $sql ="update $prefix" . "resources set resource_id=$resource_id where call_sign='$call_sign'";
                    $updated = $db->query($sql);
                }
                #ChromePhp::log("Die ID: $entry_resource_id" );
            }else{
                #Add new Resources
                $add = $db->query("INSERT INTO $prefix" . "resources (pos, resource_id, call_sign, resource_type, enabled,time) VALUES (999, $resource_id, '$call_sign', '$resource_type',0, $timeStamp)");
            }

            
        }

        #ChromePhp::log("bin im else zweig");
        $storedResources = $db->select("SELECT * from $prefix" . "resources");
        foreach ($storedResources as &$value) {
            
        }
    }
}

function updateConfiguration()
{
    $db = new DbMysql();
    global  $prefix;
    $config_value = $_POST["config_value"];
    $config_id = $_POST["config_uuid"];

    $date = new DateTime();
    $timeStamp = $date->getTimestamp();

    $updated = $db->query("update $prefix" . "configuration set config_value='$config_value', time=$timeStamp where id=$config_id");
    if ($updated) {
        $sql = "SELECT * FROM (SELECT * FROM $prefix" . "configuration ORDER BY time ASC) AS A ORDER BY time DESC LIMIT 1";
        $result = $db->select($sql);
        echo json_encode($result);
    } else {
        echo "something went wrong";
    }
}

function updateResourcen()
{
    $db = new DbMysql();
    global  $prefix;
    $resource_value = $_POST["resource_value"];
    $resource_uuid = $_POST["resource_uuid"];

    $date = new DateTime();
    $timeStamp = $date->getTimestamp();

    $updated = $db->query("update $prefix" . "resources set enabled='$resource_value', time=$timeStamp where resource_id=$resource_uuid");
    if ($updated) {
        $sql = "SELECT * FROM (SELECT * FROM $prefix" . "resources ORDER BY time ASC) AS A ORDER BY time DESC LIMIT 1";
        $result = $db->select($sql);
        echo json_encode($result);
    } else {
        echo "something went wrong";
    }
}

function upgradeToPro()
{
    $db = new DbMysql();
    global  $prefix;
    $db->query("update $prefix" . "configuration set feature='ENABLED' where config_key='max_ownalarms'");
    $db->query("update $prefix" . "configuration set feature='ENABLED' where config_key='oei_types'");
    $db->query("update $prefix" . "configuration set feature='ENABLED' where config_key='ortho-map_enabled'");
    $db->query("update $prefix" . "configuration set feature='ENABLED' where config_key='ortho-map-small_enabled'");

    $db->query("update $prefix" . "configuration set feature='ENABLED' where config_key='colored_res_enabled'");
    $db->query("update $prefix" . "configuration set feature='ENABLED' where config_key='screensaver_enabled'");
    $db->query("update $prefix" . "configuration set feature='ENABLED' where config_key='calender_enabled'");
    $db->query("update $prefix" . "configuration set feature='ENABLED' where config_key='ownalarms_enabled'");
    $db->query("update $prefix" . "configuration set config_value='PAID' where config_key='kind'");

    $db->query("update $prefix" . "configuration set feature='ENABLED' where config_key='zoom_level-map'");
    $db->query("update $prefix" . "configuration set feature='ENABLED' where config_key='zoom_level-map-small'");

    $db->query("update $prefix" . "widget set feature='ENABLED' where widgetname='EMPTY-THREE'");
    $db->query("update $prefix" . "widget set feature='ENABLED' where widgetname='GOOGLE'");
    $db->query("update $prefix" . "widget set feature='ENABLED' where widgetname='OWN-ALARMS'");
    $db->query("update $prefix" . "widget set feature='ENABLED' where widgetname='WEATHER'");

    echo "OK";
}

function downgradeToFree()
{
    $db = new DbMysql();
    global  $prefix;
    $db->query("update $prefix" . "configuration set feature='DISABLED' where config_key='max_ownalarms'");
    $db->query("update $prefix" . "configuration set feature='DISABLED' where config_key='oei_types'");
    $db->query("update $prefix" . "configuration set feature='DISABLED' where config_key='ortho-map_enabled'");
    $db->query("update $prefix" . "configuration set feature='DISABLED' where config_key='ortho-map-small_enabled'");

    $db->query("update $prefix" . "configuration set feature='DISABLED' where config_key='colored_res_enabled'");
    $db->query("update $prefix" . "configuration set feature='DISABLED' where config_key='screensaver_enabled'");
    $db->query("update $prefix" . "configuration set feature='DISABLED' where config_key='calender_enabled'");
    $db->query("update $prefix" . "configuration set feature='DISABLED' where config_key='ownalarms_enabled'");
    $db->query("update $prefix" . "configuration set config_value='FREE' where config_key='kind'");

    $db->query("update $prefix" . "configuration set feature='DISABLED' where config_key='zoom_level-map'");
    $db->query("update $prefix" . "configuration set feature='DISABLED' where config_key='zoom_level-map-small'");

    $db->query("update $prefix" . "widget set feature='DISABLED' where widgetname='EMPTY-THREE'");
    $db->query("update $prefix" . "widget set feature='DISABLED' where widgetname='GOOGLE'");
    $db->query("update $prefix" . "widget set feature='DISABLED' where widgetname='OWN-ALARMS'");
    $db->query("update $prefix" . "widget set feature='DISABLED' where widgetname='WEATHER'");
    echo "OK";
}

function updateCarPosition()
{
    $db = new DbMysql();
    global  $prefix;
    $cars = $_POST['cars'];
    foreach ($cars as $item) {
        $position = $item['position'];
        $id = $item['id'];
        $db->query("update $prefix" . "resources set pos=$position where resource_id=$id");
    }
    echo "OK";
}

function removeLock()
{
    $db = new DbMysql();
    global  $prefix;
    $db->query("update $prefix" . "configuration set config_value='' where config_key='lock_configuration'");
    echo "OK";
}

function enableWidget()
{
    $db = new DbMysql();
    global  $prefix;
    $widgetName = $_POST["widgetName"];
    $widgetSlot = $_POST["widgetSlot"];

    $date = new DateTime();
    $timeStamp = $date->getTimestamp();

    $updated = $db->query("update $prefix" . "widget set enabled=1, slot='$widgetSlot', time=$timeStamp where widgetname='$widgetName'");
    if ($updated) {
        $sql = "SELECT * FROM (SELECT * FROM $prefix" . "widget ORDER BY time ASC) AS A ORDER BY time DESC LIMIT 1";
        $result = $db->select($sql);
        json_encode($result);
        echo "OK";
    } else {
        echo "NOK";
    }
}

function disableWidget()
{
    $db = new DbMysql();
    global  $prefix;
    $widgetName = $_POST["widgetName"];

    $date = new DateTime();
    $timeStamp = $date->getTimestamp();

    $updated = $db->query("update $prefix" . "widget set enabled=0, time=$timeStamp where widgetname='$widgetName'");
    if ($updated) {
        $sql = "SELECT * FROM (SELECT * FROM $prefix" . "widget ORDER BY time ASC) AS A ORDER BY time DESC LIMIT 1";
        $result = $db->select($sql);
        json_encode($result);
        echo "OK";
    } else {
        echo "NOK";
    }
}

function updateWidgetContent()
{
    $db = new DbMysql();
    global  $prefix;
    $widgetName = $_POST["widgetname"];
    $content = $_POST["emptytextarea"];

    $date = new DateTime();
    $timeStamp = $date->getTimestamp();

    $updated = $db->query("update $prefix" . "widget set content='$content', time=$timeStamp where widgetname='$widgetName'");
    if ($updated) {
        $sql = "SELECT * FROM (SELECT * FROM $prefix" . "widget ORDER BY time ASC) AS A ORDER BY time DESC LIMIT 1";
        $result = $db->select($sql);
        echo json_encode($result);
    } else {
        echo "NOK";
    }
}

function readWidgetContent()
{
    $db = new DbMysql();
    global  $prefix;
    $widgetName = $_POST["widgetname"];
    $result = $db->select("select content from $prefix" . "widget where widgetname='$widgetName'");
    echo json_encode($result);
}

function addWaterLevel()
{
    $db = new DbMysql();
    global  $prefix;
    $pegel_station = $_POST['pegel_station'];
    $api_url = $_POST['api_url'];
    $hw1 = $_POST['hw1'];
    $hw5 = $_POST['hw5'];
    $hw30 = $_POST['hw30'];
    $hw100 = $_POST['hw100'];

    $date = new DateTime();
    $timeStamp = $date->getTimestamp();

    $add = $db->query("INSERT INTO $prefix" . "waterlevel (api_url, pegel_station, hw1, hw5, hw30,hw100, time) VALUES ('$api_url', '$pegel_station', '$hw1', '$hw5', '$hw30','$hw100', $timeStamp)");
    if ($add) {
        $sql = "SELECT * FROM (SELECT * FROM $prefix" . "waterlevel ORDER BY time ASC) AS A ORDER BY time DESC LIMIT 1";
        $result = $db->select($sql);
        echo json_encode($result);
    } else {
        echo "something went wrong";
    }
}

function deleteWaterLevel()
{
    $db = new DbMysql();
    global  $prefix;
    $uuid = $_POST['uuid'];
    $db->query("delete from $prefix" . "waterlevel where id=$uuid");
    echo "OK";
}

function readSMSUsers()
{
    $group =  $_POST['alarm_group'];
    $db = new DbMysql();
    global  $prefix;

    $sql = "SELECT * FROM $prefix" . "smsusers where phone_group='$group' and kzloe='0'";
    $result = $db->select($sql);
    $count = count($result);
    if ($count < 1) {
        echo "NOK";
    } else {
        echo json_encode($result);
    }
}

function readSMSGroups()
{
    $db = new DbMysql();
    global  $prefix;

    $sql = "SELECT * FROM $prefix" . "smsgroup where kzloe='0'";
    $result = $db->select($sql);
    $count = count($result);
    if ($count < 1) {
        echo "NOK";
    } else {
        echo json_encode($result);
    }
}

function insertSMSUser()
{
    $name = $_POST['name'];
    $group =  $_POST['alarm_group'];
    $phone =  $_POST['phone'];
    $date = new DateTime();
    $timeStamp = $date->getTimestamp();

    $db = new DbMysql();
    global  $prefix;
    $sql = "SELECT * FROM $prefix" . "smsusers where phone_group='$group' and kzloe='0' and phone='$phone'";
    //ChromePhp::log($sql);
    $result = $db->select($sql);
    $count = count($result);
    if ($count > 0) {
        echo "NOK_NUMBER_EXISTS";
    } else {
        $sql = "INSERT INTO $prefix" . "smsusers (name, phone_group, phone, kzloe, time) VALUES ('$name','$group', '$phone','0', '$timeStamp')";
        $db->query($sql);

        $sql = "SELECT * FROM $prefix" . "smsusers where phone_group='$group' and kzloe='0'";
        $result = $db->select($sql);
        echo json_encode($result);
    }


    //ChromePhp::log($sql);

}

function addGroupSms()
{
    $group =  $_POST['smsgruppe'];

    $db = new DbMysql();
    global  $prefix;
    $sql = "SELECT * FROM $prefix" . "smsgroup where smsgruppe='$group' and kzloe='0'";
    //ChromePhp::log($sql);
    $result = $db->select($sql);
    $count = count($result);
    if ($count > 0) {
        echo "NOK_GROUP_EXISTS";
    } else {
        $sql = "INSERT INTO $prefix" . "smsgroup (smsgruppe, kzloe) VALUES ('$group','0')";
        $db->query($sql);
        echo "OK";
    }


    //ChromePhp::log($sql);

}

function deleteSMSUser()
{
    $uuid = $_POST['userId'];
    $group = $_POST['groupId'];
    $db = new DbMysql();
    global  $prefix;
    $sql = "update $prefix" . "smsusers set kzloe='1' where id=$uuid";
    $db->query($sql);

    $sql = "SELECT * FROM $prefix" . "smsusers where phone_group='$group' and kzloe='0'";
    $result = $db->select($sql);

    echo json_encode($result);
}

function deleteSMSGroup()
{
    $uuid = $_POST['groupId'];
    $db = new DbMysql();
    global  $prefix;
    $sql = "update $prefix" . "smsgroup set kzloe='1' where id=$uuid";
    $db->query($sql);
    echo "OK";
}

function insertSMSHistory()
{
    $sms_id = $_POST['sms_id'];
    $recipients =  $_POST['recipients'];
    $total_costs =  $_POST['total_costs'];
    $date = new DateTime();
    $timeStamp = $date->getTimestamp();

    $db = new DbMysql();
    global  $prefix;

    $db->query("INSERT INTO $prefix" . "smshistory (sms_id, recipients, total_costs, time) VALUES ($sms_id,$recipients, '$total_costs', '$timeStamp')");
    echo "OK";
}

function readSMSHistory()
{
    $db = new DbMysql();

    global  $prefix;
    $event = $_POST['eventnum'];
    $sql = "select * from $prefix" . "smshistory where event='$event'";
    $result = $db->select($sql);
    $count = count($result);

    if ($count < 1) {
        echo "SENDSMS";
    } else {
        echo "SMS_ALREADY_SEND";
    }
}
