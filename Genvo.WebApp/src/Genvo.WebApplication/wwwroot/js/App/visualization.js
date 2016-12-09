/*jshint esversion: 6 */

//-------------------------------------------------------------
// ---------------  Global variables --------------------------
//-------------------------------------------------------------
var GeneTree = new GenvoTree();

var mousePos = new THREE.Vector3(), INTERSECTED;
var hover = false;
var dialog;
var canvasSize = {x:window.innerWidth, y:window.innerHeight};
//canvasSize = {x:document.getElementById('Genvo-App').clientWidth, y:document.getElementById('Genvo-App').clientHeight};
var currentSelectedObject;
var floatingToolbar = document.getElementById("onClickTools").getElementsByTagName("a"); // Attached to genvo_app.html



//-------------------------------------------------------------
// ---------------  Data loaders ------------------------------
//-------------------------------------------------------------

function loadData() {
    console.log("Start loading data");
    var treeFiles = localStorage.getItem("_GSTree");
   if (!treeFiles) window.location.href = "../#thetool";


    //localStorage.removeItem("_GSTree"); //ADD IF TO CLEAR CASHE

    //Decode and parse
    treeFiles = atob(treeFiles);
    treeFiles = JSON.parse(treeFiles);

    console.log("Data loaded");

    // Build the tree properties
    var properties = {
        showNickname: true,
        needsReconciliation: true
    }
    console.log(treeFiles);
    GeneTree.INIT(treeFiles, properties);
}



//-------------------------------------------------------------
// ---------------  GLOBAL VAR --------------------------------
//-------------------------------------------------------------
var scene;
var bloomEffectsLayerScene;
var composer = {};

var camera;
var cameraControls;
var renderer;
var raycaster = new THREE.Raycaster();


//-------------------------------------------------------------
// ---------------  Visualization CORE ------------------------
//-------------------------------------------------------------




//-------------------------------------------------------------
// ---------------  on User Events ----------------------------
//-------------------------------------------------------------


function onWindowResize(){
    canvasSize = {x:document.getElementById('Genvo-App').clientWidth, y:window.innerHeight};

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
            for(var i=0; i<floatingToolbar.length;i++){floatingToolbar[i].style.visibility = "visible";}
        }
    }
    else{
        //cameraControls.enabled = true;

        $('[data-toggle="popover"]').popover('hide');
        for(var i=0; i<floatingToolbar.length;i++){floatingToolbar[i].style.visibility = "hidden";}

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

        if ( INTERSECTED !== intersects[ 0 ].object ) {

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
        const vector = posOnScreen(currentSelectedObject.object.position);
        const buttons = floatingToolbar;
        const angle = Math.PI/buttons.length;

        buttons[0].style.left = vector.x + 'px';
        buttons[0].style.top = (vector.y-10) + 'px';



        for (let i=1; i<buttons.length; i++){
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
    GeneTree.allFunctionGroups["CesA"] = new FunctionGroup({name:"CesA", colour: chroma('#FF0DFF')});


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
    bloomEffectsLayerScene = new THREE.Scene();
    //bloomEffectsLayerScene.add( new THREE.AmbientLight( 0xffffff ) );
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
    renderer.autoClear = false;
    renderer.setSize( canvasSize.x, canvasSize.y );
    renderer.setClearColor( 0x000000, 1 );
    document.getElementById('Genvo-App').appendChild( renderer.domElement );

    // Effects
    var bloomPass = createBloomPass(additiveShader, true, true);
    createFinalComposer(bloomPass);
    
    
    // Add listeners
    window.addEventListener( "resize", onWindowResize, false );
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
}

function createFinalComposer(bloomPass){
    composer.final = new THREE.EffectComposer( renderer );
    composer.final.addPass( new THREE.RenderPass( scene, camera ) );
    composer.final.addPass( bloomPass );
}

function createBloomPass(shader, renderToScreen, needSwap){
    if (renderToScreen === undefined) { renderToScreen = false }
    if (needSwap === undefined) { needSwap = false }


    // Create the glow composer
    composer.bloom = new THREE.EffectComposer( renderer ); //, renderTargetGlow );
    var bloomEffectsLayerPass = new THREE.RenderPass( bloomEffectsLayerScene, camera);
    composer.bloom.addPass( bloomEffectsLayerPass );

    //var blur = createBlurShaderPass();

    //composer.bloom.addPass( blur.horizontal );
    //composer.bloom.addPass( blur.vertical ); 
    composer.bloom.addPass( new THREE.BloomPass(2, 25, 4, 256) );

    shader.uniforms[ 'tAdd' ].value = composer.bloom.renderTarget1;

    var bloomPass = new THREE.ShaderPass( shader );
    bloomPass.needSwap = needSwap;
    bloomPass.renderToScreen = renderToScreen;

    renderEffectToScreen(composer.bloom);

    return bloomPass;
}

function createBlurShaderPass(){
  var hblur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
  var vblur = new THREE.ShaderPass( THREE.VerticalBlurShader );

  return {horizontal: hblur, vertical: vblur};
}

function renderEffectToScreen(comp){
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;
    comp.addPass(effectCopy);
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

    renderer.clear();
    composer.bloom.render( 0.1 );
    composer.final.render( 0.1 );
}




//-------------------------------------------------------------
// ---------------  Main program ------------------------------
//-------------------------------------------------------------


init();
render();
