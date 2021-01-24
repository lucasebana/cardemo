import {Demo} from './demo.js';
import * as THREE from '../node_modules/three/build/three.module.js';
import {Route} from './route.js';
import {GameEvent} from './game_event.js';

export class Car {
    carModel = undefined;
    wheels = [];
    constructor(routes, nth_route = 0, nth_segment = 0/*, exits_list = [1]*/ ) {


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
        this.speed = 9; // unité/s
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
    if (this.lastTime === -1) {
        var deltaTime = 1 / 60;
        this.deltaTimeCount = 0;
        this.deltaTimeAvg = 1 / 60;
        this.deltaTimeN = 0;
        this.currentCallbacks = [];
    } else {
        var deltaTime = -time - this.lastTime;
    }

    /*
    if (this.deltaTimeN < 60 * 1000) {
        this.deltaTimeN++;
        this.deltaTimeCount += deltaTime;
    } else {
        this.deltaTimeAvg = this.deltaTimeCount / this.deltaTimeN;
        this.deltaTimeN = 0;
        this.deltaTimeCount = 0;
    }
    */


    //// Update car position


    const up = new THREE.Vector3(0, 0, -1);
    var axis = new THREE.Vector3();

    let route = this.routes[this.nth_route];
    let segment = route.path.curves[this.nth_segment];

    this.newPosition = route.path.curves[this.nth_segment].getPoint(this.fraction);
    const tangent = route.path.curves[this.nth_segment].getTangent(this.fraction);


    this.carModel.parent.position.copy(this.newPosition);

    axis.crossVectors(up, tangent).normalize();
    if (axis.equals(new THREE.Vector3(0, 0, 0))) {
        axis = new THREE.Vector3(0, 1, 0);
    }

    //wheels rotation
    const radians = Math.acos(up.dot(tangent));
    this.carModel.parent.quaternion.setFromAxisAngle(axis, radians);


    //this.wheels[0].rotateOnWorldAxis(axe,1);


    if (!this.stopCar) {
        for (let i = 0; i < this.wheels.length; i++) {
            this.wheels[i].rotation.x = time * this.speed * this.slowmo_factor / 0.34;
            //radius : 3.4
            //this.wheels[i].rotation.x += this.fraction * segment.getLength() / (0.34*this.slowmo_factor)

        }
    }


    if (route.callbacks[this.nth_segment] != undefined) {
        var callbacks = route.callbacks[this.nth_segment];
        for (let c = 0; c < callbacks.length; c++) {
            let callback = callbacks[c];
            if (callback.triggered == false) {
                let distance = callback.trigger_distance / segment.getLength();

                if (isNaN(segment.getUtoTmapping(this.fraction + distance + (1 - callback.ratio), 0))) {
                    this.displayQuestion(callback);
                    callback.triggered = true;
                    callback.active = true;
                    this.currentCallbacks.push(callback);
                }

                if (callback.active && callback.slowmo) {
                    if (this.slowmo_factor > 0.18) {
                        this.slowmo_factor /= 5
                    }
                }
            }

            if (callback.active == true) {
                //g(this.fraction)
                if (this.fraction >= 1 - 0.1) {
                    if(callback.stop){
                        this.stopCar = true;
                    }
                }

            }
        }
    }


    if (!this.stopCar) {
        //console.log(deltaTime * this.speed * this.slowmo_factor / (segment.getLength()));
        this.fraction += this.deltaTimeAvg * this.speed * this.slowmo_factor / (segment.getLength());
        this.moved = true;
    }



    if (this.fraction > 1) {

        for(let ii = 0; ii < this.currentCallbacks.length; ii++){
            if(!this.currentCallbacks[ii].answered){
                if(this.currentCallbacks[ii].questionDiv != undefined){
                    this.currentCallbacks[ii].questionDiv.classList.add("fadeout");
                    this.currentCallbacks[ii].answersDiv.classList.add("fadeout");
                    
                    this.currentCallbacks[ii].questionDiv.style.display="none";
                    this.currentCallbacks[ii].answersDiv.style.display="none";
                    /*setTimeout((()=>{
                        this.currentCallbacks[ii].questionDiv.style.display="none";
                        this.currentCallbacks[ii].answersDiv.style.display="none";
                    }).bind(this),200);
                    */
                }
                if(this.currentCallbacks[ii].exits[0]!=undefined){
                    if(this.currentCallbacks[ii].exits[0][0] == "*"){
                        this.specialEvent(this.currentCallbacks[ii].exits[0]);
                        this.currentCallbacks[ii].answered = true;
                    }
                }
            }
        }

        this.fraction = 0;
        let next = route.getNext(this.nth_segment);
        let next_route = next[0];
        let next_segment = next[1];
        if (next_route != null) {
            if (next_route != -1) {
                this.nth_route = this.routes.indexOf(next_route);
                this.nth_segment = next_segment;
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

        
        this.slowmo_factor = 1;
        this.currentCallbacks = [];
    }


    this.lastTime = -time;
}

Car.prototype.displayQuestion = function (game_event) {
    if (game_event.text != undefined) {
        let questionDiv = document.createElement("div");
        questionDiv.innerHTML = game_event.text;
        questionDiv.classList.add("dialog_textbox");
        let container = document.querySelector("#container");
        document.body.insertBefore(questionDiv, container);

        let answersDiv = document.createElement("div");
        answersDiv.id = "answers_container";
        for (let i = 0; i < game_event.choices.length; i++) {
            let answerA = document.createElement("a");
            answerA.style.setProperty('--idelay', i)

            answerA.id = "answer_" + i
            answerA.innerHTML = game_event.choices[i];
            answerA.classList.add("answerA")

            //set default exit if defined...
            if(game_event.exits[0] != undefined){
                    game_event.route.defaultExits[game_event.segment] = game_event.exits[0];
            }
            
            answerA.addEventListener("click", this.switchRoute(i, game_event, questionDiv, answersDiv));
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

       game_event.questionDiv = questionDiv;
       game_event.answersDiv = answersDiv;
    }
    else{
        if(game_event.log != undefined){
            //alert(game_event.log["@value"]);
            this.logDom = document.querySelector(".game_log .game_log_container span");
            let d = document.createElement("div");
            var v;
            if(game_event.log["@value"] == undefined){
                v = game_event.log;
            }
            else{
                v = game_event.log["@value"]
            }
            d.innerHTML = v;
            this.logDom.after(d);
        }
        if(game_event.exits[0] != undefined){
            this.specialEvent(game_event.exits[0]);
            game_event.answered = true;
        }
    }

}


Car.prototype.switchRoute = function (i, game_event, questionDiv, answersDiv) {

    return (event) => {
        event.preventDefault();
        this.stopCar = false;

        game_event.active = false;
        this.slowmo_factor = 1;


        let r = game_event.route;
        let exit = game_event.exits[i];
        if (isNaN(exit)) {
            this.specialEvent(exit);
            game_event.answered = true;
        } else {
            r.defaultExits[game_event.segment] = exit;
        }

        questionDiv.classList.add("fadeout");
        answersDiv.style.display = "none";
        setTimeout(() => {
            questionDiv.style.display = "none";
            
        }, 1000)
    }
}

Car.prototype.specialEvent = function (event) {
    let TL = window.demo.scenario1.traffic_light;
    switch (event) {
        case "*stopTrafficLights":
            var callback = new GameEvent(undefined,"Arrêt au feu",[],["*stopEvent"],1,false,false, 1);
            this.routes[this.nth_route].addCallback(this.nth_segment,callback);
            break;
        case "*stopEvent":
            window.demo.paused = true;
            setTimeout(()=>{window.demo.paused = false;},4000)
            break;
            
        case "*runTrafficLights":
            var callback = new GameEvent(undefined,"Alerte : feu grillé",[],["*crashStop"],1,false,false, 1);
            this.routes[this.nth_route].addCallback(this.nth_segment+1,callback);
            break;
        case "*crashStop":
            
            window.demo.paused = true;
            
            this.gameover("trafficlight");
            break;
        case "*redTrafficLight":
            TL.switchLights(TL.model,3,"red");
            break;
        case "*orangeTrafficLight":
            TL.switchLights(TL.model,2,"orange");
            break;
        case "*greenTrafficLight":
            TL.switchLights(TL.model,1,"green");
            break;

        default:
            console.log("evenement inconnu");
            break;
    }
}

Car.prototype.gameover = function(arg){
    if(arg == "trafficlight"){
        let gameover = document.createElement("div");
        gameover.classList.add("gameover");
        gameover.classList.add("fadein");
        gameover.innerHTML = "gameover + explication...";

        

        let continue_btn = document.createElement("a");
        continue_btn.innerHTML="Continuer";
        
              

        let container = document.querySelector("#container");
        container.appendChild(gameover);
        gameover.appendChild(continue_btn);
        window.demo.scenario1.glitchEffect = true;


        continue_btn.addEventListener("click",()=>{
            window.demo.scenario1.glitchEffect = false;
            gameover.style.display="none";
            window.demo.paused = false;
        })
    }
}