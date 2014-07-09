/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

$(document).ready(function() {
    jsPlumb.ready(function() {

        jsPlumbInstance = jsPlumb.getInstance({
            Container:"graph",
            Connector: [ "Straight", { stub: 10, gap: 15 } ],
            ConnectionsDetachable: true,
            EndpointHoverStyle: { fillStyle: "#f00"},

            hoverPaintStyle: { fillStyle: "#f00"},
            ReattachConnections : true,
            DragOptions: { cursor: "crosshair" },
            DropOptions: {},
            Scope : "jsPlumb_DefaultScope",
            ConnectionOverlays : [
                [ "Label", {
                    label: Profile.defaultConnectionURI,
                    cssClass: "connectionBox label opacityItem",
                    location: 0.5
                }],
                ["PlainArrow", {
                    location: 0.8,
                    width: 14,
                    length: 20,
                    direction: 1
//            foldback:0.2
//            id:"myArrow"
                }]
            ],

//            Anchor: [ 'Top',  'Right', 'Bottom', 'Left'], // faster, but a bit different
            Anchor: "Continuous"
        });

        jsPlumbInstance.registerConnectionTypes({
            "basicConnection": {
                paintStyle: {
                    strokeStyle: Profile.defaultConnectionsColor, lineWidth: 2
//                    outlineColor:"blue", outlineWidth:1
                },
                hoverPaintStyle: {strokeStyle: Profile.highlightedConnectionsColor, lineWidth: 3},
                ConnectorZIndex: 100
            },
            "selectedConnection":{
                paintStyle: {strokeStyle: Profile.defaultConnectionsColor, lineWidth: 4},
                hoverPaintStyle: {strokeStyle: Profile.highlightedConnectionsColor, lineWidth: 5},
                ConnectorZIndex: 101
            }
        });
        jsPlumbInstance.registerEndpointTypes({
            "basicEndpoint":{
                paintStyle:{fillStyle: Profile.highlightedConnectionsColor}
            },
            "selectedEndpoint":{
                paintStyle:{fillStyle:Profile.highlightedConnectionsColor}
            }
        });

        Graph.init($('#main'));
        Sidemenu.init(Graph.canvas.parent());
        Profile.init();

        addCanvasHandlers();
        addPaletteHandlers();
        addBottomMenuHandlers();
        addNodeHandlers();


        $("#footerWrapper").position({my: "right bottom", at: "right-50 bottom-8", of: window});
        $(window).resize(function() {
            $("#footerWrapper").position({my: "right bottom", at: "right-50 bottom-8", of: window});
        });


        if (Profile.QueryString.id !== undefined) {
            var undoActionLabel = 'action_httpParam_loadGraph';
            BackendCommunicator.load(Profile.QueryString.id, null, null, Graph.load, undoActionLabel);
        }
        if (Profile.QueryString.url !== undefined) {
            // var resource_id = decodeURIComponent(Profile.QueryString.url);
            var resource_id = Profile.QueryString.url;
            Graph.addNode(resource_id,false,false,false,false,false);
            var undoActionLabel = 'action_httpParam_loadUri';
            var nodeList = [{resource_id:resource_id, action:'added',highlighted:false}];
            Graph.logUndoAction(undoActionLabel, nodeList);
        }

        $(".fancybox").fancybox({
            'type':'image'
        });

    });
});


