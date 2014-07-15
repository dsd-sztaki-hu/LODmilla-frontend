/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2014 Attila Gyorok, Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

var LayoutEnum = {
    GRID : "Grid",
    SPRING : "Spring"
}

function applyLayout(layoutType)
{
    var buffer = new Buffer();
    var name = layoutType;
    var useVirtual = document.getElementById('layoutCheckBox').checked;
    var weight = 1;
    var virtualWeight = 1;
    initLayout(name, buffer, useVirtual, weight, virtualWeight);
    switch(layoutType)
    {
        case LayoutEnum.GRID:
            gridLayout();
            break;
        case LayoutEnum.SPRING:
            springLayout(buffer, 10000, 100, 150, 3, 1, 100000);
            break;
        default :
            console.log("Wrong layout type.");
    }
    finishLayout(name);
}

//TODO undo function

function initLayout(name, buffer, useVirtual, weight, virtualWeight)
{
    console.time("Loading nodes to buffer");
    //loading nodes to buffer
    for (var index in Graph.nodes)
    {
        var act = Graph.nodes[index];
        buffer.addVertex(act.resource_id, act.label, weight, false, act.left, act.top);
    }
    console.timeEnd("Loading nodes to buffer");
    console.time("Loading edges to buffer");
    //loading edges to buffer
    var conns = jsPlumbInstance.getAllConnections();
    $.each(conns, function() {
        var source = $(this.source).attr('uri');
        var target = $(this.target).attr('uri');
        buffer.addConnection(source, target);
    });
    console.timeEnd("Loading edges to buffer");
    if (useVirtual) {
        console.time("Loading virtual nodes to buffer");
        addVirtualNodes(buffer, virtualWeight);
        console.timeEnd("Loading virtual nodes to buffer");
    }

    console.time(name + " layout");
}

function finishLayout(name)
{
    console.timeEnd(name + " layout");
    console.time("Animate");
    animateMovementIterative("slow",1);
    console.timeEnd("Animate");
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
