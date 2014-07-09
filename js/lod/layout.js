/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2014 Attila Gyorok, Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

/**
 * Changes the graphs layout.
 */
function applyLayout() {
    var sorted_nodes = [];
    var index;
    for (index in Graph.nodes)
    {
        sorted_nodes.push(Graph.nodes[index]);
    }
    
    var node, minleft = sorted_nodes[0].left, mintop = sorted_nodes[0].top;

    for (index in sorted_nodes)
    {
        node = sorted_nodes[index];
        if (node.left < minleft) minleft =node.left;
        if (node.top < mintop) mintop = node.top;
    }
    sorted_nodes.sort( function(a,b) {
        if (a.inconn < b.inconn) return -1;
        if (a.outconn < b.outconn) return -1;
        return 1;
    });
    //nxn matrix
    var n = Math.sqrt(sorted_nodes.length);
    n = Math.ceil(n * 10) / 10;
    var x = 0, y = 0;
    var act;
    for (index in sorted_nodes)
    {
        act = Graph.nodes[sorted_nodes[index].resource_id];
        act.left = x * 200 + minleft;
        act.top = y * 200 + mintop;
        x++;
        if (x > n)
        {
            x = 0;
            y++;
        }
    }
    animateMovement("slow");
    console.log("layout finished");
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
                jsPlumbInstance.repaint(act);
            }, complete: function() {
                jsPlumbInstance.repaint(act);
            }
        });
    });
}
