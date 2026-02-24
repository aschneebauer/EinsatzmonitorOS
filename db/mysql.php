<?php

#include '../php/ChromePhp.php';

class DbMysql
{
    protected static $connection;
    protected static $prefix;

    protected static $feature;

    public function connect()
    {
        if (!isset(self::$connection)) {
            $config = parse_ini_file('db.ini');
            self::$prefix = $config['mysql_prefix'];
            self::$feature = $config['feature'];
            self::$connection = new mysqli($config['mysql_host'], $config['mysql_username'], $config['mysql_password'], $config['mysql_dbname']);
            self::$connection->set_charset("utf8");
        }
        if (self::$connection === false) {
            return false;
        }

        return self::$connection;
    }

    public function query($query)
    {
        $connection = DbMysql::connect();
        $result = $connection->query($query);
        if (!$result) {
            error_log($connection->error);
        }
        return $result;
    }

    public function delete($query)
    {
        $connection = DbMysql::connect();
        $result = mysqli_query($connection, $query);
        if (!$result) {
            error_log($connection->error);
        }
        return $result;
    }


    public function select($query)
    {
        $rows = array();
        $result = $this->query($query);
        if ($result === false) {
            return false;
        }
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function error()
    {
        $connection = $this->connect();
        return $connection->error;
    }

    public function quote($value)
    {
        $connection = $this->connect();
        return "'" . $connection->real_escape_string($value) . "'";
    }

    public function escape($string)
    {
        $connection = $this->connect();
        return mysqli_real_escape_string($connection, $string);
    }
    public function row_count($result)
    {
        return mysqli_num_rows($result);
    }

    public function initializeTableConfiguration()
    {
        $prefix = self::$prefix;
        $sql = "CREATE TABLE $prefix" . "configuration(
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                config_key VARCHAR(50),
                config_value VARCHAR(250),
                config_group VARCHAR(150),
                input_placeholder VARCHAR (100),
                feature VARCHAR(100),
                widgetname  VARCHAR(100),
                slot VARCHAR(100),
                time INT)";


        $this->query($sql);
        $date = new DateTime();
        $timeStamp = $date->getTimestamp();

        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('firestation','','GENERAL', 'Feuerwehr', 'ENABLED','','',  $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('user_leitstelle','','GENERAL', 'Benutzername Leitstelle', 'ENABLED','','', $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('pass_leitstelle','','GENERAL', 'Passwort Leitstelle', 'ENABLED','','', $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('lock_configuration','','GENERAL', 'Konfiguration sperren', 'ENABLED','','', $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('max_alarmstirol','9','STANDARD','Max. Anzahl Aktuelle Einsätze', 'ENABLED','ALARMS-TIROL','', $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('alarmstirol_aslist_enabled','0','STANDARD','Listenansicht aktivieren', 'ENABLED','ALARMS-TIROL','', $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeightAlarms_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','ALARMS-TIROL','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('max_twitterfeeds','2','STANDARD','Max. Anzahl Twitter Feeds', 'ENABLED','TWITTER','', $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeightTwitter_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','TWITTER','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('max_ownalarms','9','STANDARD','Max. Anzahl eigener Einsätze', 'DISABLED','OWN-ALARMS','', $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeightOwn_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','OWN-ALARMS','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('oei_types','ANLST,BATUP,BEPWA,BMZ,BRAND,BSTR,CHEM,DFBRE,DFHOE,DSTP,EBAHN,EXPL,FWZUF,GGAS,GWLIM,HUBL,LOTSP,NOTST,OBFA,OELSP,RADIO,RETST,SAUG,SPERR,SSTB,STAND,STGL,STGLN,STPPU,STROM,STTUP,TRBMZ,TRES,UEHD,UEHDR,UFHD,UFHDR,WAEST,WASS','ALARM','Anzeige OEI Typen', 'DISABLED','','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('ortho-map_enabled','1','ALARM','Satellitenansicht aktivieren', 'ENABLED','MAP','', $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('ortho-map-small_enabled','1','ALARM','Satellitenansicht aktivieren', 'ENABLED','EVENTINFO','', $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('carpos_enabled','1','ALARM','Standort Fahrzeuge anzeigen', 'ENABLED','','', $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('uwz_enabled','1','STANDARD','UWZ aktivieren', 'ENABLED','UWZ','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeightUwz_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','UWZ','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('colored_res_enabled','1','STANDARD','Fahrzeugstatus farblich anzeigen', 'DISABLED','RESOURCEN','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('resources_aslist_enabled','0','STANDARD','Fahrzeuge als Liste anzeigen', 'ENABLED','RESOURCEN','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeight_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','RESOURCEN','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('screensaver_enabled','0','GENERAL','Bildschirmschoner aktivieren', 'DISABLED','','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('debug_enabled','0','GENERAL','Logging Console einschalten', 'ENABLED','','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('calender_enabled','0','STANDARD','Outlook Kalender aktivieren', 'DISABLED','CALENDAR','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('zoom_level-map','17','ALARM','Karte Zoomstufe (4-19)', 'DISABLED','MAP','', $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('zoom_level-map-small','17','ALARM','Karte Zoomstufe (4-19)', 'DISABLED','EVENTINFO','', $timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('testalarm_enabled','0','GENERAL','Alarmansicht aktivieren', 'ENABLED','','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('testalarmjson_enabled','0','GENERAL','Test mit JSON file (Ordner testdata/fakealarm)', 'ENABLED','','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('widgetresize_enabled','0','GENERAL','Widget Höhe anpassen(pro Zeile)', 'ENABLED','','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('ownalarms_enabled','0','STANDARD','Eigene Einsätze anzeigen', 'DISABLED','','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('google_calender_height','450','STANDARD','Kalender Höhe', 'ENABLED','GOOGLE','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('google_calender_id','','STANDARD','Kalender ID', 'ENABLED','GOOGLE','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('google_calender_mode','AGENDA','STANDARD','Ansicht: AGENDA, WEEK, MONTH', 'ENABLED','GOOGLE','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeightGoogle_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','GOOGLE','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('zipcode','6020','STANDARD','Wetterdaten für Postleitzahl', 'ENABLED','WEATHER','',$timeStamp) ");
        $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeightWeather_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','WEATHER','',$timeStamp) ");
        if (self::$feature == "SMS") {
            $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('sms_enabled','0','GENERAL','SMS Versand aktivieren (SMS Api Token notwendig) - https://gatewayapi.com/', 'ENABLED','','',$timeStamp) ");
            $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('sms_apitoken','','GENERAL','SMS Api Token', 'ENABLED','','',$timeStamp) ");
        } else {
            $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('sms_enabled','0','GENERAL','SMS Versand aktivieren (SMS Api Token notwendig) - https://gatewayapi.com/', 'DISABLED','','',$timeStamp) ");
            $this->query("insert into $prefix" . "configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('sms_apitoken','','GENERAL','SMS Api Token', 'DISABLED','','',$timeStamp) ");
        }
    }

    function createTableWidget()
    {
        $prefix = self::$prefix;
        $sql = "CREATE TABLE $prefix" . "widget(
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                widgetname VARCHAR(150),
                slot VARCHAR(150),
                enabled INT,
                feature VARCHAR (100),
                content TEXT,
                time INT)";


        $this->query($sql);
        $date = new DateTime();
        $timeStamp = $date->getTimestamp();

        $this->query("insert into $prefix" . "widget (widgetname, slot, enabled, feature, content, time) VALUES ('TWITTER','CONTENT-4_CENTER',1, 'ENABLED', '', $timeStamp) ");
        $this->query("insert into $prefix" . "widget (widgetname, slot, enabled, feature, content, time) VALUES ('UWZ','CONTENT-4_LEFT',1, 'ENABLED', '', $timeStamp) ");
        $this->query("insert into $prefix" . "widget (widgetname, slot, enabled, feature, content, time) VALUES ('ALARMS-TIROL','CONTENT-4_RIGHT',1, 'ENABLED', '', $timeStamp) ");
        $this->query("insert into $prefix" . "widget (widgetname, slot, enabled, feature, content, time) VALUES ('WATERLEVEL','FULL',0, 'ENABLED', '', $timeStamp) ");
        $this->query("insert into $prefix" . "widget (widgetname, slot, enabled, feature, content, time) VALUES ('RESOURCEN','CONTENT-4_RIGHT',0, 'ENABLED', '', $timeStamp) ");
        $this->query("insert into $prefix" . "widget (widgetname, slot, enabled, feature, content, time) VALUES ('EMPTY-ONE','CONTENT-4_RIGHT',0, 'ENABLED', '201459-at', $timeStamp) ");
        $this->query("insert into $prefix" . "widget (widgetname, slot, enabled, feature, content, time) VALUES ('EMPTY-TWO','CONTENT-4_RIGHT',0, 'ENABLED', '201459-at', $timeStamp) ");
        $this->query("insert into $prefix" . "widget (widgetname, slot, enabled, feature, content, time) VALUES ('EMPTY-THREE','CONTENT-4_RIGHT',0, 'DISABLED', 'Leeres Widget', $timeStamp) ");
        $this->query("insert into $prefix" . "widget (widgetname, slot, enabled, feature, content, time) VALUES ('GOOGLE','CONTENT-4_RIGHT',0, 'DISABLED', 'Google Kalender Widget', $timeStamp) ");
        $this->query("insert into $prefix" . "widget (widgetname, slot, enabled, feature, content, time) VALUES ('OWN-ALARMS','CONTENT-4_RIGHT',0, 'DISABLED', 'Eigene Alarmierungen', $timeStamp) ");
        $this->query("insert into $prefix" . "widget (widgetname, slot, enabled, feature, content, time) VALUES ('WEATHER','CONTENT-4_CENTER',0, 'DISABLED', 'Anzeige Wetter', $timeStamp) ");
    }

    function createTableCategory()
    {
        $prefix = self::$prefix;
        $sql = "CREATE TABLE $prefix" . "category(
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(150),
                used INT,
                time INT)";


        $this->query($sql);
        $date = new DateTime();
        $timeStamp = $date->getTimestamp();

        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('BRAND', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('EXPLOSION', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('TECHNIK', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('VERKEHR', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('ÖL', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('ABC', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('GAS', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('WASSER', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('EINSTURZ', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('UNTERSTÜTZ', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('ERKUND', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('BAHN', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('FLUG', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('BMA', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('STROM', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('RETTUNG', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('BSW', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('ÜBUNG', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('EIGEN', 0, $timeStamp) ");
        $this->query("insert into $prefix" . "category (name, used, time) VALUES ('PROBE', 0, $timeStamp) ");
    }

    function createTableResources()
    {
        $prefix = self::$prefix;
        $sql = "CREATE TABLE $prefix" . "resources(
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                pos INT,
                resource_id BIGINT(30),
                call_sign VARCHAR(150),
                resource_type VARCHAR (150),
                enabled INT,
                time INT)";
        $this->query($sql);
    }

    function createTableWaterlevel()
    {
        $prefix = self::$prefix;
        $sql = "CREATE TABLE $prefix" . "waterlevel(
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                api_url VARCHAR(150),
                pegel_station VARCHAR(150),
                hw1 VARCHAR(10),
                hw5 VARCHAR(10),
                hw30 VARCHAR(10),
                hw100 VARCHAR(10),
                widgetname VARCHAR(150),
                slot VARCHAR(150),
                time INT)";
        $this->query($sql);
    }

    function createTableSMSUsers()
    {
        $prefix = self::$prefix;
        $sql = "CREATE TABLE $prefix" . "smsusers(
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(150),
                phone_group VARCHAR(50),
                phone VARCHAR(20),
                kzloe VARCHAR(2),
                time INT
                )";
        $this->query($sql);
    }

    function createTableSMSHistory()
    {
        $prefix = self::$prefix;
        $sql = "CREATE TABLE $prefix" . "smshistory(
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                event VARCHAR(150),
                time INT
                )";
        $this->query($sql);
    }

    function createTableSMSGroup()
    {
        $prefix = self::$prefix;
        $sql = "CREATE TABLE $prefix" . "smsgroup(
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                smsgruppe VARCHAR(150),
                kzloe VARCHAR(2)
                )";
        $this->query($sql);
        $this->query("insert into $prefix" . "smsgroup (smsgruppe,kzloe) VALUES ('Sammelruf',0) ");
        $this->query("insert into $prefix" . "smsgroup (smsgruppe,kzloe) VALUES ('Kommando',0) ");
        $this->query("insert into $prefix" . "smsgroup (smsgruppe,kzloe) VALUES ('Kleineinsatz',0) ");
        $this->query("insert into $prefix" . "smsgroup (smsgruppe,kzloe) VALUES ('Wasser',0) ");
        $this->query("insert into $prefix" . "smsgroup (smsgruppe,kzloe) VALUES ('Schleife 1',0) ");
        $this->query("insert into $prefix" . "smsgroup (smsgruppe,kzloe) VALUES ('Schleife 2',0) ");
        $this->query("insert into $prefix" . "smsgroup (smsgruppe,kzloe) VALUES ('Schleife 3',0) ");
        $this->query("insert into $prefix" . "smsgroup (smsgruppe,kzloe) VALUES ('Schleife 4',0) ");
        $this->query("insert into $prefix" . "smsgroup (smsgruppe,kzloe) VALUES ('Schleife 5',0) ");
    }
}
