import { Demo } from './demo.js';
import * as THREE from '../node_modules/three/build/three.module.js';
export class Car {
    carModel = undefined;
    wheels = [];


    constructor(routes, nth_route = 0, nth_segment = 0, exits_list=[1] ) {

        
        this.routes = routes;
        this.nth_route = nth_route;
        this.nth_segment = nth_segment;

        this.nth_route0 = nth_route;
        this.nth_segment0 = nth_segment;
        
        this.exits_list = exits_list;
        this.nth_exit = 0;
        //this.pointsPath = pointsPath;

        this.fraction = 0;

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
            metalness: 0,
            roughness: 0.1,
            transmission: 0.9,
            transparent: true
        });

        this.shadow = new THREE.TextureLoader().load('./assets/images/ferrari_ao.png');
    }
};


Car.prototype.loadModel = async function (loader) {
    return new Promise(async (resolve, reject) => {

        let tmpCarModel;
        var bodyMaterial_ = this.bodyMaterial;


        var detailsMaterial_ = this.detailsMaterial;
        var glassMaterial_ = this.glassMaterial;
        var shadow_ = this.shadow;

        await loader.load('./assets/models/ferrari.glb', (gltf) => {

            const carModel = gltf.scene.children[0];

            carModel.name = "car";

            carModel.getObjectByName('body').material = bodyMaterial_;

            carModel.getObjectByName('rim_fl').material = detailsMaterial_;
            carModel.getObjectByName('rim_fr').material = detailsMaterial_;
            carModel.getObjectByName('rim_rr').material = detailsMaterial_;
            carModel.getObjectByName('rim_rl').material = detailsMaterial_;
            carModel.getObjectByName('trim').material = detailsMaterial_;


            carModel.getObjectByName('glass').material = glassMaterial_;

            this.wheels.push(
                carModel.getObjectByName('wheel_fl'),
                carModel.getObjectByName('wheel_fr'),
                carModel.getObjectByName('wheel_rl'),
                carModel.getObjectByName('wheel_rr')
            );

            let wheel = this.wheels[0];

            // shadow
            const mesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(0.655 * 4, 1.3 * 4),
                new THREE.MeshBasicMaterial({
                    map: shadow_,
                    blending: THREE.MultiplyBlending,
                    toneMapped: false,
                    transparent: true
                })
            );

            mesh.rotation.x = -Math.PI / 2;
            mesh.renderOrder = 2;
            carModel.add(mesh);

            resolve(carModel);
        });
    });
}

Car.prototype.context = function (time) {
    const up = new THREE.Vector3(0, 0, -1);
    const axis = new THREE.Vector3();

    let coeff = 0
    /*if(coeff+this.fraction > 1){
        coeff = -this.fraction + 1
    }
    */

    if (coeff + this.fraction < 0) {
        coeff = 1 - this.fraction
    }
    let route = this.routes[this.nth_route];
    let segment = route.path.curves[this.nth_segment];

    //route.path.
    let exitPoints = route.exitPoints;




    const newPosition = route.path.curves[this.nth_segment].getPoint(this.fraction);
    const tangent = route.path.curves[this.nth_segment].getTangent(this.fraction);
    //this.carModel.position.copy(newPosition);
    this.carModel.parent.position.copy(newPosition);

    axis.crossVectors(up, tangent).normalize();


    const radians = Math.acos(up.dot(tangent));

    //demo.carGroup.quaternion.setFromAxisAngle( axis, radians );
    this.carModel.parent.quaternion.setFromAxisAngle(axis, radians);


    var axe = new THREE.Vector3(0, 0 - 1.155);
    //this.wheels[0].rotateOnWorldAxis(axe,1);

    for (let i = 0; i < this.wheels.length; i++) {
        this.wheels[i].rotation.x = time * Math.PI;
    }



    if (window.continue == true) {
        
        this.fraction += 0.03 / (segment.getLength());
        if (this.fraction > 1) {
            this.fraction = 0;

            //this.nth_segment++;
            /*
            if (route.exitInfo[0].segment == this.nth_segment) {
                let r = route.exitInfo[2].route;
                this.nth_route = this.routes.indexOf(r);
                this.nth_segment = 0;
            }
            */
           

            /*
           if(route.exitInfo.length > 0){
           if(this.nth_segment == route.exitInfo[this.exits_list[this.nth_exit]].segment){
            let next_route = route.exitInfo[this.exits_list[this.nth_exit]].route
            this.nth_route = this.routes.indexOf(next_route);
            if(this.nth_exit < this.exits_list.length -1){
                this.nth_exit++;
            }
            else{
                this.nth_exit = 0;
            }
           }
            }
            else{
                this.nth_route = this.nth_route0;
                
                this.nth_segment = this.nth_segment0;
            }
            */
           let next_route = route.getNext(this.nth_segment);
           if(next_route != null){
           if(next_route != -1){
            this.nth_route = this.routes.indexOf(next_route);
           }
           else{
               this.nth_route = this.nth_route0;

           }
        }else{
            if(this.nth_segment < route.controlPoints.length -1){
            this.nth_segment++;

            
            }
            else{
                this.nth_segment = 0;
            }

        }
            

        }
    }
}