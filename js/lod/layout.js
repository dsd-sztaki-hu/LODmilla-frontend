/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2014 Attila Gyorok, Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

function applyGridLayout() {
    gridLayout(document.getElementById('layoutCheckBox').checked);
}

function applySpringLayout() {
    springLayout(20000, 100, 1, 1, 200000, 1, 1, document.getElementById('layoutCheckBox').checked);
}


//TODO undo function


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
