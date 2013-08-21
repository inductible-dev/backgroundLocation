/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    deviceId: 0,
	passcode:0,
    GPSWatchId: null,
	timeLastSubmit:0,
	
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.initFastClick();
        this.initUserId();
		this.initPasscode();
        this.initView();
		app.timeLastSubmit = (new Date().getTime() / 1000);
    },
    initFastClick: function () {
        window.addEventListener('load', function() {
                                FastClick.attach(document.body);
                                }, false);
    },
    initUserId: function() {
        var permanentStorage = window.localStorage;
        this.deviceId = permanentStorage.getItem("deviceId");
        if (this.deviceId === null) {
            permanentStorage.setItem("deviceId", Math.floor((Math.random()*100000)));
            this.deviceId = permanentStorage.getItem("deviceId");
        }
    },
	initPasscode: function() {
        var permanentStorage = window.localStorage;
        this.passcode = permanentStorage.getItem("passcode");
		var passcodeText='';
        if (this.passcode === null) {
            passcodeText ='';
        }
		else{
			passcodeText = this.passcode;
		}
		$('#userPasscode').val(passcodeText);
    },
    initView: function() {
        if (this.passcode === null) {
            $('#settingsPage #enterPasswordInstruction').show();
            $('#statusPage').hide();
            $('#settingsPage').show();
        }
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // The scope of 'this' is the event.
    onDeviceReady: function() {
        app.checkConnection();
        app.initGPSToggleListener();
        app.startGPS();
    },
    initGPSToggleListener: function() {
        $('#locationToggle').click(function ()
         {
             if (this.checked) {
                app.startGPS();
             }
             else {
                app.stopGPS();
             }
         });
    },
    startGPS: function() {

        app.GPSWatchId = navigator.geolocation.watchPosition(app.onSuccess, app.onError, {enableHighAccuracy: false, timeout: 1000*60*2 , maximumAge: 5*1000 });
    },
    stopGPS: function() {
        navigator.geolocation.clearWatch(app.GPSWatchId);
    },
    checkConnection: function() {
        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown';
        states[Connection.ETHERNET] = 'Ethernet';
        states[Connection.WIFI]     = 'WiFi';
        states[Connection.CELL_2G]  = 'Cell 2G';
        states[Connection.CELL_3G]  = 'Cell 3G';
        states[Connection.CELL_4G]  = 'Cell 4G';
        states[Connection.CELL]     = 'Cell';
        states[Connection.NONE]     = 'No';
        
        elem = document.getElementById('connectionInfo');
        elem.innerHTML = 'Internet: ' + states[networkState];
    },
    onSuccess: function(position) {
        app.position = position;
        app.submitToServer();
        
        elem = document.getElementById('locationInfo');
        var hours = position.timestamp.getHours();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        
        elem.innerHTML = ('Latitude: '   + position.coords.latitude.toFixed(3)  + '<br/>' +
              'Longitude: '         + position.coords.longitude.toFixed(3)         + '<br/>' +
              'Last Update: '         + hours + ':' + position.timestamp.getMinutes() +':'+ position.timestamp.getSeconds()+ ' ' + ampm);
    },
    onError: function(error) {
        elem = document.getElementById('locationInfo');
        elem.innerHTML = ('There is an error with the GPS.');
        console.log('error with GPS: error.code:'+error.code    + ' and error message: ' + error.message);
		
		//30 minutes without gps succeeding.
		if(((new Date().getTime() / 1000)- app.timeLastSubmit ) > 60*30){
			alert('GPS error. Please check your gps settings.');
			app.timeLastSubmit = (new Date().getTime() / 1000);
		}
    }
};

$("#userPasscode").focusout(function () {
     var permanentStorage = window.localStorage;
     permanentStorage.setItem("passcode", $("#userPasscode").val());
    this.passcode = $("#userPasscode").val();
    if ($("#userPasscode").val() !== "" && $('#settingsPage #enterPasswordInstruction').is(":visible")) {
                            $('#settingsPage #enterPasswordInstruction').hide();
    }
});

$(document).delegate('.ui-navbar a', 'click', function () {
                     $(this).addClass('ui-btn-active');
                     $('.content_div').hide();
                     $('#' + $(this).attr('data-href')).show();
                     });
