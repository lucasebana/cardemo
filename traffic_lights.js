import { Demo } from './demo.js';
import * as THREE from './node_modules/three/build/three.module.js';

export class Traffic_Light {
    model = undefined;

    constructor(pointsPath) {
        this.poleMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x333332,
            metalness: 0.6,
            roughness: 0.4,
            clearcoat: 0.05,
            clearcoatRoughness: 0.05
        });
        this.bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff0000,
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
            color: 0xffffff,
            metalness: .4,
            roughness: 0.1,
            transmission: 0.5,
            transparent: true,
            clearcoat: 1
        });

        this.shadow = new THREE.TextureLoader().load('ferrari_ao.png');

        this.pointsPath = pointsPath;
        this.fraction = 0;
    }
};


Traffic_Light.prototype.loadModel = async function (loader) {
    return new Promise(async (resolve, reject) => {

        var poleMaterial_ = this.poleMaterial;
        var bodyMaterial_ = this.bodyMaterial;
        var detailsMaterial_ = this.detailsMaterial;
        var glassMaterial_ = this.glassMaterial;
        var shadow_ = this.shadow;

        await loader.load('./assets/models/feu_tricolore.glb', function (gltf) {

            const model = gltf.scene.children[0];

            model.name = "feu_tricolore";

            model.material = poleMaterial_;
            model.getObjectByName('bulb1').material = bodyMaterial_;
            model.getObjectByName('bulb2').material = glassMaterial_;
            model.getObjectByName('bulb3').material = glassMaterial_;

            // shadow
            const mesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(0.655 * 4, 1.3 * 4),
                new THREE.MeshBasicMaterial({
                    blending: THREE.MultiplyBlending,
                    toneMapped: false,
                    transparent: true
                })
            );
            mesh.rotation.x = -Math.PI / 2;
            mesh.renderOrder = 2;
            model.add(mesh);

            resolve(model)
        });
    });
}

Traffic_Light.prototype.context = function (car, time) {

    if (window.continue == true) {

    }
}