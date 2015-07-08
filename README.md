# Parrot Drone Sample

This repository contains sample code that demonstrates how you would control
a Parrot Drone using MQTT, the IBM IoT Foundation, and the [node-ar-drone](https://github.com/felixge/node-ar-drone) module or the [node-bebop](https://github.com/hybridgroup/node-bebop) module.

# Running The Sample

## Hardware
You will need a Parrot AR Drone or a Parrot Bebop Drone and 2 network adapters on your computer, one network adapter with a connection to the WiFi network for the drone and another network adapter with a connection to the internet.  At least one network adapter needs to be a WiFi adapter since the Parrot drones emits a WiFi hotspot.

## Getting The Code

`$ git clone https://github.com/IBM-Bluemix/parrot-sample.git`

## Setting Up The Sample

You will need to create an instance of the [IBM IoT Foundation](https://console.ng.bluemix.net/?ace_base=true/#/store/cloudOEPaneId=store&serviceOfferingGuid=8e3a9040-7ce8-4022-a36b-47f836d2b83e&fromCatalog=true) service in Bluemix.  Within the IoT Foundation dashboard your need to register a device as well as an app.

1. Click the Devices tab and click Add Device.  
2. Create a new Device Type called "drone".  
3. In the Device ID field enter a unique ID for your drone.  
4. Click Continue

On the next screen you will see information about the device you registered.  Make note of the auth-token field as you will need that to run the sample.

1.  Click on the API Keys tab
2.  Click the New API Key link
3.  You will see a Key and Auth Token displayed.

Take note of the Key and the Auth Token as you will need these to run the samples.

In the root of the repository you cloned create a new file called `drone-config.properties`.  In this properties file add the following properties.

```
#Device ID you use when you register with the IoT foundation
deviceid=yourdroneid

#For controller (device)
authtoken=yourauthtoken
#For the app (publisher)
apikey=yourapikey
apitoken=yourapitoken
```

Replace the values of the deviceid, authtoken, apikey, and apitoken with the values you got when creating the device and app in the IoT Dashboard.

Now you are ready to run the code.

Open a terminal window, `cd` to the root of the repository, and run `npm install` to install all the dependencies.

Now start up the controller code by running `node parrot-ar-drone-controller.js`
if you have a Parrot AR Drone or `node bebop-drone-controller.js` 
if you have a Parrot Bebop.  This is the JavaScript code that controls the drone.

Next start up the app code by running `node drone-app.js`.  This is the JavaScript code which issues MQTT commands to the drone.  By default this will issue a command for the drone to take off and then immediately land.

Technically the `parrot-ar-drone-controller.js` and `bebop-drone-controller.js` can be run on a different machine than `drone-app.js`.

## Node-RED

The `drone-app.js` file can be replaced by a Node-RED flow if you want.  Here is a sample flow that issues the same commands as `drone-app.js` does.

```
[{"id":"989a15c.9f4b568","type":"ibmiot out","authentication":"boundService","apiKey":"","outputType":"cmd","deviceId":"yourdeviceid","deviceType":"drone","eventCommandType":"fly","format":"json","data":"___","name":"IBM IoT App Out","service":"registered","x":594,"y":285,"z":"9205662f.9e3728","wires":[]},{"id":"dbf179a1.a9a028","type":"inject","name":"take off and land","topic":"","payload":"","payloadType":"none","repeat":"","crontab":"","once":false,"x":225,"y":357,"z":"9205662f.9e3728","wires":[["2e802bb3.dd1e9c"]]},{"id":"2e802bb3.dd1e9c","type":"function","name":"","func":"msg.payload = JSON.stringify({\n    d: {\n        action : \"#takeoffandland\"\n      }\n});\nreturn msg;","outputs":1,"valid":true,"x":410,"y":358,"z":"9205662f.9e3728","wires":[["989a15c.9f4b568"]]},{"id":"bd32f7cd.b170c","type":"inject","name":"take off","topic":"","payload":"","payloadType":"none","repeat":"","crontab":"","once":false,"x":224,"y":210,"z":"9205662f.9e3728","wires":[["d8008372.a9e1d8"]]},{"id":"d8008372.a9e1d8","type":"function","name":"","func":"msg.payload = JSON.stringify({\n    d: {\n        action : \"#takeoff\"\n      }\n});\nreturn msg;","outputs":1,"valid":true,"x":383,"y":211,"z":"9205662f.9e3728","wires":[["989a15c.9f4b568"]]},{"id":"a1703893.5af8c","type":"inject","name":"land","topic":"","payload":"","payloadType":"none","repeat":"","crontab":"","once":false,"x":212,"y":282,"z":"9205662f.9e3728","wires":[["b22fc6df.076ec"]]},{"id":"b22fc6df.076ec","type":"function","name":"","func":"msg.payload = JSON.stringify({\n    d: {\n        action : \"#land\"\n      }\n});\nreturn msg;","outputs":1,"valid":true,"x":374,"y":286,"z":"9205662f.9e3728","wires":[["989a15c.9f4b568"]]}]
```

You can copy the above JSON and import it into a Node-RED instance on Bluemix.  (Make sure you have the IoT service you created bound to your Node-RED instance.)  Once you have imported the flow you will need to double click on the IBM IoT node to open the configuration properties and replace the device ID with the device ID you registered your drone with in Bluemix.

# Supported Commands

The `drone-app.js` file just makes the drone take off and then land immediately as a demonstration
of what you can do to control the drone.  In other words it is just a start.  `drone-controller.js`
supports other commands besides just take off and land.  Here is what is supported out of the box.

* Take off and land
* Take off
* Land
* Take A Picture - The picture command is not yet supported with the Bebop drone

To issue these commands to the drone you publish a command over MQTT on the topic
`iot-2/type/drone/id/<deviceid>/cmd/fly/fmt/json` replacing <deviceid> with the 
device ID of the drone you want to control.  You need to publish a JSON payload
which should look like 

```
{
  d: {
    action : "#takeoffandland"
  }
}
```

Replace the `action` property with whatever command you want the drone to execute.  The supported
actions are `#takeoff`, `#land`, `takeoffandland`, and `#takepicture`.  For more information on
using MQTT and publishing commands you can check out the documentation on the IoT Foundation 
[website](https://developer.ibm.com/iotfoundation/recipes/improvise-application-development/).

## Supporting Using The Camera

In order to use the camera on the drone you need to have FFMPEG installed and running on your
machine.  You can download FFMPEG from their [site](https://www.ffmpeg.org/).  If you don't
install FFMPEG you will get an error saying that the library is required when running 
`drone-controller.js`.

# Extending

`parrot-ar-drone-controller.js` and `bebop-drone-controller.js` are just a sampling of what you can do to control the drone programmatically.
Essentially `*-drone-controller.js` just providing an MQTT wrapper around the Node.js library used
to talk to the drone.  You can extend `*-drone-controller.js` with other commands that use the
Node.js library to control the drone.  Just modify the source and use the API documented in the
GitHub repos for the [Parrot AR Drone](https://github.com/felixge/node-ar-drone) or for the [Bebop Drone](https://github.com/hybridgroup/node-bebop).