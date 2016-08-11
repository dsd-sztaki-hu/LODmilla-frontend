/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

toggleSelectNodes = function(elem){
    if ($(elem).hasClass('opened')) {
        $(elem).removeClass('opened');
        Graph.removeAllHighlights();
    }
    else {
        $(elem).addClass('opened');
        Graph.highlightAll();
    }
}

inspector_addNewConnection = function(elem, type, title){
    var btn = $(elem);
    if (!btn.hasClass('disabled')){
        btn.addClass('disabled');

        var addPropForm = $('<form type="'+type+'" title="'+title+'"><select></select><input class="addNewConnectionBtnSend" type="button" value="Add"/></form>');
//        var propList = $(elem).parent('div');
        $(elem).after(addPropForm);

        addPropForm.find('input').button();

        var select = addPropForm.find('select');
        select.empty();
        var propertyListSorted = Helper.getDictionaryListSorted(Profile.propertyList);
        for (var i = 0; i < propertyListSorted.length; i++) {
            select.append('<option value="' + propertyListSorted[i].value + '" title="'+ propertyListSorted[i].value +'">' + propertyListSorted[i].key + '</option>');
        }

//        propList.find('form input').keypress(function(e) {
//            if (e.keyCode === 13) {
//                e.preventDefault();
//                var propURI = $(this).val();
//
//                var newType = '<p class="conncollapse"><b class="conncollapsetoggle" title="'+ propURI +'">'+ propURI +' (<span class="propNum">0</span>)</b> <span class="inspectorBtn '+type+'" title="'+title+'">[add]</span></p><ul></ul>';
//                $(this).parent('form').replaceWith(newType);
//
//                btn.removeClass('disabled');
//                return false;
//            }
//        });
    }
    else{
        btn.next('form').remove();
        btn.removeClass('disabled');
    }
};

inspector_deleteProperty = function(elem){
    if (confirm("Delete property?")) {
        Graph.deleteConnection($("#nodeOpenedContent").attr("resourceUri"), $(elem).parent().attr("refprop"), $(elem).parent().attr("refpropval"), "literalConnection");

        var numElem = $(elem).parent('li').parent('ul').prev('p').find('span.propNum');
        numElem.html(parseInt(numElem.html())-1);
        $(elem).parent().remove();
    }
};

inspector_deleteConnection = function(elem){
    var sourceNodeURI = $("#nodeOpenedContent").attr("resourceUri"),
        connectionURI = $(elem).next('a').attr("refprop"),
        targetNodeURI = $(elem).next('a').attr("refpropval");

    // ha befele jovo kapcsolat, akkor a source es target felcserelodik
    if ($(elem).next('a').attr("direction") === 'in'){
        targetNodeURI = [sourceNodeURI, sourceNodeURI = targetNodeURI][0];
    }

    var connection = Graph.getVisibleConnection(sourceNodeURI, connectionURI, targetNodeURI);

    if(connection)
        connection.setHover(true);

    if (confirm("Delete connection?")) {
        if(connection)
            jsPlumbInstance.detach(connection);

        //            Graph.deleteConnection(sourceNodeURI, connectionURI, targetNodeURI, "nodeConnection" + $(elem).next('a').attr("direction"));
        Graph.deleteConnection(sourceNodeURI, connectionURI, targetNodeURI, "nodeConnection");

        var numElem = $(elem).parent('li').parent('ul').prev('p').find('span.propNum');
        numElem.html(parseInt(numElem.html())-1);
        $(elem).parent().remove();
    }
    else{
        if(connection)
            connection.setHover(false);
    }
};

addInspectorHandlers = function(){
    $("#nodeOpenedContentTabs").on('click', 'input.addNewConnectionBtnSend', function(event) {
        var propURI = $(this).parent('form').find('option').filter(":selected").val();

        var newType = '<p class="conncollapse"><b class="conncollapsetoggle" title="'+ propURI +'">'+ Helper.getShortTypeFromURL(propURI) +' (<span class="propNum">0</span>)</b> <span class="inspectorBtn '+$(this).parent('form').attr('type')+'" title="'+$(this).parent('form').attr('title')+'">[add]</span></p><ul></ul>';
        $(this).parent('form').prev('span').removeClass('disabled');
        $(this).parent('form').replaceWith(newType);

//        return false;
    });

    $("#nodeOpenedContentTabs").on('click', 'a.showableNodeUri', function(event) {
        event.preventDefault();
        var resource_id = $(this).attr("refpropval");
        if (!(Graph.getNode(resource_id))){
            var undoActionLabel = 'action_resourceBox_addNewNodeConnection';
            var aroundNode = Graph.getAroundNode();
            Graph.removeAllHighlights();
            Graph.addNode($(this).attr("refpropval"),false,false,false,true, undoActionLabel, aroundNode);
        }
        else
            $('div[uri="'+resource_id+'"]').effect( "shake" );
        return false;
    });


    $("#nodeOpenedContentTabs").on('click', 'span.addPropertyBtn', function(event) {
        var btn = $(this);
        if (!btn.hasClass('disabled')){
            btn.addClass('disabled');

            var addPropForm = '<form><input type="text"/></form>';
            var propList = $(this).parent('p').next('ul');
            propList.filter(":hidden").prev('p').find('.conncollapsetoggle').click();
            propList.prepend('<li>'+addPropForm+'</li>').find('input').focus();

            propList.find('form input').keypress(function(e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    var resourceURI = $('div#nodeOpenedContent').attr('resourceuri'),
                        propURI = $(this).parent('form').parent('li').parent('ul').prev('p').find('b').attr('title'),
                        literal = $(this).val();
                    var delBtn = '<span class="inspectorBtn deletePropertyBtn" title="Delete property">[x]</span>';

                    $(this).parent('form').parent('li').attr({
                        refprop: propURI,
                        refpropval: literal
                    }).addClass('property-value-normal');

                    var numElem = $(this).parent('form').parent('li').parent('ul').prev('p').find('span.propNum');
                    numElem.html(parseInt(numElem.html())+1);

                    var aElem = literal;
                    if (Profile.isPropertyExternalLink(propURI)){
                        aElem = '<a href="'+literal+'" target="_blank">'+literal+'</a>';
                    }
                    $(this).parent('form').replaceWith(delBtn + aElem);

                    btn.removeClass('disabled');

                    Graph.insertConnection(resourceURI, propURI, literal, "literalConnection");
                    return false;
                }
            });
        }
        else{
            btn.parent('p').next('ul').find('li')[0].remove();
            btn.removeClass('disabled');
        }
    });

    $("#nodeOpenedContentTabs").on('click', 'span.addConnectionBtn', function(event) {
        var btn = $(this);
        if (!btn.hasClass('disabled')){
            btn.addClass('disabled');

            var addPropForm = '<form><input type="text"/></form>';
            var propList = $(this).parent('p').next('ul');
            propList.filter(":hidden").prev('p').find('.conncollapsetoggle').click();
            propList.prepend('<li>'+addPropForm+'</li>').find('input').focus();

            propList.find('form input').keypress(function(e) {
                if (e.keyCode === 13) {
                    e.preventDefault();

                    var resourceURI = $('div#nodeOpenedContent').attr('resourceuri'),
                        propURI = $(this).parent('form').parent('li').parent('ul').prev('p').find('b').attr('title'),
                        targetUri = $(this).val(),
                        direction = $(this).parent('form').parent('li').parent('ul').parent('div').attr('direction');

                    var sourceNodeURI_hash = resourceURI,
                        connectionURI_hash = propURI,
                        targetNodeURI_hash = targetUri;
                    // ha befele jovo kapcsolat, akkor a source es target felcserelodik
                    if (direction === 'in'){
                        targetNodeURI_hash = [sourceNodeURI_hash, sourceNodeURI_hash = targetNodeURI_hash][0];
                    }

                    // TODO: ez csak akkor talalja meg a Connection-t, ha a Canvason is latszik..
                    var connTemp = Graph.isAnyConnection(sourceNodeURI_hash, connectionURI_hash, targetNodeURI_hash);
                    if (connTemp && connTemp !== 'undefined'){
                        var numElem = $(this).parent('form').parent('li').remove();
                        btn.removeClass('disabled');
                        alert('Connection was already added!');
                        return false;
                    }
                    else{
                        var hashedID = md5(sourceNodeURI_hash + connectionURI_hash + targetNodeURI_hash);

                        var delBtn = '<span class="inspectorBtn deleteConnectionBtn" title="Delete connection">[x]</span>';

                        var numElem = $(this).parent('form').parent('li').parent('ul').prev('p').find('span.propNum');
                        numElem.html(parseInt(numElem.html())+1);

                        var aElem = $('<a title="'+ targetUri +'"refprop="'+propURI+'" refpropval="'+targetUri+'" class="property-value-normal" rel="group" direction="'+direction+'" href="'+targetUri+'" id="'+hashedID+'"></a>');
                        if (Profile.isPropertyExternalLink(propURI)){
                            aElem.attr('target', '_blank');
                            aElem.append(targetUri);
                        }
                        else{
                            aElem.addClass('showableNodeUri');
                            aElem.append(Helper.getShortTypeFromURL(targetUri));
                        }
                        $(this).parent('form').replaceWith(delBtn + aElem[0].outerHTML);

                        btn.removeClass('disabled');

                        var sourceNode = Graph.getNode(sourceNodeURI_hash);
                        var targetNode = Graph.getNode(targetNodeURI_hash);
                        if (!Profile.isPropertyExternalLink(propURI) && sourceNode && targetNode){
                            var newConn = sourceNode.addConnection(targetNodeURI_hash, connectionURI_hash, direction, connectionURI_hash);
                            vis_jsPlumbInstance_connect_uri(sourceNodeURI_hash, targetNodeURI_hash, newConn);
                        }

                        Graph.insertConnection(sourceNodeURI_hash, connectionURI_hash, targetNodeURI_hash, "nodeConnection");
                        return false;
                    }
                }
            });
        }
        else{
            btn.parent('p').next('ul').find('li')[0].remove();
            btn.removeClass('disabled');
        }
    });



    $("#nodeOpenedContentTabs").on('click', 'span.deletePropertyBtn', function(event) {
        inspector_deleteProperty(this);
    });
    $("#nodeOpenedContentTabs").on('click', 'span.deleteConnectionBtn', function(event) {
        inspector_deleteConnection(this);
    });

    $("#nodeOpenedContentTabs").on('click', 'span.addNewPropertyBtn', function(event) {
        inspector_addNewConnection(this, 'addPropertyBtn', 'Add property');
    });
    $("#nodeOpenedContentTabs").on('click', 'span.addNewConnectionBtn', function(event) {
        inspector_addNewConnection(this, 'addConnectionBtn', 'Add connection');
    });

    $("#nodeOpenedContentTabs").on('click', '.conncollapsetoggle', function() {
        $(this).parent('.conncollapse').next("ul").slideToggle("medium");
    });

    $("#nodeOpenedContentTabs").on('click', 'span.toggleAllBtn', function(event) {
        var $this = $(this);
        if ($this.hasClass('openAllBtn'))
        {
            $this.closest('.ui-tabs-panel').children("ul").slideDown("medium");
            $this.removeClass('openAllBtn');
            $this.html('[collapse all]');
            $this.prop('title', '[collapse all]');
        }
        else
        {
            $this.closest('.ui-tabs-panel').children("ul").slideUp("medium");
            $this.addClass('openAllBtn');
            $this.html('[expand all]');
            $this.prop('title', '[expand all]');
        }
    });
};

addPaletteHandlers = function(){
    $('body').on("click", '#main #paletteBox #addResourcePalette form div.addResourceClearButton input', function(event) {
        var thisForm = $(this).parent('div').parent('form');
        thisForm.find('div.resourceLabelInput input').val('');
        thisForm.find('div.resourceUriInput input').val('');
        thisForm.find('div.resourceLabelInput input').removeClass('ui-autocomplete-loading');
        thisForm.find('div.resourceLabelInput input').focus();
    });

    $('body').on("click", '#main #paletteBox #addNewResourcePalette form div.addNewResourceAddButton input', function(event) {
        var thisForm = $(this).parent('div').parent('form');
        var nodeLabel = thisForm.find('.resourceLabelInput input').val(),
            typeSel = thisForm.find('select option:selected').html(),
            typeUri = thisForm.find('.typeUriInput input').val(),
//                endpointUri = thisForm.find('.endpointUriInput input').val(),
            endpointUri = false,
            uriPrefix = thisForm.find('.uriPrefixInput input').val(),
            thumbnailURL = thisForm.find('.thumbnailUrlInput input').val();
        if (nodeLabel && typeSel && typeUri){
            thisForm.find('div.resourceLabelInput input').val('').focus();
            if (!uriPrefix || uriPrefix === 'undefined'){
                uriPrefix = Profile.defaultResourceURIprefix;
            }
            var newURI = uriPrefix + "_" + new Date().getTime();
            var undoActionLabel = 'action_sidemenu_addNewNode';
            Sidemenu.addNewNode(uriPrefix, nodeLabel, typeSel, typeUri, endpointUri, thumbnailURL, undoActionLabel);
        }
        else{
            alert('Please enter label and type!');
        }
    });

    $('body').on("click", '#main #paletteBox #selectPalette .node-highlight-all', function(event) {
        toggleSelectNodes(this);
    });

//    $('body').on("mouseenter", '#main #paletteBox #selectPalette .node-highlight-type-label form', function(event) {
//    });


    $('body').on("click", '#main #paletteBox #searchPalette div.clearSearchButton input', function(event) {
        $('#nodeOpenedContentTabs .property-value-normal').removeClass('property-value-highlighted');
    });

    $('body').on("click", '#main #paletteBox #searchPalette div.searchInput input', function(event) {
        Sidemenu.refreshSearchDatabase();
    });

    $('body').on("click", '#main #paletteBox #remoteSearchPalette div.remoteSearchButton input', function(event) {
        if ($(this).attr('loading') !== 'true') {
            var nodesHighlighted = $('.resourceNodeBox.highlighted');
            if (nodesHighlighted.size() === 0) {
                Helper.alertDialog(Profile.alertTexts.searchRemoteSelected.title, Profile.alertTexts.searchRemoteSelected.text);
            } else if ($('#remoteSearchPalette input').val().trim() === "") {
                Helper.alertDialog(Profile.alertTexts.searchRemoteSearchText.title, Profile.alertTexts.searchRemoteSearchText.text);
            }
            else {
                $(this).attr('loading', 'true');
                Sidemenu.vis_add_load_progressbar($('#remoteSearchPalette'));
                var depth = $('#remoteSearchPalette #searchIIPathDepthSlider').slider('value');
                var nodesNum = $('#remoteSearchPalette #serachIINodeNumSlider').slider('value');
                var searchText = $('#remoteSearchPalette input').val().trim();
                var nodes = {'urls': []};
                $.each(nodesHighlighted, function(index, node) {
                    nodes['urls'].push($(node).attr('uri'));
                });
                var undoActionLabel = 'action_sidemenu_searchRemote';
                BackendCommunicator.findContent(JSON.stringify(nodes), depth, nodesNum, searchText, Graph.searchRemote, undoActionLabel);
            }
        }
        else
            Helper.alertDialog(Profile.alertTexts.searchRemoteIdle.title, Profile.alertTexts.searchRemoteIdle.text);
    });

    $('body').on("click", '#main #paletteBox #searchConnectionPalette div.searchConnectionButton input', function(event) {
        if ($(this).attr('loading') !== 'true') {
            var nodesHighlighted = $('.resourceNodeBox.highlighted');
            if (nodesHighlighted.size() === 0) {
                Helper.alertDialog(Profile.alertTexts.searchConnectionSelected.title, Profile.alertTexts.searchConnectionSelected.text);
            } else if ($('#searchConnectionPalette input').val().trim() === "") {
                Helper.alertDialog(Profile.alertTexts.searchConnectionSearchText.title, Profile.alertTexts.searchConnectionSearchText.text);
            }
            else {
                $(this).attr('loading', 'true');
                Sidemenu.vis_add_load_progressbar($('#searchConnectionPalette'));
                var depth = $('#searchConnectionPalette #searchConnectionPathDepthSlider').slider('value');
                var nodesNum = $('#searchConnectionPalette #serachConnectionNodeNumSlider').slider('value');
                var searchText = $('#searchConnectionPalette input').val().trim();
                var nodes = {'urls': []};
                $.each(nodesHighlighted, function(index, node) {
                    nodes['urls'].push($(node).attr('uri'));
                });
                var undoActionLabel = 'action_sidemenu_searchConnection';
                BackendCommunicator.findConnections(JSON.stringify(nodes), depth, nodesNum, searchText, Graph.searchConnections, undoActionLabel);
            }
        }
        else
            Helper.alertDialog(Profile.alertTexts.searchConnectionIdle.title, Profile.alertTexts.searchConnectionIdle.text);
    });

    $('body').on("click", '#main #paletteBox #findPathPalette div.findPathButton input', function(event) {
        if ($(this).attr('loading') !== 'true') {
            var nodesHighlighted = $('.resourceNodeBox.highlighted');
            if (nodesHighlighted.size() !== 2) {
                Helper.alertDialog(Profile.alertTexts.findPathNodesSelected.title, Profile.alertTexts.findPathNodesSelected.text);
            }
            else {
                $(this).attr('loading', 'true');
                Sidemenu.vis_add_load_progressbar($('#findPathPalette'));
                var depth = $('#findPathPalette #findPathDepthSlider').slider('value');
                var nodesNum = $('#findPathPalette #findPathNodeNumSlider').slider('value');
                var nodes = {'urls': []};
                $.each(nodesHighlighted, function(index, node) {
                    nodes['urls'].push($(node).attr('uri'));
                });
                var undoActionLabel = 'action_sidemenu_findPath';
                BackendCommunicator.findPath(JSON.stringify(nodes), depth, nodesNum, Graph.findPath, undoActionLabel);
            }
        }
        else
            Helper.alertDialog(Profile.alertTexts.findPathNodesIdle.title, Profile.alertTexts.findPathNodesIdle.text);
    });

    //Layout palette handlers

    //Apply layout buttton
    $('body').on("click", '#main #paletteBox #layoutPalette div.layoutApplyButton input', function() {
        var selectedType;
        var radioVal = $("input[type=radio][name=ltype]:checked").val();
        switch(radioVal)
        {
            case 'Grid':
                Helper.showLoadScreen();
                selectedType = Graph.LayoutEnum.GRID;
                break;
            case 'Radial':
                Helper.showLoadScreen();
                selectedType = Graph.LayoutEnum.RADIAL;
                break;
            case 'Spring':
                Helper.showLoadScreen();
                selectedType = Graph.LayoutEnum.SPRING;
                break;
            case 'SpringXY':
                Helper.showLoadScreen();
                selectedType = Graph.LayoutEnum.SPRINGXY;
                break;
            default :
                selectedType = Graph.LayoutEnum.NONE;
        }
        applyLayout(selectedType, true);
    });
};

addBottomMenuHandlers = function(){
    $("body").on('click', '#main .buttonWrap #loadGraphButton', function(event) {
        $('#main').append('<div id="dialog-form" title="Load a graph from the backend"><form><fieldset><label for="graphid">ID</label><input type="text" name="graphid" id="graphid" value="" class="text ui-widget-content ui-corner-all" /><p>Or</p><label for="user_name">Username</label><input type="text" name="user_name" id="user_name" class="text ui-widget-content ui-corner-all" /><label for="graph_name">Graph title</label><input type="text" name="graph_name" id="graph_name" class="text ui-widget-content ui-corner-all" /></fieldset></form><div id="dialog-confirm" title="Load the graph?"><p><span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0;"></span>The actual content of the graph will be lost. Are you sure?</p></div></div>');

        var allFields = $([]).add($('#user_name')).add($('#graphid')).add($('#graph_name'));

        $("#graphid").keyup(function() {
            if ($("#graphid").val().length === 0) {
                $("#user_name").removeAttr('disabled');
                $("[for=user_name]").fadeTo(100, 1);
                $("#user_name").fadeTo(100, 1);
                $("#graph_name").removeAttr('disabled');
                $("[for=graph_name]").fadeTo(100, 1);
                $("#graph_name").fadeTo(100, 1);
            } else {
                $("#user_name").attr('disabled', '');
                $("[for=user_name]").fadeTo(100, 0.5);
                $("#user_name").fadeTo(100, 0.5);
                $("#graph_name").attr('disabled', '');
                $("[for=graph_name]").fadeTo(100, 0.5);
                $("#graph_name").fadeTo(100, 0.5);
            }
        });

        $("#graph_name").autocomplete({
            source: BackendCommunicator.graphNameAutocomplete,
            //appendTo: "#graph_name",
            minLength: 0,
            open: function() {
//                    console.log("open");
            },
            close: function() {
//                    console.log("close");
            }
        }).focus(function() {
                $(this).autocomplete("search", "");
            });

        $("#dialog-form").dialog({
            autoOpen: true,
            height: 350,
            width: 350,
            modal: true,
            draggable: false,
            buttons: {
                "Load": function() {
                    var bValid = true;
                    allFields.removeClass("ui-state-error");
                    if ($("#user_name").val().length === 0 && $("#graph_name").val().length !== 0 && $("#graphid").val().length === 0) {
                        bValid = false;
                        $("#user_name").addClass("ui-state-error");
                    }
                    else if ($("#graph_name").val().length === 0 && $("#user_name").val().length !== 0 && $("#graphid").val().length === 0) {
                        bValid = false;
                        $("#graph_name").addClass("ui-state-error");
                    }
                    else if ($("#graphid").val().length === 0 && $("#user_name").val().length === 0 && $("#graph_name").val().length === 0) {
                        bValid = false;
                        $("#graphid").addClass("ui-state-error");
                        $("#user_name").addClass("ui-state-error");
                        $("#graph_name").addClass("ui-state-error");
                    }
                    if (bValid) {
                        Profile.zoomRatio = 1;
                        var undoActionLabel = 'action_bottomMenu_loadGraph';
                        BackendCommunicator.load($("#graphid").val(), $("#user_name").val(), $("#graph_name").val(), Graph.load, undoActionLabel);
                        $(this).dialog("close");
                    }
                },
                Cancel: {
                    text: "Cancel",
                    id: "loadgraphclosebtn",
                    click: function() {
                        $(this).dialog("close");
                    }
                }
            },
            close: function() {
                $(this).remove();
            }
        });
    });

    $("body").on('click', '#main .buttonWrap #saveGraphButton', function(event) {
        var lastsavedhandler = "";
        if (Graph.lastsavedgraphid !== null) {
            var locationport = (location.port === "") ? "" : ":" + location.port;
            lastsavedhandler = '<fieldset><h3>Share</h3><label for="lastsavedlink">Link to the last saved/loaded version: </label><a href="' + location.protocol + '//' + location.hostname + locationport + location.pathname + '?id=' + Graph.lastsavedgraphid + '" target="_blank">' + Graph.lastsavedgraphname + '</a><p>If you have updated the graph, you have to save it first (below)!</p></fieldset>';
        } else {
            lastsavedhandler = '<fieldset><h3>Share</h3><p>Before sharing the graph you have to save it first (below)!</p></fieldset>';
        }
        $('#main').append('<div id="dialog-form" title="Save/Share the graph"><form>' + lastsavedhandler + '<fieldset><h3>Save</h3><label for="user_name">Your name</label><input type="text" name="user_name" id="user_name" class="text ui-widget-content ui-corner-all" value="' + Graph.lastsavedgraphusername + '" /><label for="graph_name">Graph title</label><input type="text" name="graph_name" id="graph_name" class="text ui-widget-content ui-corner-all" value="' + Graph.lastsavedgraphname + '" /></fieldset></form></div>');

        allFields = $([]).add($('#user_name')).add($('#graph_name'));

        $("#dialog-form").dialog({
            autoOpen: true,
            height: (Graph.lastsavedgraphid === null) ? 400 : 450,
            width: 400,
            modal: true,
            buttons: {
                "Save": function() {
                    var bValid = true;
                    allFields.removeClass("ui-state-error");
                    if ($("#user_name").val().length === 0) {
                        bValid = false;
                        $("#user_name").addClass("ui-state-error");
                    }
                    if ($("#graph_name").val().length === 0) {
                        bValid = false;
                        $("#graph_name").addClass("ui-state-error");
                    }
                    if (bValid) {
//                            console.log(Graph.serialize_0());
                        BackendCommunicator.save($("#user_name").val(), $("#graph_name").val(), Graph.serialize_0(), Sidemenu.graphSaveFinished);
                        $(this).dialog("close");
                    }
                },
                Cancel: function() {
                    $(this).dialog("close");
                }
            },
            close: function() {
                $(this).remove();
            }
        });
    });

    $("body").on('click', '#main .buttonWrap #myEditsButton', function(event) {
        $('#main').append('<div id="dialog-myedits"></div>');
        $(" #main #dialog-myedits").dialog({
            autoOpen: true,
            title: "My edits - in SPARQL Update format for copy/paste",
            height: 300,
            width: 1000,
            modal: true,
            position: {
                my: "center", at: "center", of: window
            },
            buttons: {
                "Close": function() {
                    $(this).dialog("close");
                }
            },
            open: function() {
                $('#dialog-myedits').append("INSERT DATA {<br>");
                for (var id in Graph.insertedConnectionsList) {
                    if (Graph.insertedConnectionsList.hasOwnProperty(id)) {
                        var item = Graph.insertedConnectionsList[id];
                        if (item.type === "nodeConnection")
                            $('#dialog-myedits').append("&lt;"+item.sourceNodeURI+"&gt; &lt;"+item.connectionURI+"&gt; &lt;"+item.targetNodeURI+"&gt; ."+"<br>");
                        else if (item.type === "literalConnection")
                            $('#dialog-myedits').append("&lt;"+item.sourceNodeURI+"&gt; &lt;"+item.connectionURI+'&gt; "'+item.targetNodeURI+'" .'+"<br>");
                    }
                }
                $('#dialog-myedits').append("}<br><br>");
                $('#dialog-myedits').append("DELETE DATA {<br>");
                for (var id in Graph.deletedConnectionsList) {
                    if (Graph.deletedConnectionsList.hasOwnProperty(id)) {
                        var item = Graph.deletedConnectionsList[id];
                        if (item.type === "nodeConnection")
                            $('#dialog-myedits').append("&lt;"+item.sourceNodeURI+"&gt; &lt;"+item.connectionURI+"&gt; &lt;"+item.targetNodeURI+"&gt; ."+"<br>");
                        else if (item.type === "literalConnection")
                            $('#dialog-myedits').append("&lt;"+item.sourceNodeURI+"&gt; &lt;"+item.connectionURI+'&gt; "'+item.targetNodeURI+'" .'+"<br>");
                    }
                }
                $('#dialog-myedits').append("}");
            },
            close: function() {
                $(this).remove();
            }
        });
    });

    $("body").on('click', '#main .buttonWrap #selectToggleButton', function(event) {
        toggleSelectNodes(this);
    });

    $("body").on('click', '#main .buttonWrap #clearGraphButton', function(event) {
        var nodeList = [];
        var highlighted;
        $.each($('div.resourceNodeBox'), function() {
            if ($(this).hasClass('highlighted'))
                highlighted = true;
            else
                highlighted = false;
            var top = Graph.getNode(this.getAttribute('uri')).top;
            var left = Graph.getNode(this.getAttribute('uri')).left;
            nodeList.push({resource_id: this.getAttribute('uri'), action: 'removed', highlighted: highlighted, top: top, left: left});
        });
        Graph.clear();
        var undoActionLabel = 'action_bottomMenu_clearGraph';
        Graph.logUndoAction(undoActionLabel, nodeList);
    });

    $("body").on('click', '#main .buttonWrap #deleteSelectedButton', function(event) {
        var nodeList = [];
        $.each($('div.resourceNodeBox.highlighted'), function() {
            var top = Graph.getNode(this.getAttribute('uri')).top;
            var left = Graph.getNode(this.getAttribute('uri')).left;
            nodeList.push({resource_id: this.getAttribute('uri'), action: 'removed', highlighted: true, top: top, left: left});
            Graph.hideNode(this.getAttribute('uri'));
        });
        var undoActionLabel = 'action_bottomMenu_deleteSelected';
        Graph.logUndoAction(undoActionLabel, nodeList);
    });

    $("body").on('click', '#main .buttonWrap #undoButton', function(event) {
        Graph.undo();
    });

    $("body").on('click', '#main .buttonWrap #exportButton', function(event) {
//        var $canvas = Graph.canvas[0];
//        var img = $canvas.toDataURL("image/png");

//        $("#graph").html('<img src="'+img+'"/>');
        exportToDot();
        console.log('exported');
    });
};

addNodeHandlers = function(){
    $("body").on('click', '#main #graph .resourceNodeBox', function(event) {
        if (event.ctrlKey || event.altKey) {
            var resource_id = this.getAttribute('uri');
            var act = $(this);
            if (Graph.getNode(resource_id).type !== Profile.unloadedNodeType) {
                if (act.find('.node-highlight').hasClass('opened'))
                    Graph.removeHighlight(act);
                else
                    Graph.highlight(act, 2);
            }
        }
    });

    $("body").on('click', '#main #graph .resourceNodeBox .node-highlight', function(event) {
        if (event.ctrlKey || event.altKey) return;
            var resource_id = this.parentNode.getAttribute('uri');
        if (Graph.getNode(resource_id).type !== Profile.unloadedNodeType){
            if ($(this).hasClass('opened'))
                Graph.removeHighlight($(this).parent());
            else
                Graph.highlight($(this).parent(), 2);
        }
    });

    $("body").on('click', '#main #graph .resourceNodeBox .node-hide', function(event) {
        if (event.ctrlKey || event.altKey) return;
        var resource_id = this.parentNode.getAttribute('uri');
        if (Graph.getNode(resource_id).type !== Profile.unloadedNodeType){
            var node = $('div.resourceNodeBox[uri="' + resource_id + '"]');
            var highlighted;
            if (node.hasClass('highlighted'))
                highlighted = true;
            else
                highlighted = false;

            var undoActionLabel = 'action_node_deleteNode',
                top = Graph.getNode(resource_id).top,
                left = Graph.getNode(resource_id).left;

            Graph.hideNode(resource_id);

            var nodeList = [{resource_id:resource_id, action:'removed',highlighted:highlighted,top:top,left:left}];
            Graph.logUndoAction(undoActionLabel, nodeList);
    //        else{
    //            node.removeClass("highlighted");
    //        }
        }

    });

    $("body").on('click', '#main #graph .resourceNodeBox .node-delete', function(event) {
        if (event.ctrlKey || event.altKey) return;
        var resource_id = this.parentNode.getAttribute('uri');
        if (Graph.getNode(resource_id).type !== Profile.unloadedNodeType){
            var node_id = this.parentNode.getAttribute('id');
            var connectionsInOut = jsPlumbInstance.getConnections({'target': node_id}).concat(jsPlumbInstance.getConnections({'source': node_id}));
            for (var i=0; i<connectionsInOut.length; i++){
                var conn = connectionsInOut[i];
                conn.setHover(true);
            }
            if (confirm("Delete all connections for this node?")){
                for (var i=0; i<connectionsInOut.length; i++){
                    var conn = connectionsInOut[i];

                    var hash = md5(conn.getParameter('sourceNodeURI') + conn.getParameter('connectionURI') + conn.getParameter('targetNodeURI'));
                    $("#"+hash).parent().remove();

                    Graph.deleteConnection(conn.getParameter('sourceNodeURI'), conn.getParameter('connectionURI'), conn.getParameter('targetNodeURI'), "nodeConnection");
                    jsPlumbInstance.detach(conn);
                }
            }
            else{
                for (var i=0; i<connectionsInOut.length; i++){
                    var conn = connectionsInOut[i];
                    conn.setHover(false);
                }
            }
        }
    });

    $("body").on('click', '#main #graph .resourceNodeBox .node-open', function(event) {
        if (event.ctrlKey || event.altKey) return;
        var resource_id = this.parentNode.getAttribute('uri');
        if (Graph.getNode(resource_id).type !== Profile.unloadedNodeType){
            var node = Graph.getNode(this.parentNode.getAttribute('uri'));
            if($(this).parent().hasClass('opened')){
    //            $(this).find('img').attr('src', "img/document-properties-deactivated.png");
                node.vis_closeNode();
            }
            else{
                $(this).find('img').attr('src', "img/document-properties.png");
                if ($(event.target).hasClass('resourceDetailsIcon')){
                    setInspector("literals", false, false);
                    node.vis_openNode();
                }
                else if ($(event.target).hasClass('resourcePropertiesNum')){
                    setInspector("literals", false, false);
                    node.vis_openNode();
                }
                else if ($(event.target).hasClass('resourceLinksNum')){
                    setInspector("out", false, false);
                    node.vis_openNode();
                }
                else{
                    node.vis_openNode();
                }
            }
        }
    });
};

addCanvasHandlers = function(){
    // event on clicking on a connection
    jsPlumbInstance.bind("click", function(conn, originalEvent) {
        conn.setHover(true);
        if (confirm("Delete connection?")) {
            var hash = md5(conn.getParameter('sourceNodeURI') + conn.getParameter('connectionURI') + conn.getParameter('targetNodeURI'));
            $("#"+hash).parent().remove();

            Graph.deleteConnection(conn.getParameter('sourceNodeURI'), conn.getParameter('connectionURI'), conn.getParameter('targetNodeURI'), "nodeConnection");
            jsPlumbInstance.detach(conn);
        }
        else{
            conn.setHover(false);
        }
    });

    // event on double clicking on a connection
    //        jsPlumbInstance.bind("dblclick", function(component, originalEvent) {
    //            console.log(component);
    //        });

    // event on creating a new connection
    jsPlumbInstance.bind("connection", function(component, originalEvent) {
        // csak ha ujonnan hozzaadott Connectionrol van szo (drag & drop)
        if (originalEvent && originalEvent !== 'undefined'){
            var sourceNodeURI = $('#graph #' + component.sourceId).attr('uri'),
                targetNodeURI = $('#graph #' + component.targetId).attr('uri'),
                originalSourceNodeURI = component.connection.getParameter('originalSourceNodeURI'),
                originalTargetNodeURI = component.connection.getParameter('originalTargetNodeURI'),
                connectionURI;

            // ha NEM egy masik nodebol athuzott, mar meglevo connectionrol van szo ("connectionMoved" eventben paramok beallitva), hanem ujonnan dNd-olt connectionrol
            if ((!originalSourceNodeURI || originalSourceNodeURI === 'undefined') && (!originalTargetNodeURI || originalTargetNodeURI === 'undefined')){
                connectionURI =  Profile.defaultConnectionURI;

                var select = $("#addNewConnectionDialogForm").find('form select');
                select.empty();
                var propertyListSorted = Helper.getDictionaryListSorted(Profile.propertyList);
                for (var i = 0; i < propertyListSorted.length; i++) {
                    select.append('<option value="' + propertyListSorted[i].value + '" title="'+ propertyListSorted[i].value +'">' + propertyListSorted[i].key + '</option>');
                }

                $("#addNewConnectionDialogForm").dialog("open").attr({
                    sourceNodeURI: sourceNodeURI,
                    connectionURI: connectionURI,
                    targetNodeURI: targetNodeURI
                });
                component.connection.setParameter('sourceNodeURI', sourceNodeURI);
                component.connection.setParameter('connectionURI', connectionURI);
                component.connection.setParameter('targetNodeURI', targetNodeURI);
            }
            // ha egy masik nodebol athuzott, mar meglevo connectionrol van szo
            else{
                connectionURI =  component.connection.getParameter('connectionURI');

                Graph.deleteConnection(originalSourceNodeURI, connectionURI, originalTargetNodeURI, "nodeConnection");
                if ((originalSourceNodeURI === sourceNodeURI) && (originalTargetNodeURI !== targetNodeURI)){
                    Graph.insertConnection(originalSourceNodeURI, connectionURI, targetNodeURI, "nodeConnection");
                }
                else if((originalSourceNodeURI !== sourceNodeURI) && (originalTargetNodeURI === targetNodeURI)){
                    Graph.insertConnection(sourceNodeURI, connectionURI, originalTargetNodeURI, "nodeConnection");
                }

            }
        }
    });

    // event dragging a connection from a node to an other node
    jsPlumbInstance.bind("connectionMoved", function(component, originalEvent) {
        var originalSourceNodeURI = $('#graph #' + component.originalSourceId).attr('uri'),
            originalTargetNodeURI =  $('#graph #' + component.originalTargetId).attr('uri');
//            newSourceNodeURI = $('#graph #' + component.newSourceId).attr('uri'),
//            newTargetNodeURI = $('#graph #' + component.newTargetId).attr('uri');
        component.connection.setParameter('originalSourceNodeURI', originalSourceNodeURI);
        component.connection.setParameter('originalTargetNodeURI', originalTargetNodeURI);
//        return false;
    });



    // event submitting the new connection dragndrop window
    $("#addNewConnectionDialogForm").bind('submit', function(e) {
        e.preventDefault();
        var newURI = $(this).find('form select option').filter(":selected").val();

        var sourceNodeURI = $(this).attr('sourceNodeURI'),
            connectionURI =  $(this).attr('connectionURI'),
            targetNodeURI = $(this).attr('targetNodeURI');
        var conn = Graph.getVisibleConnection(sourceNodeURI, connectionURI, targetNodeURI);

        // ha lett beirva uj URI az uj connectionnak
        if (newURI && newURI !== 'undefined'){
            var connTemp = Graph.isAnyConnection(sourceNodeURI, newURI, targetNodeURI);
            if (connTemp && connTemp !== 'undefined'){
                jsPlumbInstance.detach(conn);
                alert('Connection was already added!');
            }
            else{
                connectionURI = newURI;
                conn.setParameter('connectionURI', connectionURI);
                conn.setParameter('connectionLabel', Helper.getShortTypeFromURL(connectionURI));

                $.each(conn.getOverlays(), function(overlay_id, overlay) {
                    if (overlay.type === 'Label') {
                        overlay.setLabel(Helper.getShortTypeFromURL(connectionURI));
//                        overlay.setParameter('connectionURI', connectionURI);
                        return false;
                    }
                });

                Graph.insertConnection(sourceNodeURI, connectionURI, targetNodeURI, "nodeConnection");
            }
        }
        else{
            jsPlumbInstance.detach(conn);
            alert('Connection URI was not provided!');
        }

        $(this).dialog("close");
    });

    //    event fired before drag n drop new connection establishes
//    jsPlumbInstance.bind("beforeDrop", function(component, originalEvent) {
//    });



    $("#addNewConnectionDialogForm").dialog({
        autoOpen: false,
        height: 100,
        width: 350,
        modal: true,
        draggable: true,
        // event on closing the new connection dragndrop window
        close: function(e, ui){
            var sourceNodeURI = $(this).attr('sourceNodeURI'),
                connectionURI =  $(this).attr('connectionURI'),
                targetNodeURI = $(this).attr('targetNodeURI');
            var conn = Graph.getVisibleConnection(sourceNodeURI, connectionURI, targetNodeURI);

            if (conn && conn.getParameter('connectionURI') === Profile.defaultConnectionURI){
                jsPlumbInstance.detach(conn);
            }
        }
    });
    $('#addNewConnectionDialogForm form input[type="submit"]').button();


    $("#credits").dialog({
        autoOpen: false,
        height: 250,
        width: 350,
        modal: true,
        draggable: false
    });

    $("#creditsopen").on("click", function(event) {
        event.preventDefault();
        $("#credits").dialog("open");
    });

};