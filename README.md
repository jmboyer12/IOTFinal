# IOTFinal
## Installation
* cd into the desired folder
* run "git clone https://github.com/jmboyer12/IOTFinal.git"
* this will create the folder IOTFinal
* in it should contain app.js, package.json, and README.txt
* cd into that folder and run "npm install" in the command line

## Test Run
* in the IOTFinal folder run "npm start" in the command line
* on your phone go to "https://iot-project-server.glitch.me/"
* click on any of the buttons on the website and the name of the button should log on the pi console

## If you didn't install the bluetooth library in lab 3 on your pi, this will probably fail and you'll have to do that
* sudo apt-get update
* sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
* npm install (From IOTFinal folder)
