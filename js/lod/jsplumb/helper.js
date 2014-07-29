/**
 * Created by Attila Gyorok on 2014.07.29..
 */

var resetDrawing = 0;

function repaintNodes()
{
    jsPlumbInstance.repaintEverything();
//    $('.resourceNodeBox').each(function() {
//        jsPlumbInstance.repaint(this);
//    });
}

function moveNodesExcept(event)
{
    var xoffset = mousePositionLeft - event.pageX;
    var yoffset = mousePositionTop - event.pageY;

    $('.resourceNodeBox').each(function() {
        var vis_node = $(this);

        if (!vis_node.find('.node-highlight').hasClass('opened')) return;
        var position = vis_node.position();
        var node = Graph.getNode(this.getAttribute('uri'));
        if (node.resource_id == selectedID)
        {
            return;
        }
        node.top = position['top'] - yoffset;
        node.left = position['left'] - xoffset;

        vis_node.css('left', node.left);
        vis_node.css('top', node.top);
//                $(this).animate({'top': node.top + 'px', 'left': node.left + 'px'}, 0, function() {
//                    jsPlumbInstance.repaint($(this));
//                });
    });
    mousePositionLeft = event.pageX;
    mousePositionTop = event.pageY;
//    repaintNodes();
}

function zoom(ratio)
{
    jsPlumbInstance.setSuspendDrawing(true);
    resetDrawing++;
    if (ratio > 0.699) zoomNormal();
    else if (ratio > 0.499) zoomSmall();
    else if (ratio > -0.001) zoomLabel();
    resetDrawing--;
    setTimeout(checkDrawing, 1000);
}

function checkDrawing()
{
    if (resetDrawing == 0)
    jsPlumbInstance.setSuspendDrawing(false,true);
}

function zoomNormal()
{
    console.log('normal: ' + Graph.zoomRatio);
    $('.resourceNodeBox').each(function() {
        var vis_node = $(this);
        var position = vis_node.position();
        var node = Graph.getNode(this.getAttribute('uri'));
        vis_node.css('left', $(document).scrollLeft() + event.clientX + (node.left - $(document).scrollLeft() - event.clientX) * Graph.zoomRatio);
        vis_node.css('top', $(document).scrollTop() + event.clientY  + (node.top - $(document).scrollTop() - event.clientY) * Graph.zoomRatio);
//            if (Graph.zoomRatio <= 1.0) {
        vis_node.css('width', node.width * Graph.zoomRatio);
        vis_node.css('height', node.height * Graph.zoomRatio);
        vis_node.find('.nodeImage img').css('visibility', 'visible').css('max-height', 75 * Graph.zoomRatio - 36); //perfect
//            vis_node.find('.resourceLabel').css('max-height', 30 * Graph.zoomRatio);
//            var img2 = this.find('.nodeImage img');

//            }
//            jsPlumbInstance.animate(this, {'top': node.top + 'px', 'left': node.left + 'px'});
    });
    repaintNodes();
}

function zoomSmall()
{
    console.log('small: ' + Graph.zoomRatio);
    $('.resourceNodeBox').each(function() {
        var vis_node = $(this);
        var node = Graph.getNode(this.getAttribute('uri'));
        vis_node.css('left', $(document).scrollLeft() + event.clientX + (node.left - $(document).scrollLeft() - event.clientX) * 0.7000);
        vis_node.css('top', $(document).scrollTop() + event.clientY  + (node.top - $(document).scrollTop() - event.clientY) * Graph.zoomRatio);
        vis_node.css('width', node.width * 0.7000);
        vis_node.css('height', node.height * Graph.zoomRatio);
        vis_node.css('padding', '0.5em').css('padding-top', '2em').css('padding-bottom', '1.5em');
        vis_node.find('.nodeImage img').css('visibility', 'hidden');
        vis_node.find('.endpointLink').css('visibility', 'visible');
        vis_node.find('.node-button.node-highlight').css('visibility', 'visible');
        vis_node.find('.node-button.node-delete').css('visibility', 'visible');
        vis_node.find('.node-button.node-open').css('visibility', 'visible');
        vis_node.find('.node-button.node-hide').css('visibility', 'visible');
        vis_node.find('.node-connection-source').css('visibility', 'visible');
        vis_node.find('.resourceLabel').css('position', 'relative').css('top','0px').css('max-height','30px');
    });
    repaintNodes();
}

function zoomLabel()
{
    console.log('tiny: ' + Graph.zoomRatio);
    $('.resourceNodeBox').each(function() {
        var vis_node = $(this);
        var node = Graph.getNode(this.getAttribute('uri'));
        vis_node.css('left', $(document).scrollLeft() + event.clientX + (node.left - $(document).scrollLeft() - event.clientX) * 0.7000);
        vis_node.css('top', $(document).scrollTop() + event.clientY  + (node.top - $(document).scrollTop() - event.clientY) * Graph.zoomRatio);
        vis_node.css('width', node.width * 0.7000);
        vis_node.css('height', node.height * Graph.zoomRatio);
        vis_node.css('padding', '5px');
        vis_node.find('.nodeImage img');
        vis_node.find('.endpointLink').css('visibility', 'hidden');
        vis_node.find('.node-button.node-highlight').css('visibility', 'hidden');
        vis_node.find('.node-button.node-delete').css('visibility', 'hidden');
        vis_node.find('.node-button.node-open').css('visibility', 'hidden');
        vis_node.find('.node-button.node-hide').css('visibility', 'hidden');
        vis_node.find('.node-connection-source').css('visibility', 'hidden');
        vis_node.find('.resourceLabel').css('position', 'absolute').css('top','10%').css('max-height','90%');
    });
    repaintNodes();
}