/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth - MTA SZTAKI DSD
 *
 */
 
/*
 * Class:Graph
 */
var Graph = new function() {
    /**
     * The nodes in the graph
     */
    this.nodes = {};
    this.nodeTypes = {};

    this.undoActionList = [];

    this.canvas = null;

    this.lastsavedgraphid = null;
    this.lastsavedgraphname = "";
    this.lastsavedgraphusername = "";

    /**
     * Initialises the graph.
     * @param {type} parent
     * @returns {undefined}
     */
    this.init = function(parent) {
        $(parent).append('<div id="graph"></div>');
        this.canvas = $('#graph');
        this.vis_engineInit();
        console.log('initiated');
    };

    this.addNodeType = function(type) {
        var ret = false;
        if (!this.nodeTypes[type]) {
            this.nodeTypes[type] = 0;
            ret = true;
        }
        this.nodeTypes[type] = this.nodeTypes[type] + 1;
        return ret;
    };

    /**
     * Adds a new node to the graph
     * @param {type} resource_id
     * @returns {undefined}
     */
    this.addNode = function(resource_id, label, top, left, highlight, undoActionLabel, aroundNode) {
        if (typeof(aroundNode) === 'undefined')
            aroundNode = false;
        if (!(this.getNode(resource_id))) {
            new_node = new Node(resource_id, label);
            if (top && left) {
                new_node.top = top;
                new_node.left = left;
            }
            this.nodes[resource_id] = new_node;
            new_node.collectData(highlight, undoActionLabel);
            new_node.vis_show(highlight, aroundNode);
//            new_node.vis_repaintConnections();
        } else {
            if (highlight)
                Graph.highlight($("div.resourceNodeBox[uri='" + resource_id + "']"), 2);
        }
    };

    this.getNode = function(resource_id) {
        return this.nodes[resource_id];
    };

    /**
     * Removes a resource from the graph
     * @param {String} resource_id 
     * @returns {undefined}
     */
    this.deleteNode = function(resource_id) {
        var node = this.nodes[resource_id];
        delete this.nodes[resource_id];
        node.vis_delete();
    };

    /**
     * Clears the graph and removes all nodes and connections.
     */
    this.clear = function() {
        var parent = $('#graph').parent()[0];
        this.vis_clear();
        this.nodes = {};
        this.canvas.remove();
        this.init($(parent));
    };

    /**
     * Serializes the content of the graph
     * @returns {@exp;$@call;toJSON}
     */
    this.serialize_0 = function() {
        var s_nodes = {};

        $.each(this.nodes, function(index, node) {
            s_nodes[index] = node.serialize_0();
        });
        /*return $.toJSON({
         nodes: s_nodes
         });*/
        return $.toJSON({
            nodes: s_nodes,
            scrollX: window.scrollX,
            scrollY: window.scrollY
        });
    };

    this.findPath = function(jsonobject, undoActionLabel) {
        if (jsonobject && jsonobject.error !== undefined) {
            Profile.alertDialog(Profile.alertTexts.findPathResult.title, Profile.alertTexts.findPathResult.text);
        }
        else {
            if (jsonobject.graph.nodes !== undefined) {
                Sidemenu.vis_remove_load_progressbar($('#findPathPalette'));
                var nodeList = [];
                $.each(jsonobject.graph.nodes, function(index, node) {
                    if (!(Graph.getNode(node.resource_id)))
                        nodeList.push({resource_id: node.resource_id, action: 'added', highlighted: true});
                    var aroundNode = Graph.getAroundNode(jsonobject.graph.input, node.dist);
                    Graph.addNode(node.resource_id, false, false, false, true, false, aroundNode);
                });
                Graph.logUndoAction(undoActionLabel, nodeList);
            }
        }
        $('#findPathPalette .findPathButton').attr('loading', 'false');
    };

    this.searchRemote = function(jsonobject, undoActionLabel) {
        if (jsonobject && jsonobject.error !== undefined) {
            Profile.alertDialog(Profile.alertTexts.searchRemoteResult.title, Profile.alertTexts.searchRemoteResult.text);
        }
        else {
            if (jsonobject.graph.nodes !== undefined) {
                Sidemenu.vis_remove_load_progressbar($('#searchIIPalette'));
                Graph.vis_removeAllHighlights();
                var nodeList = [];                
                
                $.each(jsonobject.graph.nodes, function(index, node) {
                    var highlighted;
                    
                    var exists = false;
                    var tempNode = Graph.getNode(node.resource_id);
                    if (tempNode) exists = true;
                    
                    if (node.selected && node.selected !== undefined)
                        highlighted = true;
                    else
                        highlighted = false;
                    var aroundNode = Graph.getAroundNode(jsonobject.graph.input, node.dist);
                    Graph.addNode(node.resource_id, false, false, false, highlighted, false, aroundNode);
                    if (!exists)                        
                        nodeList.push({resource_id: node.resource_id, action: 'added', highlighted: highlighted});
                });

                Graph.logUndoAction(undoActionLabel, nodeList);
            }
        }
        $('#searchIIPalette .searchIIButton').attr('loading', 'false');
    };

    this.searchConnections = function(jsonobject, undoActionLabel) {
        if (jsonobject && jsonobject.error !== undefined) {
            Profile.alertDialog(Profile.alertTexts.searchConnectionResult.title, Profile.alertTexts.searchConnectionResult.text);
        }
        else {
            if (jsonobject.graph.nodes !== undefined) {
                Sidemenu.vis_remove_load_progressbar($('#searchConnectionPalette'));
                Graph.vis_removeAllHighlights();
                var nodeList = [];
                $.each(jsonobject.graph.nodes, function(index, node) {
                    if (!(Graph.getNode(node.resource_id)))
                        nodeList.push({resource_id: node.resource_id, action: 'added', highlighted: true});
                    var aroundNode = Graph.getAroundNode(jsonobject.graph.input, node.dist);
                    Graph.addNode(node.resource_id, false, false, false, true, false, aroundNode);
                });

                Graph.logUndoAction(undoActionLabel, nodeList);
            }
        }
        $('#searchConnectionPalette .searchConnectionButton').attr('loading', 'false');
    };

    /**
     * Loads a previously 
     * @param {type} jsonobject
     * @returns {undefined}
     */
    this.load = function(jsonobject, undoActionLabel) {
        if (jsonobject.error !== undefined) {
            Profile.alertDialog(Profile.alertTexts.loadGraph.title, Profile.alertTexts.loadGraph.text);
        } else {
            Graph.clear();
            if (jsonobject.graph.nodes !== undefined) {
                Graph.lastsavedgraphid = jsonobject.graph_id;
                Graph.lastsavedgraphname = jsonobject.graph_name;
                Graph.lastsavedgraphusername = jsonobject.graph_username;
                var nodeList = [];
                $.each(jsonobject.graph.nodes, function(index, node) {
//                    console.log("add node: " + node.resource_id);
                    if (!(Graph.getNode(node.resource_id)))
                        nodeList.push({resource_id: node.resource_id, action: 'added', highlighted: false});
                    Graph.addNode(node.resource_id, node.label, node.top, node.left, false);
                });

                Graph.logUndoAction(undoActionLabel, nodeList);

                window.scrollTo(jsonobject.graph.scrollX, jsonobject.graph.scrollY);
            }
        }
    };

    /**
     * Highlights the nodes and some of their connections.
     * edgehl: 0 - do not highlight the edges at all
     *         1 - highlight all edges attached to the highlighted nodes
     *         2 - highlight all edges which both end is connected to highlighted nodes
     * 
     * @param {type} selector jQuery selector
     * @param {type} edgehl edge highlight type
     * @returns {undefined}
     */
    this.highlight = function(selector, edgehl) {
        this.vis_highlight(selector, edgehl);
    };

    /**
     * Removes the highlighting from all nodes and edges.
     * @returns {undefined}
     */
    this.removeAllHighlights = function() {
        this.vis_removeAllHighlights();
    };

    this.removeHighlight = function(selector) {
        this.vis_removeHighlight(selector);
    };
    this.highlightAll = function() {
        this.vis_highlightAll();
    };

    this.logUndoAction = function(undoActionLabel, nodeList) {
        if (undoActionLabel && undoActionLabel !== undefined && nodeList) {
            this.undoActionList.push({undoActionLabel: undoActionLabel, nodeList: nodeList});
        }
        else {
//            console.log('_action is NOT recorded by undo');
        }
    };

    this.undo = function() {
        var undoAction = this.undoActionList.pop();
        if (undoAction && undoAction['nodeList']) {
            $.each(undoAction['nodeList'], function(index, node) {
                if (node.action === 'added')
                    Graph.deleteNode(node.resource_id);
                else if (node.action === 'removed') {
                    var top = false;
                    var left = false;
                    if (node.top && node.top !== undefined)
                        top = node.top;
                    if (node.left && node.left !== undefined)
                        left = node.left;

                    if (node.highlighted)
                        Graph.addNode(node.resource_id, false, top, left, true, false);
                    else
                        Graph.addNode(node.resource_id, false, top, left, false, false);
                }
            });
        }
    };
    
    // placing nodes on the canvas, with minimal intelligence - get the nearest node
    this.getAroundNode = function(inputList, distanceList){
        var aroundNode;
        // opened from the right panel - place aroiund the corresponding node
        if (typeof(inputList) === 'undefined' && typeof(distanceList) === 'undefined')
            aroundNode = Graph.getNode($('#nodeOpenedContent').attr('resourceuri'));
        // newly added node from the left addNewBox, place randomly
        else if (inputList === false && distanceList === false)
            aroundNode = false;
        // added from a search function from the left sidebar
        else{
            // place next to the nearest node
            // TODO: place in the middle of more nodes (plus in swimlanes according to hop distance)
            var i = 0, minDistance = 9999, mI = 0;
            while(i < distanceList.length) {
                // the search result is the node itself (dist: 0)
                if(0 <= distanceList[i] && distanceList[i] < minDistance) {
                    mI = i;
                    minDistance = distanceList[i];
                }
                i++;
            }
//            console.log(inputList, distanceList, mI, minDistance);
            // the search result is not connected to any of the nodes (dist: -1) - place randomly
            if (minDistance < 0 || minDistance === 9999)
                aroundNode = false;
            // place around the nearest (minimum hop) node
            else
                aroundNode = this.getNode(inputList[mI]);
        }
        return aroundNode;
    };


};
