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


var scene;
var bloomEffectsLayerScene;
var composer = new Composer();

var camera;
var cameraControls;
var renderer;
var raycaster = new THREE.Raycaster();


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
    const intersects = raycaster.intersectObjects( scene.children );


    if (intersects.length > 0){
        if (hover){
            //cameraControls.enabled = false;
        }

        if (currentSelectedObject !== intersects[0].object.owner){
            currentSelectedObject = intersects[0].object.owner; // Edit to choose first object of interest
        }


        if (currentSelectedObject !== undefined){
            for(let i=0; i<floatingToolbar.length;i++){floatingToolbar[i].style.visibility = "visible";}
        }
    }
    else{
        //cameraControls.enabled = true;

        $('[data-toggle="popover"]').popover("hide");
        for(let i=0; i<floatingToolbar.length;i++){floatingToolbar[i].style.visibility = "hidden";}

        currentSelectedObject = undefined;
    }
}


function posOnScreen(pos){
    const p = pos.clone();
    const vector = p.project(camera);
    const offsetY = 50;


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




// Checks variables and toggles depending on user situation
// Updates eac frame
function supportCheckers(){
    // Edit button position
    if(currentSelectedObject !== undefined){ // Edit this to only update when needed!!!
        const vector = posOnScreen(currentSelectedObject.object.position);
        const buttons = floatingToolbar;
        const angle = Math.PI/buttons.length;

        buttons[0].style.left = vector.x + "px";
        buttons[0].style.top = (vector.y-10) + "px";



        for (let i=1; i<buttons.length; i++){
            buttons[i].style.left = (vector.x + (Math.cos(angle*i)*50)) + "px";
            buttons[i].style.top = (vector.y - (Math.sin(angle*i)*50)) + "px";
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











function openPopOver(){
    // Hide all buttons
    for(let i=0; i<floatingToolbar.length; i++){floatingToolbar[i].style.visibility = "hidden";}

    // Toggle camera control
    // cameraControls.enabled = false;

    if (currentSelectedObject.isLeaf){ // TODO Doesnt work since menue is off node, and click is thereby on undefined object
        const dialog = $( "#dialog-form" );
        dialog.dialog( "open" );
    }
}


//Updates every frame
function render() {
    requestAnimationFrame(render);

    // Checkers
    supportCheckers();

    // Ceck if mouse hover objects
    onMouseHover();

    //Animate
    TWEEN.update();

    renderer.clear();
    composer.bloom.render(0.1);
    composer.final.render(0.1);
}


//-------------------------------------------------------------
// ---------------  INIT --------------------------------------
//-------------------------------------------------------------



function GenvoVisualisation() {
    scene = new THREE.Scene();
    bloomEffectsLayerScene = new THREE.Scene();
}

GenvoVisualisation.prototype.init = function () {
    this.SetupPage();
    this.LoadData();

    // Camera
    this.InitializeCamera();
    this.InitializeCameraControlls(false);

    this.InitializeRenderer();

    // Effects
    const bloomPass = composer.createBloomPass(additiveShader, true, true);
    composer.createFinalComposer(bloomPass);

    this.AddDndListeners();

    buildViz();

    // Set up popovers
    $(document).ready(function () {
        $('[data-toggle="popover"]').popover({
            placement: "top"
        });
    });
}

GenvoVisualisation.prototype.SetupPage = function () {
    // Fake function groups
    GeneTree.allFunctionGroups["CesA"] = new FunctionGroup({ name: "CesA", colour: chroma('#FF0DFF') });


    var form;
    var functionDropDown = document.getElementById("funcDropDown");


    function saveData() {
        console.log("save");

        // Function group
        currentSelectedObject.functionGroup = GeneTree.allFunctionGroups[functionDropDown.options[funcDropDown.selectedIndex].text];
        const colour = currentSelectedObject.functionGroup.colour._rgb;
        currentSelectedObject.object.material.color = new THREE.Color(`rgb(${colour[0]},${colour[1]},${colour[2]})`);

        dialog.dialog("close");
    }

    dialog = $("#dialog-form").dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: false,
        buttons: {
            "Save": saveData,
            Cancel: function () {
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
        }
    });


    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
    });

}


GenvoVisualisation.prototype.LoadData = function() {
    var treeFiles = localStorage.getItem("_GSTree");
    if (!treeFiles) window.location.href = "../#thetool";

    //localStorage.removeItem("_GSTree"); //ADD IF TO CLEAR CASHE

    //Decode and parse
    treeFiles = atob(treeFiles);
    treeFiles = JSON.parse(treeFiles);

    // Build the tree properties
    const properties = {
        showNickname: true
    }
    GeneTree.INIT(treeFiles, properties);
}

GenvoVisualisation.prototype.AddDndListeners = function() {
    window.addEventListener("resize", onWindowResize, false);
    window.addEventListener("mousemove", onMouseMove, false);
    document.getElementById("Genvo-App").addEventListener("mousedown", onDocumentMouseDown, false);
    document.getElementById("btn-view-gene").addEventListener("click", function () { createCameraMove("dup"); }, false);
    document.getElementById("btn-view-species").addEventListener("click", function () { createCameraMove("spec"); }, false);

    document.getElementById("info-button").addEventListener("click", openPopOver, false);
}

GenvoVisualisation.prototype.InitializeCamera = function() {
    camera = new THREE.OrthographicCamera(canvasSize.x / -2, canvasSize.x / 2, canvasSize.y / 2, canvasSize.y / -2, 0.1, 100000);
    camera.position.z = 5000; //org 50
    camera.position.x = 0;
    camera.zoom = 1;
    camera.updateProjectionMatrix();
}

GenvoVisualisation.prototype.InitializeCameraControlls = function(limitRotation) {
    cameraControls = new THREE.OrbitControls(camera);

    if (limitRotation) {
        cameraControls.minAzimuthAngle = -Math.PI / 2;
        cameraControls.maxAzimuthAngle = Math.PI/2;
    }
}

GenvoVisualisation.prototype.InitializeRenderer = function() {
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.autoClear = false;
    renderer.setSize(canvasSize.x, canvasSize.y);
    renderer.setClearColor(0x000000, 1); //0e293a
    document.getElementById("Genvo-App").appendChild(renderer.domElement);
}




//-------------------------------------------------------------
// ---------------  Main program ------------------------------
//-------------------------------------------------------------

var visualisation = new GenvoVisualisation();
visualisation.init();

//init();
render();
