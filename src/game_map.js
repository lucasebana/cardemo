import * as THREE from '../node_modules/three/build/three.module.js';
import { GameEvent } from './game_event.js';

import { Route } from './route.js';
//tiles en haut à gauche

export class GameMap {
  constructor(scenario,src = "assets/map/map1.json") {
    //(async ()=>{await load_json(src);})();
    this.src = src;
    this.scenario = scenario;
  }
}

GameMap.prototype.init = async function () {
  await fetch(this.src).then(r => r.json()).then(data => {
    this.mapdata = data
    console.log("map json loaded!")
    //file converted from map1.tmx => map1.json using : 
    //https://www.freeformatter.com/xml-to-json-converter.html
    //(Prefix attributes with "@", text property name :"#text#")


  });

  this.gridSize = 6;
  this.data = JSON.parse("[" + this.mapdata.layer[0].data["#text"] + "]");
  this.extras = JSON.parse("[" + this.mapdata.layer[1].data["#text"] + "]");
  this.sidewalk = JSON.parse("[" + this.mapdata.layer[2].data["#text"] + "]");
  this.height = parseFloat(this.mapdata["@height"])
  this.width = parseFloat(this.mapdata["@width"])
  this.map = []
  this.routes = []
  this.routesMap = {}

  this.sideWalkData = this.mapdata.objectgroup.find((el) => {
    return el["@name"] == "sidewalk_lines"
  });

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

  this.geometry = new THREE.ShapeGeometry(this.squareShape, 4);
  this.squareshape = new THREE.Shape();
  this.squareshape.moveTo(0, 0)
  this.squareshape.lineTo(1 * this.gridSize, 0 * this.gridSize)
  this.squareshape.lineTo(1 * this.gridSize, 1 * this.gridSize)
  this.squareshape.lineTo(0 * this.gridSize, 1 * this.gridSize)
  this.squareshape.lineTo(0 * this.gridSize, 0 * this.gridSize)

  const extrudeSettings = {
    steps: 1,
    depth: 0.3,
    bevelEnabled: false
  };
  this.geometry2 = new THREE.ExtrudeGeometry(this.squareshape, extrudeSettings);

  this.road_material = new THREE.MeshBasicMaterial({
    color: 0x41413F
  });
  this.sideroad_material = new THREE.MeshPhongMaterial({
    color: 0x63635B,
    shininess: 0.1,
    wireframe: false
  });
  this.mapGroup = new THREE.Group();

  /*
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
          //this.mapGroup.add(squareMesh);
        }

      }
    }

    */


  for (let i = 0; i < this.sideWalkData.object.length; i++) {
    let object = this.sideWalkData.object[i];
    object.x = parseFloat(object["@x"]);
    object.y = parseFloat(object["@y"]);
    let origin = this.m2w(object.x, 0, -object.y);

    var results = object.polygon["@points"].matchAll(/(-?\d+),(-?\d+)/g)
    var sidewalkShape = new THREE.Shape();
    let initialX;
    let initialY;
    let g = this.gridSize;
    let j = 0;
    console.log("---------");
    for (let result of results) {
      let x = parseFloat(result[1])
      let y = parseFloat(result[2])
      let pos = this.m2w(object.x + x, 0, -object.y - y);
      if (j == 0) {
        initialX = x;
        initialY = y;
        sidewalkShape.moveTo(pos.x, pos.z)
      } else {
        //let pos = this.m2w(result[1],0,-result[2]);
        sidewalkShape.lineTo(pos.x, pos.z);
      }
      j++;
    }
    let pos = this.m2w(object.x + initialX, 0, -object.y - initialY);
    sidewalkShape.lineTo(pos.x, pos.z);
    let squareMesh;
    if (i == 0) {
      let hole = sidewalkShape.clone();
      var sidewalkShape = new THREE.Shape();
      let pos = this.m2w(0, 0, 0);
      sidewalkShape.moveTo(pos.x, pos.z);
      pos = this.m2w(this.height * 64, 0, 0);
      sidewalkShape.lineTo(pos.x, pos.z);
      pos = this.m2w(this.height * 64, 0, -this.width * 64);
      sidewalkShape.lineTo(pos.x, pos.z);
      pos = this.m2w(0, 0, -this.width * 64);
      sidewalkShape.lineTo(pos.x, pos.z);
      pos = this.m2w(0, 0, 0);
      sidewalkShape.lineTo(pos.x, pos.z);




      sidewalkShape.holes.push(hole);
      let sidewalkGeometry = new THREE.ExtrudeGeometry(sidewalkShape, extrudeSettings);
      squareMesh = new THREE.Mesh(sidewalkGeometry, this.sideroad_material);

      //this.mapGroup.add(squareMesh);
    } else {
      let sidewalkGeometry = new THREE.ExtrudeGeometry(sidewalkShape, extrudeSettings);
      squareMesh = new THREE.Mesh(sidewalkGeometry, this.sideroad_material);
    }

    this.mapGroup.add(squareMesh);
  }

  const geometry = new THREE.PlaneGeometry(280, 260);
  const plane = new THREE.Mesh(geometry, this.road_material);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y -= 0.01
  plane.position.x += 40;
  plane.position.z -= 50;
  scene.add(plane);


  this.mapGroup.name = "map"

  this.mapGroup.rotation.x = Math.PI / 2;


  this.mapGroup.position.y = 0.3;
  scene.add(this.mapGroup);

  this.makeRoutes();
}

GameMap.prototype.makeRoutes = function () {
  this.routeData = this.mapdata.objectgroup.find((el) => {
    return el["@name"] == "routes"
  });
  this.exitsData = this.mapdata.objectgroup.find((el) => {
    return el["@name"] == "exits"
  });
  this.questionsData = this.mapdata.objectgroup.find((el) => {
    return el["@name"] == "questions"
  });
  this.objectsData = this.mapdata.objectgroup.find((el) => {
    return el["@name"] == "special_objects"
  });
  var dotMaterial = new THREE.PointsMaterial({
    size: 7,
    sizeAttenuation: false,
    color: 0xff00ff
  });
  for (let i = 0; i < this.routeData.object.length; i++) {
    let object = this.routeData.object[i];
    object.x = parseFloat(object["@x"]);
    object.y = parseFloat(object["@y"]);
    let polygon = object.polygon;

    let origin = this.m2w(object.x, 0, -object.y);

    var dotGeometry = new THREE.Geometry();
    dotGeometry.vertices.push(origin);
    //scene.add(new THREE.Points(dotGeometry, dotMaterial));
    if (object.polygon != undefined) {
      var results = object.polygon["@points"].matchAll(/(-?\d+),(-?\d+)/g)
    } else {
      var results = object.polyline["@points"].matchAll(/(-?\d+),(-?\d+)/g)
    }
    var dotMaterial = new THREE.PointsMaterial({
      size: 7,
      sizeAttenuation: false,
      color: 0x0000ff
    });

    let L = []
    let previous = []
    for (let result of results) {
      let x = parseFloat(result[1])
      let y = parseFloat(result[2])

      let pos = this.m2w(object.x + x, 0, -object.y - y);
      let current = [pos.x, 0, pos.z]
      if (previous.length == 0) {
        previous = (current);
      } else {
        let L2 = [previous, current];
        previous = (current);
        L.push(L2);
      }
      var dotGeometry = new THREE.Geometry();
      dotGeometry.vertices.push(pos);


      //route points ...
      //new THREE.Points(dotGeometry, dotMaterial));
    }
    if (object.polygon != undefined) {
      L.push([L[L.length - 1][1], L[0][0]]);
    }
    let R = new Route(L);
    if (object.polygon != undefined) {
      //R.addExit(R);
      R.loopBack();
    }

    let id = object["@id"];
    R.route_id = parseInt(id);
    this.routesMap[id] = R;
    this.routes.push(R);

  }


  for (let i = 0; i < this.exitsData.object.length; i++) {
    let object = this.exitsData.object;
    let from = parseFloat(object[i].properties.find((el) => {
      return el["@name"] == "from"
    })['@value'])
    let to = parseFloat(object[i].properties.find((el) => {
      return el["@name"] == "to"
    })['@value'])
    this.routesMap[from].addExit(this.routesMap[to]);
  }

  var checkUndefined = function (arg) {
    if (arg) {
      return true;
    } else {
      return false;
    }
  };


  for (let i = 0; i < this.questionsData.object.length; i++) {
    let object = this.questionsData.object[i];
    let question = object.properties.find((el) => {return el["@name"] == "question"});
    let log = object.properties.find((el) => {return el["@name"] == "log"});
    let nth_segment = object.properties.find((el) => {return el["@name"] == "nth_segment"});
    let r1 = object.properties.find((el) => {return el["@name"] == "r1"});
    let r2 = object.properties.find((el) => {return el["@name"] == "r2"});
    let r3 = object.properties.find((el) => {return el["@name"] == "r3"});
    //let r3 = object.properties.find((el)=>{return el["@name"]=="r2"});

    let e1 = object.properties.find((el) => {return el["@name"] == "e1"});
    let e2 = object.properties.find((el) => {return el["@name"] == "e2"});
    let e3 = object.properties.find((el) => {return el["@name"] == "e3"});

    let ratio = object.properties.find((el) => {return el["@name"] == "ratio"});
    let stopEvent = object.properties.find((el) => {return el["@name"] == "stop"});
    let slowmo = object.properties.find((el) => {return el["@name"] == "slowmo"});
    let routeId = object.properties.find((el) => {return el["@name"] == "routeId"});

    if (question != undefined) {
      question = question["@value"];
    }
    nth_segment = parseInt(nth_segment["@value"]);
    let nquestions = 0;

    var rep = []
    var quest = []
    if (checkUndefined(e1)) {
      e1 = (e1["@value"]);
      rep.push(e1);
      if (checkUndefined(e2)) {
        e2 = (e2["@value"]);
        rep.push(e2);
        if (checkUndefined(e3)) {
          e3 = (e3["@value"]);
          rep.push(e3);
        }
      }
    }
    if (checkUndefined(r1)) {
      r1 = (r1["@value"]);
      quest.push(r1);
      if (checkUndefined(r2)) {
        r2 = (r2["@value"]);
        quest.push(r2);
        if (checkUndefined(e3)) {
          r3 = (r3["@value"]);
          quest.push(r3);
        }
      }
    }



    routeId = parseInt(routeId["@value"]);

    var events = [];
    var choices = [];

    for (let i = 0; i < rep.length; i++) {

      if (rep[i] == "") { //si vide
        events.push(i - 1); //changements de routes par defaut dans l'ordre de definition dans le json...
      } else if (!isNaN(rep[i])) { //si c'est un nombre
        events.push(parseInt(rep[i]));
      } else {
        events.push(rep[i]); //event special... stop car ou evenement_n_i => appelle une fct, etc..
      }
      choices.push(quest[i]);
    }

    if (ratio != undefined) {
      ratio = parseFloat(ratio["@value"]);
    } else {
      ratio = 1;
    }

    if (stopEvent != undefined) {
      stopEvent = (stopEvent["@value"]) == "true";
    } else {
      stopEvent = false;
    }

    if (slowmo != undefined) {
      slowmo = (slowmo["@value"]) == "true";
    } else {
      slowmo = false;
    }

    let callback = new GameEvent(question, log, choices, events, 10, slowmo, stopEvent, ratio);
    callback.fromMap = true;
    this.routesMap[routeId].addCallback(nth_segment, callback);
    //console.log(this.questionsData.object[i].properties)
  }

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 100
  });

  for (let i = 0; i < this.objectsData.object.length; i++) {
    let object = this.objectsData.object[i];
    object.x = parseFloat(object["@x"]);
    object.y = parseFloat(object["@y"]);
    let origin = this.m2w(object.x, 0, -object.y);
    //const geometry = new THREE.BufferGeometry().setFromPoints( points );

    let number = 8;
    const geometry = new THREE.PlaneGeometry(this.gridSize * 2.2 / number, this.gridSize * 1.5, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    //truck, crossing
    let type = object.properties.find((el) => {return el["@name"] == "type"});
    switch (type["@value"]) {
      case "crossing":
      let sidewalk = new THREE.Group();
      for (let i = 0; i < number; i++) {
        if (i % 2) {
          const plane = new THREE.Mesh(geometry, material);
          plane.position.set((this.gridSize * 2 / number) * i, 0, 0);
          sidewalk.add(plane);
        }
      }
      scene.add(sidewalk);

      sidewalk.position.set(origin.x - this.gridSize, origin.y + 0.01, origin.z);
      sidewalk.rotation.x = Math.PI / 2;
      let rotated = object.properties.find((el) => {return el["@name"] == "rotated"});
      if (rotated != undefined) {
        if (rotated["@value"] == "true") {
          sidewalk.rotation.z = Math.PI / 2;
          sidewalk.position.z -= this.gridSize;
        }
      }
      window.sidewalk = sidewalk;
      break;
      case "truck":
        //this.loadObjects();
        this.scenario.HornCar = {x:origin.x,y:0.5,z:origin.z}
        break;
    }
  }



}

GameMap.prototype.m2w = function (x, y, z) {
  //map 2 world coordinate conversion...

  let c = new THREE.Vector3();
  let ratio = this.gridSize / (this.mapdata["@tilewidth"]);
  c.x = ratio * x - this.offsetX * this.gridSize;
  c.z = -ratio * z - (this.offsetY + 1) * this.gridSize;

  return c;
}

