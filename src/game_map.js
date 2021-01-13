import * as THREE from '../node_modules/three/build/three.module.js';

import { Route } from './route.js';

//tiles en haut à gauche

export class GameMap {
  constructor(src = "assets/map/map1.json") {
    //(async ()=>{await load_json(src);})();
    this.src = src;
  }
}

GameMap.prototype.init = async function () {
  await fetch(this.src).then(r => r.json()).then(data => {
    this.mapdata = data
    console.log("map json loaded!")
  });

  this.gridSize = 5;
  this.data = JSON.parse("[" + this.mapdata.layer[0].data["#text"] + "]");
  this.extras = JSON.parse("[" + this.mapdata.layer[1].data["#text"] + "]");
  this.height = parseFloat(this.mapdata["@height"])
  this.width = parseFloat(this.mapdata["@width"])
  this.map = []
  this.routes = []
  this.routesMap = {}
  for (let y = 0; y < this.height; y++) {
    this.map.push([]);
    for (let x = 0; x < this.width; x++) {
      this.map[y].push(this.data[y * this.width + x]);
      if (this.extras[y * this.width + x] == 9) {
        this.offsetX = x
        this.offsetY = y
      }
    }
  }
  this.squareShape = new THREE.Shape();
  let g = this.gridSize;
  this.squareShape.moveTo(0, 0);
  this.squareShape.lineTo(0, g);
  this.squareShape.lineTo(g, g);
  this.squareShape.lineTo(g, 0);
  this.squareShape.lineTo(0, 0);

  this.geometry = new THREE.ShapeGeometry(this.squareShape, 20);
  this.material = new THREE.MeshBasicMaterial({
    color: 0x00ff00
  });
  this.mapGroup = new THREE.Group();


  const extrudeSettings = {
    steps: 10,
    depth: 0.1,
    bevelEnabled: false
  };

  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {

      //if(this.map[y][x] == 1){
      if (this.data[y * this.width + x] == 1) {

        let squareMesh = new THREE.Mesh(this.geometry, this.material);

        //let squareMesh = new THREE.ExtrudeGeometry( this.geometry ,extrudeSettings);
        squareMesh.position.set(-(x * g - (this.offsetX - 1) * g), y * g - (this.offsetY + 1) * g, 0);
        this.mapGroup.add(squareMesh);
      }
    }
  }

  this.mapGroup.name = "map"

  this.mapGroup.rotation.x = -Math.PI / 2;


  this.mapGroup.rotation.z = -Math.PI;

  this.mapGroup.position.y = -0.01;
  scene.add(this.mapGroup);

  this.makeRoutes();
}

GameMap.prototype.makeRoutes = function () {
  this.routeData = this.mapdata.objectgroup.find((el)=>{return el["@name"]=="routes"});
  this.exitsData = this.mapdata.objectgroup.find((el)=>{return el["@name"]=="exits"});
  this.questionsData = this.mapdata.objectgroup.find((el)=>{return el["@name"]=="questions"});
  var dotMaterial = new THREE.PointsMaterial({
    size: 7,
    sizeAttenuation: false,
    color: 0xff00ff
});
  for(let i = 0; i< this.routeData.object.length;i++){
    let object = this.routeData.object[i];
    object.x = parseFloat(object["@x"]);
    object.y = parseFloat(object["@y"]);
    let polygon = object.polygon;

    let origin = this.m2w(object.x,0,-object.y);

    var dotGeometry = new THREE.Geometry();
    dotGeometry.vertices.push(origin);
    scene.add(new THREE.Points(dotGeometry, dotMaterial));
    console.log(object);
    if(object.polygon != undefined){
      var results = object.polygon["@points"].matchAll(/(-?\d+),(-?\d+)/g)
    }
    else{
      var results = object.polyline["@points"].matchAll(/(-?\d+),(-?\d+)/g)
    }
    var dotMaterial = new THREE.PointsMaterial({
      size: 7,
      sizeAttenuation: false,
      color: 0x0000ff
  });
  
    let L = []
    let previous = []
    for(let result of results){
      let x = parseFloat(result[1])
      let y = parseFloat(result[2])

      let pos = this.m2w(object.x + x,0,-object.y -y);
      let current = [pos.x,0,pos.z]
      if (previous.length == 0){
        previous = (current);
      }

      else{
        let L2 = [previous,current];
        previous = (current);
        L.push(L2);
      }
      var dotGeometry = new THREE.Geometry();
      dotGeometry.vertices.push(pos);
      
      scene.add(new THREE.Points(dotGeometry, dotMaterial));
    }
    if(object.polygon != undefined){
      L.push([L[L.length-1][1],L[0][0]]);
    }
    let R = new Route(L);
    if(object.polygon != undefined){
      R.addExit(R);
    }

    let id = object["@id"];
    R.route_id =  id;
    this.routesMap[id] = R;
    this.routes.push(R);

  }


  for(let i = 0; i < this.exitsData.object.length;i++){
    let object = this.exitsData.object;
    let from = parseFloat(object[i].properties.find((el)=>{return el["@name"]=="from"})['@value'])
    let to = parseFloat(object[i].properties.find((el)=>{return el["@name"]=="to"})['@value'])
    this.routesMap[from].addExit(this.routesMap[to]);
  }


  for(let i = 0; i < this.questionsData.object.length;i++){
    let object = this.questionsData.object[i];
    let question = object.properties.find((el)=>{return el["@name"]=="question"});
    if(question != undefined){
      question = question["@value"];
    }
    console.log(this.questionsData.object[i].properties)
  }

}

GameMap.prototype.m2w = function(x,y,z){
  //map 2 world coordinate conversion...

  let c = new THREE.Vector3();
  let ratio = this.gridSize/(this.mapdata["@tilewidth"]);
  c.x =  ratio*x - this.offsetX * this.gridSize ;
  c.z =  -ratio*z - (this.offsetY + 1) * this.gridSize;

  return c;
}