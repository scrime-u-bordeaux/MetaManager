"use strict";
var Three = require('three');
require('./TrackballControls');


class SceneRenderer{

    constructor(canvas){
        this.scene = new Three.Scene();
        //this.scene.fog = new Three.Fog( 0x000000, 0, 1000 );

        this.canvas = typeof canvas === "string" ? document.getElementById(canvas) : canvas;

        this.renderer = new Three.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize(this.canvas.width, this.canvas.height);

        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.shadowMap.enabled = true;
        //this.renderer.setClearColor( this.scene.fog.color, 1 );

    }

    setCamera(fov, aspect, near, far, position){
        this.camera = new Three.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(position.x, position.y, position.z);
        this.scene.add(this.camera);
    }

    addTrackballControls(){
        this.controls = new Three.TrackballControls( this.camera , this.canvas);
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;
        this.controls.keys = [ 65, 83, 68 ];
    }

    //TODO needs to be changed/enlighted
    addLight(options){
        var light;
        switch(options.type){
            case "ambient":
                light = new Three.AmbientLight(options.color);
                break;
            case "directional":
                light = new Three.DirectionalLight(options.color, options.intensity);
                var d = 50;

                light.position.set(options.x || d, options.y || d, options.z || d );
                light.castShadow = true;
                //light.cameraHelper = true;

                light.shadow.mapWidth = 1024;
                light.shadow.mapHeight = 1024;

                light.shadow.camera.left = -d;
                light.shadow.camera.right = d;
                light.shadow.camera.top = d;
                light.shadow.camera.bottom = -d;

                light.shadow.camera.far = 3*d;
                light.shadow.camera.near = d;
                light.shadow.darkness = 0.5;
                break;
            case "point":
                light = new Three.PointLight(options.color, options.intensity);

                light.position.set(options.x, options.y, options.z);
                light.castShadow = true;

                break;
            case "spot":
                light = new Three.SpotLight( options.color, options.intensity );

                light.position.set( options.x, options.y, options.z );
                light.target.position.set( options.tx || 0, options.ty || 0, options.tz || 0 );

                light.castShadow = true;
        }

        this.scene.add( light );
    }

    addMesh(mesh){
        this.scene.add(mesh);
    }

    render(){
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
}
module.exports = SceneRenderer;