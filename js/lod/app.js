/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth - MTA SZTAKI DSD
 *
 */
 
$(document).ready(function() {    
    Graph.init($('#main'));
    Sidemenu.init(Graph.canvas.parent());
    Profile.init();

    $("#footerWrapper").position({my: "right bottom", at: "right-50 bottom-8", of: window});
    $(window).resize(function() {
        $("#footerWrapper").position({my: "right bottom", at: "right-50 bottom-8", of: window});
    });

    $("#credits").dialog({
        autoOpen: false,
        height: 250,
        width: 350,
        modal: true,
        draggable: false
    });

    $("#creditsopen").click(function(event) {
        event.preventDefault();
        $("#credits").dialog("open");
    });

    if (Profile.QueryString.id !== undefined) {
        var undoActionLabel = 'action_httpParam_loadGraph';
        BackendCommunicator.load(Profile.QueryString.id, null, null, Graph.load, undoActionLabel);
    }
    if (Profile.QueryString.url !== undefined) {
        var resource_id = decodeURIComponent(Profile.QueryString.url);
        Graph.addNode(resource_id,false,false,false,false,false);
        var undoActionLabel = 'action_httpParam_loadUri';
        var nodeList = [{resource_id:resource_id, action:'added',highlighted:false}];
        Graph.logUndoAction(undoActionLabel, nodeList);        
    }
    
    $(".fancybox").fancybox({
        'type':'image'
    });

});


