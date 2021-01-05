import * as THREE from '../node_modules/three/build/three.module.js';

import { Route } from './route.js';

export class Segment{
    //chargeable json ? 
    constructor(options = null){

        if(options != null){
            //this.gridSize = options.gridSize;
            this.width = options.width;
            this.length = options.length;
            this.road_keyPoints2 = options.road_keyPoints;
            //this.roadShape = options.roadShape;
            //this.sidewalksShapes = options.sideWalkShapes;
            this.route = options.route;
            this.x = options.x;
            this.y = options.y;
            
            this.offsetX = 0;
            this.offsetY = 0;
        }


        this.models = [];
        
        this.gridSize = 5;
        this.width = 4;
        this.length = 4;
        

        this.routeHeight;
        this.sideWalkHeight;
        this.road_keyPoints2 = [
            [1,0],[1,3],[3,3],[3,0]
        ];

        this.road_keyPoints2.forEach(el=>{el[0]*=this.gridSize;el[1]*=this.gridSize})

        this.road_keyPoints = Route.toVec2Array(this.road_keyPoints2);
        
        let control_points = [
            [[this.gridSize/2, 0, 0], [this.gridSize/2, 0, -this.gridSize*this.length]],
        ];

        this.route = new Route(control_points);


        //
        
        //this.route_shape = new THREE.Shape(this.route_keyPoints);
        this.road_shape = new THREE.Shape();
        /*
        this.road_shape.moveTo(1*this.gridSize,0)
        this.road_shape.lineTo(1*this.gridSize,0)
        this.road_shape.lineTo(1*this.gridSize,4*this.gridSize)
        this.road_shape.lineTo(3*this.gridSize,4*this.gridSize)
        this.road_shape.lineTo(3*this.gridSize,0)
        */
       let g = this.gridSize;
       
       this.road_shape.moveTo(1*g,1*g)
       this.road_shape.lineTo(1*g,5*g)
       this.road_shape.lineTo(5*g,5*g)
       this.road_shape.lineTo(5*g,1*g)
       this.road_shape.lineTo(1*g,1*g)
       
       this.road_hole = new THREE.Shape();

       this.road_hole.moveTo(3*g,4*g)
       this.road_hole.lineTo(4*g,4*g)
       this.road_hole.lineTo(4*g,3*g)
       this.road_hole.lineTo(3*g,3*g)
       this.road_hole.lineTo(3*g,4*g)

       this.road_hole2 = new THREE.Shape();

       this.road_hole2.moveTo(3*g,3*g)
       this.road_hole2.lineTo(4*g,3*g)
       this.road_hole2.lineTo(4*g,2*g)
       this.road_hole2.lineTo(3*g,2*g)
       this.road_hole2.lineTo(3*g,3*g)

       this.road_shape.holes = [this.road_hole,this.road_hole2]


        this.sidewalk_shape = new THREE.Shape();
        this.sidewalk_shape.moveTo(1*this.gridSize,0)
        this.sidewalk_shape.lineTo(1*this.gridSize,4*this.gridSize)
        this.sidewalk_shape.lineTo(0*this.gridSize,4*this.gridSize)
        this.sidewalk_shape.lineTo(0*this.gridSize,0*this.gridSize)
        this.sidewalk_shape.lineTo(1*this.gridSize,0*this.gridSize)
        

        this.sidewalk_shape2 = new THREE.Shape();
        this.sidewalk_shape2.moveTo(3*this.gridSize,0)
        this.sidewalk_shape2.lineTo(3*this.gridSize,4*this.gridSize)
        this.sidewalk_shape2.lineTo(4*this.gridSize,4*this.gridSize)
        this.sidewalk_shape2.lineTo(4*this.gridSize,0*this.gridSize)
        this.sidewalk_shape2.lineTo(3*this.gridSize,0*this.gridSize)

        
        
        this.geometry = new THREE.ShapeGeometry( this.road_shape ,20);
        this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        this.roadmesh = new THREE.Mesh( this.geometry, this.material ) ;
        this.roadmesh.rotation.x = -Math.PI / 2;
        this.roadmesh.position.x = -this.width / 2 * this.gridSize;
        this.roadmesh.position.x = -this.offsetX * this.gridSize;
        this.roadmesh.position.y = -0.01;
        
        //window.scene.add( this.roadmesh );

        const extrudeSettings = {
            steps: 10,
            depth: 0.23,
            bevelEnabled: false
        };        
        this.geometry2 = new THREE.ExtrudeGeometry( this.sidewalk_shape ,extrudeSettings);
        
        this.material2 = new THREE.MeshBasicMaterial( { color: 0xff0000,wireframe:false} );

        this.bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: 0X474747,
            metalness: 0.1,
            roughness: 1,
            clearcoat: 0.00,
            clearcoatRoughness: 0.05,
        });

        this.sidewalkmesh1 = new THREE.Mesh( this.geometry2, this.bodyMaterial ) ;
        this.sidewalkmesh1.rotation.x = -Math.PI / 2;
        this.sidewalkmesh1.position.x = -this.width / 2 * this.gridSize;
        this.sidewalkmesh1.position.x = -this.offsetX * this.gridSize;
        //window.scene.add( this.sidewalkmesh1 );
        
        this.geometry3 = new THREE.ExtrudeGeometry( this.sidewalk_shape2 ,extrudeSettings);
        
        this.sidewalkmesh2 = new THREE.Mesh( this.geometry3, this.bodyMaterial ) ;
        this.sidewalkmesh2.rotation.x = -Math.PI / 2;
        this.sidewalkmesh2.position.x = -this.width / 2 * this.gridSize;
        this.sidewalkmesh2.position.x = -this.offsetX * this.gridSize;
        //window.scene.add( this.sidewalkmesh2 );





    }
}

