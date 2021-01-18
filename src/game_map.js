import * as THREE from '../node_modules/three/build/three.module.js';
import { GameEvent } from './game_event.js';

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
  this.sidewalk = JSON.parse("[" + this.mapdata.layer[2].data["#text"] + "]");
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
  this.squareshape = new THREE.Shape();
  this.squareshape.moveTo(0,0)
  this.squareshape.lineTo(1*this.gridSize,0*this.gridSize)
  this.squareshape.lineTo(1*this.gridSize,1*this.gridSize)
  this.squareshape.lineTo(0*this.gridSize,1*this.gridSize)
  this.squareshape.lineTo(0*this.gridSize,0*this.gridSize)

  const extrudeSettings = {
    steps: 10,
    depth: 0.3,
    bevelEnabled: false
  };
  this.geometry2 = new THREE.ExtrudeGeometry( this.squareshape ,extrudeSettings);

  this.road_material = new THREE.MeshBasicMaterial({
    color: 0x41413F
  });
  this.sideroad_material = new THREE.MeshPhongMaterial({
    color: 0x63635B,
    shininess:0.1
    });
  this.mapGroup = new THREE.Group();


  

  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {

      //if(this.map[y][x] == 1){
      if (this.data[y * this.width + x] == 1) {

        let squareMesh = new THREE.Mesh(this.geometry, this.road_material);

        //let squareMesh = new THREE.ExtrudeGeometry( this.squareshape ,extrudeSettings);
        squareMesh.position.set(-(x * g - (this.offsetX - 1) * g), y * g - (this.offsetY + 1) * g, 0);
        this.mapGroup.add(squareMesh);
      }

      if (this.sidewalk[y * this.width + x] == 2) {

        //let squareMesh = new THREE.Mesh(this.geometry, this.sideroad_material);

        let squareMesh = new THREE.Mesh( this.geometry2, this.sideroad_material ) ;
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
      //R.addExit(R);
      R.loopBack();
    }

    let id = object["@id"];
    R.route_id =  parseInt(id);
    this.routesMap[id] = R;
    this.routes.push(R);

  }


  for(let i = 0; i < this.exitsData.object.length;i++){
    let object = this.exitsData.object;
    let from = parseFloat(object[i].properties.find((el)=>{return el["@name"]=="from"})['@value'])
    let to = parseFloat(object[i].properties.find((el)=>{return el["@name"]=="to"})['@value'])
    this.routesMap[from].addExit(this.routesMap[to]);
  }

  var checkUndefined = function(arg){
    if(arg){return true;}else{return false;}
  };


  for(let i = 0; i < this.questionsData.object.length;i++){
    let object = this.questionsData.object[i];
    let question = object.properties.find((el)=>{return el["@name"]=="question"});
    let nth_segment = object.properties.find((el)=>{return el["@name"]=="nth_segment"});
    let r1 = object.properties.find((el)=>{return el["@name"]=="r1"});
    let r2 = object.properties.find((el)=>{return el["@name"]=="r2"});
    let r3 = object.properties.find((el)=>{return el["@name"]=="r3"});
    //let r3 = object.properties.find((el)=>{return el["@name"]=="r2"});

    let e1 = object.properties.find((el)=>{return el["@name"]=="e1"});
    let e2 = object.properties.find((el)=>{return el["@name"]=="e2"});
    let e3 = object.properties.find((el)=>{return el["@name"]=="e3"});


    let routeId = object.properties.find((el)=>{return el["@name"]=="routeId"});
    if(question != undefined){
      question = question["@value"];
    }
    nth_segment = parseInt(nth_segment["@value"]);
    let nquestions = 0;
    
    var rep = []
    var quest = []
    if(checkUndefined(e1)){
      r1 = (r1["@value"]);e1 = (e1["@value"]);rep.push(e1);quest.push(r1);
      if(checkUndefined(e2)){
        r2 = (r2["@value"]);e2 = (e2["@value"]); rep.push(e2);quest.push(r2);
        if(checkUndefined(e3)){ r3 = (r3["@value"]);e3 = (e3["@value"]);rep.push(e3);quest.push(r3); }
      }
    }

    
    

    routeId = parseInt(routeId["@value"]);

    var events = [];
    var choices = [];
    /*
    if(rep.every((i)=>{return !isNan(i)})){
      for(let i = 0; i< nquestions;i++){
        events.push(rep[i]);
      }
    }
    else if(rep.every((i)=>i == "")){
      console.log(rep.length);
      for(let i = 0; i< nquestions;i++){
        events.push(i-1);//changements de routes par defaut dans l'ordre de definition dans le json...
      }
    }
    else if(rep.every((i)=>{i[0] == "*"})){
      console.log("evenement special");
    }
    */

    for(let i = 0; i < rep.length; i++){
      
      if(rep[i] == ""){//si vide
        events.push(i-1);//changements de routes par defaut dans l'ordre de definition dans le json...
      }
      else if(!isNaN(rep[i])){//si c'est un nombre
        events.push(parseInt(rep[i]));
      }
      else{
        events.push(rep[i]);//event special... stop car ou evenement_n_i => appelle une fct, etc..
      }
      choices.push(quest[i]);
    }
    



    //let choix = [r1,r2]
    let callback = new GameEvent(question,choices,events,10,true);
    this.routesMap[routeId].addCallback(nth_segment,callback);

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