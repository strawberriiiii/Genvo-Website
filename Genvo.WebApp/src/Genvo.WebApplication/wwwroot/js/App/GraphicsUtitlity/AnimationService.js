function createCameraMove(view) {
    const target = cameraControls.target0;
    const zoomTarget = cameraControls.zoom0;
    var _target;
    switch (view) {
        case "dup":
            // Object target
            _target = new THREE.Vector3;
            _target.copy(target);
            _target.z = cameraControls.position0.z;
            break;

        case "spec":
            // Object target
            _target = new THREE.Vector3(-cameraControls.position0.z, target.y, 0);
            break;
    }
    

    const object = cameraControls.object;
    const cameraTarget = cameraControls.target;
    const time = 2000;

    new TWEEN.Tween({ zoom: object.zoom })
        .to({ zoom: zoomTarget }, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(function () {
            cameraControls.updateProjMatrix(this.zoom);
        })
        .start();

    new TWEEN.Tween(object.position)
        .to(_target, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(function () {
            cameraControls.update();
        })
        .start();

    new TWEEN.Tween(cameraTarget)
        .to(target, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(function () {
            cameraControls.update();
        })
        .start();
};


function createAnimatedMove(node, target) { // Currently only supporting move of nodes
    const object = node.object;
    const edges = node.edges;
    const time = 3000;

    new TWEEN.Tween(object.position)
        .to(target, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .start();

    edges.children.forEach(function (e) {
        new TWEEN.Tween(e.geometry.vertices[0])
        .to(target, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(function () {
            e.geometry.verticesNeedUpdate = true;
        })
        .start();
    });



    edges.parent.forEach(function (e) {
        new TWEEN.Tween(e.geometry.vertices[1])
        .to(target, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(function () {
            e.geometry.verticesNeedUpdate = true;
        })
        .start();
    });
};