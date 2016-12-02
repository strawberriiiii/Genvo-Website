function buildViz() {
    var xPos = 0;
    var xDelta = 20;


    ////////////////////////////////////////////////////////
    // Correct all speciation events height
    ////////////////////////////////////////////////////////

    // Set all leaf positions
    function recurseNodesG(g) {
        g.children.forEach(function (ch) { recurseNodesG(ch); });

        if (g.isLeaf) {
            // Draw node
            var nodeElement = new THREE.Mesh(getStdGeometry({ geometry: 'sphere' }), createMaterial({ colour: "grey", opacity: 0.8 }));

            // Set positions
            nodeElement.position.x = xPos;
            nodeElement.position.y = 0;
            nodeElement.position.z = g.species.zPos;

            // Add element to scene
            scene.add(nodeElement);

            xPos += xDelta;

            // Create text
            var fontSize = 12;

            var text = createPlaneText(g.nickname, {
                fontsize: fontSize,
                borderColor: g.species.colour,
                backgroundColor: g.species.subColour,
                fontface: 'Times',
                borderThickness: 2
            });

            text.position.set(nodeElement.position.x - fontSize / 2 + 6, nodeElement.position.y - text.position.x - 8, nodeElement.position.z);

            // Rotate 90 degrees
            text.rotation.z = -1.5625;

            // Add text to scene
            scene.add(text);


            // Save changes
            g.object = nodeElement;
            g.object.owner = g;
            g.text = text;
        }
    }
    recurseNodesG(GeneTree._root);




    // Build rest of tree
    function recurseNodesS(s) {
        s.children.forEach(function (ch) { recurseNodesS(ch); });

        var allSpeciations = new Array();
        var allParents = new Array();
        var maxAngle = 20; //degrees

        function recurseInternalNodesG(g) {
            if (g.isLeaf) { return; }

            g.children.forEach(function (ch) { recurseInternalNodesG(ch); });

            if (g.species.name !== s.name) { return; }

            ////////////////////////
            // 3D object
            switch (g.event) {
                case 'spec':
                    var nodeElement = new THREE.Mesh(getStdGeometry({ geometry: 'pyramid', radious: 4 }), createMaterial({ colour: "red", opacity: 0.8 }));
                    break;
                case 'dup':
                    var nodeElement = new THREE.Mesh(getStdGeometry({ geometry: 'pyramid' }), createMaterial({ colour: "grey", opacity: 0.8 }));
                    break;

                case 'loss':
                    var nodeElement = new THREE.Mesh(getStdGeometry({ geometry: 'cube' }), createMaterial({ colour: "grey", opacity: 0.8 }));
                    break;

                case 'trans':
                    var nodeElement = new THREE.Mesh(getStdGeometry({ geometry: 'cube' }), createMaterial({ colour: "red", opacity: 0.8 }));
                    break;

            }

            ///////////////////////
            // Positions

            // Variables
            var p0 = g.children[0].object.position;
            var p1 = g.children[1].object.position;
            var childDist = (p1.x - p0.x) / 2;

            // Draw nodes
            nodeElement.position.x = p0.x + childDist;
            nodeElement.position.z = g.species.zPos;

            // Set primary y pos
            if (childDist > 2 * xDelta) {
                nodeElement.position.y = Math.max(p0.y, p1.y) + childDist / Math.tan(maxAngle);
                //nodeElement.position.y = Math.max(p0.y, p1.y) + Math.sqrt(childDist*50);
            }
            else {
                nodeElement.position.y = Math.max(p0.y, p1.y) + childDist + Math.sqrt(childDist * 2);
            }

            scene.add(nodeElement);


            ///////////////////////
            // Save changes

            g.object = nodeElement;
            g.object.owner = g;

            ////////////////////////
            // Store speciation heights

            if (g.event === 'spec') {
                g.species.yPos = Math.max(g.species.yPos, g.object.position.y);
                allSpeciations.push(g);
            }
            else {
                allParents.push(g);
            }

        }
        recurseInternalNodesG(GeneTree._root);






        ///////////////////////////
        // Update all y positions

        allSpeciations.forEach(function (g) {
            g.object.position.y = g.species.yPos;

            createGraphEdge(g, true);
        });

        allParents.forEach(function (g) {
            var p0 = g.children[0].object.position;
            var p1 = g.children[1].object.position;
            var childDist = (p1.x - p0.x) / 2;

            // Set y pos
            if (childDist > 2 * xDelta) {
                g.object.position.y = Math.max(p0.y, p1.y) + childDist / Math.tan(maxAngle);
                //nodeElement.position.y = Math.max(p0.y, p1.y) + Math.sqrt(childDist*50);
            }
            else {
                g.object.position.y = Math.max(p0.y, p1.y) + childDist + Math.sqrt(childDist * 2);
            }

            createGraphEdge(g, true);

        });










        /////////////////////////////////
        // Set species labels and fill legend

        if (s.isLeaf) {
            var fontSize = 12;

            var text = createPlaneText(s.name, {
                fontsize: fontSize,
                autotextcolour: true,
                borderColor: s.colour,
                backgroundColor: s.subColour,
                fontface: 'Times',
                borderThickness: 2
            });

            text.position.set(-50, -text.position.x - 8, s.zPos);
            //text.position.set(nodeElement.position.x - fontSize/2 + 6 , nodeElement.position.y - text.position.x - 8, nodeElement.position.z);

            // Rotate 90 degrees
            text.rotation.z = -1.5625;
            text.rotation.y = -1.5625;

            // Add text to scene
            scene.add(text);


            // LEGEND
            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            var svgHeight = (100 / GeneTree.noSpeciesLeaf);
            d3.select("#legend")
                .append("div")
                    .attr("id", s.name)
                    .style("height", svgHeight + "%")
                    .style("width", "100%")
                    .style("background", s.subColour.hex());


            d3.select('#' + s.name)
                .append("div")
                    .html(s.name + "<br/>")
                    .style("position", "relative")
                    .style("left", "30px")
                    .style("top", "10px");


            d3.select('#' + s.name)
                .on("mouseover", function (d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(s.name + "<br/>")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", 0);
                });

        }


    }
    recurseNodesS(GeneTree._speciesRoot);







    //Initialize camera position centering the tree
    cameraControls.target0.x = Math.ceil(xPos / 2);
    cameraControls.target0.y = Math.ceil(GeneTree._root.object.position.y / 2);

    var target = new THREE.Vector3();
    target.copy(cameraControls.target0);
    target.z = cameraControls.position0.z;
    cameraControls.object.position.copy(target);

    var target = new THREE.Vector3();
    target.copy(cameraControls.target0);
    cameraControls.target = target;

    cameraControls.update();

    cameraControls.zoom0 = 1200 / xPos;
    cameraControls.updateProjMatrix(cameraControls.zoom0);

    cameraControls.maxZoom = 10;
    cameraControls.minZoom = 0.4;
}