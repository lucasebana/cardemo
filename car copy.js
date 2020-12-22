import { Demo } from './demo.js';
import * as THREE from './node_modules/three/build/three.module.js';


export class Car{
    carModel = undefined;
    wheels = [];
    constructor(pointsPath){
        this.bodyMaterial = new THREE.MeshPhysicalMaterial( {
            color: 0xff0000, metalness: 0.6, roughness: 0.4, clearcoat: 0.05, clearcoatRoughness: 0.05
        } );
    
        this.detailsMaterial = new THREE.MeshStandardMaterial( {
            color: 0xffffff, metalness: 1.0, roughness: 0.5
        } );

    
        this.glassMaterial = new THREE.MeshPhysicalMaterial( {
            color: 0xffffff, metalness: 0, roughness: 0.1, transmission: 0.9, transparent: true
        } );
    
        this.shadow = new THREE.TextureLoader().load('ferrari_ao.png' );

        this.pointsPath = pointsPath;
        this.fraction = 0;
    }
};


Car.prototype.loadModel = async function(loader, car,resolve){
    
        let tmpCarModel;
        var bodyMaterial_ = this.bodyMaterial;     
        
        
        var detailsMaterial_ = this.detailsMaterial;
        var glassMaterial_ = this.glassMaterial;
        var shadow_ = this.shadow;
        
        //await loader.load('./ferrari.glb', function ( gltf ) {
        await loader.load('./feu_tricolore.glb', function ( gltf ) {
        
        const carModel = gltf.scene.children[ 0 ];

        carModel.name="feu_tricolore";

        carModel.getObjectByName( 'bulb1' ).material = bodyMaterial_;

        carModel.getObjectByName( 'bulb2' ).material = glassMaterial_;

        
        
        // shadow
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 0.655 * 4, 1.3 * 4 ),
            new THREE.MeshBasicMaterial( {
                map: shadow_, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true
            } )
        );
        mesh.rotation.x = - Math.PI / 2;
        mesh.renderOrder = 2;
        carModel.add( mesh );
        
        //car.carModel = carModel;
        //carModel.visible = true;
        
        resolve(carModel)
       });     
}

Car.prototype.context = function(car,time){
    const up = new THREE.Vector3( 0, 0, -1 );
    const axis = new THREE.Vector3( );

    let coeff =  0
    /*if(coeff+this.fraction > 1){
        coeff = -this.fraction + 1
    }
    */
    
    if(coeff + this.fraction < 0){
        coeff = 1-this.fraction
    }
    
    const newPosition = this.pointsPath.getPoint(this.fraction);
    const tangent = this.pointsPath.getTangent(this.fraction);
    //car.carModel.position.copy(newPosition);
    this.carModel.parent.position.copy(newPosition);
    
    axis.crossVectors( up, tangent ).normalize();
    

    const radians = Math.acos( up.dot( tangent ) );
    
    demo.carGroup.quaternion.setFromAxisAngle( axis, radians );
    
    var axe = new THREE.Vector3(0,0-1.155);
    //this.wheels[0].rotateOnWorldAxis(axe,1);

    for ( let i = 0; i < car.wheels.length; i ++ ) {
        car.wheels[ i ].rotation.x = time * Math.PI;
    }
    
    
    if (window.continue==true){
    this.fraction +=0.001;
    if (this.fraction > 1) {
      this.fraction = 0;
    }    
}
}