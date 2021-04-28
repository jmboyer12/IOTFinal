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
// FOR RICK
// TO DO: Need InfluxDB and have the ability to send stuff to the InfluxDB - See Lab 4
// Periodically poll Arduino for light intensity (DIMMER PERCENTAGE) and store returned value in InfluxDB