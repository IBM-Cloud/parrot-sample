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

function start(deviceId, apiKey, apiToken, mqttHost, mqttPort, callback) {
  var org = apiKey.split('-')[1];
  var clientId = ['d', org, 'drone', deviceId].join(':');
  var client = mqtt.connect("mqtt://" + mqttHost + ":" + mqttPort, {
              "clientId" : clientId,
              "keepalive" : 30,
              "username" : "use-token-auth",
              "password" : apiToken
            });
  callback(client, deviceId);
};

module.exports = function() {
  return {
    "connect" : function(callback) {
      properties.parse('./drone-config.properties', {path: true}, function(err, cfg) {
        if (err) {
          console.error('A file named done-config.properties containing the device registration from the IBM IoT Cloud is missing.');
          console.error('The file must contain the following properties: apikey, apitoken, authtoken, and deviceid.');
          throw e;
		    }
        var org = cfg.apikey.split('-')[1];
        start(cfg.deviceid, cfg.apikey, cfg.authtoken, org + '.messaging.internetofthings.ibmcloud.com', 
        '1883', callback);
      });	
	  }
  };
};