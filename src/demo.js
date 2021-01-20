import * as THREE from '../node_modules/three/build/three.module.js';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
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
    document.querySelector(".home_container").classList.add("fadeout");
    //document.querySelector(".home_filter").classList.add("fadeout2");

    setTimeout(()=>{
        //document.querySelector(".home_container").remove();
        //document.querySelector(".home_filter").remove();
    },200);
}
if (debug) {
    clearScreen();
    demo.start = true;
} else {
    var home_start = function () {
        if (demo.scenario1.loaded) {
            clearScreen();
            demo.start = true;
        }
        document.removeEventListener("#home_start",home_start);
    }
    document.querySelector("#home_start").addEventListener("click",home_start);
    var home_tut = function () {

        //clearScreen();
        let tut = document.querySelector(".home_tutorial_box");
        tut.classList.add("visible");
        let slides = document.querySelectorAll(".home_tut_container");
        let index = 0;
        let prev_index = -1;


        var display = (i)=>{
            if(i >= 0 && i < slides.length){
                
                slides[index].classList.remove("visible");
                
                prev_index = index;
                index = i;
                slides[index].classList.add("visible");
            }
            if(index != 0){
                prev.classList.remove("invisible");
            }
            else{
                prev.classList.add("invisible");
            }

            if(index == slides.length-1){
                next.classList.add("invisible");
                end.classList.remove("invisible");
            }
            else{
                next.classList.remove("invisible");
                end.classList.add("invisible");
            }
        }
        
        var increment = function(){
            display(index+1);
        }
        
        var decrement = function(){
            display(index-1);
        }
        
        slides[index].classList.add("visible");
                
        var prev = document.querySelector("#tut_prev");
        var next = document.querySelector("#tut_next");
        var end = document.querySelector("#tut_end");

        
        next.addEventListener("click", increment);
        prev.addEventListener("click", decrement);
        end.addEventListener("click",()=>{
            tut.classList.remove("visible");
            prev.classList.add("invisible");
            next.classList.remove("invisible");
            end.classList.add("invisible");
            for(let i =0; i < slides.length;i++){
                slides[i].classList.remove("visible");
                index = 0;
            }
        
        })
        
        }
    }
    document.querySelector("#home_tutorial").addEventListener("click", home_tut )




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



    //Stats

    
    this.stats = new Stats();
    this.stats.setMode(0);

    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0';
    this.stats.domElement.style.top = '0';
    document.body.appendChild( this.stats.domElement );

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
    this.scenario1.render(time);        
    if (demo.start && this.scenario1.loaded && this.scenario1.manager.ready) {

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
