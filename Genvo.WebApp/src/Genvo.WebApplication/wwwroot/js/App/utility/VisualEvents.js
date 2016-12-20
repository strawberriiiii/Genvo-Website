function openPopOver() {
    // Hide all buttons
    for (let i = 0; i < floatingToolbar.length; i++) { floatingToolbar[i].style.visibility = "hidden"; }

    // Toggle camera control
    // cameraControls.enabled = false;

    if (currentSelectedObject.isLeaf) { // TODO Doesnt work since menue is off node, and click is thereby on undefined object
        const dialog = $("#dialog-form");
        dialog.dialog("open");
    }
}


function onWindowResize() {
    visualisation.canvasSize = { x: window.innerWidth, y: window.innerHeight };
    const canvasSize = visualisation.canvasSize;

    // Orthographics
    camera.left = -canvasSize.x / 2;
    camera.right = canvasSize.x / 2;
    camera.top = canvasSize.y / 2;
    camera.bottom = -canvasSize.y / 2;

    camera.updateProjectionMatrix();


    // Perspective
    //camera.aspect = canvasSize.x / canvasSize.y;
    //camera.updateProjectionMatrix();

    renderer.setSize(canvasSize.x, canvasSize.y);
}