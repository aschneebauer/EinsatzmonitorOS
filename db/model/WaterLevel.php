<?php
class WaterLevel
{
    private $id;
    private $api_url;
    private $pegel_station;
    private $time;

    /**
     * WaterLevel constructor.
     * @param $id
     * @param $api_url
     * @param $pegel_station
     * @param $time
     */
    public function __construct($id, $api_url, $pegel_station, $time)
    {
        $this->id = $id;
        $this->api_url = $api_url;
        $this->pegel_station = $pegel_station;
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
    public function getApiUrl()
    {
        return $this->api_url;
    }

    /**
     * @param mixed $api_url
     */
    public function setApiUrl($api_url)
    {
        $this->api_url = $api_url;
    }

    /**
     * @return mixed
     */
    public function getPegelStation()
    {
        return $this->pegel_station;
    }

    /**
     * @param mixed $pegel_station
     */
    public function setPegelStation($pegel_station)
    {
        $this->pegel_station = $pegel_station;
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
