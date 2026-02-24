<?php

class Resources
{
    private $id;
    private $name;
    private $sorting_position;
    private $enabled;
    private $time;

    /**
     * Resources constructor.
     * @param $id
     * @param $name
     * @param $sorting_position
     * @param $enabled
     * @param $time
     */
    public function __construct($id, $name, $sorting_position, $enabled, $time)
    {
        $this->id = $id;
        $this->name = $name;
        $this->sorting_position = $sorting_position;
        $this->enabled = $enabled;
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
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param mixed $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @return mixed
     */
    public function getSortingPosition()
    {
        return $this->sorting_position;
    }

    /**
     * @param mixed $sorting_position
     */
    public function setSortingPosition($sorting_position)
    {
        $this->sorting_position = $sorting_position;
    }

    /**
     * @return mixed
     */
    public function getEnabled()
    {
        return $this->enabled;
    }

    /**
     * @param mixed $enabled
     */
    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;
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
