//-------------------------------------------------------------
// ---------------  Global variables --------------------------
//-------------------------------------------------------------
var GeneTree = new GenvoTree();
var mousePos = new THREE.Vector3(), INTERSECTED;
var hover = false;
var dialog;
var canvasSize = {x:window.innerWidth*10/12, y:window.innerHeight-100};
//canvasSize = {x:document.getElementById('Genvo-App').clientWidth, y:document.getElementById('Genvo-App').clientHeight};
var currentSelectedObject;
var floatingToolbar = document.getElementById('onClickTools').getElementsByTagName("a"); // Attached to genvo_app.html


//-------------------------------------------------------------
// ---------------  Data loaders ------------------------------
//-------------------------------------------------------------

function loadData() {
    console.log("Start loading data");
    var treeFiles = localStorage.getItem('_GSTree');

   // if (!treeFiles) {console.log("Data failed to load"); return false;}
   if (!treeFiles) window.location.href = "../index.html#thetool"; // Add row when done!!!


    //localStorage.removeItem('_GSTree'); //ADD IF TO CLEAR CASHE

    //Decode and parse
    var treeFiles = atob(treeFiles);
    var treeFiles = JSON.parse(treeFiles);
   
    console.log("Data loaded");

    // Build the tree properties
    // pLoss, pDup and pTransfer can also be set here
    var properties = {
        showNickname: true,
        separator: "_"
    }
    GeneTree.INIT(treeFiles, properties);
   
}





//-------------------------------------------------------------
// ---------------  Create meshes -----------------------------
//-------------------------------------------------------------
function getStdGeometry(parameters){
    if ( parameters === undefined ) parameters = {};
    var geometry = parameters.hasOwnProperty("geometry") ? parameters["geometry"] : undefined;
    var radious = parameters.hasOwnProperty("radious") ? parameters["radious"] : 5;


    switch (geometry){
        case 'cube':
            var g = new THREE.BoxGeometry( 7, 7, 7 );
            break;
        case 'plane':
            var g = new THREE.BoxGeometry( 1, 1, 0 );
            break;
        case 'circle':
            var g = new THREE.CircleGeometry( 1, 16 );
            break;
        case 'sphere':
            var g = new THREE.SphereGeometry( radious, 32, 32 );
            break;
        case 'pyramid':
            var g = new THREE.Geometry();

            g.vertices = [
                new THREE.Vector3( -1, -1, -1 ),
                new THREE.Vector3( 1, -1, -1 ),
                new THREE.Vector3( 0, -1, 1 ),
                new THREE.Vector3( 0, 1, 0 )
            ];

            g.faces = [
                new THREE.Face3( 0, 1, 2), //Bottom
                new THREE.Face3( 1, 0, 3),
                new THREE.Face3( 0, 2, 3),
                new THREE.Face3( 2, 1, 3)
            ];   

            g.applyMatrix( new THREE.Matrix4().makeScale( 5, 5, 5 ) );

            //var g = new THREE.CylinderGeometry(0, 6, 10, 3, false); 

        default:
        break;
    }
    return g;
}

function createMaterial(parameters){
    if ( parameters === undefined ) parameters = {};
    var material;

    var colour = parameters.hasOwnProperty("colour") ? parameters["colour"] : "black";
    var transparent = (parameters.hasOwnProperty("opacity")) ? true : false;
    var opacity = parameters.hasOwnProperty("opacity") ? parameters["opacity"] : 1;

    switch (colour){
        case "red":
            material = new THREE.MeshBasicMaterial( { color: 0xe87b70, opacity: opacity, transparent: transparent } );
            break;
        case "green":
            material = new THREE.MeshBasicMaterial( { color: 0x00ff00, opacity: opacity, transparent: transparent  } );
            break;
        case "blue":
            material = new THREE.MeshBasicMaterial( { color: 0x4355ff, opacity: opacity, transparent: transparent } );
            break;
        case "white":
            material = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: opacity, transparent: transparent } );
            break;
        case "grey":
            material = new THREE.MeshBasicMaterial( { color: 0x555555, opacity: opacity, transparent: transparent } );
            break;

        default:
            material = new THREE.MeshBasicMaterial( { color: 0x000000, opacity: opacity, transparent: transparent } );
            break;
    }
    return material;
}





//-------------------------------------------------------------
// ---------------  Create animations -------------------------
//-------------------------------------------------------------
function createAnimatedMove(node, target){ // Currently only supporting move of nodes
    var object = node.object;
    var edges = node.edges;

    time = 3000;

    new TWEEN.Tween(object.position)
        .to(target, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .start();

    edges.children.forEach(function(e){
        new TWEEN.Tween(e.geometry.vertices[0])
        .to(target, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(function(){
            e.geometry.verticesNeedUpdate = true;
        })
        .start();
    });



    edges.parent.forEach(function(e){
        new TWEEN.Tween(e.geometry.vertices[1])
        .to(target, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(function(){
            e.geometry.verticesNeedUpdate = true;
        })
        .start();
    });  
};




function createCameraMove(view){
    var target = cameraControls.target0;
    var zoomTarget = cameraControls.zoom0;

    switch (view){
        case "dup":
            // Object target
            var _target = new THREE.Vector3;
            _target.copy(target);
            _target.z = cameraControls.position0.z;
            break;

        case "spec":
            // Object target
            var _target = new THREE.Vector3(-cameraControls.position0.z,target.y,0);
            break;
    }
    

    var object = cameraControls.object;
    var cameraTarget = cameraControls.target;



    time = 2000;

    new TWEEN.Tween({zoom:object.zoom})
        .to({zoom:zoomTarget}, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(function(){
            cameraControls.updateProjMatrix(this.zoom);
        })
        .start();

    new TWEEN.Tween(object.position)
        .to(_target, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(function(){
            cameraControls.update();
        })
        .start();

    new TWEEN.Tween(cameraTarget)
        .to(target, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(function(){
            cameraControls.update();
        })
        .start();
};






















//-------------------------------------------------------------
// ---------------  GLOBAL VAR --------------------------------
//-------------------------------------------------------------
var scene;
var camera;
var cameraControls;
var renderer;
var raycaster = new THREE.Raycaster();
















//-------------------------------------------------------------
// ---------------  Visualization CORE ------------------------
//-------------------------------------------------------------
function buildViz(){
    var xPos = 0;
    var xDelta = 20;




////////////////////////////////////////////////////////
    // Correct all speciation events height
////////////////////////////////////////////////////////

    // Set all leaf positions
    function recurseNodesG(g){
        g.children.forEach(function(ch){recurseNodesG(ch);});

        if (g.isLeaf){
            // Draw node
            var nodeElement = new THREE.Mesh( getStdGeometry({geometry:'sphere'}), createMaterial({colour:"grey", opacity: 0.8}) );

            // Set positions
            nodeElement.position.x = xPos;
            nodeElement.position.y = 0;
            nodeElement.position.z = g.species.zPos;

            // Add element to scene
            scene.add( nodeElement );

            xPos += xDelta;

            // Create text
            var fontSize = 12;

            var text = createPlaneText( g.nickname, { 
                fontsize: fontSize, 
                borderColor: g.species.colour, 
                backgroundColor: g.species.subColour, 
                fontface: 'Times',
                borderThickness: 2
            });

            text.position.set(nodeElement.position.x - fontSize/2 + 6 , nodeElement.position.y - text.position.x - 8, nodeElement.position.z);
            
            // Rotate 90 degrees
            text.rotation.z = -1.5625;

            // Add text to scene
            scene.add( text );
            

            // Save changes
            g.object = nodeElement;
            g.object.owner = g;
            g.text = text;
        }
    }
    recurseNodesG(GeneTree._root);




    // Build rest of tree
    function recurseNodesS(s){
        s.children.forEach(function(ch){recurseNodesS(ch);});

        var allSpeciations = new Array();
        var allParents = new Array();
        var maxAngle = 20; //degrees

        function recurseInternalNodesG(g){
            if (g.isLeaf) {return;}

            g.children.forEach(function(ch){recurseInternalNodesG(ch);});

            if (g.species.name !== s.name){return;}

            ////////////////////////
            // 3D object
            switch (g.event){
                case 'spec':
                    var nodeElement = new THREE.Mesh( getStdGeometry({geometry:'pyramid', radious: 4}), createMaterial({colour:"red", opacity:0.8}) );
                    break;
                case 'dup':
                    var nodeElement = new THREE.Mesh( getStdGeometry({geometry:'pyramid'}), createMaterial({colour:"grey", opacity:0.8}) );
                    break;

                case 'loss':
                    var nodeElement = new THREE.Mesh( getStdGeometry({geometry:'cube'}), createMaterial({colour:"grey", opacity:0.8}) );
                    break;

                case 'trans':
                    var nodeElement = new THREE.Mesh( getStdGeometry({geometry:'cube'}), createMaterial({colour:"red", opacity:0.8}) );
                    break;
                    
            }
            
            ///////////////////////
            // Positions

            // Variables
            var p0 = g.children[0].object.position;
            var p1 = g.children[1].object.position;
            var childDist = (p1.x - p0.x) / 2;

            // Draw nodes
            nodeElement.position.x = p0.x + childDist;
            nodeElement.position.z = g.species.zPos;

            // Set primary y pos
            if (childDist > 2*xDelta){
                nodeElement.position.y = Math.max(p0.y, p1.y) + childDist / Math.tan(maxAngle);
                //nodeElement.position.y = Math.max(p0.y, p1.y) + Math.sqrt(childDist*50);
            }
            else{
                nodeElement.position.y = Math.max(p0.y, p1.y) + childDist + Math.sqrt(childDist*2);
            }

            scene.add( nodeElement );


            ///////////////////////
            // Save changes

            g.object = nodeElement;
            g.object.owner = g;

            ////////////////////////
            // Store speciation heights

            if (g.event === 'spec'){
                g.species.yPos = Math.max(g.species.yPos, g.object.position.y);
                allSpeciations.push(g);
            }
            else {
                allParents.push(g);
            }
            
        }
        recurseInternalNodesG(GeneTree._root);





        
        ///////////////////////////
        // Update all y positions

        allSpeciations.forEach(function(g){
            g.object.position.y = g.species.yPos;

            createEdge(g);
        });

        allParents.forEach(function(g){
            var p0 = g.children[0].object.position;
            var p1 = g.children[1].object.position;
            var childDist = (p1.x - p0.x) / 2;

            // Set y pos
            if (childDist > 2*xDelta){
                g.object.position.y = Math.max(p0.y, p1.y) + childDist / Math.tan(maxAngle);
                //nodeElement.position.y = Math.max(p0.y, p1.y) + Math.sqrt(childDist*50);
            }
            else{
                g.object.position.y = Math.max(p0.y, p1.y) + childDist + Math.sqrt(childDist*2);
            }

            createEdge(g);

        });










        /////////////////////////////////
        // Set species labels and fill legend

        if (s.isLeaf){
            var fontSize = 12;

            var text = createPlaneText( s.name, { 
                fontsize: fontSize,
                autotextcolour: true,
                borderColor: s.colour, 
                backgroundColor: s.subColour, 
                fontface: 'Times',
                borderThickness: 2
            });

            text.position.set(-50 , - text.position.x - 8, s.zPos);
            //text.position.set(nodeElement.position.x - fontSize/2 + 6 , nodeElement.position.y - text.position.x - 8, nodeElement.position.z);
            
            // Rotate 90 degrees
            text.rotation.z = -1.5625;
            text.rotation.y = -1.5625;

            // Add text to scene
            scene.add( text );


            // LEGEND
            var div = d3.select("body").append("div")   
                .attr("class", "tooltip")               
                .style("opacity", 0);

            var svgHeight = (100/GeneTree.noSpeciesLeaf);
            d3.select("#legend")
                .append("div")
                    .attr("id", s.name)
                    .style("height", svgHeight+"%")
                    .style("width", "100%")
                    .style("background", s.subColour.hex());


            d3.select('#' + s.name)
                .append("div")
                    .html(s.name + "<br/>")
                    .style("position", "relative")
                    .style("left", "30px")
                    .style("top", "10px");


            d3.select('#' + s.name)
                .on("mouseover", function(d) {      
                    div.transition()        
                        .duration(200)      
                        .style("opacity", .9);      
                    div .html(s.name + "<br/>")  
                        .style("left", (d3.event.pageX) + "px")     
                        .style("top", (d3.event.pageY - 28) + "px");    
                    })                  
                .on("mouseout", function(d) {       
                    div.transition()        
                        .duration(200)      
                        .style("opacity", 0);   
                });
            
        }


    }
    recurseNodesS(GeneTree._speciesRoot);







    //Initialize camera position centering the tree
    cameraControls.target0.x = Math.ceil(xPos/2);
    cameraControls.target0.y = Math.ceil(GeneTree._root.object.position.y/2);

    var target = new THREE.Vector3();
    target.copy(cameraControls.target0);
    target.z = cameraControls.position0.z;
    cameraControls.object.position.copy(target);

    var target = new THREE.Vector3;
    target.copy(cameraControls.target0);
    cameraControls.target = target;

    cameraControls.update();

    cameraControls.zoom0 = 1200/xPos;
    cameraControls.updateProjMatrix(cameraControls.zoom0);

    cameraControls.maxZoom = 10;
    cameraControls.minZoom = 0.4;


}







function createEdge (node){
    var p0 = node.children[0].object.position;
    var p1 = node.children[1].object.position;

    if(node.event==='loss' && node.children[0].species.name !== node.species){
        var e0 = drawEdge(node.object.position, p0, "#000");
    }
    else{
        var e0 = drawEdge(node.object.position, p0, "#000");
    }

    if(node.event==='loss' && node.children[1].species !== node.species){
        var e1 = drawEdge(node.object.position, p1, "#000");
    }
    else{
        var e1 = drawEdge(node.object.position, p1, "#000");
    }

    

    // Save changes
    node.edges.children.push(e0); 
    node.edges.children.push(e1); 

    node.children[0].edges.parent.push(e0);
    node.children[1].edges.parent.push(e1);
}

function drawEdge(p1, p2, colour){
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








































//-------------------------------------------------------------
// ---------------  on User Events ----------------------------
//-------------------------------------------------------------


function onWindowResize(){
    canvasSize = {x:document.getElementById('Genvo-App').clientWidth, y:window.innerHeight-100};

    // Orthographics
    camera.left = - canvasSize.x / 2;
    camera.right = canvasSize.x / 2;
    camera.top = canvasSize.y / 2;
    camera.bottom = - canvasSize.y / 2;

    camera.updateProjectionMatrix();


    // Perspective
    //camera.aspect = canvasSize.x / canvasSize.y;
    //camera.updateProjectionMatrix();

    renderer.setSize( canvasSize.x, canvasSize.y );
}




function onDocumentMouseDown( e ) {
    
    e.preventDefault();


    raycaster.setFromCamera( mousePos, camera );
    var intersects = raycaster.intersectObjects( scene.children );


    if (intersects.length > 0){
        if (hover){
            //cameraControls.enabled = false;
        }

        if (currentSelectedObject !== intersects[0].object.owner){
            currentSelectedObject = intersects[0].object.owner; // Edit to choose first object of interest
        }

        
        if (currentSelectedObject !== undefined){
            for(i=0; i<floatingToolbar.length;i++){floatingToolbar[i].style.visibility = "visible";}            
        }
    }
    else{
        //cameraControls.enabled = true;

        $('[data-toggle="popover"]').popover('hide');
        for(i=0; i<floatingToolbar.length;i++){floatingToolbar[i].style.visibility = "hidden";}

        currentSelectedObject = undefined;
    } 
}


function posOnScreen(pos){
    var p = pos.clone();
    var vector = p.project(camera);
    var offsetY = 50;
    

    vector.x = (vector.x + 1) / 2 * canvasSize.x;
    vector.y = -(vector.y - 1) / 2 * canvasSize.y + offsetY;

    return vector;
}





function onMouseMove( e ) {

    e.preventDefault();

    mousePos.x = 2 * ((e.offsetX) / canvasSize.x) - 1;
    mousePos.y = 1 - 2 * ( (e.offsetY) / canvasSize.y );    
}

function onMouseHover(){
    ////////////
    raycaster.setFromCamera( mousePos, camera );
    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) {

        if ( INTERSECTED != intersects[ 0 ].object ) {

            if ( INTERSECTED ) {
                INTERSECTED.material.opacity = INTERSECTED.currentOpacity;
            }

            INTERSECTED = intersects[ 0 ].object;

            INTERSECTED.currentOpacity = INTERSECTED.material.opacity;
            
            INTERSECTED.material.opacity = 1;
            document.getElementById('Genvo-App').style.cursor = "pointer";
            hover = true;

        }

    } else {
        //cameraControls.enabled = true;
        if ( INTERSECTED ) {
            INTERSECTED.material.opacity = INTERSECTED.currentOpacity;
            document.getElementById('Genvo-App').style.cursor = "default";
            hover = false;
        }

        INTERSECTED = null;

    }
}






//-------------------------------------------------------------
// ---------------  Helpers -----------------------------------
//-------------------------------------------------------------
function calculateArrayMax(a){
    // Float infinity
    var maxVal = Number.NEGATIVE_INFINITY;
    var index = 0;

    // Find min value and index in a(g,•)
    for (var i = 0; i < a.length; i++) {
      if (a[i] > maxVal) {
        maxVal = a[i];
        index = i;
      }
    }

    var res = {
        value: maxVal,
        index: index
    };

    return res;
}




// Checks variables and toggles depending on user situation
// Updates eac frame
function supportCheckers(){
    // Edit button position
    if(currentSelectedObject !== undefined){ // Edit this to only update when needed!!!
        var vector = posOnScreen(currentSelectedObject.object.position);
        var buttons = floatingToolbar;
        var angle = Math.PI/buttons.length;

        buttons[0].style.left = vector.x + 'px';
        buttons[0].style.top = (vector.y-10) + 'px';

        

        for (i=1; i<buttons.length; i++){
            buttons[i].style.left = (vector.x + (Math.cos(angle*i)*50)) + 'px';
            buttons[i].style.top = (vector.y - (Math.sin(angle*i)*50)) + 'px';
        }
    }




    // Camera control
    if(dialog.dialog("isOpen") || hover){
        cameraControls.enabled = false;
    }
    else{
        cameraControls.enabled = true;
    }
}







function setupPage(){
    // Fake function groups
    GeneTree.allFunctionGroups["CesA"] = new functionGroup({name:"CesA", colour: chroma('#FF0DFF')});

    
    var form,
        functionDropDown = document.getElementById("funcDropDown");
      

        function saveData(){
            console.log("save");
            var valid = true;
            if (valid){
                // Function group
                currentSelectedObject.functionGroup = GeneTree.allFunctionGroups[functionDropDown.options[funcDropDown.selectedIndex].text];
                var colour = currentSelectedObject.functionGroup.colour._rgb;
                currentSelectedObject.object.material.color = new THREE.Color("rgb("+colour[0]+","+colour[1]+","+colour[2]+")");

                dialog.dialog("close");
            }
        }

        dialog = $( "#dialog-form" ).dialog({
          autoOpen: false,
          height: 300,
          width: 350,
          modal: false,
          buttons: {
            "Save": saveData, 
            Cancel: function() {
              dialog.dialog( "close" );
            }
          },
          close: function() {
            form[ 0 ].reset();
          }
        });


        form = dialog.find( "form" ).on( "submit", function( event ) {
          event.preventDefault();
          addUser();
        });

}



function openPopOver(){
    // Hide all buttons
    for(i=0; i<floatingToolbar.length; i++){floatingToolbar[i].style.visibility = "hidden";}

    // Toggle camera control
    // cameraControls.enabled = false;

    if (currentSelectedObject.isLeaf){
        var dialog = $( "#dialog-form" );
        dialog.dialog( "open" );
    }
}





//-------------------------------------------------------------
// ---------------  INIT --------------------------------------
//-------------------------------------------------------------
function init(){
    // Setup page
    setupPage();


    // Load Data
    loadData();

    // INIT variables
    scene = new THREE.Scene();
    //var canvasSize = {x:window.innerWidth*10/12, y:window.innerHeight-100};

    // Camera
    camera = new THREE.OrthographicCamera( canvasSize.x / -2, canvasSize.x / 2, canvasSize.y / 2, canvasSize.y / -2, 0.1, 100000 );
    camera.position.z = 5000; //org 50
    camera.position.x = 0;
    camera.zoom = 1;
    camera.updateProjectionMatrix();

    // Camera Controlls
    cameraControls = new THREE.OrbitControls(camera);
    cameraControls.minAzimuthAngle = - Math.PI/2;
    cameraControls.maxAzimuthAngle = Math.PI/2;

    // Setup renderer canvas
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize( canvasSize.x, canvasSize.y );
    renderer.setClearColor( 0xffffff, 1 );
    document.getElementById('Genvo-App').appendChild( renderer.domElement );

    // Add listeners
    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener('mousemove', onMouseMove,false);
    document.getElementById('Genvo-App').addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.getElementById('btn-view-gene').addEventListener( "click", function(){createCameraMove("dup");}, false );
    document.getElementById('btn-view-species').addEventListener( "click", function(){createCameraMove("spec");}, false );

    // Add listernes for on click tools
    document.getElementById('info-button').addEventListener( 'click', openPopOver, false );


    //Build init visualization
    buildViz();



    // Set up popovers
    $(document).ready(function(){
        $('[data-toggle="popover"]').popover({
            placement : 'top'
        });

    });



    // lights // Change material to get shadows

    // light = new THREE.DirectionalLight( 0xffffff );
    // light.position.set( 1, 1, 1 );
    // scene.add( light );

    // light = new THREE.DirectionalLight( 0x002288 );
    // light.position.set( -1, -1, -1 );
    // scene.add( light );

    // light = new THREE.AmbientLight( 0x222222 );
    // scene.add( light );

}




//-------------------------------------------------------------
// ---------------  Renderer and animator ---------------------
//-------------------------------------------------------------
//Updates every frame
function render() {
    requestAnimationFrame( render );

    // Checkers
    supportCheckers();  

    // Ceck if mouse hover objects
    onMouseHover();

    //Animate
    TWEEN.update();

    // Render
    renderer.render( scene, camera );
}





//-------------------------------------------------------------
// ---------------  Main program ------------------------------
//-------------------------------------------------------------


init();
render();
