/*jshint esversion: 6 */

function createGraphEdge(node, glow) {
    if (glow === undefined || glow === null) glow = false;
    if (glow){
        new createGlowingEdge(node);
        new createSimpleEdge(node); //TODO: Remove later, use only as reference during debug
    }
        else{
        new createSimpleEdge(node, "#666");
    }
}

class createGlowingEdge{
    constructor(node) {
        const leftChild = node.children[0];
        const rightChild = node.children[1];

        const segments0 = common.getCorneredEdge(node.object.position, leftChild.object.position);
        const segments1 = common.getCorneredEdge(node.object.position, rightChild.object.position);
        this.drawLine(segments0, leftChild.species.colour);
        this.drawLine(segments1, rightChild.species.colour);
    }

    drawLine(segments, color) {
        const opacity = 0.5;
        const radious = 1;
        
        const glowMaterial = new THREE.MeshBasicMaterial({ opacity: opacity, transparent: true});
        glowMaterial.color.setRGB(color._rgb[0] / 255, color._rgb[1] / 255, color._rgb[2] / 255);

        for (var i = 0; i<segments.length-1; i++){
          const seg = segments.slice(i,i+2);
          const path = new THREE.CatmullRomCurve3(seg); //TODO change to use only cylindric geom and position for speed improvement
          const edgeGeometry = this.createEdgeTubeGeometry(path, radious);
          const edgeMesh = this.createGlowEdgeMesh(glowMaterial, edgeGeometry);
          edgeMesh.overdraw = true;

          bloomEffectsLayerScene.add(edgeMesh);

          this.createTubeCaps(seg, color, radious, opacity);
        }
  }
    createEdgeTubeGeometry(path, radious) {
        if (radious === undefined || radious === null) radious = 1;

        const tubeGeom = new THREE.TubeGeometry( path, 1, radious*2, 32, false );
        return tubeGeom;
   }

   createGlowEdgeMesh(glowMaterial, geometry){
     const glowMesh = new THREE.Mesh(geometry, glowMaterial);
     return glowMesh;
   }

   createTubeCaps(segment, color, radious, opacity) {
       if (radious === undefined || radious === null) radious = 1;
       if (opacity === undefined || opacity === null) opacity = 0.5;

        const geometry = new THREE.SphereGeometry(radious * 2, 32, 32, Math.PI, Math.PI);
        const material = new THREE.MeshBasicMaterial({ opacity: opacity, transparent: true });
        material.color.setRGB(color._rgb[0] / 255, color._rgb[1] / 255, color._rgb[2] / 255);
        const sphere = new THREE.Mesh(geometry, material);

        const s0 = sphere.clone();
        const s1 = sphere.clone();
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
    constructor(node) {
        const p0 = node.children[0].object.position;
        const p1 = node.children[1].object.position;
        let e0;
        let e1;

        if(node.event==="loss" && node.children[0].species.name !== node.species){
            e0 = common.drawEdge(node.object.position, p0, node.children[0].species.colour._rgb);
        }
        else{
            e0 = common.drawEdge(node.object.position, p0, node.children[0].species.colour._rgb);
        }

        if(node.event==="loss" && node.children[1].species !== node.species){
            e1 = common.drawEdge(node.object.position, p1, node.children[1].species.colour._rgb);
        }
        else{
            e1 = common.drawEdge(node.object.position, p1, node.children[1].species.colour._rgb);
        }

        common.saveChangesToNode(node, e0, e1);
  }
}



class common{
    static drawEdge(p1, p2, colour) {
        const g = new THREE.Geometry();

        g.vertices.push(
            new THREE.Vector3( p1.x, p1.y, p1.z ),
            new THREE.Vector3( p1.x, p1.y, p2.z ),
            new THREE.Vector3( p2.x, p2.y, p2.z )
        );

        const mat = new THREE.LineBasicMaterial();
        mat.color.setRGB(colour[0] / 255, colour[1] / 255, colour[2] / 255);

        const line = new THREE.Line( g, mat );
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

    if(p1.z !== p2.z){
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
