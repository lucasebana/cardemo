import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './node_modules/three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from './node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import { Car } from './car.js'

window.Car = Car;

let camera, scene, renderer;
let stats;

let grid;
let controls;
const wheels = [];

function init(){

const container = document.getElementById( 'container' );

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( render );
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
container.appendChild( renderer.domElement );


scene = new THREE.Scene();
window.scene = scene;

scene.background = new THREE.Color( 0xeeeeee );
scene.fog = new THREE.Fog( 0xeeeeee, 10, 50 );

grid = new THREE.GridHelper( 100, 40, 0x000000, 0x000000 );
grid.material.opacity = 0.1;
grid.material.depthWrite = false;
grid.material.transparent = true;
scene.add( grid );

camera = new THREE.PerspectiveCamera( 40, window.
innerWidth / window.innerHeight, 0.1, 100 );
camera.position.set( 4.25, 1.4, - 4.5 );

controls = new OrbitControls( camera, container );
window.controls = controls;
controls.target.set( 0, 0.5, 0 );
controls.update();

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );
const dirLight = new THREE.DirectionalLight( 0xffffff, .5
    );
dirLight.position.set( 5, 2, 8 );
scene.add( dirLight );

const environment = new RoomEnvironment();
const pmremGenerator = new THREE.PMREMGenerator( renderer );
scene.environment = pmremGenerator.fromScene( environment ).texture;

const bodyMaterial = new THREE.MeshPhysicalMaterial( {
    color: 0xff0000, metalness: 0.6, roughness: 0.4, clearcoat: 0.05, clearcoatRoughness: 0.05
} );

const detailsMaterial = new THREE.MeshStandardMaterial( {
    color: 0xffffff, metalness: 1.0, roughness: 0.5
} );

const glassMaterial = new THREE.MeshPhysicalMaterial( {
    color: 0xffffff, metalness: 0, roughness: 0.1, transmission: 0.9, transparent: true
} );

const shadow = new THREE.TextureLoader().load('ferrari_ao.png' );
const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( './node_modules/three/examples/js/libs/draco/gltf/' );

    const loader = new GLTFLoader();
    loader.setDRACOLoader( dracoLoader );

    loader.load( './ferrari.glb', function ( gltf ) {
        
        const carModel = gltf.scene.children[ 0 ];
        carModel.name="car";

        carModel.getObjectByName( 'body' ).material = bodyMaterial;

        carModel.getObjectByName( 'rim_fl' ).material = detailsMaterial;
        carModel.getObjectByName( 'rim_fr' ).material = detailsMaterial;
        carModel.getObjectByName( 'rim_rr' ).material = detailsMaterial;
        carModel.getObjectByName( 'rim_rl' ).material = detailsMaterial;
        carModel.getObjectByName( 'trim' ).material = detailsMaterial;

        carModel.getObjectByName( 'glass' ).material = glassMaterial;

        wheels.push(
            carModel.getObjectByName( 'wheel_fl' ),
            carModel.getObjectByName( 'wheel_fr' ),
            carModel.getObjectByName( 'wheel_rl' ),
            carModel.getObjectByName( 'wheel_rr' )
        );

        // shadow
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 0.655 * 4, 1.3 * 4 ),
            new THREE.MeshBasicMaterial( {
                /*map: shadow, */blending: THREE.MultiplyBlending, toneMapped: false, transparent: true
            } )
        );
        mesh.rotation.x = - Math.PI / 2;
        mesh.renderOrder = 2;
        carModel.add( mesh );


        scene.add( carModel );
            
    } );
}
init();
window.c = new Car();


function render(){
    const time = - performance.now() / 1000;

    for ( let i = 0; i < wheels.length; i ++ ) {

        /*wheels[ i ].rotation.x = time * Math.PI;
        wheels [i].rotation.z = 50;
        */
        //rotation in the local coordinate system
    }
    console.log(scene);
    var cp = scene.getObjectByName("car").position;
    controls.target.set(cp.x,cp.y,cp.z);
    controls.update();

    //
    grid.position.z = - ( time ) % 5;
    renderer.render( scene, camera );
}
