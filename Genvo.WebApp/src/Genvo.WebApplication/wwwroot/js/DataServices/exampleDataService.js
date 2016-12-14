function addExampleData() {
    //Get server-side example files
    $.when(loadExampleHostTree(), loadExampleGuestTree()).done(function (a1, a2) {
        hostTreeFile = ParseTreeData(a1[0]);
        guestTreeFile = ParseTreeData(a2[0]);

        document.getElementById("dz-host-text").innerHTML = "<strong>Example data loaded</strong>";
        document.getElementById("dz-guest-text").innerHTML = "<strong>Example data loaded</strong>";

        $("#senddatatoviz").removeClass("disabled");

        $("input[name=twoFileLabelOption]:checked").parent().removeClass("active");
        const labelButton = $("input[name=twoFileLabelOption]:radio[value=postfix]");
        labelButton.prop("checked", true);
        labelButton.parent().addClass("active");

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