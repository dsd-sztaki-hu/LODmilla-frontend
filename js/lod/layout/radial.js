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

    if (!sorted_nodes[0][0].isVirtual) {
        act = Graph.nodes[sorted_nodes[0][0].id];
        act.left = cx;
        act.top = cy;
    }
    var PI2 = 2 * Math.PI;
    var db;
    var r0 = 0; //=0?
    var slices = 1;
    var dist_norm = distance;
    //r = distance * 1.25;
    level = sorted_nodes.length;
    for (i = 1; i < level; i++) {
        length = sorted_nodes[i].length;
        r = distance * length / PI2;
        if (r < r0) r = r0 + distance;
        parts = PI2 * r / dist_norm;
        if (length < parts)
            slices = length;
        else
            slices = parts;
        x = 0;
        db = parts;
        for (index = 0; index < length; index++) {
            /*
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
            }*/
            if (!sorted_nodes[i][index].isVirtual) {
                act = Graph.nodes[sorted_nodes[i][index].id];
                nx = r * Math.cos(theta) + cx;
                ny = r * Math.sin(theta) + cy;
                act.left = nx;
                act.top = ny;
            }
            x++;
            theta = x / slices * PI2;
        }
        //r += distance;
        r0 = r;
    }

    setBufferPosition(buffer);
}

function radialLayoutAdaptive(buffer, min_distance) {
    var sorted_nodes = [];
    var index, act;
    var i, j, k;
//    var distance = Math.sqrt(2 * min_distance * min_distance);
    var distance = min_distance;
    var x = 0;
    var theta = 0;

    var parts = 1;
    var level = 0;
    var nx,ny;
    var length;

    sorted_nodes = createSortedNodes(buffer);

    var cx = $(document).scrollLeft() + window.screen.width / 2,
        cy = $(document).scrollTop() + window.screen.height / 2;

    if (!sorted_nodes[0][0].isVirtual) {
        act = Graph.nodes[sorted_nodes[0][0].id];
        act.left = cx;
        act.top = cy;
    }
    var PI2 = 2 * Math.PI;
    var db;
//    var r0;
    var slices = 1;
    var dist_norm = distance;
    var r = distance * 1.25;
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
            if (!sorted_nodes[i][index].isVirtual) {
                act = Graph.nodes[sorted_nodes[i][index].id];
                nx = r * Math.cos(theta) + cx;
                ny = r * Math.sin(theta) + cy;
                act.left = nx;
                act.top = ny;
            }
            x++;
            theta = x / slices * PI2;
        }
        r += distance * 1.25;
//        r0 = r;
    }

    setBufferPosition(buffer);
}

function radialLayoutGroup(buffer, min_distance) {
    var sorted_nodes = [];
    var index, act;
    var i, j, k;
    var distance = min_distance;
    var x = 0;
    var theta = 0;

    var parts = 1;
    var level = 0;
    var nx,ny;
    var length, length2;

    sorted_nodes = createSortedNodes(buffer);

    var cx = $(document).scrollLeft() + window.screen.width / 2,
        cy = $(document).scrollTop() + window.screen.height / 2;

    /*
    if (!sorted_nodes[0][0].isVirtual) {
        act = Graph.nodes[sorted_nodes[0][0].id];
        act.left = cx;
        act.top = cy;
    }*/

    level = sorted_nodes.length;
    var maxDB = [],
        sumDB = [];
    var n;
    for (i = 0; i < level; i++)
    {
        length = sorted_nodes[i].length;
        for (j = 0; j < length; j++)
        {
            n = Math.sqrt(sorted_nodes[i][j].vertexes.length);
            n = Math.ceil(n);
            if (maxDB[i] === undefined) maxDB[i] = n;
            else
            {
                if (maxDB[i] < n) maxDB[i] = n;
            }
            if (sumDB[i] === undefined) sumDB[i] = n;
            else
            {
                sumDB[i] += n;
            }
        }
    }

    var PI2 = 2 * Math.PI;
    var db;
    var r = 0;
    var r0 = 0; //=0?
    var slices = 1;
    var curr, oversize = false;
    var dist_norm = distance;
    //r = distance * 1.25;
    var gx, gy, gxPos, gyPos, actg;
    for (i = 0; i < level; i++) {
        length = sorted_nodes[i].length;
        if (i == 0) r = 0;
        else
        {
            r = distance * maxDB[i] * length / PI2;
            curr = r0 + distance * maxDB[i] / 2;
            //if (r < r0) r = r0 + distance * maxDB[i];
            //else r = r0 + distance * maxDB[i] / 2;
            if (r < curr)
            {
                r = curr;
                oversize = false;
            }
            else
            {
                oversize = true;
            }
        }
        //else r = distance * (1 + maxDB[i]) * length / PI2;
        //if (r < r0) r = r0 + distance * maxDB[i];
        //else r = r0 + distance * maxDB[i];

        x = 0;
        for (index = 0; index < length; index++) {
            length2 = sorted_nodes[i][index].vertexes.length;
            n = Math.ceil(Math.sqrt(length2));
            gx = 0; gy = 0;
            gxPos = r * Math.cos(theta) + cx;
            gyPos = r * Math.sin(theta) + cy;
            for (j = 0; j < length2; j++) {
                actg = sorted_nodes[i][index].vertexes[j];
                if (!actg.isVirtual)
                {
                    act = Graph.nodes[actg.id];
                    nx = gxPos + (gx - maxDB[i] / 2) * dist_norm;
                    ny = gyPos + (gy - maxDB[i] / 2) * dist_norm;
                    act.left = nx;
                    act.top = ny;
                    gx++;
                    if (gx >= n)
                    {
                        gx = 0;
                        gy++;
                    }
                }
            }
            x++;
            theta = x / length * PI2;
        }
        if (i == 0)
        {
            r0 = distance * (maxDB[i] / 2 + 0.5);
        }
        else {
            if (oversize)
            {
                r0 = r + distance * (0.5 + maxDB[i] / 2);
            }
            else
            {
                r0 = r + distance * (0.5 + maxDB[i] / 2);
            }
        }
        //r0 = r;
    }

    setBufferPosition(buffer);
}

function radialLayoutGroupAdaptive(buffer, min_distance) {
    var sorted_nodes = [];
    var index, act;
    var i, j, k;
    var distance = min_distance;
    var x = 0;
    var theta = 0;

    var level = 0;
    var nx,ny;
    var length, length2;

    sorted_nodes = createSortedNodes(buffer);

    var cx = $(document).scrollLeft() + window.screen.width / 2,
        cy = $(document).scrollTop() + window.screen.height / 2;

    level = sorted_nodes.length;
    var maxDB = [],
        sumDB = [];
    var n, nx, ny, nt;
    var tmp;
    for (i = 0; i < level; i++)
    {
        length = sorted_nodes[i].length;
        for (j = 0; j < length; j++)
        {
            n = Math.sqrt(sorted_nodes[i][j].vertexes.length);
            nx = Math.ceil(n);
            ny = squareY(sorted_nodes[i][j].vertexes.length);
            if (maxDB[i] === undefined) maxDB[i] = nx;
            else
            {
                if (maxDB[i] < nx) maxDB[i] = nx;
            }
            nt = Math.sqrt(nx * nx + ny * ny);
            /*if (sumSQ[i] === undefined) sumSQ[i] = nt;
            else
            {
                sumSQ[i] += nt;
            }*/
            if (sumDB[i] === undefined) sumDB[i] = nt;
            else
            {
                sumDB[i] += nt;
            }
        }
    }

    var PI2 = 2 * Math.PI;
    var db;
    var r = 0;
    var r0 = 0; //=0?
    var slices = 1;
    var curr;
    var dist_norm = distance;
    //r = distance * 1.25;
    var tny, tr;
    var gx, gy, gxPos, gyPos, actg;
    for (i = 0; i < level; i++) {
        theta = 0;
        length = sorted_nodes[i].length;
        if (i == 0) r = 0;
        else
        {
            //r = distance * (sumDB[i] + maxDB[i])  / PI2;
            //r = distance * (sumDB[i] + Math.sqrt(maxDB[i] * maxDB[i] * 2))  / PI2;
            r = distance * sumDB[i]  / PI2;
            curr = r0 + distance * maxDB[i] / 2;
            if (r < curr) r = curr;
        }
        x = 0;
        for (index = 0; index < length; index++) {
            length2 = sorted_nodes[i][index].vertexes.length;
            n = Math.ceil(Math.sqrt(length2));
            tny = squareY(length2);
            tr = Math.sqrt(n * n + tny * tny);
            gx = 0; gy = 0;
            //if (index != 0) x += (n + 0.1) / 2;
            if (index != 0) x += tr / 2;
            theta = x / sumDB[i] * PI2;
            gxPos = r * Math.cos(theta) + cx;
            gyPos = r * Math.sin(theta) + cy;
            for (j = 0; j < length2; j++) {
                actg = sorted_nodes[i][index].vertexes[j];
                if (!actg.isVirtual)
                {
                    act = Graph.nodes[actg.id];
                    nx = gxPos + (gx - n / 2) * dist_norm;
                    ny = gyPos + (gy - n / 2) * dist_norm;
                    //nx = gxPos + gx * dist_norm;
                    //ny = gyPos + gy * dist_norm;
                    act.left = nx;
                    act.top = ny;
                    gx++;
                    if (gx >= n)
                    {
                        gx = 0;
                        gy++;
                    }
                }
            }
            //x += (n + 0.1) / 2;
            x += tr / 2;
        }
        r0 = r + distance * (0.5 + maxDB[i] / 2);
    }

    setBufferPosition(buffer);
}

function squareY(value)
{
    var x = 1, y = 1, l = true;
    while (x * y < value)
    {
        if (l)
        {
            x++;
            l = false;
        }
        else
        {
            y++;
            l = true;
        }
    }
    return y;
}

function radialLayoutGroupAdaptiveRotate(buffer, min_distance) {
    var sorted_nodes = [];
    var index, act;
    var i, j, k;
    var distance = min_distance;
    var x = 0;
    var theta = 0;
    var level = 0;
    var nx,ny;
    var length, length2, length3;
    var max = 0;

    sorted_nodes = createSortedNodes(buffer);

    var cx = $(document).scrollLeft() + window.screen.width / 2,
        cy = $(document).scrollTop() + window.screen.height / 2;

    level = sorted_nodes.length;
    var maxDB = [],
        sumDB = [],
        sumSQ = [];
    var n, nx, ny, nt;
    for (i = 0; i < level; i++)
    {
        length = sorted_nodes[i].length;
        for (j = 0; j < length; j++)
        {
            sorted_nodes[i][j].level = i;
            n = Math.sqrt(sorted_nodes[i][j].vertexes.length);
            nx = Math.ceil(n);
            ny = squareY(sorted_nodes[i][j].vertexes.length);
            if (maxDB[i] === undefined) maxDB[i] = nx;
            else
            {
                if (maxDB[i] < nx) maxDB[i] = nx;
            }
            nt = Math.sqrt(nx * nx + ny * ny);
            if (sumSQ[i] === undefined) sumSQ[i] = nt;
            else
            {
                sumSQ[i] += nt;
            }
            if (sumDB[i] === undefined) sumDB[i] = nx;
            else
            {
                sumDB[i] += nx;
            }
        }
    }

    var PI2 = 2 * Math.PI;
    var r = 0;
    var r0 = 0;
    var curr;
    var maxdb;
    var dist_norm = distance;
    var tny, tr;
    var gx, gy, gxPos, gyPos, actg;
    var gamma = [];
    for (i = 0; i < level; i++) {
        theta = 0;
        gamma[i] = 0;
        length = sorted_nodes[i].length;
        if (i == 0)
        {
            r = 0;
            maxdb = 1;
        }
        else
        {
            r = distance * sumSQ[i]  / PI2;
            curr = r0 + distance * maxDB[i] / 2;
            if (r < curr) r = curr;
            maxdb = PI2 * r / distance;
        }
        x = 0;
        for (index = 0; index < length; index++) {
            length2 = sorted_nodes[i][index].vertexes.length;
            n = Math.ceil(Math.sqrt(length2));
            tny = squareY(length2);
            tr = Math.sqrt(n * n + tny * tny);
            gx = 0; gy = 0;
            if (index != 0) x += tr / 2;
            theta = x / maxdb * PI2;
            sorted_nodes[i][index].theta = theta;
            x += tr / 2;
        }
        r0 = r + distance * (0.5 + maxDB[i] / 2);
    }

    var conn, dtheta, dgamma, t1, t2, db, tmp, conndb;
    for (i = 0; i < level; i++) {
        length = sorted_nodes[i].length;
        dgamma = 0;
        conndb = 0;
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            length2 = actg.connections.length;
            for (k = 0; k < length2; k++) {
                conn = actg.connections[k];
                conndb += Math.abs(buffer.groupsConnected[actg.id][conn.id]);
            }
        }
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            length2 = actg.connections.length;
            for (k = 0; k < length2; k++) {
                conn = actg.connections[k];
                db = Math.abs(buffer.groupsConnected[actg.id][conn.id]);
                tmp = db / conndb;
                t1 = actg.theta / PI2;
                t2 = conn.theta / PI2;
                dtheta = Math.abs(t1 - t2);
                if (dtheta == 0) continue;
                if (t1 > 0.5) {
                    if (dtheta > 0.5) dgamma += (1 - dtheta) * tmp;
                    else dgamma -= dtheta * tmp;
                }
                else {
                    if (dtheta > 0.5) dgamma -= (1 - dtheta) * tmp ;
                    else dgamma += dtheta * tmp;
                }
                if (dgamma > 1.0) dgamma = dgamma - 1;
                if (dgamma < -1.0) dgamma = dgamma + 1;
            }
        }
        //gamma[i] += dgamma;
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            actg.theta +=  dgamma * PI2;
        }
    }
/*
    for (i = 0; i < level; i++) {
        length = sorted_nodes[i].length;
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            actg.theta = gamma[i] * PI2;
        }
    }
*/

    //theta dependent sum
    var sumDBTheta = [];
    for (i = 0; i < level; i++)
    {
        length = sorted_nodes[i].length;
        for (j = 0; j < length; j++)
        {
            actg = sorted_nodes[i][j];
            theta = actg.theta / PI2;
            dtheta = getMinThetaDist(theta) * 4;
            n = Math.sqrt(sorted_nodes[i][j].vertexes.length);
            nx = Math.ceil(n);
            ny = squareY(sorted_nodes[i][j].vertexes.length);
            nt = Math.sqrt(nx * nx + ny * ny);
            if (nt > nx)
            {
                tmp = nt - nx;
                n = nx + dtheta * tmp;
            }
            else {
                tmp = nx - nt;
                n = nt + dtheta * tmp;
            }
            if (sumDBTheta[i] === undefined) sumDBTheta[i] = n;
            else
            {
                sumDBTheta[i] += n;
            }
        }
    }

    for (i = 0; i < level; i++) {
        theta = 0;
        length = sorted_nodes[i].length;
        if (i == 0)
        {
            r = 0;
            maxdb = 1;
        }
        else
        {
            r = distance * sumSQ[i]  / PI2;
            curr = r0 + distance * maxDB[i] / 2;
            if (r < curr) r = curr;
            maxdb = PI2 * r / distance;
        }
        x = 0;
        for (index = 0; index < length; index++) {
            length2 = sorted_nodes[i][index].vertexes.length;
            n = Math.ceil(Math.sqrt(length2));
            tny = squareY(length2);
            tr = Math.sqrt(n * n + tny * tny);
            gx = 0; gy = 0;
            if (index != 0) x += tr / 2;
            theta = x / maxdb * PI2;
            gxPos = r * Math.cos(sorted_nodes[i][index].theta) + cx;
            gyPos = r * Math.sin(sorted_nodes[i][index].theta) + cy;
            for (j = 0; j < length2; j++) {
                actg = sorted_nodes[i][index].vertexes[j];
                if (!actg.isVirtual)
                {
                    act = Graph.nodes[actg.id];
                    nx = gxPos + (gx - n / 2) * dist_norm;
                    ny = gyPos + (gy - n / 2) * dist_norm;
                    //nx = gxPos + gx * dist_norm;
                    //ny = gyPos + gy * dist_norm;
                    act.left = nx;
                    act.top = ny;
                    gx++;
                    if (gx >= n)
                    {
                        gx = 0;
                        gy++;
                    }
                }
            }
            x += tr / 2;
        }
        r0 = r + distance * (0.5 + maxDB[i] / 2);
    }

    setBufferPosition(buffer);
}

function radialLayoutGroupAdaptivePhysicalWrong(buffer, min_distance) {
    var sorted_nodes = [];
    var index, act;
    var i, j, k;
    var distance = min_distance;
    var x = 0;
    var theta = 0;
    var level = 0;
    var nx,ny;
    var length, length2, length3;
    var max = 0;

    sorted_nodes = createSortedNodes(buffer);

    var cx = $(document).scrollLeft() + window.screen.width / 2,
        cy = $(document).scrollTop() + window.screen.height / 2;

    level = sorted_nodes.length;

    var tmp_nodes = [];

    for (i = 1; i < level; i++)
    {
        sorted_nodes[i].sort(
            function(a, b)
            {
                return a.connections.length - b.connections.length;
            }
        );
        length = sorted_nodes[i].length;
        tmp_nodes = [];
        for (j = 0; j < length; j += 2)
        {
            tmp_nodes.push(sorted_nodes[i][j]);
        }
        length--;
        if (length % 2 == 0) length--;
        for (j = length; j > 0; j -= 2)
        {
            tmp_nodes.push(sorted_nodes[i][j]);
        }
        sorted_nodes[i] = tmp_nodes;
    }

    var maxDB = [],
        sumDB = [],
        sumSQ = [];
    var n, nx, ny, nt;
    for (i = 0; i < level; i++)
    {
        length = sorted_nodes[i].length;
        for (j = 0; j < length; j++)
        {
            sorted_nodes[i][j].level = i;
            n = Math.sqrt(sorted_nodes[i][j].vertexes.length);
            nx = Math.ceil(n);
            ny = squareY(sorted_nodes[i][j].vertexes.length);
            if (maxDB[i] === undefined) maxDB[i] = nx;
            else
            {
                if (maxDB[i] < nx) maxDB[i] = nx;
            }
            nt = Math.sqrt(nx * nx + ny * ny);
            if (sumSQ[i] === undefined) sumSQ[i] = nt;
            else
            {
                sumSQ[i] += nt;
            }
            if (sumDB[i] === undefined) sumDB[i] = nx;
            else
            {
                sumDB[i] += nx;
            }
        }
    }

    var PI2 = 2 * Math.PI;
    var r = 0;
    var r0 = 0;
    var curr;
    var maxdb;
    var dist_norm = distance;
    var tny, tr;
    var gx, gy, gxPos, gyPos, actg;
    var gamma = [];
    for (i = 0; i < level; i++) {
        theta = 0;
        gamma[i] = 0;
        length = sorted_nodes[i].length;
        if (i == 0)
        {
            r = 0;
            maxdb = 1;
        }
        else
        {
            r = distance * sumSQ[i]  / PI2;
            curr = r0 + distance * maxDB[i] / 2;
            if (r < curr) r = curr;
            maxdb = PI2 * r / distance;
        }
        x = 0;
        for (index = 0; index < length; index++) {
            length2 = sorted_nodes[i][index].vertexes.length;
            n = Math.ceil(Math.sqrt(length2));
            tny = squareY(length2);
            tr = Math.sqrt(n * n + tny * tny);
            gx = 0; gy = 0;
            if (index != 0) x += tr / 2;
            theta = x / maxdb * PI2;
            sorted_nodes[i][index].theta = theta;
            x += tr / 2;
        }
        r0 = r + distance * (0.5 + maxDB[i] / 2);
    }

    var conn, dtheta, dgamma, t1, t2, db, tmp, conndb;
    var sumDBTheta = [];


    for (i = 0; i < level; i++) {
        length = sorted_nodes[i].length;
        dgamma = 0;
        conndb = 0;
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            length2 = actg.connections.length;
            for (k = 0; k < length2; k++) {
                conn = actg.connections[k];
                conndb += Math.abs(buffer.groupsConnected[actg.id][conn.id]);
            }
        }
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            length2 = actg.connections.length;
            for (k = 0; k < length2; k++) {
                conn = actg.connections[k];
                db = Math.abs(buffer.groupsConnected[actg.id][conn.id]);
                tmp = db / conndb;
                t1 = actg.theta / PI2;
                t2 = conn.theta / PI2;
                dtheta = Math.abs(t1 - t2);
                if (dtheta == 0) continue;
                if (t1 > 0.5) {
                    if (dtheta > 0.5) dgamma += (1 - dtheta) * tmp;
                    else dgamma -= dtheta * tmp;
                }
                else {
                    if (dtheta > 0.5) dgamma -= (1 - dtheta) * tmp ;
                    else dgamma += dtheta * tmp;
                }
                if (dgamma > 1.0) dgamma = dgamma - 1;
                if (dgamma < -1.0) dgamma = dgamma + 1;
            }
        }
        //gamma[i] += dgamma;
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            actg.theta +=  dgamma * PI2;
        }
    }
    /*
     for (i = 0; i < level; i++) {
     length = sorted_nodes[i].length;
     for (index = 0; index < length; index++) {
     actg = sorted_nodes[i][index];
     actg.theta = gamma[i] * PI2;
     }
     }
     */

    //theta dependent sum

    for (i = 0; i < level; i++)
    {
        length = sorted_nodes[i].length;
        for (j = 0; j < length; j++)
        {
            actg = sorted_nodes[i][j];
            theta = actg.theta / PI2;
            n = getMinThetaDB(theta, sorted_nodes[i][j].vertexes.length);
            if (sumDBTheta[i] === undefined) sumDBTheta[i] = n;
            else
            {
                sumDBTheta[i] += n;
            }
        }
    }

    for (i = 0; i < level; i++) {
        theta = 0;
        length = sorted_nodes[i].length;
        if (i == 0)
        {
            r = 0;
            maxdb = 1;
        }
        else
        {
            r = distance * sumDBTheta[i]  / PI2;
            curr = r0 + distance * maxDB[i] / 2;
            if (r < curr) r = curr;
            maxdb = PI2 * r / distance;
        }
        x = 0;
        for (index = 0; index < length; index++) {
            length2 = sorted_nodes[i][index].vertexes.length;
            n = Math.ceil(Math.sqrt(length2));
            tny = squareY(length2);
            //tr = getMinThetaDB(sorted_nodes[i][index].theta / PI2, sorted_nodes, sorted_nodes[i][index].vertexes.length);
            //tr = Math.sqrt(n * n + tny * tny);
            tr = getMinThetaDB(theta / PI2, sorted_nodes[i][index].vertexes.length);
            gx = 0; gy = 0;
            if (index != 0) x += tr / 2;
            theta = x / maxdb * PI2;
            sorted_nodes[i][index].theta = theta;
            tr = getMinThetaDB(theta / PI2, sorted_nodes[i][index].vertexes.length);
            x += tr / 2;
        }
        r0 = r + distance * (0.5 + maxDB[i] / 2);
    }

    for (i = 0; i < level; i++) {
        length = sorted_nodes[i].length;
        dgamma = 0;
        conndb = 0;
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            length2 = actg.connections.length;
            for (k = 0; k < length2; k++) {
                conn = actg.connections[k];
                conndb += Math.abs(buffer.groupsConnected[actg.id][conn.id]);
            }
        }
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            length2 = actg.connections.length;
            for (k = 0; k < length2; k++) {
                conn = actg.connections[k];
                db = Math.abs(buffer.groupsConnected[actg.id][conn.id]);
                tmp = db / conndb;
                t1 = actg.theta / PI2;
                t2 = conn.theta / PI2;
                dtheta = Math.abs(t1 - t2);
                if (dtheta == 0) continue;
                if (t1 > 0.5) {
                    if (dtheta > 0.5) dgamma += (1 - dtheta) * tmp;
                    else dgamma -= dtheta * tmp;
                }
                else {
                    if (dtheta > 0.5) dgamma -= (1 - dtheta) * tmp ;
                    else dgamma += dtheta * tmp;
                }
                if (dgamma > 1.0) dgamma = dgamma - 1;
                if (dgamma < -1.0) dgamma = dgamma + 1;
            }
        }
        //gamma[i] += dgamma;
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            actg.theta +=  dgamma * PI2;
        }
    }

    for (i = 0; i < level; i++)
    {
        length = sorted_nodes[i].length;
        sumDBTheta[i] = 0;
        for (j = 0; j < length; j++)
        {
            actg = sorted_nodes[i][j];
            theta = actg.theta / PI2;
            n = getMinThetaDB(theta, sorted_nodes[i][j].vertexes.length);
            if (sumDBTheta[i] === undefined) sumDBTheta[i] = n;
            else
            {
                sumDBTheta[i] += n;
            }
        }
    }

    for (i = 0; i < level; i++) {
        theta = 0;
        length = sorted_nodes[i].length;
        if (i == 0)
        {
            r = 0;
            maxdb = 1;
        }
        else
        {
            r = distance * sumDBTheta[i]  / PI2;
            curr = r0 + distance * maxDB[i] / 2;
            if (r < curr) r = curr;
            maxdb = PI2 * r / distance;
        }
        x = 0;
        for (index = 0; index < length; index++) {
            length2 = sorted_nodes[i][index].vertexes.length;
            n = Math.ceil(Math.sqrt(length2));
            tny = squareY(length2);
            //tr = getMinThetaDB(sorted_nodes[i][index].theta / PI2, sorted_nodes, sorted_nodes[i][index].vertexes.length);
            //tr = Math.sqrt(n * n + tny * tny);
            tr = getMinThetaDB(sorted_nodes[i][index].theta / PI2, sorted_nodes[i][index].vertexes.length);
            tr += Math.sqrt(n * n + tny * tny);
            gx = 0; gy = 0;
            if (index != 0) x += tr / 4;
            gxPos = r * Math.cos(sorted_nodes[i][index].theta) + cx;
            gyPos = r * Math.sin(sorted_nodes[i][index].theta) + cy;
            for (j = 0; j < length2; j++) {
                actg = sorted_nodes[i][index].vertexes[j];
                if (!actg.isVirtual)
                {
                    act = Graph.nodes[actg.id];
                    nx = gxPos + (gx - n / 2) * dist_norm;
                    ny = gyPos + (gy - n / 2) * dist_norm;
                    //nx = gxPos + gx * dist_norm;
                    //ny = gyPos + gy * dist_norm;
                    act.left = nx;
                    act.top = ny;
                    gx++;
                    if (gx >= n)
                    {
                        gx = 0;
                        gy++;
                    }
                }
            }
            x += tr / 4;
        }
        r0 = r + distance * (0.5 + maxDB[i] / 2);
    }

/*
    for (i = 0; i < level; i++) {
        theta = 0;
        length = sorted_nodes[i].length;
        if (i == 0)
        {
            r = 0;
            maxdb = 1;
        }
        else
        {
            r = distance * sumDBTheta[i]  / PI2;
            curr = r0 + distance * maxDB[i] / 2;
            if (r < curr) r = curr;
            maxdb = PI2 * r / distance;
        }
        x = 0;
        for (index = 0; index < length; index++) {
            length2 = sorted_nodes[i][index].vertexes.length;
            n = Math.ceil(Math.sqrt(length2));
            tny = squareY(length2);
            //tr = getMinThetaDB(sorted_nodes[i][index].theta / PI2, sorted_nodes, sorted_nodes[i][index].vertexes.length);
            //tr = Math.sqrt(n * n + tny * tny);
            tr = getMinThetaDB(theta / PI2, sorted_nodes, sorted_nodes[i][index].vertexes.length);
            gx = 0; gy = 0;
            if (index != 0) x += tr / 2;
            theta = x / maxdb * PI2;
            gxPos = r * Math.cos(sorted_nodes[i][index].theta) + cx;
            gyPos = r * Math.sin(sorted_nodes[i][index].theta) + cy;
            for (j = 0; j < length2; j++) {
                actg = sorted_nodes[i][index].vertexes[j];
                if (!actg.isVirtual)
                {
                    act = Graph.nodes[actg.id];
                    nx = gxPos + (gx - n / 2) * dist_norm;
                    ny = gyPos + (gy - n / 2) * dist_norm;
                    //nx = gxPos + gx * dist_norm;
                    //ny = gyPos + gy * dist_norm;
                    act.left = nx;
                    act.top = ny;
                    gx++;
                    if (gx >= n)
                    {
                        gx = 0;
                        gy++;
                    }
                }
            }
            tr = getMinThetaDB(theta / PI2, sorted_nodes, sorted_nodes[i][index].vertexes.length);
            x += tr / 2;
        }
        r0 = r + distance * (0.5 + maxDB[i] / 2);
    }*/

    setBufferPosition(buffer);
}

function radialLayoutGroupAdaptivePhysical(buffer, min_distance) {
    var sorted_nodes = [];
    var index, act;
    var i, j, k;
    var distance = min_distance;
    var x = 0;
    var theta = 0;
    var level = 0;
    var nx,ny;
    var length, length2, length3;
    var max = 0;

    sorted_nodes = createSortedNodes2(buffer);

    var cx = $(document).scrollLeft() + window.screen.width / 2,
        cy = $(document).scrollTop() + window.screen.height / 2;

    level = sorted_nodes.length;

    var tmp_nodes = [];

    for (i = 1; i < level; i++)
    {
        sorted_nodes[i].sort(
            function(a, b)
            {
                return a.connections.length - b.connections.length;
            }
        );
        length = sorted_nodes[i].length;
        tmp_nodes = [];
        for (j = 0; j < length; j += 2)
        {
            tmp_nodes.push(sorted_nodes[i][j]);
        }
        length--;
        if (length % 2 == 0) length--;
        for (j = length; j > 0; j -= 2)
        {
            tmp_nodes.push(sorted_nodes[i][j]);
        }
        sorted_nodes[i] = tmp_nodes;
    }

    var maxDB = [],
        maxSQ = [],
        sumDB = [],
        sumSQ = [];
    var n, nx, ny, nt;
    for (i = 0; i < level; i++)
    {
        length = sorted_nodes[i].length;
        for (j = 0; j < length; j++)
        {
            sorted_nodes[i][j].level = i;
            n = Math.sqrt(sorted_nodes[i][j].vertexes.length);
            nx = Math.ceil(n);
            ny = squareY(sorted_nodes[i][j].vertexes.length);
            if (maxSQ[i] === undefined) maxSQ[i] = nx;
            else
            {
                if (maxSQ[i] < nx) maxSQ[i] = nx;
            }
            nt = Math.sqrt(nx * nx + ny * ny);
            if (sumSQ[i] === undefined) sumSQ[i] = nt;
            else
            {
                sumSQ[i] += nt;
            }
            if (sumDB[i] === undefined) sumDB[i] = sorted_nodes[i][j].vertexes.length;
            else
            {
                sumDB[i] += sorted_nodes[i][j].vertexes.length;
            }
            if (maxDB[i] === undefined) maxDB[i] = nt;
            else
            {
                if (maxDB[i] < nt) maxDB[i] = nt;
            }
        }
    }

    var PI2 = 2 * Math.PI;
    var r = 0;
    var r0 = 0;
    var curr;
    var maxdb;
    var dist_norm = distance;
    var tny, tr;
    var gx, gy, gxPos, gyPos, actg;
    var gamma = [];
    var tmp_tr = [], sum_tr;

    for (i = 0; i < level; i++) {
        theta = 0;
        gamma[i] = 0;
        length = sorted_nodes[i].length;
        if (i == 0)
        {
            r = 0;
            maxdb = 1;
        }
        else
        {
            r = distance * length / PI2;
            //curr = r0 + distance * maxDB[i] / 2;
            if (r < r0) r = r0 + (0.5 + maxSQ[i] / 2);
            maxdb = PI2 * r / distance;
        }
        x = 0;
        for (index = 0; index < length; index++) {
            if (index != 0) x += 0.5;
            theta = x / maxdb * PI2;
            sorted_nodes[i][index].theta = theta;
            x += 0.5;
        }
        r0 = r + distance * (0.5 + maxSQ[i] / 2);
    }
    /*
    for (i = 0; i < level; i++) {
        theta = 0;
        gamma[i] = 0;
        length = sorted_nodes[i].length;
        if (i == 0)
        {
            r = 0;
            maxdb = 1;
        }
        else
        {
            //r = distance * maxDB[i] * length  / PI2;
            //r = distance * sumDB[i] / PI2;
            //curr = r0 + distance * maxDB[i] / 2;
            //if (r < curr) r = curr;
            //maxdb = PI2 * r / distance;
        }
        x = 0;
        tmp_tr = [length];
        sum_tr = 0;
        for (index = 0; index < length; index++) {
            length2 = sorted_nodes[i][index].vertexes.length;
            tmp_tr[index]  = getMinThetaIter(length2, maxDB[i]);
            sum_tr += tmp_tr[index];
        }
        for (index = 0; index < length; index++) {
            tr = tmp_tr[index];
            if (index != 0) x += tr / 2;
            theta = x / sum_tr * PI2;
            sorted_nodes[i][index].theta = theta;
            x += tr / 2;
        }

        for (index = 0; index < length; index++) {
            length2 = sorted_nodes[i][index].vertexes.length;
            n = Math.ceil(Math.sqrt(length2));
            //tny = squareY(length2);
            //tr = Math.sqrt(n * n + tny * tny);
            tr = getMinThetaIter(length2, sumDB[i]);
            if (index != 0) x += tr / 2;
            theta = x / sumDB[i] * PI2;
            sorted_nodes[i][index].theta = theta;
            x += tr / 2;
        }
        //r0 = r + distance * (0.5 + maxDB[i] / 2);
    }*/
    //növeld theta-t addig, amig a tr = getMinThetaDB(tr / 2,length) ?/sumDB[i]
    // tr = getMinThetaDB(tr / 2,length) / maxdb

    var conn, dtheta, dgamma, t1, t2, db, tmp, conndb;
    var sumDBTheta = [];


    for (i = 0; i < level; i++) {
        length = sorted_nodes[i].length;
        dgamma = 0;
        conndb = 0;
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            length2 = actg.connections.length;
            for (k = 0; k < length2; k++) {
                conn = actg.connections[k];
                conndb += Math.abs(buffer.groupsConnected[actg.id][conn.id]);
            }
        }
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            length2 = actg.connections.length;
            for (k = 0; k < length2; k++) {
                conn = actg.connections[k];
                db = Math.abs(buffer.groupsConnected[actg.id][conn.id]);
                tmp = db / conndb;
                t1 = actg.theta / PI2;
                t2 = conn.theta / PI2;
                dtheta = Math.abs(t1 - t2);
                if (dtheta == 0) continue;
                if (t1 > 0.5) {
                    if (dtheta > 0.5) dgamma += (1 - dtheta) * tmp;
                    else dgamma -= dtheta * tmp;
                }
                else {
                    if (dtheta > 0.5) dgamma -= (1 - dtheta) * tmp ;
                    else dgamma += dtheta * tmp;
                }
                if (dgamma > 1.0) dgamma = dgamma - 1;
                if (dgamma < -1.0) dgamma = dgamma + 1;
            }
        }
        //gamma[i] += dgamma;
        for (index = 0; index < length; index++) {
            actg = sorted_nodes[i][index];
            actg.theta +=  dgamma * PI2;
            actg.gamma = dgamma * PI2;
        }
    }

    //theta dependent sum

    for (i = 0; i < level; i++)
    {
        length = sorted_nodes[i].length;
        for (j = 0; j < length; j++)
        {
            actg = sorted_nodes[i][j];
            theta = (actg.theta + actg.gamma) / PI2;
            n = getMinThetaDB(theta, actg.vertexes.length);
            if (sumDBTheta[i] === undefined) sumDBTheta[i] = n;
            else
            {
                sumDBTheta[i] += n;
            }
        }
    }
    r0 = 0;
    for (i = 0; i < level; i++) {
        theta = 0;
        length = sorted_nodes[i].length;
        if (i == 0)
        {
            r = 0;
            maxdb = 1;
        }
        else
        {
            r = distance * sumDBTheta[i] / PI2;
            //r = distance * ((sumDBTheta[i] + sumSQ[i]) / 2)  / PI2;
            curr = r0 + distance * maxSQ[i] / 2;
            if (r < curr)
            {
                //curr = r0 + distance * maxSQ[i] / 2;
                r = r0 + distance * maxSQ[i] / 2;
                //r = r0;
                maxdb = PI2 * r / distance;
            }
            else
            {
                maxdb = PI2 * r / distance;
                //r = r * 1.1;
                //r *= 0.9;
            }
        }
        x = 0;
        for (index = 0; index < length; index++) {
            gx = 0; gy = 0;
            length2 = sorted_nodes[i][index].vertexes.length;
            n = Math.ceil(Math.sqrt(length2));
            tny = squareY(length2);
            //tr = getMinThetaDB(sorted_nodes[i][index].theta / PI2, sorted_nodes, sorted_nodes[i][index].vertexes.length);
            //tr = Math.sqrt(n * n + tny * tny);
            //tr = getMinThetaDB(theta / PI2, sorted_nodes[i][index].vertexes.length);
            if (index == 0)
            {
                x = sorted_nodes[i][index].gamma / PI2;
            }
            theta = x * PI2;
            if (theta > PI2) theta -= PI2;
            if (theta < 0.0) theta += PI2;
            tr = getMinThetaIter((theta) / PI2, length2, maxdb);
            if (index != 0) x += tr / 2;
            //theta = x / maxdb * PI2;
            theta = x * PI2;
            if (theta > PI2) theta -= PI2;
            if (theta < 0.0) theta += PI2;
            gxPos = r * Math.cos(theta) + cx;
            gyPos = r * Math.sin(theta) + cy;
            //gxPos = r * Math.cos(sorted_nodes[i][index].theta + sorted_nodes[i][index].gamma) + cx;
            //gyPos = r * Math.sin(sorted_nodes[i][index].theta + sorted_nodes[i][index].gamma) + cy;
            for (j = 0; j < length2; j++) {
                actg = sorted_nodes[i][index].vertexes[j];
                if (!actg.isVirtual)
                {
                    act = Graph.nodes[actg.id];
                    nx = gxPos + (gx - n / 2) * dist_norm;
                    ny = gyPos + (gy - tny / 2) * dist_norm;
                    //nx = gxPos + gx * dist_norm;
                    //ny = gyPos + gy * dist_norm;
                    act.left = nx;
                    act.top = ny;
                    gx++;
                    if (gx >= n)
                    {
                        gx = 0;
                        gy++;
                    }
                }
            }
            x += tr / 2;
        }
        r0 = r + distance * (0.5 + maxSQ[i] / 2);
    }

    /*
     for (i = 0; i < level; i++) {
     theta = 0;
     length = sorted_nodes[i].length;
     if (i == 0)
     {
     r = 0;
     maxdb = 1;
     }
     else
     {
     r = distance * sumDBTheta[i]  / PI2;
     curr = r0 + distance * maxDB[i] / 2;
     if (r < curr) r = curr;
     maxdb = PI2 * r / distance;
     }
     x = 0;
     for (index = 0; index < length; index++) {
     length2 = sorted_nodes[i][index].vertexes.length;
     n = Math.ceil(Math.sqrt(length2));
     tny = squareY(length2);
     //tr = getMinThetaDB(sorted_nodes[i][index].theta / PI2, sorted_nodes, sorted_nodes[i][index].vertexes.length);
     //tr = Math.sqrt(n * n + tny * tny);
     tr = getMinThetaDB(theta / PI2, sorted_nodes, sorted_nodes[i][index].vertexes.length);
     gx = 0; gy = 0;
     if (index != 0) x += tr / 2;
     theta = x / maxdb * PI2;
     gxPos = r * Math.cos(sorted_nodes[i][index].theta) + cx;
     gyPos = r * Math.sin(sorted_nodes[i][index].theta) + cy;
     for (j = 0; j < length2; j++) {
     actg = sorted_nodes[i][index].vertexes[j];
     if (!actg.isVirtual)
     {
     act = Graph.nodes[actg.id];
     nx = gxPos + (gx - n / 2) * dist_norm;
     ny = gyPos + (gy - n / 2) * dist_norm;
     //nx = gxPos + gx * dist_norm;
     //ny = gyPos + gy * dist_norm;
     act.left = nx;
     act.top = ny;
     gx++;
     if (gx >= n)
     {
     gx = 0;
     gy++;
     }
     }
     }
     tr = getMinThetaDB(theta / PI2, sorted_nodes, sorted_nodes[i][index].vertexes.length);
     x += tr / 2;
     }
     r0 = r + distance * (0.5 + maxDB[i] / 2);
     }*/

    setBufferPosition(buffer);
}

function getMinThetaIter(theta_notPI, length, maxDB)
{
    var t = 0;
    var tmp = 1;
    //bisection search modification
    var a = 0,
        b = 2, c;
    var n = 1;
    while (n < 1000)
    {
        c = (a + b) / 2; //ide
        tmp = getMinThetaDB(theta_notPI + c, length);
        tmp /= maxDB;
        if (tmp == 0 || (b - a) / 2 < 0.00001) break;
        //if (Math.abs(tmp - c) < 0.00001) break;
        if (tmp > c) a = c;
        if (tmp < c) b = c;
        n++;
    }
    if (c > 1) return c - 1;
    return c;
    /*
    while (t < tmp) {
        tmp = getMinThetaDB(theta_notPI + t / 2, length);
        tmp /= maxDB;
        t += 0.0001;
    }
    if (t > 1.0) return t - 1;
    return t;
    */
}

function getMinThetaDist(theta)
{
    var i;
    var min = Number.MAX_VALUE, tmp;
    for (i = 0; i < 1.1; i += 0.25)
    {
        tmp = Math.abs(theta - i);
        if (tmp < min) min = tmp;
    }
    return min;
}

function getMinThetaDB(theta,length)
{
    //var dtheta = getMinThetaDist(theta) * 4;
    var i, index, diff = 0;
    var min = Number.MAX_VALUE, tmp;
    for (i = 0; i < 10; i++, diff += 0.25)
    {
        tmp = Math.abs(theta - diff);
        if (tmp < min)
        {
            min = tmp;
            index = i;
        }
    }
    var dtheta = min * 4;
    var n = Math.sqrt(length);
    var nx = Math.ceil(n);
    var ny = squareY(length);
    var nt = Math.sqrt(nx * nx + ny * ny);
    var ndiff;
    if (index % 2 == 1)
    {
        ndiff = (1 - dtheta) * nx + dtheta * ny;
        if (nt > ndiff)
        {
            tmp = nt - ndiff;
            n = ndiff + dtheta * tmp;
        }
        else {
            tmp = ndiff - nt;
            n = nt + dtheta * tmp;
        }
    }
    else
    {
        ndiff = dtheta * nx + (1 - dtheta) * ny;
        if (nt > ndiff)
        {
            tmp = nt - ndiff;
            n = ndiff + dtheta * tmp;
        }
        else {
            tmp = ndiff - nt;
            n = nt + dtheta * tmp;
        }
    }
    /*
    if (nt > Math.min(nx, ny))
    {
        if (nx > ny)
        {
            tmp = nt - ny;
            n = ny + dtheta * tmp;
        }
        else
        {
            tmp = nt - nx;
            n = nx + dtheta * tmp;
        }
    }
    else {
        if (nx > ny)
        {
            tmp = ny - nt;
            n = nt + dtheta * tmp;
        }
        else
        {
            tmp = nx - nt;
            n = nt + dtheta * tmp;
        }
    }*/
    return n;
}

function setBufferPosition(buffer)
{
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

function createSortedNodes(buffer)
{
    var unsorted_nodes = [];
    var sorting_nodes = [];
    var sorted_nodes = [];
    var tmp_nodes = [];
    var index, act;
    var i, j, k;
    var level = 0;
    var length, length2, length3;
    var max = 0, tmp_max;
    length = buffer.groups.length;
    for (i = 0; i < length; i++)
    {
        unsorted_nodes.push(buffer.groups[i]);
    }
    for (i = 0; i < length; i++)
    {
        act = unsorted_nodes[i];
        tmp_max = 0;
        for (j = 0; j < length; j++)
        {
            if (i != j) tmp_max += Math.abs(buffer.groupsConnected[i][j]);
        }
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
            length2 = act.connections.length;
            for (j = 0; j < length2; j++)
            {
                length3 = unsorted_nodes.length;
                for (k = 0; k < length3; k++)
                {
                    if (act.connections[j].id == unsorted_nodes[k].id)
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
    return sorted_nodes;
}


function createSortedNodes2(buffer)
{
    var unsorted_nodes = [];
    var sorting_nodes = [];
    var sorted_nodes = [];
    var tmp_nodes = [];
    var index, act;
    var i, j, k;
    var level = 0;
    var length, length2, length3;
    var max = 0, tmp_max, tmp_min, min = Number.MAX_VALUE;
    length = buffer.groups.length;
    for (i = 0; i < length; i++)
    {
        unsorted_nodes.push(buffer.groups[i]);
    }
    for (i = 0; i < length; i++)
    {
        act = unsorted_nodes[i];
        //tmp_min = Number.MAX_VALUE;
        tmp_min = 0;
        tmp_max = 0;
        for (j = 0; j < length; j++)
        {
            if (i != j)
            {
                //tmp_min += Math.abs(buffer.groupDistance[i][j]);
                if (buffer.groupDistance[i][j] > tmp_min) tmp_min = buffer.groupDistance[i][j];
                tmp_max += Math.abs(buffer.groupsConnected[i][j]);
            }
        }
        if (tmp_min < min)
        {
            index = i;
            min = tmp_min;
            max = tmp_max;
        }
        else
        {
            if (tmp_min == min && tmp_max > max)
            {
                index = i;
                max = tmp_max;
            }
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
            length2 = act.connections.length;
            for (j = 0; j < length2; j++)
            {
                length3 = unsorted_nodes.length;
                for (k = 0; k < length3; k++)
                {
                    if (act.connections[j].id == unsorted_nodes[k].id)
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
    return sorted_nodes;
}