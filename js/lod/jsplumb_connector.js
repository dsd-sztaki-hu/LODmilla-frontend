/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth - MTA SZTAKI DSD
 *
 */

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
    
    if (this.loaded) {
        self.setImageURL();
    }
    var nodeHighlightBtn = $('<div class="node-button node-highlight"></div>');    
    var nodeDeleteBtn = '<div class="node-button node-delete"></div>';
    var nodeOpenBtn = '<div class="node-button node-open"></div>';     
    
    var existing = $("div.resourceNodeBox[uri='" + this.resource_id + "']");

    var nodeLabel = this.label;
        
    var nodeLabelShort = Profile.util_truncateString(nodeLabel, Profile.nodeLabelMaxLength);
    
    var toHighlight = false;
    if (existing.length === 0) {
        var node = $('<div class="resourceNodeBox opacityItem" uri="' + this.resource_id + '"></div>');
        if (highlight){
            nodeHighlightBtn.addClass('opened');
        }
        node.append(nodeHighlightBtn);
        node.append('<div class="resourceLabel" title="' + nodeLabel + '">' + nodeLabelShort + '</div>' + nodeDeleteBtn + nodeOpenBtn);
        Graph.canvas.append(node);
        
        if (self.loaded === false) {
            self.vis_add_load_progressbar();
        }
    } else {
        if (existing.find('.node-highlight').hasClass('opened')){
            toHighlight = true;
        }
        existing.empty();
        existing.append(nodeHighlightBtn);
        existing.append('<div class="resourceLabel" title="' + nodeLabel + '">' + nodeLabelShort + '</div>'+ nodeDeleteBtn + nodeOpenBtn);
    }

    jsPlumb.draggable(jsPlumb.getSelector("[uri='" + this.resource_id + "']"));

    if (this.top === null && this.left === null) {       
        var thisNode = this;
        
        var counter = 0;        
        var found = true;
        var maxDistance = {'dist':0, 'top':0, 'left':0};
        do {
            counter +=1;
            found = true;            
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
    
    $("[uri='" + this.resource_id + "'] .node-highlight")[0].onclick = function(event) {        
        if ($(this).hasClass('opened'))
            Graph.removeHighlight($(this).parent());
        else
            Graph.highlight($(this).parent(), 2);
    };
    
    $("[uri='" + this.resource_id + "'] .node-delete")[0].onclick = function(event) {
        var resource_id = this.parentNode.getAttribute('uri');
        var highlighted;
        if ($('div.resourceNodeBox[uri="' + resource_id + '"]').hasClass('highlighted'))
            highlighted = true;
        else
            highlighted = false;
        
        var undoActionLabel = 'action_node_deleteNode';
        var top = Graph.getNode(resource_id).top;
        var left = Graph.getNode(resource_id).left;
        Graph.deleteNode(resource_id);
        var nodeList = [{resource_id:resource_id, action:'removed',highlighted:highlighted,top:top,left:left}];
        Graph.logUndoAction(undoActionLabel, nodeList);
    };

    $("[uri='" + this.resource_id + "'] .node-open")[0].onclick = function(event) {
        var node = Graph.getNode(this.parentNode.getAttribute('uri'));
        if($(this).parent().hasClass('opened'))
            node.vis_closeNode();
        else
            node.vis_openNode(false, false, false);
    };

    var selfDiv = $('div.resourceNodeBox[uri="' + self.resource_id + '"]');

    if (self.type !== ""){
        selfDiv.removeClass("nodetype_" + Profile.unloadedNodeType).addClass("nodetype_" + self.type);
        selfDiv.attr('nodetype', self.type);
    }

    // default image for placeholder
    var nodeImageDiv = $('<div class="nodeImage"></div>');
    var imgBox = $('<span><img src="' + Profile.nodeTypesDefaultImages.thingEmpty + '" style="width:32px;height:32px;" /></span>');

    nodeImageDiv.append(imgBox);
    selfDiv.append(nodeImageDiv);

    if (this.loaded) {
        // if it has its own image, from external DB or store
        if (self.nodeImageURL) {
            imgBox = $('<a class="fancybox" href="' + self.nodeImageURL + '"></a>');
            imgBox.append('<img src="' + self.nodeImageURL + '" style="width:32px;height:32px;" />');
            nodeImageDiv.empty().append(imgBox);
        }
        
        // predefined images, for some types
        if (self.type === 'person' || self.type === 'agent') {
            imgBox = $('<a class="fancybox" target="_blank" href="' + Profile.nodeTypesDefaultImages.person + '"></a>');
            imgBox.append('<img src="' + Profile.nodeTypesDefaultImages.person + '" style="width:32px;height:32px;" />');
            nodeImageDiv.empty().append(imgBox);
        }
        else if (self.type === 'work') {
            imgBox = $('<a class="fancybox" target="_blank" href="' + Profile.nodeTypesDefaultImages.work + '"></a>');
            imgBox.append('<img src="' + Profile.nodeTypesDefaultImages.work + '" style="width:32px;height:32px;" />');
            nodeImageDiv.empty().append(imgBox);
        }
        else if (self.type === 'group') {
            imgBox = $('<a class="fancybox" target="_blank" href="' + Profile.nodeTypesDefaultImages.group + '"></a>');
            imgBox.append('<img src="' + Profile.nodeTypesDefaultImages.group + '" style="width:32px;height:32px;" />');
            nodeImageDiv.empty().append(imgBox);
        }

        var endpointURL = '';
        var endpointShortDescription = '';

        // Node comes from a known LOD
        if (self.endpoint.shortDescription && self.endpoint.endpointURL) {
            endpointShortDescription = Profile.util_truncateString(self.endpoint.shortDescription, Profile.nodeLabelMaxLength);
            endpointURL = self.endpoint.endpointURL;

            // Node image comes from SZTAKI LOD
            if (self.endpoint.endpointURL === "http://lod.sztaki.hu/sparql") {
                if (self.type === 'person') {
                    $("<img />").attr('src', self.nodeImageURL).load(function() {
                        imgBox.empty().attr('href', self.nodeImageURL).append('<img src="' + self.nodeImageURL + '" style="width:40px;height:50px;" />');
                    });
                }
                else if (self.type === 'work') {
                    $("<img />").attr('src', self.nodeImageURL).load(function() {
                        imgBox.empty().attr('href', self.nodeImageURL).append('<img src="' + self.nodeImageURL + '" style="width:40px;height:50px;" />');
                    });
                }
                else if (self.type === 'group') {
                }
            }
        }
        // Node comes from a not known external LOD (not present in the Profile)
        // does not have an image
        else {
            endpointShortDescription = Profile.util_truncateString(Profile.getLodServerBaseUrl(self.resource_id), Profile.nodeLabelMaxLength);
            endpointURL = Profile.getLodServerBaseUrl(self.resource_id);            
        }        
        // connections num in the Node
        var connLen = self.connections.length;
        var litLen = self.getLiteralsNum();
        selfDiv.append('<div class="sumConnections">' + litLen + '&nbsp;|&nbsp;' + connLen + '</div>');
        
    }
    // if still not loaded
    else {
        endpointShortDescription = Profile.util_truncateString(Profile.getLodServerBaseUrl(self.resource_id), Profile.nodeLabelMaxLength);
        endpointURL = Profile.getLodServerBaseUrl(self.resource_id);
        
        imgBox = $('<a class="fancybox" href="' + Profile.nodeTypesDefaultImages.noEndpoint + '"></a>');
        imgBox.append('<img src="' + Profile.nodeTypesDefaultImages.noEndpoint + '" style="width:32px;height:32px;" />');
        nodeImageDiv.empty().append(imgBox);
    }
    
    selfDiv.prepend('<div class="endpointLink"><a target="_blank" href="' + endpointURL + '" class="endpoint">' + endpointShortDescription + '</a></div>');
    
    $('div.resourceNodeBox div.resourceLabel').tooltip({
        position: { my: "right center"},
        tooltipClass: "my_tooltip"
    });
    
    if (existing.length !== 0 && toHighlight){
        // order is important!! 1) Node.repaintConnections 2) Graph.highlight
        self.vis_repaintConnections();
        Graph.highlight($("div.resourceNodeBox[uri='" + this.resource_id + "']"), 2);
    }
};
       
Node.prototype.vis_refresh = function(highlight, aroundNode) {
    this.vis_show(highlight, aroundNode);
};

Node.prototype.vis_openNode = function(targetTabName, property, target) {
    $('.node-open').removeClass('opened');
    $(".resourceNodeBox").removeClass('opened');
    
    $("[uri='" + this.resource_id + "'] .node-open").addClass('opened');
    $("[uri='" + this.resource_id + "']").addClass('opened');
    
    this.vis_showOpenedContent(targetTabName, property, target);
    
};

Node.prototype.vis_closeNode = function() {
    $("[uri='" + this.resource_id + "'] .node-open").removeClass('opened');
    $('#nodeOpenedContent').remove();
    $(".resourceNodeBox").removeClass('opened');

};

Node.prototype.scrollToResult = function(tab, panel) {
    var property = tab.attr('property');
    var target = tab.attr('target');
    if (property && target) {
        var targetObj = panel.find('.property-value-normal[refProp="' + property + '"][refPropVal="' + target + '"]');
        targetObj.addClass('property-value-highlighted');

        panel.stop().animate({scrollTop: (targetObj.position().top - 40)}, 800);
        tab.removeAttr('target');
    }
};

Node.prototype.vis_switchTab = function(targetTabName, property, target) {
    var resBox = $('#nodeOpenedContent');
    // res box was opened
    if (resBox && resBox.length !== 0) {
        // res box of another node was opened, close it, then open the result node's box
        if (resBox.attr('resourceuri') !== this.resource_id) {
            Graph.getNode(resBox.attr('resourceuri')).vis_closeNode();
            this.vis_openNode(targetTabName, property, target);
        }
        // result node's res box opened, switch tab and scroll there
        else {
            var tab = $("#nodeOpenedContentTabs ul[role='tablist'] li." + targetTabName);
            var tabId = tab.attr('aria-controls');
            var targetTabId = parseInt(tabId.replace("itemtab-", ""));

            var panel = $("#nodeOpenedContentTabs div#" + tabId);

            $("#nodeOpenedContentTabs").tabs("option", "active", targetTabId);

            var list = $('#' + tabId);
            var targetObj = list.find('.property-value-normal[refProp="' + property + '"][refPropVal="' + target + '"]');
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

    var str_content = '';
    var str_header = '';
    var tabcounter = 0;

    $.each(nodeContent, function(idx, elem) {
        $.each(elem, function(index, item) {
            if (targetTabName && targetTabName !== '' && targetTabName === index && property && property !== '' && target && target !== '')
                str_header += '<li class="' + index + '" property="' + property + '" target="' + target + '">';
            else
                str_header += '<li class="' + index + '">';
            str_header += '<a href="#itemtab-' + tabcounter + '">' + index + '</a></li>';
            str_content += '<div id="itemtab-' + tabcounter + '">';
            var propertyName;
            // description tab, aka. literals values in the right panel
            if (index === 'literals') {
                $.each(item, function(sub_index, sub_item) {
                    propertyName = Profile.getPropertyLabel(sub_index);
                    propertyName = Profile.util_getCapitalizedString(propertyName);
                    
                    var propValue = $('');
                    if (sub_item.length === 1) {
                        propValue = sub_item[0];
                        if (Profile.isPropertyExternalLink(sub_index))
                            propValue = '<a href="' + propValue + '" target="_blank">' + propValue.replace(/_/g , " ") + '</a>';
                        else if (Profile.getPropertyIfGeo(sub_index, propValue, item, self.label)){
                            propValue = propValue + '<a href="' + Profile.getPropertyIfGeo(sub_index, propValue, item, self.label) + '" target="_blank"><img src="' + Profile.getPropertyIfGeo(sub_index, propValue, item, self.label) + '"></a>';
                        }
                        
                        str_content += "<p><b title='" + sub_index + "'>" + propertyName + ": </b><span refProp='" + sub_index + "' refPropVal='" + sub_item[0] + "' class='property-value-normal'>" + propValue + "</span></p>";
                    }
                    else {                        
                        str_content += "<p class='conncollapse'><b title='" + sub_index + "'>" + propertyName + " (" + sub_item.length + ") <span class='conncollapsetoggle'></span></b></p><ul>";
                        $.each(sub_item, function(sub_sub_index, sub_sub_item) {
                            propValue = sub_sub_item;
                            if (Profile.isPropertyExternalLink(sub_index))
                                propValue = '<a href="' + propValue + '" target="_blank">' + propValue.replace(/_/g , " ") + '</a>';
                            
                            str_content += "<li refProp='" + sub_index + "' refPropVal='" + sub_sub_item + "' class='property-value-normal'>" + propValue + "</li>";
                        });
                        str_content += "</ul>";
                    }
                });
                // out and in tabs, aka. connections in the right panel
            } else {
                $.each(item, function(sub_index, sub_item) {
                    propertyName = Profile.getPropertyLabel(sub_index);
                    propertyName = Profile.util_getCapitalizedString(propertyName);

                    if (sub_item.length === 1) {
                        str_content += "<p class='conncollapse'><b title='" + sub_index + "'>" + propertyName + "</b></p>";
                        str_content += Profile.getPropertyIfImage(sub_item[0].target, sub_item[0].label, index, sub_index);
                    }
                    else {
                        str_content += "<p class='conncollapse'><b title='" + sub_index + "'>" + propertyName + " (" + sub_item.length + ") <span class='conncollapsetoggle'></span></b></p><ul>";
                        $.each(sub_item, function(sub_sub_index, sub_sub_item) {
                            str_content += "<li>" + Profile.getPropertyIfImage(sub_sub_item.target, sub_sub_item.label, index, sub_index) + "</li>";
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
    
    if (targetTabName && targetTabName !== '' && target && target !== '') {
        var tabId = $("#nodeOpenedContentTabs ul[role='tablist'] li." + targetTabName).attr('aria-controls');
        var targetTabId = parseInt(tabId.replace("itemtab-", ""));
        $("#nodeOpenedContentTabs").tabs("option", "active", targetTabId);
    }

    $("#nodeOpenedContentTabs a.handlehere").click(function(event) {
        event.preventDefault();
        var resource_id = $(this).attr("refpropval");
        if (!(Graph.getNode(resource_id))){
            var undoActionLabel = 'action_resourceBox_addNewNodeConnection';
            var aroundNode = Graph.getAroundNode();
            Graph.addNode($(this).attr("refpropval"),false,false,false,false, undoActionLabel, aroundNode);            
        }
        else
            $('div[uri="'+resource_id+'"]').effect( "shake" );
        return false;
    });

    $('div#nodeOpenedContent').parent().addClass('opacityItem');

    // collapsible props
//    $('.conncollapse').next("ul").slideToggle("medium");
//    $('.conncollapse').find('.conncollapsetoggle').empty().append('+');
//    $(".conncollapse").click(function() {
//        $(this).next("ul").slideToggle("medium");
//        $.each($(this).find('.conncollapsetoggle'), function() {
//            var actval = $(this)[0].innerHTML;
//            var newval = '+';
//            if (actval === '+')
//                newval = '-';
//            $(this).empty().append(newval);
//        });
//    });

    $('p.conncollapse b').tooltip();
};


Node.prototype.vis_repaintConnections = function() {
    var length = this.connections.length;
    var self = this;    
    
    for (var i = 0; i < length; i++) {
        var connection = this.connections[i];
        if ($("[uri='" + connection.target + "']").length) {

            var localsource = self.resource_id;
            var localtarget = connection.target;
            if (connection.direction === 'in') {
                localsource = connection.target;
                localtarget = self.resource_id;
                //arrowStyle = {location: 1, width: 10, length: 12};
            } else {
                //arrowStyle = {location: 0, width: 10, length: 12, direction: -1};
            }

            vis_jsplumb_connect_uri(localsource, localtarget, connection.getConnectionLabelShort());
        }
    }
    // Iterate through the connections of all nodes in the graph to find
    // the not reflexive connections
    $.each(Graph.nodes, function(index, node) {
        $.each(node.connections, function(nodeconnid, nodeconn) {
            if (nodeconn.target === self.resource_id && nodeconn.direction === 'out') {
                var foundbefore = false;
                var localconns = jsPlumb.getConnections({source: $("[uri='" + node.resource_id + "']"), target: $("[uri='" + self.resource_id + "']")});
                if (localconns.length) {
                    $.each(localconns, function(conn_id, l_conn) {
                        $.each(l_conn.overlays, function(overlay_id, overlay) {
                            if (overlay.type === 'Label') {
                                if (overlay.getLabel() === nodeconn.getConnectionLabelShort()) {
                                    //console.log('already placed connection');
                                    foundbefore = true;
                                    return false;
                                }
                            }
                        });
                    });
                }
                if (!foundbefore) {
                    vis_jsplumb_connect_uri(node.resource_id, self.resource_id, nodeconn.getConnectionLabelShort());
                }
            }
        });
    });
};

vis_jsplumb_connect_uri = function(uri1, uri2, label) {
    var localconns = jsPlumb.getConnections({source: $("[uri='" + uri1 + "']"), target: $("[uri='" + uri2 + "']")});
    var foundbefore = false;
    if (localconns.length) {
        $.each(localconns, function(conn_id, l_conn) {
            $.each(l_conn.overlays, function(overlay_id, overlay) {
                if (overlay.type === 'Label') {
                    if (overlay.getLabel() === label) {
                        foundbefore = true;
                        return false;
                    }
                }
            });
        });
    }
    if (foundbefore) {
        return;
    }

    var arrowStyle = {location: 1, width: 10, length: 12, direction: 1};

    var aConnection = jsPlumb.connect({
        source: $("[uri='" + uri1 + "']"),
        target: $("[uri='" + uri2 + "']"),
        connector: "StateMachine",
        overlays: [["Label", {
                    cssClass: "connectionBox label opacityItem",
                    label: label,
                    location: 0.5
                }],
            ["PlainArrow", arrowStyle]
        ],
        endpoint: "Blank",
        anchor: "Continuous",
        paintStyle: {lineWidth: 1, strokeStyle: "#056"},
        hoverPaintStyle: {strokeStyle: Profile.defaultConnectionsColor},
        ConnectorZIndex: 100
    });

    aConnection.bind("mouseenter", function(c) {
        $.each(c.overlays, function(index, item) {
            $(item.canvas).css('border-color', '#f00').zIndex(101);
        });
    });

    aConnection.bind("mouseexit", function(c) {
        $.each(c.overlays, function(index, item) {
            $(item.canvas).css('border-color', '#000').zIndex(100);
        });
    });

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
    jsPlumb.removeAllEndpoints($("[uri='" + this.resource_id + "']"));
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
    jsPlumb.detachEveryConnection();
    jsPlumb.removeAllEndpoints();
};

Graph.vis_engineInit = function() {
    jsPlumb.importDefaults({
        DragOptions: {cursor: "move", zIndex: 2000},
        HoverClass: "connector-hover"
    });

    window.scrollTo((3000 - $(window).width()) / 2, (3000 - $(window).height()) / 2);

    /** Pan and zoom **/
    Graph.canvas[0].onmousedown = function(event) {
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

                var position = $(this).position();
                node = Graph.getNode(this.getAttribute('uri'));
                node.top = position['top'] - yoffset;
                node.left = position['left'] - xoffset;

                $(this).animate({'top': node.top + 'px', 'left': node.left + 'px'}, 0, function() {
                    jsPlumb.repaint($(this));
                });
            });
        }
        //console.log("UP");
        return false;
    };

    Graph.canvas.bind('mousewheel', function(event, delta) {
        var dir = delta > 0 ? 'Up' : 'Down';
        var vel = Math.abs(delta);

        var zoomRatio = delta > 0 ? 1.1 : 0.9;

        $('.resourceNodeBox').each(function() {
            var position = $(this).position();
            node = Graph.getNode(this.getAttribute('uri'));
            node.top = $(document).scrollTop() + event.clientY + (position['top'] - $(document).scrollTop() - event.clientY) * zoomRatio;
            node.left = $(document).scrollLeft() + event.clientX + (position['left'] - $(document).scrollLeft() - event.clientX) * zoomRatio;

            $(this).animate({'top': node.top + 'px', 'left': node.left + 'px'}, 0, function() {
                jsPlumb.repaint($(this));
            });
        });
        return false;
    });
};

Graph.vis_highlight = function(selector, edgehl) {    
    $(selector).addClass("highlighted");
    $(selector).find('.node-highlight').addClass("opened");
    
    $("#selectPalette .node-highlight-type").addClass("opened-half");
    
    // if every nodes are highlighted, highlight the main star on the left palette
    if ($('.resourceNodeBox').size() === $('.resourceNodeBox.highlighted').size())
        $("#selectPalette .node-highlight-type").removeClass("opened-half").addClass("opened");    
    
    if (edgehl === 0) {
        // do not highlight the edges at all
    } else if (edgehl === 1) {
        // highlight all edges attached to the highlighted nodes

        var localconns = jsPlumb.getConnections({source: $(".highlighted.resourceNodeBox"), target: $(".resourceNodeBox")});
        $.each(localconns, function() {
            this.setPaintStyle({strokeStyle: Profile.highlightedConnectionsColor});
        });
        localconns = jsPlumb.getConnections({source: $(".resourceNodeBox"), target: $(".highlighted.resourceNodeBox")});
        $.each(localconns, function() {
            this.setPaintStyle({strokeStyle: Profile.highlightedConnectionsColor});
        });
    } else if (edgehl === 2) {
        // highlight all edges which both end is connected to highlighted nodes
        var localconns = jsPlumb.getConnections({source: $(".resourceNodeBox.highlighted"), target: $(".resourceNodeBox.highlighted")});        
        
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
        $("#selectPalette .node-highlight-type").removeClass("opened-half").removeClass("opened");
};

Graph.vis_removeAllHighlights = function() {
    $(".resourceNodeBox").removeClass("highlighted");
    $(".resourceNodeBox .node-highlight").removeClass("opened");
    $("#selectPalette .node-highlight-type").removeClass("opened").removeClass("opened-half");
    
    var localconns = jsPlumb.getAllConnections();
    if (localconns.jsPlumb_DefaultScope !== undefined) {
        $.each(localconns.jsPlumb_DefaultScope, function() {
            this.setPaintStyle({strokeStyle: Profile.defaultConnectionsColor});
        });
    }
};

Graph.vis_highlightAll = function() {
    var self = this;    
    $.each($(".resourceNodeBox"), function() {
        self.highlight($(this), 2);
    });
    
};
