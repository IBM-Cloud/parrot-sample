//------------------------------------------------------------------------------
// Copyright IBM Corp. 2015
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

var mqtt = require('./mqtt-wrapper.js')();
var arDrone = require('ar-drone'); 
var drone = arDrone.createClient(); 
var request = require('request');

var pngStream = drone.getPngStream();
pngStream.on('error', console.log);

var latestPng;
pngStream.on('data', function(png) {
  latestPng = png;
});

mqtt.connect(function(client, deviceId) {
  client.on('connect', function() {
    console.log('MQTT client connected to IBM IoT Cloud.');
    client.subscribe('iot-2/cmd/fly/fmt/json', {qos : 0}, function(err, granted) {
      if (err) throw err;
      console.log("subscribed");
    });

    // We only want to sample drone data one a second,
    // default data rate is way too fast.
    var handle_navdata = function (navdata) {
      // Sometimes battery data is missing, look for next event.
      if (!navdata.demo) return drone.once('navdata', handle_navdata);

      console.log("GPS: " + JSON.stringify(navdata.gps))
      console.log("Battery percentage: " + navdata.demo.batteryPercentage + "%");
      client.publish('iot-2/type/drone/id/' + deviceId + '/data/battery', 
        navdata.demo.batteryPercentage, function () {
          console.log("Battery percentage published.")
      }); 

      setTimeout(function () {
        drone.once('navdata', handle_navdata);
      }, 60 * 1000)
    };

    drone.once('navdata', handle_navdata);
    drone.config('general:navdata_demo', 'FALSE');

  });
  client.on('error', function(err) {
    console.error('client error ' + err);
    process.exit(1);
  });
  client.on('close', function() {
    console.log('client closed');
    process.exit(1);
  });

  client.on('message', function(topic, message, packet) {
   console.log(topic);
   var msg = JSON.parse(message.toString());
   if(msg.d.action === '#takeoff') {
     console.log('take off');
     drone.disableEmergency();
     drone.config('control:altitude_max', 2000);
     drone.takeoff();
   } else if(msg.d.action === '#land') {
     console.log('land');
     drone.stop();
     drone.land();
   } else if(msg.d.action === '#up') {
     console.log('up');
     drone.stop();
     drone.up(0.2);
     setTimeout(function() {
       drone.stop();
     }, 2000);
   } else if(msg.d.action === '#down') {
     console.log('down');
     drone.stop();
     drone.down(0.2);
     setTimeout(function() {
       drone.stop();
     }, 1000);
   } else if(msg.d.action === '#rotatec') {
     console.log('rotatec');
     drone.stop();
     drone.clockwise(0.2);
     setTimeout(function() {
       drone.stop();
     }, 1000);
   } else if(msg.d.action === '#rotatecc') {
     console.log('rotatecc');
     drone.stop();
     drone.counterClockwise(0.2);
     setTimeout(function() {
       drone.stop();
     }, 1000);
   } else if(msg.d.action === '#takeoffandland') {
     console.log('take off and land');
     var length = msg.d.length ? msg.d.length : 3000;
     drone.disableEmergency();
     drone.takeoff();
     setTimeout(function() {
       drone.stop();
       drone.land();
     }, length);
   } else if(msg.d.action === '#takepicture') {
    console.log('take a picture');
    pngStream = drone.getPngStream();
    if(!latestPng) {
      console.log('No images yet');
      var options = {
        uri: msg.d.callback,
        method: 'POST',
        json: {
          "error" : "No image"
        }
      };
      request(options, function (error, response, body) {});
    } else {
      var formData = {
        my_file: {
          value: latestPng,
          options: {
            filename: 'picture.png',
            contentType: 'image/png'
          }
        }
      };
      request.post({uri: msg.d.callback, formData: formData}, function(err, httpResponse, body) {
        if(err) {
          console.log("error posting picture " + err);
        } else {
          console.log('Picture uploaded');
        }
      });
    }
  }
 });
});
