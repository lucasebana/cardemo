import { Demo } from './demo.js';
import * as THREE from '../node_modules/three/build/three.module.js';

import { Route } from './route.js';
import { GameEvent } from './game_event.js';

export class Car {
    carModel = undefined;
    wheels = [];


    constructor(routes, nth_route = 0, nth_segment = 9/*, exits_list = [1]*/) {


        this.routes = routes;
        this.nth_route = nth_route;
        this.nth_segment = nth_segment;

        this.nth_route0 = nth_route;
        this.nth_segment0 = nth_segment;

        //this.exits_list = exits_list;
        this.nth_exit = 0;
        //this.pointsPath = pointsPath;

        this.fraction = 0;
        this.stopCar = false;

        this.lastTime = -1; 
        this.speed = 4;// unité/s
        this.slowmo_factor = 1;

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
    if(this.lastTime === -1){
        var deltaTime = 1/60;
    }
    else{
        var deltaTime =-time - this.lastTime;
    }
    const up = new THREE.Vector3(0, 0, -1);
    const axis = new THREE.Vector3();

    let route = this.routes[this.nth_route];
    let segment = route.path.curves[this.nth_segment];
    let exitPoints = route.exitPoints;

    const newPosition = route.path.curves[this.nth_segment].getPoint(this.fraction);
    const tangent = route.path.curves[this.nth_segment].getTangent(this.fraction);
    this.carModel.parent.position.copy(newPosition);

    axis.crossVectors(up, tangent).normalize();
    
    //wheels rotation
    const radians = Math.acos(up.dot(tangent));
    this.carModel.parent.quaternion.setFromAxisAngle(axis, radians);


    //this.wheels[0].rotateOnWorldAxis(axe,1);
    

    if(!this.stopCar){
    for (let i = 0; i < this.wheels.length; i++) {
        this.wheels[i].rotation.x = time * this.speed * this.slowmo_factor/0.34;
        //radius : 3.4
        //this.wheels[i].rotation.x += this.fraction * segment.getLength() / (0.34*this.slowmo_factor)

    }
    }
    
    
    if (route.callbacks[this.nth_segment] != undefined) {
        let callback = route.callbacks[this.nth_segment];
        
        if (callback.triggered == false) {
            let distance = callback.trigger_distance / segment.getLength();

            if (isNaN(segment.getUtoTmapping(this.fraction + distance, 0))) {
                this.displayQuestion(callback);
                callback.triggered = true;
                callback.active = true;
            }
            if(callback.active && callback.slowmo){
                if(this.slowmo_factor > 0.1){
                    this.slowmo_factor /= 8
                }
            }
        }

        if(callback.active == true){
            //g(this.fraction)
            if(this.fraction>=1-0.1){
                this.stopCar = true;
            }
            
        }
    
    }

    
    if(!this.stopCar){
        this.fraction += deltaTime * this.speed * this.slowmo_factor / (segment.getLength()) ;
    }



        if (this.fraction > 1) {
            this.fraction = 0;
            let next_route = route.getNext(this.nth_segment);
            if (next_route != null) {
                if (next_route != -1) {
                    this.nth_route = this.routes.indexOf(next_route);
                } else {
                    this.nth_route = this.nth_route0;
                }
            } else {
                if (this.nth_segment < route.controlPoints.length - 1) {
                    this.nth_segment++;
                } else {
                    this.nth_segment = 0;
                }
            }
        }
    

    this.lastTime = - time;
}

Car.prototype.displayQuestion = function(game_event){
    let questionDiv = document.createElement("div");
    questionDiv.innerHTML = game_event.text;
    questionDiv.classList.add("dialog_textbox");
    let container = document.querySelector("#container");
    document.body.insertBefore(questionDiv, container);

    let answersDiv = document.createElement("div");
    answersDiv.id = "answers_container";
    for(let i=0; i < game_event.choices.length;i++){
        let answerA = document.createElement("a");
        answerA.style.setProperty('--idelay',i)

        answerA.id = "answer_"+i
        answerA.innerHTML = game_event.choices[i];
        answerA.classList.add("answerA")
        answerA.addEventListener("click",this.switchRoute(i,game_event,questionDiv,answersDiv));
        answersDiv.appendChild(answerA);
    }
    
    document.body.insertBefore(answersDiv, container);
    

    /*
    var div = document.createElement("div");
    div.innerHTML = "Bienvenue dans IA vs. WILD!<br/>";
    div.classList.add("dialog_textbox");
    var container = document.querySelector("#container");
    document.body.insertBefore(div, container);
    */
}


Car.prototype.switchRoute = function(i,game_event,questionDiv,answersDiv){
    
    return (event)=>{
    event.preventDefault();
    this.stopCar = false;

    game_event.active = false;
    this.slowmo_factor = 1;


    let r = game_event.route;
    r.defaultExits[game_event.segment] = game_event.exits[i];

    questionDiv.classList.add("fadeout");
    answersDiv.classList.add("fadeout");

    setTimeout(()=>{
        questionDiv.style.display="none";
        answersDiv.style.display="none";
    },1000)

    


}
}