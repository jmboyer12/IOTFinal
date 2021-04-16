# IOTFinal
## Installation (On the PI)
* cd into the desired folder
* run "git clone https://github.com/jmboyer12/IOTFinal.git"
* this will create the folder IOTFinal
* in it should contain app.js, package.json, and README.txt
* cd into that folder and run "npm install" in the command line

## Test Run
* install npm first
* in the IOTFinal folder run "npm start" in the command line
* on your phone go to "https://iot-project-server.glitch.me/"
* click on any of the buttons on the website and the name of the button should log on the pi console

## If you didn't install the bluetooth library in lab 3 on your pi, this will probably fail and you'll have to do that
* sudo apt-get update
* sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
* npm install (From IOTFinal folder)

## Pushing to Repository (in terminal in IOTFinal folder)
### The first time 
* run "git config --global user.email "Your github email"
* run "git config --gloabl user.name "Your github username"
### The rest
* run "git commit -m"Your commit message"
* run "git push origin master"
* if first time will ask you to sign in, do it

##Pulling from the repository (do it before pushing)
* run "git pull origin master"
