/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

// TODO: attenni a nem ide illo fv-eket, nem jsPlumb related..plusz kodot rendezni refactor

vis_get_visibleCanvasRandomPosition = function(aroundNode){
    var top, left;
    if (!aroundNode){
        top = ($(document).scrollTop()) + (Math.floor(Math.random() * ($(window).height() - Profile.buttonsHeight - Profile.nodeHeight)));
        left = ($(document).scrollLeft()) + (Math.floor(Math.random() * ($(window).width() - Profile.sidemenuWidth - Profile.panelWidth - Profile.nodeWidth))) + Profile.sidemenuWidth;    
    }
    else{      
        var nodePosRelTop = aroundNode.vis_getCanvasRelativePosition(false)['top'];
        var nodePosRelBottom = $(window).height()-Profile.nodeHeight-nodePosRelTop;
        var nodePosRelLeft = aroundNode.vis_getCanvasRelativePosition(false)['left']-Profile.sidemenuWidth;
        var nodePosRelRight = $(window).width()-Profile.nodeWidth-nodePosRelLeft - Profile.panelWidth-Profile.nodeWidth;
        var rTop;
        var rLeft;

        // close to the top
        if ((nodePosRelTop < Profile.maxRadiusAroundNode) && (nodePosRelTop < nodePosRelBottom))            
            rTop = Profile.maxRadiusAroundNode - nodePosRelTop;
        // close to the bottom
        else if ((nodePosRelBottom < Profile.maxRadiusAroundNode) && (nodePosRelBottom < nodePosRelTop))
            rTop = nodePosRelBottom - Profile.maxRadiusAroundNode;
        else
            rTop = 0;
        // close to the left
        if ((nodePosRelLeft < Profile.maxRadiusAroundNode) && (nodePosRelLeft < nodePosRelRight))
            rLeft = Profile.maxRadiusAroundNode - nodePosRelLeft;
        // close to the right
        else if ((nodePosRelRight < Profile.maxRadiusAroundNode) && (nodePosRelRight < nodePosRelLeft))
            rLeft = nodePosRelRight - Profile.maxRadiusAroundNode;
        else
            rLeft = 0;                
        
        top = ($(document).scrollTop()) + (Math.floor(Math.random() * (Profile.maxRadiusAroundNode*2))) + nodePosRelTop + rTop - Profile.maxRadiusAroundNode;
        left = ($(document).scrollLeft()) + (Math.floor(Math.random() * (Profile.maxRadiusAroundNode*2))) + nodePosRelLeft + rLeft + Profile.sidemenuWidth - Profile.maxRadiusAroundNode;
    }
    return {'top':top, 'left':left};
};

Node.prototype.vis_getCanvasRelativePosition = function(nodeCenter) {
    var self = this;    
    if (nodeCenter){
        return {'top': self.top-($(document).scrollTop()) + Math.floor(Profile.nodeHeight/2),
                'left': self.left-($(document).scrollLeft() + Math.floor(Profile.nodeWidth/2))
        };
    }
    else{
        return {'top': self.top-($(document).scrollTop()),
                'left': self.left-($(document).scrollLeft())
        };
    }
};

Graph.vis_getDistance = function(node1, node2){
    var dist2 = Math.pow((node1.vis_getCanvasRelativePosition(true)['top'] - node2.vis_getCanvasRelativePosition(true)['top']),2) + Math.pow((node1.vis_getCanvasRelativePosition(true)['left'] - node2.vis_getCanvasRelativePosition(true)['left']),2);
    return Math.floor(Math.sqrt(dist2));
};

Node.prototype.vis_show = function(highlight, aroundNode) {
    var self = this;

    // connections num in the Node
    var litLen = self.getLiteralsNum();
    var connLen = self.connections.length;

    if (this.loaded) {
        self.setImageURL();
    }
    var nodeHighlightBtn = $('<div class="node-button node-highlight" title="Highlight node"></div>'),
        nodeHideBtn = '<div class="node-button node-hide" title="Hide node"></div>',
        nodeDeleteBtn = '<div class="node-button node-delete" title="Delete all connections of node"></div>',
        nodeConnectionSource = '<div title="Drag to make new connection" class="node-connection-source id="'+ this.resource_id +'"></div>',
//        nodeConnectionSource = '<div class="node-connection-source"></div>',
        nodeOpenBtn = '<div class="node-button node-open"><span class="resourcePropertiesNum" title="Properties - show details">'+litLen+'</span><img class="resourceDetailsIcon" src="img/document-properties-deactivated.png" title="Show details" /><span class="resourceLinksNum" title="Links - show details">'+connLen+'</span></div>',
    
        existing = $("div.resourceNodeBox[uri='" + this.resource_id + "']"),
        nodeLabel = this.label,
        nodeLabelShort = Helper.truncateString(nodeLabel, Profile.nodeLabelMaxLength),
    
        toHighlight = false,

        resourceLabel = $('<div class="resourceLabel">' + nodeLabelShort + '</div>');

    if (!(nodeLabel.length === nodeLabelShort.length)){
        resourceLabel.attr('title', nodeLabel);
    }

    if (existing.length === 0) {
        var node = $('<div class="resourceNodeBox opacityItem" uri="' + this.resource_id + '"></div>');
        if (highlight){
            nodeHighlightBtn.addClass('opened');
        }

        node.append(nodeHighlightBtn);
        node.append(resourceLabel.prop('outerHTML') + nodeHideBtn + nodeDeleteBtn  + nodeOpenBtn + nodeConnectionSource);

        Graph.canvas.append(node);
        
        if (self.loaded === false) {
            self.vis_add_load_progressbar();
        }

        jsPlumbInstance.draggable(node);
    } else {
        if (existing.find('.node-highlight').hasClass('opened')){
            toHighlight = true;
        }
        existing.empty();

        existing.append(nodeHighlightBtn);
        existing.append(resourceLabel.prop('outerHTML') + nodeHideBtn + nodeDeleteBtn  + nodeOpenBtn + nodeConnectionSource);

        jsPlumbInstance.makeSource(existing, {
            filter:".node-connection-source",
            deleteEndpointsOnDetach:true,
            isSource:true,
            connector: Profile.connectorType,
            overlays:  [ ],
            endpoint:[ Profile.endpointForm, {
//            cssClass:"myEndpoint",
                width: Profile.endPointWidth,
                height: Profile.endPointHeight
            }],
            connectorStyle:{ strokeStyle: Profile.connectorStrokeStyle, lineWidth: Profile.connectorLineWidth,
                outlineColor:"transparent", outlineWidth: Profile.connectorOutlineWidth}
//            maxConnections:5
        });
        jsPlumbInstance.makeTarget(existing, {
            deleteEndpointsOnDetach:true,
            isTarget:true,
            connector: Profile.connectorType,
            overlays:  [ ],
            endpoint:[ Profile.endpointForm, {
//            cssClass:"myEndpoint",
                width: Profile.endPointWidth,
                height: Profile.endPointHeight
            }]
//            maxConnections:5
        });

        jsPlumbInstance.draggable(existing);
    }


    if (this.top === null && this.left === null) {       
        var thisNode = this;
        
        var counter = 0;        
        var found = true;
        var maxDistance = {'dist':0, 'top':0, 'left':0};
        do {
            counter +=1;
            found = true;
//TODO layout increment
            thisNode.top = vis_get_visibleCanvasRandomPosition(aroundNode)['top'];
            thisNode.left = vis_get_visibleCanvasRandomPosition(aroundNode)['left'];
            
            $.each(Graph.nodes, function(index, oldNode) {  
                if (oldNode.resource_id !== thisNode.resource_id){
                    var thisDist = Graph.vis_getDistance(thisNode, oldNode);
                    if (Profile.minNodeDistance > thisDist){
                        found = false;                        
                        if (thisDist > maxDistance['dist']){
                            maxDistance['dist'] = thisDist;
                            maxDistance['top'] = thisNode.top;
                            maxDistance['left'] = thisNode.left;                            
                        }
                    }
                }
            });
        } while (counter <= Profile.maxNodePlaceIter && !found);
        // TODO: store failed distances in Arrays above, choose the Max of the Min's of the Arrays here (he-he)
        if (!found){
            thisNode.top = maxDistance['top'];
            thisNode.left = maxDistance['left'];            
        }
            
    }

    var graphitem = $("[uri='" + this.resource_id + "']");
    graphitem.zIndex(100);
    graphitem.css({top: this.top, left: this.left});
    graphitem[0].onmouseup = function(event) {
        var position = $(this).position();
        node = Graph.getNode(this.getAttribute('uri'));
        node.top = position.top;
        node.left = position.left;
    };

    var selfDiv = $('div.resourceNodeBox[uri="' + self.resource_id + '"]');

    if (self.type !== ""){
        selfDiv.removeClass("nodetype_" + Profile.unloadedNodeType).addClass("nodetype_" + self.type);
        selfDiv.attr('nodetype', self.type.toLowerCase());
    }

    // default image for placeholder
    var nodeImageDiv = $('<div class="nodeImage"></div>');
//    var imgBox = $('<span>' + Helper.getImgSrc(Profile.nodeTypesDefaultImages.thingEmpty)+ '</span>');
    var imgBox = $('<div>' +Helper.getImgSrc(Profile.nodeTypesDefaultImages.thingEmpty) + '</div>');
    nodeImageDiv.append(imgBox);
    selfDiv.append(nodeImageDiv);

    if (this.loaded) {
        // Node image comes from SZTAKI LOD (default endpoint URL)
        if (self.endpoint.endpointURL === Profile.defaultEndpointURI) {
            if (self.type === 'person' || self.type === 'work') {
                $(Helper.getImgSrc(self.nodeImageURL)).on({
                    error: function (e){
                        self.vis_showImageDefaultImage(nodeImageDiv, imgBox);
                    },
                    load: function(e){
                        self.vis_showImageDefaultEndpoint(imgBox);
                    }
                });
            }
        }
        else{
            if (self.nodeImageURL) {
                $(Helper.getImgSrc(self.nodeImageURL)).on({
                    error: function (e){
                        self.vis_showImageDefaultImage(nodeImageDiv, imgBox);
                    },
                    load: function(e){
                        self.vis_showImageOwnImage(nodeImageDiv, imgBox);
                    }
                });
            }
            else{
                self.vis_showImageDefaultImage(nodeImageDiv, imgBox);
            }
        }

        var endpointURL = '';
        var endpointShortDescription = '';

        // Node comes from a known LOD
        if (self.endpoint.shortDescription && self.endpoint.endpointURL) {
            endpointShortDescription = Helper.truncateString(self.endpoint.shortDescription, Profile.nodeLabelMaxLength);
            endpointURL = self.endpoint.endpointURL;
        }
        // Node comes from a not known external LOD (not present in the Profile)
        // does not have an image
        else {
            endpointShortDescription = Helper.truncateString(Helper.getLodServerBaseUrl(self.resource_id), Profile.nodeEndpointLabelMaxLength);
            endpointURL = Helper.getLodServerBaseUrl(self.resource_id);
        }


//        selfDiv.append('<div class="sumConnections">' + litLen + '&nbsp;|&nbsp;' + connLen + '</div>');
        
    }
    // if still not loaded
    else {
        endpointShortDescription = Helper.truncateString(Helper.getLodServerBaseUrl(self.resource_id), Profile.nodeLabelMaxLength);
        endpointURL = Helper.getLodServerBaseUrl(self.resource_id);
        
        imgBox = $('<a class="fancybox" href="' + Profile.nodeTypesDefaultImages.noEndpoint + '"></a>');
        imgBox.append(Helper.getImgSrc(Profile.nodeTypesDefaultImages.noEndpoint));
        nodeImageDiv.empty().append(imgBox);
    }

    var endpointLink = $('<div class="endpointLink"></div>');
    // ha rendes endpointbol nyitott node
    if (self.endpoint.shortDescription !== Profile.defaultEndpointLabel ){
        endpointLink.attr('title', endpointURL);
        endpointLink.append('<a target="_blank" href="' + endpointURL + '" class="endpoint">' + endpointShortDescription + '</a>');
    }
    // ha ujonnan hozzaadott node, azaz Profile-ban megadott default endpoint-ja van
    else{
//        endpointLink.attr('title', Profile.defaultEndpointURI);
        endpointLink.append(Profile.defaultEndpointLabel);
    }
    selfDiv.prepend(endpointLink);
    
    if (existing.length !== 0 && toHighlight){
        // order is important!! 1) Node.repaintConnections 2) Graph.highlight
        self.vis_repaintConnections();
        Graph.highlight($("div.resourceNodeBox[uri='" + this.resource_id + "']"), 2);
    }
};

Node.prototype.vis_showImageOwnImage = function(nodeImageDiv, imgBox){
    var self = this;
    imgBox = $('<a class="fancybox" href="' + self.nodeImageURL + '"></a>');
    imgBox.append(Helper.getImgSrc(self.nodeImageURL));
    nodeImageDiv.empty().append(imgBox);
};

Node.prototype.vis_showImageDefaultEndpoint = function(imgBox){
    var self = this;
    $("<img />").attr('src', self.nodeImageURL).load(function() {
        var imgBox2 = $('<a class="fancybox" target="_blank" href="' + self.nodeImageURL + '"></a>');
        imgBox2.append(Helper.getImgSrc(self.nodeImageURL));
        imgBox.empty().attr('href', self.nodeImageURL).append(imgBox2);
    });
};

Node.prototype.vis_showImageDefaultImage = function(nodeImageDiv, imgBox){
    var self = this;
    // predefined images, for some types
    if (self.type === 'person' || self.type === 'agent') {
        imgBox = $('<a class="fancybox" target="_blank" href="' + Profile.nodeTypesDefaultImages.person + '"></a>');
        imgBox.append(Helper.getImgSrc(Profile.nodeTypesDefaultImages.person));
        nodeImageDiv.empty().append(imgBox);
    }
    else if (self.type === 'work') {
        imgBox = $('<a class="fancybox" target="_blank" href="' + Profile.nodeTypesDefaultImages.work + '"></a>');
        imgBox.append(Helper.getImgSrc(Profile.nodeTypesDefaultImages.work));
        nodeImageDiv.empty().append(imgBox);
    }
    else if (self.type === 'group') {
        imgBox = $('<a class="fancybox" target="_blank" href="' + Profile.nodeTypesDefaultImages.group + '"></a>');
        imgBox.append(Helper.getImgSrc(Profile.nodeTypesDefaultImages.group));
        nodeImageDiv.empty().append(imgBox);
    }
};
       
Node.prototype.vis_refresh = function(highlight, aroundNode) {
    this.vis_show(highlight, aroundNode);
};

Node.prototype.vis_openNode = function(targetTabName, property, target) {
    $('.node-open').removeClass('opened');
    $('.node-open').find('img').attr('src', "img/document-properties-deactivated.png");
    $(".resourceNodeBox").removeClass('opened');
    
    $("[uri='" + this.resource_id + "'] .node-open").addClass('opened');
    $("[uri='" + this.resource_id + "'] .node-open").find('img').attr('src', "img/document-properties.png");
    $("[uri='" + this.resource_id + "']").addClass('opened');
    
    this.vis_showOpenedContent(targetTabName, property, target);
    
};

Node.prototype.vis_closeNode = function() {
    $("[uri='" + this.resource_id + "'] .node-open").removeClass('opened');
    $("[uri='" + this.resource_id + "'] .node-open").find('img').attr('src', "img/document-properties-deactivated.png");
    $('#nodeOpenedContent').remove();
    $(".resourceNodeBox").removeClass('opened');

};

Node.prototype.scrollToResult = function(tab, panel) {
    var property = tab.attr('property');
    var target = tab.attr('target');
    try{
//        if (property && target) {
            var targetObj = panel.find('.property-value-normal[refProp="' + property + '"][refPropVal="' + target + '"]');

            var targetObjList = targetObj.parent('ul');
            targetObjList.filter(":hidden").prev('p').find('.conncollapsetoggle').click();

            targetObj.addClass('property-value-highlighted');

            panel.stop().animate({scrollTop: (targetObj.position().top - 40)}, 800);
            tab.removeAttr('target');
//        }
    }
    catch (ex) {

    }
};

Node.prototype.vis_switchTab = function(targetTabName, property, target) {
    var resBox = $('#nodeOpenedContent');
    // res box was opened
    if (resBox && resBox.length !== 0) {
        // res box of another node was opened, close it, then open the result node's box
        if (resBox.attr('resourceuri') !== this.resource_id) {
            var node = Graph.getNode(resBox.attr('resourceuri'));
            if (node){
                node.vis_closeNode();
            }
            this.vis_openNode(targetTabName, property, target);
        }
        // result node's res box opened, switch tab and scroll there
        else {
            var tab = $("#nodeOpenedContentTabs ul[role='tablist'] li." + targetTabName);
            var tabId = tab.attr('aria-controls');

            var targetTabId;
            try{
                targetTabId = parseInt(tabId.replace("itemtab-", ""));
            }
            catch (ex){
                targetTabId = 0;
            }
            $("#nodeOpenedContentTabs").tabs("option", "active", targetTabId);

            var panel = $("#nodeOpenedContentTabs div#" + tabId);

            var list = $('#' + tabId);
            var targetObj = list.find('.property-value-normal[refProp="' + property + '"][refPropVal="' + target + '"]');

            var targetObjList = targetObj.parent('ul');
            targetObjList.filter(":hidden").prev('p').find('.conncollapsetoggle').click();

            targetObj.addClass('property-value-highlighted');

            panel.stop().animate({scrollTop: (targetObj.position().top - 40)}, 800);
            panel.removeAttr('target');
        }
    }
    // res box was closed
    else {
        this.vis_openNode(targetTabName, property, target);
    }



};

Node.prototype.vis_showOpenedContent = function(targetTabName, property, target) {
    var self = this;
    
    if (!Graph.vis_nodeOpenedContent) {
        Graph.vis_nodeOpenedContent = {
            'width': 300,
            'height': $(window).height()-50
        };
    }

    $('#nodeOpenedContent').remove();
    var nodeContent = this.getContent();

    var str_content = '',
        str_header = '',
        tabcounter = 0,
        deletePropertyBtn = '<span class="inspectorBtn deletePropertyBtn" title="Delete property">[x]</span>',
        deleteConnectionBtn = '<span class="inspectorBtn deleteConnectionBtn" title="Delete connection">[x]</span>',
        addPropertyBtn = '<span class="inspectorBtn addPropertyBtn" title="Add property">[add]</span>',
        addConnectionBtn = '<span class="inspectorBtn addConnectionBtn" title="Add connection">[add]</span>',
        addNewConnectionBtn = '<span class="inspectorBtn addNewConnectionBtn" title="Add new connection type">[add]</span>',
        addNewPropertyBtn = '<span class="inspectorBtn addNewPropertyBtn" title="Add new property type">[add]</span>';

    $.each(nodeContent, function(idx, elem) {
        $.each(elem, function(type, item) {
//            if (targetTabName && targetTabName !== '' && targetTabName === type && property && property !== '' && target && target !== '')
            if (targetTabName && targetTabName === type && property && target )
                str_header += '<li class="' + type + '" property="' + property + '" target="' + target + '">';
            else
                str_header += '<li class="' + type + '">';

            var tabName;
            switch (type){
                case 'literals':
                    tabName = 'Properties';
                    break;
                case 'out':
                    tabName = 'Links out';
                    break;
                case 'in':
                    tabName = 'Links in';
                    break;
            }


            str_header += '<a href="#itemtab-' + tabcounter + '">' + tabName + '</a></li>';
            str_content += '<div direction="'+type+'" id="itemtab-' + tabcounter + '">';
            var propertyName;

            // literals, aka. description tab,  values in the right panel
            if (type === 'literals') {
                str_content += addNewPropertyBtn;
                $.each(item, function(connectionURI, connectionItems) {
                    propertyName = Profile.getPropertyLabel(connectionURI);
                    propertyName = Helper.getCapitalizedString(propertyName);

                    var propValue = $('');
                    // 1 elem van ebbol a propertybol
                    if (connectionItems.length === 1) {
                        propValue = connectionItems[0];
                        if (Profile.isPropertyExternalLink(connectionURI)){
//                            propValue = '<a href="' + propValue + '" target="_blank">' + propValue.replace(/_/g , " ") + '</a>';
                            propValue = '<a href="' + propValue + '" target="_blank">' + propValue + '</a>';
                        }
                        else if (Profile.getPropertyIfGeo(connectionURI, propValue, item, self.label)){
                            propValue = propValue + '<a href="' + Profile.getPropertyIfGeo(connectionURI, propValue, item, self.label) + '" target="_blank"><img src="' + Profile.getPropertyIfGeo(connectionURI, propValue, item, self.label) + '"></a>';
                        }

                        str_content += "<p class='conncollapse'><b class='conncollapsetoggle' title='" + connectionURI + "'>" + propertyName + " (" + "<span class='propNum'>1</span>" + ")</b> "+addPropertyBtn+"</p>";
                        str_content += "<ul><li refProp='" + connectionURI + "' refPropVal='" + connectionItems[0] + "' class='property-value-normal'>" + deletePropertyBtn + propValue +"</li></ul>";
                    }
                    // tobb, mint 1 elem van ebbol a propertybol
                    else {
                        str_content += "<p class='conncollapse'><b class='conncollapsetoggle'" + connectionURI + "'>" + propertyName + " (" + "<span class='propNum'>"+connectionItems.length+ "</span>" + ")</b> "+ addPropertyBtn +"</p><ul>";
                        $.each(connectionItems, function(connectionItemIndex, connectionItem) {
                            propValue = connectionItem;
                            if (Profile.isPropertyExternalLink(connectionURI)){
//                                propValue = '<a href="' + propValue + '" target="_blank">' + propValue.replace(/_/g , " ") + '</a>';
                                propValue = '<a href="' + propValue + '" target="_blank">' + propValue + '</a>';
                            }

                            str_content += "<li refProp='" + connectionURI + "' refPropVal='" + connectionItem + "' class='property-value-normal'>" + deletePropertyBtn + propValue + "</li>";
                        });
                        str_content += "</ul>";
                    }
                });

            // out and in tabs, aka. connections in the right panel
            } else {
                str_content += addNewConnectionBtn;
                $.each(item, function(connectionURI, connectionItems) {
                    propertyName = Helper.getCapitalizedString(Profile.getPropertyLabel(connectionURI));

                    // 1 elem van ebbol a propertybol
                    if (connectionItems.length === 1) {
                        str_content += "<p class='conncollapse'><b class='conncollapsetoggle' title='" + connectionURI + "'>" + propertyName + " (" + "<span class='propNum'>1</span>" + ")</b> "+ addConnectionBtn +"</p>";
                        str_content += "<ul><li>" + deleteConnectionBtn + Profile.getPropertyIfImage(connectionItems[0].target, connectionItems[0].label, connectionURI, self.resource_id, type) + "</li></ul>";
                    }
                    // tobb, mint 1 elem van ebbol a propertybol
                    else {
                        str_content += "<p class='conncollapse'><b class='conncollapsetoggle' title='" + connectionURI + "'>" + propertyName + " (" + "<span class='propNum'>"+connectionItems.length+ "</span>" + ")</b> "+ addConnectionBtn +"</p><ul>";
                        $.each(connectionItems, function(connectionItemIndex, connectionItem) {
                            str_content += "<li>" + deleteConnectionBtn + Profile.getPropertyIfImage(connectionItem.target, connectionItem.label, connectionURI, self.resource_id, type) + "</li>";
                        });
                        str_content += "</ul>";
                    }

                });
            }

            str_content += "</div>";
            tabcounter++;
        });
    });

    str_header = "<ul>" + str_header + "</ul>";
    
    Graph.canvas.parent().append('<div id="nodeOpenedContent" title="' + this.label + '"><div id="nodeOpenedContentTabs">' + str_header + str_content + '</div></div>');
    $('#nodeOpenedContent').css('overflow', 'hidden');
    
    $('#nodeOpenedContent').dialog({
        position: {my: "left", at: "right top", of: window},
        height: $(window).height()-50,
        width: Graph.vis_nodeOpenedContent.width,
        show: "drop",
        create: function(event) {
            $(event.target).parent().css('position', 'fixed');
        },
        close: function(event, ui) {
            $('.node-open.opened').each(function(index) {
                var node = Graph.getNode($(this).parent()[0].getAttribute('uri'));
//                $(this).find('img').attr('src', "img/document-properties-deactivated.png");
                node.vis_closeNode();
            });
        },
        resizeStart: function(event) {
            $(event.target).parent().css('position', 'fixed');
        },
        resizeStop: function(event) {
            $(event.target).parent().css('position', 'fixed');
            $("#nodeOpenedContentTabs").tabs("option", "heightStyle", "fill");
            Graph.vis_nodeOpenedContent.height = $("#nodeOpenedContent").dialog("option", "height");
            Graph.vis_nodeOpenedContent.width = $("#nodeOpenedContent").dialog("option", "width");
        }
    }).attr('resourceUri', this.resource_id);
    
    
    $("#nodeOpenedContentTabs").tabs({
        heightStyle: "fill",
        create: function(event, ui) {
            self.scrollToResult(ui.tab, ui.panel);
        },
        activate: function(event, ui) {
            self.scrollToResult(ui.newTab, ui.newPanel);
        }
    });

    $(window).resize(function() {
         $('#nodeOpenedContent').dialog('option',{
             position: {my: "left", at: "right top", of: window},
            height: $(window).height()-50,
            width: Graph.vis_nodeOpenedContent.width
         });
          $("#nodeOpenedContentTabs").tabs('refresh');
    });
    
    if (targetTabName && targetTabName !== '') {
        var tabId = $("#nodeOpenedContentTabs ul[role='tablist'] li." + targetTabName).attr('aria-controls');

        var targetTabId;
        try{
            targetTabId = parseInt(tabId.replace("itemtab-", ""));
        }
        // ha nincs ilyen ID-ju tab az inspectorban (azaz pl. nincs out, vagy in kapcsolata a megnyitni kivant nodenak)
        catch (ex){
            targetTabId = 0;
        }
        $("#nodeOpenedContentTabs").tabs("option", "active", targetTabId);
    }


    $('div#nodeOpenedContent').parent().addClass('opacityItem');

    // by default collapse props
    $('.conncollapse').next("ul").slideToggle("medium");
//    $('.conncollapse').find('.conncollapsetoggle').empty().append('+');

    addInspectorHandlers();
};


Node.prototype.vis_repaintConnections = function() {
    var length = this.connections.length;
    var self = this;    
    
    for (var i = 0; i < length; i++) {
        var connection = this.connections[i],
            target = decodeURIComponent(connection.target);
        if ($("[uri='" + target + "']").length) {

            var localsource = self.resource_id;
            var localtarget = target;
            if (connection.direction === 'in') {
                localsource = target;
                localtarget = self.resource_id;
                //arrowStyle = {location: 1, width: 10, length: 12};
            } else {
                //arrowStyle = {location: 0, width: 10, length: 12, direction: -1};
            }

            vis_jsPlumbInstance_connect_uri(localsource, localtarget, connection);
        }
    }
    // Iterate through the connections of all nodes in the graph to find
    // the not reflexive connections
    // DONE? .length property on undefined errors in console
    $.each(Graph.nodes, function(index, node) {
        $.each(node.connections, function(nodeconnid, nodeconn) {
            if (nodeconn.target === self.resource_id && nodeconn.direction === 'out') {
                var foundbefore = false;
                var localconns = jsPlumbInstance.getConnections({source: $("[uri='" + node.resource_id + "']"), target: $("[uri='" + self.resource_id + "']")});
                if (localconns.length) {

                    $.each(localconns, function(conn_id, l_conn) {
//                        if(l_conn.overlays){
                            $.each(l_conn.getOverlays(), function(overlay_id, overlay) {
                                if (overlay.type === 'Label') {
                                    if (overlay.getLabel() === nodeconn.getConnectionLabelShort()) {
                                        //console.log('already placed connection');
                                        foundbefore = true;
                                        return false;
                                    }
                                }
                            });
//                        }
                    });

                }

                if (!foundbefore) {
                    vis_jsPlumbInstance_connect_uri(node.resource_id, self.resource_id, nodeconn);
                }
            }
        });
    });
};

//basic creating
vis_jsPlumbInstance_connect_uri = function(uri1, uri2, connection) {
    var labelShort = connection.getConnectionLabelShort();
    var sourceNode = $("[uri='" + uri1 + "']").attr('id', md5(uri1));
    var targetNode = $("[uri='" + uri2 + "']").attr('id', md5(uri2));

    var localconns = jsPlumbInstance.getConnections({source: sourceNode, target: targetNode});
    var foundbefore = false;
    // DONE? .length property of undefined errors in console
    if (localconns.length) {
        $.each(localconns, function(conn_id, l_conn) {
//            if(l_conn.overlays){
                $.each(l_conn.getOverlays(), function(overlay_id, overlay) {
                    if (overlay.type === 'Label') {
                        if (overlay.getLabel() === labelShort) {
                            foundbefore = true;
                            return false;
                        }
                    }
                });
//            }
        });

    }
    if (foundbefore) {
        return;
    }

    var aConnection = jsPlumbInstance.connect({
        source: sourceNode,
        target: targetNode,
        type:"basicConnection",
        deleteEndpointsOnDetach:true,
//        connector: "StateMachine",
        connector: Profile.connectorType,
        overlays: [ ],
        endpoint:[ Profile.endpointForm, {
//            cssClass:"myEndpoint",
            width: Profile.endPointWidth,
            height: Profile.endPointHeight
        }],
        parameters:{
            'sourceNodeURI': uri1,
            'connectionURI': connection.connectionUri,
            'targetNodeURI': uri2
        }
    });
    aConnection.addOverlay(["Label", {
        cssClass: "connectionBox label opacityItem",
        label: labelShort,
        location: Profile.connectionLabelLocation
    }]);
    aConnection.addOverlay(["PlainArrow", {
            location: Profile.connectionArrowLocation,
            width: Profile.connectionArrowWidth,
            length: Profile.connectionArrowLength,
            direction: 1
//            foldback:0.2
//            id:"myArrow"
    }]);


    // kapcsolat labeljet hoverre kiemeli
    $('.connectionBox.label').hover(
            function() {
                $(this).css('border-color', '#f00');
                $(this).css('z-index', '101');
            },
            function() {
                $(this).css('border-color', '#000');
                $(this).css('z-index', '100');
            }
    );
};


Node.prototype.vis_delete = function() {
    $('#nodeOpenedContent[resourceUri="' + this.resource_id + '"]').remove();
    jsPlumbInstance.removeAllEndpoints($("[uri='" + this.resource_id + "']"));
    $("[uri='" + this.resource_id + "']").detach();
};

Node.prototype.vis_add_load_progressbar = function() {
    $("[uri='" + this.resource_id + "']").append('<div class="progressbar"><div class="progress-label">Loading...</div></div>');
    var pbar = $("[uri='" + this.resource_id + "'] .progressbar");
    pbar.progressbar({
        value: false
    });
};

Node.prototype.vis_remove_load_progressbar = function() {
    $("[uri='" + this.resource_id + "'] .progressbar").remove();
};


Graph.vis_clear = function() {
    jsPlumbInstance.detachEveryConnection();
    jsPlumbInstance.removeAllEndpoints();
};

Graph.vis_engineInit = function() {
    jsPlumbInstance.importDefaults({
        DragOptions: {cursor: "move", zIndex: 2000},
        HoverClass: "connector-hover"
    });

    window.scrollTo((Profile.graphSize - $(window).width()) / 2, (Profile.graphSize - $(window).height()) / 2);

    /** Pan **/
    Graph.canvas[0].onmousedown = function(event) {
//        console.log(event.target)
        // if node connection label is dragged
        if ($(event.target).is('.connectionBox.label *, .connectionBox.label')) {
            return false;
        }
        // if node endpoint is dragged
        if ($(event.target).is('rect *, rect')) {
            return false;
        }
        // if node source endpoint is dragged
        if ($(event.target).is('circle *, circle')) {
            return false;
        }
        // if node is dragged
        if ($(event.target).is('.resourceNodeBox *, .resourceNodeBox')) {
            return false;
        }
        $(this)
                .data('down', true)
                .data('x', event.clientX)
                .data('y', event.clientY);
        //console.log("DWNPOS: " + $(this).data('x') + ' ' + $(this).data('y'));
        return false;
    };

    Graph.canvas[0].onmouseup = function(event) {
        if ($(this).data('down') === true) {
            $(this).data('down', false);
            var xoffset = $(this).data('x') - event.clientX;
            var yoffset = $(this).data('y') - event.clientY;

            $('.resourceNodeBox').each(function() {
                var vis_node = $(this);
                var position = vis_node.position();
                var node = Graph.getNode(this.getAttribute('uri'));
                node.top = position['top'] - yoffset;
                node.left = position['left'] - xoffset;

                vis_node.css('left', node.left);
                vis_node.css('top', node.top);
//                $(this).animate({'top': node.top + 'px', 'left': node.left + 'px'}, 0, function() {
//                    jsPlumbInstance.repaint($(this));
//                });
            });
            $('.resourceNodeBox').each(function() {
                jsPlumbInstance.repaint(this);
            });
        }
        //console.log("UP");
        return false;
    };
    /* zoom */
    Graph.canvas.bind('mousewheel', function(event, delta) {
//        var dir = delta > 0 ? 'Up' : 'Down';
//        var vel = Math.abs(delta);
        if (delta > 0) Graph.zoomRatio += 0.1;
        else if (Graph.zoomRatio > 0.701) Graph.zoomRatio -= 0.1; //float
        console.log(Graph.zoomRatio);

        $('.resourceNodeBox').each(function() {
            var vis_node = $(this);
            var position = vis_node.position();
            var node = Graph.getNode(this.getAttribute('uri'));
            vis_node.css('left', $(document).scrollLeft() + event.clientX + (node.left - $(document).scrollLeft() - event.clientX) * Graph.zoomRatio);
            vis_node.css('top', $(document).scrollTop() + event.clientY  + (node.top - $(document).scrollTop() - event.clientY) * Graph.zoomRatio);
//            if (Graph.zoomRatio <= 1.0) {
            vis_node.css('width', node.width * Graph.zoomRatio);
            vis_node.css('height', node.height * Graph.zoomRatio);
            vis_node.find('.nodeImage img').css('max-height', 75 * Graph.zoomRatio - 36); //perfect
//            vis_node.find('.resourceLabel').css('max-height', 30 * Graph.zoomRatio);
//            var img2 = this.find('.nodeImage img');

//            }
//            jsPlumbInstance.animate(this, {'top': node.top + 'px', 'left': node.left + 'px'});
        });
        $('.resourceNodeBox').each(function() {
            jsPlumbInstance.repaint(this);
        });

        return false;
    });
};

Graph.vis_highlight = function(selector, edgehl) {    
    $(selector).addClass("highlighted");
    $(selector).find('.node-highlight').addClass("opened");
    
    // if every nodes are highlighted, highlight the main star on the left palette
    if ($('.resourceNodeBox').size() === $('.resourceNodeBox.highlighted').size())
        $("#selectPalette .node-highlight-all").addClass("opened");
    
    if (edgehl === 0) {
        // do not highlight the edges at all
    } else if (edgehl === 1) {
        // highlight all edges attached to the highlighted nodes

        var localconns = jsPlumbInstance.getConnections({source: $(".highlighted.resourceNodeBox"), target: $(".resourceNodeBox")});
        $.each(localconns, function() {
            this.setPaintStyle({strokeStyle: Profile.highlightedConnectionsColor});
        });
        localconns = jsPlumbInstance.getConnections({source: $(".resourceNodeBox"), target: $(".highlighted.resourceNodeBox")});
        $.each(localconns, function() {
            this.setPaintStyle({strokeStyle: Profile.highlightedConnectionsColor});
        });
    } else if (edgehl === 2) {
        // highlight all edges which both end is connected to highlighted nodes
        var localconns = jsPlumbInstance.getConnections({source: $(".resourceNodeBox.highlighted"), target: $(".resourceNodeBox.highlighted")});        
        
        $.each(localconns, function() {
            this.setPaintStyle({strokeStyle: Profile.highlightedConnectionsColor});
        });
    }
};

Graph.vis_removeHighlight = function(selector) {
    var self = this;
    var toHighlight = $(".highlighted.resourceNodeBox").not($(selector));
    this.removeAllHighlights();
    $.each(toHighlight, function(){
        self.highlight(this, 2);
    });
    if ($('.resourceNodeBox.highlighted').size() === 0)
        $("#selectPalette .node-highlight-all").removeClass("opened");
};

Graph.vis_removeAllHighlights = function() {
    $(".resourceNodeBox").removeClass("highlighted");
    $(".resourceNodeBox .node-highlight").removeClass("opened");
    $("#selectPalette .node-highlight-all").removeClass("opened");
    
    var localconns = jsPlumbInstance.getAllConnections();
//    if (localconns.jsPlumbInstance_DefaultScope !== undefined) {
        $.each(localconns, function() {
            this.setPaintStyle({strokeStyle: Profile.defaultConnectionsColor});
        });
//    }
};

Graph.vis_highlightAll = function() {
    var self = this;    
    $.each($(".resourceNodeBox"), function() {
        self.highlight($(this), 2);
    });
    
};
