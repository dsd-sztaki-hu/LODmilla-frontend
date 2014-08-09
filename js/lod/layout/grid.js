/**
 * Created by Attila Gyorok on 2014.07.14..
 */

/**
 * Places the nodes on a grid structure.
 */
function gridLayout(buffer, min_distance) {
//    var sorted_nodes = [];
    var i;
    var length = buffer.vertexes.length;
    //nxn matrix
    var n = Math.sqrt(length);
    n = Math.ceil(n * 10) / 10;
    var mx = $(document).scrollLeft() + (window.screen.width - n * min_distance) / 2,
        my = $(document).scrollTop() + (window.screen.height - n * min_distance) / 2;
//    sorted_nodes = buffer.vertexes.slice();

    var act;

    var x = 0, y = 0;
    for (i = 0; i < length; i++)
    {
        act = buffer.vertexes[i];
        act.gridX = x;
        act.gridY = y;
        x++;
        if (x > n)
        {
            x = 0;
            y++;
        }
    }

    var r1, r2;
    var t1, nt1, t2, nt2;
    var tmpX, tmpY;
    for (i = 0; i < 10000; i++)
    {
        r1 = Math.floor(Math.random() * length);
        r2 = Math.floor(Math.random() * length);
        if (r1 == r2) {
            i--;
            continue;
        }
        r1 = buffer.vertexes[r1];
        r2 = buffer.vertexes[r2];
        t1 = checkCrossing(r1, r1, buffer);
        nt1 = checkCrossing(r1, r2, buffer);
        t2 = checkCrossing(r2, r2, buffer);
        nt2 = checkCrossing(r2, r1, buffer);
        if (t1 + t2 > nt1 + nt2)
        {
            //swap grid pos
            tmpX = r1.gridX;
            tmpY = r1.gridY;
            r1.gridX = r2.gridX;
            r1.gridY = r2.gridY;
            r2.gridX = tmpX;
            r2.gridY = tmpY;
        }
    }

    var node;
    for (i = 0; i < length; i++)
    {
        act = buffer.vertexes[i];
        node = Graph.nodes[act.id];
        node.left = act.gridX * min_distance * 2 + mx;
        node.top = act.gridY * min_distance * 2 + my;
    }


//    sorted_nodes.sort( function(a,b) {
//        if (a.inConnCounter + a.outConnCounter > b.inConnCounter + b.outConnCounter) return -1;
//        return 1;
//    });

//    var x = 0, y = 0;
//    var act;
//    for (index in sorted_nodes)
//    {
//        act = Graph.nodes[sorted_nodes[index].id];
//        act.left = x * 200 + mx;
//        act.top = y * 200 + my;
//        x++;
//        if (x > n)
//        {
//            x = 0;
//            y++;
//        }
//    }
}

function checkCrossing(n1, n2, buffer) {
    var x = n2.gridX;
    var y = n2.gridY;
    var dx, dy;
    var i;
    var length = n1.targets.length;
    var diff = 0;
    var act;
    for (i = 0; i < length; i++)
    {
        act = buffer.vertexes[n1.targets[i]];
        dx = act.gridX - x;
        dy = act.gridY - y;
        diff += dx * dx + dy * dy;
    }
    length = n1.sources.length;
    for (i = 0; i < length; i++)
    {
        act = buffer.vertexes[n1.sources[i]];
        dx = act.gridX - x;
        dy = act.gridY - y;
        diff += dx * dx + dy * dy;
    }
    return diff;
}