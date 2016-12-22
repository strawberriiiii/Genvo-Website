function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
      s4() + "-" + s4() + s4() + s4();
}

function calculateArrayMax(a) {
    // Float infinity
    var maxVal = Number.NEGATIVE_INFINITY;
    var index = 0;

    // Find min value and index in a(g,•)
    for (var i = 0; i < a.length; i++) {
        if (a[i] > maxVal) {
            maxVal = a[i];
            index = i;
        }
    }

    const res = {
        value: maxVal,
        index: index
    };

    return res;
}

function posOnScreen(pos) {
    const p = pos.clone();
    const vector = p.project(camera);

    vector.x = (vector.x + 1) / 2 * canvasSize.x;
    vector.y = -(vector.y - 1) / 2 * canvasSize.y;

    return vector;
}

var print = {
    renderer: function (r, fileName) {
        if (fileName === undefined) { fileName = "GenvoVisualisation" }
        const link = document.createElement("a");
        link.download = fileName+".png";
        link.href = r.domElement.toDataURL("image/png").replace("image/png", "image/octet-stream");
        link.click();
    }
}