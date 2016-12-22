//---------------------------------------------------------
//---------------INITIALIZER-------------------------------
//---------------------------------------------------------

GenvoTree.prototype.INIT = function (treeFiles, parameters) {
    // Set up parameters
    if ( parameters === undefined || parameters === null ) parameters = {};

    // Visual parameters
    const showNickname = parameters.hasOwnProperty("showNickname") ? parameters["showNickname"] : false;
    this.isReconciled = treeFiles.isReconciled;
    
    // Reconciliation parameters // David and Alm (2011) (i.e., PΔ = 2, PΘ = 3, and Ploss = 1)
    const pDup = parameters.hasOwnProperty("pDup") ? parameters["pDup"] : 2;
    const pLoss = parameters.hasOwnProperty("pLoss") ? parameters["pLoss"] : 1;
    const pTransfer = parameters.hasOwnProperty("pTransfer") ? parameters["pTransfer"] : 3;


    // Start work with tree
    if (!this.isReconciled) {
        this.addJSON(treeFiles.GeneTree);
        this.addJSON(treeFiles.SpeciesTree, "species");
        this.analyzeGuestTree(treeFiles.LabelFormat, showNickname);
    } else {
        this.addJSON(treeFiles.ReconTree);
        this.addJSON(treeFiles.ReconSpeciesTree, "species");
        this.analyzeGuestTree(treeFiles.LabelFormat, showNickname);
    }
    
    this.generateSpeciesColour(); //Must be done after the analysis of the tree

    if (!this.isReconciled) { this.reconcile(pDup, pLoss, pTransfer); }
    
    this.calculate3DPositions();
}


//---------------------------------------------------------
//---------------Main tree structure-----------------------
//---------------------------------------------------------


function GenvoTree() {
    this._root = new Node();
    this._speciesRoot = new SpeciesNode();

    // Simplified trees
    this.allSpecies = {};
    this.allSpeciesIndexes = [];
    this.geneLeafs = [];

    // Function groups
    this.allFunctionGroups = {};
    this.allFunctionGroups["undefined"] = new FunctionGroup("undefined");

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
    this.event = parameters.hasOwnProperty("event")         ? parameters["event"] : undefined;
    this.species = parameters.hasOwnProperty("species")     ? parameters["species"] : undefined;
    this.length = parameters.hasOwnProperty("length")       ? parameters["length"] : undefined;
    this.noLeafs = parameters.hasOwnProperty("noLeafs")     ? parameters["noLeafs"] : 0;
    this.FunctionGroup = "undefined";

    // Node grapphical attributes
    this.object = undefined; // 3D Object
    this.text = undefined; //Text 3D object 
    this.colour = undefined;
    this.subColour = undefined;
    this.edges = {parent: new Array(), children: new Array()}; // 3D edges

    // Reconcilliation variables
    this.index = undefined;
}

function SpeciesNode (parameters) {
    if ( parameters === undefined || parameters === null) parameters = {};

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
    this.colour = parameters.hasOwnProperty("colour")       ? parameters["colour"] : chroma('#ccc');
    this.subColour = parameters.hasOwnProperty("subColour")   ? parameters["subColour"] : chroma('#ccc');
    this.zPos = parameters.hasOwnProperty("zPos")           ? parameters["zPos"] : 0;
    this.yPos = parameters.hasOwnProperty("yPos")           ? parameters["yPos"] : 0;

    // Reconcilliation variables
    this.index = undefined;
}


function FunctionGroup(parameters){
    if ( parameters === undefined || parameters === null) parameters = {};

    this.name = parameters.hasOwnProperty("name")       ? parameters["name"]   : "undefined";
    this.colour = parameters.hasOwnProperty("colour")       ? parameters["colour"]   : chroma('#555');
    this.nodes = new Array();
}


Node.prototype.updateObjectPos = function(vThree){ // TODO Not done! 
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
    for(let key in this.allFunctionGroups){
        this.allFunctionGroups[key].nodes = [];
    }

    for(let i=0; i<this.geneLeafs.length; i++) {
        const g = this.geneLeafs[i];
        this.allFunctionGroups[g.FunctionGroup].nodes.push(g);
    }
}


////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////


GenvoTree.prototype.addJSON = function(JSON, treeType){
    // Check tree type and recurse from that root
    const tmpRoot = (treeType === "species") ? this._speciesRoot : this._root;
    var nodeName = (treeType === "species") ? "SpeciesNode" : "Node";
    var tmpIndex = 0;


    // this is a recurse and immediately-invoking function
    GenvoTree.prototype.recurse = function (currentNode, jFile) {
        // Manage data setup for the current node
        copyNodeData(currentNode, jFile);
        currentNode.index = tmpIndex;

        //Check if node is leaf
        currentNode.isLeaf = (jFile.children === undefined) ? true : false;

        // Add species to All Species list searchable by name or index
        if (treeType === "species") {
            if (!currentNode.isLeaf && currentNode.name === "") {
                currentNode.name = guid();
                currentNode.nickName = "No Name";
            }
            if (this.allSpecies[currentNode.name] !== undefined) {
                alert(`Doublet of species name: ${currentNode.name}`);
            }

            this.allSpecies[currentNode.name] = currentNode;
            this.allSpeciesIndexes[tmpIndex] = currentNode;
        }
        
        tmpIndex++;

        // Set up children
        if (!currentNode.isLeaf){
            for (var i = 0; i < jFile.children.length; i++){
                var child = new window[nodeName]({parent: currentNode}); //Create new Node or speciesNode //var child = new Node({parent: currentNode});
                currentNode.children.push(child);
                this.recurse(child, jFile.children[i]);
            }
        }
        else {
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


GenvoTree.prototype.analyzeGuestTree = function (labelFormat, nickName) {
    GenvoTree.prototype.recurse = function(g){
        // recurse over children
        for (var i = 0, length = g.children.length; i < length; i++) {
            this.recurse(g.children[i]);
        }
        
        if (this.isReconciled) {
            this.setEventType(g, labelFormat);
        }

        // Analyze number of Descendants to gene (not including it self)
        if (g.isLeaf || this.isReconciled) {
            this.analyzeLabel(g, labelFormat, nickName);
        }
        else{
            g.noLeafs = 0;
            g.children.forEach(function(ch){g.noLeafs += ch.noLeafs;});
        }
    }
    this.recurse(this._root);
}

GenvoTree.prototype.setEventType = function(g, labelFormat) {
    switch(labelFormat) {
        case "nhx":
            g.event = g.tag.nhx.event;
            if (g.event === undefined) { g.event = "loss" }
    }
}

GenvoTree.prototype.analyzeLabel = function(g, labelFormat, nickName) {
    const q = ["prime", "nhx", "prefix", "postfix"];
    let label;
    g.noLeafs = 1; //TODO Fix this on reconciled data
    g.FunctionGroup = this.allFunctionGroups[{ name: "undefined" }];

    while (true) {
        switch (labelFormat) {
            case "prefix":
                label = this.analyzeLabelPrefix(g.name);
                g.nickname = (nickName) ? label.guest : g.name;
                g.species = this.allSpecies[label.host];
                break;

            case "exampleData":
            case "postfix":
                var gs = this.analyzeLabelPostfix(g.name, "_");
                g.nickname = (nickName) ? gs[1] : g.name;
                g.species = this.allSpecies[gs[0]];
                break;

            case ("nhx"):
                if (g.tag.nhx !== undefined) {
                    g.nickname = (g.tag.nhx.name !== undefined) ? g.tag.nhx.name : g.name;
                    g.species = this.allSpecies[g.tag.nhx.species];
                }
                break;

            case ("prime"):
                if (g.tag.prime !== undefined) {
                    g.nickname = (g.tag.prime.name !== undefined) ? g.tag.prime.name : g.name;
                    g.species = this.allSpecies[g.tag.prime.species];
                }
                break;
        }

        // If mapping failed, test other method
        if (g.species === undefined) {
            console.log(`Mapping with ${labelFormat} label format failed.`);
            labelFormat = q.pop();
            if (labelFormat === undefined) {
                alert("We tried all our methods to map your data, but failed.");
                return;
            }
            console.log(`Trying to map with ${labelFormat} label format insetad`);
        } else {
            break;
        }
    }
}

GenvoTree.prototype.analyzeLabelPrefix = function (name) {
    var label = {};
    const keys = Object.keys(this.allSpecies);

    keys.forEach(function(key) {
        if (name.includes(key)) {
            label.host = key;
            label.guest = name.replace(key, "");
        }
    });
    return label;
}

// Extract species name from full gene name
GenvoTree.prototype.analyzeLabelPostfix = function (name, seperator) {
    var res = name.split(seperator);
    const r = new Array();

    if (res.length <= 1){
        return [res[0], res[0]];
    }

    r.push(res.pop());
    r.push(res.join(""));

    return r; //  r[0] = species, r[1] = gene
}


GenvoTree.prototype.generateSpeciesColour = function() {
    const noSpecies = Object.keys(this.allSpecies).length;
    const mainColorScheme = generateColourScheme(
        noSpecies,
        1,
        ["yellow", "33E0E0"], //['yellow', '008ae5']
        true
    );

    const subColorScheme = generateColourScheme(
        noSpecies,
        0.8,
        ["yellow", "33E0E0"], //['yellow', '008ae5'] // ['yellow', 'red']
        false
    );

    visualisation.Update({
        postOrder: true,
        traverseGuest: true,
        mainColorScheme: mainColorScheme,
        subColorScheme: subColorScheme
    });
}


function generateColourScheme(noColors, alpha, arrayOfColours, darken){

    // Variables
    var colourScheme = new Array();
    var step;
    alpha = (alpha === undefined) ? 1 : alpha;

    var scale = chroma.scale(arrayOfColours)
        .mode("lch")
        .correctLightness();

    // Generate colours
    if(noColors>1){
       step = 1/(noColors-1); 
   } else{step=1}
    
    for (let i = 0; i < noColors; i++) {
        let color;

        if (darken){
            color = scale(step * i).darken(2);//.saturate(1);
        }
        else{
            color = scale(step * i).saturate(1);
        }

        colourScheme.push(color);
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
    for (let key in JSON){
        if (key !== "children"){
            node[key] = JSON[key];
        } 
   }
}