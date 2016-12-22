document.getElementById("btnPrintVisualisation").addEventListener("click", function () {
    WebGlRenderer.takeImage = true;
});
document.getElementById("renderingTechnique").addEventListener("click", function (e) {
    if (e.target.checked) {
        WebGlRenderer.UpdateRenderingTechnique("Print");
    } else {
        WebGlRenderer.UpdateRenderingTechnique("Normal");
    }
    
});