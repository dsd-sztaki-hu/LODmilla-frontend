/**
 * Created by Attila Gyorok on 2014.07.14..
 */

/**
 * Places the nodes on a grid structure.
 */
function gridLayout() {
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
    console.log("Grid layout finished");
}