/*jshint esversion: 6 */

function createGraphEdge(node, glow = false, color = "#fff"){
  if (glow){
    new createGlowingEdge(node, 0xff0000);
    new createGraphEdge(node); //TODO: Remove later, use only as reference during debug
  }
  else{
    new createSimpleEdge(node, "#666");
  }
}

class createGlowingEdge{
  constructor(node, color){
    this.color = color;


    var segments0 = common.getCorneredEdge(node.object.position, node.children[0].object.position);
    var segments1 = common.getCorneredEdge(node.object.position, node.children[1].object.position);
    this.drawLine(segments0, color);
    this.drawLine(segments1, color);
  }

  drawLine(segments, color){
    var glowMaterial = new THREE.MeshBasicMaterial({color: color});

    for (var i = 0; i<segments.length-1; i++){
      var seg = segments.slice(i,i+2);
      var path = new THREE.CatmullRomCurve3(seg); //TODO change to use only cylindric geom and position for speed improvement
      var edgeGeometry = this.createEdgeTubeGeometry(path);
      var edgeMesh = this.createGlowEdgeMesh(glowMaterial, edgeGeometry);
      edgeMesh.overdraw = true;

      bloomEffectsLayerScene.add(edgeMesh);

      this.createTubeCaps(seg, color);
    }
  }
  createEdgeTubeGeometry(path, radious = 1){
     var tubeGeom = new THREE.TubeGeometry( path, 1, radious*2, 32, false );
     return tubeGeom;
   }

   createGlowEdgeMesh(glowMaterial, geometry){
     var glowMesh = new THREE.Mesh(geometry, glowMaterial);
     return glowMesh;
   }

   createTubeCaps(segment, color, radious = 1){
     var geometry = new THREE.SphereGeometry(radious*2, 32, 32, Math.PI, Math.PI);
     var material = new THREE.MeshBasicMaterial({color: color});
     var sphere = new THREE.Mesh(geometry, material);

     var s0 = sphere.clone();
     var s1 = sphere.clone();
     s0.position.set(segment[0].x, segment[0].y, segment[0].z);
     s1.position.set(segment[1].x, segment[1].y, segment[1].z);

     s0.lookAt(segment[1]);
     s1.lookAt(segment[0]);

     s0.overdraw = true;
     s1.overdraw = true;

     bloomEffectsLayerScene.add(s0);
     bloomEffectsLayerScene.add(s1);
   }
}



class createSimpleEdge{
  constructor (node, baseColor = "#fff"){
    var p0 = node.children[0].object.position;
    var p1 = node.children[1].object.position;
    var e0;
    var e1;

    if(node.event==='loss' && node.children[0].species.name !== node.species){
        e0 = common.drawEdge(node.object.position, p0, baseColor);
    }
    else{
        e0 = common.drawEdge(node.object.position, p0, baseColor);
    }

    if(node.event==='loss' && node.children[1].species !== node.species){
        e1 = common.drawEdge(node.object.position, p1, baseColor);
    }
    else{
        e1 = common.drawEdge(node.object.position, p1, baseColor);
    }

    common.saveChangesToNode(node, e0, e1);
  }
}



class common{
  static drawEdge(p1, p2, colour){
      var g = new THREE.Geometry();

      g.vertices.push(
          new THREE.Vector3( p1.x, p1.y, p1.z ),
          new THREE.Vector3( p1.x, p1.y, p2.z ),
          new THREE.Vector3( p2.x, p2.y, p2.z )
      );

      var mat = new THREE.LineBasicMaterial({
          color: colour
      });

      var line = new THREE.Line( g, mat );
      scene.add( line );

      return line;
  }

  static saveChangesToNode(node, e0, e1){
    node.edges.children.push(e0);
    node.edges.children.push(e1);

    node.children[0].edges.parent.push(e0);
    node.children[1].edges.parent.push(e1);
  }

  static getCorneredEdge(p1, p2){
    var px = [];

    if(p1.z != p2.z){
      px.push(
        new THREE.Vector3( p1.x, p1.y, p1.z ),
        new THREE.Vector3( p1.x, p1.y, p2.z ),
        new THREE.Vector3( p2.x, p2.y, p2.z )
      );
    }
    else{
      px.push(p1,p2);
    }

    return px;
  }
}
