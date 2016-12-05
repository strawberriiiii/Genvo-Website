﻿//---------------------------------------------------------
//---------------Check data--------------------------------
//---------------------------------------------------------

function ParseTreeData(data, isExampleData) {
    if (isExampleData === undefined || isExampleData === null){isExampleData = false}

    if (isExampleData) {
        return ParseNewickToJSON(data);
    }

    var dataType = $('input[name="twoFileFormatOption"]:checked').val();

    switch (dataType) {
        case "newick":
            data = ParseNewickToJSON(data);
            break;
        case "nhx":
            data = ParseNhxToGenvoTree(data);
            break;
        case "notung":
            data = ParseNotungToGenvoTree(data);
            break;
    }

    //TODO
    //Check if the data is converted correctly

    return data;
}

function ParseNotungToJSON(data) {
    console.log("Convert from Notung");
}

function ParseNhxToJSON(data) {
    console.log("convert from Nhx");
}

function ParseNewickToJSON(data) {
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
                break;
        }
    }
    return tree;
}