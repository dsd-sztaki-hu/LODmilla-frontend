/**
 * Created by Attila Gyorok on 2014.07.29..
 */

var resetDrawingCounter = 0, blockResetDrawing = false;

function repaintNodes()
{
    jsPlumbInstance.repaintEverything();
//    $('.resourceNodeBox').each(function() {
//        jsPlumbInstance.repaint(this);
//    });
}

function moveNodes(event)
{
    var xoffset = mousePositionLeft - event.pageX;
    var yoffset = mousePositionTop - event.pageY;

    $('.resourceNodeBox').each(function() {
        var vis_node = $(this);
        var position = vis_node.position();
        var node = Graph.getNode(this.getAttribute('uri'));

        node.left = node.left - xoffset / Graph.zoomRatio;
        node.top = node.top - yoffset / Graph.zoomRatio;

        vis_node.css('left', position['left'] - xoffset);
        vis_node.css('top', position['top'] - yoffset);
    });
    mousePositionLeft = event.pageX;
    mousePositionTop = event.pageY;
}

function moveNodesExcept(event, selected)
{
    var xoffset = mousePositionLeft - event.pageX;
    var yoffset = mousePositionTop - event.pageY;

    $('.resourceNodeBox').each(function() {
        var vis_node = $(this);

        if (!vis_node.find('.node-highlight').hasClass('opened')) return;
        var position = vis_node.position();
        var node = Graph.getNode(this.getAttribute('uri'));

        if (node.resource_id == selected) {
            node.left = node.left - xoffset / Graph.zoomRatio;
            node.top = node.top - yoffset / Graph.zoomRatio;
        }
        else
        {
            node.left = node.left - xoffset / Graph.zoomRatio;
            node.top = node.top - yoffset / Graph.zoomRatio;
            vis_node.css('left', position['left'] - xoffset);
            vis_node.css('top', position['top'] - yoffset);
        }
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
        setTimeout(checkDrawing, 500);
    }
}

function decideZoom(ratio, x, y)
{
    resetDrawingCounter++;
//    var $graph = $("#graph");
//    $graph.css('transform-origin',x+'px'+y+'px').css('zoom',ratio);

    var maxx = 0, maxy = 0,
        minx = Profile.graphSize + 1, miny = Profile.graphSize + 1;
    $('.resourceNodeBox').each(function() {
        var vis_node = $(this);
        var p = vis_node.position();
        var tx = p['left'], ty = p['top'];
        if (tx < minx) minx = tx;
        else if (tx > maxx) maxx = tx;
        if (ty < miny) miny = ty;
        else if (ty > maxy) maxy = ty;
    });
//    var ax = (maxx + minx) / 2, ay = (maxy + miny) / 2;
    var ax = $(document).scrollLeft() + window.screen.width/ 2,
        ay = $(document).scrollTop() + window.screen.height / 2;
    if (ratio > 0.699) zoomNormal(ax, ay);
    else if (ratio > 0.2) zoomLabel(ax, ay);
    resetDrawingCounter--;
}

function checkDrawing()
{
    if (resetDrawingCounter == 0) {
        jsPlumbInstance.setSuspendDrawing(false, true);
        blockResetDrawing = false;
    }
    if (resetDrawingCounter > 0) setTimeout(checkDrawing, 500);
}

function zoomNormal(x, y)
{
    console.log('normal: ' + Graph.zoomRatio);
    $('.resourceNodeBox').each(function() {
        var vis_node = $(this);
        var position = vis_node.position();
        var node = Graph.getNode(this.getAttribute('uri'));
        vis_node.css('left', x + (node.left - x) * Graph.zoomRatio);
        vis_node.css('top', y  + (node.top - y) * Graph.zoomRatio);
//        vis_node.css('left', $(document).scrollLeft() + x + (node.left - $(document).scrollLeft() - x) * Graph.zoomRatio);
//        vis_node.css('top', $(document).scrollTop() + y  + (node.top - $(document).scrollTop() - y) * Graph.zoomRatio);
//            if (Graph.zoomRatio <= 1.0) {
        vis_node.css('width', node.width * Graph.zoomRatio);
        vis_node.css('height', node.height * Graph.zoomRatio);
        vis_node.find('.nodeImage img').css('visibility', 'visible').css('max-height', 75 * Graph.zoomRatio - 36); //perfect
        vis_node.find('.resourceLabel').css('font-size', '12px');
        vis_node.find('.endpointLink').css('visibility', 'visible');
        vis_node.find('.node-button.node-highlight').css('visibility', 'visible');
        vis_node.find('.node-button.node-delete').css('visibility', 'visible');
        vis_node.find('.node-button.node-open').css('visibility', 'visible');
        vis_node.find('.node-button.node-hide').css('visibility', 'visible');
        vis_node.find('.node-connection-source').css('visibility', 'visible');
        vis_node.find('.resourceLabel').css('position', 'relative').css('top','0px')
            .css('max-height','30px');
        vis_node.css('padding', '0.5em').css('padding-top', '2em').css('padding-bottom', '1.5em');
//            vis_node.find('.resourceLabel').css('max-height', 30 * Graph.zoomRatio);
//            var img2 = this.find('.nodeImage img');

//            }
//            jsPlumbInstance.animate(this, {'top': node.top + 'px', 'left': node.left + 'px'});
        $('.label').css('visibility','visible');
    });
    repaintNodes();
}

function zoomLabel(x, y)
{
    console.log('tiny: ' + Graph.zoomRatio);
    $('.resourceNodeBox').each(function() {
        var vis_node = $(this);
        var node = Graph.getNode(this.getAttribute('uri'));
        vis_node.css('left', x + (node.left - x) * Graph.zoomRatio);
        vis_node.css('top', y  + (node.top - y) * Graph.zoomRatio);
        vis_node.css('width', node.width * Graph.zoomRatio);
        vis_node.css('height', node.height * Graph.zoomRatio);
        vis_node.css('padding', '5px');
        vis_node.find('.nodeImage img');
        vis_node.find('.endpointLink').css('visibility', 'hidden');
        vis_node.find('.node-button.node-highlight').css('visibility', 'hidden');
        vis_node.find('.node-button.node-delete').css('visibility', 'hidden');
        vis_node.find('.node-button.node-open').css('visibility', 'hidden');
        vis_node.find('.node-button.node-hide').css('visibility', 'hidden');
        vis_node.find('.node-connection-source').css('visibility', 'hidden');
        vis_node.find('.resourceLabel').css('position', 'absolute').css('top', '10%')
            .css('max-height','90%').css('font-size', '9px');
        vis_node.find('.nodeImage img').css('visibility', 'hidden');
    });
    $('.label').css('visibility','hidden');
    repaintNodes();
}