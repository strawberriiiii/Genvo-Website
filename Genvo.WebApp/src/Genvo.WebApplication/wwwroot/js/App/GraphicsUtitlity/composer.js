function Composer() {
}

Composer.prototype.createFinalComposer = function(){
    this.final = new THREE.EffectComposer(renderer);
    this.final.addPass( new THREE.RenderPass(scene, camera) );
    this.final.addPass( this.bloomPass );
}

Composer.prototype.createBloomPass = function(renderToScreen, needSwap){
    if (renderToScreen === undefined) { renderToScreen = false }
    if (needSwap === undefined) { needSwap = false }

    // Create the bloom composer
    this.bloom = new THREE.EffectComposer( renderer ); //, renderTargetGlow );
    this.bloom.addPass(new THREE.RenderPass(bloomEffectsLayerScene, camera));
    this.bloom.addPass(new THREE.BloomPass(4, 25, 4, 256));

    //const blur = this.createBlurShaderPass(); //Makes a fusss
    //this.bloom.addPass( blur.horizontal );
    //this.bloom.addPass(blur.vertical);

    const shader = composer.additiveShader;
    shader.uniforms[ "tAdd" ].value = this.bloom.renderTarget1;

    this.bloomPass = new THREE.ShaderPass( shader );
    this.bloomPass.needSwap = needSwap;
    this.bloomPass.renderToScreen = renderToScreen;

    this.renderEffectToScreen(this.bloom);
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
