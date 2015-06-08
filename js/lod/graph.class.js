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

    this.deletedConnectionsList = {};
    this.insertedConnectionsList = {};

    this.canvas = null;

    this.lastsavedgraphid = null;
    this.lastsavedgraphname = "";
    this.lastsavedgraphusername = "";

    this.zoomRatio = 1;

    this.LayoutEnum = {
        GRID : "Grid",
        RADIAL : "Radial",
        SPRING : "Spring",
        SPRINGXY : "SpringXY",
        NONE : "None"
    }

    this.layout = this.LayoutEnum.NONE;

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

    this.addNodeType = function(typeURI, typeLabel) {
        this.nodeTypes[typeURI] = typeLabel;
    };

    this.removeNodeType = function(typeURI) {
        delete this.nodeTypes[typeURI];
    };

    this.getNodesByType = function(typeURI){
        var nodes = [],
            tempNode;
        $.each(this.nodes, function(index, node){
            tempNode = node['typeUris'][typeURI];
            if (tempNode && tempNode !== 'undefined'){
                nodes.push(node);
            }
        });
        return nodes;
    };

    // DEPRECATED
//    this.addNodeType = function(type) {
//        var ret = false;
//        if (!this.nodeTypes[type]) {
//            this.nodeTypes[type] = 0;
//            ret = true;
//        }
//        this.nodeTypes[type] = this.nodeTypes[type] + 1;
//        return ret;
//    };

    /**
     * Adds a new node to the graph
     * @param {type} resource_id
     * @returns {undefined}
     */
    this.addNode = function(resource_id, label, top, left, highlight, undoActionLabel, aroundNode) {
        resource_id = decodeURIComponent(resource_id);
        if (typeof(aroundNode) === 'undefined')
            aroundNode = false;
        if (!(this.getNode(resource_id))) {
            var new_node = new Node(resource_id, label);
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

    this.addNewNode = function(newURI, nodeLabel, typeLabel, typeUri, endpointUri, thumbnailURL, undoActionLabel) {
        newURI = decodeURIComponent(newURI);
        if (!(this.getNode(newURI))) {
            var new_node = new Node(newURI, nodeLabel);
//            if (top && left) {
//                new_node.top = top;
//                new_node.left = left;
//            }
            this.nodes[newURI] = new_node;

            var item = {
                out: {
                    type: "literal",
                    value: nodeLabel
//                    "xml:lang": "en"
                },
                prop: {
                    type: "uri",
                    value: Profile.labelURIs[2]
                },
                proplabel: {
                    type: "literal",
                    value: "label"
                }
            };
            Profile.addPropertyToList(item.prop.value, item.proplabel.value);
            Profile.propertyList[item.prop.value] = item.proplabel.value;

            new_node.addLiteral(item);
            new_node.addConnection(typeUri, Profile.commonURIs.propTypeURI, "out", typeLabel);

            new_node.endpoint = {
                'shortDescription': endpointUri ? endpointUri : Profile.defaultEndpointLabel,
                'endpointURL': endpointUri ? endpointUri : Profile.defaultEndpointURI
            };

            if (thumbnailURL && thumbnailURL !== 'undefined'){
//                item = {
//                    out: {
//                        type: "literal",
//                        value: thumbnailURL
////                    "xml:lang": "en"
//                    },
//                    prop: {
//                        type: "uri",
//                        value: Profile.commonURIs.propDepictionURI
//                    },
//                    proplabel: {
//                        type: "literal",
//                        value: "depiction"
//                    }
//                };
//                new_node.addLiteral(item);
                new_node.addConnection(thumbnailURL, Profile.commonURIs.propDepictionURI, "out", "");
                new_node.storeImage(Profile.commonURIs.propDepictionURI, thumbnailURL);
                new_node.setImageURL();
            }

            new_node.collectData(false, undoActionLabel);
            new_node.vis_show(false, false);
//            new_node.vis_repaintConnections();
            return true;
        } else {
            return false;
        }
    };

    this.hideNode = function(resource_id) {
        var self = this;
        var node = this.nodes[resource_id];
        $.each(node.typeUris, function(uri, label){
             self.removeNodeType(uri);
        });
        delete this.nodes[resource_id];
        node.vis_delete();
    };

    this.getNode = function(resource_id) {
        var node = this.nodes[resource_id];
        if (node && node !== 'undefined')
            return node;
        else
            return false;
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
            scrollY: window.scrollY,
            zoomRatio: Graph.zoomRatio,
            layout: Graph.layout
        });
    };

    this.findPath = function(jsonobject, undoActionLabel) {
        if (jsonobject && jsonobject.error !== undefined) {
            Helper.alertDialog(Profile.alertTexts.findPathResult.title, Profile.alertTexts.findPathResult.text);
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
        $('#findPathPalette .findPathButton input').attr('loading', 'false');
    };

    this.searchRemote = function(jsonobject, undoActionLabel) {
        if (jsonobject && jsonobject.error !== undefined) {
            Helper.alertDialog(Profile.alertTexts.searchRemoteResult.title, Profile.alertTexts.searchRemoteResult.text);
        }
        else {
            if (jsonobject.graph.nodes !== undefined) {
                Sidemenu.vis_remove_load_progressbar($('#remoteSearchPalette'));
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
        $('#remoteSearchPalette .remoteSearchButton input').attr('loading', 'false');
    };

    this.searchConnections = function(jsonobject, undoActionLabel) {
        if (jsonobject && jsonobject.error !== undefined) {
            Helper.alertDialog(Profile.alertTexts.searchConnectionResult.title, Profile.alertTexts.searchConnectionResult.text);
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
        $('#searchConnectionPalette .searchConnectionButton input').attr('loading', 'false');
    };

    /**
     * Loads a previously 
     * @param {type} jsonobject
     * @returns {undefined}
     */
    this.load = function(jsonobject, undoActionLabel) {
        if (jsonobject.error !== undefined) {
            Helper.alertDialog(Profile.alertTexts.loadGraph.title, Profile.alertTexts.loadGraph.text);
        } else {
            Graph.clear();
            //Helper.showLoadScreen();
            if (jsonobject.graph.zoomRatio === undefined)
                Graph.zoomRatio = 1;
            else
                Graph.zoomRatio = jsonobject.graph.zoomRatio;
            if (jsonobject.graph.layout === undefined) {
                Graph.layout = Graph.LayoutEnum.NONE;
                $("input[type=radio][name=ltype]:checked").attr('checked',false);
                $("input[type=radio][name=ltype][value=None]").prop('checked',true);
            }
            else {
                Graph.layout = jsonobject.graph.layout;
                $("input[type=radio][name=ltype]:checked").attr('checked',false);
                $("input[type=radio][name=ltype][value=" + Graph.layout + "]").prop('checked',true);
            }
            if (jsonobject.graph.nodes !== undefined) {
                Graph.lastsavedgraphid = jsonobject.graph_id;
                Graph.lastsavedgraphname = jsonobject.graph_name;
                Graph.lastsavedgraphusername = jsonobject.graph_username;
                var nodeList = [];
                jsPlumbInstance.setSuspendDrawing(true);
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
                    Graph.hideNode(node.resource_id);
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

    this.insertConnection = function(sourceNodeURI, connectionURI, targetNodeURI, type){
        this.insertedConnectionsList[md5(sourceNodeURI + connectionURI + targetNodeURI)] = {
            'sourceNodeURI': sourceNodeURI,
            'connectionURI': connectionURI,
            'targetNodeURI': targetNodeURI,
            'type': type,

            "dateTime": new Date().toUTCString()
        };
        if (connectionURI === Profile.commonURIs.propTypeURI){
            this.addNodeType(targetNodeURI, Helper.getShortTypeFromURL(targetNodeURI));
        }
    };

    this.deleteConnection = function(sourceNodeURI, connectionURI, targetNodeURI, type){
        this.deletedConnectionsList[md5(sourceNodeURI + connectionURI + targetNodeURI)] = {
            'sourceNodeURI': sourceNodeURI,
            'connectionURI': connectionURI,
            'targetNodeURI': targetNodeURI,
            'type': type,

            "dateTime": new Date().toUTCString()
        };
        if (connectionURI === Profile.commonURIs.propTypeURI){
            this.removeNodeType(targetNodeURI);
        }
    };

    this.getVisibleConnection = function(sourceNodeURI, connectionURI, targetNodeURI){
        var connections = jsPlumbInstance.getAllConnections();
        var connection;
        for (var i= 0; i < connections.length; i++){
            var conn = connections[i];
            if (conn.getParameter('sourceNodeURI') === sourceNodeURI && conn.getParameter('connectionURI') === connectionURI && conn.getParameter('targetNodeURI') === targetNodeURI){
                connection = conn;
                break;
            }
        }
        return connection;
    };

    this.isAnyConnection = function(sourceNodeURI, connectionURI, targetNodeURI){
        var connection = this.getVisibleConnection(sourceNodeURI, connectionURI, targetNodeURI),
            connections;
        if (!connection){
            connections = this.insertedConnectionsList;
            for (var id in connections) {
                if (connections.hasOwnProperty(id)) {
                    var conn = connections[id];
                    if (conn['sourceNodeURI'] === sourceNodeURI && conn['connectionURI'] === connectionURI && conn['targetNodeURI'] === targetNodeURI){
                        connection = conn;
                        break;
                    }
                }
            }
        }
        if (connection){
            connections = this.deletedConnectionsList;
            for (var id in connections) {
                if (connections.hasOwnProperty(id)) {
                    var conn = connections[id];
                    if (conn['sourceNodeURI'] === sourceNodeURI && conn['connectionURI'] === connectionURI && conn['targetNodeURI'] === targetNodeURI){
                        connection = false;
                        break;
                    }
                }
            }
        }
        if (connection && connection !== 'undefined')
            return true
        else
            return false;
    }

};
