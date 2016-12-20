var scene;
var bloomEffectsLayerScene;

function GenvoVisualisation() {
    this.additionalresolution = 1;
    this.resolution = this.additionalresolution * window.devicePixelRatio;
    this.canvasSize = { x: window.innerWidth, y: window.innerHeight };

    scene = new THREE.Scene();
    bloomEffectsLayerScene = new THREE.Scene();
}