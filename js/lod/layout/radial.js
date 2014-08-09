/**
 * Created by Attila Gyorok on 2014.08.07..
 */

function radialLayout(buffer, min_distance) {
    var unsorted_nodes = [];
    var sorting_nodes = [];
    var sorted_nodes = [];
    var tmp_nodes = [];
    var index, act;
    var i, j, k;
//    var distance = Math.sqrt(2 * min_distance * min_distance);
    var distance = min_distance;
    var x = 0;
    var theta = 0;

    var parts = 1;
    var level = 0;
    var nx,ny;
    var length, length2, length3;
    var max = 0;

    length = buffer.vertexes.length;
    for (i = 0; i < length; i++)
    {
        unsorted_nodes.push(buffer.vertexes[i]);
    }
    for (i = 0; i < length; i++)
    {
        act = unsorted_nodes[i];
        tmp_max = act.inConnCounter + act.outConnCounter;
        if (tmp_max > max)
        {
            index = i;
            max = tmp_max;
        }
    }
    act = unsorted_nodes[index];
    unsorted_nodes.splice(index,1);
    sorting_nodes.push(act);
    while (unsorted_nodes.length > 0)
    {
        length = sorting_nodes.length;
        if (length == 0) {
            if (unsorted_nodes.length == 0) break;
            else {
                sorting_nodes[0] = unsorted_nodes[0];
                unsorted_nodes.splice(0,1);
                length = 1;
            }
        }

        if (sorted_nodes[level] === undefined ) sorted_nodes[level] = [];
        tmp_nodes = [];
        for (i = 0; i < length; i++)
        {
            act = sorting_nodes[i];
            length2 = act.targets.length;
            for (j = 0; j < length2; j++)
            {
                length3 = unsorted_nodes.length;
                for (k = 0; k < length3; k++)
                {
                    if (buffer.vertexes[act.targets[j]].id == unsorted_nodes[k].id)
                    {
                        tmp_nodes.push(unsorted_nodes[k]);
                        unsorted_nodes.splice(k,1);
                        k--;
                        length3--;
                    }
                }
            }
            length2 = act.sources.length;
            for (j = 0; j < length2; j++)
            {
                length3 = unsorted_nodes.length;
                for (k = 0; k < length3; k++)
                {
                    if (buffer.vertexes[act.sources[j]].id == unsorted_nodes[k].id)
                    {
                        tmp_nodes.push(unsorted_nodes[k]);
                        unsorted_nodes.splice(k,1);
                        k--;
                        length3--;
                    }
                }
            }
        }
        //move sorting to sorted and tmp to sorting

        sorted_nodes[level] = sorting_nodes.slice();
        sorting_nodes = tmp_nodes.slice();
        level++;
    }
    if (sorting_nodes.length > 0)
        sorted_nodes[level] = sorting_nodes.slice();
//    sorted_nodes.sort( function(a,b) {
//        if (a.inConnCounter + a.outConnCounter > b.inConnCounter + b.outConnCounter) return -1;
//        return 1;
//    });
    var cx = $(document).scrollLeft() + window.screen.width / 2,
        cy = $(document).scrollTop() + window.screen.height / 2;

    act = Graph.nodes[sorted_nodes[0][0].id];
    act.left = cx;
    act.top = cy;
    var PI2 = 2 * Math.PI;
    var db;
//    var r0;
    var slices = 1;
    var dist_norm = distance;
    r = distance * 1.25;
    level = sorted_nodes.length;
    for (i = 1; i < level; i++) {
        length = sorted_nodes[i].length;
//        r = distance * length / PI2;
//        if (r < r0) r = r0 + distance;
        parts = PI2 * r / dist_norm;
        if (length < parts)
            slices = length;
        else
            slices = parts;
        x = 0;
        db = parts;
        for (index = 0; index < length; index++) {
            if (index > db) {
                r += distance;
                parts = PI2 * r / dist_norm;
                db += parts;
                x = 0;
                if (length - index < parts)
                    slices = length - index;
                else
                    slices = parts;
                theta = x / slices * PI2;
            }
            act = Graph.nodes[sorted_nodes[i][index].id];
            nx = r * Math.cos(theta) + cx;
            ny = r * Math.sin(theta) + cy;
            act.left = nx;
            act.top = ny;
            x++;
            theta = x / slices * PI2;
        }
        r += distance * 1.25;
//        r0 = r;
    }
}