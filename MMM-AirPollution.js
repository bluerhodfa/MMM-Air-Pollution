/*

Magic Mirror Modules
MMM-AirPollution
https://github.com/bluerhodfa/MMM-AirPollution

Weather data provided by OpenWeatherMap API

Ira Theobold

MIT Licenced, see LICENCE.md

*/
Module.register("MMM-AirPollution", {

  requiresVersion: "2.2.0",

  defaults: {
      apiBase: "http://api.openweathermap.org/data/",
      apiVersion: "2.5",
      endPoint: "air-pollution",
      location: false,
      units: config.units,
      timeFormat: config.timeFormat,
      lang: config.language,
      updateInterval: 10 * 60 * 1000, // every 10 minutes
      animationSpeed: 1000,
      initialLoadDelay: 0, // 0 seconds delay
		  retryDelay: 2500,

      apiKey: "",         // Your unique API key (you can always find it on your account page under the "API key" tab)
      type: "",           // default = "" (options: /forecast, /history)
      lat: "",            // Latitude. If you need the geocoder to automatic convert city names and zip-codes to geo coordinates and the other way around, please use OpenWeatherMap Geocoding API
      lon: "",            // Longitude. If you need the geocoder to automatic convert city names and zip-codes to geo coordinates and the other way around, please use OpenWeatherMap  Geocoding API
      startDate: "",      // Start date (unix time, UTC time zone), e.g. start=1606488670 (/history only)
      endDate: "",        // End date (unix time, UTC time zone), e.g. end=1606747870 (/history only)
      updateInterval: 10, // minutes

      appendLocationNameToHeader: true,
		  useLocationAsHeader: false,

		  calendarClass: "calendar",
		  tableClass: "large",

    },



      // create a variable for the first upcoming calendar event. Used if no location is specified.
	    firstEvent: false,

	    // create a variable to hold the location name based on the API result.
	    fetchedLocationName: "",

      // Define required scripts.
	    getScripts: function() {
	      return ["moment.js"];
      },

  /**
   * Apply the default styles.
   */
  getStyles() {
    return ["MMM-AirPollution.css"]
  },

  /**
   * Pseudo-constructor for our module. Initialize stuff here.
   */
  start: function() {
    Log.info("Starting module: " + this.name);

    // set locale
    moment.locale(config.language)
    
    this.co = null      //  Сoncentration of CO (Carbon monoxide), μg/m3
    this.no = null      // Сoncentration of NO (Nitrogen monoxide), μg/m3
    this.no2 = null     // Сoncentration of NO2 (Nitrogen dioxide), μg/m3
    this.o3 = null      // Сoncentration of O3 (Ozone), μg/m3
    this.so3 = null     // Сoncentration of SO2 (Sulphur dioxide), μg/m3
    this.pm_25 = null   // Сoncentration of PM2.5 (Fine particles matter), μg/m3
    this.pm10 = null    // Сoncentration of PM10 (Coarse particulate matter), μg/m3
    this.nh3 = null     // Сoncentration of NH3 (Ammonia), μg/m3
    this.dt = null      // Date and time, Unix, UTC

    // set timeout for next random text
    setInterval(() => this.addRandomText(), 3000)
  },

  /**
   * Handle notifications received by the node helper.
   * So we can communicate between the node helper and the module.
   *
   * @param {string} notification - The notification identifier.
   * @param {any} payload - The payload data`returned by the node helper.
   */
  socketNotificationReceived: function (notification, payload) {
    if (notification === "EXAMPLE_NOTIFICATION") {
      this.templateContent = `${this.config.exampleContent} ${payload.text}`
      this.updateDom()
    }
  },

  /**
   * Render the page we're on.
   */
  getDom: function() {
    var wrapper = document.createElement("div")
    wrapper.className = this.config.tableClass;
    wrapper.innerHTML = `<b>Air Pollution</b><br />${this.templateContent}`

    if (this.config.apiKey === "") {
      wrapper.innerHTML = "OpeneWeatherMap API key is required, please set your <i>apiKey</> in the config for module: " + this.name + ".";
      wrapper.className = "dimmed light small";
      return wrapper
    }

    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small"
      return wrapper
    }

    var large = document.createElement("div");
    large.className = "light";


    return wrapper
  },

  // Override getHeader method

  getHeader: function() {
    if (this.config.useLocationAsHeader && this.config.location !== false) {
			return this.config.location;
   }

		if (this.config.appendLocationNameToHeader) {
			if (this.data.header) return this.data.header + " " + this.fetchedLocationName;
			else return this.fetchedLocationName;
		}

		return this.data.header ? this.data.header : "HEADER";
	},  

  // updateWeather()
  // Request data from OpenWeatheMap.org
  // calls processAQI on successfull response

  updateWeather: function() {
        if (this.config.apiKey === "") {
          Log.error.error("MMM-AirPollution: apiKey not set!");
          return;
        }

        var url = this.config.apiBase + this.config.api.Version + "/" + this.config.endPoint + this.getParams();
        var self = this;
        var retry = true;

        var aqiRequest = new XMLHttpRequest();
        aqiRequest.open("GET", url, true);
        aqiRequest.onreadystatechange = function() {
          if (this.readyState === "4") {
            if (this.status === "200") {
              var response = JSON.parse(this.response);
              self.processAQI(response);
            };
            aqiRequest.send();
          } else if (this.status === "401") {
                 self.updateDom(self.config.animationSpeed);
                 
                 Log.error(self.name + ": Incorrect apiKey.");
                 retry = true;
          } else {
            Log.error(self.name + ": could not load Air pollution data.");
          }

          if (retry) {
            self.scheduleUpdate((self.loaded) ? -1 : self.loaded.retryDelay);
          }

        };
        Log.info(self.name + ": URL " + this.url); 
        aqiRequest.send(); 
  },

  // getParams()
  // Generates an url with api parameters based on the config.
  //
  // return String - URL params.

  getParams: function() {
    var params = "?";
    if (this.firstEvent && this.firstEvent.geo) {
      params += "lat=" + this.firstEvent.geo.lat + "&lon=" + this.firstEvent.lon;
    } else {
      this.hide(this.config.animationSpeed, {lockString:this.identifier}); // ???
      return;
    }

    params += "&lang=" + config.units.lang;
    params += "&apiKey=" +config.units.apikey;
    return params;
  },

  // processAQI()   
  // set values from returned data
  //
  // argument data object - Air p;ollution data received from OpenWeatherMap.org
  //
  processAQI: function(data){
    if (!data || !data.main || typeof data.main.temp === "undefined") {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			return;
		}

    this.co = parseFloat(data.main.co);
    this.no = parseFloat(data.main.no);
    this.no2 = parseFloat(data.main.no2);
    this.o3 = parseFloat(data.main.o3);
    this.so3 = parseFloat(data.main.so3);
    this.pm_25 = parseFloat(data.main.pm_25);
    this.pm_10 = parseFloat(data.main.pm_10);
    this.nh3 = parseFloat(data.main.nh3);

    var date  = new Date(data.main.dt * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes(); 
    // Format time as hh:mm
    var receivedTime = hours + ":" + minutes(substr(-2));
    Log.info(self.name + "Data recieved time:" + receivedTime ); 
  }
})
