/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2014 Attila Gyorok, Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

function applyLayout(layoutType, repaint)
{
    var buffer = new Buffer();
    var name = layoutType;
    var useVirtual = document.getElementById('layoutGroupCheckBox').checked;
    var maxSpringTime = $('#layoutSpringSlider').slider("option", "value");
    var weight = 1;
    var virtualWeight = 1;
    initLayout(name, buffer, useVirtual, weight, virtualWeight);
    switch(layoutType)
    {
        case Graph.LayoutEnum.GRID:
            gridLayout(buffer, 100);
            Graph.layout = Graph.LayoutEnum.GRID;
            break;
        case Graph.LayoutEnum.RADIAL:
            radialLayout(buffer, 200);
            Graph.layout = Graph.LayoutEnum.RADIAL;
            break;
        case Graph.LayoutEnum.SPRING:
            springLayout(buffer, 10000, maxSpringTime * 1000, 100, 100, 1, 1, 10000);
            Graph.layout = Graph.LayoutEnum.SPRING;
            break;
        default :
            console.log("Wrong layout type.");
    }
    finishLayout(name, repaint);
}

//TODO undo function

function initLayout(name, buffer, useVirtual, weight, virtualWeight)
{
    Helper.openFancybox();
    console.time("Loading nodes to buffer");
    //loading nodes to buffer
    for (var index in Graph.nodes)
    {
        var act = Graph.nodes[index];
        buffer.addVertex(act.resource_id, act.label, act.weight, false, act.left, act.top, act.type);
    }
    console.timeEnd("Loading nodes to buffer");
    console.time("Loading edges to buffer");
    //loading edges to buffer
    var conns = jsPlumbInstance.getAllConnections();
    $.each(conns, function(conn_id, l_conn) {
        var source = $(this.source).attr('uri');
        var target = $(this.target).attr('uri');
        $.each(l_conn.getOverlays(), function(overlay_id, overlay) {
            if (overlay.type === 'Label') {
                buffer.addConnection(source, target, overlay.getLabel());
            }
        });
    });

    console.timeEnd("Loading edges to buffer");
    if (useVirtual) {
        console.time("Loading virtual nodes to buffer");
        addVirtualTypeNodes(buffer, virtualWeight);
//        addVirtualNodes(buffer, virtualWeight);
        console.timeEnd("Loading virtual nodes to buffer");
    }
    buffer.createNeighboursMap();
    buffer.createConnectionMap();
    console.time(name + " layout");
}

function finishLayout(name, repaint)
{
    console.timeEnd(name + " layout");
    updateNewPosition();
    decideZoom(Graph.zoomRatio);
    if (repaint) repaintNodes();
    Helper.closeFancybox();
}

function updateNewPosition()
{
//    jsPlumbInstance.setSuspendDrawing(true); no effect
    $('.resourceNodeBox').each(function() {
        var $node = $(this);
        var node = Graph.getNode(this.getAttribute('uri'));
        $node.css('left', node.left);
        $node.css('top', node.top);
    });
//    jsPlumbInstance.setSuspendDrawing(false, false);

//
}

/**
 * Moves the nodes to their new position with animation. With each step only a part of the movement is animated.
 * @param duration The duration of the animation time. e.g.: "slow"
 * @param steps Splits the whole animation to this amount of steps.
 */
function animateMovementIterative(duration, steps)
{
    $('.resourceNodeBox').each(function() {
        var node = Graph.getNode(this.getAttribute('uri'));
        var act = $(this);
        var position = act.position();
        var ntop = 0, nleft = 0;
        var s1 = steps + 1;
        for (var i = 1; i < s1; i++) {
            ntop = (node.top - position.top) / steps * i + position.top;
            nleft = (node.left - position.left) / steps * i + position.left;
            act.animate({'top': ntop + 'px', 'left': nleft + 'px'}, duration,
                function () {
                    jsPlumbInstance.repaint(act);
                });
        }
    });
}

/**
 * Moves the nodes to their new position with animation.
 * @param duration The duration of the animation time. e.g.: "slow"
 */
function animateMovement(duration)
{
    $('.resourceNodeBox').each(function() {
        var node = Graph.getNode(this.getAttribute('uri'));
        var act = $(this);
        act.animate({'top': node.top + 'px', 'left': node.left + 'px'}, {duration: duration,
            step: function() {
                //$(this).prototype.vis_repaintConnections();
                jsPlumbInstance.repaint(act);
            }, complete: function() {
                jsPlumbInstance.repaint(act);
            }
        });
    });
}
