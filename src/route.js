import {
    makePath,
    toVec3Array,
    toVec2Array
} from './make_path.js'


export class Route {
    constructor(controlPoints, parent = null, exits = [], defaultExits = []) {
        /* controlPoints : see make_path.js */
        /* parents : Route*/
        /* exits : [Route] */
        /* defaultExits : [int,int,etc.] */
        //ou [[n,Route]], troncon n

        this.controlPoints = [];
        if (!(controlPoints[0][0] instanceof THREE.Vector3)) {

            for (let i = 0; i < controlPoints.length; i++) {
                this.controlPoints.push(toVec3Array(controlPoints[i]));
            }
        } else {
            this.controlPoints = controlPoints;

        }

        this.exits = exits;
        this.defaultExits = defaultExits;
        if(defaultExits.length == 0){
            this.defaultExits = new Array(controlPoints.length).fill(-1);
        }
        this.parent = parent;
        this.path = makePath(this.controlPoints);
        this.count_exits = () => {
            this.exitPoints = [];
            this.exitInfo = new Map();
            if(this.loopback) this.loopBack();
            
            this.exits.forEach((exit,i) => {
                this.exitPoints.push(exit.controlPoints[0][0]);
                //QUEL SEGMENT
                let nth_segment = 0;
                let stop = false;
                while (nth_segment < this.controlPoints.length && !stop) {
                    
                    let nth_segment2 = 0;
                    while (nth_segment2 < exit.controlPoints.length && !stop){
                    let cp = this.controlPoints[nth_segment];
                    let l = cp.length;
                    
                    if(this != exit){
                    if (cp[l-1].equals(exit.controlPoints[nth_segment2][0])) {
                        //this.exitInfo.push( {segment:nth_segment,route:exit});
                        if(this.exitInfo.has(nth_segment)){
                            this.exitInfo.get(nth_segment).push[exit,nth_segment2];
                        }
                        else{
                            this.exitInfo.set(nth_segment,[[exit,nth_segment2]]);
                        }
                        stop = true;
                    }
                }
                    nth_segment2++;
                }
                    nth_segment++;
                    
                }
        
            });
            
        }
        this.count_exits();
        if (this.parent != null) {
            this.parent.addExit(this);
        }

        this.callbacks = new Array(this.path.curves.length);
        for(let i = 0; i < this.callbacks.length;i++){
            this.callbacks[i] = [];
        }

    }

    static makePath = makePath;
    static toVec2Array = toVec2Array;
    static toVec3Array = toVec3Array;
}

Route.prototype.addExit = function (exit_){ return this.addExits([exit_])}
Route.prototype.addExits = function (exits_) {
    //this.exits.push(...exits_)
    exits_.forEach(exit => {
        if (!(exit in this.exits)) {
            this.exits.push(exit);
        }
    });
    this.count_exits();
}

Route.prototype.getExits = function (point) {
    let a = [];
    this.exits.forEach(exit => {
        if (point.equals(exit.controlPoints[0][0])) {
            a.push[exit];
        }
    });
    return a;
}


Route.prototype.getLine = function (material) {
    var points = this.path.curves.reduce((p, d) => [...p, ...d.getPoints(40)], []);
    var geometry = new THREE.BufferGeometry().setFromPoints(points);

    var L = new THREE.Line(geometry, material);


    let s1 = this.controlPoints.length - 1;
    let s2 = this.controlPoints[s1].length - 1;

    var dotMaterial = new THREE.PointsMaterial({
        size: 2,
        sizeAttenuation: false,
        color: 0x0000ff
    });
    var dotGeometry = new THREE.Geometry();
    dotGeometry.vertices.push(this.controlPoints[s1][s2]);
    L.add(new THREE.Points(dotGeometry, dotMaterial));

    var dotGeometry = new THREE.Geometry();
    dotGeometry.vertices.push(this.controlPoints[0][0]);
    L.add(new THREE.Points(dotGeometry, dotMaterial));


    var dotMaterial = new THREE.PointsMaterial({
        size: 4,
        sizeAttenuation: false,
        color: 0xff0000
    });
    this.exitPoints.forEach((p) => {
        var dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push(p);

        L.add(new THREE.Points(dotGeometry, dotMaterial));
    });
    return L;
}

Route.prototype.getNext = function (nth_segment) {

    let exit = this.defaultExits[nth_segment];
    if(this.exitInfo.size > 0){
        if(exit == -1 && nth_segment != this.controlPoints.length-1){
            return [null,null];
        }
        if(this.exitInfo.has(nth_segment)){
            if(exit == -1){
                return this.exitInfo.get(nth_segment)[exit+1];
            }
            return this.exitInfo.get(nth_segment)[exit];
        }
    }
    if(typeof exit === 'string' || exit instanceof String){
        if(exit[0] == "*"){
            return [null,null];
        }
    }
    return [-1,-1];
}

Route.prototype.addCallback = function(i,callback){
    this.callbacks[i].push(callback);
    callback.route = this;
    callback.segment = i;
}
/*
Route.prototype.getNext = function(n){
    return this.exits[n];
}
*/
Route.prototype.loopBack = function(){
    this.loopback = true;
    let L = this.controlPoints.length;
    if(this.exitInfo.has(L-1)){
        this.exitInfo.get(L-1).push[this,0];
    }
    else{
        this.exitInfo.set(L-1,[[this,0]]);
    }
}