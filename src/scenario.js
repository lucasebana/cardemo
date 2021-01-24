//import { Demo } from './demo.js';
import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../node_modules/three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from '../node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import CameraControls from '../node_modules/camera-controls/dist/camera-controls.module.js';
import { Sky } from '../node_modules/three/examples/jsm/objects/Sky.js';

import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from '../node_modules/three/examples/jsm/postprocessing/GlitchPass.js';

//import * as MW from '../node_modules/meshwalk/dist/meshwalk.module.js';

import { Car } from './car.js'
import { Traffic_Light } from './traffic_lights.js';
import { Segment } from './segment.js';
import { Route } from './route.js';
import { GameMap } from './game_map.js';
import { GameEvent } from './game_event.js';


//MW.install( THREE );

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
    this.scene.fog = new THREE.Fog(0xeeeeee, 10, 400);
    
    this.gridSize = 600;
    this.grid = new THREE.GridHelper(this.gridSize, this.gridSize/5, 0x000000, 0x000000);
    this.grid.material.opacity = 0.05;
    this.grid.material.depthWrite = false;
    this.grid.material.transparent = true;
    
    this.scene.add(this.grid);


    //Main camera and camera controls
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 400);
    


    this.cameraControls = new CameraControls(this.camera, demo.container);
    this.cameraControls.moveTo(-2.495755842728247, 2.700472170003647, -11.591061791313235,true);
    
    /*this.cameraControls.setTarget(0, 0, 0);*/
    
    this.cameraControls.clock = new THREE.Clock();
    //this.cameraControls.setTarget(2.5,0,-4.5);
    //this.cameraControls.dolly(-5, false);
    //this.cameraControls.truck(1,0);

    this.cameraControls.rotateTo( 0, Math.PI * 0.25, true );
    this.cameraControls.dampingFactor=1;

    
    this.bb = new THREE.Box3(
		new THREE.Vector3( -5.0, 0, -5.0 ),
		new THREE.Vector3( 5.0, 0, 5.0 )
    );
    //this.cameraControls.setBoundary( this.bb );
    //this.cameraControls.boundaryEnclosesCamera = true;

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
        fov: 70,
        eye: [-0.157728848457335965, 0.9979747391771525, -1.2309553518891336],
        //eye: [-0.047728848457335965, 0.7979747391771525, -1.2309553518891336],
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

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    this.logDom = document.querySelector(".game_log");
    let leftlog = this.extra_views[0].left * windowWidth;
    this.logDom.style.left = leftlog + "px" ;

    let bottomlog = (1-this.extra_views[0].bottom) * windowHeight ;
    this.logDom.style.top = bottomlog + "px" ;

    let widthlog = this.extra_views[0].width * windowWidth;
    this.logDom.style.width = widthlog + "px";

    this.logDom.style.display="flex";

    for (let ii = 0; ii < this.extra_views.length; ++ii) {

        const view = this.extra_views[ii];
        const camera = new THREE.PerspectiveCamera(view.fov, window.innerWidth / window.innerHeight, 1, 30);
        camera.position.fromArray(view.eye);
        camera.up.fromArray(view.up);
        camera.far = 100
        camera.near = 0.2
        camera.filmGauge = 35
        camera.filmOffset = 0
        view.camera = camera;
    }

    //Post-processing

    this.composer = new EffectComposer( this.demo.renderer );
    this.composer.addPass( new RenderPass( this.scene, this.camera ) );

    this.glitchPass = new GlitchPass();
    this.composer.addPass( this.glitchPass );
    this.glitchPass.goWild = false;

    this.glitchEffect = false;

    //Lights, environments, materials & shadows
    const light = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(light);
    const dirLight = new THREE.DirectionalLight(0xffffff, .5);
    dirLight.position.set(5, 2, 8);
    this.scene.add(dirLight);

    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(demo.renderer);
    this.scene.environment = pmremGenerator.fromScene(environment).texture;



    this.sky = new Sky();
    this.sky.scale.setScalar( 200000 );
    this.scene.add(this.sky);
    this.sun = new THREE.Vector3();
    this.effectController = {
        turbidity: 5.5,
        rayleigh: .5,
        //rayleigh:0.283,
        //rayleigh:0.283,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
        //inclination: 0.49, // elevation / inclination
        inclination:0.2009,
        azimuth: 0.3743, // Facing front,
        exposure: demo.renderer.toneMappingExposure
    };

    this.uniforms = this.sky.material.uniforms;
	const theta = Math.PI * ( this.effectController.inclination - 0.5 );
    const phi = 2 * Math.PI * ( this.effectController.azimuth - 0.5 );

    this.sun.x = Math.cos( phi );
    this.sun.y = Math.sin( phi ) * Math.sin( theta );
    this.sun.z = Math.sin( phi ) * Math.cos( theta );
    this.uniforms[ "sunPosition" ].value.copy( this.sun );
    //*
    //const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    //hemiLight.color.setHSL( 0.6, 1, 0.6 );
    //hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    //hemiLight.position.set( 0, 50, 0 );
    //this.scene.add( hemiLight );
    //*/

    //Axes
    this.axesHelper = new THREE.AxesHelper(5);
    //this.axesHelper.translateX(1);
    this.scene.add(this.axesHelper);

    //Path Builder
    let vec3 = THREE.Vector3;
    let a = [
        [[0, 0, 0], [0, 0, -5]],
        [[0, 0, -5], [0, 0, -10]],
        [[0, 0, -10],[0, 0, -12],[5.0, 0, -13],[5, 0, -15]],
        [[5, 0, -15], [5, 0, -25]]
    ];
    
    let b = [
        [[0,0,-5], [0,0,-10], [0,0,-10], [5,0,-10]]
    ]
    let c = [
        [[0,0,-5], [0,0,(-10 + -5)/2], [(0 + 5) / 2,0,-10], [5,0,-10]],
        [[5,0,-10],[20,0,-10]]
    ]
    //this.pathbuilder = new PathBuilder(a);

    //this.path1 = makePath();

    
    //Car Path
    /*
    let chemin = Route.makePath(a);//exportable avec curves.toJson();
    let chemin2 = Route.makePath(b);
    */
    

    //Create map
    let options = {
        road_keyPoints:[]
    }

    this.map = new GameMap();
    await this.map.init();

    this.segment = new Segment(options);
    //let segment2 = new Segment();
    /*
    segment2.roadmesh.position.z = -4*5
    segment2.sidewalkmesh1.position.z = -4*5
    segment2.sidewalkmesh2.position.z = -4*5
    */

    this.routes = this.map.routes;

    //this.routes.push(this.segment.route);
    //this.routes.push(this.map.routes[0])

    /*
    let route1 = new Route(a);
    let route2 = new Route(b,route1,[],[]);
    let route3 = new Route(c,route1,[],[]);
    */

    /*
    let question1 = new GameEvent("Question 1",
    ["Continuer","Tourner1","Tourner2"],
    [-1,0,1],
    2,
    true
    );

    route1.addCallback(0,question1);
    */

    /*
    route1.addExit(route2);
    route1.addExit(route3);
    */

    //this.routes = [route1,route2,route3];
    //let r = new Route();
    

    const material = new THREE.LineBasicMaterial({
        color: 0x9132a8
    });
    
    /*
    var points = route2.path.curves.reduce((p, d) => [...p, ...d.getPoints(20)], []);

    var geometry = new THREE.BufferGeometry().setFromPoints(points);

    var path = new THREE.Line(geometry, material);
    this.scene.add(path);
    */


    // => pour connaitre la distance entre la voiture et un point : curve.getUtoTmapping()

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
        console.log("Scenario start")
    }

    //Loading the car model
    const dracoLoader = new DRACOLoader(this.manager);
    dracoLoader.setDecoderPath('./node_modules/three/examples/js/libs/draco/gltf/');

    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(dracoLoader);

    //Scene 1 specific

    
    /*
    this.scene.add(route1.getLine(material));
    this.scene.add(route2.getLine(material));
    this.scene.add(route3.getLine(material));
    */
    
    
    this.routes.forEach((route)=>{
        this.scene.add(route.getLine(material));
    });
    
    

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
            new THREE.Vector3(0, 0, 
                -10),
            new THREE.Vector3(0, 0, -12),
            new THREE.Vector3(5.0, 0, -13),
            new THREE.Vector3(5, 0, -15)
        );
    pointsPath.add(firstLine);
    pointsPath.add(bezierLine);
    pointsPath.add(lastLine);

    const points = pointsPath.curves.reduce((p, d) => [...p, ...d.getPoints(20)], []);


    /*  */
    var dotMaterial = new THREE.PointsMaterial( { size: 4, sizeAttenuation: false,color:0xff0a0f } );

    var dotGeometry = new THREE.Geometry();
    dotGeometry.vertices.push(new THREE.Vector3());
    let p = new THREE.Points( dotGeometry, dotMaterial )
    window.pos = p.position;
    this.scene.add(p);


    this.car = new Car(this.routes);
    //
    window.r = demo.scenario1.car.routes;
    //
    this.traffic_light = new Traffic_Light();

    var model;


    const carModel = await this.car.loadModel.bind(this.car)(this.loader)
    this.car.carModel = carModel;

    const TLmodel = await this.traffic_light.loadModel(this.loader);
    this.traffic_light.model = TLmodel;
    this.traffic_light.model.position.set(10.2*5,0,-24*5)
    window.TLmodel = TLmodel;

    this.carGroup = new THREE.Group();
    this.carGroup.name = "carGroup"
    //this.carGroup.position.z = -1.15531
    this.carGroup.add(carModel)

    this.carGroup.add(this.extra_views[0].camera);
    this.car.carModel.position.set(0, 0, -1.15551);
    let newPosition = this.routes[0].path.curves[0].getPoint(0);
    this.carGroup.position.copy(newPosition);


    this.scene.add(this.carGroup);





    this.scene.add(this.traffic_light.model);

    this.loaded = true;



    this.cameraControls.fitToBox( this.car.carModel, true, { paddingLeft: 0, paddingRight: 2, paddingBottom: 1, paddingTop: 6 } )
    let dp = this.carGroup.position;
    this.cameraControls.setTarget(dp.x,dp.y-0.02,dp.z);
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
        window.entryAnimation = this.entryAnimation;
        if (this.entryAnimation == false) {
            //this.cameraControls.dolly(70, true);
            this.entryAnimation = true;

            
        }
        
        if(this.demo.start){
            let loading_bar = document.querySelector("#loading_bar");
            if (!loading_bar.classList.contains("end_loadbar")){
                loading_bar.classList.add("end_loadbar");
            }
            if (this.scene.getObjectByName("carGroup") != undefined) {
                if(!this.demo.paused){
                this.car.context.bind(this.car)(time);
                this.adjustCamera()
                }
            }

        }

    }

    //this.grid.position.z = - ( time ) % 5;

    this.blit.bind(this)();
}

Scenario.prototype.adjustCamera = function(){
    if(this.car.moved == true){
            
        let dp = this.carGroup.position;
        this.cameraControls.setTarget(dp.x,dp.y-0.02,dp.z);

       this.cameraControls.moveTo(dp.x,dp.y,dp.z);
        let dist = this.camera.position.distanceTo(this.carGroup.position);
        if( dist > 25 ){
            if(dist < 5){}
            else{
            this.cameraControls.dolly(dist-26);
            }
        }
        if(dist> 35){
        }
        
        this.car.moved = false;
    }

    if(this.camera.position.y < 0.7){
        this.camera.position.y = 0.7;
        
        let dp = this.carGroup.position;
        this.cameraControls.setTarget(dp.x,dp.y-0.02,dp.z);
       this.cameraControls.moveTo(dp.x,dp.y,dp.z);
    }
}


Scenario.prototype.blit = function () {
    demo.renderer.setViewport(this.default_viewport);
    demo.renderer.setScissor(this.default_viewport);

    demo.renderer.setPixelRatio(window.devicePixelRatio);
    demo.renderer.setSize(window.innerWidth, window.innerHeight);

    //demo.renderer.setScissorTest( true );
    
    if (demo.scenario1.manager != undefined) {
        if (this.demo.scenario1.manager.ready) {

            if (this.glitchEffect) {
                this.composer.render();
            } else {
                demo.renderer.render(this.scene, this.camera);
            }
        }
    }
    
    //Render extra viewports
    if (this.demo.start){
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
    demo.stats.update();
}

Scenario.prototype.reset = function(){
    this.car.fraction = 0;
    this.car.nth_route = this.car.nth_route0;
    this.car.nth_segment = this.car.nth_segment0;

    let tlm = this.traffic_light.model;
    this.traffic_light.switchLights(tlm,3,"red");

    /* reset all events... */
    /* reset all routes... */
    /* clear all callbacks (dom) */
}