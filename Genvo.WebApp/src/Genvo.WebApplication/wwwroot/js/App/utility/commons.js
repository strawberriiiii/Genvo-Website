function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
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