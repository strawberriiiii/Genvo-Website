// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert("The File APIs are not fully supported in this browser. Use the latest Chrome browser");
}


// Global variables
var guestTreeFile;
var hostTreeFile;


//---------------------------------------------------------
//---------------Handle file drop--------------------------
//---------------------------------------------------------

function handleHostFile(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var file = getDropedFile(evt);

    document.getElementById("dz-host-text").innerHTML = "<strong>" + escape(file.name) + "</strong>";
    readSelectedFile(file, "host");
}

function handleGuestFile(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var file = getDropedFile(evt);

    document.getElementById("dz-guest-text").innerHTML = "<strong>" + escape(file.name) + "</strong>";
    readSelectedFile(file, "guest");
}

function getDropedFile(evt) {
    var files = evt.dataTransfer.files; // FileList object.
    return files[0];
}

function readSelectedFile(file, type) {
  var reader = new FileReader();

  reader.onload = function(evt) {
      if(evt.target.readyState !== 2) return;
      if(evt.target.error) {
          alert("Error while reading file");
          return;
      }

      if (type === "host") {
          hostTreeFile = ParseTreeData(evt.target.result);
      }
      else if (type === "guest") {
          guestTreeFile = ParseTreeData(evt.target.result);
      }
      else{
        console.log("error 1: drop zone ID error");
      }

      if (guestTreeFile !== undefined && hostTreeFile !== undefined){
          $("#senddatatoviz").removeClass("disabled");
      }
  };

  reader.readAsText(file);

}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
}


//---------------------------------------------------------
//---------------Send files to the viz---------------------
//---------------------------------------------------------
function senddata(){
    // Make sure species and gene files are given
    if (guestTreeFile === undefined || hostTreeFile === undefined) {
        window.alert("Host and / or guest tree not uploaded");
        return;
    }

    // Locally store datafiles for later access
    const files = {
        LabelFormat: $("input[name=twoFileLabelOption]:checked").val(),
        GeneTree: guestTreeFile,
        SpeciesTree: hostTreeFile
    }

    packdatalocal(files, "_GSTree");
    window.location.href = "visualization";
}

function packdatalocal(files, name){
    files = JSON.stringify(files);
    files = btoa(files);
    localStorage.setItem(name, files);
}

