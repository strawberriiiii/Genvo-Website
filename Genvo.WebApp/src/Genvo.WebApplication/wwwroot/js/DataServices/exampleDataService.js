function addExampleData() {
    //Get server-side example files
    $.when(loadExampleHostTree(), loadExampleGuestTree()).done(function (a1, a2) {
        file_speciestree = convertData(a1[0]);
        file_genetree = convertData(a2[0]);

        document.getElementById("dz-host-text").innerHTML = "<strong>Example data loaded</strong>";
        document.getElementById("dz-guest-text").innerHTML = "<strong>Example data loaded</strong>";

        $("#senddatatoviz").removeClass("disabled");
        console.log("successfully fetched example data");
    });
}


function loadExampleHostTree() {
    return $.ajax({
        url: "./data/ExampleHostTree1",
        type: "POST"
    });
}

function loadExampleGuestTree() {
    return $.ajax({
        url: "./data/ExampleGuestTree1",
        type: "POST"
    });
}