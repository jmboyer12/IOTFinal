const { createBluetooth } = require( 'node-ble' );
var io = require('socket.io-client')

// TODO: Replace this with your Arduino's Bluetooth address
// as found by running the 'scan on' command in bluetoothctl
const ARDUINO_BLUETOOTH_ADDR = '67:66:24:8B:8E:00';

const UART_SERVICE_UUID      = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'; 
const TX_CHARACTERISTIC_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
const RX_CHARACTERISTIC_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';
const ESS_SERVICE_UUID = '0000181A-0000-1000-8000-00805F9B34FB';
const TEMP_CHARACTERISTIC_UUID = '00002A6E-0000-1000-8000-00805F9B34FB';


async function main(){

    //BLUETOOTH CONNECTION
     // Attempt to connect to the device with specified BT address
    //  const device = await adapter.waitDevice( ARDUINO_BLUETOOTH_ADDR.toUpperCase() );
    //  console.log( 'found device. attempting connection...' );
    //  await device.connect();
    //  console.log( 'connected to device!' );
 
    //  // Get references to the desired UART service and its characteristics
    //  const gattServer = await device.gatt();
    //  const uartService = await gattServer.getPrimaryService( UART_SERVICE_UUID.toLowerCase() );
    //  const txChar = await uartService.getCharacteristic( TX_CHARACTERISTIC_UUID.toLowerCase() );
    //  const rxChar = await uartService.getCharacteristic( RX_CHARACTERISTIC_UUID.toLowerCase() );
    //  const essService = await gattServer.getPrimaryService( ESS_SERVICE_UUID.toLowerCase() );
    //  const tempChar = await essService.getCharacteristic( TEMP_CHARACTERISTIC_UUID.toLowerCase() );



    //SOCKETIO STUFF
    var socket = io.connect('https://iot-project-server.glitch.me/');

    socket.on('toggle', data => {
        console.log('toggle');
    })

    socket.on('increment', data => {
        console.log('increment');
    })

    socket.on('decrement', data => {
        console.log('decrement');
    })
}
main();
