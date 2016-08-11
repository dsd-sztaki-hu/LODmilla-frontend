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
        if (act.isVirtual) continue;
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

    //setbufferpos
    var original;
    for (var index in buffer.vertexes) {
        var act = buffer.vertexes[index];
        if (act.isVirtual == false) {
            original = Graph.getNode(act.id);
            act.left = original.left;
            act.top = original.top;
        }
    }
}

function gridLayoutGroup(buffer, min_distance)
{
    var i,j ;
    var length = buffer.groups.length;
    var gl, gx, gy, maxgl = 0, actg;
    //nxn matrix
    var n = Math.sqrt(length);
    n = Math.ceil(n * 10) / 10;

    for (i = 0; i < length; i++)
    {
        act = buffer.groups[i];
        gl = act.vertexes.length;
        if (gl > maxgl) maxgl = gl;
    }

    var ng = Math.sqrt(maxgl);
    ng = Math.ceil(ng * 10) / 10;
    var mx = $(document).scrollLeft() + (window.screen.width - n * ng * min_distance) / 2,
        my = $(document).scrollTop() + (window.screen.height - n * ng * min_distance) / 2;
    var act;

    var x = 0, y = 0;
    for (i = 0; i < length; i++)
    {
        act = buffer.groups[i];
        act.gridX = x;
        act.gridY = y;
        x++;
        if (x > n)
        {
            x = 0;
            y++;
        }
    }

    var r1, r2, r1g, r2g;
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
        r1g = buffer.groups[r1];
        r2g = buffer.groups[r2];
        t1 = checkCrossingGroup(r1g, r1g, buffer, r1);
        nt1 = checkCrossingGroup(r1g, r2g, buffer, r1);
        t2 = checkCrossingGroup(r2g, r2g, buffer, r2);
        nt2 = checkCrossingGroup(r2g, r1g, buffer, r2);
        if (t1 + t2 > nt1 + nt2)
        {
            //swap grid pos
            tmpX = r1g.gridX;
            tmpY = r1g.gridY;
            r1g.gridX = r2g.gridX;
            r1g.gridY = r2g.gridY;
            r2g.gridX = tmpX;
            r2g.gridY = tmpY;
        }
    }

    var node;
    var gs;
    for (i = 0; i < length; i++)
    {
        actg = buffer.groups[i];
        gl = actg.vertexes.length;
        gs = Math.sqrt(gl);
        gs = Math.ceil(gs * 10) / 10;
        x = 0;
        y = 0;
        for (j = 0; j < gl; j++)
        {
            act = actg.vertexes[j];
            if (act.isVirtual) continue;
            node = Graph.nodes[act.id];
            node.left = (actg.gridX * (ng + 1) + x)* min_distance * 2 + mx;
            node.top = (actg.gridY * (ng + 1) + y) * min_distance * 2 + my;
            x++;
            if (x > gs)
            {
                x = 0;
                y++;
            }
        }
    }

    //setbufferpos
    var original;
    for (var index in buffer.vertexes) {
        var act = buffer.vertexes[index];
        if (act.isVirtual == false) {
            original = Graph.getNode(act.id);
            act.left = original.left;
            act.top = original.top;
        }
    }
}

function gridLayoutGroupAdaptive(buffer, min_distance)
{
    var i,j ;
    var length = buffer.groups.length;
    var gl, gx, gy, maxgl = 0, actg;
    var rng = CustomRandom(23);
    //nxn matrix
    var n = Math.sqrt(length);
    var nx = Math.ceil(n);
    var ny = Math.floor(n);
    if (nx * ny < length) ny++;

    for (i = 0; i < length; i++)
    {
        act = buffer.groups[i];
        gl = act.vertexes.length;
        if (gl > maxgl) maxgl = gl;
    }

    var ng = Math.sqrt(maxgl);
    var ngx = Math.ceil(ng);
    var ngy = Math.floor(ng);
    if (ngx * ngy < ng) ngy++;

    var act;

    var x = 0, y = 0;
    for (i = 0; i < length; i++)
    {
        act = buffer.groups[i];
        act.gridX = x;
        act.gridY = y;
        x++;
        if (x >= nx)
        {
            x = 0;
            y++;
        }
    }

    var r1, r2, r1g, r2g;
    var t1, nt1, t2, nt2;
    var tmpX, tmpY;
    for (i = 0; i < 10000; i++)
    {
        r1 = Math.floor(rng.next() * length);
        r2 = Math.floor(rng.next() * length);
        if (r1 == r2) {
            i--;
            continue;
        }
        r1g = buffer.groups[r1];
        r2g = buffer.groups[r2];
        t1 = checkCrossingGroup(r1g, r1g, buffer, r1);
        nt1 = checkCrossingGroup(r1g, r2g, buffer, r1);
        t2 = checkCrossingGroup(r2g, r2g, buffer, r2);
        nt2 = checkCrossingGroup(r2g, r1g, buffer, r2);
        if (t1 + t2 > nt1 + nt2)
        {
            //swap grid pos
            tmpX = r1g.gridX;
            tmpY = r1g.gridY;
            r1g.gridX = r2g.gridX;
            r1g.gridY = r2g.gridY;
            r2g.gridX = tmpX;
            r2g.gridY = tmpY;
        }
    }

    var maxX = [nx];
    var maxY = [ny];
    for (i = 0; i < nx; i++)
    {
        maxX[i] = 0;
    }
    for (i = 0; i < ny; i++)
    {
        maxY[i] = 0;
    }
    tmp = 0;
    var gsx, gsy;
    for (i = 0; i < length; i++)
    {
        actg = buffer.groups[i];
        gl = actg.vertexes.length;
        gs = Math.sqrt(gl);
        gsx = Math.ceil(gs);
        gsy = Math.floor(gs);
        if (gsx * gsy < gs) gsy++;
        if (maxX[actg.gridX] < gsx) maxX[actg.gridX] = gsx;
        if (maxY[actg.gridY] < gsy) maxY[actg.gridY] = gsy;
    }
    var diffX = [nx];
    var diffY = [ny];
    //space
    for (i = 0; i < nx; i++)
    {
        diffX[i] = maxX[i] + 0.25;
    }
    for (i = 0; i < ny; i++)
    {
        diffY[i] = maxY[i] + 0.25;
    }
    //sum
    for (i = 1; i < nx; i++)
    {
        diffX[i] += diffX[i - 1];
    }
    for (i = 1; i < ny; i++)
    {
        diffY[i] += diffY[i - 1];
    }
    var posX = [nx];
    posX[0] = 0;
    for (i = 1; i < nx; i++)
    {
        posX[i] = diffX[i - 1];
    }
    var posY = [ny];
    posY[0] = 0;
    for (i = 1; i < ny; i++)
    {
        posY[i] = diffY[i - 1];
    }
    var mx = $(document).scrollLeft() + (window.screen.width - diffX[nx-1] * min_distance) / 2, //nx*ngx
        my = $(document).scrollTop() + (window.screen.height - diffY[ny-1] * min_distance) / 2;
    var node;
    var gs;
    for (i = 0; i < length; i++)
    {
        actg = buffer.groups[i];
        gl = actg.vertexes.length;
        gs = Math.sqrt(gl);
        gsx = Math.ceil(gs);
        gsy = Math.floor(gs);
        if (gsx * gsy < gl) gsy++;
        x = 0;
        y = 0;
        for (j = 0; j < gl; j++)
        {
            act = actg.vertexes[j];
            if (act.isVirtual) continue;
            node = Graph.nodes[act.id];
            node.left = (posX[actg.gridX] + (maxX[actg.gridX] - gsx) / 2  + x) * min_distance * 2 + mx;
            node.top = (posY[actg.gridY] + (maxY[actg.gridY] - gsy) / 2 + y) * min_distance * 2 + my;
            x++;
            if (x >= gsx)
            {
                x = 0;
                y++;
            }
        }
    }

    //setbufferpos
    var original;
    for (var index in buffer.vertexes) {
        var act = buffer.vertexes[index];
        if (act.isVirtual == false) {
            original = Graph.getNode(act.id);
            act.left = original.left;
            act.top = original.top;
        }
    }
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

function checkCrossingGroup(n1, n2, buffer, index) {
    var x = n2.gridX;
    var y = n2.gridY;
    var dx, dy;
    var i;
    var length = buffer.groups.length;
    var diff = 0;
    var act;
    for (i = 0; i < length; i++)
    {
        if (buffer.groupsConnected[index][i] == 0) continue;
        act = buffer.groups[i];
        dx = act.gridX - x;
        dy = act.gridY - y;
        diff += dx * dx + dy * dy;
    }
    return diff;
}

//http://michalbe.blogspot.hu/2011/02/javascript-random-numbers-with-custom_23.html
var CustomRandom = function(nseed) {

    var seed;
    if (nseed) {
        seed = nseed;
    }

    if (seed == null) {
//before you will correct me in this comparison, read Andrea Giammarchi's text about coercion http://goo.gl/N4jCB

        seed = (new Date()).getTime();
//if there is no seed, use timestamp
    }

    return {
        next : function(min, max) {
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
// if 'min' and 'max' are not provided, return random number between 0 & 1
        }
    }
}