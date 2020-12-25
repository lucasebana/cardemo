//import { Demo } from './demo.js';
import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './node_modules/three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from './node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import { Car } from './car.js'
import { Traffic_Light } from './traffic_lights.js';

import CameraControls from './node_modules/camera-controls/dist/camera-controls.module.js';

export class Scenario{
    constructor(demo){
        this.demo = demo;
        this.entryAnimation = false;
    }
}   
Scenario.prototype.load = async function () {

    /**
     ** load up all models,cams,lights,trajectories,questions,events,etc.
     **/

    this.scene = new THREE.Scene();
    window.scene = this.scene;

    this.scene.background = new THREE.Color(0xeeeeee);
    this.scene.fog = new THREE.Fog(0xeeeeee, 10, 90);

    this.grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    this.grid.material.opacity = 0.1;
    this.grid.material.depthWrite = false;
    this.grid.material.transparent = true;
    this.scene.add(this.grid);


    //Main camera and camera controls
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(-11, 7, -7);


    this.cameraControls = new CameraControls(this.camera, this.container);
    /*this.cameraControls.setTarget(0, 0, 0);*/
    this.cameraControls.dolly(-80, false);
    this.cameraControls.clock = new THREE.Clock();

    window.controls = this.controls;

    this.default_viewport = new THREE.Vector4();
    demo.renderer.getCurrentViewport(this.default_viewport);

    //Extra viewports
    this.extra_views = [{
        left: 0.65,
        bottom: 0.6,
        width: 0.25,
        height: 0.25,
        ///*background: new THREE.Color( 0.5, 0.5, 0.7 ),
        fov: 50,
        eye: [-0.047728848457335965, 0.6979747391771525, -1.2309553518891336],
        wheelEye: [-0.347728848457336, 0.7979747391771524, -0.9309553518891335],
        up: [0, 1, 0],
        updateCamera: function (camera, scene) {
            //*
            //camera.position.x -= mouseX * 0.05;
            //camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), - 2000 );
            //camera.lookAt( camera.position.clone().setY( 0 ) );
            //*/
        }
    }];

    for (let ii = 0; ii < this.extra_views.length; ++ii) {

        const view = this.extra_views[ii];
        const camera = new THREE.PerspectiveCamera(view.fov, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.fromArray(view.eye);
        camera.up.fromArray(view.up);
        camera.far = 100
        camera.near = 0.1
        camera.filmGauge = 35
        camera.filmOffset = 0
        view.camera = camera;
    }


    //Lights, environments, materials & shadows
    const light = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(light);
    const dirLight = new THREE.DirectionalLight(0xffffff, .5);
    dirLight.position.set(5, 2, 8);
    this.scene.add(dirLight);

    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(demo.renderer);
    this.scene.environment = pmremGenerator.fromScene(environment).texture;


    //*
    //const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    //hemiLight.color.setHSL( 0.6, 1, 0.6 );
    //hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    //hemiLight.position.set( 0, 50, 0 );
    //this.scene.add( hemiLight );
    //*/

    //Axes
    this.axesHelper = new THREE.AxesHelper(3);
    this.axesHelper.translateX(1);
    this.scene.add(this.axesHelper);


    //Car Path
    const pointsPath = new THREE.CurvePath();
    const firstLine = new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -10)
    );
    const lastLine = new THREE.LineCurve3(
        new THREE.Vector3(5, 0, -15),
        new THREE.Vector3(5, 0, -25)
    );

    const bezierLine =
        new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 0, -10),
            new THREE.Vector3(0, 0, -12),
            new THREE.Vector3(5.0, 0, -13),
            new THREE.Vector3(5, 0, -15)
        );
    pointsPath.add(firstLine);
    pointsPath.add(bezierLine);
    pointsPath.add(lastLine);


    const material = new THREE.LineBasicMaterial({
        color: 0x9132a8
    });
    const points = pointsPath.curves.reduce((p, d) => [...p, ...d.getPoints(20)], []);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    var path = new THREE.Line(geometry, material);
    this.scene.add(path);

    //setting up the loading manager

    function loadModel() {
        console.log("object loaded");
    }

    this.loadedObject = undefined;
    this.manager = new THREE.LoadingManager(loadModel.bind(this));
    this.manager.ready = false;
    this.manager.onProgress = function (item, n_loaded, total) {
        //console.log( item, n_loaded, total );
        let loading_bar = document.querySelector("#loading_bar");
        loading_bar.style.width = (n_loaded / total) * 100 + "%";
        //console.log( (n_loaded / total) * 100 + "%");
    }
    this.manager.onLoad = function () {
        this.ready = true;
        let start_button = document.querySelector("#home_start");
        start_button.classList.remove("disabled_button");
        console.log("demo start")
    }

    //Loading the car model
    const dracoLoader = new DRACOLoader(this.manager);
    dracoLoader.setDecoderPath('./node_modules/three/examples/js/libs/draco/gltf/');

    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(dracoLoader);

    //Scene 1 specific

    this.car = new Car(pointsPath);
    this.traffic_light = new Traffic_Light();

    var model;


    const carModel = await this.car.loadModel.bind(this.car)(this.loader)
    this.car.carModel = carModel;

    const TLmodel = await this.traffic_light.loadModel(this.loader);
    this.traffic_light.model = TLmodel;

    this.carGroup = new THREE.Group();
    this.carGroup.name = "carGroup"
    //this.carGroup.position.z = -1.15531
    this.carGroup.add(carModel)
    this.car.carModel.position.set(0, 0, -1.15551)
    this.scene.add(this.carGroup)

    this.scene.add(this.traffic_light.model)

    this.loaded = true;

    // TODO DEPLACER CIR AUX ROUES AVANT
    // IE DEPLACER CENTRE (AUTOUR DUQUEL ON PIVOTE) A UN POINT MILLIEU DE LAXE DES ROUES
    //AU LIEU DU CENTRE DE GRAVITE
    //CALCULER LA DEVELOPEE DE LA COURBE DE BEZIER
    //EN DEDUIRE LANGLE DES ROUES AVANT
    //IMPORTER LES FEUX TRICOLORES
}


Scenario.prototype.render = function (time) {
    const delta = this.cameraControls.clock.getDelta();
    const hasControlsUpdated = this.cameraControls.update(delta);

    //requestAnimationFrame( this.render );


    //Objects context 
    {

        if (this.entryAnimation == false) {
            this.cameraControls.dolly(70, true);
            this.entryAnimation = true;
            var div = document.createElement("div");
            div.innerHTML = "Bienvenue dans IA vs. WILD!<br/>";
            div.classList.add("dialog_textbox");
            var container = document.querySelector("#container");
            document.body.insertBefore(div, container);
            this.cameraControls.enabled = true;
        }
        if (this.scene.getObjectByName("carGroup") != undefined) {
            this.car.context.bind(this.car)(time);
        }

    }

    //this.grid.position.z = - ( time ) % 5;

    this.blit();
}

Scenario.prototype.blit = function () {
    demo.renderer.setViewport(this.default_viewport);
    demo.renderer.setScissor(this.default_viewport);

    demo.renderer.setPixelRatio(window.devicePixelRatio);
    demo.renderer.setSize(window.innerWidth, window.innerHeight);

    //demo.renderer.setScissorTest( true );
    demo.renderer.render(this.scene, this.camera);

    //Render extra viewports
    for (let ii = 0; ii < this.extra_views.length; ++ii) {

        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        const view = this.extra_views[ii];
        const camera2 = view.camera;


        view.updateCamera(camera2, scene);

        const left = Math.floor(windowWidth * view.left);
        const bottom = Math.floor(windowHeight * view.bottom);
        const width = Math.floor(windowWidth * view.width);
        const height = Math.floor(windowHeight * view.height);


        demo.renderer.setViewport(left, bottom, width, height);
        demo.renderer.setScissor(left, bottom, width, height);

        demo.renderer.setScissorTest(true);
        //demo.renderer.setClearColor( view.background );              

        camera2.aspect = width / height;
        camera2.updateProjectionMatrix();

        demo.renderer.render(this.scene, camera2);

    }
}