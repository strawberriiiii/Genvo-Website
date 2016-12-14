//---------------------------------------------------------
//---------------Check data--------------------------------
//---------------------------------------------------------
function DataParser(rawData) {
    this.data = this.ParseNewickToJSON(rawData);
}

function ParseTreeData(data, isExampleData) {
    const parser = new DataParser(data, isExampleData);
    return parser.data;
}

DataParser.prototype.ParseNewickToJSON = function (rawData) {
    //---------------------------------
    // Curtesy to Newick JS
    // This algorithm is based on the open source Newick JS
    //---------------------------------
    //Variables
    var ancestors = [];
    var tree = {
        tag: {
            common: "",
            nhx: {},
            prime: {},
            notung: {}
        }
    };
    var isInLabel = false;
    var tmpMessage = "";

    //Prepare data from string
    const tokens = rawData.split(/\s*(;|\(|\)|,|:|\[|\])\s*/);

    //Parse tokens into JSON tree
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const subtree = {};
        
        if (isInLabel && token !== "]") {
            tmpMessage += token;
            continue;
        }

        switch (token) {

            case "(": // new branchset

                tree.children = [subtree];
                ancestors.push(tree);
                tree = subtree;
                tree.tag = {};
                break;

            case ",": // another branch
                ancestors[ancestors.length - 1].children.push(subtree);
                tree = subtree;
                tree.tag = {};
                break;

            case ")": // optional name next
                tree = ancestors.pop();
                break;

            case ":": // optional length next
                break;

            case "[":
                isInLabel = true;
                break;

            case "]":
                tree.tag = this.parseTreeTag(tmpMessage, tree.tag);
                isInLabel = false;
                tmpMessage = "";
                break;

            default:
                var x = tokens[i - 1];
                if (x === ")" || x === "(" || x === ",") {
                    tree.name = token;
                } else if (x === ":") {
                    tree.length = parseFloat(token);
                }
                break;
        }
    }
    console.log(tree);
    return tree;
}

DataParser.prototype.parseTreeTag = function (token, orgTreeTag) {
    const tags = token.split(/\s*(\${2}NHX|\&{2}NHX|\&{2}PRIME|\&{2}NOTUNG-SPECIES-TREE|\&{2}NOTUNG-PARAMETERS|S=|ID=|NAME=|:D=|:)\s*/);
    var mode;
    var endLoop = false;
    const tagTree = {
        notung: (orgTreeTag.notung !== undefined) ? orgTreeTag.notung : {},
        prime: (orgTreeTag.prime !== undefined) ? orgTreeTag.prime : {},
        nhx: (orgTreeTag.nhx !== undefined) ? orgTreeTag.nhx : {},
        common: (orgTreeTag.common !== undefined) ? orgTreeTag.common : ""
    };

    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];

        switch (tag) {
            
            case "&&NOTUNG-PARAMETERS":
            case "&&NOTUNG-SPECIES-TREE":
                mode = "notung";
                endLoop = true;
                continue;

            case "&&NHX":
            case "$$NHX":
                mode = "nhx";
                continue;

            case "&&PRIME":
                mode = "prime";
                continue;
        }

        const prevTag = tags[i - 1];

        switch(mode) {
            case "prime":
                parsePrimeLabel(tagTree, tag, prevTag);
                break;
            case "nhx":
                parseNhxLabel(tagTree, tag, prevTag);
                break;
            case "notung":
                this.parseNotung(tagTree, tags, prevTag);
                break;
            default:
                tagTree.common += tag;
                break;
        }

        if(endLoop){break}
    }
    return tagTree;
}

DataParser.prototype.parseNotung = function (tagTree, tags, prevTag) {
    switch(prevTag) {
        case "&&NOTUNG-SPECIES-TREE":
            tagTree.notung.speciesTree = tags.slice(2).join("");
            break;
        case "&&NOTUNG-PARAMETERS":
            tagTree.notung.parameters = tags.slice(2).join("");
            break;
    }
}

function parseNhxLabel(tagTree, tag, prevTag) {
    
    switch (prevTag) {
        case ":D=":
            tagTree.nhx.event = (tag==="Y") ? "dup" : "spec";
            break;
        case "S=":
            tagTree.nhx.species = tag;
            break;
        case "NAME=":
            tagTree.nhx.name = tag;
            break;
    }
}

function parsePrimeLabel(tagTree, tag, prevTag) {
    
    switch (prevTag) {
        case "S=":
            tagTree.prime.species = tag;
            break;
        case "NAME=":
            tagTree.prime.name = tag;
            break;
        case "ID=":
            tagTree.prime.id = tag;
            break;
        default:
            break;
    }
}