import * as THREE from '../node_modules/three/build/three.module.js';


function makePath(controlPoints) {
    /* controlPoints : [[P0,P1],[P0,P1,P2,P3],...] */
    /* chunk : [P0,P1] */
    const pointsPath = new THREE.CurvePath();
    for (let i = 0; i < controlPoints.length; i++) {
        let chunk = controlPoints[i];
        if (chunk.length == 2) {
            
            let line = new THREE.LineCurve3(...chunk);
            pointsPath.add(line);
        } else if (chunk.length > 2) {
            const bezierLine = new THREE.CubicBezierCurve3(...chunk);
            pointsPath.add(bezierLine);
        } else {
            throw new Error("chunks of the path must at least be of length 2");
        }
    }
    return pointsPath;
}


function toVec3Array(array){
    let p = [];
    for (let j = 0; j < array.length; j++) {
        p.push(new THREE.Vector3().fromArray(array[j]));
    }
    array = p;
    return array;
}

export {makePath, toVec3Array};
/*
export function quickpath([],gridSize = 5){

}
*/


/*function testCurve(...curveShred,eventArray = null){
    console.log(curveShred)
}
*/