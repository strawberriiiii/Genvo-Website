// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert("The File APIs are not fully supported in this browser. Use the latest Chrome browser");
}


// Global variables
var file_genetree;
var file_speciestree;


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
  //evt.stopPropagation();
  //evt.preventDefault();

  //var files = evt.dataTransfer.files; // FileList object.
  //var file = files[0];
  // files is a FileList of File objects. List some properties.
  //var output = [];

  //output.push("<strong>", escape(file.name), "</strong> - ", file.size, " bytes");

  //var currentId = evt.target.id;
  //  console.log(currentId);
  //if (currentId === "drop_zone_host") {
  //    document.getElementById("dz-host-text").innerHTML = "<strong>" + output.join("") + "</strong>";
  //} else if (currentId === "drop_zone_guest") {
  //    document.getElementById("dz-guest-text").innerHTML = "<strong>" + output.join("") + "</strong>";
  //}else {
  //    console.log("error 1: drop zone ID error");
  //}


  // read the file
  var reader = new FileReader();

  reader.onload = function(evt) {
      if(evt.target.readyState !== 2) return;
      if(evt.target.error) {
          alert("Error while reading file");
          return;
      }

      if (type === "host") {
          file_speciestree = convertData(evt.target.result);
      }
      else if (type === "guest") {
          file_genetree = convertData(evt.target.result);
      }
      else{
        console.log("error 1: drop zone ID error");
      }

      if (file_genetree !== undefined && file_speciestree !== undefined){
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
    if (file_genetree === undefined || file_speciestree === undefined) {
    window.alert("Gene and / or species tree not uploaded");
    return;
  }


  // Locally store datafiles for later access
  var files = {
    GeneTree: file_genetree,
    SpeciesTree: file_speciestree
  }

  packdatalocal(files, "_GSTree");
  window.location.href = "visualization";
}

function packdatalocal(files, name){
  files = JSON.stringify(files);
  files = btoa(files);
  localStorage.setItem(name, files);
}

