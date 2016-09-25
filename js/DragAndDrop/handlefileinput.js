// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser. Use the latest Chrome browser');
}


// Global variables
var file_genetree;
var file_speciestree;


//---------------------------------------------------------
//---------------Handle file drop--------------------------
//---------------------------------------------------------

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files; // FileList object.
  var file = files[0];
  // files is a FileList of File objects. List some properties.
  var output = [];
  
  output.push('<strong>', escape(file.name), '</strong> - ', file.size, ' bytes');

  var current_id = evt.target.id;
  if (current_id == "drop_zone_genetree"){
    document.getElementById('gene-list').innerHTML = '<ul>' + output.join('') + '</ul>';
  }else if (current_id == "drop_zone_speciestree"){
    document.getElementById('species-list').innerHTML = '<ul>' + output.join('') + '</ul>';
  }else{
    console.log("error 1: drop zone ID error")
  }
  

  // read the file 
  var reader = new FileReader();

  reader.onload = function(evt) {
      if(evt.target.readyState != 2) return;
      if(evt.target.error) {
          alert('Error while reading file');
          return;
      }

      if (current_id == "drop_zone_genetree"){
        file_genetree = convertData(evt.target.result);
      }
      else if (current_id == "drop_zone_speciestree"){
        file_speciestree = convertData(evt.target.result);
      }
      else{
        console.log("error 1: drop zone ID error");
      }

      if (file_genetree != undefined && file_speciestree != undefined){
        //Enable button  
      }
  };

  reader.readAsText(file);
  
}



function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

//---------------------------------------------------------
//---------------Check data--------------------------------
//---------------------------------------------------------

function convertData(data){
  //Detect data format
  //and check if convertion is possible

  //Convert newick data to a tree struct in javascript
  data = convertNewickDataToTree(data);

  //Check if the data is converted correctly

  return data;
}


function convertNewickDataToTree(data){
  //---------------------------------
  // Curtesy to Newick JS
  //---------------------------------
  //Variables
  var ancestors = [];
  var tree = {};

  //Prepare data from string
  var tokens = data.split(/\s*(;|\(|\)|,|:)\s*/);

  //Parse tokens into JSON tree
  for (var i=0; i<tokens.length; i++) {
    var token = tokens[i];
    switch (token) {

      case '(': // new branchset
        var subtree = {};
        tree.children = [subtree];
        ancestors.push(tree);
        tree = subtree;
        break;

      case ',': // another branch
        var subtree = {};
        ancestors[ancestors.length-1].children.push(subtree);
        tree = subtree;
        break;

      case ')': // optional name next
        tree = ancestors.pop();
        break;

      case ':': // optional length next
        break;

      default:
        var x = tokens[i-1];
        if (x == ')' || x == '(' || x == ',') {
          tree.name = token;
        } else if (x == ':') {
          tree.length = parseFloat(token);
        }
    }
  }
  return tree;
}












//---------------------------------------------------------
//---------------Use example data--------------------------
//---------------------------------------------------------
function addExampleData(){
  //Get server-side example files

  $.ajax({
    url: "./assets/exampleData/cesa_genes.tree",
    type: "POST",

    success: function(){
      console.log('successfully fetched example data');
    },
    error: function(){
      alert('failure');
    }
  })
  .done(function(data) {file_genetree = convertData(data) });

  $.ajax({
    url: "./assets/exampleData/plants.tree",
    type: "POST",

    success: function(){
      console.log('successfully fetched example data');
    },
    error: function(){
      alert('failure');
    }
  })
  .done(function(data) {file_speciestree = convertData(data) });

  document.getElementById('gene-list').innerHTML = '<ul> Example data cesa genes </ul>';
  document.getElementById('species-list').innerHTML = '<ul> Example data plant species </ul>'; 
}





//---------------------------------------------------------
//---------------Send files to the viz---------------------
//---------------------------------------------------------
function senddata(evt){
  // Make sure species and gene files are given
  if (file_genetree == undefined || file_speciestree == undefined) {
    window.alert("Gene and / or species tree not uploaded");
    return;
  }

  
  // Locally store datafiles for later access
  var files = {
    GeneTree: file_genetree,
    SpeciesTree: file_speciestree
  }

  packdatalocal(files, '_GSTree');

  window.location.href = "views/genvo_app.html";
}

function packdatalocal(files, name){
  files = JSON.stringify(files);
  files = btoa(files);
  localStorage.setItem(name, files);
}

//---------------------------------------------------------
//---------------Set up dnd listeners----------------------
//---------------------------------------------------------

var dropZoneG = document.getElementById('drop_zone_genetree');
dropZoneG.addEventListener('dragover', handleDragOver, false);
dropZoneG.addEventListener('drop', handleFileSelect, false);

var dropZoneS = document.getElementById('drop_zone_speciestree');
dropZoneS.addEventListener('dragover', handleDragOver, false);
dropZoneS.addEventListener('drop', handleFileSelect, false);

var sendbutton = document.getElementById('senddatatoviz');
sendbutton.addEventListener('click', senddata, false);


var exampledatabutton = document.getElementById('button_exampledata');
exampledatabutton.addEventListener('click', addExampleData, false)