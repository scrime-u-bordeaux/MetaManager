/**
 * THE SUPERVISORS
 *
 * A supervisor is a unity able to analyse a set of robot it has, and to modify their velocities in order to control
 * them.
 *
 * A supervisor is inherited from the main abstract class which gives 3 main functions : step(), onEntityOrder() and
 * onOSCMessage(). The first is called at each tick of the theorical 3D world. The second is called when one of
 * the robots it controls receives a message. It is a way to filter them. Finally lasts onOSCMessage which is received
 * by the supervisor in itself. A supervisor has an OSCListener so it is able to communicate through OSC as a full entity.
 *
 * To create a supervisor, create your class and extend the Supervisor. Then to register it you need to add it in
 * the Supervisor.js file array, and finally in this file export it with the name you gave in the array. See already made
 * supervisors to have an example. See Supervisor.js to see already implemented functions.
 *
 */

"use strict";
var Supervisor = require('./Supervisor').Supervisor;
var Types = require('./Supervisor').Types;

var Vector = require('../Utility').Vector;

var exports = module.exports = {};

/**
 * SimpleSupervisor is simple ... It just inverts robot's velocity when it touches the bounds of the defined zone.
 */
class SimpleSupervisor extends Supervisor{
    constructor(name, groundSize){
        super(name, groundSize);
    }

    step() {
        for(let key of this.robots.keys()) {
            if (this.robots.size > 0) {
                var out = this.isOutOfBounds(key);

                if (out.x === true) {
                    this.setRobotVelocity(key, {x: -this.robots.get(key).velocity.x});
                }
                if (out.z === true) {
                    this.setRobotVelocity(key, {z: -this.robots.get(key).velocity.z});
                }
                if (out.y === true) {
                    this.setRobotVelocity(key, {y: -this.robots.get(key).velocity.y});
                }
            }
        }
    }

    onEntityOrder(message){
        super.onEntityOrder(message);
    }

    onOSCMessage(message){
        super.onOSCMessage(message);
    }
}

exports[Types.Simple] = SimpleSupervisor;


/**
 * From http://www.kfish.org/boids/pseudocode.html
 * Trying to implement boids algorithm for metabots and drones.
 */
class BoidSupervisor extends Supervisor{
    constructor(name, groundSize){
        super(name, groundSize);

        this.freeBoids = true;
    }

    step(){
        if(this.freeBoids === true) {
            //Move boids to new position
            var v1, v2, v3, v4;

            for (let key of this.robots.keys()) {
                v1 = this.moveTowardsCenter(key);
                v2 = this.keepSmallDistanceRule(key).invert();
                v3 = this.matchVelocityRule(key);
                v4 = this.boundingPositionRule(key);

                console.log("Robot : " + this.robots.get(key).position + " : " + Vector.VectorAdd(this.robots.get(key).velocity, v1, v3, v4).toString());
                this.robots.get(key).velocity = Vector.VectorAdd(this.robots.get(key).velocity, v1, v3, v4);
                console.log("Robot velocity : " + this.robots.get(key).velocity.x + "," + this.robots.get(key).velocity.z);
            }
        }
    }

    onEntityOrder(message){
        super.onEntityOrder(message);
    }

    onOSCMessage(message){
        //super.onOSCMessage(message);

        this.freeBoids = true;
    }

    /**
     * First rule for boids, we try to make all of them moving towards the center position of each boid's position
     * @param boid
     * @returns {*}
     */
    moveTowardsCenter(boid){
        var vec = new Vector();

        for(let key of this.robots.keys()){
            if(key !== boid){
                vec = Vector.VectorAdd(vec, this.robots.get(key).position);
            }
        }

        vec = Vector.VectorDiv(vec, this.robots.size - 1 );

        return Vector.VectorDiv(Vector.VectorSub(vec, this.robots.get(boid).position), 10);
    }

    /**
     * Second rule, we try to keep a small distance between each boid (doesn't seem to work correctly)
     * @param boid
     * @returns {*|Vector}
     */
    keepSmallDistanceRule(boid){
        var vec = new Vector();

        for(let key of this.robots.keys()){
            if(key !== boid){
                let distance = Vector.VectorSub(this.robots.get(key).position, this.robots.get(boid).position);
                if(Vector.VectorInferiorTo(distance, 100)){
                    vec = Vector.VectorSub(vec, (Vector.VectorSub(this.robots.get(key).position, this.robots.get(boid).position)));
                }
            }
        }

        return vec;
    }

    /**
     * Third main rule, We try to make that each boid has approximately the same velocity
     * @param boid
     * @returns {*}
     */
    matchVelocityRule(boid){
        var vec = new Vector();

        for(let key of this.robots.keys()){
            if(key !== boid){
                vec = Vector.VectorAdd(vec, this.robots.get(key).velocity);
            }
        }

        vec = Vector.VectorDiv(vec, this.robots.size - 1 );

        return Vector.VectorDiv(Vector.VectorSub(vec, this.robots.get(boid).velocity), 8);
    }

    /**
     * Bonus rule, to be sure that boids won't go outside of the bounds
     * @param boid
     * @returns {*|Vector}
     */
    boundingPositionRule(boid) {
        var bounds = Vector.VectorSub(this.groundSize, new Vector(25, 25, 25));
        var vec = new Vector();
        var rposition = this.robots.get(boid).position;

        if (rposition.x < -bounds.x)
            vec.x = 10;
        else if (rposition.x > bounds.x)
            vec.x = -10;
        if (rposition.y < -bounds.y)
            vec.y = 10;
        else if (rposition.y > bounds.y)
            vec.y = -10;
        if (rposition.z < -bounds.z)
            vec.z = 10;
        else if (rposition.z > bounds.z)
            vec.z = -10;

        return vec;
    }

    /**
     * Bonus rule, to make boids moving towards a certain point
     * @param boid
     * @param place
     * @returns {*}
     */
    tendToPlaceRule(boid, place){
        return Vector.VectorDiv(Vector.VectorSub(place, this.robots.get(boid).position), 100);
    }
}

exports[Types.Boids] = BoidSupervisor;