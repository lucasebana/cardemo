import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './node_modules/three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from './node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import { Car } from './car.js'
import { Traffic_Light } from './traffic_lights.js';


/* DEBUG */
let debug = false;

let clearScreen = ()=>{
    document.querySelector(".home_container").remove()
    document.querySelector(".home_filter").remove()
}
if(debug){
    clearScreen();
}
else{

    document.querySelector("#home_start").addEventListener("click",function(){
        clearScreen();
    })
}



window.THREE = THREE
window.continue = true

export class Demo{
    constructor(){
        //
        this.car = undefined;
    }

};
Demo.prototype.run = function() {
    console.log("DEMO v. 1.0")
    this.initScene();
}

window.testvariable = "";

Demo.prototype.initScene = async function(){

    this.container = document.getElementById( 'container' );


    //Renderer
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setAnimationLoop( this.render.bind(this) );
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;
    this.container.appendChild( this.renderer.domElement );

    //Scene 1
    this.scene = new THREE.Scene();
    window.scene = this.scene;

    this.scene.background = new THREE.Color( 0xeeeeee );
    this.scene.fog = new THREE.Fog( 0xeeeeee, 10, 90 );

    this.grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
    this.grid.material.opacity = 0.1;
    this.grid.material.depthWrite = false;
    this.grid.material.transparent = true;
    scene.add( this.grid );

    //Camera and camera controls
    this.camera = new THREE.PerspectiveCamera( 40, window.
        innerWidth / window.innerHeight, 0.1, 100 );
    this.camera.position.set( -11, 7, - 7 );
    
    this.controls = new OrbitControls( this.camera, this.container );
    window.controls = this.controls;
    this.controls.target.set( 0, 0.5, 0 );
    this.controls.update();

    //Lights, environments, materials & shadows
    const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    this.scene.add( light );
    const dirLight = new THREE.DirectionalLight( 0xffffff, .5
        );
    dirLight.position.set( 5, 2, 8 );
    this.scene.add( dirLight );

    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
    this.scene.environment = pmremGenerator.fromScene( environment ).texture;
    

    /*
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 50, 0 );
    this.scene.add( hemiLight );
    */

    //Axes
    this.axesHelper = new THREE.AxesHelper( 3 );
    this.axesHelper.translateX(1);
    this.scene.add( this.axesHelper );

    
    //Car Path
    const pointsPath = new THREE.CurvePath();
        const firstLine = new THREE.LineCurve3(
        new THREE.Vector3( 0, 0, 0 ),
        new THREE.Vector3( 0,0, -10 )
        );
       const lastLine = new THREE.LineCurve3(
        new THREE.Vector3( 5, 0, -15 ),
        new THREE.Vector3( 5,0, -25)
        );
    
    const bezierLine = 
    new THREE.CubicBezierCurve3(
        new THREE.Vector3( 0, 0, -10 ),
        new THREE.Vector3( 0, 0, -12 ),
        new THREE.Vector3( 5.0, 0, -13 ),
        new THREE.Vector3( 5, 0, -15 )
    );
    pointsPath.add(firstLine);
    pointsPath.add(bezierLine);
    pointsPath.add(lastLine);
    
    /*
    var devPoints = pointsPath.getSpacedPoints();
    const derivativePath = new THREE.Path();
    var h = 1e-5
    
    for(let i=0; i < devPoints.length; i++){
        if (i > 0){
            //let vec = (devPoints[i]-devPoints[i-1])/h
            let v = new THREE.Vector3(devPoints[i].x-devPoints[i-1].x,devPoints[i].y-devPoints[i-1].y,devPoints[i].z-devPoints[i-1].z)
            v.set(v.x/h,v.y/h,v.z/h)
            path.lineTo(v);
        }
    }
    */
   
    



    /*
    points.forEach((point, i)=> {
        if (i > 0){
            let vec = (point-points[i-1])/h




            path.lineTo(vec);
        }
    });
    */

    const material = new THREE.LineBasicMaterial({
        color: 0x9132a8
    });
    const points = pointsPath.curves.reduce((p, d)=> [...p, ...d.getPoints(20)], []);
    
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    
    var path = new THREE.Line( geometry, material );
    this.scene.add(path);

    //Loading the car model

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( './node_modules/three/examples/js/libs/draco/gltf/' );

    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader( dracoLoader );

    //Scene 1
    
    let scene1 = async ()=>{
    this.car = new Car(pointsPath);
    this.traffic_light = new Traffic_Light();

    var model;


    console.log("before")

    function loadCar(){
    return new Promise((resolve,reject)=>{
        window.demo.car.loadModel(window.demo.loader,window.demo.car,(data)=>resolve(data));
    });
    }

    const carModel = await loadCar();
    //console.log(carModel)
    this.car.carModel = carModel;
    console.log("car model successfully loaded!")
    console.log("after")

    function loadTL(){
        return new Promise((resolve,reject)=>{
            window.demo.traffic_light.loadModel(window.demo.loader,(data)=>resolve(data));
        });
        }
    

    const TLmodel = await loadTL();
    this.traffic_light.model = TLmodel;
    /*this.loadCarPromise.then((model)=>{
    })*/

    this.carGroup = new THREE.Group();
    this.carGroup.name = "carGroup"
    this.carGroup.add(carModel)
    //
    //this.carGroup.position.z = -1.15531
    this.carGroup.children[0].position.z = -1.15551
    this.scene.add(this.carGroup)


    this.scene.add(this.traffic_light.model)
    }

    scene1();

    //this.car.loadModel.bind(this.car,this.loader,this.scene)();
    
    

// TODO DEPLACER CIR AUX ROUES AVANT
// IE DEPLACER CENTRE (AUTOUR DUQUEL ON PIVOTE) A UN POINT MILLIEU DE LAXE DES ROUES
//AU LIEU DU CENTRE DE GRAVITE
//CALCULER LA DEVELOPEE DE LA COURBE DE BEZIER
//EN DEDUIRE LANGLE DES ROUES AVANT
//IMPORTER LES FEUX TRICOLORES
    

}





Demo.prototype.render = function(){
    (()=>{
    const time = - performance.now() / 1000;

    /* Objects context */

    //console.log(this.scene);
    //var cp = this.scene.getObjectByName("car").position;
    /*controls.target.set(cp.x,cp.y,cp.z);
    controls.update();
    */

    
    //
    

    //console.log(this.scene.getObjectByName("carGroup"))
    if(this.scene.getObjectByName("carGroup") != undefined){
        //if(this.car.carModel.parent.parent === this.scene){
            //if (window.block != undefined){
            this.car.context(this.car,time);

            //this.controls.target.copy(this.car.carModel.parent.position);
            //}
        //}
    }
    this.controls.update();

    //this.grid.position.z = - ( time ) % 5;
    this.renderer.render( this.scene, this.camera );
    }).bind(window.demo)()
}

