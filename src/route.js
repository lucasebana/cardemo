import {
    makePath,
    toVec3Array
} from './make_path.js'


export class Route {
    constructor(controlPoints, exits = [], parent = null) {
        /* controlPoints : see make_path.js */
        /* exits : [Route] */
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

        this.parent = parent;
        this.path = makePath(this.controlPoints);
        this.count_exits = () => {
            this.exitPoints = [];
            this.exitInfo = new Array();
            
            
            this.exits.forEach((exit,i) => {
                this.exitPoints.push(exit.controlPoints[0][0]);
                //QUEL SEGMENT
                let nth_segment = 0;
                let stop = false;
                while (nth_segment < this.controlPoints.length && !stop) {
                    if (this.controlPoints[nth_segment][this.controlPoints[nth_segment].length - 1]
                        .equals(exit.controlPoints[0][0])) {
                        stop = true;
                    }
                    nth_segment++;
                }
                this.exitInfo.push({segment:nth_segment-1,route:this.exits[i]});
        
            });
        }
        this.count_exits();
        if (this.parent != null) {
            this.parent.addExit(this);
        }
    }

    static makePath = makePath;
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
    var points = this.path.curves.reduce((p, d) => [...p, ...d.getPoints(20)], []);
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

Route.prototype.getU = function (point, threshold = 1.e-2) {
    //this.path

    return;
}
/*
Route.prototype.getNext = function(n){
    return this.exits[n];
}
*/