<?php
class DbSqlLite extends SQLite3
{
    protected static $feature;
    function __construct($ini)
    {
        self::$feature = $ini['feature'];
        $this->open($ini['db_name']);
    }

    function initializeTableConfiguration()
    {
        $this->query('CREATE TABLE IF NOT EXISTS "configuration" (
                            "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                            "config_key" VARCHAR ,
                            "config_value" VARCHAR,
                            "config_group" VARCHAR,
                            "input_placeholder" VARCHAR,
                            "feature" VARCHAR,
                            "widgetname" VARCHAR,
                            "slot" VARCHAR,
                            "time" INTEGER
        )');

        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('firestation','','GENERAL', 'Feuerwehr', 'ENABLED','','',  strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('user_leitstelle','','GENERAL', 'Benutzername Leitstelle', 'ENABLED','','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('pass_leitstelle','','GENERAL', 'Passwort Leitstelle', 'ENABLED','','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('lock_configuration','','GENERAL', 'Konfiguration sperren', 'ENABLED','','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('max_alarmstirol','9','STANDARD','Max. Anzahl Aktuelle Einsätze', 'ENABLED','ALARMS-TIROL','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('alarmstirol_aslist_enabled','0','STANDARD','Listenansicht aktivieren', 'ENABLED','ALARMS-TIROL','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeightAlarms_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','ALARMS-TIROL','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('max_twitterfeeds','2','STANDARD','Max. Anzahl Twitter Feeds', 'ENABLED','TWITTER','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeightTwitter_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','TWITTER','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('max_ownalarms','9','STANDARD','Max. Anzahl eigener Einsätze', 'DISABLED','OWN-ALARMS','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeightOwn_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','OWN-ALARMS','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('oei_types','ANLST,BATUP,BEPWA,BMZ,BRAND,BSTR,CHEM,DFBRE,DFHOE,DSTP,EBAHN,EXPL,FWZUF,GGAS,GWLIM,HUBL,LOTSP,NOTST,OBFA,OELSP,RADIO,RETST,SAUG,SPERR,SSTB,STAND,STGL,STGLN,STPPU,STROM,STTUP,TRBMZ,TRES,UEHD,UEHDR,UFHD,UFHDR,WAEST,WASS','ALARM','Anzeige OEI Typen', 'DISABLED','','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('ortho-map_enabled','1','ALARM','Satellitenansicht aktivieren', 'ENABLED','MAP','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('ortho-map-small_enabled','1','ALARM','Satellitenansicht aktivieren', 'ENABLED','EVENTINFO','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('carpos_enabled','1','ALARM','Standort Fahrzeuge anzeigen', 'ENABLED','','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('uwz_enabled','1','STANDARD','UWZ aktivieren', 'ENABLED','UWZ','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeightUwz_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','UWZ','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('colored_res_enabled','1','STANDARD','Fahrzeugstatus farblich anzeigen', 'DISABLED','RESOURCEN','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('resources_aslist_enabled','0','STANDARD','Fahrzeuge als Liste anzeigen', 'ENABLED','RESOURCEN','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeight_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','RESOURCEN','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('screensaver_enabled','0','GENERAL','Bildschirmschoner aktivieren', 'DISABLED','','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('debug_enabled','0','GENERAL','Logging Console einschalten', 'ENABLED','','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('calender_enabled','0','STANDARD','Outlook Kalender aktivieren', 'DISABLED','CALENDAR','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('zoom_level-map','17','ALARM','Karte Zoomstufe (4-19)', 'DISABLED','MAP','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('zoom_level-map-small','17','ALARM','Karte Zoomstufe (4-19)', 'DISABLED','EVENTINFO','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('testalarm_enabled','0','GENERAL','Alarmansicht aktivieren', 'ENABLED','','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('testalarmjson_enabled','0','GENERAL','Test mit JSON file (Ordner testdata/fakealarm)', 'ENABLED','','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('widgetresize_enabled','0','GENERAL','Widget Höhe anpassen(pro Zeile)', 'ENABLED','','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('ownalarms_enabled','0','STANDARD','Eigene Einsätze anzeigen', 'DISABLED','','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('google_calender_height','450','STANDARD','Kalender Höhe', 'ENABLED','GOOGLE','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('google_calender_id','','STANDARD','Kalender ID', 'ENABLED','GOOGLE','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('google_calender_mode','AGENDA','STANDARD','Ansicht: AGENDA, WEEK, MONTH', 'ENABLED','GOOGLE','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeightGoogle_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','GOOGLE','',strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('zipcode','6020','STANDARD','Wetterdaten für Postleitzahl', 'ENABLED','WEATHER','', strftime('%s','now')) ");
        $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('excludeCalcHeightWeather_enabled','0','STANDARD','Bei der Höhenberechnung nicht berücksichtigen', 'ENABLED','WEATHER','',strftime('%s','now')) ");
        if (self::$feature == "SMS") {
            $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('sms_enabled','0','GENERAL','SMS Versand aktivieren (SMS Api Token notwendig) - https://gatewayapi.com/', 'ENABLED','','',strftime('%s','now')) ");
            $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('sms_apitoken','','GENERAL','SMS Api Token', 'ENABLED','','',strftime('%s','now')) ");
        } else {
            $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('sms_enabled','0','GENERAL','SMS Versand aktivieren (SMS Api Token notwendig) - https://gatewayapi.com/', 'DISABLED','','',strftime('%s','now')) ");
            $this->exec("insert into configuration (config_key, config_value, config_group, input_placeholder, feature, widgetname, slot, time) VALUES ('sms_apitoken','','GENERAL','SMS Api Token', 'DISABLED','','',strftime('%s','now')) ");
        }
    }

    function createTableWidget()
    {
        $this->query('CREATE TABLE IF NOT EXISTS "widget" (
                            "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                            "widgetname" VARCHAR,
                            "slot" VARCHAR,
                            "enabled" INTEGER,
                            "feature" VARCHAR,
                            "content" TEXT,  
                            "time" INTEGER
        )');
        $this->exec("insert into widget (widgetname, slot, enabled, feature, content, time) VALUES ('TWITTER','CONTENT-4_LEFT',1, 'ENABLED', '', strftime('%s','now')) ");
        $this->exec("insert into widget (widgetname, slot, enabled, feature, content, time) VALUES ('UWZ','CONTENT-4_CENTER',1, 'ENABLED', '', strftime('%s','now')) ");
        $this->exec("insert into widget (widgetname, slot, enabled, feature, content, time) VALUES ('ALARMS-TIROL','CONTENT-4_RIGHT',1, 'ENABLED', '', strftime('%s','now')) ");
        $this->exec("insert into widget (widgetname, slot, enabled, feature, content, time) VALUES ('WATERLEVEL','FULL',0, 'ENABLED', '', strftime('%s','now')) ");
        $this->exec("insert into widget (widgetname, slot, enabled, feature, content, time) VALUES ('RESOURCEN','CONTENT-4_RIGHT',0, 'ENABLED', '', strftime('%s','now')) ");
        $this->exec("insert into widget (widgetname, slot, enabled, feature, content, time) VALUES ('EMPTY-ONE','CONTENT-4_RIGHT',0, 'ENABLED', '201459-at', strftime('%s','now')) ");
        $this->exec("insert into widget (widgetname, slot, enabled, feature, content, time) VALUES ('EMPTY-TWO','CONTENT-4_RIGHT',0, 'ENABLED', '201459-at', strftime('%s','now')) ");
        $this->exec("insert into widget (widgetname, slot, enabled, feature, content, time) VALUES ('EMPTY-THREE','CONTENT-4_RIGHT',0, 'DISABLED', 'Leeres Widget', strftime('%s','now')) ");
        $this->exec("insert into widget (widgetname, slot, enabled, feature, content, time) VALUES ('GOOGLE','CONTENT-4_RIGHT',0, 'DISABLED', 'Google Kalender Widget', strftime('%s','now')) ");
        $this->exec("insert into widget (widgetname, slot, enabled, feature, content, time) VALUES ('OWN-ALARMS','CONTENT-4_RIGHT',0, 'DISABLED', 'Eigene Alarmierungen', strftime('%s','now')) ");
        $this->exec("insert into widget (widgetname, slot, enabled, feature, content, time) VALUES ('WEATHER','CONTENT-4_CENTER',0, 'DISABLED', 'Anzeige Wetter', strftime('%s','now')) ");
    }

    function createTableCategory()
    {
        $this->query('CREATE TABLE IF NOT EXISTS "category" (
                            "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                            "name" VARCHAR,
                            "used" INTEGER,
                            "time" INTEGER
        )');
        $this->exec("insert into category (name, used, time) VALUES ('BRAND',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('EXPLOSION',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('TECHNIK',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('VERKEHR',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('ÖL',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('ABC',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('GAS',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('WASSER',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('EINSTURZ',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('UNTERSTÜTZ',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('ERKUND',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('BAHN',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('FLUG',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('BMA',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('STROM',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('RETTUNG',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('BSW',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('ÜBUNG',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('EIGEN',0, strftime('%s','now')) ");
        $this->exec("insert into category (name, used, time) VALUES ('PROBE',0, strftime('%s','now')) ");
    }


    function createTableWaterlevel()
    {
        $this->query('CREATE TABLE IF NOT EXISTS "waterlevel" (
                            "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                            "api_url" VARCHAR,
                            "pegel_station" VARCHAR,
                            "hw1" VARCHAR,
                            "hw5" VARCHAR,
                            "hw30" VARCHAR,
                            "hw100" VARCHAR,
                            "widgetname" VARCHAR,
                            "slot" VARCHAR,
                            "time" INTEGER1
        )');

        /*
            $statement = $this->prepare('insert into "waterlevel" ("pegel_station",
                                                                             "api_url"

                                                                             )
                                                                             VALUES(
                                                                             :pegel_station,
                                                                             :api_url
                                                                             )
            ');
            $statement->bindValue(':api_url', 'https://apps.tirol.gv.at/hydro/datenaustausch/xchange.pl?user=lfv-tirol&pass=sdfwe234sfaw2&pgnr=201962&werte=W&tage=1');
            $statement->bindValue(':pegel_station', 'Pegel Staffenbrücke');

            $result = $statement->execute();
            $result->finalize();

            $statement = $this->prepare('insert into "waterlevel" ("pegel_station",
                                                                             "api_url"

                                                                             )
                                                                             VALUES(
                                                                             :pegel_stationer,
                                                                             :api_urler
                                                                             )
            ');
            $statement->bindValue(':api_urler', 'https://apps.tirol.gv.at/hydro/datenaustausch/xchange.pl?user=lfv-tirol&pass=sdfwe234sfaw2&pgnr=2hd803&werte=W&tage=1');
            $statement->bindValue(':pegel_stationer', 'Pegel Kaltenbach');

            $result = $statement->execute();
            $result->finalize();
            */
    }

    function createTableResources()
    {
        $this->query('CREATE TABLE IF NOT EXISTS "resources" (
                            "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                            "pos" INTEGER,
                            "resource_id" VARCHAR,
                            "call_sign" VARCHAR,
                            "resource_type" VARCHAR,
                            "enabled" INTEGER, 
                            "time" INTEGER
        )');
    }

    function createTableSMSUsers()
    {
        $this->query('CREATE TABLE IF NOT EXISTS "smsusers" (
                            "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                            "name" varchar,
                            "phone_group" VARCHAR,
                            "phone" VARCHAR,
                            "kzloe" VARCHAR,
                            "time" INTEGER
        )');
    }

    function createTableSMSHistory()
    {
        $this->query('CREATE TABLE IF NOT EXISTS "smshistory" (
                            "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                            "event" varchar,
                            "time" INTEGER
        )');
    }

    function createTableSMSGroup()
    {
        $this->query('CREATE TABLE IF NOT EXISTS "smsgroup" (
                            "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                            "smsgruppe" varchar,
                            "kzloe" VARCHAR
        )');

        $this->exec("insert into smsgroup (smsgruppe,kzloe) VALUES ('Sammelruf',0) ");
        $this->exec("insert into smsgroup (smsgruppe,kzloe) VALUES ('Kommando',0) ");
        $this->exec("insert into smsgroup (smsgruppe,kzloe) VALUES ('Kleineinsatz',0) ");
        $this->exec("insert into smsgroup (smsgruppe,kzloe) VALUES ('Wasser',0) ");
        $this->exec("insert into smsgroup (smsgruppe,kzloe) VALUES ('Schleife 1',0) ");
        $this->exec("insert into smsgroup (smsgruppe,kzloe) VALUES ('Schleife 2',0) ");
        $this->exec("insert into smsgroup (smsgruppe,kzloe) VALUES ('Schleife 3',0) ");
        $this->exec("insert into smsgroup (smsgruppe,kzloe) VALUES ('Schleife 4',0) ");
        $this->exec("insert into smsgroup (smsgruppe,kzloe) VALUES ('Schleife 5',0) ");
    }
}
