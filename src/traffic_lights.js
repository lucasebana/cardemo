import { Demo } from './demo.js';
import * as THREE from '../node_modules/three/build/three.module.js';

export class Traffic_Light {
    model = undefined;

    constructor(pointsPath) {
        this.poleMaterial = new THREE.MeshPhysicalMaterial({
            //color: 0x333332,
            color:0x000000,
            metalness: 0.6,
            roughness: 0.4,
            clearcoat: 0.05,
            clearcoatRoughness: 0.05
        });
        this.greenMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x00ff00,
            metalness: 0.6,
            roughness: 0.4,
            clearcoat: 0.05,
            clearcoatRoughness: 0.05,
            transmission:0.1
        });
        this.redMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff0000,
            metalness: 0.6,
            roughness: 0.4,
            clearcoat: 0.05,
            clearcoatRoughness: 0.05,
            transmission:0.1
        });
        this.orangeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff4402,
            metalness: 0.6,
            roughness: 0.4,
            clearcoat: 0.05,
            clearcoatRoughness: 0.05,
            transmission:0.1
        });

        this.detailsMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 1.0,
            roughness: 0.5
        });


        this.glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: .4,
            roughness: 0.1,
            transmission: 0.5,
            transparent: true,
            clearcoat: 1
        });

        this.pointsPath = pointsPath;
        this.fraction = 0;
    }
};


Traffic_Light.prototype.loadModel = async function (loader) {
    return new Promise(async (resolve, reject) => {

        var poleMaterial_ = this.poleMaterial;
        var greenMaterial_ = this.greenMaterial;
        var redMaterial_ = this.redMaterial;
        var orangeMaterial_ = this.orangeMaterial;
        var detailsMaterial_ = this.detailsMaterial;
        var glassMaterial_ = this.glassMaterial;
        var shadow_ = this.shadow;

        await loader.load('./assets/models/feu_tricolore.glb', function (gltf) {

            const model = gltf.scene.children[0];
            model.position.set(0,0,0);

            model.name = "feu_tricolore";

            model.material = poleMaterial_;
            model.getObjectByName('bulb3').material = redMaterial_;
            model.getObjectByName('bulb2').material = glassMaterial_;
            model.getObjectByName('bulb1').material = glassMaterial_;

            // shadow
            const mesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(0.655 * 4, 1.3 * 4),
                new THREE.MeshBasicMaterial({
                    blending: THREE.MultiplyBlending,
                    toneMapped: false,
                    transparent: true
                })
            );
            //mesh.rotation.x = -Math.PI / 2;
            mesh.renderOrder = 2;
            model.add(mesh);
            /*window.spotlight = new THREE.SpotLight(0x00ff00);
            spotlight.position.copy(model.getObjectByName('bulb1').position);
            model.add(spotlight);
            */
            resolve(model)
        });
    });
}

Traffic_Light.prototype.context = function (car, time) {

}

Traffic_Light.prototype.switchLights = function(model,n,color){
    let c = 0;
    switch(color){
        case "red":
            c = 0;
            break;
        case "orange":
            c = 1;
            break;
        case "green":
            c = 2;
            break;
        default:
            ;
    }

    //from top to bottom
    let colorsArray = [
        
    new THREE.MeshPhysicalMaterial({
        color: 0xff0000,
        metalness: 0.6,
        roughness: 0.4,
        clearcoat: 0.05,
        clearcoatRoughness: 0.05,
        transmission:0.1
    }),
    new THREE.MeshPhysicalMaterial({
        color: 0xff4402,
        metalness: 0.6,
        roughness: 0.4,
        clearcoat: 0.05,
        clearcoatRoughness: 0.05,
        transmission:0.1
    }),    
    new THREE.MeshPhysicalMaterial({
        color: 0x00ff00,
        metalness: 0.6,
        roughness: 0.4,
        clearcoat: 0.05,
        clearcoatRoughness: 0.05,
        transmission:0.1
    }),
    new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: .4,
        roughness: 0.1,
        transmission: 0.5,
        transparent: true,
        clearcoat: 1
    })
    ];


    switch(n){
        case 1:
            model.getObjectByName('bulb1').material = colorsArray[c];
            model.getObjectByName('bulb2').material = colorsArray[3];
            model.getObjectByName('bulb3').material = colorsArray[3];
            return;
        case 2:
            model.getObjectByName('bulb1').material = colorsArray[3];
            model.getObjectByName('bulb2').material = colorsArray[c];
            model.getObjectByName('bulb3').material = colorsArray[3];
            return;
        case 3:
            model.getObjectByName('bulb1').material = colorsArray[3];
            model.getObjectByName('bulb2').material = colorsArray[3];
            model.getObjectByName('bulb3').material = colorsArray[c];
            return;
        default:
            return;
    }
}