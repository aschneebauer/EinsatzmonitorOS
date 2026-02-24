/* eslint-disable no-undef */

FFW.initmonitor = {
  _autoload: [
    //["init",$("#ffw").length !== 0]
    "checkOnline",
  ],
  config: {
    interval_timeout: 60000,
  },
  getConfigValue: function (key) {
    try {
      /** @namespace item.config_value **/
      /** @namespace item.config_key **/
      return FFW.initmonitor.config.find((item) => item.config_key === key)
        .config_value;
    } catch (e) {
      return null;
    }
  },

  getPassValue: function () {
    let pass = FFW.initmonitor.config.find(
      (item) => item.config_key === "pass_leitstelle"
    ).config_value;
    let decrypted = CryptoJS.AES.decrypt(pass, FFW.monitor.config.phrase);
    return decrypted.toString(CryptoJS.enc.Utf8);
  },

  setConfigValue: function (key, value) {
    /** @namespace item.config_value **/
    /** @namespace item.config_key **/
    FFW.initmonitor.config.find(
      (item) => item.config_key === key
    ).config_value = value;
  },

  loadConfigurationFromDb: function () {
    $.ajax({
      type: "POST",
      url: "db/dbFunctions.php",
      timeout: 5000,
      data: { action: "readAllConfiguration" },
      success: function (result) {
        try {
          FFW.initmonitor.config =
            typeof result === "object" ? result : JSON.parse(result);
          FFW.monitor.debugLog(
            "LOADCONFIGURATIONFROMDB: Read Configuration from DB Done: "
          );
          let lock_password =
            FFW.initmonitor.getConfigValue("lock_configuration");
          if ($(lock_password).length !== undefined && lock_password !== "") {
            $(".js-toggle-burger-menu").attr("disabled", "disabled");
          } else {
            $(".js-toggle-burger-menu").removeAttr("disabled");
          }
          FFW.header.showSMSSettings();
          FFW.initmonitor.loadWidgetsFromDbStartMonitor();
        } catch (e) {
          console.log(e);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        FFW.monitor.debugError(
          "LOADCONFIGURATIONFROMDB: init error: " +
            xhr +
            " ,Options: " +
            ajaxOptions +
            ", ERROR: " +
            thrownError
        );
      },
    });
  },

  loadWidgetsFromDbStartMonitor: function () {
    $.ajax({
      type: "POST",
      url: "db/dbFunctions.php",
      timeout: 5000,
      data: { action: "selectAllWidgets" },
      success: function (result) {
        FFW.monitor.config.widgets =
          typeof result === "object" ? result : JSON.parse(result);
        FFW.monitor.debugLog(
          "loadWidgetsFromDbStartMonitor: Widgets Successful loaded startMonitor.... "
        );
        let filteredWidget = FFW.monitor.config.widgets.filter(
          (widget) => widget.widgetname === "RESOURCEN"
        )[0];
        if (filteredWidget.enabled === 1 || filteredWidget.enabled === "1") {
          FFW.initmonitor.initResources();
        }
        FFW.monitor.startMonitor();
      },
      error: function (xhr, ajaxOptions, thrownError) {
        FFW.monitor.debugError(
          "loadWidgetsFromDbStartMonitor: init error: " +
            xhr +
            " ,Options: " +
            ajaxOptions +
            ", ERROR: " +
            thrownError
        );
      },
    });
  },

  initResources: function () {
    let user = FFW.initmonitor.getConfigValue("user_leitstelle");
    let pass = FFW.initmonitor.getPassValue();
    $.ajax({
      type: "GET",
      url: "php/proxy.php",
      timeout: 5000,
      data: {
        location: FFW.monitor.config.resource_url,
        username: user,
        password: pass,
        useAuthentication: "true",
      },
      success: function (result) {
        try {
          if (result === "ERROR_CREDENTIALS") {
            document.getElementById("js-header-id__firestation").innerHTML =
              "ACHTUNG SCHNITTSTELLE GERADE NICHT ERREICHBAR";

            /*
            FFW.monitor.loadModalLayer(
              FFW.monitor.config.modal_login,
              FFW.monitor.config.error_authorization
            );
            */
            FFW.monitor.debugLog(
              "INITRESOURCES: ERROR AUTHENTICATION TO LEITSTELLE"
            );
          } else if (result === "nodata") {
            FFW.monitor.debugLog("BAD INTERNET CONNECTION");
          } else {
            try {
              FFW.initmonitor.resources =
                typeof result === "object" ? result : JSON.parse(result);
              FFW.initmonitor.storeResourcesToDB(FFW.initmonitor.resources);
              FFW.monitor.debugLog("INITRESOURCES: Initialize Monitor Done");
            } catch (e) {
              console.log(e);
            }
          }
        } catch (e) {
          FFW.monitor.debugError(
            "INITRESOURCES: cant parse resources from Leitstelle " + e
          );
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        if (xhr.statusText === "timeout") {
          FFW.monitor.debugError(
            "INITRESOURCES: Schnittstelle ist nicht erreichbar"
          );
        } else {
          FFW.monitor.debugError(
            "INITRESOURCES: Cannot connect to Leitstelle RESOURCES Table: " +
              xhr +
              " ,Options: " +
              ajaxOptions +
              ", ERROR: " +
              thrownError
          );
        }
      },
    });
  },

  storeResourcesToDB: function (formdata) {
    $.ajax({
      type: "POST",
      url: "db/dbFunctions.php",
      timeout: 5000,
      data: {
        action: "storeResourcesToDB",
        resourceList: JSON.stringify(formdata),
      },
      success: function (result) {
        FFW.monitor.debugLog(
          "STORERESOURCESTODB: Resources Successful Stored to DB: "
        );
      },
      error: function (xhr, ajaxOptions, thrownError) {
        FFW.monitor.debugError(
          "STORERESOURCESTODB: init error: " +
            xhr +
            " ,Options: " +
            ajaxOptions +
            ", ERROR: " +
            thrownError
        );
      },
    });
  },

  storeAuthTokenIntoConfiguration: function (auth) {
    $.ajax({
      type: "POST",
      url: "db/dbFunctions.php",
      timeout: 5000,
      data: {
        action: "storeConfigToDB",
        configlist: [
          { configkey: "auth_token", configvalue: auth.uuid },
          { configkey: "kind", configvalue: auth.kind },
        ],
      },
      success: function (result) {
        if (result === "OK") {
          FFW.monitor.debugLog(
            "STOREAUTHTOKENINTOCONFIGURATION: AuthToken Successful Stored to DB: "
          );
          if (auth.kind === "PAID") {
            FFW.initmonitor.upgradeMonitorToPro();
          }
        } else {
          FFW.monitor.debugLog(
            "STOREAUTHTOKENINTOCONFIGURATION: AuthToken already exists in DB "
          );
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        FFW.monitor.debugError(
          "STOREAUTHTOKENINTOCONFIGURATION: init error: " +
            xhr +
            " ,Options: " +
            ajaxOptions +
            ", ERROR: " +
            thrownError
        );
      },
    });
  },

  upgradeMonitorToPro: function () {
    $.ajax({
      type: "POST",
      url: "db/dbFunctions.php",
      timeout: 5000,
      data: { action: "upgradeToPro" },
      success: function (result) {
        if (result === "OK") {
          FFW.layout.enablePreviewWidget("GOOGLE");
          FFW.layout.enablePreviewWidget("OWN-ALARMS");
          FFW.layout.enablePreviewWidget("EMPTY-THREE");
          FFW.layout.enablePreviewWidget("WEATHER");
          clearInterval(FFW.monitor.config.interval);
          FFW.initmonitor.init();
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        FFW.monitor.debugError(
          "UPGRADEMONITORTOPRO: init error: " +
            xhr +
            " ,Options: " +
            ajaxOptions +
            ", ERROR: " +
            thrownError
        );
      },
    });
  },

  downgradeMonitorToFree: function () {
    $.ajax({
      type: "POST",
      url: "db/dbFunctions.php",
      timeout: 5000,
      data: { action: "downgradeToFree" },
      success: function (result) {
        if (result === "OK") {
          FFW.layout.disablePreviewWidget("GOOGLE");
          FFW.layout.disablePreviewWidget("OWN-ALARMS");
          FFW.layout.disablePreviewWidget("EMPTY-THREE");
          FFW.layout.disablePreviewWidget("WEATHER");
          clearInterval(FFW.monitor.config.interval);
          FFW.initmonitor.init();
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        FFW.monitor.debugError(
          "DOWNGRADEMONITORTOFREE: init error: " +
            xhr +
            " ,Options: " +
            ajaxOptions +
            ", ERROR: " +
            thrownError
        );
      },
    });
  },

  init: function () {
    $.ajax({
      type: "GET",
      url: "db/initializedb.php",
      timeout: 15000,
      contentType: "text/plain",
      success: function (result) {
        if (result === "OK") {
          FFW.initmonitor.loadConfigurationFromDb();
        } else {
          console.log(
            "something went wrong maybe DB Connection not available:"
          );
          FFW.monitor.checkDBConnection(true);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        FFW.monitor.debugLog(" " + xhr + " " + ajaxOptions + " " + thrownError);
        console.log("something went wrong maybe DB Connection not available:");
        FFW.monitor.checkDBConnection(true);
      },
    });
  },

  checkOnline: function () {
    FFW.monitor.checkInternetConnection(true);
    FFW.initmonitor.config.interval = setInterval(function () {
      FFW.monitor.checkInternetConnection(true);
    }, FFW.initmonitor.config.interval_timeout);
  },
};

FFW.monitor = {
  config: {
    alarmStarted: false,
    phrase: "084bb0e3c916e18fce740edba4556f49",
    widget_alarmstirol: "ALARMS-TIROL",
    widget_waterlevel: "WATERLEVEL",
    widget_resourcen: "RESOURCEN",
    widget_resourcenoverlay: "RESOURCEN-OVERLAY",
    widget_eventinfo: "EVENTINFO",
    widget_map: "MAP",
    widget_uwz: "UWZ",
    widget_emptyone: "EMPTY-ONE",
    widget_emptytwo: "EMPTY-TWO",
    widget_emptythree: "EMPTY-THREE",
    widget_google: "GOOGLE",
    widget_own: "OWN-ALARMS",
    widget_weather: "WEATHER",
    url_alarmstatus:
      "https://api.leitstelle.tirol/EVENT/STATUS/alarmed?limit=1&order=desc&by=ALARMTIME",
    url_event:
      "https://api.leitstelle.tirol/EVENT/STATUS/alarmed?extends=noasdata,eventpos,eventtype,eventresource,mainevent/eventresource,subevent/eventresource&order=desc&by=ALARMTIME",
    url_testalarm:
      "https://api.leitstelle.tirol/EVENT?extends=noasdata,eventpos,eventtype,eventresource,mainevent/eventresource,subevent/eventresource&order=desc&by=ALARMTIME&limit=1",
    resource_url: "https://api.leitstelle-tirol.at/RESOURCES",
    resource_test_url: "testdata/fakeResourcen.json",
    url_testjson: "testdata/fakeAlarm.json",
    url_testAccepted: "testdata/accepted.json",
    modal_login: "ajax/login.html",
    modal_connection: "ajax/connection.html",
    modal_settings: "ajax/configuration.html",
    modal_carorder: "ajax/carorder.html",
    modal_lock: "ajax/lock.html",
    modal_testsms: "ajax/testsms.html",
    modal_testsmsgroup: "ajax/testsmsgroup.html",
    modal_statistiksms: "ajax/statistiksms.html",
    modal_addusersms: "ajax/addusersms.html",
    modal_addsmsgroup: "ajax/addsmsgroups.html",
    modal_showusersms: "ajax/showusersms.html",
    modal_settings_alarmstirol: "ajax/widget_settings_alarmstirol.html",
    modal_settings_uwz: "ajax/widget_settings_uwz.html",
    modal_settings_resourcen: "ajax/widget_settings_resourcen.html",
    modal_settings_map: "ajax/widget_settings_map.html",
    modal_settings_eventinfo: "ajax/widget_settings_eventinfo.html",
    modal_settings_emptyone: "ajax/widget_settings_emptyone.html",
    modal_settings_emptytwo: "ajax/widget_settings_emptytwo.html",
    modal_settings_emptythree: "ajax/widget_settings_emptythree.html",
    modal_settings_google: "ajax/widget_settings_google.html",
    modal_settings_own: "ajax/widget_settings_own.html",
    modal_settings_weather: "ajax/widget_settings_weather.html",
    mustache_template_smsgroups:
      "<select  class='form-control form-control-lg' style='height: 4rem;' name='alarm_group' id='alarm_group' required><option>Bitte wählen</option>{{#content}}<option value='{{smsgruppe}}'>{{smsgruppe}}</option>{{/content}}</select>",
    mustache_template_list_smsgroups:
      "<table class='mt-5 table table-striped'>{{#content}}<tr><td>{{smsgruppe}}</td><td><div id='{{id}}' class='js-deleteSMSGroup showUserSmsModal--trash'><i class='fa fa-trash' aria-hidden='true'></i></div></td></tr>{{/content}}</table>",
    mustache_template_list_smsusers:
      "<table class='mt-5 table table-striped'>{{#content}}<tr><td>{{phone_group}}</td><td>{{name}}</td><td>{{phone}}</td><td><div groupid='{{phone_group}}' id='{{id}}'class='js-deleteSMSUser showUserSmsModal--trash'><i class='fa fa-trash' aria-hidden='true'></i></div></td></tr>{{/content}}</table",
    error_authorization:
      "Falsche Zugangsdaten - bzw. Webservice nicht freigeschaltet!",
    enabled_resourcen_ids: [],
    view_standard: "STANDARD",
    view_alarm: "ALARM",
    interval_timeout: 60000,
    vectorSource: null,
    vectorSourceSmall: null,
    map: null,
    mapSmall: null,
    protocol: location.protocol === "http://" ? "http:" : "https://",
  },

  checkDisableCalcHeight: function (configproperty) {
    let disableCalcHeight = false;

    if (
      FFW.initmonitor.getConfigValue(configproperty) !== null &&
      FFW.initmonitor.getConfigValue(configproperty) === "1"
    ) {
      disableCalcHeight = true;
    }
    return disableCalcHeight;
  },

  setStoredHeight: function (widgetName) {
    let rownum = $(
      "div[data-widgetname='" + widgetName + "']",
      ".js-standardcontent"
    )
      .closest(".row")
      .attr("rownum");
    let storedHeight = "auto";
    if (rownum !== undefined) {
      if (
        localStorage.getItem(rownum) !== null &&
        localStorage.getItem(rownum) !== "-Infinity"
      ) {
        storedHeight = localStorage.getItem(rownum) + "px";
      }
    }
    return storedHeight;
  },

  removeMap: function () {
    if (FFW.monitor.config.vectorSource != null) {
      if (FFW.monitor.config.vectorSource.tileCache != null) {
        FFW.monitor.config.vectorSource.tileCache.expireCache({});
        FFW.monitor.config.vectorSource.tileCache.clear();
      }
      FFW.monitor.config.vectorSource.clear(true);
      if (FFW.monitor.config.vectorSource.getFeatures().size === 0) {
        FFW.monitor.config.vectorSource.features = null;
      }
    }
    if (FFW.monitor.config.vectorSourceSmall != null) {
      if (FFW.monitor.config.vectorSourceSmall.tileCache != null) {
        FFW.monitor.config.vectorSourceSmall.tileCache.expireCache({});
        FFW.monitor.config.vectorSourceSmall.tileCache.clear();
      }
      FFW.monitor.config.vectorSourceSmall.clear(true);
      if (FFW.monitor.config.vectorSourceSmall.getFeatures().size === 0) {
        FFW.monitor.config.vectorSourceSmall.features = null;
      }
    }

    if (FFW.monitor.config.map != null) {
      FFW.monitor.config.map.getLayers().forEach(function (layer) {
        FFW.monitor.config.map.removeLayer(layer);
      });

      FFW.monitor.config.map.removeLayer(FFW.monitor.config.vectorSource);
      FFW.monitor.config.map.getOverlays().clear();
    }
    if (FFW.monitor.config.mapSmall != null) {
      FFW.monitor.config.mapSmall.getLayers().forEach(function (layer) {
        FFW.monitor.config.mapSmall.removeLayer(layer);
      });
      FFW.monitor.config.mapSmall.removeLayer(
        FFW.monitor.config.vectorSourceSmall
      );
      FFW.monitor.config.mapSmall.getOverlays().clear();
    }

    FFW.monitor.config.vectorSource = null;
    FFW.monitor.config.vectorSourceSmall = null;

    if (FFW.monitor.config.map != null) {
      FFW.monitor.config.map.setTarget(null);
    }

    if (FFW.monitor.config.mapSmall != null) {
      FFW.monitor.config.mapSmall.setTarget(null);
    }

    FFW.monitor.config.map = null;
    FFW.monitor.config.mapSmall = null;
  },

  elem: {
    alarmcontent: $(".js-alarmcontent"),
    standardcontent: $(".js-standardcontent"),
  },

  removeWidget: function (widget, widgetName) {
    if (widget !== null) {
      $(widget).fadeOut(500, function () {
        $(widget).remove();
      });
    } else if (widgetName !== null) {
      $(".widget[data-widgetname='" + widgetName + "']").remove();
    } else {
      let widgets = $(".slot").find(".widget");
      $(widgets).fadeOut(500, function () {
        $(widgets).remove();
      });
    }
  },

  reloadSettings: function () {
    FFW.monitor.removeWidget(null, null);
    FFW.standardview.config.lastupdated_uwz = null;
    FFW.standardview.config.lastupdated_alarmstirol = null;
    FFW.standardview.config.lastupdated_ownalarms = null;
    FFW.standardview.config.lastupdated_waterurl = null;
    FFW.standardview.config.lastupdated_emptyone = null;
    FFW.standardview.config.lastupdated_emptytwo = null;
    FFW.standardview.config.lastupdated_emptythree = null;
    FFW.standardview.config.lastupdated_google = null;
    FFW.standardview.config.lastupdated_own = null;
    FFW.standardview.config.lastupdated_weather = null;

    FFW.alarmview.config.alarmjson = null;
    FFW.alarmview.config.lastupdated_alarm = null;
    FFW.alarmview.config.filteredOei = [];
    FFW.monitor.config.enabled_resourcen_ids = [];
    FFW.standardview.elem.containerscreensaver
      .fadeOut("slow")
      .removeClass("screensaver__image--active");

    $(".js-modal-placeholder").empty();
    clearInterval(FFW.monitor.config.interval);
    localStorage.clear();
    FFW.initmonitor.init();
  },

  debugLog: function (logMessage) {
    if (FFW.initmonitor.getConfigValue("debug_enabled") > 0) {
      console.log(
        FFW.header.getFormattedDateTime(true) + " #### " + logMessage
      );
    }
  },

  debugWarn: function (logMessage) {
    if (FFW.initmonitor.getConfigValue("debug_enabled") > 0) {
      console.warn(
        FFW.header.getFormattedDateTime(true) + " #### " + logMessage
      );
    }
  },

  debugError: function (logMessage) {
    console.error(
      FFW.header.getFormattedDateTime(true) + " #### " + logMessage
    );
  },

  getStatusTextFromStatus: function (key) {
    if (key === "available_at_station" || key === "reserved_at_station") {
      return "Frei auf Wache";
    }
    if (key === "available_via_radio" || key === "reserved_via_radio") {
      return "Verfuegbar ueber Funk";
    }
    if (key === "alarmed_at_station") {
      return "Alarmiert am Stuetzpunkt";
    }
    if (key === "alarmed_via_radio") {
      return "Alarmiert ueber Funk";
    }
    if (key === "on_the_way") {
      return "Unterwegs zum Einsatzort";
    }
    if (key === "arrived") {
      return "Am Einsatzort";
    }
    if (key === "arrived_at_event") {
      return "Am Einsatz";
    }
    if (key === "to_destination") {
      return "Unterwegs zum Zielort";
    }
    if (key === "at_destination") {
      return "Am Zielort";
    }
    if (key === "stand_by") {
      return "Bereitschaft";
    }
    if (key === "not_available") {
      return "ausser Betrieb";
    }
    if (key === "pause_at_station" || key === "pause_via_radio") {
      return "Pause";
    }
    if (key === "finished") {
      return "Frei auf Wache";
    }
    return "unbekannter Status";
  },

  setResourceIcon: function (cartype) {
    let icon = "fa-truck";
    if (cartype.indexOf("Florianstation") !== -1) {
      icon = "fa-city";
    }
    if (cartype.indexOf("BOOT") !== -1) {
      icon = "fa-ship";
    }
    if (cartype.indexOf("MTF") !== -1) {
      icon = "fa-shuttle-van";
    }
    if (cartype.indexOf("HÄNGER") !== -1) {
      icon = "fa-dolly-flatbed-empty";
    }
    if (cartype.indexOf("KDO") !== -1) {
      icon = "fa-truck-pickup";
    }
    if (cartype.indexOf("HFG") !== -1) {
      icon = "fa-broadcast-tower";
    }
    return icon;
  },

  readWidgetContent: function (widgetName) {
    $.ajax({
      type: "POST",
      url: "db/dbFunctions.php",
      timeout: 5000,
      data: { action: "readWidgetContent", widgetname: widgetName },
      success: function (result) {
        try {
          let contentArray =
            typeof result === "object" ? result : JSON.parse(result);
          $("#emptytextarea").text(contentArray[0].content);
          $("#emptytextarea").val(contentArray[0].content);
          $("#configurationModal").modal("show");
          if ($("#emptytextarea").hasClass("editor")) {
            $(".editor").jqte({
              blur: function () {
                $("#emptytextarea").text($(".jqte_editor").html());
              },
            });
            $(".editor").jqteVal(contentArray[0].content);
          }
        } catch (e) {
          console.log(e);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.error(
          "init error: " +
            xhr +
            " ,Options: " +
            ajaxOptions +
            ", ERROR: " +
            thrownError
        );
      },
    });
  },

  loadModalLayer: function (layer, message, stopInterval) {
    function openAccordionPanel(elem) {
      let panel = elem.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    }

    function setDynamicInputContent(group, widgetname) {
      let list = FFW.initmonitor.config.filter(function (el) {
        /** @namespace  el.config_group   Information about the object's members. **/
        return el.config_group === group && el.feature === "ENABLED";
      });
      if (widgetname !== null) {
        list = FFW.initmonitor.config.filter(function (el) {
          return el.widgetname === widgetname;
        });
      }

      return function (appendClass) {
        $.each(list, function () {
          let field = null;
          if (this.config_key.indexOf("_enabl") > 0) {
            let checked = this.config_value === "0" ? "" : "checked";
            field = $(
              '<div class="form-check"><input ' +
                checked +
                ' data-uuid="' +
                this.id +
                '" id="' +
                this.config_key +
                '" class="form-check-input" name="' +
                this.config_key +
                '" type="checkbox" ><label class="form-check-label" for="' +
                this.config_key +
                '">' +
                this.input_placeholder +
                "</label></div>"
            );
            $(appendClass + "-chkb").append(field);
          } else {
            let inputtype = "text";
            let configValue = this.config_value;
            if (this.config_key === "pass_leitstelle") {
              inputtype = "password";
              configValue = FFW.initmonitor.getPassValue();
            }
            if (this.config_key === "lock_configuration") {
              inputtype = "password";
            }
            field = $(
              '<div class="form-group"><label for="' +
                this.config_key +
                '">' +
                this.input_placeholder +
                ':</label><input autocomplete="off" value="' +
                configValue +
                '" data-uuid="' +
                this.id +
                '" placeholder="' +
                this.input_placeholder +
                '" id="' +
                this.config_key +
                '" class="form-control" name="' +
                this.config_key +
                '" type="' +
                inputtype +
                '" /></div>'
            );
            $(appendClass + "-input").append(field);
          }

          $("#" + this.config_key).blur(function () {
            let uuid = $(this).attr("data-uuid");
            let config_value = $(this).val();
            if (this.name === "pass_leitstelle") {
              config_value = CryptoJS.AES.encrypt(
                $(this).val(),
                FFW.monitor.config.phrase
              ).toString();
            }
            if ($(this).is(":checkbox")) {
              let ischecked = $("#" + $(this).attr("id")).is(":checked");
              if (ischecked) {
                config_value = "1";
              } else {
                config_value = "0";
              }
            }
            $.ajax({
              type: "POST",
              url: "db/dbFunctions.php",
              timeout: 5000,
              data: {
                action: "updateConfiguration",
                config_value: config_value,
                config_uuid: uuid,
              },
              success: function (updateConfigResult) {
                try {
                  let updatedrow =
                    typeof result === "object"
                      ? updateConfigResult
                      : JSON.parse(updateConfigResult);
                  FFW.initmonitor.setConfigValue(
                    updatedrow[0].config_key,
                    updatedrow[0].config_value
                  );
                } catch (e) {
                  console.log(e);
                }
              },
              error: function (xhr, ajaxOptions, thrownError) {
                console.error(
                  "init error: " +
                    xhr +
                    " ,Options: " +
                    ajaxOptions +
                    ", ERROR: " +
                    thrownError
                );
              },
            });
          });
        });
      };
    }

    $.ajax({
      type: "GET",
      url: layer,
      contentType: "application/json",
      timeout: 5000,
      cache: false,
      success: function (result) {
        let cleariv = true;
        if (stopInterval !== undefined && stopInterval !== null) {
          cleariv = stopInterval;
        }
        if (cleariv) {
          clearInterval(FFW.monitor.config.interval);
        }
        $(".js-modal-placeholder").empty().html(result);
        if (message) {
          $(".message", ".js-modal-placeholder").text(message);
        }
        if (layer === FFW.monitor.config.modal_login) {
          $("#loginModal").modal("show");
          $("#login_firestation").val(
            FFW.initmonitor.getConfigValue("firestation")
          );
          $("#login_user").val(
            FFW.initmonitor.getConfigValue("user_leitstelle")
          );
          $("#login_pass").val(FFW.initmonitor.getPassValue());
        }

        if (layer === FFW.monitor.config.modal_connection) {
          $("#connectionModal").modal("show");
        }

        if (layer === FFW.monitor.config.modal_lock) {
          $("#lockModal").modal("show");
        }

        if (layer === FFW.monitor.config.modal_carorder) {
          $("#carOrderModal").modal("show");
        }
        if (layer === FFW.monitor.config.modal_testsms) {
          $("#testSmsModal").modal("show");
          $("#testSmsModal")
            .find("#apitoken")
            .val(FFW.initmonitor.getConfigValue("sms_apitoken"));
        }

        if (layer === FFW.monitor.config.modal_testsmsgroup) {
          $.ajax({
            type: "POST",
            url: "db/dbFunctions.php",
            timeout: 5000,
            data: {
              action: "readSMSGroups",
            },
            success: function (response) {
              let resultgroups = JSON.parse(response);
              htmlOutput = Mustache.render(
                FFW.monitor.config.mustache_template_smsgroups,
                {
                  content: resultgroups,
                }
              );
              $("#alarm_group_container").html(htmlOutput);
              $("#testSmsGroupModal").modal("show");
              $("#testSmsGroupModal")
                .find("#apitoken")
                .val(FFW.initmonitor.getConfigValue("sms_apitoken"));
            },
          });
        }

        if (layer === FFW.monitor.config.modal_addusersms) {
          $.ajax({
            type: "POST",
            url: "db/dbFunctions.php",
            timeout: 5000,
            data: {
              action: "readSMSGroups",
            },
            success: function (response) {
              let resultgroups = JSON.parse(response);
              htmlOutput = Mustache.render(
                FFW.monitor.config.mustache_template_smsgroups,
                {
                  content: resultgroups,
                }
              );
              $("#alarm_group_container").html(htmlOutput);
              $("#addUserSmsModal").modal("show");
            },
          });
        }

        if (layer === FFW.monitor.config.modal_addsmsgroup) {
          $.ajax({
            type: "POST",
            url: "db/dbFunctions.php",
            timeout: 5000,
            data: {
              action: "readSMSGroups",
            },
            success: function (response) {
              let resultgroups = JSON.parse(response);
              htmlOutput = Mustache.render(
                FFW.monitor.config.mustache_template_list_smsgroups,
                {
                  content: resultgroups,
                }
              );
              console.log(htmlOutput);
              $("#alarm_group_container").html(htmlOutput);
              $("#addGroupSmsModal").modal("show");
            },
          });
        }

        if (layer === FFW.monitor.config.modal_showusersms) {
          $.ajax({
            type: "POST",
            url: "db/dbFunctions.php",
            timeout: 5000,
            data: {
              action: "readSMSGroups",
            },
            success: function (response) {
              let resultgroups = JSON.parse(response);
              htmlOutput = Mustache.render(
                FFW.monitor.config.mustache_template_smsgroups,
                {
                  content: resultgroups,
                }
              );
              $("#alarm_group_container").html(htmlOutput);
              $("#showUserSmsModal").modal("show");
            },
          });
        }

        if (layer === FFW.monitor.config.modal_statistiksms) {
          $("#statistikSmsModal").modal("show");
        }

        if (layer === FFW.monitor.config.modal_settings_alarmstirol) {
          $("#configurationModal").modal("show");
          let alarm = setDynamicInputContent(
            null,
            FFW.monitor.config.widget_alarmstirol
          );
          alarm(".js-panel-content-alarm");
          let acc = document.getElementsByClassName("accordion");
          $.each(acc, function () {
            if ($(this).hasClass("active")) {
              openAccordionPanel(this);
            }
            this.addEventListener("click", function (e) {
              e.preventDefault();
              this.classList.toggle("active");
              openAccordionPanel(this);
            });
          });
        }

        if (layer === FFW.monitor.config.modal_settings_own) {
          $("#configurationModal").modal("show");
          let alarm = setDynamicInputContent(
            null,
            FFW.monitor.config.widget_own
          );
          alarm(".js-panel-content-own");
          let acc = document.getElementsByClassName("accordion");
          $.each(acc, function () {
            if ($(this).hasClass("active")) {
              openAccordionPanel(this);
            }
            this.addEventListener("click", function (e) {
              e.preventDefault();
              this.classList.toggle("active");
              openAccordionPanel(this);
            });
          });
        }

        if (layer === FFW.monitor.config.modal_settings_uwz) {
          $("#configurationModal").modal("show");
          let alarm = setDynamicInputContent(
            null,
            FFW.monitor.config.widget_uwz
          );
          alarm(".js-panel-content-uwz");
          let acc = document.getElementsByClassName("accordion");
          $.each(acc, function () {
            if ($(this).hasClass("active")) {
              openAccordionPanel(this);
            }
            this.addEventListener("click", function (e) {
              e.preventDefault();
              this.classList.toggle("active");
              openAccordionPanel(this);
            });
          });
        }

        if (layer === FFW.monitor.config.modal_settings_weather) {
          $("#configurationModal").modal("show");
          let alarm = setDynamicInputContent(
            null,
            FFW.monitor.config.widget_weather
          );
          alarm(".js-panel-content-weather");
          let acc = document.getElementsByClassName("accordion");
          $.each(acc, function () {
            if ($(this).hasClass("active")) {
              openAccordionPanel(this);
            }
            this.addEventListener("click", function (e) {
              e.preventDefault();
              this.classList.toggle("active");
              openAccordionPanel(this);
            });
          });
        }

        if (layer === FFW.monitor.config.modal_settings_google) {
          $("#configurationModal").modal("show");
          let alarm = setDynamicInputContent(
            null,
            FFW.monitor.config.widget_google
          );
          alarm(".js-panel-content-google");
          let acc = document.getElementsByClassName("accordion");
          $.each(acc, function () {
            if ($(this).hasClass("active")) {
              openAccordionPanel(this);
            }
            this.addEventListener("click", function (e) {
              e.preventDefault();
              this.classList.toggle("active");
              openAccordionPanel(this);
            });
          });
        }

        if (layer === FFW.monitor.config.modal_settings_resourcen) {
          $("#configurationModal").modal("show");
          FFW.monitor.loadConfigurationResourcen();
          let resourcen = setDynamicInputContent(
            null,
            FFW.monitor.config.widget_resourcen
          );
          resourcen(".js-panel-content");
          let acc = document.getElementsByClassName("accordion");
          setTimeout(function () {
            $.each(acc, function () {
              if ($(this).hasClass("active")) {
                openAccordionPanel(this);
              }
              this.addEventListener("click", function (e) {
                e.preventDefault();
                this.classList.toggle("active");
                openAccordionPanel(this);
              });
            });
          }, 500);
        }

        if (layer === FFW.monitor.config.modal_settings_eventinfo) {
          $("#configurationModal").modal("show");
          FFW.monitor.loadConfigurationResourcen();
          let eventinfo = setDynamicInputContent(
            null,
            FFW.monitor.config.widget_eventinfo
          );
          eventinfo(".js-panel-content-eventinfo");
          let acc = document.getElementsByClassName("accordion");
          $.each(acc, function () {
            if ($(this).hasClass("active")) {
              openAccordionPanel(this);
            }
            this.addEventListener("click", function (e) {
              e.preventDefault();
              this.classList.toggle("active");
              openAccordionPanel(this);
            });
          });
        }

        if (layer === FFW.monitor.config.modal_settings_map) {
          $("#configurationModal").modal("show");
          FFW.monitor.loadConfigurationResourcen();
          let eventinfo = setDynamicInputContent(
            null,
            FFW.monitor.config.widget_map
          );
          eventinfo(".js-panel-content-map");
          let acc = document.getElementsByClassName("accordion");
          $.each(acc, function () {
            if ($(this).hasClass("active")) {
              openAccordionPanel(this);
            }
            this.addEventListener("click", function (e) {
              e.preventDefault();
              this.classList.toggle("active");
              openAccordionPanel(this);
            });
          });
        }

        if (layer === FFW.monitor.config.modal_settings) {
          $("#configurationModal").modal("show");

          let general = setDynamicInputContent("GENERAL", null);
          general(".js-panel-content-general");

          let acc = document.getElementsByClassName("accordion");
          $.each(acc, function () {
            if ($(this).hasClass("active")) {
              openAccordionPanel(this);
            }
            this.addEventListener("click", function (e) {
              e.preventDefault();
              this.classList.toggle("active");
              openAccordionPanel(this);
            });
          });
        }

        if (layer === FFW.monitor.config.modal_settings_emptyone) {
          FFW.monitor.readWidgetContent(FFW.monitor.config.widget_emptyone);
          setTimeout(function () {
            let acc = document.getElementsByClassName("accordion");
            $.each(acc, function () {
              if ($(this).hasClass("active")) {
                openAccordionPanel(this);
              }
              this.addEventListener("click", function (e) {
                e.preventDefault();
                this.classList.toggle("active");
                openAccordionPanel(this);
              });
            });
          }, 500);
        }

        if (layer === FFW.monitor.config.modal_settings_emptytwo) {
          FFW.monitor.readWidgetContent(FFW.monitor.config.widget_emptytwo);
          setTimeout(function () {
            let acc = document.getElementsByClassName("accordion");
            $.each(acc, function () {
              if ($(this).hasClass("active")) {
                openAccordionPanel(this);
              }
              this.addEventListener("click", function (e) {
                e.preventDefault();
                this.classList.toggle("active");
                openAccordionPanel(this);
              });
            });
          }, 500);
        }

        if (layer === FFW.monitor.config.modal_settings_emptythree) {
          FFW.monitor.readWidgetContent(FFW.monitor.config.widget_emptythree);
          setTimeout(function () {
            let acc = document.getElementsByClassName("accordion");
            $.each(acc, function () {
              if ($(this).hasClass("active")) {
                openAccordionPanel(this);
              }
              this.addEventListener("click", function (e) {
                e.preventDefault();
                this.classList.toggle("active");
                openAccordionPanel(this);
              });
            });
          }, 500);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        if (xhr.statusText === "timeout") {
          console.info("Modal layer nicht gefunden");
        } else {
          console.info(
            "Fehler beim laden des Modallayers: " +
              xhr +
              " ,Options: " +
              ajaxOptions +
              ", ERROR: " +
              thrownError
          );
        }
      },
    });
  },

  startMonitor: function () {
    // if array is empty no Alarm is set
    let user = FFW.initmonitor.getConfigValue("user_leitstelle");
    let pass = FFW.initmonitor.getPassValue();
    if (user === "" || pass === "") {
      FFW.monitor.loadModalLayer(FFW.monitor.config.modal_login);
      FFW.monitor.debugLog("STARTMONITOR: wrong credentials");
    } else {
      FFW.header.timeUpdate();
      FFW.monitor.checkForUpdates();
      FFW.monitor.setStandardAlarmContent();
      FFW.monitor.checkInternetConnection();
      FFW.monitor.config.interval = setInterval(function () {
        FFW.monitor.checkInternetConnection();
        if (
          FFW.alarmview.config.alarmjson !== null &&
          FFW.alarmview.config.alarmjson.length > 1
        ) {
          if (FFW.monitor.config.interval_timeout !== 15000) {
            clearInterval(FFW.monitor.config.interval);
            FFW.monitor.config.interval_timeout = 15000;
            FFW.monitor.debugWarn("SWITCHINTERVAL: to 15000");
            FFW.initmonitor.init();
          }
        } else {
          if (FFW.monitor.config.interval_timeout !== 60000) {
            clearInterval(FFW.monitor.config.interval);
            FFW.monitor.config.interval_timeout = 60000;
            FFW.monitor.debugWarn("SWITCHINTERVAL: to 60000");
            FFW.initmonitor.init();
          }
        }
        FFW.header.timeUpdate();
        FFW.monitor.checkForUpdates();
        FFW.monitor.setStandardAlarmContent();
      }, FFW.monitor.config.interval_timeout);
    }
  },

  checkDBConnection: function (startup) {
    $.ajax({
      type: "GET",
      url: "db/initializedb.php",
      timeout: 15000,
      contentType: "text/plain",
      success: function (result) {
        if (result === "OK") {
          clearInterval(FFW.initmonitor.config.dbinterval);
          FFW.monitor.reloadSettings();
        } else {
          console.log(
            "something went wrong maybe DB Connection not available:"
          );
          clearInterval(FFW.monitor.config.interval);
          setTimeout(function () {
            FFW.monitor.checkDBConnection(true);
          }, 60000);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        FFW.monitor.debugLog(" " + xhr + " " + ajaxOptions + " " + thrownError);
        console.log("something went wrong maybe DB Connection not available:");
        clearInterval(FFW.monitor.config.interval);
        setTimeout(function () {
          FFW.monitor.checkDBConnection(true);
        }, 60000);

        //console.error("init error: " + xhr + " ,Options: " + ajaxOptions + ", ERROR: " + thrownError);
      },
    });
  },

  checkInternetConnection: function (startup) {
    $.ajax({
      type: "GET",
      url: "php/proxy.php",
      context: document.body,
      timeout: 5000,
      cache: false,
      data: { location: "http://www.google.com", useAuthentication: "false" },
      success: function (data) {
        if (data === "nodata") {
          if ($("#connectionModal").length < 1) {
            FFW.monitor.debugError("NO INTERNET CONNECTION !!!");
            FFW.monitor.loadModalLayer(
              FFW.monitor.config.modal_connection,
              null,
              false
            );
          }
        } else {
          if (startup) {
            clearInterval(FFW.initmonitor.config.interval);
            FFW.initmonitor.init();
          }
          FFW.monitor.debugLog("INTERNET CONNECTION WORKS");
          if ($("#connectionModal").length > 0) {
            $(".close").trigger("click");
          }
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.info(
          "Error no Internet Connection " +
            xhr +
            ", " +
            ajaxOptions +
            ", " +
            thrownError
        );
      },
    });
  },

  checkForUpdates: function () {
    if (
      FFW.standardview.config.lastupdated_updates == null ||
      FFW.standardview.config.refresh_updates +
        FFW.standardview.config.lastupdated_updates <
        new Date().getTime()
    ) {
      FFW.standardview.config.lastupdated_updates = new Date().getTime();
      let uuid = FFW.initmonitor.getConfigValue("auth_token");
      if (uuid !== null) {
        let locationUrl =
          FFW.monitor.config.protocol +
          "www.ffw-einsatzmonitor.at/php/authfirestation.php?action=readByAuthtoken&uuid=" +
          uuid;
        $.ajax({
          type: "GET",
          url: "php/proxy.php",
          timeout: 5000,
          cache: false,
          data: { location: locationUrl, useAuthentication: "false" },
          success: function (result) {
            try {
              if (result === "nodata") {
                FFW.monitor.debugError(
                  "CHECKFORUPDATES: NO INTERNET CONNECTION"
                );
              } else {
                let authFromServer =
                  typeof result === "object" ? result : JSON.parse(result);

                //if (FFW.initmonitor.getConfigValue("kind") !== authFromServer[0].kind) {
                if (authFromServer[0].kind === "FREE") {
                  FFW.initmonitor.downgradeMonitorToFree();
                  FFW.monitor.debugWarn(
                    "CHECKFORUPDATES: Downgrade to free version"
                  );
                }
                if (authFromServer[0].kind === "PAID") {
                  FFW.initmonitor.upgradeMonitorToPro();
                  FFW.monitor.debugWarn(
                    "CHECKFORUPDATES: Upgrade to paid version"
                  );
                }

                //}
                if (
                  authFromServer[0].kind === "PAID" &&
                  authFromServer[0].update_available === "1"
                ) {
                  $(".js-header__download").show();
                  $(".js-header__download-link").attr(
                    "href",
                    authFromServer[0].update_url
                  );
                } else {
                  $(".js-header__download").hide();
                }
              }
            } catch (e) {
              console.log(e);
            }
          },
          error: function (xhr, ajaxOptions, thrownError) {
            console.info(
              "Error " + xhr + ", " + ajaxOptions + ", " + thrownError
            );
          },
        });
        FFW.monitor.debugWarn("CHECKFORUPDATES: Refresh Updates");
      }
    }
  },

  setStandardAlarmContent: function () {
    let user = FFW.initmonitor.getConfigValue("user_leitstelle");
    let pass = FFW.initmonitor.getPassValue();
    let urlEvent = "php/proxy.php";
    let url_location = FFW.monitor.config.url_alarmstatus;
    if (FFW.initmonitor.getConfigValue("testalarm_enabled") > 0) {
      FFW.monitor.debugLog(
        "SETSTANDARDALARMCONTENT: testalarm leitstelle enabled"
      );
      url_location = FFW.monitor.config.url_testalarm;
    } else if (FFW.initmonitor.getConfigValue("testalarmjson_enabled") > 0) {
      FFW.monitor.debugLog(
        "SETSTANDARDALARMCONTENT: testalarm json(fakealarm) enabled"
      );
      urlEvent = FFW.monitor.config.url_testjson;
    }
    $.ajax({
      type: "GET",
      url: urlEvent,
      contentType: "application/json",
      timeout: 5000,
      cache: false,
      data: {
        location: url_location,
        username: user,
        password: pass,
        useAuthentication: "true",
      },
      success: function (result) {
        try {
          //$('.general-message').addClass('hidden');
          if (result === "ERROR_CREDENTIALS") {
            document.getElementById("js-header-id__firestation").innerHTML =
              "ACHTUNG SCHNITTSTELLE GERADE NICHT ERREICHBAR";

            /*
            FFW.monitor.loadModalLayer(
              FFW.monitor.config.modal_login,
              FFW.monitor.config.error_authorization
            );
            */
          } else if (result === "nodata") {
            FFW.monitor.debugError("BAD INTERNET CONNECTION");
          } else {
            let status =
              typeof result === "object" ? result : JSON.parse(result);

            if (status.length === 0) {
              FFW.alarmview.config.alarmjson = null; // If there are more events all events must be loaded
              FFW.alarmview.config.lastupdated_alarm = null;
              FFW.monitor.config.mapSmall = null;
              FFW.monitor.config.map = null;
              $("#map").empty();
              $("#map-small").empty();
              if (FFW.monitor.config.alarmStarted) {
                FFW.monitor.config.alarmStarted = false;
                FFW.monitor.reloadSettings();
              } else {
                FFW.monitor.loadStandardMonitor();
              }
            } else {
              //TODO AJAX CALL TO READ ALL EVENT DATA
              if (
                FFW.alarmview.config.alarmjson != null &&
                status.length !== FFW.alarmview.config.alarmjson.length
              ) {
                FFW.alarmview.config.alarmjson = null; // If there are more events all events must be loaded
              }
              if (
                FFW.alarmview.config.refresh_alarm +
                  FFW.alarmview.config.lastupdated_alarm <
                new Date().getTime()
              ) {
                FFW.alarmview.config.alarmjson = null; // If there are more events all events must be loaded
              }
              FFW.monitor.config.alarmStarted = true;
              FFW.monitor.elem.alarmcontent.show();
              FFW.monitor.elem.alarmcontent.removeClass("vs-hidden");
              FFW.monitor.elem.standardcontent.hide();
              FFW.monitor.debugLog("SETSTANDARDALARMCONTENT: start alarmview");
              FFW.alarmview.init();
            }
          }
        } catch (e) {
          console.log(e);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        if (xhr.statusText === "timeout") {
          //$('.general-message').removeClass('hidden');
          console.info("Schnittstelle ist nicht erreichbar");
          FFW.monitor.loadStandardMonitor();
        } else {
          console.info(
            "Cannot connect to Leitstelle EVENT: " +
              xhr +
              " ,Options: " +
              ajaxOptions +
              ", ERROR: " +
              thrownError
          );
        }
      },
    });
  },

  loadStandardMonitor: function () {
    FFW.alarmview.config.alarmjson = null;
    FFW.monitor.elem.alarmcontent.hide();
    FFW.monitor.elem.alarmcontent.addClass("vs-hidden");
    FFW.monitor.elem.standardcontent.show();
    $(".js-alarm-size").empty();
    FFW.monitor.debugLog("SETSTANDARDALARMCONTENT: start Standardview");
    FFW.standardview.init();
  },

  loadResources: function (view, widgetName, slot) {
    let user = FFW.initmonitor.getConfigValue("user_leitstelle");
    let pass = FFW.initmonitor.getPassValue();
    let urlEvent = "php/proxy.php";
    let url_location = FFW.monitor.config.resource_url;
    if (FFW.initmonitor.getConfigValue("testalarmjson_enabled") > 0) {
      urlEvent = FFW.monitor.config.resource_test_url;
    }

    $.ajax({
      type: "GET",
      url: urlEvent,
      contentType: "application/json",
      timeout: 5000,
      cache: false,
      data: {
        location: url_location,
        username: user,
        password: pass,
        useAuthentication: "true",
      },
      success: function (result) {
        try {
          if (result === "ERROR_CREDENTIALS") {
            document.getElementById("js-header-id__firestation").innerHTML =
              "ACHTUNG SCHNITTSTELLE GERADE NICHT ERREICHBAR";

            /*
            FFW.monitor.loadModalLayer(
              FFW.monitor.config.modal_login,
              FFW.monitor.config.error_authorization
            );
            */
          } else {
            let resourceArray =
              typeof result === "object" ? result : JSON.parse(result);
            FFW.monitor.debugWarn("LOADRESOURCES: Load from Leitstelle OK");
            FFW.monitor.setFilteredResourcesToConfig(
              resourceArray,
              view,
              widgetName,
              slot
            );
          }
        } catch (e) {
          console.log(e);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        if (xhr.statusText === "timeout") {
          console.info("Schnittstelle ist nicht erreichbar");
        } else {
          console.info(
            "Cannot connect to Leitstelle EVENT: " +
              xhr +
              " ,Options: " +
              ajaxOptions +
              ", ERROR: " +
              thrownError
          );
        }
      },
    });
  },

  setFilteredResourcesToConfig: function (
    resourceArray,
    view,
    widgetName,
    slot
  ) {
    let filteredList = [];
    if (FFW.monitor.config.enabled_resourcen_ids.length < 1) {
      $.ajax({
        type: "POST",
        url: "db/dbFunctions.php",
        timeout: 5000,
        data: { action: "readAllEnabledResourceIds" },
        success: function (result) {
          try {
            let enabled_list = JSON.parse(result);
            $.each(enabled_list, function () {
              /** @namespace this.resource_id **/
              FFW.monitor.config.enabled_resourcen_ids.push(this.resource_id);
            });
            filteredList = resourceArray.filter(
              (obj) =>
                FFW.monitor.config.enabled_resourcen_ids.indexOf(
                  Number(obj.ID)
                ) !== -1
            );
            if (filteredList.length < 1) {
              filteredList = resourceArray.filter(
                (obj) =>
                  FFW.monitor.config.enabled_resourcen_ids.indexOf(obj.ID) !==
                  -1
              );
            }
            FFW.monitor.config.filtered_resourcen = filteredList;
            if (view === FFW.monitor.config.view_standard) {
              FFW.monitor.debugLog(
                "SETFILTEREDRESOURCESTOCONFIG: showresourcen standardview"
              );
              FFW.standardview.showResourcen(widgetName, slot);
            }
            if (view === FFW.monitor.config.view_alarm) {
              FFW.monitor.debugLog(
                "SETFILTEREDRESOURCESTOCONFIG: showresourcen alarmview"
              );
              FFW.alarmview.showResourcen(widgetName, slot);
            }
          } catch (e) {
            console.log(e);
          }
        },
        error: function (xhr, ajaxOptions, thrownError) {
          console.error(
            "init error: " +
              xhr +
              " ,Options: " +
              ajaxOptions +
              ", ERROR: " +
              thrownError
          );
        },
      });
    } else {
      filteredList = resourceArray.filter(
        (obj) =>
          FFW.monitor.config.enabled_resourcen_ids.indexOf(Number(obj.ID)) !==
          -1
      );
      if (filteredList.length < 1) {
        filteredList = resourceArray.filter(
          (obj) =>
            FFW.monitor.config.enabled_resourcen_ids.indexOf(obj.ID) !== -1
        );
      }
      FFW.monitor.config.filtered_resourcen = filteredList;
      if (view === FFW.monitor.config.view_standard) {
        FFW.standardview.showResourcen(widgetName, slot);
      }
      if (view === FFW.monitor.config.view_alarm) {
        FFW.alarmview.showResourcen(widgetName, slot);
      }
    }
  },

  loadConfigurationResourcen: function () {
    $.ajax({
      type: "POST",
      url: "db/dbFunctions.php",
      timeout: 5000,
      data: { action: "readAllResourcen" },
      success: function (result) {
        try {
          let list = JSON.parse(result);
          FFW.monitor.config.resourcenJson = list;
          $.each(list, function () {
            let checked =
              this.enabled === 0 || this.enabled === "0" ? "" : "checked";
            let field = $(
              '<div class="col-4 form-check"><input ' +
                checked +
                ' data-uuid="' +
                this.resource_id +
                '" id="' +
                this.resource_id +
                '" class="form-check-input" name="' +
                this.resource_id +
                '" type="checkbox" ><label class="form-check-label" for="' +
                this.resource_id +
                '">' +
                this.call_sign +
                "</label></div>"
            );
            $(".js-panel-content-resourcen-chkb").append(field);
            $("#" + this.resource_id).blur(function () {
              let uuid = $(this).attr("data-uuid");
              let resource_value = $(this).val();
              if ($(this).is(":checkbox")) {
                let ischecked = $("#" + $(this).attr("id")).is(":checked");
                if (ischecked) {
                  resource_value = "1";
                } else {
                  resource_value = "0";
                }
              }
              $.ajax({
                type: "POST",
                url: "db/dbFunctions.php",
                timeout: 5000,
                data: {
                  action: "updateResourcen",
                  resource_value: resource_value,
                  resource_uuid: uuid,
                },
                success: function (updateConfigResult) {
                  let updatedrow =
                    typeof result === "object"
                      ? updateConfigResult
                      : JSON.parse(updateConfigResult);
                  $.each(FFW.monitor.config.resourcenJson, function () {
                    if (this.resource_id === updatedrow[0].resource_id) {
                      this.enabled = updatedrow[0].enabled;
                    }
                  });
                },
                error: function (xhr, ajaxOptions, thrownError) {
                  console.error(
                    "init error: " +
                      xhr +
                      " ,Options: " +
                      ajaxOptions +
                      ", ERROR: " +
                      thrownError
                  );
                },
              });
            });
          });
        } catch (e) {
          console.log(e);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.error(
          "init error: " +
            xhr +
            " ,Options: " +
            ajaxOptions +
            ", ERROR: " +
            thrownError
        );
      },
    });
  },
};

FFW.standardview = {
  config: {
    uwz_image_url:
      FFW.monitor.config.protocol +
      "www.uwz.at/data/previews/AT_AT02_warning_today_all_desktop.png?time=",
    uwz_url: "http://www.uwz.at",
    uwz_alt: "Aktuelle Unwetterwarnungen fuer Tirol",
    uwz_headline: "UWZ / UBIMET",
    alarmstirol_url:
      FFW.monitor.config.protocol +
      "www.ffw-einsatzmonitor.at/monitor/proxytirol.php",
    firebase_alarmstirol_url:
      FFW.monitor.config.protocol +
      "aktuelle-einsaetze-tirol.firebaseio.com/events.json",
    weather_url:
      "https://api.openweathermap.org/data/2.5/weather?appid=ad53d57855ca1d7f7ebb2125766826e6&lang=de&units=metric",
    refresh_waterurl: 1800000,
    refresh_alarmstirol: 300000,
    refresh_uwz: 1800000,
    refresh_ownalarms: 360000,
    refresh_google: 43200000,
    refresh_emptyone: 3600000,
    refresh_emptytwo: 3600000,
    refresh_emptythree: 1800000,
    refresh_updates: 43200000,
    refresh_own: 43200000,
    refresh_weather: 3600000,
    lastupdated_waterurl: null,
    lastupdated_alarmstirol: null,
    lastupdated_uwz: null,
    lastupdated_emptyone: null,
    lastupdated_emptytwo: null,
    lastupdated_emptythree: null,
    lastupdated_google: null,
    lastupdated_ownalarms: null,
    lastupdated_updates: null,
    lastupdated_own: null,
    lastupdated_weather: null,
    ownalarms_url:
      "https://api.leitstelle-tirol.at/EVENT?extends=noasdata,eventpos,eventtype,eventresource,mainevent/eventresource,subevent/eventresource&order=desc&by=ALARMTIME&limit=",
  },
  elem: {
    containerownalarms: $(".js-ownalarms-table"),
    containerscreensaver: $(".js-screensaver"),
    screensaverimagelist: null,
  },

  init: function () {
    $.each(FFW.monitor.config.widgets, function () {
      if (this.enabled === 1 || this.enabled === "1") {
        if (this.widgetname === FFW.monitor.config.widget_alarmstirol) {
          if ($(".widget__tirol", ".js-standardcontent").length < 1) {
            FFW.standardview.config.lastupdated_alarmstirol = null;
            FFW.monitor.debugLog(
              "widget_tirol not founrd refresh update param"
            );
          }
          FFW.standardview.loadAlarmsTirol(this.widgetname, this.slot);
        }
        if (this.widgetname === FFW.monitor.config.widget_uwz) {
          if ($(".widget__uwz", ".js-standardcontent").length < 1) {
            FFW.standardview.config.lastupdated_uwz = null;
            FFW.monitor.debugLog("widget_uwz not founrd refresh update param");
          }
          FFW.standardview.loadUwz(this.widgetname, this.slot);
        }
        if (this.widgetname === FFW.monitor.config.widget_resourcen) {
          if (FFW.initmonitor.resources === undefined) {
            FFW.initmonitor.initResources();
          }
          FFW.monitor.loadResources(
            FFW.monitor.config.view_standard,
            this.widgetname,
            this.slot
          );
        }

        if (this.widgetname === FFW.monitor.config.widget_emptyone) {
          if ($(".widget__empty--one", ".js-standardcontent").length < 1) {
            FFW.standardview.config.lastupdated_emptyone = null;
            FFW.monitor.debugLog(
              "widget_empty--one not founrd refresh update param"
            );
          }
          if (
            FFW.standardview.config.lastupdated_emptyone == null ||
            FFW.standardview.config.refresh_emptyone +
              FFW.standardview.config.lastupdated_emptyone <
              new Date().getTime()
          ) {
            FFW.standardview.config.lastupdated_emptyone = new Date().getTime();
            FFW.layout.addWidgetToSlot(
              this.slot,
              this.widgetname,
              { commonid: this.content, version: Date.now() },
              null
            );
            FFW.monitor.debugWarn("LOADEMPTYONE: Refresh EMPTYONE");
          }
        }
        if (this.widgetname === FFW.monitor.config.widget_emptytwo) {
          if ($(".widget__empty--two", ".js-standardcontent").length < 1) {
            FFW.standardview.config.lastupdated_emptytwo = null;
            FFW.monitor.debugLog(
              "widget_empty--two not founrd refresh update param"
            );
          }
          if (
            FFW.standardview.config.lastupdated_emptytwo == null ||
            FFW.standardview.config.refresh_emptytwo +
              FFW.standardview.config.lastupdated_emptytwo <
              new Date().getTime()
          ) {
            FFW.standardview.config.lastupdated_emptytwo = new Date().getTime();
            FFW.layout.addWidgetToSlot(
              this.slot,
              this.widgetname,
              { commonid: this.content, version: Date.now() },
              null
            );
            FFW.monitor.debugWarn("LOADEMPTYONE: Refresh EMPTYTWO");
          }
        }
        if (this.widgetname === FFW.monitor.config.widget_emptythree) {
          if ($(".widget__empty--three", ".js-standardcontent").length < 1) {
            FFW.standardview.config.lastupdated_emptythree = null;
            FFW.monitor.debugLog(
              "widget_empty--three not founrd refresh update param"
            );
          }
          if (
            FFW.standardview.config.lastupdated_emptythree == null ||
            FFW.standardview.config.refresh_emptythree +
              FFW.standardview.config.lastupdated_emptythree <
              new Date().getTime()
          ) {
            FFW.standardview.config.lastupdated_emptythree =
              new Date().getTime();
            FFW.layout.addWidgetToSlot(
              this.slot,
              this.widgetname,
              { content: this.content },
              null
            );
            FFW.monitor.debugWarn("LOADEMPTYONE: Refresh EMPTYTHREE");
          }
        }

        if (this.widgetname === FFW.monitor.config.widget_google) {
          if ($(".widget__google", ".js-standardcontent").length < 1) {
            FFW.standardview.config.lastupdated_google = null;
            FFW.monitor.debugLog(
              "widget_google not founrd refresh update param"
            );
          }
          if (
            FFW.standardview.config.lastupdated_google == null ||
            FFW.standardview.config.refresh_google +
              FFW.standardview.config.lastupdated_google <
              new Date().getTime()
          ) {
            FFW.standardview.loadGoogle(this.widgetname, this.slot);
            FFW.standardview.config.lastupdated_google = new Date().getTime();
            FFW.monitor.debugWarn("LOADGOOGLE: Refresh Google Calender");
          }
        }
        if (this.widgetname === FFW.monitor.config.widget_own) {
          if ($(".widget__tirol--own", ".js-standardcontent").length < 1) {
            FFW.standardview.config.lastupdated_own = null;
            FFW.monitor.debugLog(
              "widget_tirol--own not founrd refresh update param"
            );
          }
          if (
            FFW.standardview.config.lastupdated_own == null ||
            FFW.standardview.config.refresh_own +
              FFW.standardview.config.lastupdated_own <
              new Date().getTime()
          ) {
            FFW.standardview.loadOwnAlarms(this.widgetname, this.slot);
            FFW.monitor.debugWarn("LOADOWNALARMS: Refresh Own Alarms");
          }
        }

        if (this.widgetname === FFW.monitor.config.widget_weather) {
          if ($(".widget__weather", ".js-standardcontent").length < 1) {
            FFW.standardview.config.lastupdated_weather = null;
            FFW.monitor.debugLog(
              "widget_weather not founrd refresh update param"
            );
          }
          if (
            FFW.standardview.config.lastupdated_weather == null ||
            FFW.standardview.config.refresh_weather +
              FFW.standardview.config.lastupdated_weather <
              new Date().getTime()
          ) {
            FFW.standardview.loadweather(this.widgetname, this.slot);
            FFW.monitor.debugWarn("LOADOWNALARMS: Refresh Own weather");
          }
        }
      }
    });

    if (
      FFW.initmonitor.getConfigValue("widgetresize_enabled") !== null &&
      FFW.initmonitor.getConfigValue("widgetresize_enabled") === "1"
    ) {
      FFW.standardview.resizeWidgets();
    }

    let screensaver_enabled = FFW.initmonitor.getConfigValue(
      "screensaver_enabled"
    );

    if (screensaver_enabled !== null && screensaver_enabled > 0) {
      FFW.monitor.debugLog("STANDARDVIEW INIT: load screensaver");
      FFW.standardview.loadScreensaver();
    }
  },

  resizeWidgets: function () {
    setTimeout(function () {
      let widgetRows = $(".js-widget-row", ".js-standardcontent");
      $.each(widgetRows, function (idx) {
        let row = $(this);
        let heightContainer = [];

        $.each($(row).find(".widget"), function () {
          let that = $(this);
          if (!$(that).hasClass("js-widget_nocalc")) {
            heightContainer.push($(that).outerHeight());
          }
        });
        localStorage.setItem(
          $(row).attr("rownum"),
          Math.max(...heightContainer)
        );
        $(row)
          .find(".widget:not(.js-widget_nocalc)")
          .css({ height: Math.max(...heightContainer) });

        /*
        $.each($(row).find(".widget"), function () {
          let widgetContentHeight = $(this).find(".widget__content").height();
          let paddingWidget = ($(this).outerHeight() - widgetContentHeight) / 2;
          if (paddingWidget !== undefined) {
            $(this).css({"padding-top": paddingWidget + "px"});
          }
        });
        */
      });
    }, 2000);
  },

  showResourcen: function (widgetName, slot) {
    let slg = [],
      resource = [];
    let tmpSlg = [],
      tmpResource = [];
    let isSlg = false;
    let disableCalcHeight = FFW.monitor.checkDisableCalcHeight(
      "excludeCalcHeight_enabled"
    );
    $.each(FFW.monitor.config.enabled_resourcen_ids, function () {
      let carId = String(this);
      $.each(FFW.monitor.config.filtered_resourcen, function () {
        if (carId === this.ID) {
          /** @namespace this.ADDROBJNAME **/
          this.STATUSINFO = FFW.monitor.getStatusTextFromStatus(this.STATUS);
          this.ICON = FFW.monitor.setResourceIcon(this.TYPE);
          this.CALL_SIGN = this.CALL_SIGN.replace(
            FFW.initmonitor.getConfigValue("firestation"),
            ""
          );
          if (
            FFW.initmonitor.getConfigValue("colored_res_enabled") == null ||
            FFW.initmonitor.getConfigValue("colored_res_enabled") === "0"
          ) {
            this.STATUS = "default";
          }
          if (this.ADDROBJNAME != null && this.ADDROBJNAME.indexOf("SLG") > 0) {
            tmpSlg.push(this);
            if (tmpSlg.length === 3) {
              slg.push(tmpSlg);
              tmpSlg = [];
            }
          } else {
            tmpResource.push(this);
            if (
              tmpResource.length === 3 &&
              FFW.initmonitor.getConfigValue("resources_aslist_enabled") !== "1"
            ) {
              resource.push(tmpResource);
              tmpResource = [];
            }
          }
        }
      });
    });

    if (tmpResource.length > 0) {
      resource.push(tmpResource);
      tmpResource = [];
    }
    if (tmpSlg.length > 0) {
      slg.push(tmpSlg);
      tmpSlg = [];
    }

    if (slg.length > 0) {
      isSlg = true;
    }

    FFW.layout.addWidgetToSlot(
      slot,
      widgetName,
      {
        resourceList: resource,
        slgList: slg,
        isSlg: isSlg,
        disableCalcHeight: disableCalcHeight,
        storedHeight: FFW.monitor.setStoredHeight(widgetName),
      },
      null
    );
    let sortableView = $(".sortable");

    sortableView.sortable({
      update: function (event, ui) {
        let sortableContainer = $(this).closest(".sortable");
        let sortableElements = $(sortableContainer).find(".ui-state-default");
        let carArray = [];
        $.each(sortableElements, function (index) {
          carArray.push({ position: index + 100, id: $(this).data("id") });
        });

        $.ajax({
          type: "POST",
          url: "db/dbFunctions.php",
          timeout: 5000,
          data: { action: "updateCarPosition", cars: carArray },
          success: function (result) {
            console.log("result");
          },
          error: function (xhr, ajaxOptions, thrownError) {
            FFW.monitor.debugError(
              "UPDATECARPOSITION: error: " +
                xhr +
                " ,Options: " +
                ajaxOptions +
                ", ERROR: " +
                thrownError +
                "Could not update Car Positions"
            );
          },
        });
      },
    });

    sortableView.sortable().disableSelection();
  },

  /**
   * @param {{TYPE:string}} resource
   * @param {{STATUS:string}} resource
   * @param {{CALL_SIGN:string}} resource
   */

  loadOwnAlarms: function (widgetName, slot) {
    let formatDate = function (stringDate) {
      let timeStamp = Date.parse(stringDate.replace(" ", "T")),
        date = new Date(timeStamp),
        hours,
        minutes = date.getMinutes();
        hours = date.getHours();

      if (hours < 10) {
        hours = "0" + hours;
      }
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      return (
        date.getUTCDate() +
        "." +
        (date.getMonth() + 1) +
        "." +
        date.getFullYear() +
        " " +
        hours +
        ":" +
        minutes
      );
    };

    let user = FFW.initmonitor.getConfigValue("user_leitstelle");
    let pass = FFW.initmonitor.getPassValue();
    let max_ownalarms = FFW.initmonitor.getConfigValue("max_ownalarms");
    $.ajax({
      type: "GET",
      url: "php/proxy.php",
      contentType: "application/json",
      timeout: 15000,
      cache: false,
      data: {
        location: FFW.standardview.config.ownalarms_url + max_ownalarms,
        username: user,
        password: pass,
        useAuthentication: "true",
      },
      success: function (data) {
        FFW.standardview.config.lastupdated_own = new Date().getTime();
        try {
          if (data.length === 0) {
            console.info("Last events not found contact: Leitstelle Tirol");
          }
          FFW.standardview.config.ownAlarmList =
            typeof data === "object" ? data : JSON.parse(data);
          let maxOwnAlarmList = [];
          let count = 1;
          let disableCalcHeight = FFW.monitor.checkDisableCalcHeight(
            "excludeCalcHeightOwn_enabled"
          );
          $.each(FFW.standardview.config.ownAlarmList, function () {
            if (
              this.eventtype.NAME !== null &&
              this.eventtype.NAME !== "DF-99Ü2" &&
              this.eventtype.NAME !== "FW-Info"
            ) {
              if (count > max_ownalarms) {
                count = 1;
                return false;
              }
              if (
                this.eventtype !== undefined &&
                this.eventtype.REMARK === ""
              ) {
                this.ISREMARK = false;
              } else {
                this.ISREMARK = true;
              }
              this.NAME = FFW.standardview.setAlarmIcon(this.eventtype.NAME);
              this.eventpos = this.eventpos[0];
              this.ALARMTIME = formatDate(this.ALARMTIME);
              maxOwnAlarmList.push(this);
              count += 1;
            }
            return true;
          });

          FFW.layout.addWidgetToSlot(
            slot,
            widgetName,
            {
              alarms: maxOwnAlarmList,
              disableCalcHeight: disableCalcHeight,
              storedHeight: FFW.monitor.setStoredHeight(widgetName),
            },
            null
          );
        } catch (e) {
          console.log(e);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.info(
          "Cannot connect to Leitstelle EVENT: " +
            xhr +
            " ,Options: " +
            ajaxOptions +
            ", ERROR: " +
            thrownError
        );
      },
    });

    function getalarmjson_position(list) {
      let result = null;
      $(list).each(function () {
        if (this.POS === "1") {
          result = this;
        }
      });
      return result;
    }
  },

  loadScreensaver: function () {
    if (
      FFW.standardview.elem.containerscreensaver.hasClass(
        "screensaver__image--active"
      )
    ) {
      FFW.standardview.elem.containerscreensaver
        .fadeOut("slow")
        .removeClass("screensaver__image--active");
    } else {
      FFW.standardview.elem.screensaverimagelist = $(".screensaver__image");
      let actElement = FFW.standardview.elem.screensaverimagelist.filter(
          ".screensaver__image--active"
        ),
        nextElement = actElement.next("img");
      FFW.standardview.elem.screensaverimagelist.removeClass(
        "screensaver__image--active"
      );
      if (nextElement.hasClass("screensaver__image")) {
        nextElement.addClass("screensaver__image--active");
      } else {
        nextElement = FFW.standardview.elem.screensaverimagelist
          .first()
          .addClass("screensaver__image--active");
      }
      FFW.standardview.elem.containerscreensaver
        .fadeIn("slow")
        .addClass("screensaver__image--active");
    }
  },

  loadAlarmsTirol: function (widgetName, slot) {
    if (
      FFW.standardview.config.lastupdated_alarmstirol == null ||
      FFW.standardview.config.refresh_alarmstirol +
        FFW.standardview.config.lastupdated_alarmstirol <
        new Date().getTime()
    ) {
      FFW.standardview.setAlarmsTirol(widgetName, slot);
      FFW.monitor.debugWarn("LOADALARMSTIROL: Refresh Alarms Tirol");
    }
  },

  loadweather: function (widgetName, slot) {
    let country = ",at";
    if (FFW.initmonitor.getConfigValue("zipcode").startsWith("99")) {
      country = ",it";
    }
    let locationUrl =
      FFW.standardview.config.weather_url +
      "&zip=" +
      FFW.initmonitor.getConfigValue("zipcode") +
      country;
    let disableCalcHeight = FFW.monitor.checkDisableCalcHeight(
      "excludeCalcHeightWeather_enabled"
    );
    $.ajax({
      type: "GET",
      url: "php/proxy.php",
      timeout: 5000,
      cache: false,
      data: { location: locationUrl, useAuthentication: "false" },
      success: function (result) {
        FFW.standardview.config.lastupdated_weather = new Date().getTime();
        if (result.length === 0 || result === "nodata") {
          FFW.monitor.debugError("NO WEATHER FOUND: check api openweathermap ");
        } else {
          try {
            let weather =
              typeof result === "object" ? result : JSON.parse(result);
            let secure = false;
            if (FFW.monitor.config.protocol === "https://") {
              secure = true;
            }
            weather.main.temp = Math.round(weather.main.temp);
            weather.main.temp_max = Math.round(weather.main.temp_max);
            weather.main.temp_min = Math.round(weather.main.temp_min);

            FFW.layout.addWidgetToSlot(
              slot,
              widgetName,
              {
                content: weather,
                secure: secure,
                disableCalcHeight: disableCalcHeight,
                storedHeight: FFW.monitor.setStoredHeight(widgetName),
              },
              null
            );
          } catch (e) {
            console.log(e);
          }
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.info("Error " + xhr + ", " + ajaxOptions + ", " + thrownError);
      },
    });
  },

  loadGoogle: function (widgetName, slot) {
    let calender_id = FFW.initmonitor.getConfigValue("google_calender_id");
    let calender_height = FFW.initmonitor.getConfigValue(
      "google_calender_height"
    );
    let calender_mode = FFW.initmonitor.getConfigValue("google_calender_mode");
    let disableCalcHeight = FFW.monitor.checkDisableCalcHeight(
      "excludeCalcHeightOwn_enabled"
    );

    FFW.layout.addWidgetToSlot(
      slot,
      widgetName,
      {
        calender_id: calender_id,
        calender_height: calender_height,
        calender_mode: calender_mode,
        timestamp: new Date().getTime(),
        disableCalcHeight: disableCalcHeight,
        storedHeight: FFW.monitor.setStoredHeight(widgetName),
      },
      null
    );
  },

  setAlarmsTirol: function (widgetName, slot) {
    $.ajax({
      type: "GET",
      url: "php/proxy.php",
      data: {
        location: FFW.standardview.config.firebase_alarmstirol_url,
        useAuthentication: "false",
      },
      timeout: 5000,
      cache: false,
      beforeSend: function (jqXHR) {
        jqXHR.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      },
      success: function (result) {
        FFW.standardview.config.lastupdated_alarmstirol = new Date().getTime();
        try {
          if (result.length === 0) {
            console.info("Last event not found contact: Leitstelle Tirol");
          }

          FFW.standardview.config.alarmstiroljson =
            typeof result === "object" ? result : JSON.parse(result);
          let max_alarmstirol =
            FFW.initmonitor.getConfigValue("max_alarmstirol");
          let maxAlarmList = [];
          let count = 1;
          let disableCalcHeight = FFW.monitor.checkDisableCalcHeight(
            "excludeCalcHeightAlarms_enabled"
          );
          let listJson =
            FFW.standardview.config.alarmstiroljson[
              Object.keys(FFW.standardview.config.alarmstiroljson)[0]
            ];
          $.each(listJson, function () {
            if (this.NAME !== null) {
              if (count > max_alarmstirol) {
                count = 1;
                return false;
              }
              if (this.ZIPCODE === null) {
                this.ZIPCODE = "";
              }
              if (this.CITY === null) {
                this.CITY = "";
              }
              this.NAME_AT_ALARMTIME = FFW.standardview.getFireStation(
                this.NAME_AT_ALARMTIME
              );
              this.NAME = FFW.standardview.setAlarmIcon(this.NAME);
              maxAlarmList.push(this);
              count += 1;
            }
            return true;
          });

          FFW.layout.addWidgetToSlot(
            slot,
            widgetName,
            {
              alarms: maxAlarmList,
              disableCalcHeight: disableCalcHeight,
              storedHeight: FFW.monitor.setStoredHeight(widgetName),
            },
            null
          );
        } catch (e) {
          console.log(e);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.info(
          "Error Reading AlarmsTirol " +
            xhr +
            ", " +
            ajaxOptions +
            ", " +
            thrownError
        );
      },
    });
  },

  setAlarmIcon: function (name) {
    let path = "images/einsatzicons/";
    if (name.indexOf("TECHNIK") !== -1) {
      return path + "technik-xhdpi.png";
    } else if (name.indexOf("EIGEN") !== -1) {
      return path + "eigen-xhdpi.png";
    } else if (name.indexOf("BMA") !== -1) {
      return path + "bma-xhdpi.png";
    } else if (name.indexOf("BRAND") !== -1) {
      return path + "brand-xhdpi.png";
    } else if (name.indexOf("ABC") !== -1) {
      return path + "abc-xhdpi.png";
    } else if (name.indexOf("BAHN") !== -1) {
      return path + "bahn-xhdpi.png";
    } else if (name.indexOf("BSW") !== -1) {
      return path + "bsw-xhdpi.png";
    } else if (name.indexOf("DF") !== -1) {
      return path + "dienstfahrt-xhdpi.png";
    } else if (name.indexOf("EINSTURZ") !== -1) {
      return path + "einsturz-xhdpi.png";
    } else if (name.indexOf("EREIGNIS") !== -1) {
      return path + "ereignis-xhdpi.png";
    } else if (name.indexOf("ERKUND") !== -1) {
      return path + "erkund-xhdpi.png";
    } else if (name.indexOf("EXPLOSION") !== -1) {
      return path + "explosion-xhdpi.png";
    } else if (name.indexOf("FLUG") !== -1) {
      return path + "flug-xhdpi.png";
    } else if (name.indexOf("GAS") !== -1) {
      return path + "gas-xhdpi.png";
    } else if (name.indexOf("ÖL") !== -1) {
      return path + "oil-xhdpi.png";
    } else if (name.indexOf("RETTUNG") !== -1) {
      return path + "person-xhdpi.png";
    } else if (name.indexOf("PROBE") !== -1) {
      return path + "probe-xhdpi.png";
    } else if (name.indexOf("STROM") !== -1) {
      return path + "strom-xhdpi.png";
    } else if (name.indexOf("TECHNIK") !== -1) {
      return path + "technik-xhdpi.png";
    } else if (name.indexOf("ÜBUNG") !== -1) {
      return path + "uebung-xhdpi.png";
    } else if (name.indexOf("VERKEHR") !== -1) {
      return path + "verkehr-xhdpi.png";
    } else if (name.indexOf("WASSER") !== -1) {
      return path + "wasser-xhdpi.png";
    } else {
      return path + "unterstuetz-xhdpi.png";
    }
  },

  getFireStation: function (resource) {
    let result = "";
    $.each(resource, function () {
      if (this !== null && this.indexOf("Florian") !== -1) {
        result = $.trim(this.replace("Florian", "").replace("FF", "FW"));
        return false;
      }
      if (this !== null && this.indexOf("SMS") !== -1) {
        result = $.trim(this.replace("SMS", "").replace("FF", "FW"));
        return false;
      }
      return true;
    });
    return result;
  },

  loadUwz: function (widgetName, slot) {
    if (
      FFW.standardview.config.lastupdated_uwz == null ||
      FFW.standardview.config.refresh_uwz +
        FFW.standardview.config.lastupdated_uwz <
        new Date().getTime()
    ) {
      let imgSrc = FFW.standardview.config.uwz_image_url + Date.now();
      let disableCalcHeight = FFW.monitor.checkDisableCalcHeight(
        "excludeCalcHeightUwz_enabled"
      );
      FFW.standardview.config.lastupdated_uwz = new Date().getTime();

      FFW.layout.addWidgetToSlot(
        slot,
        widgetName,
        {
          srcUrl: imgSrc,
          altText: FFW.standardview.config.uwz_alt,
          uwzUrl: FFW.standardview.config.uwz_url,
          uwzHeadline: FFW.standardview.config.uwz_headline,
          disableCalcHeight: disableCalcHeight,
          storedHeight: FFW.monitor.setStoredHeight(widgetName),
        },
        null
      );
      FFW.monitor.debugWarn("LOADUWZ: Refresh UWZ");
    }
  },
};

FFW.alarmview = {
  config: {
    alarmjson: null,
    active: 1,
    refresh_alarm: 300000,
    lastupdated_alarm: null,
    filteredOei: [],
    coloredMarker: [
      "img/marker/cars/darkgreen.png",
      "img/marker/cars/orange.png",
      "img/marker/cars/violett.png",
      "img/marker/cars/turkis.png",
      "img/marker/cars/red.png",
      "img/marker/cars/grey.png",
      "img/marker/cars/green.png",
      "img/marker/cars/gold.png",
      "img/marker/cars/darkred.png",
      "img/marker/cars/brown.png",
      "img/marker/cars/yellow.png",
      "img/marker/cars/black.png",
      "img/marker/cars/blue.png",
      "img/marker/cars/darkturkis.png",
      "img/marker/cars/lightgrey.png",
      "img/marker/cars/lightblue.png",
      "img/marker/cars/lightgreen.png",
      "img/marker/cars/lightviolett.png",
      "img/marker/cars/pink.png",
      "img/marker/cars/dirtyyellow.png",
      "img/marker/cars/darkgreen.png",
    ],
  },
  elem: {},

  showResourcen: function (widgetName, slot) {
    let slg = [],
      resource = [];
    let tmpSlg = [],
      tmpResource = [];
    let isSlg = false;

    $.each(FFW.monitor.config.enabled_resourcen_ids, function () {
      let carId = String(this);
      $.each(FFW.monitor.config.filtered_resourcen, function () {
        if (carId === this.ID) {
          /** @namespace this.ADDROBJNAME **/
          this.STATUSINFO = FFW.monitor.getStatusTextFromStatus(this.STATUS);
          this.ICON = FFW.monitor.setResourceIcon(this.TYPE);
          this.CALL_SIGN = this.CALL_SIGN.replace(
            FFW.initmonitor.getConfigValue("firestation"),
            ""
          );
          if (
            FFW.initmonitor.getConfigValue("colored_res_enabled") == null ||
            FFW.initmonitor.getConfigValue("colored_res_enabled") == 0
          ) {
            this.STATUS = "default";
          }
          if (this.ADDROBJNAME != null && this.ADDROBJNAME.indexOf("SLG") > 0) {
            tmpSlg.push(this);
            if (tmpSlg.length == 2) {
              slg.push(tmpSlg);
              tmpSlg = [];
            }
          } else {
            tmpResource.push(this);
            if (tmpResource.length === 2) {
              resource.push(tmpResource);
              tmpResource = [];
            }
          }
        }
      });
    });
    if (tmpResource.length > 0) {
      resource.push(tmpResource);
      tmpResource = [];
    }
    if (tmpSlg.length > 0) {
      slg.push(tmpSlg);
      tmpSlg = [];
    }

    if (slg.length > 0) {
      isSlg = true;
    }

    let htmlOutput;
    if (FFW.initmonitor.getConfigValue("resources_aslist_enabled") === "1") {
      htmlOutput = Mustache.render($("#resourceOverlayListTmpl").html(), {
        resourceList: resource,
        slgList: slg,
        isSlg: isSlg,
      });
    } else {
      htmlOutput = Mustache.render($("#resourceOverlayTmpl").html(), {
        resourceList: resource,
        slgList: slg,
        isSlg: isSlg,
      });
    }

    $("#alarm-slot-4").html(htmlOutput);

    $.each(FFW.monitor.config.filtered_resourcen, function () {
      let carId = this.ID;
      let pos = ol.proj.fromLonLat([
        parseFloat(this.LON),
        parseFloat(this.LAT),
      ]);

      let overlayCar = FFW.monitor.config.map.getOverlayById(carId);
      if (overlayCar !== null) {
        overlayCar.setPosition(pos);
      } else {
        let car = new ol.Overlay({
          id: carId,
          position: pos,
          positioning: "bottom-center",
          element: document.getElementById(carId),
          stopEvent: false,
        });
        FFW.monitor.config.map.addOverlay(car);
      }

      let overlayCarSmall = FFW.monitor.config.mapSmall.getOverlayById(
        carId + "_small"
      );
      if (overlayCarSmall !== null) {
        overlayCarSmall.setPosition(pos);
      } else {
        let carsmall = new ol.Overlay({
          id: carId + "_small",
          position: pos,
          positioning: "bottom-center",
          element: document.getElementById(carId + "_small"),
          stopEvent: false,
        });
        FFW.monitor.config.mapSmall.addOverlay(carsmall);
      }
    });
  },

  init: function () {
    if (FFW.alarmview.config.alarmjson == null) {
      let user = FFW.initmonitor.getConfigValue("user_leitstelle");
      let pass = FFW.initmonitor.getPassValue();
      let urlEvent = "php/proxy.php";
      let url_alarm = FFW.monitor.config.url_event;
      if (FFW.initmonitor.getConfigValue("testalarm_enabled") > 0) {
        url_alarm = FFW.monitor.config.url_testalarm;
      }
      if (FFW.initmonitor.getConfigValue("testalarmjson_enabled") > 0) {
        urlEvent = FFW.monitor.config.url_testjson;
      }
      $.ajax({
        type: "GET",
        url: urlEvent,
        contentType: "application/json",
        timeout: 5000,
        cache: false,
        data: {
          location: url_alarm,
          username: user,
          password: pass,
          useAuthentication: "true",
        },
        success: function (result) {
          try {
            if (result === "ERROR_CREDENTIALS") {
              document.getElementById("js-header-id__firestation").innerHTML =
                "ACHTUNG SCHNITTSTELLE GERADE NICHT ERREICHBAR";

              /*
            FFW.monitor.loadModalLayer(
              FFW.monitor.config.modal_login,
              FFW.monitor.config.error_authorization
            );
            */
            } else {
              FFW.alarmview.config.alarmjson =
                typeof result === "object" ? result : JSON.parse(result);
              FFW.alarmview.config.lastupdated_alarm = new Date().getTime();
              FFW.monitor.debugWarn(
                "ALARMVIEW INIT: " +
                  FFW.alarmview.config.alarmjson.length +
                  " Alarms at the moment(Ajax Call)"
              );
              FFW.alarmview.showAlarm();
            }
          } catch (e) {
            console.log(e);
          }
        },
        error: function (xhr, ajaxOptions, thrownError) {
          if (xhr.statusText === "timeout") {
            console.info("Schnittstelle ist nicht erreichbar");
          } else {
            console.info(
              "Cannot connect to Leitstelle EVENT: " +
                xhr +
                " ,Options: " +
                ajaxOptions +
                ", ERROR: " +
                thrownError
            );
          }
        },
      });
    } else {
      FFW.monitor.debugLog(
        "ALARMVIEW INIT: " +
          FFW.alarmview.config.alarmjson.length +
          " Alarms at the moment from Stored Variable"
      );
      FFW.alarmview.showAlarm();
    }
  },

  showAlarm: function () {
    let event = FFW.alarmview.switchAlarm();
    FFW.alarmview.setAlarmMap();

    if (FFW.initmonitor.getConfigValue("oei_types") != null) {
      FFW.alarmview.setOei();
    }

    FFW.alarmview.setAlarmInformation(event);
    FFW.alarmview.setAdditionalInformation(event);

    //If you want test alarms comment out testalarmjson and testalarm
    if (
      FFW.initmonitor.getConfigValue("sms_enabled") != null &&
      FFW.initmonitor.getConfigValue("sms_enabled") > 0 //&&
      //FFW.initmonitor.getConfigValue("testalarmjson_enabled") < 1 &&
      //FFW.initmonitor.getConfigValue("testalarm_enabled") < 1
    ) {
      FFW.alarmview.sendSMSAlarm(event);
    }

    FFW.alarmview.setAlarmLocation(event);
    FFW.alarmview.showAcceptedMens(event);
  },

  showAcceptedMens: function (event) {
    let urlEvent = "php/readAccepted.php";
    if (
      FFW.initmonitor.getConfigValue("testalarmjson_enabled") > 0 ||
      FFW.initmonitor.getConfigValue("testalarm_enabled") > 0
    ) {
      FFW.monitor.debugLog(
        "TESTDATA ACCEPTED MENS: testalarm json(fakealarm) enabled"
      );
      urlEvent = FFW.monitor.config.url_testAccepted;
    }

    $.ajax({
      type: "POST",
      url: urlEvent,
      timeout: 5000,
      cache: false,
      data: {
        location: "https://app.feuerwehr.tirol/aviable_read.php",
        eventnum: event.EVENTNUM,
      },
      success: function (result) {
        try {
          let list = typeof result === "object" ? result : JSON.parse(result);
          let filteredList = list;
          let amount = list.length;
          if (filteredList.length < 1) {
            amount = 0;
          } else {
            filteredList = list.filter(
              (obj) => obj.TIMESTAMP !== "nicht Einsatzbereit"
            );
            amount = filteredList.length;
          }

          if (amount > 0) {
            let htmlOutputInfo = Mustache.render(
              $("#acceptedMensInfoTmpl").html(),
              { mens: filteredList }
            );
            $("#alarm-slot-6").html(htmlOutputInfo);
          }

          let htmlOutput = Mustache.render($("#acceptedTmpl").html(), {
            content: amount,
          });
          $("#alarm-slot-5").html(htmlOutput);
          FFW.monitor.debugWarn(
            "SHOWACCEPTEDMENS: Active Mens " + filteredList.length
          );
        } catch (e) {
          console.log(e);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.info(
          "Error Mens Feeds " + xhr + ", " + ajaxOptions + ", " + thrownError
        );
      },
    });
  },

  setAdditionalInformation: function (event) {
    let actEvent = event;
    /*
    $.each(actEvent.eventresource, function () {
      this.NAME_AT_ALARMTIME = this.NAME_AT_ALARMTIME.replace(
        FFW.initmonitor.getConfigValue("firestation"),
        ""
      );
    });
    */

    let subEvents = actEvent.subevent;
    let allResources = actEvent.eventresource;
    if(subEvents.length > 0){
      $.each(subEvents, function () {
        console.log(this.eventresource);
        $.each(this.eventresource, function () {
          allResources.push(this);
        });
      });
    }

    let htmlOutput = Mustache.render($("#additionalinfoTmpl").html(), {
      resource: allResources,
    });
    $("#alarm-slot-2").html(htmlOutput);
  },

  switchAlarm: function () {
    if (FFW.alarmview.config.active < FFW.alarmview.config.alarmjson.length) {
      FFW.alarmview.config.active = FFW.alarmview.config.active + 1;
    } else {
      FFW.alarmview.config.active = 1;
    }
    let htmlOutput = Mustache.render($("#alarmsizeTmpl").html(), {
      content:
        FFW.alarmview.config.active +
        "/" +
        FFW.alarmview.config.alarmjson.length,
    });
    $("#alarm-slot-3").html(htmlOutput);
    FFW.monitor.debugWarn(
      "SWITCHALARM: Active Event " + FFW.alarmview.config.active
    );
    return FFW.alarmview.config.alarmjson[FFW.alarmview.config.active - 1];
  },

  /**
   * @param alarmjson          Information about the object.
   * @param alarmjson.eventtype   Information about the object's members.
   * @param alarmjson.eventtype.REMARK   Information about the object's members.
   * @param alarmjson.noasdata.ERGEBNIS_FW   Information about the object's members.
   * @param alarmjson.noasdata.BEMERKUNG   Information about the object's members.
   * @param alarmjson.INFO_TO_RESOURCES   Information about the object's members.
   */
  setAlarmInformation: function (alarmjson) {
    if (
      alarmjson.eventtype !== undefined &&
      alarmjson.eventtype.REMARK === ""
    ) {
      alarmjson.ISREMARK = false;
    } else {
      alarmjson.ISREMARK = true;
    }
    let htmlOutput = Mustache.render($("#alarminfoTmpl").html(), {
      event: alarmjson,
      pos: alarmjson.eventpos[0],
    });
    $("#alarm-slot-1").html(htmlOutput);
  },

  sendSMSAlarm(alarmjson) {
    let storedEventnum = localStorage.getItem(alarmjson.EVENTNUM);

    if (alarmjson.EVENTNUM != storedEventnum) {
      $.ajax({
        type: "POST",
        url: "db/dbFunctions.php",
        timeout: 5000,
        data: {
          action: "readSMSHistory",
          eventnum: alarmjson.EVENTNUM,
        },
        success: function (response) {
          if (response == "SENDSMS") {
            let eventtype = alarmjson.NAMEEVENTTYPE;

            let msgtext = "";
            let newline = "\n";
            let eventres = "";
            let bootisAlsoAlarmed=false;
            
            $.each(alarmjson.eventresource, function () {
              if (this.NAME_AT_ALARMTIME.indexOf("Sammelruf") != -1) {
                eventres = "Sammelruf";
                return false;
              } else if (this.NAME_AT_ALARMTIME.indexOf("Kommando") != -1) {
                eventres = "Kommando";
                return false;
              } else if (this.NAME_AT_ALARMTIME.indexOf("Kleineinsatz") != -1) {
                eventres = "Kleineinsatz";
                return false;
              }else if (this.NAME_AT_ALARMTIME.indexOf("Schleife 1") != -1) {
                eventres = "Schleife 1";
                return false;
              } else if (this.NAME_AT_ALARMTIME.indexOf("Schleife 2") != -1) {
                eventres = "Schleife 2";
                return false;
              } else if (this.NAME_AT_ALARMTIME.indexOf("Schleife 3") != -1) {
                eventres = "Schleife 3";
                return false;
              } else if (this.NAME_AT_ALARMTIME.indexOf("Schleife 4") != -1) {
                eventres = "Schleife 4";
                return false;
              } else if (this.NAME_AT_ALARMTIME.indexOf("Schleife 5") != -1) {
                eventres = "Schleife 5";
                return false;
              } else if (this.NAME_AT_ALARMTIME.indexOf("Sirenen") != -1) {
                eventres = "Sammelruf";
                return false;
              }
              return true;
            });

            $.each(alarmjson.eventresource, function () {
              if (this.NAME_AT_ALARMTIME.indexOf("Wasser") != -1) {
                bootisAlsoAlarmed=true;
                return false;
              } else if (this.NAME_AT_ALARMTIME.indexOf("BOOT") != -1) {
                bootisAlsoAlarmed=true;
                return false;
              }
            });
            if(eventtype == "FW-B-WASSER" || eventtype == "FW-A157-WASSER"){
              bootisAlsoAlarmed=true;
            }
            if (alarmjson.ISREMARK == true) {
              msgtext = msgtext + alarmjson.eventtype.REMARK;
            } else {
              msgtext = msgtext + alarmjson.noasdata.ERGEBNIS_FW;
            }
            msgtext = msgtext + newline;
            msgtext = msgtext + alarmjson.eventpos[0].ADDROBJNAME;
            msgtext = msgtext + newline;
            msgtext = msgtext + alarmjson.eventpos[0].STREET1;
            if (alarmjson.eventpos[0].HOUSENUMBER != null) {
              msgtext = msgtext + alarmjson.eventpos[0].HOUSENUMBER;
            }

            msgtext = msgtext + newline;
            msgtext =
              msgtext +
              alarmjson.eventpos[0].ZIPCODE +
              " " +
              alarmjson.eventpos[0].CITY;
            msgtext = msgtext + newline;
            if (alarmjson.eventpos[0].INFO_LOCATION != null) {
              msgtext = msgtext + alarmjson.eventpos[0].INFO_LOCATION;
            }
            msgtext = msgtext.replace(/ /g, "+");
            let sms_apitoken = FFW.initmonitor.getConfigValue("sms_apitoken");
            if(bootisAlsoAlarmed){
              eventres="Wasser"
            }
            $.ajax({
              type: "POST",
              url: "php/sendsms.php",
              timeout: 5000,
              data: {
                eventtype: eventtype,
                apitoken: sms_apitoken,
                msgtext: msgtext,
                eventnum: alarmjson.EVENTNUM,
                alarm_group: eventres,
              },
              success: function (data) {
                if (data === "NOK") {
                  console.log("SMS COULD NOT BE SEND API TOKEN WRONG....");
                } else if (data === "NO_RECIEPIENTS_FOUND") {
                  console.log("KEINE SMS EMPFÄNGER GEFUNDEN");
                } else {
                  //console.log("store history in database");
                  // JSON.parse(data.split("\n")[0]);
                }

                //ONSUCCESS DONT SEND IT AGAIN
                localStorage.setItem(alarmjson.EVENTNUM, alarmjson.EVENTNUM);
              },
              error: function (xhr, ajaxOptions, thrownError) {
                FFW.monitor.debugLog(
                  " " + xhr + " " + ajaxOptions + " " + thrownError
                );
                localStorage.setItem(alarmjson.EVENTNUM, alarmjson.EVENTNUM);
              },
            });
          } else {
            localStorage.setItem(alarmjson.EVENTNUM, alarmjson.EVENTNUM);
          }
        },
      });
    }
  },

  setAlarmMap: function () {
    $("#map").empty();
    FFW.monitor.removeMap();
    FFW.monitor.config.vectorSource = new ol.source.Vector({ features: [] });
    FFW.monitor.config.map = new ol.Map({
      controls: ol.control.defaults({
        attributionOptions: {
          collapsible: false,
        },
      }),
      target: "map",
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
      ],
      view: new ol.View({
        center: [0, 0],
        zoom: 17,
      }),
    });

    $("#map-small").empty();
    FFW.monitor.config.vectorSourceSmall = new ol.source.Vector({
      features: [],
    });
    FFW.monitor.config.mapSmall = new ol.Map({
      controls: ol.control.defaults({
        attributionOptions: {
          collapsible: false,
        },
      }),
      target: "map-small",
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
      ],
      view: new ol.View({
        center: [0, 0],
        zoom: 17,
      }),
    });
    let filteredWidget = FFW.monitor.config.widgets.filter(
      (widget) => widget.widgetname === "RESOURCEN"
    )[0];
    if (filteredWidget.enabled === 1 || filteredWidget.enabled === "1") {
      FFW.monitor.loadResources(FFW.monitor.config.view_alarm);
    }
    let wmtsxml = "wmts.xml";
    if (FFW.monitor.config.protocol === "https://") {
      wmtsxml = "wmtshttps.xml";
    }
    let parser = new ol.format.WMTSCapabilities();

    fetch(wmtsxml)
      .then(function (response) {
        return response.text();
      })
      .then(function (text) {
        let result = parser.read(text);

        if (FFW.initmonitor.getConfigValue("ortho-map_enabled") > 0) {
          FFW.monitor.config.map.addLayer(
            new ol.layer.Tile({
              opacity: 1,
              name: "gdi_ortho",
              source: new ol.source.WMTS(
                ol.source.WMTS.optionsFromCapabilities(result, {
                  layer: "gdi_ortho",
                  matrixSet: "google3857",
                })
              ),
            })
          );
          FFW.monitor.config.map.addLayer(
            new ol.layer.Tile({
              opacity: 1,
              name: "gid_nomen",
              source: new ol.source.WMTS(
                ol.source.WMTS.optionsFromCapabilities(result, {
                  layer: "gdi_nomenklatur",
                  matrixSet: "google3857",
                })
              ),
            })
          );
        } else {
          $.each(FFW.monitor.config.map.getLayers().getArray(), function () {
            if (
              this.get("name") !== undefined &&
              this.get("name") === "gdi_nomen"
            ) {
              FFW.monitor.config.map.removeLayer(this);
            }
            if (
              this.get("name") !== undefined &&
              this.get("name") === "gdi_ortho"
            ) {
              FFW.monitor.config.map.removeLayer(this);
            }
          });
        }

        if (FFW.initmonitor.getConfigValue("ortho-map-small_enabled") > 0) {
          FFW.monitor.config.mapSmall.addLayer(
            new ol.layer.Tile({
              opacity: 1,
              name: "gdi_ortho",
              source: new ol.source.WMTS(
                ol.source.WMTS.optionsFromCapabilities(result, {
                  layer: "gdi_ortho",
                  matrixSet: "google3857",
                })
              ),
            })
          );
          FFW.monitor.config.mapSmall.addLayer(
            new ol.layer.Tile({
              opacity: 1,
              name: "gdi_nomen",
              source: new ol.source.WMTS(
                ol.source.WMTS.optionsFromCapabilities(result, {
                  layer: "gdi_nomenklatur",
                  matrixSet: "google3857",
                })
              ),
            })
          );
        } else {
          $.each(
            FFW.monitor.config.mapSmall.getLayers().getArray(),
            function () {
              if (
                this.get("name") !== undefined &&
                this.get("name") === "gdi_nomen"
              ) {
                FFW.monitor.config.mapSmall.removeLayer(this);
              }
              if (
                this.get("name") !== undefined &&
                this.get("name") === "gdi_ortho"
              ) {
                FFW.monitor.config.mapSmall.removeLayer(this);
              }
            }
          );
        }

        FFW.monitor.config.map.addLayer(
          new ol.layer.Vector({
            source: FFW.monitor.config.vectorSource,
          })
        );

        FFW.monitor.config.mapSmall.addLayer(
          new ol.layer.Vector({
            source: FFW.monitor.config.vectorSourceSmall,
          })
        );
      });
  },

  setOei: function () {
    $.ajax({
      type: "GET",
      url: "shape/oei.json",
      contentType: "application/json",
      timeout: 5000,
      success: function (data) {
        if (!$.isEmptyObject(data)) {
          let wantedOEI = FFW.initmonitor
            .getConfigValue("oei_types")
            .split(",");

          /** @namespace  obj.properties.OBJEKT   Information about the object's members. **/
          FFW.alarmview.config.filteredOei = data.features.filter(
            (obj) => wantedOEI.indexOf(obj.properties.OBJEKT) !== -1
          );
          FFW.monitor.debugLog("SETOEI: set OEis into map");

          $(FFW.alarmview.config.filteredOei).each(function () {
            let lon = this.geometry.coordinates[0];
            let lat = this.geometry.coordinates[1];
            let objectName = this.properties.OBJEKT;
            let iconFeature = new ol.Feature({
              name: objectName,
              geometry: new ol.geom.Point(
                ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)])
              ),
            });

            let iconStyle = new ol.style.Style({
              image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                opacity: 1,
                anchorXUnits: "fraction",
                anchorYUnits: "fraction",
                src: "images/oei/" + objectName + ".png",
              }),
            });

            if (FFW.initmonitor.getConfigValue("4k_enabled") === "1") {
              iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                  anchor: [0.5, 0.5],
                  opacity: 1,
                  anchorXUnits: "fraction",
                  anchorYUnits: "fraction",
                  src: "images/oei/hd/" + objectName + ".png",
                }),
              });
            }

            iconFeature.setStyle(iconStyle);
            FFW.monitor.config.vectorSource.addFeature(iconFeature);
            FFW.monitor.config.vectorSourceSmall.addFeature(iconFeature);
          });
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        FFW.monitor.debugLog(" " + xhr + " " + ajaxOptions + " " + thrownError);

        //nothing should be logged in case of no OEI is found
      },
    });
  },

  setAlarmLocation: function (alarmjson) {
    let iconFeature = new ol.Feature({
      name: "alarmPosition",
      geometry: new ol.geom.Point(
        ol.proj.fromLonLat([
          parseFloat(alarmjson.eventpos[0].LON),
          parseFloat(alarmjson.eventpos[0].LAT),
        ])
      ),
    });

    let iconStyle;
    if (FFW.initmonitor.getConfigValue("4k_enabled") === "1") {
      iconStyle = new ol.style.Style({
        image: new ol.style.Icon(
          /** @type {module:ol/style/Icon~Options} */ ({
            anchor: [0.5, 1],
            size: [54, 96],
            scale: 1.5,
            opacity: 1,
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            src: "images/marker/hd/marker.png",
          })
        ),
      });
    } else {
      iconStyle = new ol.style.Style({
        image: new ol.style.Icon(
          /** @type {module:ol/style/Icon~Options} */ ({
            anchor: [0.5, 1],
            size: [27, 48],
            scale: 1.5,
            opacity: 1,
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            src: "images/marker/marker.png",
          })
        ),
      });
    }

    iconFeature.setStyle(iconStyle);

    FFW.monitor.config.vectorSource.addFeature(iconFeature);
    FFW.monitor.config.vectorSourceSmall.addFeature(iconFeature);
    FFW.monitor.config.map
      .getView()
      .setCenter(
        ol.proj.fromLonLat([
          parseFloat(alarmjson.eventpos[0].LON),
          parseFloat(alarmjson.eventpos[0].LAT),
        ])
      );
    if (FFW.initmonitor.getConfigValue("zoom_level-map") !== null) {
      FFW.monitor.config.map
        .getView()
        .setZoom(FFW.initmonitor.getConfigValue("zoom_level-map"));
    }

    FFW.monitor.config.mapSmall
      .getView()
      .setCenter(
        ol.proj.fromLonLat([
          parseFloat(alarmjson.eventpos[0].LON),
          parseFloat(alarmjson.eventpos[0].LAT),
        ])
      );
    if (FFW.initmonitor.getConfigValue("zoom_level-map-small") !== null) {
      FFW.monitor.config.mapSmall
        .getView()
        .setZoom(FFW.initmonitor.getConfigValue("zoom_level-map-small"));
    }
  },
};

FFW.header = {
  config: {
    dateFormatOptions: {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    dateFormatOptionsExtended: {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    },
    formatOptionsDate: {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    },
    formatOptionsTime: {
      hour: "2-digit",
      minute: "2-digit",
    },
    lang: "de-DE",
    ctx: ".header",
  },
  elem: {
    container: null,
    containerDate: null,
    containerFirestation: null,
  },
  showSMSSettings: function () {
    let smsEnabled = FFW.initmonitor.getConfigValue("sms_enabled");
    if (smsEnabled == "1") {
      $(".js-header__sms").css("display", "inline-block");
    } else {
      $(".js-header__sms").hide();
    }
  },

  timeUpdate: function () {
    FFW.header.elem.container = $(".js-header__time", FFW.header.config.ctx);
    FFW.header.elem.container.empty().append(FFW.header.getFormattedTime());

    FFW.header.elem.containerDate = $(
      ".js-header__date",
      FFW.header.config.ctx
    );
    FFW.header.elem.containerDate.empty().append(FFW.header.getFormattedDate());

    FFW.header.elem.containerFirestation = $(
      ".js-header__firestation",
      FFW.header.config.ctx
    );
    FFW.header.elem.containerFirestation
      .empty()
      .append("Feuerwehr " + FFW.initmonitor.getConfigValue("firestation"));
  },

  getFormattedDateTime: function (extended) {
    if (extended) {
      return new Date().toLocaleDateString(
        FFW.header.config.lang,
        FFW.header.config.dateFormatOptionsExtended
      );
    }
    return new Date().toLocaleDateString(
      FFW.header.config.lang,
      FFW.header.config.dateFormatOptions
    );
  },

  getFormattedDate: function (datestring) {
    if (datestring) {
      return new Date(datestring).toLocaleDateString(
        FFW.header.config.lang,
        FFW.header.config.formatOptionsDate
      );
    }
    return new Date().toLocaleDateString(
      FFW.header.config.lang,
      FFW.header.config.formatOptionsDate
    );
  },

  getFormattedTime: function () {
    return new Date().toLocaleTimeString(
      FFW.header.config.lang,
      FFW.header.config.formatOptionsTime
    );
  },
};

FFW.layout = {
  allowDrop: function (ev) {
    ev.preventDefault();
    if (ev.target.hasAttribute("data-slot")) {
      ev.target.style.border = "4px dotted green";
    }
  },

  onDragLeave: function (ev) {
    if (ev.target.hasAttribute("data-slot")) {
      ev.target.style.border = "2px solid grey";
    }
  },

  drag: function (ev) {
    let img = document.createElement("img");

    if (ev.currentTarget.getAttribute("data-slot")) {
      let widget = $(ev.currentTarget).children();
      let widgetName = widget.attr("data-widgetname");
      if (FFW.layout.checkIfSetDragImageSupported()) {
        let previewWidget = $(
          ".widget-preview[data-widgetname='" + widgetName + "']"
        );
        img.src = $(previewWidget).find("img").attr("src");
        ev.dataTransfer.setDragImage(img, 0, 0);
      }
      ev.dataTransfer.setData("widget", widgetName);
    } else {
      if (FFW.layout.checkIfSetDragImageSupported()) {
        let srcValue = ev.target.getAttribute("src");
        if (srcValue !== null) {
          img.src = srcValue;
          ev.dataTransfer.setDragImage(img, 0, 0);
        }
      }
      ev.dataTransfer.setData(
        "widget",
        ev.currentTarget.getAttribute("data-widgetname")
      );
    }
  },

  drop: function (ev) {
    ev.preventDefault();
    if (ev.target.hasAttribute("data-slot")) {
      ev.target.style.border = "2px solid grey";
    }
    let widgetName = ev.dataTransfer.getData("widget");
    FFW.monitor.removeWidget(null, "widgetName");
    let widgetSlot = ev.target.getAttribute("data-slot");
    FFW.layout.addWidgetToSlot(widgetSlot, widgetName, {}, "ENABLE");
  },

  checkIfSetDragImageSupported: function () {
    var testVar = window.DataTransfer || window.Clipboard;
    if ("setDragImage" in testVar.prototype) {
      return true;
    }
    return false;
  },

  addWidgetToSlot: function (widgetSlot, widgetName, data, modus) {
    let template;
    let htmlOutput;
    if (widgetName === FFW.monitor.config.widget_uwz) {
      template = $("#uwzTmpl").html();
    }
    if (widgetName === FFW.monitor.config.widget_waterlevel) {
      template = $("#waterlevelTmpl").html();
    }
    if (widgetName === FFW.monitor.config.widget_resourcen) {
      if (FFW.initmonitor.getConfigValue("resources_aslist_enabled") === "1") {
        template = $("#resourcenListTmpl").html();
      } else {
        template = $("#resourcenTmpl").html();
      }
    }
    if (widgetName === FFW.monitor.config.widget_alarmstirol) {
      if (
        FFW.initmonitor.getConfigValue("alarmstirol_aslist_enabled") === "1"
      ) {
        template = $("#aktuelleListTmpl").html();
      } else {
        template = $("#aktuelleTmpl").html();
      }
    }
    if (widgetName === FFW.monitor.config.widget_google) {
      template = $("#googleTmpl").html();
    }
    if (widgetName === FFW.monitor.config.widget_emptyone) {
      template = $("#emptyOneTmpl").html();
    }
    if (widgetName === FFW.monitor.config.widget_emptytwo) {
      template = $("#emptyTwoTmpl").html();
    }
    if (widgetName === FFW.monitor.config.widget_emptythree) {
      template = $("#emptyThreeTmpl").html();
    }
    if (widgetName === FFW.monitor.config.widget_own) {
      template = $("#ownTmpl").html();
    }
    if (widgetName === FFW.monitor.config.widget_weather) {
      template = $("#weatherTmpl").html();
    }
    if (modus === null) {
      FFW.monitor.removeWidget(null, widgetName);
      htmlOutput = Mustache.render(template, data);
    }

    let allSlots = $(".slot");
    $.each(allSlots, function () {
      if ($(this).attr("data-slot") === widgetSlot) {
        if (modus === "ENABLE") {
          $(this).append(htmlOutput).hide().fadeIn(500);
          FFW.layout.enableWidget(widgetName, widgetSlot);
        } else {
          $(this).append(htmlOutput);
        }
      }
    });
    FFW.layout.disablePreviewWidget(widgetName);
  },

  enableWidget: function (widgetName, widgetSlot) {
    $.ajax({
      type: "POST",
      url: "db/dbFunctions.php",
      timeout: 5000,
      data: {
        action: "enableWidget",
        widgetName: widgetName,
        widgetSlot: widgetSlot,
      },
      success: function (result) {
        if (result === "OK") {
          FFW.monitor.debugWarn(
            "ENABLEWIDGET:" + widgetName + " successful enable"
          );
          FFW.monitor.reloadSettings();
        } else {
          FFW.monitor.debugError(
            "ENABLEWIDGET: Could not enable " + widgetName + ": " + result
          );
          FFW.monitor.checkDBConnection();
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        FFW.monitor.debugError(
          "ENABLEWIDGET: init error: " +
            xhr +
            " ,Options: " +
            ajaxOptions +
            ", ERROR: " +
            thrownError
        );
      },
    });
  },

  disableWidget: function (widgetName, widget) {
    $.ajax({
      type: "POST",
      url: "db/dbFunctions.php",
      timeout: 5000,
      data: { action: "disableWidget", widgetName: widgetName },
      success: function (result) {
        if (result === "OK") {
          FFW.monitor.debugWarn(
            "DISABLEWIDGET:" + widgetName + " successful disabled"
          );
          $(widget).fadeOut(500, function () {
            $(widget).remove();
            let previewWidget = $(
              ".widget-preview[data-widgetname='" + widgetName + "']"
            );
            $(previewWidget).css({ cursor: "pointer", opacity: 1 });
            $(previewWidget).attr("ondragstart", "FFW.layout.drag(event)");
            FFW.monitor.reloadSettings();
          });
        } else {
          FFW.monitor.debugError(
            "DISABLEWIDGET: Could not disable " + widgetName + ": " + result
          );
          FFW.monitor.checkDBConnection();
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        FFW.monitor.debugError(
          "DISABLEWIDGET: init error: " +
            xhr +
            " ,Options: " +
            ajaxOptions +
            ", ERROR: " +
            thrownError
        );
      },
    });
  },

  disablePreviewWidget: function (widgetName) {
    let previewWidget = $(
      ".widget-preview[data-widgetname='" + widgetName + "']"
    );

    if ($(previewWidget).attr("data-widgetname") === widgetName) {
      $(previewWidget).css({ cursor: "not-allowed", opacity: 0.4 });
      $(previewWidget).attr("ondragstart", "return false");
    }
  },

  enablePreviewWidget: function (widgetName) {
    let previewWidget = $(
      ".widget-preview[data-widgetname='" + widgetName + "']"
    );

    if ($(previewWidget).attr("data-widgetname") === widgetName) {
      $(previewWidget).removeAttr("style");
      $(previewWidget).attr("ondragstart", "FFW.layout.drag(event)");
    }
  },
};

function _autoload() {
  $.each(FFW, function (section, obj) {
    if ($.isArray(obj._autoload)) {
      $.each(obj._autoload, function (key, value) {
        if ($.isArray(value)) {
          if (value[1]) {
            FFW[section][value[0]]();
          } else {
            if (value[2]) {
              FFW[section][value[2]]();
            }
          }
        } else {
          FFW[section][value]();
        }
      });
    }
  });
}

$(document).on("click", ".js-toggle-burger-menu", function (e) {
  e.preventDefault();
  let lock_password = FFW.initmonitor.getConfigValue("lock_configuration");
  if ($(lock_password).length !== undefined && lock_password !== "") {
    $(this).attr("disabled", "disabled");
  } else {
    $(".js-toggle-burger-menu").removeAttr("disabled");
    let editMode = "editmode";
    let $body = $("body");
    if ($body.hasClass(editMode)) {
      $(".slot").removeAttr("style");
      $body.removeClass(editMode);
      $(".slot").attr("draggable", "false");
    } else {
      $body.addClass(editMode);
      $(".slot").attr("draggable", "true");
    }
  }
});

$(document).on("click", ".js-widget__trash", function () {
  let widget = $(this).closest(".widget");
  let widgetName = widget.attr("data-widgetname");
  FFW.layout.disableWidget(widgetName, widget);
});

$(document).on("click", ".js-widget-settings", function () {
  let widget = $(this).closest(".widget");
  let widgetName = widget.attr("data-widgetname");
  if (widgetName === FFW.monitor.config.widget_alarmstirol) {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_settings_alarmstirol);
  }
  if (
    widgetName === FFW.monitor.config.widget_resourcen ||
    widgetName === FFW.monitor.config.widget_resourcenoverlay
  ) {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_settings_resourcen);
  }

  if (widgetName === FFW.monitor.config.widget_eventinfo) {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_settings_eventinfo);
  }
  if (widgetName === FFW.monitor.config.widget_map) {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_settings_map);
  }

  if (widgetName === FFW.monitor.config.widget_emptyone) {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_settings_emptyone);
  }

  if (widgetName === FFW.monitor.config.widget_emptytwo) {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_settings_emptytwo);
  }

  if (widgetName === FFW.monitor.config.widget_emptythree) {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_settings_emptythree);
  }
  if (widgetName === FFW.monitor.config.widget_google) {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_settings_google);
  }
  if (widgetName === FFW.monitor.config.widget_own) {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_settings_own);
  }
  if (widgetName === FFW.monitor.config.widget_weather) {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_settings_weather);
  }
  if (widgetName === FFW.monitor.config.widget_uwz) {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_settings_uwz);
  }
});

$(document).on("click", ".js-header__settings", function () {
  let lock_password = FFW.initmonitor.getConfigValue("lock_configuration");
  if ($(lock_password).length !== undefined && lock_password !== "") {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_lock);
  } else {
    FFW.monitor.loadModalLayer(FFW.monitor.config.modal_settings);
  }
});

$(document).on("click", ".js-header__addusersms", function () {
  FFW.monitor.loadModalLayer(FFW.monitor.config.modal_addusersms);
});

$(document).on("click", ".js-header__addsmsgroup", function () {
  FFW.monitor.loadModalLayer(FFW.monitor.config.modal_addsmsgroup);
});

$(document).on("click", ".js-header__showusersms", function () {
  console.log("header__showusersms");
  FFW.monitor.loadModalLayer(FFW.monitor.config.modal_showusersms);
});

$(document).on("click", ".js-header__statistiksms", function () {
  console.log("header__statistiksms");
  FFW.monitor.loadModalLayer(FFW.monitor.config.modal_statistiksms);
});

$(document).on("click", ".js-header__testsms", function () {
  FFW.monitor.loadModalLayer(FFW.monitor.config.modal_testsms);
});

$(document).on("click", ".js-header__testsmsgroup", function () {
  FFW.monitor.loadModalLayer(FFW.monitor.config.modal_testsmsgroup);
});

$(document).on("click", ".js-header__carorder", function () {
  FFW.monitor.loadModalLayer(FFW.monitor.config.modal_carorder);
});

$(document).on("click", ".js-btn-unlockconfiguration", function (e) {
  e.preventDefault();
  let lock_password = FFW.initmonitor.getConfigValue("lock_configuration");
  let unlock_password = $("#unlock_pass").val();

  if (lock_password === unlock_password) {
    $(".message_error", "#lockModal").empty();
    let formdata = [{ name: "action", value: "removeLock" }];
    $.ajax({
      type: "POST",
      url: "db/dbFunctions.php",
      data: formdata,
      success: function (response) {
        if (response === "OK") {
          $(".close", "#lockModal").trigger("click");
          FFW.monitor.reloadSettings();
        }
      },
    });
  } else {
    $(".message_error", "#lockModal").text("Falsches Entsperrpasswort");
  }
});

$(document).on("hidden.bs.modal", "#configurationModal", function () {
  FFW.monitor.reloadSettings();
});

$(document).on("hidden.bs.modal", "#connectionModal", function () {
  FFW.monitor.reloadSettings();
});

$(document).on("hidden.bs.modal", "#loginModal", function () {
  FFW.monitor.reloadSettings();
});

$(document).on("keypress", "#loginModal", function (event) {
  var keycode = event.keyCode || event.which;
  if (keycode == "13") {
    event.preventDefault();
    $(".js-btn-savelogin").trigger("click");
  }
});

$(document).on("focusout", "input", "#loginform", function () {
  let form = $("#loginForm");
  let loginInputs = $("input", form);
  $.each(loginInputs, function () {
    if ($(this).val() === "") {
      $(this).addClass("input-error");
    } else {
      $(this).removeClass("input-error");
    }
  });
});

$(document).on("focusout", "input", "#testSmsForm", function () {
  let form = $("#testSmsForm");
  let smsInputs = $("input", form);
  $.each(smsInputs, function () {
    if ($(this).val() === "") {
      $(this).addClass("input-error");
    } else {
      $(this).removeClass("input-error");
    }
  });
});

$(document).on("focusout", "input", "#addUserSmsForm", function () {
  let form = $("#addUserSmsForm");
  let smsInputs = $("input", form);
  $.each(smsInputs, function () {
    if ($(this).val() === "") {
      $(this).addClass("input-error");
    } else {
      $(this).removeClass("input-error");
    }
  });
});

$(document).on("focusout", "input", "#addGroupSmsForm", function () {
  let form = $("#addUserSmsForm");
  let smsInputs = $("input", form);
  $.each(smsInputs, function () {
    if ($(this).val() === "") {
      $(this).addClass("input-error");
    } else {
      $(this).removeClass("input-error");
    }
  });
});

$(document).on("blur", "#emptytextarea", function (e) {
  if (!$(this).hasClass("editor")) {
    e.preventDefault();
    let form = $("#emptyForm");
    let formdata = form.serializeArray();

    //formdata.push({name: "action", value: "addWaterLevel"});
    $.ajax({
      type: "POST",
      url: form.attr("action"),
      data: formdata,
      success: function (response) {
        console.log(response);
      },
    });
  }
});

$(document).on("click", "#btn-free-text", function (e) {
  e.preventDefault();
  let form = $("#emptyForm");
  let formdata = form.serializeArray();

  //formdata.push({name: "action", value: "addWaterLevel"});
  $.ajax({
    type: "POST",
    url: form.attr("action"),
    data: formdata,
    success: function (response) {
      FFW.monitor.debugLog(response);
      $(".close").trigger("click");
    },
  });
});

$(document).on("click", ".js-btn-addusersms", function (e) {
  e.preventDefault();
  let form = $("#addUserSmsForm");
  let smsInputs = $("input", form);
  let isAnyInputEmpty = false;
  let isAnyInputInvalid = false;

  $.each(smsInputs, function () {
    if ($(this).val() === "") {
      isAnyInputEmpty = true;
      $(this).addClass("input-error");
    } else {
      $(this).removeClass("input-error");
    }
    if ($(this).attr("name").indexOf("phone") != -1) {
      let phoneNumber = $(this).val().replace(/ /g, "");
      phoneNumber = phoneNumber.replace(/\//g, "");
      phoneNumber = phoneNumber.replace(/-/g, "");
      if (!phoneNumber.startsWith("+43")) {
        $(this).addClass("input-error");
        isAnyInputInvalid = true;
        $(".message_error", "#addUserSmsModal").text(
          "Telefonnummer hat falsches Format Bsp: +436504404933"
        );
      }
      $(this).val(phoneNumber);
      setTimeout(() => {
        $(".message_error", "#addUserSmsModal").text("");
        $(this).removeClass("input-error");
      }, 5000);
    }
  });
  if (!isAnyInputEmpty && !isAnyInputInvalid) {
    let formdata = form.serializeArray();
    formdata.push({ name: "action", value: "insertSMSUser" });
    $.ajax({
      type: "POST",
      url: form.attr("action"),
      data: formdata,
      success: function (response) {
        if (response === "NOK") {
          $(".message_error", "#addUserSmsModal").text(
            "SMS konnte nicht versendet werden."
          );
        } else if (response === "NOK_NUMBER_EXISTS") {
          $(".message_error", "#addUserSmsModal").text(
            "Telefonnummer existiert bereits in dieser Gruppe"
          );
        } else {
          $(".message_ok", "#addUserSmsModal").text(
            "Benutzer erfolgreich angelegt"
          );

          let res = $.parseJSON(response);
          htmlOutput = Mustache.render(
            FFW.monitor.config.mustache_template_list_smsusers,
            {
              content: res,
            }
          );

          $("#filteredUsers").html(htmlOutput);
        }
        setTimeout(() => {
          $(".message_ok", "#addUserSmsModal").text("");
        }, 5000);
        setTimeout(() => {
          $(".message_error", "#addUserSmsModal").text("");
        }, 5000);
      },
    });
  }
});

$(document).on("click", ".js-btn-addsmsgroup", function (e) {
  e.preventDefault();
  let form = $("#addGroupSmsForm");
  let smsInputs = $("input", form);
  let isAnyInputEmpty = false;
  let isAnyInputInvalid = false;

  $.each(smsInputs, function () {
    if ($(this).val() === "") {
      isAnyInputEmpty = true;
      $(this).addClass("input-error");
    } else {
      $(this).removeClass("input-error");
    }
  });
  if (!isAnyInputEmpty && !isAnyInputInvalid) {
    let formdata = form.serializeArray();
    formdata.push({ name: "action", value: "addGroupSms" });
    $.ajax({
      type: "POST",
      url: form.attr("action"),
      data: formdata,
      success: function (response) {
        if (response === "NOK") {
          $(".message_error", "#addGroupSmsModal").text(
            "Die Gruppe konnte nicht angelegt werden."
          );
        } else if (response === "NOK_GROUP_EXISTS") {
          $(".message_error", "#addGroupSmsModal").text(
            "Die Gruppe existiert bereits"
          );
        } else {
          $(".message_ok", "#addGroupSmsModal").text(
            "Die Gruppe wurde erfolgreich angelegt"
          );
          $.ajax({
            type: "POST",
            url: "db/dbFunctions.php",
            timeout: 5000,
            data: {
              action: "readSMSGroups",
            },
            success: function (res) {
              let resultgroups = JSON.parse(res);
              htmlOutput = Mustache.render(
                FFW.monitor.config.mustache_template_list_smsgroups,
                {
                  content: resultgroups,
                }
              );

              $("#alarm_group_container").html(htmlOutput);
              $("#addGroupSmsModal").modal("show");
            },
          });
        }
        setTimeout(() => {
          $(".message_ok", "#addGroupSmsModal").text("");
        }, 5000);
        setTimeout(() => {
          $(".message_error", "#addGroupSmsModal").text("");
        }, 5000);
      },
    });
  }
});

$(document).on("click", ".js-btn-showsms", function (e) {
  e.preventDefault();
  $("#filteredUsers").empty();
  let form = $("#searchPhoneSmsForm");
  let formdata = form.serializeArray();
  formdata.push({ name: "action", value: "readAllSMSUsers" });
  $.ajax({
    type: "POST",
    url: form.attr("action"),
    data: formdata,
    success: function (response) {
      if (response === "NOK") {
        $("#filteredUsers").append("<div>keine Einträge gefunden</div>");
      } else {
        let res = $.parseJSON(response);
        htmlOutput = Mustache.render(
          FFW.monitor.config.mustache_template_list_smsusers,
          {
            content: res,
          }
        );

        $("#filteredUsers").html(htmlOutput);
      }
    },
  });
});

$(document).on("click", ".js-deleteSMSUser", function (e) {
  e.preventDefault();
  let userId = $(this).attr("id");
  let groupId = $(this).attr("groupid");
  $.ajax({
    type: "POST",
    url: "db/dbFunctions.php",
    timeout: 5000,
    data: {
      action: "deleteSMSUser",
      userId: userId,
      groupId: groupId,
    },
    success: function (response) {
      if (response === "NOK") {
        console.log(response);
      } else {
        $(".message_ok", "#addUserSmsModal").text(
          "Benutzer erfolgreich gelöscht"
        );

        let res = $.parseJSON(response);
        htmlOutput = Mustache.render(
          FFW.monitor.config.mustache_template_list_smsusers,
          {
            content: res,
          }
        );
        $("#filteredUsers").html(htmlOutput);

        setTimeout(() => {
          $(".message_ok", "#addUserSmsModal").text("");
        }, 3000);
      }
    },
  });
});

$(document).on("click", ".js-deleteSMSGroup", function (e) {
  e.preventDefault();
  let groupId = $(this).attr("id");
  $.ajax({
    type: "POST",
    url: "db/dbFunctions.php",
    timeout: 5000,
    data: {
      action: "deleteSMSGroup",
      groupId: groupId,
    },
    success: function (response) {
      if (response === "NOK") {
        console.log(response);
      } else {
        $(".message_ok", "#addGroupSmsModal").text(
          "Gruppe erfolgreich gelöscht"
        );
        $.ajax({
          type: "POST",
          url: "db/dbFunctions.php",
          timeout: 5000,
          data: {
            action: "readSMSGroups",
          },
          success: function (res) {
            let resultgroups = JSON.parse(res);
            htmlOutput = Mustache.render(
              FFW.monitor.config.mustache_template_list_smsgroups,
              {
                content: resultgroups,
              }
            );
            console.log(htmlOutput);
            $("#alarm_group_container").html(htmlOutput);
            $("#addGroupSmsModal").modal("show");
          },
        });

        //$(".js-btn-showsms").trigger("click");
        setTimeout(() => {
          $(".message_ok", "#addGroupSmsModal").text("");
        }, 3000);
      }
    },
  });
});

$(document).on("click", ".js-btn-sendsms", function (e) {
  e.preventDefault();
  let form = $("#testSmsForm");
  let loginInputs = $("input", form);
  let isAnyInputEmpty = false;
  if (!$("#testchkb").val($(this).is(":checked"))) {
    $.each(loginInputs, function () {
      if ($(this).val() === "") {
        isAnyInputEmpty = true;
        $(this).addClass("input-error");
      } else {
        $(this).removeClass("input-error");
      }
    });
  }

  if (!isAnyInputEmpty) {
    let formdata = form.serializeArray();
    formdata.push({ name: "action", value: "testSms" });
    $.ajax({
      type: "POST",
      url: form.attr("action"),
      data: formdata,
      success: function (response) {
        if (response === "NOK") {
          $(".message_error", "#testSmsModal").text(
            "SMS konnte nicht versendet werden."
          );
          setTimeout(() => {
            $(".message_error", "#testSmsModal").text("");
          }, 3000);
        } else {
          $(".message_ok", "#testSmsModal").text("SMS erfolgreich gesendet");
          setTimeout(() => {
            $(".message_ok", "#testSmsModal").text("");
          }, 3000);
        }
      },
    });
  }
});

$(document).on("click", ".js-btn-sendsmsgroup", function (e) {
  e.preventDefault();
  let form = $("#testSmsFormGroup");
  let loginInputs = $("input", form);
  let isAnyInputEmpty = false;
  if (!$("#testchkb").val($(this).is(":checked"))) {
    $.each(loginInputs, function () {
      if ($(this).val() === "") {
        isAnyInputEmpty = true;
        $(this).addClass("input-error");
      } else {
        $(this).removeClass("input-error");
      }
    });
  }
  if (!isAnyInputEmpty) {
    let formdata = form.serializeArray();
    formdata.push({ name: "action", value: "testSmsGroup" });
    $.ajax({
      type: "POST",
      url: form.attr("action"),
      data: formdata,
      success: function (response) {
        if (response === "NOK") {
          $(".message_error", "#testSmsGroupModal").text(
            "SMS konnte nicht versendet werden."
          );
          setTimeout(() => {
            $(".message_error", "#testSmsGroupModal").text("");
          }, 3000);
        } else if (response === "NO_RECIEPIENTS_FOUND") {
          $(".message_error", "#testSmsGroupModal").text(
            "Es konnten keine Empfänger gefunden werden."
          );
          setTimeout(() => {
            $(".message_error", "#testSmsGroupModal").text("");
          }, 3000);
        } else {
          $(".message_ok", "#testSmsGroupModal").text(
            "SMS erfolgreich gesendet"
          );
          setTimeout(() => {
            $(".message_ok", "#testSmsGroupModal").text("");
          }, 3000);
        }
      },
    });
  }
});

$(document).on("click", ".js-btn-savelogin", function (e) {
  e.preventDefault();
  let form = $("#loginForm");
  let loginInputs = $("input", form);
  let isAnyInputEmpty = false;

  $.each(loginInputs, function () {
    if ($(this).val() === "") {
      isAnyInputEmpty = true;
      $(this).addClass("input-error");
    } else {
      $(this).removeClass("input-error");
    }
  });

  function generateHash(datas) {
    let user;
    let station;
    $.each(datas, function () {
      if (this.name === "user_leitstelle") {
        user = this.value;
      }
      if (this.name === "firestation") {
        station = this.value;
      }
    });
    return CryptoJS.MD5(user + station + "").toString();
  }

  function storeAuthentication(formdata) {
    let datas = formdata.filter(function (result) {
      return result.name !== "pass_leitstelle";
    });
    let authToken = generateHash(datas);
    datas.push({ name: "uuid", value: authToken });
    $.ajax({
      type: "POST",
      url: "php/pushAuthentication.php",
      data: datas,
      success: function (response) {
        let authjson =
          typeof response === "object" ? response : JSON.parse(response);
        FFW.layout.disablePreviewWidget("GOOGLE");
        FFW.layout.disablePreviewWidget("OWN-ALARMS");
        FFW.layout.disablePreviewWidget("EMPTY-THREE");
        FFW.layout.disablePreviewWidget("WEATHER");
        FFW.initmonitor.storeAuthTokenIntoConfiguration(authjson[0]);
      },
    });
  }

  if (!isAnyInputEmpty) {
    let formdata = form.serializeArray();
    formdata.push({ name: "action", value: "saveLogin" });
    $.each(formdata, function () {
      if (this.name === "pass_leitstelle") {
        this.value = CryptoJS.AES.encrypt(
          this.value,
          FFW.monitor.config.phrase
        ).toString();
      }
    });
    $.ajax({
      type: "POST",
      url: form.attr("action"),
      data: formdata,
      success: function (response) {
        if (response === "true") {
          storeAuthentication(formdata);
          $(".msg").empty();
          $(".modal-backdrop").removeClass("show").addClass("hidden");
          $(".close").trigger("click");
          FFW.monitor.reloadSettings();
        }
      },
    });
  }
});

function copy(text) {
  let input = document.createElement("input");
  input.setAttribute("value", text.trim());
  document.body.appendChild(input);
  input.select();
  let result = document.execCommand("copy");
  document.body.removeChild(input);
  return result;
}

$(document).on("click", ".js-copy-to-clipboard", function (e) {
  e.preventDefault();
  let copyText = $(this).parent().find("xmp").html();
  copy(copyText);
  if ($(this).text() === "Markup kopieren") {
    $(this).text("kopiert");
  } else {
    $(this).text("Markup kopieren");
  }
});

$(document).on("click", ".js-header__download-link", function (e) {
  //e.preventDefault();
  let uuid = FFW.initmonitor.getConfigValue("auth_token");
  let locationUrl =
    FFW.monitor.config.protocol +
    "www.ffw-einsatzmonitor.at/php/authfirestation.php?action=updateDownload&uuid=" +
    uuid;
  $.ajax({
    type: "GET",
    url: "php/proxy.php",
    timeout: 5000,
    cache: false,
    data: { location: locationUrl, useAuthentication: "false" },
    success: function (result) {
      FFW.monitor.debugLog("CHANGE UPDATE STATUS SUCCESSFUL" + result);
    },
    error: function (xhr, ajaxOptions, thrownError) {
      console.info("Error " + xhr + ", " + ajaxOptions + ", " + thrownError);
    },
  });
  $(".js-header__download").hide();
});

$(function () {
  let canvasheight = $(window).height() - $(".header").height();
  $(".widget__map").css("height", canvasheight);
  $("#map").css("height", canvasheight);

  if (FFW.monitor.config.map != null) {
    FFW.monitor.config.map.updateSize();
  }

  let mapsmallheight = 200;

  $("#map-small").css("height", mapsmallheight);

  if (FFW.monitor.config.mapSmall != null) {
    FFW.monitor.config.mapSmall.updateSize();
  }

  _autoload();
});
