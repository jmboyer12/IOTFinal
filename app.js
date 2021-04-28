const { createBluetooth } = require( 'node-ble' );
var io = require('socket.io-client')


// TODO: Replace this with your Arduino's Bluetooth address
// as found by running the 'scan on' command in bluetoothctl
const ARDUINO_BLUETOOTH_ADDR = '3B:E9:94:0F:79:00';

const UART_SERVICE_UUID      = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'; 
const TX_CHARACTERISTIC_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
const RX_CHARACTERISTIC_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';
const ESS_SERVICE_UUID = '0000181A-0000-1000-8000-00805F9B34FB';
const TEMP_CHARACTERISTIC_UUID = '00002A6E-0000-1000-8000-00805F9B34FB';


//comms: each type of code will be superceded by a character identifier
const stateManagement = 's';

var comms = {};
var socket = io.connect('https://iot-project-server.glitch.me/');
console.log("SocketIO ready");
    //SOCKETIO STUFF
socket.on('toggle', data => {
    if(comms.tx){
        comms.tx.writeValue(Buffer.from(stateManagement + '0')).then(()=>{console.log('toggle')}).catch(err =>{
            console.log('Error writing toggle: ' + err)
        });
    }    
})
// example of sending data to Dillon via PI
socket.on('increment', data => {
    if(comms.tx){
        comms.tx.writeValue(Buffer.from(stateManagement + '1')).then(()=>{console.log('increment')}).catch(err =>{
            console.log('Error writing increment: ' + err)
        });
    }
    
})

socket.on('decrement', data => {
    if(comms.tx){
        comms.tx.writeValue(Buffer.from(stateManagement + '2')).then(()=>{console.log('decrement')}).catch(err =>{
            console.log('Error writing decrement: ' + err)
        });
    }
})


async function main(){
    const { bluetooth, destroy } = createBluetooth();
    bluetooth.defaultAdapter().then(async adapter =>{
        await adapter.startDiscovery()
        return adapter;
    }).then(adapter => {
        console.log("discovering...")
        return adapter.waitDevice( ARDUINO_BLUETOOTH_ADDR.toLocaleUpperCase() );
    }).then(async device => {
        console.log('Found device');
        await device.connect();
        return device;
    }).then(device =>{
        console.log('Connected');
        return device.gatt();
    }).then(gattServer => {
        return gattServer.getPrimaryService( UART_SERVICE_UUID.toLowerCase() );
    }).then(async uartService => {
        comms.tx = await uartService.getCharacteristic( TX_CHARACTERISTIC_UUID.toLowerCase() );
        comms.rx = await uartService.getCharacteristic( RX_CHARACTERISTIC_UUID.toLowerCase() );
        console.log('Got UART');
        comms.rx.on('valuechanged', buffer =>{
            messageFromArduino(buffer);
        })
    }).catch(err => {
        console.log(err);
    })
}
main()
// FOR RICK
// this function is called everytime Dillon sends a message via UART
// TO DO: Parsing of some sort - dependent on the data being sent
const messageFromArduino = (buffer) => {
    console.log(buffer.toString());
}
/*
// FOR RICK
// TO DO: Need InfluxDB and have the ability to send stuff to the InfluxDB - See Lab 4
// Periodically poll Arduino for light intensity (DIMMER PERCENTAGE) and store returned value in InfluxDB
/**
 * In this example we'll create a server which has an index page that prints
 * out "hello world", and a page `http://localhost:3000/times` which prints
 * out the last ten response times that InfluxDB gave us.
 *
 * Get started by importing everything we need!
 */
/**
 const Influx = require("../../");
 const express = require("express");
 const http = require("http");
 const os = require("os");
 
 const app = express();
 
 /**
  * Create a new Influx client. We tell it to use the
  * `express_response_db` database by default, and give
  * it some information about the schema we're writing.
 const influx = new Influx.InfluxDB({
   host: "localhost",
   database: "express_response_db",
   schema: [
     {
       measurement: "response_times",
       fields: {
         path: Influx.FieldType.STRING,
         duration: Influx.FieldType.INTEGER,
       },
       tags: ["host"],
     },
   ],
 });
 
 /**
  * Next we define our middleware and hook into the response stream. When it
  * ends we'll write how long the response took to Influx!
  
 app.use((req, res, next) => {
   const start = Date.now();
 
   res.on("finish", () => {
     const duration = Date.now() - start;
     console.log(`Request to ${req.path} took ${duration}ms`);
 
     influx
       .writePoints([
         {
           measurement: "response_times",
           tags: { host: os.hostname() },
           fields: { duration, path: req.path },
         },
       ])
       .catch((err) => {
         console.error(`Error saving data to InfluxDB! ${err.stack}`);
       });
   });
   return next();
 });
 
 app.get("/", function (req, res) {
   setTimeout(() => res.end("Hello world!"), Math.random() * 500);
 });
 
 app.get("/times", function (req, res) {
   influx
     .query(
       `
     select * from response_times
     where host = ${Influx.escape.stringLit(os.hostname())}
     order by time desc
     limit 10
   `
     )
     .then((result) => {
       res.json(result);
     })
     .catch((err) => {
       res.status(500).send(err.stack);
     });
 });
 
 /**
  * Now, we'll make sure the database exists and boot the app.
  
 influx
   .getDatabaseNames()
   .then((names) => {
     if (!names.includes("express_response_db")) {
       return influx.createDatabase("express_response_db");
     }
   })
   .then(() => {
     http.createServer(app).listen(3000, function () {
       console.log("Listening on port 3000");
     });
   })
   .catch((err) => {
     console.error(`Error creating Influx database!`);
   });
   */