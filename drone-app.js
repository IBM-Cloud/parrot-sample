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

var mqtt = require('mqtt');
var properties = require('properties');

properties.parse('./drone-config.properties', {path: true}, function(err, cfg) {
    if (err) {
      console.error('A file named config.properties containing the device registration from the IBM IoT Cloud is missing.');
      console.error('The file must contain the following properties: apikey and apitoken.');
      throw e;
    }
    var org = cfg.apikey.split('-')[1];
    start(cfg.deviceid, cfg.apikey, cfg.apitoken, org + '.messaging.internetofthings.ibmcloud.com', 
      '1883');
  });

function start(deviceId, apiKey, apiToken, mqttHost, mqttPort) {
  var org = apiKey.split('-')[1];
  var clientId = ['a', org, deviceId].join(':');
  var client = mqtt.connect("mqtt://" + mqttHost + ":" + mqttPort, {
              "clientId" : clientId,
              "keepalive" : 30,
              "username" : apiKey,
              "password" : apiToken
            });
  client.on('connect', function() {
    console.log('MQTT client connected to IBM IoT Cloud.');
    var data = {
      d: {
        action : "#takeoffandland"
      }
    };
    client.publish('iot-2/type/parrot-ar/id/' + deviceId + '/cmd/fly/fmt/json', JSON.stringify(data), 
    function() {
      console.log('published');
      process.exit(0);
    });
  });
  client.on('error', function(err) {
    console.error('client error ' + err);
    process.exit(1);
  });
  client.on('close', function() {
    console.log('client closed');
    process.exit(1);
  });
};