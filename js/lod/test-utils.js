/*
 * Console utilities for creating synthetic performance-test data.
 */
var LodmillaTest = new function() {
    var treeCounter = 0;
    var typeURI = "urn:lodmilla:test:type";
    var connectionURI = "urn:lodmilla:test:child";

    function validateNonNegativeInteger(value, name) {
        if (typeof value !== "number" || !isFinite(value) || value < 0 || Math.floor(value) !== value) {
            throw new Error(name + " must be a non-negative integer.");
        }
    }

    function getNodeCount(depth, width) {
        var count = 1;
        var levelSize = 1;

        for (var level = 1; level <= depth; level++) {
            levelSize *= width;
            count += levelSize;
        }

        if (!isFinite(count)) {
            throw new Error("The requested tree is too large.");
        }

        return count;
    }

    /**
     * Creates a directed tree for performance testing.
     *
     * Run from the browser console:
     *     LodmillaTest.createTree(3, 4);
     *
     * Depth 0 creates only the root. Each node above the last level has
     * exactly `width` children.
     */
    this.createTree = function(depth, width) {
        validateNonNegativeInteger(depth, "depth");
        validateNonNegativeInteger(width, "width");

        if (!Graph.canvas || typeof jsPlumbInstance === "undefined" || !jsPlumbInstance) {
            throw new Error("LODmilla must be initialized before creating a test tree.");
        }

        var startedAt = new Date().getTime();
        var expectedNodeCount = getNodeCount(depth, width);
        var treeID = new Date().getTime() + "-" + treeCounter++;
        var uriPrefix = "urn:lodmilla:test:tree:" + treeID + ":";
        var levelGap = Profile.nodeHeight + 80;
        var nodeGap = Profile.nodeWidth + 30;
        var startTop = $(document).scrollTop() + 50;
        var startLeft = $(document).scrollLeft() + Profile.sidemenuWidth + 50;
        var levels = [];
        var edges = [];
        var createdNodes = [];
        var nodeIndex = 0;

        levels.push([]);

        for (var level = 0; level <= depth; level++) {
            var levelSize = level === 0 ? 1 : levels[level - 1].length * width;
            var levelWidth = Math.max(0, (levelSize - 1) * nodeGap);
            var levelLeft = startLeft - levelWidth / 2;

            if (!levels[level]) {
                levels[level] = [];
            }

            for (var position = 0; position < levelSize; position++) {
                var uri = uriPrefix + nodeIndex;
                var node = new Node(uri, "Test node " + nodeIndex);

                node.loaded = true;
                node.type = Profile.defaultNodeType;
                node.typeUris[typeURI] = "LODmilla test node";
                node.top = startTop + level * levelGap;
                node.left = levelLeft + position * nodeGap;

                Graph.nodes[uri] = node;
                levels[level].push(node);
                createdNodes.push(node);

                if (level > 0) {
                    var parent = levels[level - 1][Math.floor(position / width)];
                    var connection = parent.addConnection(uri, connectionURI, "out", node.label);
                    edges.push({
                        source: parent.resource_id,
                        target: uri,
                        connection: connection
                    });
                }

                nodeIndex++;
            }
        }

        Graph.addNodeType(typeURI, "LODmilla test node");
        Profile.addPropertyToList(connectionURI, "child");
        jsPlumbInstance.setSuspendDrawing(true);

        try {
            for (var i = 0; i < createdNodes.length; i++) {
                createdNodes[i].vis_show(false, false);
            }

            for (var edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
                var edge = edges[edgeIndex];
                vis_jsPlumbInstance_connect_uri(edge.source, edge.target, edge.connection);
            }
        } finally {
            jsPlumbInstance.setSuspendDrawing(false, true);
        }

        var result = {
            rootURI: levels[0][0].resource_id,
            nodes: expectedNodeCount,
            connections: edges.length,
            depth: depth,
            width: width,
            elapsedMilliseconds: new Date().getTime() - startedAt
        };

        console.log("LODmilla test tree created", result);
        return result;
    };
};
