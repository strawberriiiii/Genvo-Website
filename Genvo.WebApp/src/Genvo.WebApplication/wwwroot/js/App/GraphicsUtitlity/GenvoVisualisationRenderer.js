function Renderer() {
    this.takeImage = false;
    this.renderingTechnique = "Normal";
    this.frameRateTime = 1000 / 30;
    this.clock = new THREE.Clock();
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
    const delta = this.clock.getDelta();
    visualisation.composer.bloom.render(delta);
    visualisation.composer.final.render(delta);

    if (this.takeImage) {
        this.takeImage = false;
        print.renderer(renderer);
    }
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

Renderer.prototype.UpdateRenderingTechnique = function (tec) {
    if (tec !== undefined) {
        this.renderingTechnique = tec;
    }

    switch (this.renderingTechnique) {
        case "Advanced":
        case "Normal":
            renderer.setClearColor(0x000000, 1);
            this.EnablePasses(visualisation.composer.bloom);
            break;
        case "Print":
        case "Simple":
            renderer.setClearColor(0xffffff, 1);
            this.DisablePasses(visualisation.composer.bloom);
            break;
    }
}

Renderer.prototype.DisablePasses = function (composition) {
    if (composition !== undefined && composition !== null && composition.passes !== undefined) {
        composition.passes.forEach(function (pass) {
            pass.enabled = false;
        });
        composition.renderTarget1.dispose();
        composition.renderTarget2.dispose();
    }
}
Renderer.prototype.EnablePasses = function (composition) {
    if (composition !== undefined && composition !== null && composition.passes !== undefined) {
        composition.passes.forEach(function (pass) {
            pass.enabled = true;
        });
    }
}