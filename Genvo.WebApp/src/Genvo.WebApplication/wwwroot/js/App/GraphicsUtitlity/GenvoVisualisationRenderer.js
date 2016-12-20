function Renderer() {
    this.frameRateTime = 1000 / 30;
    this.render();
}



//Updates every frame
Renderer.prototype.render = function () {
    const renderRecurse = this.render.bind(this);
    setTimeout(function () {
        requestAnimationFrame(renderRecurse);
    }, this.frameRateTime);



    this.supportCheckers();
    onMouseHover();

    //Animate
    TWEEN.update();

    renderer.clear();
    composer.bloom.render(0.1);
    composer.final.render(0.1);
}


Renderer.prototype.supportCheckers = function () {
    // Checks variables and toggles depending on user situation
    // Updates eac frame
    // Edit button position
    if (currentSelectedObject !== undefined) {
        const vector = posOnScreen(currentSelectedObject.object.position);
        const buttons = floatingToolbar;
        const angle = Math.PI / buttons.length;

        buttons[0].style.left = vector.x + "px";
        buttons[0].style.top = (vector.y - 10) + "px";



        for (let i = 1; i < buttons.length; i++) {
            buttons[i].style.left = (vector.x + (Math.cos(angle * i) * 50)) + "px";
            buttons[i].style.top = (vector.y - (Math.sin(angle * i) * 50)) + "px";
        }
    }




    // Camera control
    if (dialog.dialog("isOpen") || hover) {
        cameraControls.enabled = false;
    }
    else {
        cameraControls.enabled = true;
    }
}