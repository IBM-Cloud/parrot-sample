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
var rollingSpider = require('rolling-spider');
var spider = rollingSpider.createClient();

console.log('Connecting...');
spider.connect(function() {
	console.log('Connected to the Drone!');
	spider.setup(function() {
		spider.startPing();
	});

	mqtt.connect(function(client, deviceId) {
		client.on('connect', function() {
			console.log('MQTT client connected to IBM IoT Cloud.');
			console.log('Connected Drone ID: ' + deviceId);
			client.subscribe('iot-2/cmd/fly/fmt/json', {
				qos : 0
			}, function(err, granted) {
				if (err) {
					throw err;
				}
				console.log("subscribed");
			});
		});

		client.on('message', function(topic, message, packet) {
			console.log(topic);
			var msg = JSON.parse(message.toString());
			console.log(msg);
			if (msg.d.action === '#takeOff') {
				console.log('take off');
				spider.flatTrim();
				spider.takeOff();
			}
			else if (msg.d.action === '#frontFlip') {
				console.log('Front flip');
				spider.frontFlip();
			}
			else if (msg.d.action === '#land') {
				console.log('land');
				spider.land();
				spider.flatTrim();
			}
			else if (msg.d.action === '#takePicture') {
				console.log('takePicture');
				spider.takePicture();

			}
		});
	});

});
