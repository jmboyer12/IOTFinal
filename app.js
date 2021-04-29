const { createBluetooth } = require( 'node-ble' );
var io = require('socket.io-client')

// import/reference to the library
const Influx = require("influx");
const os = require('os')
const http = require('http');

// TODO: Replace this with your Arduino's Bluetooth address
// as found by running the 'scan on' command in bluetoothctl
const ARDUINO_BLUETOOTH_ADDR = '67:66:24:8B:8E:00';

const UART_SERVICE_UUID      = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'; 
const TX_CHARACTERISTIC_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
const RX_CHARACTERISTIC_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';
const ESS_SERVICE_UUID = '0000181A-0000-1000-8000-00805F9B34FB';
const TEMP_CHARACTERISTIC_UUID = '00002A6E-0000-1000-8000-00805F9B34FB';
const dimming_measurement = 'dimming_intensity';

//comms: each type of code will be superceded by a character identifier
const stateManagement = 's';
const intensity_poll = 'p';
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
        await comms.rx.startNotifications( );
        comms.rx.on('valuechanged', buffer =>{
          //console.log(buffer.toString());
          messageFromArduino(buffer);
        })
    }).catch(err => {
        console.log(err);
    })
}
main()

const messageFromArduino = (buffer) => {
    //console.log(buffer.toString());
    if(buffer[0] == 's'){
        // mess with later
    }
    // check if the buffer contains the dimming_intensity 
    else if (buffer.toString().charAt(0) == 'p'){
        const arduinoMessage = buffer.toString();
        const messageParse = parseInt(arduinoMessage.slice(1)) 
        console.log(messageParse);
        writeToInflux(messageParse);
    }
}

// function used to first verify the influx server is created and then will write to the influxdb database
const writeToInflux = (dimming_intensity) => {
    // verify the influx server exists
    if(!influx){
        return;
    }
    influx.writePoints([
        {
          measurement: 'user1',
          tags: { host: os.hostname() },
          fields: { dimming_measurement: dimming_intensity },
        }
      ]).then(()=>{
        return true;
      }).catch(err => {
        console.error(`Error saving data to InfluxDB! ${err.stack}`)
      })
}

const queryInflux = () => {
    if(!influx){
        return;
    }
    influx.query(
        `select * from user1`
    )
    .then(result => {
        result.forEach(row => console.log(row.dimming_measurement))
    })
    .catch(err => {
        console.log(err)
    })
}
// Periodically (currently set to 10 seconds) poll Arduino for light intensity and store returned value in InfluxDB
setInterval(() => {
    // transmit to Arduino requesting light intensity :)
    if(comms.tx){
        comms.tx.writeValue(Buffer.from(intensity_poll)).then(()=>{console.log('Intensity Poll: ')}).catch(err =>{
            console.log('Error transmitting ' + err)
        });
    }
}, 10000);

// FOR RICK


 const influx = new Influx.InfluxDB({
   host: "localhost",
   database: "light_readings_db",
   schema: [
     {
       measurement: "user1",
       fields: {
         dimming_measurement: Influx.FieldType.FLOAT,
       },
       tags: ["host"],
     },
   ],
 });


 influx.getDatabaseNames()
   .then((names) => {
     if (!names.includes("express_response_db")) {
       return influx.createDatabase("express_response_db");
     }
   })
   .catch((err) => {
     console.error(`Error creating Influx database!` + err);
   });
   


   

/** 
    // More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

    // the link to your model provided by Teachable Machine export panel
    const URL = "./my_model/";

    let model, webcam, labelContainer, maxPredictions;

    // Load the image model and setup the webcam
    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }
    }

    async function loop() {
        webcam.update(); // update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }

    // run the webcam image through the image model
    async function predict() {
        // predict can take in an image, video or canvas html element
        const prediction = await model.predict(webcam.canvas);
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
    }
*/



//Evan test