import * as THREE from '../node_modules/three/build/three.module.js';

import { Route } from './route.js';

export class Segment{
    //chargeable json ? 
    constructor(){
        this.models = [];

        this.gridSize = 5;
        this.width = 4;
        this.length = 4;

        this.routeHeight;
        this.sideWalkHeight;
        this.route_keyPoints2 = [
            [1,0],[1,3],[3,3],[3,0]
        ];

        this.route_keyPoints2.forEach(el=>{el[0]*=this.gridSize;el[1]*=this.gridSize})

        this.route_keyPoints = Route.toVec2Array(this.route_keyPoints2);


        //
        
        //this.route_shape = new THREE.Shape(this.route_keyPoints);
        this.route_shape = new THREE.Shape();
        this.route_shape.moveTo(1*this.gridSize,0)
        this.route_shape.lineTo(1*this.gridSize,0)
        this.route_shape.lineTo(1*this.gridSize,3*this.gridSize)
        this.route_shape.lineTo(2*this.gridSize,3*this.gridSize)
        this.route_shape.bezierCurveTo(2*this.gridSize,3*this.gridSize,3*this.gridSize,3*this.gridSize,2*this.gridSize,3*this.gridSize)
        this.route_shape.bezierCurveTo(3*this.gridSize,3*this.gridSize,3*this.gridSize,2*this.gridSize,3*this.gridSize,2*this.gridSize)
        //this.route_shape.absarc(2*this.gridSize,2*this.gridSize,1*this.gridSize,Math.PI/2,0,true)
        //this.route_shape
        this.route_shape.currentPoint = new THREE.Vector2(3*this.gridSize,2*this.gridSize)
        this.route_shape.lineTo(3*this.gridSize,0)
        this.route_shape.lineTo(1*this.gridSize,0)

        this.sidewalk_shape = new THREE.Shape();
        this.sidewalk_shape.moveTo(1*this.gridSize,0)
        this.sidewalk_shape.lineTo(1*this.gridSize,0)
        this.sidewalk_shape.lineTo(1*this.gridSize,3*this.gridSize)
        this.sidewalk_shape.lineTo(2*this.gridSize,3*this.gridSize)
        this.sidewalk_shape.bezierCurveTo(2*this.gridSize,3*this.gridSize,3*this.gridSize,3*this.gridSize,2*this.gridSize,3*this.gridSize)
        this.sidewalk_shape.bezierCurveTo(3*this.gridSize,3*this.gridSize,3*this.gridSize,2*this.gridSize,3*this.gridSize,2*this.gridSize)
        //this.route_shape.absarc(2*this.gridSize,2*this.gridSize,1*this.gridSize,Math.PI/2,0,true)
        //this.route_shape
        this.sidewalk_shape.currentPoint = new THREE.Vector2(3*this.gridSize,2*this.gridSize)
        this.sidewalk_shape.lineTo(3*this.gridSize,0)
        this.sidewalk_shape.lineTo(4*this.gridSize,0*this.gridSize)
        this.sidewalk_shape.lineTo(4*this.gridSize,4*this.gridSize)
        this.sidewalk_shape.lineTo(0*this.gridSize,4*this.gridSize)
        this.sidewalk_shape.lineTo(0*this.gridSize,0*this.gridSize)
        


        
        this.geometry = new THREE.ShapeGeometry( this.route_shape ,20);
        this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        this.mesh = new THREE.Mesh( this.geometry, this.material ) ;
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.x = -this.width / 2 * this.gridSize;
        this.mesh.position.y = -0.01;
        
        window.scene.add( this.mesh );


        const extrudeSettings = {
            steps: 10,
            depth: 0.23,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 1
        };
        //this.geometry2 = new THREE.ShapeGeometry( this.sidewalk_shape ,20);
        
        this.geometry2 = new THREE.ExtrudeGeometry( this.sidewalk_shape ,extrudeSettings);
        
        this.material2 = new THREE.MeshBasicMaterial( { color: 0xff0000,wireframe:true
         } );
        this.mesh = new THREE.Mesh( this.geometry2, this.material2 ) ;
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.x = -this.width / 2 * this.gridSize;
        this.mesh.position.y = -0.01;
        
        window.scene.add( this.mesh );





    }
}

