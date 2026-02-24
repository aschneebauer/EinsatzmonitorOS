<?php
       $url= $_GET["url"];
       $params ="&showTitle=0&showNav=0&showDate=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0&mode=AGENDA&wkst=1";
       $content = file_get_contents($url . $params);
       $content = str_replace('</head>','<link type="text/css" rel="stylesheet" href="http://www.ffw-einsatzmonitor.at/monitor/google.css" /></head>', $content);
       echo $content;