/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

// TODO: attenni a nem ide illo fv-eket, nem jsPlumb related..plusz kodot rendezni refactor

var fancyBoxOpen = true;
var rectangleSelection = false;
var selectionWidth = 0, selectionHeight = 0;
var selectionLeft = 0, selectionTop = 0;
var selectionOriginalLeft = 0, selectionOriginalTop = 0;
var selectedID = -1, selectedIsHighlighted = false;
var mouseDown = false;
var mousePositionLeft = 0, mousePositionTop = 0;
var stillLoading = 0;

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
        var node = $('<div class="resourceNodeBox normalSizeNode opacityItem" uri="' + this.resource_id + '"></div>');
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
    graphitem[0].onmouseup = moveNode;

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
        
        imgBox = $('<a href="' + Profile.nodeTypesDefaultImages.noEndpoint + '"></a>');
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
    imgBox = $('<a class="fancybox" rel="galery1" href="' + self.nodeImageURL + '"></a>');
    imgBox.append(Helper.getImgSrc(self.nodeImageURL));
    nodeImageDiv.empty().append(imgBox);
};

Node.prototype.vis_showImageDefaultEndpoint = function(imgBox){
    var self = this;
    $("<img />").attr('src', self.nodeImageURL).load(function() {
        var imgBox2 = $('<a class="fancybox" rel="galery1" target="_blank" href="' + self.nodeImageURL + '"></a>');
        imgBox2.append(Helper.getImgSrc(self.nodeImageURL));
        imgBox.empty().attr('href', self.nodeImageURL).append(imgBox2);
    });
};

Node.prototype.vis_showImageDefaultImage = function(nodeImageDiv, imgBox){
    var self = this;
    // predefined images, for some types
    if (self.type === 'person' || self.type === 'agent') {
//        imgBox = $('<a target="_blank" href="' + Profile.nodeTypesDefaultImages.person + '"></a>');
        imgBox = $('<div/>');
        imgBox.append(Helper.getImgSrc(Profile.nodeTypesDefaultImages.person));
        nodeImageDiv.empty().append(imgBox);
    }
    else if (self.type === 'work') {
//        imgBox = $('<a target="_blank" href="' + Profile.nodeTypesDefaultImages.work + '"></a>');
        imgBox = $('<div/>');
        imgBox.append(Helper.getImgSrc(Profile.nodeTypesDefaultImages.work));
        nodeImageDiv.empty().append(imgBox);
    }
    else if (self.type === 'group') {
//        imgBox = $('<a target="_blank" href="' + Profile.nodeTypesDefaultImages.group + '"></a>');
        imgBox = $('<div/>');
        imgBox.append(Helper.getImgSrc(Profile.nodeTypesDefaultImages.group));
        nodeImageDiv.empty().append(imgBox);
    } else { // micsik added
        nodeImageDiv.empty().append(self.type.replace(/_/g," "))
            .css("font-weight", "bold")
            .css("word-wrap","break-word")
            .css("font-size", "100%")
            .css("text-transform", "uppercase")
            .css("padding-top", "7px"); 
    }
};
       
Node.prototype.vis_refresh = function(highlight, aroundNode) {
    this.vis_show(highlight, aroundNode);
    this.vis_repaintConnections();
    var length = 0;
    var loaded = 0;
    $.each(Graph.nodes, function(){
        if (this.loaded) loaded++;
        length++;
    });
    Helper.showLoadScreen();
    if (loaded == length) {
        jsPlumbInstance.setSuspendDrawing(false, false);
        if (Graph.layout != Graph.LayoutEnum.NONE && document.getElementById('layoutUpdateCheckBox').checked)
            applyLayout(Graph.layout, false);
        else
            decideZoom(Graph.zoomRatio);
        repaintNodes();
    }
};

Node.prototype.showInspector = function(callback){
    $('.node-open').removeClass('opened');
    $('.node-open').find('img').attr('src', "img/document-properties-deactivated.png");
    $(".resourceNodeBox").removeClass('opened');

    $("[uri='" + this.resource_id + "'] .node-open").addClass('opened');
    $("[uri='" + this.resource_id + "'] .node-open").find('img').attr('src', "img/document-properties.png");
    $("[uri='" + this.resource_id + "']").addClass('opened');

    if (this.content == null || this.contentParent == null) {
        Helper.showLoadScreen();
        this.vis_generateInspectorContent(callback);
        Helper.closeLoadScreen();
    }
    else
    {
        this.contentParent.append(this.content);
        this.content.css('display', 'inherit');
        if (callback)
            callback();
    }
}

Node.prototype.vis_openNode = function() {
    console.time('details: ' + this.label);

    var resBox = $('#nodeOpenedContent');
    // if the sidemenu was opened
    if (resBox && resBox.length !== 0) {
        // res box of another node was opened, close it
        if (resBox.attr('resourceuri') !== this.resource_id) {
            var node = Graph.getNode(resBox.attr('resourceuri'));
            if (node) {
                node.vis_closeNode();
            }
            this.showInspector(vis_showPropertyCallback);
        }
    }
    this.showInspector(vis_showPropertyCallback);

    console.timeEnd('details: ' + this.label);
};

Node.prototype.vis_closeNode = function() {
    $("[uri='" + this.resource_id + "'] .node-open").removeClass('opened');
    $("[uri='" + this.resource_id + "'] .node-open").find('img').attr('src', "img/document-properties-deactivated.png");
    $(".resourceNodeBox").removeClass('opened');

    var $dialog = $('.nodeDetailsDialog');
    this.contentParent = $dialog.parent();
    this.content = $dialog.detach();
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

function vis_showPropertyCallback() {
    var targetTabName = $.jStorage.get("targetTabName", "");
    var property = $.jStorage.get("property", "");
    var target = $.jStorage.get("target", "");

    var tabId = changeActiveTab(targetTabName);

    var panel = $("#nodeOpenedContentTabs div#" + tabId);

    var list = $('#' + tabId);
    var targetObj = list.find('.property-value-normal[refProp="' + property + '"][refPropVal="' + target + '"]');
    if (targetObj.length !== 0){
        //because DOM sctructure of the ul/li lists is a bit different with literals and the in/out connections
        if (targetTabName === 'literals'){
            var targetObjList = targetObj.parent('ul');
        }
        else if (targetTabName === 'in' || targetTabName === 'out'){
            var targetObjList = targetObj.parent('li').parent('ul');
        }

        // targetObjList.filter(":hidden").prev('p').find('.conncollapsetoggle').click();
        //targetObjList.prev('p').find('.conncollapsetoggle').click();

        targetObjList.css('display', 'block');
        targetObj.addClass('property-value-highlighted');

//        setTimeout(function(){
        panel.stop().animate(
            { scrollTop: (targetObj.position().top - 40)},
            500
        );
        panel.removeAttr('target');
//        }, 5000);
    }


}


Node.prototype.vis_generateInspectorContent = function(callback) {
    var self = this;
    if (!Graph.vis_nodeOpenedContent) {
        Graph.vis_nodeOpenedContent = {
            'width': 300,
            'height': $(window).height()-50
        };
    }

    $('#nodeOpenedContent').remove();
    var nodeContent = this.getContent();

    var tabcounter = 0,
        deletePropertyBtn = '<span class="inspectorBtn deletePropertyBtn" title="Delete property">[x]</span>',
        deleteConnectionBtn = '<span class="inspectorBtn deleteConnectionBtn" title="Delete connection">[x]</span>',
        addPropertyBtn = '<span class="inspectorBtn addPropertyBtn" title="Add property">[add]</span>',
        addConnectionBtn = '<span class="inspectorBtn addConnectionBtn" title="Add connection">[add]</span>',
        addNewConnectionBtn = '<span class="inspectorBtn addNewConnectionBtn" title="Add new connection type">[add]</span>',
        addNewPropertyBtn = '<span class="inspectorBtn addNewPropertyBtn" title="Add new property type">[add]</span>',
        toggleAllBtn = '<span class="inspectorBtn toggleAllBtn openAllBtn" title="Expand all">[expand all]</span>';
    var str_content = [], str_header = [];

    $.each(nodeContent, function(idx, elem) {
        $.each(elem, function(type, item) {
            str_header.push('<li class="', type, '">');

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


            str_header.push('<a href="#itemtab-', tabcounter, '">', tabName, '</a></li>');
            str_content.push('<div direction="', type, '" id="itemtab-', tabcounter, '">');
            var propertyName;

            // literals, aka. description tab,  values in the right panel
            if (type === 'literals') {
                str_content.push('<div style="margin-bottom: 8px">URI:<a target="_blank" href="'+self.resource_id+'"> ..'
                +self.resource_id.slice(-40)+'</a></div>'); //.replace(/^.*\/\/[^\/]+/,'')
                str_content.push(addNewPropertyBtn, toggleAllBtn);
                $.each(item, function(connectionURI, connectionItems) {
                    propertyName = Profile.getPropertyLabel(connectionURI);
                    propertyName = Helper.getCapitalizedString(propertyName);

                    var propValue = $('');
                    // 1 elem van ebbol a propertybol
                    if (connectionItems.length === 1) {
                        propValue = connectionItems[0];
                        //if (Profile.isPropertyExternalLink(connectionURI)){
                        if(Helper.isUrl(connectionURI)) {
//                            propValue = '<a href="' + propValue + '" target="_blank">' + propValue.replace(/_/g , " ") + '</a>';
                            propValue = '<a href="' + propValue + '" target="_blank">' + propValue + '</a>';
                        }
                        else if (Profile.getPropertyIfGeo(connectionURI, propValue, item, self.label)){
                            propValue = propValue + '<a href="' + Profile.getPropertyIfGeo(connectionURI, propValue, item, self.label) + '" target="_blank"><img src="' + Profile.getPropertyIfGeo(connectionURI, propValue, item, self.label) + '"></a>';
                        }

                        str_content.push("<p class='conncollapse'><b class='conncollapsetoggle' title='", connectionURI, "'>", propertyName, " (", "<span class='propNum'>1</span>", ")</b> ", addPropertyBtn, "</p>");
                        str_content.push("<ul><li refProp='", connectionURI, "' refPropVal='", connectionItems[0], "' class='property-value-normal'>", deletePropertyBtn, propValue, "</li></ul>");
                    }
                    // tobb, mint 1 elem van ebbol a propertybol
                    else {
                        str_content.push("<p class='conncollapse'><b class='conncollapsetoggle'", connectionURI, "'>", propertyName, " (", "<span class='propNum'>", connectionItems.length, "</span>", ")</b> ", addPropertyBtn , "</p><ul>");
                        $.each(connectionItems, function(connectionItemIndex, connectionItem) {
                            propValue = connectionItem;
                            //if (Profile.isPropertyExternalLink(connectionURI)){
                            if(Helper.isUrl(connectionURI)) {
//                                propValue = '<a href="' + propValue + '" target="_blank">' + propValue.replace(/_/g , " ") + '</a>';
                                propValue = '<a href="' + propValue + '" target="_blank">' + propValue + '</a>';
                            }

                            str_content.push("<li refProp='", connectionURI, "' refPropVal='", connectionItem, "' class='property-value-normal'>", deletePropertyBtn, propValue, "</li>");
                        });
                        str_content.push("</ul>");
                    }
                });

            // out and in tabs, aka. connections in the right panel
            } else {
                str_content.push(addNewConnectionBtn, toggleAllBtn);
                $.each(item, function(connectionURI, connectionItems) {
                    propertyName = Helper.getCapitalizedString(Profile.getPropertyLabel(connectionURI));

                    // 1 elem van ebbol a propertybol

                    if (connectionItems.length === 1) {
                        Helper.pushCollImgStr(1, str_content, connectionURI, propertyName, addConnectionBtn);
                        str_content.push("<li>", deleteConnectionBtn, Profile.getPropertyIfImage(connectionItems[0].target, connectionItems[0].label, connectionURI, self.resource_id, type), "</li></ul>");
                    }
                    // tobb, mint 1 elem van ebbol a propertybol
                    else {
                        Helper.pushCollImgStr(connectionItems.length, str_content, connectionURI, propertyName, addConnectionBtn);
                        $.each(connectionItems, function(connectionItemIndex, connectionItem) {
                            str_content.push("<li>", deleteConnectionBtn, Profile.getPropertyIfImage(connectionItem.target, connectionItem.label, connectionURI, self.resource_id, type), "</li>");
                        });
                        str_content.push("</ul>");
                    }


                });
            }

            str_content.push("</div>");
            tabcounter++;
        });
    });

    str_content = str_content.join("");
    str_header = "<ul>" + str_header.join("") + "</ul>";

    var par = document.createElement("div");
    var $nodeOpenedContent = $(par);
    par.setAttribute('id','nodeOpenedContent');
    par.setAttribute('title', this.label);
    par.innerHTML = '<div id="nodeOpenedContentTabs">' + str_header + str_content + '</div>';


//    var $nodeOpenedContent = $('<div id="nodeOpenedContent" title="' + this.label + '"><div id="nodeOpenedContentTabs">' + str_header + str_content + '</div></div>');

    var $nodeOpenedContentChildren = $nodeOpenedContent.children().detach();
    $nodeOpenedContent.css('overflow', 'hidden');
    Graph.canvas.parent().append($nodeOpenedContent);

    $nodeOpenedContent.dialog({
        position: {my: "left", at: "right top", of: window},
        height: $(window).height()-50,
        width: Graph.vis_nodeOpenedContent.width,
        show: "drop",
        closeOnEscape: false,
        create: function(event) {
            $(event.target).parent().css('position', 'fixed');
        },
        beforeClose: function(event, ui) {
            $('.node-open.opened').each(function(index) {
                var node = Graph.getNode($(this).parent()[0].getAttribute('uri'));
//                $(this).find('img').attr('src', "img/document-properties-deactivated.png");
                node.vis_closeNode();
            });
            return false;
        },
        resizeStart: function(event) {
            $(event.target).parent().css('position', 'fixed');
        },
        resizeStop: function(event) {
            $(event.target).parent().css('position', 'fixed');
            $("#nodeOpenedContentTabs").tabs("option", "heightStyle", "fill");
            Graph.vis_nodeOpenedContent.height = $('#nodeOpenedContent').dialog("option", "height");
            Graph.vis_nodeOpenedContent.width = $('#nodeOpenedContent').dialog("option", "width");
        }
    }).attr('resourceUri', this.resource_id);
    $nodeOpenedContent.append($nodeOpenedContentChildren);


    var conncollapse = $('.conncollapse').next("ul");
    conncollapse.css('display','none');
    conncollapse.next("ul").css('display','none');
    var nodeOpenedContentTabs = $("#nodeOpenedContentTabs");
    nodeOpenedContentTabs.tabs({
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



    $('div#nodeOpenedContent').parent().addClass('opacityItem').addClass('nodeDetailsDialog');
//    $next.slideToggle("medium");
//    $('.conncollapse').find('.conncollapsetoggle').empty().append('+');

    addInspectorHandlers();
    if (callback)
        callback();
};


Node.prototype.vis_repaintConnections = function() {
    var length = this.connections.length;
    var self = this;

    var connection, target;
    var $res = $(".resourceNodeBox");
    var lookup = [];
    var uri;
    $res.each( function()
        {
            lookup[this.getAttribute('uri')] = true;
        }
    );
    for (var i = 0; i < length; i++) {
        connection = this.connections[i];
        target = decodeURIComponent(connection.target);
        if (lookup[target] !== undefined) {
            var localsource = self.resource_id;
            var localtarget = target;
            if (connection.direction == 'in') {
                localsource = target;
                localtarget = self.resource_id;
            }
            vis_jsPlumbInstance_connect_uri(localsource, localtarget, connection);
        }
    }
    /*
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
    */
    // console.timeEnd('a');
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
        location: Profile.connectionLabelLocation,
        id: "label"
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

//prevent link opening with CTRL
    Graph.canvas[0].onclick = function(event) {
        if (event.ctrlKey || event.altKey || Graph.zoomRatio < 0.701)
        {
            event.preventDefault();
            if ($(event.target).is('.fancybox')) fancyBoxOpen = false;
            return;
        }
        else
            fancyBoxOpen = true;
    }

    /** Pan **/
    Graph.canvas[0].onmousedown = function(event) {
        jsPlumbInstance.setSuspendDrawing(true);
        mouseDown = true;
//        console.log(event.target)
        // if node connection label is dragged
        var event_target = $(event.target);
        if (event_target.is('.connectionBox.label *, .connectionBox.label')) {
            return false;
        }
        // if node endpoint is dragged
        if (event_target.is('rect *, rect')) {
            return false;
        }
        // if node source endpoint is dragged
        if (event_target.is('circle *, circle')) {
            return false;
        }
//        if node is dragged
        if (event_target.is('.resourceNodeBox, .resourceNodeBox *'))
        {
            var tmp_node;
            if (event_target.is('.resourceNodeBox *')) tmp_node = event_target.closest('.resourceNodeBox');
            else tmp_node = event_target;
            var tmp_uri = tmp_node[0].getAttribute('uri');
            var node = Graph.getNode(tmp_uri);
            selectedIsHighlighted = tmp_node.find('.node-highlight').hasClass('opened');
            mousePositionLeft = event.pageX;
            mousePositionTop = event.pageY;
            selectedID = node.resource_id;
            return false;
        }
        if (event.ctrlKey || event.altKey)
        {
            $(this).append('<div class="selection-box" top=' + event.pageX + "px " +
                "left=" + event.pageY + 'px width = "0px" height = "0px" />');
            selectionOriginalLeft = event.pageX;
            selectionOriginalTop = event.pageY;
            rectangleSelection = true;
            return false;
        }
        $(this)
                .data('down', true)
                .data('x', event.pageX)
                .data('y', event.pageY);
        mousePositionLeft = event.pageX;
        mousePositionTop = event.pageY;
        //console.log("DWNPOS: " + $(this).data('x') + ' ' + $(this).data('y'));
        return false;
    };

    Graph.canvas[0].onmousemove = function(event) {
        //source http://jsbin.com/ireqix/226
//        if (event.ctrlKey) return;
        if (rectangleSelection) {
            selectionWidth = Math.abs(selectionOriginalLeft - event.pageX);
            selectionHeight = Math.abs(selectionOriginalTop - event.pageY);

            selectionLeft = (selectionOriginalLeft < event.pageX) ? (event.pageX - selectionWidth) : event.pageX;
            selectionTop = (selectionOriginalTop < event.pageY) ? (event.pageY - selectionHeight) : event.pageY;

            $('.selection-box').css({
                'width': selectionWidth,
                'height': selectionHeight,
                'top': selectionTop,
                'left': selectionLeft
            });
        }
        else
        {
//            jsPlumbInstance.setSuspendDrawing(false,true);
//            setTimeout(repaintNodes, 1000);
            if (mouseDown && selectedIsHighlighted && $(event.target).is('.resourceNodeBox, .resourceNodeBox *')) {

                moveNodesExcept(event, selectedID, false);
//                repaintNodes();
            }
        }
    }

    Graph.canvas[0].onmouseup = function(event) {
        mouseDown = false;
        jsPlumbInstance.setSuspendDrawing(false,false);
        if (rectangleSelection) {
            var w = Profile.nodeWidth * Graph.zoomRatio / 2;
            var h = Profile.nodeWidth * Graph.zoomRatio / 2;
            $('.resourceNodeBox').each(function() {
                var vis_node = $(this);
                var position = vis_node.position();
                if (position['left'] + w > selectionLeft &&
                    position['top'] + h > selectionTop &&
                    position['left'] + w < selectionLeft + selectionWidth &&
                    position['top'] + h < selectionTop + selectionHeight)
                {
                    var resource_id = this.getAttribute('uri');
                    if (Graph.getNode(resource_id).type !== Profile.unloadedNodeType) {
                        if (vis_node.find('.node-highlight').hasClass('opened')) {
                            if (event.altKey) {
                                Graph.removeHighlight(vis_node);
                            }
                        }
                        else {
                            if (event.ctrlKey) {
                                Graph.highlight(vis_node, 2);
                            }
                        }
                    }
                }
            });
            $('.selection-box').remove();
            rectangleSelection = false;
        }
//        if (event.ctrlKey || event.altKey) {
//            repaintNodes();
//            return;
//        }
        var $canvas = $(this);
        if ($canvas.data('down') === true) {
            $canvas.data('down', false);
            moveNodes(event);
            repaintNodes();
//            return false;
        }
        if ($(event.target).is('.resourceNodeBox, .resourceNodeBox *') && selectedIsHighlighted) {
            moveNodesExcept(event, selectedID, true);
//            repaintNodes();
        }
//        updateModelPosition($canvas.data('x'), $canvas.data('y'), event.pageX, event.pageY);

//        repaintNodes();
        return false;

    };
    /* zoom */
    Graph.canvas.bind('mousewheel', function(event, delta) {
//        console.log(delta);
        if (delta > 0)
        {
            Graph.zoomRatio += 0.1000 * delta;
        }
        else
        {
            if (Graph.zoomRatio > 0.4001 - delta / 10) Graph.zoomRatio += 0.0500 * delta;
            else if (Graph.zoomRatio > 0.1501) Graph.zoomRatio -= 0.0500; //Graph.zoomRatio > 0.4001
            else return false;
        }
        Graph.zoomRatio = Math.min(2.0, Graph.zoomRatio);
        zoom(Graph.zoomRatio, event.pageX, event.pageY);


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
