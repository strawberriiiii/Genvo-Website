/*jshint esversion: 6 */

//-------------------------------------------------------------
// ---------------  Global variables --------------------------
//-------------------------------------------------------------
//TODO Check over theese variables to move them into the visualisation object
var GeneTree = new GenvoTree();

var mousePos = new THREE.Vector3();
var INTERSECTED;
var hover = false;
var dialog;
var currentSelectedObject;
var floatingToolbar = document.getElementById("onClickTools").getElementsByTagName("a");

var camera;
var cameraControls;
var renderer;
var raycaster = new THREE.Raycaster();







GenvoVisualisation.prototype.init = function () {
    this.SetupPage();
    this.LoadData();

    // Camera
    this.InitializeCamera();
    this.InitializeCameraControlls(false);

    this.InitializeRenderer();

    // Composer setup
    this.composer = new Composer();
    this.composer.createBloomPass(true, true);
    this.composer.createFinalComposer();

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
    camera = new THREE.OrthographicCamera(this.canvasSize.x / -2, this.canvasSize.x / 2, this.canvasSize.y / 2, this.canvasSize.y / -2, 0.1, 100000);
    camera.position.z = 5000;
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
    renderer = new THREE.WebGLRenderer({ antialias: true }); // preserveDrawingBuffer: true
    renderer.autoClear = false; //Set to true to remove pipes
    renderer.setPixelRatio(this.resolution);
    renderer.setSize(this.canvasSize.x, this.canvasSize.y );
    renderer.setClearColor(0x000000, 1); //0x0e293a //0x000000
    document.getElementById("Genvo-App").appendChild(renderer.domElement);
}




//-------------------------------------------------------------
// ---------------  Main program ------------------------------
//-------------------------------------------------------------

var visualisation = new GenvoVisualisation();
visualisation.init();

var WebGlRenderer = new Renderer();