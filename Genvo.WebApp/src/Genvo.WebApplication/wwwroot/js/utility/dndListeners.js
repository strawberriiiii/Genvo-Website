//---------------------------------------------------------
//---------------Set up dnd listeners----------------------
//---------------------------------------------------------

var dropZoneHost = document.getElementById("drop_zone_host");
dropZoneHost.addEventListener("dragover", handleDragOver, false);
dropZoneHost.addEventListener("drop", handleHostFile, false);
dropZoneHost.addEventListener("click", handleDragOver, false);

var dropZoneGuest = document.getElementById("drop_zone_guest");
dropZoneGuest.addEventListener("dragover", handleDragOver, false);
dropZoneGuest.addEventListener("drop", handleGuestFile, false);



var sendbutton = document.getElementById("senddatatoviz");
sendbutton.addEventListener("click", senddata, false);


var exampledatabutton = document.getElementById("button_exampledata");
exampledatabutton.addEventListener("click", addExampleData, false);
