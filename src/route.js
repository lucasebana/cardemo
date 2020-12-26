import { makePath,toVec3Array } from './make_path.js'


export class Route {
    constructor(controlPoints, exits=[], parent = null) {
        /* controlPoints : see make_path.js */
        /* exits : [Route] */
        //ou [[n,Route]], troncon n

        this.controlPoints = [];
        if (!(controlPoints[0][0] instanceof THREE.Vector3)) {

            for (let i = 0; i < controlPoints.length; i++) {
                this.controlPoints.push(toVec3Array(controlPoints[i]));
            }
        }
        else{
            this.controlPoints = controlPoints;
        }
        
        this.exits = exits;
        this.parent = parent;
        this.path = makePath(this.controlPoints);
        this.exitPoints = [];
        this.exits.forEach(exit => {
            
            this.exitPoints.push(exit[0].path[0]);
        });
        if(this.parent != null){
            this.parent.addExits([this]);
        }
    }

    static makePath = makePath;
    static toVec3Array = toVec3Array;
}

Route.prototype.addExits = function(exits_){
        //this.exits.push(...exits_)
        this.exitPoints = [];
        exits_.forEach(exit => {
            if (!(exit in this.exits)){
                this.exitPoints.push(exit.path[0]);
                this.exits.push(exit);
            }
        });
}

Route.prototype.getExits = function (point) {
    let a = [];
    this.exits.forEach(exit => {
        if(point.equals(exit.path[0])){
            a.push[exit];
        }
    });
    return a;
}

Route.prototype.getLine = function(material){
    var points = this.path.curves.reduce((p, d) => [...p, ...d.getPoints(20)], []);
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material);
}


/*
Route.prototype.getNext = function(n){
    return this.exits[n];
}
*/