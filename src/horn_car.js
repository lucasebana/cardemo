import { Demo } from './demo.js';
import * as THREE from '../node_modules/three/build/three.module.js';

export class HCar {
    model = undefined;

    constructor(parameters) {
        this.bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x000000,
            metalness: 0.6,
            roughness: 0.4,
            clearcoat: 0.05,
            clearcoatRoughness: 0.05
        });
    
        this.detailsMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 1.0,
            roughness: 0.5
        });
    
    
        this.glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff0000,
            metalness: 0,
            roughness: 0.1,
            transmission: 0.9,
            transparent: true
        });
        this.params = parameters;
    }
};



  HCar.prototype.loadModel = async function (model,loader) {
    return new Promise(async (resolve, reject) => {

            const carModel = model;

            carModel.name = "car";

            carModel.getObjectByName('body').material = this.bodyMaterial;

            carModel.getObjectByName('rim_fl').material = this.detailsMaterial;
            carModel.getObjectByName('rim_fr').material = this.detailsMaterial;
            carModel.getObjectByName('rim_rr').material = this.detailsMaterial;
            carModel.getObjectByName('rim_rl').material = this.detailsMaterial;
            carModel.getObjectByName('trim').material = this.detailsMaterial;


            carModel.getObjectByName('glass').material = this.glassMaterial;

            carModel.position.set(this.params.x,this.params.y,this.params.z);
            var hornMaterial =  new THREE.MeshPhysicalMaterial({
                color: 0xff0000,
                metalness: 0,
                roughness: 0.1,
                transmission: 0.3,
                transparent: true
            });
            var params = this.params;

            await loader.load('./assets/models/horn.glb', function (gltf) {

                const model = gltf.scene.children[0];
                
                //model.scale(new THREE.Vector3(0.5,0.5,0.5));
                model.position.set(params.x+2,params.y+0.5,params.z);
                model.rotation.x=-Math.PI + 0.3;
                var mat = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    metalness: 1.0,
                    roughness: 0.5
                });
                
                model.material = hornMaterial
                model.children[0].material = hornMaterial

                resolve([carModel,model]);
            });




        
    });

}