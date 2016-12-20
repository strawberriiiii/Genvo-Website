function onMouseMove(e) {

    e.preventDefault();

    mousePos.x = 2 * ((e.offsetX) / visualisation.canvasSize.x) - 1;
    mousePos.y = 1 - 2 * ((e.offsetY) / visualisation.canvasSize.y);
}


function onMouseHover() {
    ////////////
    raycaster.setFromCamera(mousePos, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {

        if (INTERSECTED !== intersects[0].object) {

            if (INTERSECTED) {
                INTERSECTED.material.opacity = INTERSECTED.currentOpacity;
            }

            INTERSECTED = intersects[0].object;

            INTERSECTED.currentOpacity = INTERSECTED.material.opacity;

            INTERSECTED.material.opacity = 1;
            document.getElementById("Genvo-App").style.cursor = "pointer";
            hover = true;

        }

    } else {
        //cameraControls.enabled = true;
        if (INTERSECTED) {
            INTERSECTED.material.opacity = INTERSECTED.currentOpacity;
            document.getElementById('Genvo-App').style.cursor = "default";
            hover = false;
        }

        INTERSECTED = null;

    }
}

function onDocumentMouseDown(e) {

    e.preventDefault();
    console.log("Mouse down");

    raycaster.setFromCamera(mousePos, camera);
    const intersects = raycaster.intersectObjects(scene.children);


    if (intersects.length > 0) {
        if (hover) {
            //cameraControls.enabled = false;
        }

        if (currentSelectedObject !== intersects[0].object.owner) {
            currentSelectedObject = intersects[0].object.owner; // Edit to choose first object of interest
        }


        if (currentSelectedObject !== undefined) {
            console.log(currentSelectedObject);
            for (let i = 0; i < floatingToolbar.length; i++) { floatingToolbar[i].style.visibility = "visible"; }
        }
    }
    else {
        //cameraControls.enabled = true;

        $('[data-toggle="popover"]').popover("hide");
        for (let i = 0; i < floatingToolbar.length; i++) { floatingToolbar[i].style.visibility = "hidden"; }

        currentSelectedObject = undefined;
    }
}