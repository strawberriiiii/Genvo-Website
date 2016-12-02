//---------------------------------------------------------
//---------------Reconcilliation---------------------------
//---------------------------------------------------------

GenvoTree.prototype.reconcile = function (pDelta, pLoss, pTransfer) {
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
    for (row = 0; row < noGeneEvents; row++) {
        for (column = 0; column < noSpeciations; column++) {
            // STEP 2
            c[row][column] = { value: Number.POSITIVE_INFINITY, index: undefined };
            cSum[row][column] = Number.POSITIVE_INFINITY;
            cDelta[row][column] = Number.POSITIVE_INFINITY;
            cOmega[row][column] = Number.POSITIVE_INFINITY;
            inMain[row][column] = Number.POSITIVE_INFINITY;
            inAlt[row][column] = Number.POSITIVE_INFINITY;
            outMain[row][column] = Number.POSITIVE_INFINITY;
        }
    }

    // STEP 3
    this.geneLeafs.forEach(function (g) {
        // Variables
        var dS = 0;
        var s = g.species;

        // STEP 4
        c[g.index][s.index].value = 0;

        while (s !== null) {
            inMain[g.index][s.index] = pLoss * dS;
            inAlt[g.index][s.index] = 0;

            dS++;
            s = s.parent;
        }

    });


    // STEP 5
    GenvoTree.prototype.recurseInternalNodesG = function (g) {
        // Do not traverse leafs
        if (g.isLeaf) {
            return;
        }

        // Traverse post-order
        for (var i = 0; i < g.children.length; i++) {
            this.recurseInternalNodesG(g.children[i]);
        }

        // STEP 6
        GenvoTree.prototype.recurseNodesS = function (s) {
            if (!s.isLeaf) {
                for (var i = 0; i < s.children.length; i++) {
                    this.recurseNodesS(s.children[i]);
                }
            }

            // STEP 7
            var g_1 = g.children[0];
            var g_2 = g.children[1];


            if (s.isLeaf) { // STEP 8
                cSum[g.index][s.index] = Number.POSITIVE_INFINITY; // STEP 9
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
                    inMain[g_1.index][s_1.index] + inMain[g_2.index][s_2.index] + 2 * pLoss,
                    inMain[g_1.index][s_2.index] + inMain[g_2.index][s_1.index] + 2 * pLoss,
                    inMain[g_1.index][s_1.index] + inMain[g_2.index][s_1.index] + 2 * pLoss,
                    inMain[g_1.index][s_2.index] + inMain[g_2.index][s_2.index] + 2 * pLoss
                ]).value;

                // STEP 19
                if (s.parent !== null) {
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
        GenvoTree.prototype.recurseInternalNodesS = function (s) {
            // Only work with internal nodes
            if (s.isLeaf) {
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
    GenvoTree.prototype.recurseNodesG = function (g) {
        if (g.isLeaf) { return; }

        // Traverse post-order
        for (var i = 0; i < g.children.length; i++) {
            this.recurseNodesG(g.children[i]);
        }


        // Find species with given index from the minimum value in c[g.index]
        var index = calculateArrayMin(c[g.index].map(function (a) { return a.value })).index;
        g.species = this.allSpeciesIndexes[index];

        // Check what even that occurs in the node
        switch (c[g.index][index].index) {
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
        if (g.event === "loss" && g.children[0].species.name !== g.species.name && g.children[1].species.name !== g.species.name) {
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
        while (i--) arr[length - 1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function calculateArrayMin(a) {
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
