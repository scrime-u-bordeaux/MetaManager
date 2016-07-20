"use strict";

var LimitedStack = require('../utility/LimitedStack');
var Command = require('./Command');
var Vector = require('../utility/Vector');
var SceneElement = require('../scene/SceneElement');

var VELOCITY_FACTOR = 10;

class Robot{

    constructor(){
        //Default name uh
        this.name = "Jabberwockie";
        
        this.commands = new LimitedStack(20, new Command("start"));

        this.sceneElement = new SceneElement();

        this.started = false;

    }

    setUp(options){
        if(options){

            this.name = options.name;
            this.circumference = options.circumference || 0;
            this.legs = options.legs || 0;
            this.size = options.size || 0;

            this.valuesQty = 7;

            this._values = {
                'h':0,
                'r':0,
                'dx':0,
                'dy':0,
                'alt':0,
                'freq':0
            };
            this._version = "1.1.1";

            this.setUpSceneElement(options);

            return this;
        }else{
            return undefined;
        }
    }

    setUpSceneElement(options){
        this.sceneElement.setBody({
            mass:1,
            type: 'cube',
            values:{
                width: options.size || 45,
                height:options.size || 45,
                depth:options.size || 45
            },
            position:{
                x: 1,
                y: 46,
                z: 1
            }
        });
        this.sceneElement.setMesh({
            material: {
                type: "phong",
                color: options.color || 0xffffff
            },
            type: "box",
            width: options.size || 45*2,
            height: options.size || 45*2,
            depth: options.size || 45*2,
            widthSeg: 10,
            heightSeg: 10,
            castShadow: true,
            receiveShadow: true
        })
    }

    hasBeenUpdated(){
        if(this.valuesQty === 0){
            this.valuesQty = 7;
            return true;
        }else{
            return false;
        }
    }

    modifyValue(name, value){
        if(name === 'version')
            this._version = value;
        else
            this._values[name] = parseInt(value);
        this.valuesQty -= 1;
    }

    modify(options){
        this.name = options.name || this.name;
        this.size = options.size || this.size;
        this.circumference = options.circumference || this.circumference;
        this.legs = options.legs || this.legs;
        //this.position.copy(options.position);
    }

    addExecutedCommand(command){
        this.commands.add(command);
    }

    getExecutedCommands(){
        return this.commands;
    }
    
    getLastCommand(){
        return this.commands.head();
    }

    executeCommand(cmd) {
        this.addExecutedCommand(cmd);
        switch(cmd._command.cmd){
            case "dx":
                this.velocity = { x: cmd._args / VELOCITY_FACTOR };
                break;
            case "dy":
                this.velocity = { z: cmd._args / VELOCITY_FACTOR };
                break;
        }
    }

    get position(){
        return this.sceneElement.body.position;
    }

    get velocity(){
        return Robot.VectorTimes(this.sceneElement.body.velocity, VELOCITY_FACTOR);
    }

    set velocity(velocity){
        if(velocity){
            this.sceneElement.setVelocity(velocity);
        }
    }

    static VectorTimes(vector, times){
        let vec = vector;
        vec.x *= times;
        vec.y *= times;
        vec.z *= times;
        return vec;
    }
}
module.exports = Robot;