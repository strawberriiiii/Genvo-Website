// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert("The File APIs are not fully supported in this browser. Use the latest Chrome browser");
}


// Global variables
let guestTreeFile;
let hostTreeFile;
let reconciledTreeFile;
let reconciledHostTreeFile;


//---------------------------------------------------------
//---------------Handle file drop--------------------------
//---------------------------------------------------------

function handleHostFile(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var file = getDropedFile(evt);

    document.getElementById("dz-host-text").innerHTML = `<strong>${escape(file.name)}</strong>`;
    readSelectedFile(file, "host");
}

function handleGuestFile(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var file = getDropedFile(evt);

    document.getElementById("dz-guest-text").innerHTML = `<strong>${escape(file.name)}</strong>`;
    readSelectedFile(file, "guest");
}

function handleReconFile(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var file = getDropedFile(evt);

    document.getElementById("dz-recon-text").innerHTML = `<strong>${escape(file.name)}</strong>`;
    readSelectedFile(file, "reconciled");
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

      switch(type) {
          case "host":
              hostTreeFile = ParseTreeData(evt.target.result);
              break;
          case "guest":
              guestTreeFile = ParseTreeData(evt.target.result);
              break;
          case "reconciled":
              reconciledTreeFile = ParseTreeData(evt.target.result);
              break;
          default:
              alert("error 1: drop zone ID error");
              break;
      }

      if (reconciledTreeFile !== undefined) {
          $("#btnvisualizereconciled").removeClass("disabled");
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
  evt.dataTransfer.dropEffect = "copy";
}


//---------------------------------------------------------
//---------------Send files to the viz---------------------
//---------------------------------------------------------
function senddata(evt) {
    var files;

    if (evt.target.id === "btnvisualizereconciled") {
        if (reconciledTreeFile === undefined) {
            window.alert("Host and / or guest tree not uploaded");
            return;
        }

        const labelFormat = $("input[name=reconciledFileFormatOption]:checked").val();
        getReconciledSpeciesTree(labelFormat);

        // Locally store datafiles for later access
        files = {
            isReconciled: true,
            LabelFormat: labelFormat,
            ReconTree: reconciledTreeFile,
            ReconSpeciesTree: reconciledHostTreeFile
        }
    } else {
        if (guestTreeFile === undefined || hostTreeFile === undefined) {
            window.alert("Host and / or guest tree not uploaded");
            return;
        }

        // Locally store datafiles for later access
        files = {
            isReconciled: false,
            LabelFormat: $("input[name=twoFileLabelOption]:checked").val(),
            GeneTree: guestTreeFile,
            SpeciesTree: hostTreeFile
        }
    }

    packdatalocal(files, "_GSTree");
    window.location.href = "visualization";
}

function getReconciledSpeciesTree(format) {
    switch (format) {
        case "nhx":
            reconciledHostTreeFile = ParseTreeData(reconciledTreeFile.tag.notung.speciesTree);
            break;
    }
}

function packdatalocal(files, name){
    files = JSON.stringify(files);
    files = btoa(files);
    localStorage.setItem(name, files);
}

