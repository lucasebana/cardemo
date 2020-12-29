import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../node_modules/three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from '../node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import { Car } from './car.js'
import { Traffic_Light } from './traffic_lights.js';

import CameraControls from '../node_modules/camera-controls/dist/camera-controls.module.js';
import { Scenario } from './scenario.js';

CameraControls.install( { THREE: THREE } );


/* DEBUG */
let debug = false;

let clearScreen = () => {
    document.querySelector(".home_container").remove()
    document.querySelector(".home_filter").remove()
}
if (debug) {
    clearScreen();
    demo.start = true;
} else {
    document.querySelector("#home_start").addEventListener("click", function () {

        if (demo.scenario1.loaded) {
            clearScreen();
            demo.start = true;
        }
    })
}

window.THREE = THREE

export class Demo {
    constructor() {
        this.car = undefined;
    }
};
Demo.prototype.run = function () {
    console.log("IA vs. Wild - v. 1.0")
    //this.ready = false; // all objects initialized = false
    this.sceneComplete = false;
    this.start = false;
    this.entryAnimation = false;
    this.initScene()}

window.testvariable = "";

Demo.prototype.initScene = async function () {

    this.container = document.getElementById('container');


    //Renderer
    this.renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setAnimationLoop(this.render.bind(this));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;
    this.container.appendChild(this.renderer.domElement);

    //Scene 1
    this.scenario1 = new Scenario(this);
    this.scenario1.load();
    
}



Demo.prototype.render = function () {

    const time = -performance.now() / 1000;
    //console.log(time);
    if (demo.start && this.scenario1.loaded && this.scenario1.manager.ready) {
        this.scenario1.render(time);
    } else {
        this.scenario1.blit();
    }

}


Demo.prototype.openFullscreen = function () {

    //a refaire 
    var elem = document.body;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari & Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
    }


    let container = document.querySelector("#container")
    container.style.width = '100%';
    container.style.height = '100%';
    let canvas = container.children[0];
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    demo.renderer.setSize(window.innerWidth, window.innerHeight);

}
