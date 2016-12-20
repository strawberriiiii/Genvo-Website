GenvoVisualisation.prototype.Update = function (param) {
    var preOrder = false;
    var postOrder = false;
    var inOrder = false;

    if (param === null || param === undefined) { param = {} }
    if (param.preOrder !== undefined && param.preOrder) { preOrder = true }
    if (param.postOrder !== undefined && param.postOrder) { postOrder = true }
    if (param.inOrder !== undefined && param.inOrder) { inOrder = true }

    if (param.traverseHost === undefined) { param.traverseHost = false }
    if (param.traverseGuest === undefined) { param.traverseHost = false }

    if (postOrder && param.traverseHost) { this.TraversePostOrder(GeneTree._root, param) }
    if (postOrder && param.traverseGuest) { this.TraversePostOrder(GeneTree._speciesRoot, param) }
}


GenvoVisualisation.prototype.TraversePreOrder = function() {
    console.log("TraversePreOrder");
}

GenvoVisualisation.prototype.TraversePostOrder = function (node, param) {
    function recurse(node) {
        node.children.forEach(function (ch) {
            recurse(ch);
        });


        if (param.hasOwnProperty("mainColorScheme")) {
            node.colour = param.mainColorScheme.pop();
        }
        if (param.hasOwnProperty("subColorScheme")) {
            node.subColour = param.subColorScheme.pop();
        }
    }

    recurse(node);
}