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
    var tree = {};
    var isInLabel = false;
    var tmpMessage = "";

    //Prepare data from string
    const tokens = rawData.split(/\s*(;|\(|\)|,|:|\[|\])\s*/);

    //Parse tokens into JSON tree
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const subtree = {};
        
        if (isInLabel && token !== "]") {//&& tokens[i+1] !== "[" //Watch out for index out of range
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
                tree.tag = this.parseTreeTag(tmpMessage);
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
    return tree;
}

DataParser.prototype.parseTreeTag = function (token) {
    var tags = token.split(/\s*(\${2}NHX|\&{2}PRIME|S=|ID=|NAME=)\s*/);

    var mode;
    var tagTree = {
        prime: {},
        nhx: {},
        common: ""
    };

    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];

        switch (tag) {
            case "$$NHX":
                mode = "nhx";
                continue;

            case "&&PRIME":
                mode = "prime";
                continue;
        }

        const prevTag = tags[i - 1];

        if (mode === "prime") { parsePrimeLabel(tagTree, tag, prevTag) }
        else if (mode === "nhx") { parseNhxLabel(tagTree, tag, prevTag) }
        else{tagTree.common += tag}
    }
    return tagTree;
}

function parseNhxLabel(tagTree, tag, prevTag) {
    switch (prevTag) {
        case "S=":
            tagTree.prime.species = tag;
            break;
        case "NAME=":
            tagTree.prime.name = tag;
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