//---------------------------------------------------------
//---------------Check data--------------------------------
//---------------------------------------------------------
function DataParser(data, isExampleData) {
    if (isExampleData === undefined || isExampleData === null) { isExampleData = false }

    this.data = data;

    console.log(isExampleData);

    if (isExampleData) {
        this.data = this.ParseNewickToJSON();
        return;
    }

    var dataType = $('input[name="twoFileFormatOption"]:checked').val();
    console.log(dataType);
    switch (dataType) {
        case "newick":
            this.data = this.ParseNewickToJSON();
            break;
        case "nhx":
            this.data = this.ParseNhxToGenvoTree();
            break;
        case "notung":
            this.data = this.ParseNotungToGenvoTree();
            break;
    }
}

function ParseTreeData(data, isExampleData) {

    var parser = new DataParser(data, isExampleData);
    return parser.data;
}

DataParser.prototype.ParseNotungToJSON = function (data) {
    console.log("Convert from Notung");
}

DataParser.prototype.ParseNhxToJSON = function (data) {
    console.log("convert from Nhx");
}

DataParser.prototype.ParseNewickToJSON = function () {
    //---------------------------------
    // Curtesy to Newick JS
    //---------------------------------
    //Variables
    var ancestors = [];
    var tree = {};

    //Prepare data from string
    const tokens = this.data.split(/\s*(;|\(|\)|,|:)\s*/);

    console.log(tokens);

    //Parse tokens into JSON tree
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var subtree = {};

        switch (token) {

            case "(": // new branchset

                tree.children = [subtree];
                ancestors.push(tree);
                tree = subtree;
                break;

            case ",": // another branch
                ancestors[ancestors.length - 1].children.push(subtree);
                tree = subtree;
                break;

            case ")": // optional name next
                tree = ancestors.pop();
                break;

            case ":": // optional length next
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