//---------------------------------------------------------
//---------------Check data--------------------------------
//---------------------------------------------------------

function convertData(data) {
    //TODO
    //Detect data format
    //and check if convertion is possible
    var dataType = "newick";

    switch (dataType) {
        case "newick":
            data = convertNewickToGenvoTree(data);
    }

    //TODO
    //Check if the data is converted correctly

    return data;
}


function convertNewickToGenvoTree(data) {
    //---------------------------------
    // Curtesy to Newick JS
    //---------------------------------
    //Variables
    var ancestors = [];
    var tree = {};

    //Prepare data from string
    var tokens = data.split(/\s*(;|\(|\)|,|:)\s*/);

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
        }
    }
    return tree;
}