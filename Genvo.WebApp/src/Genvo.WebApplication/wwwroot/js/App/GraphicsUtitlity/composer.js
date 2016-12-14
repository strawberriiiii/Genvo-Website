function Composer() {
}

Composer.prototype.createFinalComposer = function(bloomPass){
    this.final = new THREE.EffectComposer( renderer );
    this.final.addPass( new THREE.RenderPass( scene, camera ) );
    this.final.addPass( bloomPass );
}

Composer.prototype.createBloomPass = function(shader, renderToScreen, needSwap){
    if (renderToScreen === undefined) { renderToScreen = false }
    if (needSwap === undefined) { needSwap = false }


    // Create the glow composer
    composer.bloom = new THREE.EffectComposer( renderer ); //, renderTargetGlow );
    const bloomEffectsLayerPass = new THREE.RenderPass( bloomEffectsLayerScene, camera);
    composer.bloom.addPass( bloomEffectsLayerPass );

    //var blur = this.createBlurShaderPass();

    //composer.bloom.addPass( blur.horizontal );
    //composer.bloom.addPass( blur.vertical ); 
    composer.bloom.addPass( new THREE.BloomPass(2, 25, 4, 256) );

    shader.uniforms[ "tAdd" ].value = composer.bloom.renderTarget1;

    var bloomPass = new THREE.ShaderPass( shader );
    bloomPass.needSwap = needSwap;
    bloomPass.renderToScreen = renderToScreen;

    this.renderEffectToScreen(composer.bloom);
    
    return bloomPass;
}

Composer.prototype.createBlurShaderPass = function(){
  const hblur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
  const vblur = new THREE.ShaderPass( THREE.VerticalBlurShader );

  return {horizontal: hblur, vertical: vblur};
}

Composer.prototype.renderEffectToScreen = function(comp){
    const effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;
    comp.addPass(effectCopy);
}
