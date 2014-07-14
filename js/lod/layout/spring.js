/**
 * Created by Attila Gyorok on 2014.07.14..
 */

function springLayout(steps, dist, ka1, ka2, kr, weight, virtualWeight, useVirtual) {
    var i,j;
    var buffer = new Buffer();
    //loading nodes to buffer
    for (var index in Graph.nodes)
    {
        var act = Graph.nodes[index];
        buffer.addVertex(act.resource_id, act.label, weight, false, act.left, act.top);
    }

    //loading edges to buffer
    var conns = jsPlumbInstance.getAllConnections();
    $.each(conns, function() {
        var source = $(this.source).attr('uri');
        var target = $(this.target).attr('uri');
        buffer.addConnection(source, target);
    });



    if (useVirtual) {
        addVirtualNodes(buffer, virtualWeight);
    }


    //calculate spring layout
    for (var i = 0; i < steps; i++) {
        calculateSpringStep(buffer, dist, ka1, ka2, kr);

        //set new positions
        for (var index in buffer.vertexes) {
            var act = buffer.vertexes[index];
            if (!act.isvVirtual) {
                var original = Graph.getNode(act.id);
                original.left += act.diffLeft;
                original.top += act.diffTop;
            }
            act.left += act.diffLeft;
            act.top += act.diffTop;
            act.diffLeft = 0;
            act.diffTop = 0;
        }
    }


    animateMovement("slow");
    console.log("Spring layout finished");
}

function calculateSpringStep(buffer, min_distance, spring_strain, spring_length, spring_gravitation)
{
    var i_length = buffer.vertexes.length - 1;
    var j_length = buffer.vertexes.length;
    var i_node, j_node;
    var d_top, d_left, F, F_left, F_top, F_i, F_j;
    var distance;
    for (i = 0; i < i_length; i++)
    {
        i_node = buffer.getVertexByIndex(i);
        for (j = i + 1; j < j_length; j++ )
        {
            j_node = buffer.getVertexByIndex(j);
            d_left = Math.abs(i_node.left - j_node.left);
            d_top = Math.abs(i_node.top - j_node.top);
            distance = Math.sqrt(d_left * d_left + d_top * d_top);
            if (distance < min_distance) distance = min_distance;
            var in_i = i_node.targets.indexOf(j) > -1;
            var in_j = j_node.targets.indexOf(i) > -1;
            if (in_i || in_j)
            {
                // pull
                F = spring_strain * Math.log(distance / spring_length);
                F_left = F * d_left / distance;
                F_top = F * d_top / distance;
                F_i = F_left / i_node.weight;
                F_j = F_left / j_node.weight;
                if (i_node.left < j_node.left)
                {
                    i_node.diffLeft += F_i;
                    j_node.diffLeft -= F_j;
                }
                else
                {
                    i_node.diffLeft -= F_i;
                    j_node.diffLeft += F_j;
                }
                F_i = F_top / i_node.weight;
                F_j = F_top / j_node.weight;
                if (i_node.top < j_node.top)
                {
                    i_node.diffTop += F_i;
                    j_node.diffTop -= F_j;
                }
                else
                {
                    i_node.diffTop -= F_i;
                    j_node.diffTop += F_j;
                }
            }
            //else
            //{
            // push
            F = spring_gravitation / (distance * distance);
            F_left = F * d_left / distance;
            F_top = F * d_top / distance;
            F_i = F_left / i_node.weight;
            F_j = F_left / j_node.weight;
            if (i_node.left < j_node.left)
            {
                i_node.diffLeft -= F_i;
                j_node.diffLeft += F_j;
            }
            else
            {
                i_node.diffLeft += F_i;
                j_node.diffLeft -= F_j;
            }
            F_i = F_top / i_node.weight;
            F_j = F_top / j_node.weight;
            //if (F_i < 0) F_i = 0;
            //if (F_j < 0) F_j = 0;
            if (i_node.top < j_node.top)
            {
                i_node.diffTop -= F_i;
                j_node.diffTop += F_j;
            }
            else
            {
                i_node.diffTop += F_i;
                j_node.diffTop -= F_j;
            }
            //}
        }
    }
}