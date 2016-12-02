//-------------------------------------------------------------
// ---------------  Create meshes -----------------------------
//-------------------------------------------------------------
function getStdGeometry(parameters) {
    if (parameters === undefined) parameters = {};
    var geometry = parameters.hasOwnProperty("geometry") ? parameters["geometry"] : undefined;
    var radious = parameters.hasOwnProperty("radious") ? parameters["radious"] : 5;
    var g;

    switch (geometry) {
        case 'cube':
             g = new THREE.BoxGeometry(7, 7, 7);
            break;
        case 'plane':
            g = new THREE.BoxGeometry(1, 1, 0);
            break;
        case 'circle':
            g = new THREE.CircleGeometry(1, 16);
            break;
        case 'sphere':
            g = new THREE.SphereGeometry(radious, 32, 32);
            break;
        case 'pyramid':
            g = new THREE.Geometry();

            g.vertices = [
                new THREE.Vector3(-1, -1, -1),
                new THREE.Vector3(1, -1, -1),
                new THREE.Vector3(0, -1, 1),
                new THREE.Vector3(0, 1, 0)
            ];

            g.faces = [
                new THREE.Face3(0, 1, 2), //Bottom
                new THREE.Face3(1, 0, 3),
                new THREE.Face3(0, 2, 3),
                new THREE.Face3(2, 1, 3)
            ];

            g.applyMatrix(new THREE.Matrix4().makeScale(5, 5, 5));
            break;

        default:
            break;
    }
    return g;
}

function createMaterial(parameters) {
    if (parameters === undefined) parameters = {};
    var material;

    var colour = parameters.hasOwnProperty("colour") ? parameters["colour"] : "black";
    var transparent = (parameters.hasOwnProperty("opacity")) ? true : false;
    var opacity = parameters.hasOwnProperty("opacity") ? parameters["opacity"] : 1;

    switch (colour) {
        case "red":
            material = new THREE.MeshBasicMaterial({ color: 0xe87b70, opacity: opacity, transparent: transparent });
            break;
        case "green":
            material = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: opacity, transparent: transparent });
            break;
        case "blue":
            material = new THREE.MeshBasicMaterial({ color: 0x4355ff, opacity: opacity, transparent: transparent });
            break;
        case "white":
            material = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: opacity, transparent: transparent });
            break;
        case "grey":
            material = new THREE.MeshBasicMaterial({ color: 0x555555, opacity: opacity, transparent: transparent });
            break;

        default:
            material = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: opacity, transparent: transparent });
            break;
    }
    return material;
}