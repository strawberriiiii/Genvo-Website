//---------------------------------------------------------
//---------------INITIALIZER-------------------------------
//---------------------------------------------------------

GenvoTree.prototype.INIT = function (treeFiles, parameters) {
    // Set up parameters
    if ( parameters === undefined ) parameters = {};

    // Visual parameters
    var seperator = parameters.hasOwnProperty("seperator") ? parameters["seperator"] : "_";
    var showNickname = parameters.hasOwnProperty("showNickname") ? parameters["showNickname"] : false;
    
    // Reconciliation parameters // David and Alm (2011) (i.e., PΔ = 2, PΘ = 3, and Ploss = 1)
    var pDup = parameters.hasOwnProperty("pDup") ? parameters["pDup"] : 2;
    var pLoss = parameters.hasOwnProperty("pLoss") ? parameters["pLoss"] : 1;
    var pTransfer = parameters.hasOwnProperty("pTransfer") ? parameters["pTransfer"] : 3;


    // Start work with tree
    this.addJSON(treeFiles.GeneTree);
    this.addJSON(treeFiles.SpeciesTree, "species");
    this.analyzeGeneTree(seperator, showNickname);
    this.reconcile(pDup, pLoss, pTransfer);
    this.calculate3DPositions();
}


//---------------------------------------------------------
//---------------Main tree structure-----------------------
//---------------------------------------------------------


function GenvoTree() {
    //var node = new Node();
    this._root = new Node(); // One for genetree and one for species tree?
    this._speciesRoot = new speciesNode();

    // Simplified trees
    this.allSpecies = {};
    this.allSpeciesIndexes = [];
    this.geneLeafs = [];

    // Function groups
    this.allFunctionGroups = {};
    this.allFunctionGroups["undefined"] = new functionGroup("undefined");

    // Reconsciliation variables // rows = species, columns = genes
    this.noGeneEvents = 0;
    this.noSpeciations = 0;
    this.noSpeciesLeaf = 0;
}


function Node (parameters) {
    if ( parameters === undefined ) parameters = {};
    // Tree data
    this.parent = parameters.hasOwnProperty("parent")       ? parameters["parent"]   : null;
    this.children = parameters.hasOwnProperty("children")   ? parameters["children"] : [];
    this.isLeaf = false;

    // Node meta-data
    this.name = parameters.hasOwnProperty("fullName")       ? parameters["fullName"] : undefined;
    this.nickname = parameters.hasOwnProperty("nickname")   ? parameters["nickname"] : undefined;
    this.event = parameters.hasOwnProperty("event")      ? parameters["event"] : undefined;
    this.species = parameters.hasOwnProperty("species")    ? parameters["species"] : undefined;
    this.length = parameters.hasOwnProperty("length")     ? parameters["length"] : undefined;
    this.noLeafs = parameters.hasOwnProperty("noLeafs") ? parameters["noLeafs"] : 0;
    this.functionGroup = "undefined";

    // Node grapphical attributes
    this.object = undefined; // 3D Object
    this.text = undefined; //Text 3D object 
    this.colour = undefined;
    this.subColour = undefined;
    this.edges = {parent: new Array(), children: new Array()}; // 3D edges

    // Reconcilliation variables
    this.index = undefined;
}

function speciesNode (parameters) {
    if ( parameters === undefined ) parameters = {};

    // Tree data
    this.parent = parameters.hasOwnProperty("parent")       ? parameters["parent"]   : null;
    this.children = parameters.hasOwnProperty("children")   ? parameters["children"] : [];
    this.isLeaf = false;

    // Node meta-data
    this.name = parameters.hasOwnProperty("fullName")       ? parameters["fullName"] : undefined;
    this.nickname = parameters.hasOwnProperty("nickname")   ? parameters["nickname"] : undefined;
    this.event = parameters.hasOwnProperty("event")         ? parameters["event"]   : undefined;
    this.length = parameters.hasOwnProperty("length")       ? parameters["length"]  : undefined;


    // Node grapphical attributes
    this.colour = parameters.hasOwnProperty("colour")   ? parameters["colour"] : chroma('#ccc');
    this.subColour = parameters.hasOwnProperty("subColour")   ? parameters["subColour"] : chroma('#ccc');
    this.zPos = parameters.hasOwnProperty("zPos")       ? parameters["zPos"] : 0;
    this.yPos = parameters.hasOwnProperty("yPos")       ? parameters["yPos"] : 0;

    // Reconcilliation variables
    this.index = undefined;
}


function functionGroup(parameters){
    if ( parameters === undefined ) parameters = {};

    this.name = parameters.hasOwnProperty("name")       ? parameters["name"]   : "undefined";
    this.colour = parameters.hasOwnProperty("colour")       ? parameters["colour"]   : chroma('#555');
    this.nodes = new Array();
}


Node.prototype.updateObjectPos = function(vThree){ // Not done! 
    this.object.position.copy(vThree);
}

Node.prototype.updateObjectYPos = function(yPos){
    // Update object position
    var vThree = this.object.position.clone();
    vThree.y = yPos;
    this.object.position.copy(vThree);

    // Update edges
    this.updateEdges(vThree);
}

Node.prototype.updateEdges = function(position){
    // Update edges
    this.edges.children.forEach(function(e){
        e.geometry.vertices[0] = position;
        e.geometry.verticesNeedUpdate = true;
    });

    this.edges.parent.forEach(function(e){
        e.geometry.vertices[1] = position;
        e.geometry.verticesNeedUpdate = true;
    });
}




GenvoTree.prototype.updateFunctionList = function(){
    // Clear set arrays
    for(key in this.allFunctionGroups){
        this.allFunctionGroups[key].nodes = [];
    }

    for(i=0; i<this.geneLeafs.length; i++){
        var g = this.geneLeafs[i];
        this.allFunctionGroups[g.functionGroup].nodes.push(g);
    }
}


////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////


GenvoTree.prototype.addJSON = function(JSON, treeType){
    // Check tree type and recurse from that root
    var tmpRoot = (treeType === "species") ? this._speciesRoot : this._root;
    var nodeName = (treeType === "species") ? "speciesNode" : "Node";
    var tmpIndex = 0;


    // this is a recurse and immediately-invoking function
    GenvoTree.prototype.recurse = function (currentNode, jFile) {
        // Manage data setup for the current node
        copyNodeData(currentNode, jFile);
        currentNode.index = tmpIndex;

        // Add species to All Species list searchable by name or index
        if (treeType === "species"){
            this.allSpecies[currentNode.name] = currentNode;
            this.allSpeciesIndexes[tmpIndex] = currentNode;
        }

        tmpIndex ++;

        // Set up children
        if (jFile.children !== undefined){
            for (var i = 0; i < jFile.children.length; i++){
                var child = new window[nodeName]({parent: currentNode}); //Create new Node or speciesNode //var child = new Node({parent: currentNode});
                currentNode.children.push(child);
                this.recurse(child, jFile.children[i]);
            }
        }
        else {
            currentNode.isLeaf = true;
            if (treeType === "genes" || treeType === undefined){
                this.geneLeafs.push(currentNode);
            } 
            else if (treeType === "species"){
                this.noSpeciesLeaf ++;
            }
        }

    }
    this.recurse(tmpRoot, JSON);

    if (treeType === "genes" || treeType === undefined){
        this.noGeneEvents = tmpIndex;
    }
    else if (treeType === "species"){
        this.noSpeciations = tmpIndex;
    }
};




GenvoTree.prototype.analyzeGeneTree = function(seperator, NN){
    GenvoTree.prototype.recurse = function(g){
        // recurse over children
        for (var i = 0, length = g.children.length; i < length; i++) {
            this.recurse(g.children[i]);
        }

        // Analyze number of Descendants to gene (not including it self)
        if (g.isLeaf){
            g.noLeafs = 1;
        }
        else{
            g.noLeafs = 0;
            g.children.forEach(function(ch){g.noLeafs += ch.noLeafs;});
        }

        // analyze gene names
        if (g.isLeaf){ //currentNode.name !== ""
            var gs = this.extractSpeciesName(g.name, seperator);
            g.nickname = (NN) ? gs[1] : g.name;
            g.species = this.allSpecies[gs[0]];

            // Set function group to undefined
            g.functionGroup = this.allFunctionGroups[{name: "undefined"}];
        }

    }

    // Go throught all nodes and analyze gene name
    this.recurse(this._root);

    // From species create colour scheme
    this.generateSpeciesColour();
}


// Extract species name from full gene name
GenvoTree.prototype.extractSpeciesName = function (name, seperator, seperatorIndex){
    var res = name.split(seperator);
    var r = new Array();

    if (res.length <= 1){
        return [res[0], res[0]];
    }

    r.push(res.pop());
    r.push(res.join(""));
    // Check if identified species is in the list for all species
    if ( !this.allSpecies.hasOwnProperty(r[0]) ) { // Find in species tree and remove class species (replaced by species node)
        this.allSpecies[r[0]] = new speciesNode({
            name: r[0]
        });
    }

    return r; //  r[0] = species, r[1] = gene
}


GenvoTree.prototype.generateSpeciesColour = function(){

    var mainColourScheme = generateColourScheme(
        this.noSpeciesLeaf, 
        1,
        ['yellow', '33E0E0'], //['yellow', '008ae5']
        true
    );

    var subColourScheme = generateColourScheme(
        this.noSpeciesLeaf, 
        0.8,
        ['yellow', '33E0E0'], //['yellow', '008ae5'] // ['yellow', 'red']
        false
    );


    var i = 0;
    for (key in this.allSpecies){ // ONLY GENERATE FOR Le(S)
        if (key !== "" && this.allSpecies[key].isLeaf){
            this.allSpecies[key].colour = mainColourScheme[i];
            this.allSpecies[key].subColour = subColourScheme[i];
            i++;
        }
    }
}


function generateColourScheme(noColors, alpha, arrayOfColours, darken){

    // Variables
    var colourScheme = new Array();
    var alpha = (alpha === undefined) ? 1 : alpha;

    scale = chroma.scale(arrayOfColours)
        .mode('lch')
        .correctLightness();

    // Generate colours
    if(noColors>1){
       var step = 1/(noColors-1); 
   } else{step=1}
    
    for (i=0; i<noColors; i++){
        if (darken){
            var colour = scale(step * i).darken(2);//.saturate(1);
        }
        else{
            var colour = scale(step * i).saturate(1);
        }

        colourScheme.push(colour);
    }

    return colourScheme;
}















//---------------------------------------------------------
//---------------Optimal rooting---------------------------
//---------------------------------------------------------

GenvoTree.prototype.findOptRoot = function(){

}



GenvoTree.prototype.changeRoot = function(newRoot){
    
}

















//---------------------------------------------------------
//---------------Reconcilliation---------------------------
//---------------------------------------------------------

GenvoTree.prototype.reconcile = function(pDelta, pLoss, pTransfer){
    // Variables
    var noGeneEvents = this.noGeneEvents + 1;
    var noSpeciations = this.noSpeciations + 1;

    // Dynamic programming variables
    var c = createArray(noGeneEvents, noSpeciations);
    var cSum = createArray(noGeneEvents, noSpeciations);
    var cDelta = createArray(noGeneEvents, noSpeciations);
    var cOmega = createArray(noGeneEvents, noSpeciations);
    var inMain = createArray(noGeneEvents, noSpeciations);
    var inAlt = createArray(noGeneEvents, noSpeciations);
    var outMain = createArray(noGeneEvents, noSpeciations);
    


    // STEP 1
    // init variables
    for (row = 0; row < noGeneEvents; row ++){
        for (column = 0; column < noSpeciations; column ++){
            // STEP 2
            c[row][column]      = {value: Number.POSITIVE_INFINITY, index: undefined};
            cSum[row][column]   = Number.POSITIVE_INFINITY;
            cDelta[row][column] = Number.POSITIVE_INFINITY;
            cOmega[row][column] = Number.POSITIVE_INFINITY;
            inMain[row][column] = Number.POSITIVE_INFINITY;
            inAlt[row][column]  = Number.POSITIVE_INFINITY;
            outMain[row][column] = Number.POSITIVE_INFINITY;
        }
    }

    // STEP 3
    this.geneLeafs.forEach(function(g){ 
        // Variables
        var dS = 0;
        var s = g.species;

        // STEP 4
        c[g.index][s.index].value = 0;

        while (s !== null) {
            inMain[g.index][s.index] = pLoss * dS;
            inAlt[g.index][s.index] = 0;

            dS ++;
            s = s.parent;
        }
         
    });


    // STEP 5
    GenvoTree.prototype.recurseInternalNodesG = function(g){
        // Do not traverse leafs
        if (g.isLeaf){
            return;
        }

        // Traverse post-order
        for (var i = 0; i < g.children.length; i++) {
            this.recurseInternalNodesG(g.children[i]);
        }

        // STEP 6
        GenvoTree.prototype.recurseNodesS = function(s){
            if (!s.isLeaf){
                for (var i = 0; i < s.children.length; i++) {
                    this.recurseNodesS(s.children[i]);
                }
            }

            // STEP 7
            var g_1 = g.children[0];
            var g_2 = g.children[1];


            if (s.isLeaf){ // STEP 8
                cSum[g.index][s.index] = Number.POSITIVE_INFINITY ; // STEP 9
                cDelta[g.index][s.index] = pDelta + c[g_1.index][s.index].value + c[g_2.index][s.index].value; // STEP 10

                // STEP 11
                if (s.parent !== null) {
                    cOmega[g.index][s.index] = pTransfer + Math.min(
                        inMain[g_1.index][s.index] + outMain[g_2.index][s.index],
                        inMain[g_2.index][s.index] + outMain[g_1.index][s.index]
                    );
                }

                // STEP 12 
                c[g.index][s.index] = calculateArrayMin([
                    cSum[g.index][s.index],
                    cDelta[g.index][s.index],
                    cOmega[g.index][s.index]
                    ]);

                // STEP 13 & 14
                inMain[g.index][s.index] = c[g.index][s.index].value;
                inAlt[g.index][s.index] = c[g.index][s.index].value;
            }
            else {
                // STEP 16
                var s_1 = s.children[0];
                var s_2 = s.children[1];

                // STEP 17
                cSum[g.index][s.index] = Math.min(
                    inMain[g_1.index][s_1.index] + inMain[g_2.index][s_2.index],
                    inMain[g_2.index][s_1.index] + inMain[g_1.index][s_2.index]
                    );

                // STEP 18
                cDelta[g.index][s.index] = pDelta + calculateArrayMin([
                    c[g_1.index][s.index].value + inMain[g_2.index][s_2.index] + pLoss,
                    c[g_1.index][s.index].value + inMain[g_2.index][s_1.index] + pLoss,
                    c[g_2.index][s.index].value + inMain[g_1.index][s_2.index] + pLoss,
                    c[g_2.index][s.index].value + inMain[g_1.index][s_1.index] + pLoss,
                    c[g_1.index][s.index].value + c[g_2.index][s.index].value,
                    inMain[g_1.index][s_1.index] + inMain[g_2.index][s_2.index] + 2*pLoss,
                    inMain[g_1.index][s_2.index] + inMain[g_2.index][s_1.index] + 2*pLoss,
                    inMain[g_1.index][s_1.index] + inMain[g_2.index][s_1.index] + 2*pLoss,
                    inMain[g_1.index][s_2.index] + inMain[g_2.index][s_2.index] + 2*pLoss
                    ]).value;

                // STEP 19
                if (s.parent !== null){
                    cOmega[g.index][s.index] = pTransfer + Math.min(
                        inMain[g_1.index][s.index] + outMain[g_2.index][s.index],
                        inMain[g_2.index][s.index] + outMain[g_1.index][s.index]
                        );
                }

                // STEP 20
                c[g.index][s.index] = calculateArrayMin([
                    cSum[g.index][s.index], 
                    cDelta[g.index][s.index],
                    cOmega[g.index][s.index]
                    ]);

                // STEP 21
                inMain[g.index][s.index] = calculateArrayMin([
                    c[g.index][s.index].value,
                    inMain[g.index][s_1.index] + pLoss,
                    inMain[g.index][s_2.index] + pLoss
                    ]).value;

                // STEP 22
                inAlt[g.index][s.index] = calculateArrayMin([
                    c[g.index][s.index].value,
                    inAlt[g.index][s_1.index],
                    inAlt[g.index][s_2.index]
                    ]).value;
            }
        }
        this.recurseNodesS(this._speciesRoot);

        // STEP 23
        GenvoTree.prototype.recurseInternalNodesS = function(s){
            // Only work with internal nodes
            if (s.isLeaf){
                return;
            }

            // STEP 24
            s_1 = s.children[0];
            s_2 = s.children[1];

            // STEP 25
            outMain[g.index][s_1.index] = Math.min(outMain[g.index][s.index], inAlt[g.index][s_2.index]);
            outMain[g.index][s_2.index] = Math.min(outMain[g.index][s.index], inAlt[g.index][s_1.index]);

            // Pre order traversal
            for (var i = 0; i < s.children.length; i++) {
                this.recurseInternalNodesS(s.children[i]);
            }
        }
        this.recurseInternalNodesS(this._speciesRoot);
    }
    this.recurseInternalNodesG(this._root);

    // STEP 26

    // Map each I(G) = V(G)\Le(G) to best matching I(S) = V(S)\Le(S)
    GenvoTree.prototype.recurseNodesG = function (g){
        if (g.isLeaf){return;}

        // Traverse post-order
        for (var i = 0; i < g.children.length; i++) {
            this.recurseNodesG(g.children[i]);
        }


        // Find species with given index from the minimum value in c[g.index]
        var index = calculateArrayMin(c[g.index].map(function(a) {return a.value})).index;
        g.species = this.allSpeciesIndexes[index];

        // Check what even that occurs in the node
        switch (c[g.index][index].index){
            case 0: // Loss event
                g.event = "loss";
                break;

            case 1: // Duplication event
                g.event = "dup";
                break;

            case 2: // Transfer event
                g.event = "trans";
                break;
            default:
                console.log("ERROR - event can not be identified");
        }

        // Check if a loss is also a speciation event
        if(g.event === "loss" && g.children[0].species.name !== g.species.name && g.children[1].species.name !== g.species.name){
            g.event = "spec";
        }

    }
    this.recurseNodesG(this._root);
}




// Function for creating an empty array with a set length
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function calculateArrayMin(a){
    // Float infinity
    var minVal = Number.POSITIVE_INFINITY;
    var index = 0;

    // Find min value and index in a(g,•)
    for (var i = 0; i < a.length; i++) {
      if (a[i] < minVal) {
        minVal = a[i];
        index = i;
      }
    }

    // Loop over all values
    //a.forEach(function(d){
    //    minVal = Math.min(d,minVal);
    //});

    var res = {
        value: minVal,
        index: index
    };

    return res;
}

















//---------------------------------------------------------
//---------------Reconcilliation---------------------------
//---------------------------------------------------------

GenvoTree.prototype.calculate3DPositions = function(){
    // Species position (zPos)
    var zPos = 0;

    GenvoTree.prototype.recurseNodesS = function(s){

        for (var i = 0; i < s.children.length; i++) {
            this.recurseNodesS(s.children[i]);
        }

        switch(s.children.length){
            case 0:
                s.zPos = zPos;
                zPos += 50;
                break;

            case 1:
                s.zPos = s.children[0].zPos;
                break;

            case 2:
                var childDist = s.children[1].zPos - s.children[0].zPos;
                s.zPos = s.children[0].zPos + (childDist / 2);
        }
    }
    this.recurseNodesS(this._speciesRoot);
}






















//---------------------------------------------------------
//---------------Helper functions--------------------------
//---------------------------------------------------------

function copyNodeData(node, JSON){
    for (var key in JSON){
        if (key !== "children"){
            node[key] = JSON[key];
        } 
   }
}