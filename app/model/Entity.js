"use strict";

var Device = require('../model/devices/Device');
var Robot = require('./robot/Robot');
var Command = require('./robot/Command');
var SceneElement = require('../model/scene/SceneElement');


class Entity {

    /**
     * Function to initialize by default an entity, with an id
     * @param id
     */
    constructor(id) {
        this.id = id;

        this.robot = new Robot();
        this.device = new Device.Device(this.id);
    }

    /**
     * To set up a robot, needs at least a name
     * @param options
     * @returns {*}
     */
    setUpRobot(options) {
        return this.robot.setUp(options);
    }

    /**
     * To set up a device, needs a BluetoothDevice for bluetooth, and an address and a port for OSCDevice
     * @param options
     * @returns {Device}
     */
    setUpDevice(options) {
        if (options.bluetooth) {
            this.device.setUp(Device.type.bluetooth, options.bluetooth);
        }
        if (options.osc) {
            this.device.setUp(Device.type.osc, options.osc);
            this.device.enable(Device.type.osc);
        }
        /*if (options.xbee) {
            this.device.setUpXBee(options.xbee);
        }*/

        return this.device;
    }

    /**
     * Method to switch an OSC server listening state
     */
    switchOSCState() {
        this.device.switchOSCState();
    }

    /**
     * To disable a device
     */
    disableDevice() {
        this.device.disable();
    }

    toggleRobotState(){
        if(this.robot.started === false){
            this.executeCommand({command: 'start'}, false);
            this.robot.started = true;
        }else{
            this.executeCommand({command: 'stop'}, false);
            this.robot.started = false;
        }
    }

    /**
     * Method to set deviceListeners according to functions to which will be sent datas to be analyzed
     * @param bluetooth
     * @param osc
     */
    setUpDeviceListeners(bluetooth, osc){
        this.device.setUpListeners(bluetooth, osc);
    }

    /**
     * Function to modify an entity according to options
     * @param options
     */
    modify(options){
        if(options.robot){
            this.robot.modify(options.robot);
        }
        if(options.device.osc || options.device.bluetooth){
            this.device.modify({osc: options.device.osc, bluetooth: options.device.bluetooth});
        }
        if(options.color){
            this.sceneElement.setColor(options.color);
        }
    }

    /**
     * Method to send bluetooth data
     * @param data
     */
    sendBluetoothData(data){
        this.device.send(Device.type.bluetooth, data);
    }

    /**
     * Function to execute a command. Verify option will try to see if the last command sent is exactly the same as the
     * one sent here. If so, it will ignore the command. 
     * @param command
     * @param verify
     */
    executeCommand(command, verify){
        var cmd = new Command(command.command, command.value);
        try {
            if(verify === true){
                if(this.robot.getLastCommand().equals(cmd) === false) {
                    this.device.executeCommand(cmd.execute());
                    this.robot.executeCommand(cmd);
                }
            }else{
                this.device.executeCommand(cmd.execute());
                this.robot.executeCommand(cmd);
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Function to update values from a bluetooth message
     * @param message
     */
    updateRobotValuesFromBluetooth(message){
        if(message.args === undefined && this.askingInformations === true){
            var response = Entity.parseBlueResponse(message.response);
            this.robot.modifyValue(response.cmd, response.value);
            console.log('updated ' + message.cmdSent + " : " + response.value);
        }
    }

    /**
     *
     * @param response
     * @returns {{cmd: *, value: *}}
     */
    static parseBlueResponse(response){
        var changed = response.replace('\r\n', '');
        return {
            cmd: changed.split('=')[0],
            value: changed.split('=')[1]
        };
    }

    /**
     * Function to ask robot's informations
     */
    askRobotInformations(){
        this.askingInformations = true;
        var commands = ['h', 'r', 'alt', 'freq', 'dx', 'dy', 'version'];
        var self = this;

        commands.forEach(function(e){
            self.executeCommand({command: e}, false);
        });

        var finished = function(e){
            if(self.robot.hasBeenUpdated() === true){
                document.dispatchEvent(new CustomEvent("askedInfo", {'detail': self.robot._values}));
                self.askingInformations = false;
            }else{
                setTimeout(finished, 1000);
            }
        };

        setTimeout(finished, 1500);
    }

    /**
     * Modifier of values from view, and updater of values of the robot
     * @param name
     * @param value
     */
    modifyRobotBasicValue(name, value){
        this.robot.modifyValue(name, value);
        this.executeCommand({command: name, value: value});
    }
}

module.exports = Entity;