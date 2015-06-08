/**
 * Created by Attila Gyorok on 2014.07.29..
 */

var resetDrawingCounter = 0, blockResetDrawing = false;

function repaintNodes()
{
    Helper.showLoadScreen();
    setTimeout(delayedRepaintNodes, 10);
}

function delayedRepaintNodes()
{
    var $res;
    var $node = [], $child = [], length = 0;
    var $tnode;
    var i;
    // repaintEverything() nem működik megbízhatóan automatikusan kiszámolt anchorral, tudnak a hibáról
    console.time('Repaint all');
    jsPlumbInstance.setSuspendDrawing(false, false);
    $res = $('.resourceNodeBox');
    $res.each(function() {
        $tnode = $(this);
        $node.push($tnode);
        $child.push($tnode.children().detach());
        length++;
    });

    i = 0;
    $res.each(function() {
        jsPlumbInstance.repaint(this);
    });
    for (i = 0; i < length; i++)
    {
        $node[i].append($child[i]);
    }
    jsPlumbInstance.setSuspendDrawing(false, true);
    console.timeEnd('Repaint all');
    Helper.closeLoadScreen();
}

function refreshNodeModelPosition(node, dx, dy)
{
    node.left = node.left - dx / Graph.zoomRatio;
    node.top = node.top - dy / Graph.zoomRatio;
}

function refreshNodeVisiblePosition($node, dx, dy)
{
    var position = $node.position();
    $node.css('left', position['left'] - dx);
    $node.css('top', position['top'] - dy);
}

function moveNode(event)
{
    var $node = $(this);
    if ($node.find('.node-highlight').hasClass('opened')) return;
    var node = Graph.getNode(this.getAttribute('uri'));
    refreshNodeModelPosition(node, mousePositionLeft - event.pageX, mousePositionTop - event.pageY);
}

function moveNodes(event)
{
    var dx = mousePositionLeft - event.pageX;
    var dy = mousePositionTop - event.pageY;

    $('.resourceNodeBox').each(function() {
        var $node = $(this);
        var node = Graph.getNode(this.getAttribute('uri'));
        refreshNodeModelPosition(node, dx, dy);
        refreshNodeVisiblePosition($node, dx, dy);
    });
    mousePositionLeft = event.pageX;
    mousePositionTop = event.pageY;
}

function moveNodesExcept(event, selected, repaint)
{
    var dx = mousePositionLeft - event.pageX;
    var dy = mousePositionTop - event.pageY;

    $('.resourceNodeBox').each(function() {
        var $node = $(this);
        if (!$node.find('.node-highlight').hasClass('opened')) return;
        var node = Graph.getNode(this.getAttribute('uri'));

        if (node.resource_id == selected) {
            refreshNodeModelPosition(node, dx, dy);
        }
        else
        {
            refreshNodeModelPosition(node, dx, dy);
            refreshNodeVisiblePosition($node, dx, dy);
        }
        if (repaint) jsPlumbInstance.repaint($node);
    });
    mousePositionLeft = event.pageX;
    mousePositionTop = event.pageY;
}

function zoom(ratio, x, y)
{
    if (blockResetDrawing)
        decideZoom(ratio, x, y);
    else
    {
        jsPlumbInstance.setSuspendDrawing(true);
        blockResetDrawing = true;
        decideZoom(ratio, x, y);
        setTimeout(checkDrawing, 1000);
    }
}

function decideZoom(ratio)
{
    resetDrawingCounter++;
    var cx = $(document).scrollLeft() + window.screen.width / 2,
        cy = $(document).scrollTop() + window.screen.height / 2;
    if (ratio > 0.699)
        nodeSizeToNormal();
    else
        nodeSizeToLabel();
    applyZoom(ratio, cx, cy);
    resetDrawingCounter--;
}

function checkDrawing()
{
    if (resetDrawingCounter == 0) {
        jsPlumbInstance.setSuspendDrawing(false, false);
        repaintNodes();
        blockResetDrawing = false;
    }
    if (resetDrawingCounter > 0) setTimeout(checkDrawing, 1000);
}

function applyZoom(ratio, x, y)
{
    console.log('normal: ' + ratio);
    $('.resourceNodeBox').each(function() {
        var vis_node = $(this);
        var node = Graph.getNode(this.getAttribute('uri'));
        vis_node.css('left', x + (node.left - x) * ratio);
        vis_node.css('top', y  + (node.top - y) * ratio);
        vis_node.css('width', node.width * ratio);
        vis_node.css('height', node.height * ratio);
        if (vis_node.hasClass('normalSizeNode'))
            vis_node.find('.nodeImage img').css('max-height', 75 * ratio - 36); //perfect
    });
}

function nodeSizeToNormal()
{
    $('.labelSizeNode').each(function() {
        var vis_node = $(this);

        vis_node.find('.endpointLink').css('visibility', 'visible');
        vis_node.find('.node-button').css('visibility', 'visible');
        vis_node.find('.node-connection-source').css('visibility', 'visible');
        vis_node.find('.resourceLabel').css('font-size', '12px').css('position', 'relative').css('top','0px')
            .css('max-height','30px').css('cursor','auto').unbind('click');
        vis_node.find('.nodeImage').css('visibility', 'visible');
        vis_node.css('padding', '0.5em').css('padding-top', '2em').css('padding-bottom', '1.5em');
        vis_node.removeClass('labelSizeNode');
        vis_node.addClass('normalSizeNode');
    });
    $('.label').css('visibility','visible');
}

function nodeSizeToLabel()
{
    $('.normalSizeNode').each(function() {
        var vis_node = $(this);
        vis_node.css('padding', '5px');
        var $img = vis_node.find('.nodeImage');
        $img.css('visibility', 'hidden').css('max-height','0px');
        vis_node.find('.endpointLink').css('visibility', 'hidden');
        vis_node.find('.node-button').css('visibility', 'hidden');
        vis_node.find('.node-connection-source').css('visibility', 'hidden');
        vis_node.find('.resourceLabel').css('position', 'absolute').css('top', '10%')
            .css('max-height','90%').css('font-size', '9px').css('cursor','pointer')
            .on('click', function(event) {
                if (event.ctrlKey || event.altKey) return;
                var resource_id = this.parentNode.getAttribute('uri');
                if (Graph.getNode(resource_id).type !== Profile.unloadedNodeType){
                    var node = Graph.getNode(this.parentNode.getAttribute('uri'));
                    if($(this).parent().hasClass('opened')){
                        node.vis_closeNode();
                    }
                    else{
                        node.vis_openNode();
                    }
                }
            });
        vis_node.removeClass('normalSizeNode');
        vis_node.addClass('labelSizeNode');
    });
    $('.label').css('visibility','hidden');
}

function changeActiveTab(targetTabName)
{
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
        return tabId;
    }
    return null;
}

function setInspector(targetTabName, property, target) {
    $.jStorage.set("targetTabName", targetTabName);
    $.jStorage.set("property", property);
    $.jStorage.set("target", target);
}

function resetInspector(targetTabName, property, target) {
    $.jStorage.deleteKey("targetTabName");
    $.jStorage.deleteKey("property");
    $.jStorage.deleteKey("target");
}