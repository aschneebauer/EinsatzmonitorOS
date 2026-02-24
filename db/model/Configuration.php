<?php

class Configuration
{
    private $id;
    private $user_leitstelle;
    private $pass_leitstelle;
    private $max_events;
    private $oei_types;
    private $ortho_enabled;
    private $carpos_enabled;
    private $uwz_enabled;
    private $colored_res_enabled;
    private $screensaver_enabled;
    private $alarmstirol_enabled;
    private $office_calendar;
    private $zoom_level;
    private $testalarm_enabled;
    private $ownalarms_enabled;
    private $time;

    /**
     * Configuration constructor.
     * @param $id
     * @param $user_leitstelle
     * @param $pass_leitstelle
     * @param $max_events
     * @param $oei_types
     * @param $ortho_enabled
     * @param $carpos_enabled
     * @param $uwz_enabled
     * @param $colored_res_enabled
     * @param $screensaver_enabled
     * @param $alarmstirol_enabled
     * @param $office_calendar
     * @param $zoom_level
     * @param $testalarm_enabled
     * @param $ownalarms_enabled
     * @param $time
     */
    public function __construct($id, $user_leitstelle, $pass_leitstelle, $max_events, $oei_types, $ortho_enabled, $carpos_enabled, $uwz_enabled, $colored_res_enabled, $screensaver_enabled, $alarmstirol_enabled, $office_calendar, $zoom_level, $testalarm_enabled, $ownalarms_enabled, $time)
    {
        $this->id = $id;
        $this->user_leitstelle = $user_leitstelle;
        $this->pass_leitstelle = $pass_leitstelle;
        $this->max_events = $max_events;
        $this->oei_types = $oei_types;
        $this->ortho_enabled = $ortho_enabled;
        $this->carpos_enabled = $carpos_enabled;
        $this->uwz_enabled = $uwz_enabled;
        $this->colored_res_enabled = $colored_res_enabled;
        $this->screensaver_enabled = $screensaver_enabled;
        $this->alarmstirol_enabled = $alarmstirol_enabled;
        $this->office_calendar = $office_calendar;
        $this->zoom_level = $zoom_level;
        $this->testalarm_enabled = $testalarm_enabled;
        $this->ownalarms_enabled = $ownalarms_enabled;
        $this->time = $time;
    }


    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return mixed
     */
    public function getUserLeitstelle()
    {
        return $this->user_leitstelle;
    }

    /**
     * @param mixed $user_leitstelle
     */
    public function setUserLeitstelle($user_leitstelle)
    {
        $this->user_leitstelle = $user_leitstelle;
    }

    /**
     * @return mixed
     */
    public function getPassLeitstelle()
    {
        return $this->pass_leitstelle;
    }

    /**
     * @param mixed $pass_leitstelle
     */
    public function setPassLeitstelle($pass_leitstelle)
    {
        $this->pass_leitstelle = $pass_leitstelle;
    }

    /**
     * @return mixed
     */
    public function getMaxEvents()
    {
        return $this->max_events;
    }

    /**
     * @param mixed $max_events
     */
    public function setMaxEvents($max_events)
    {
        $this->max_events = $max_events;
    }

    /**
     * @return mixed
     */
    public function getOeiTypes()
    {
        return $this->oei_types;
    }

    /**
     * @param mixed $oei_types
     */
    public function setOeiTypes($oei_types)
    {
        $this->oei_types = $oei_types;
    }

    /**
     * @return mixed
     */
    public function getOrthoEnabled()
    {
        return $this->ortho_enabled;
    }

    /**
     * @param mixed $ortho_enabled
     */
    public function setOrthoEnabled($ortho_enabled)
    {
        $this->ortho_enabled = $ortho_enabled;
    }

    /**
     * @return mixed
     */
    public function getCarposEnabled()
    {
        return $this->carpos_enabled;
    }

    /**
     * @param mixed $carpos_enabled
     */
    public function setCarposEnabled($carpos_enabled)
    {
        $this->carpos_enabled = $carpos_enabled;
    }

    /**
     * @return mixed
     */
    public function getUwzEnabled()
    {
        return $this->uwz_enabled;
    }

    /**
     * @param mixed $uwz_enabled
     */
    public function setUwzEnabled($uwz_enabled)
    {
        $this->uwz_enabled = $uwz_enabled;
    }

    /**
     * @return mixed
     */
    public function getColoredResEnabled()
    {
        return $this->colored_res_enabled;
    }

    /**
     * @param mixed $colored_res_enabled
     */
    public function setColoredResEnabled($colored_res_enabled)
    {
        $this->colored_res_enabled = $colored_res_enabled;
    }

    /**
     * @return mixed
     */
    public function getScreensaverEnabled()
    {
        return $this->screensaver_enabled;
    }

    /**
     * @param mixed $screensaver_enabled
     */
    public function setScreensaverEnabled($screensaver_enabled)
    {
        $this->screensaver_enabled = $screensaver_enabled;
    }

    /**
     * @return mixed
     */
    public function getAlarmstirolEnabled()
    {
        return $this->alarmstirol_enabled;
    }

    /**
     * @param mixed $alarmstirol_enabled
     */
    public function setAlarmstirolEnabled($alarmstirol_enabled)
    {
        $this->alarmstirol_enabled = $alarmstirol_enabled;
    }

    /**
     * @return mixed
     */
    public function getOfficeCalendar()
    {
        return $this->office_calendar;
    }

    /**
     * @param mixed $office_calendar
     */
    public function setOfficeCalendar($office_calendar)
    {
        $this->office_calendar = $office_calendar;
    }

    /**
     * @return mixed
     */
    public function getZoomLevel()
    {
        return $this->zoom_level;
    }

    /**
     * @param mixed $zoom_level
     */
    public function setZoomLevel($zoom_level)
    {
        $this->zoom_level = $zoom_level;
    }

    /**
     * @return mixed
     */
    public function getTestalarmEnabled()
    {
        return $this->testalarm_enabled;
    }

    /**
     * @param mixed $testalarm_enabled
     */
    public function setTestalarmEnabled($testalarm_enabled)
    {
        $this->testalarm_enabled = $testalarm_enabled;
    }

    /**
     * @return mixed
     */
    public function getOwnalarmsEnabled()
    {
        return $this->ownalarms_enabled;
    }

    /**
     * @param mixed $ownalarms_enabled
     */
    public function setOwnalarmsEnabled($ownalarms_enabled)
    {
        $this->ownalarms_enabled = $ownalarms_enabled;
    }

    /**
     * @return mixed
     */
    public function getTime()
    {
        return $this->time;
    }

    /**
     * @param mixed $time
     */
    public function setTime($time)
    {
        $this->time = $time;
    }
}
