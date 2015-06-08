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
    var createGroups = document.getElementById('layoutCreateGroupsCheckBox').checked;
    var maxSpringTime = $('#layoutSpringSlider').slider("option", "value");
    var weight = 1;
    var virtualWeight = 1;
    initLayout(name, buffer, useVirtual, weight, virtualWeight, createGroups);
    switch(layoutType)
    {
        case Graph.LayoutEnum.GRID:
            if (createGroups) gridLayoutGroupAdaptive(buffer, 100);
            else gridLayout(buffer, 100);
            Graph.layout = Graph.LayoutEnum.GRID;
            break;
        case Graph.LayoutEnum.RADIAL:
            if (createGroups) radialLayoutGroupAdaptivePhysical(buffer, 200);
            else radialLayout(buffer, 200);
            Graph.layout = Graph.LayoutEnum.RADIAL;
            break;
        case Graph.LayoutEnum.SPRING:
            springLayout2(buffer, 10000, maxSpringTime * 1000, 100, 100, 1, 1, 10000);
            Graph.layout = Graph.LayoutEnum.SPRING;
            break;
        case Graph.LayoutEnum.SPRINGXY:
            //springLayoutXY(buffer, steps, max_time,  min_distance, grid_distance, spring_strain, spring_length)
            //springLayoutXY(buffer, 10000, maxSpringTime * 1000, 100, 100, 1, 1, 10000);
            springLayoutXY2(buffer, 10000, maxSpringTime * 1000, 100, 100, 1, 1, 10000);
            Graph.layout = Graph.LayoutEnum.SPRINGXY;
            break;
        default :
            console.log("Wrong layout type.");
    }
    finishLayout(name, repaint, buffer, createGroups);
}

//TODO undo function

function initLayout(name, buffer, useVirtual, weight, virtualWeight, createGroups)
{
    Helper.showLoadScreen();
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
    buffer.createDistanceMap();
    buffer.createConnectionCost();
    if (createGroups) {
        console.time("Create groups");
        buffer.createGroups();
        buffer.createGroupDistanceMap();
        console.timeEnd("Create groups");
    }

    console.time(name + " layout");
}

function finishLayout(name, repaint, buffer, createGroups)
{
    console.timeEnd(name + " layout");
    updateNewPosition();
    decideZoom(Graph.zoomRatio);
    if (repaint)
    {
        repaintNodes();
    }
    else Helper.closeLoadScreen();
    measureLayout(buffer, createGroups);
}

function measureLayout(buffer, createGroups)
{
    var spring_length = 100;
    var v = buffer.vertexes,
        n = buffer.neighbours, //they are connected to the same nodes
        c = buffer.connected,
        vl = v.length,
        nl = n.length,
        c = c.length;
    var i, j, tmp, tmpx, tmpy, tl, sl, cl;
    if (vl == 0) return;
    //arány és terület
    var minLeft = v[0].left,
        minTop = v[0].top,
        maxLeft = 0,
        maxTop = 0;
    var vx, vy;
    var ratio = "";
    var dx, dy;
    for (i = 1; i < vl; i++)
    {
        vx = v[i].left;
        vy = v[i].top;
        if (vx < minLeft) minLeft = vx;
        if (vy < minTop) minTop = vy;
        if (vx > maxLeft) maxLeft = vx;
        if (vy > maxTop) maxTop = vy;
    }
    dx = maxLeft - minLeft;
    dy = maxTop - minTop;
    if (dx < 0.1) dx = 1;
    if (dy < 0.1) dy = 1;
    if (dx > dy) ratio += (dx / dy).toFixed(4) + " : 1";
    else ratio += "1 : " + (dy / dx).toFixed(4);
    console.log('Befoglalo teglalap terulete: ' + (dx * dy).toFixed(0));
    console.log('Szelesseg: ' + dx.toFixed(0) + ' Magassag: ' + dy.toFixed(0));
    console.log('Aranya: ' + ratio);

    //távolság és fokszám
    var minEdgeDeg = -1,
        maxEdgeDeg = 0,
        avgEdgeDeg = -1;
    var minNeighbour = -1,
        maxNeighbour = 0,
        avgNeighbour = -1,
        maxNeighbourX = 0,
        avgNeighbourX = -1,
        minNeighbourX = -1,
        maxNeighbourY = 0,
        avgNeighbourY = -1,
        minNeighbourY = -1,
        minConn = -1,
        maxConn = 0,
        avgConn = -1,
        maxConnX = 0,
        avgConnX = -1,
        minConnX = -1,
        maxConnY = 0,
        avgConnY = -1,
        minConnY = -1,
        minNo = -1,
        maxNo = 0,
        avgNo = -1,
        maxNoX = 0,
        avgNoX = -1,
        minNoX = -1,
        maxNoY = 0,
        avgNoY = -1,
        minNoY = -1;

    for (i = 0; i < vl - 1; i++)
    {
        for (j = i + 1; j < vl; j++)
        {
            tmp = edgeLength(v[i], v[j]);
            tmpx = Math.abs(v[i].left - v[j].left);
            tmpy = Math.abs(v[i].top - v[j].top);
            if (buffer.neighbours[i][j])
            {
                if (minNeighbour < 0 || tmp < minNeighbour) {
                    minNeighbour = tmp;
                    minNeighbourX = tmpx;
                    minNeighbourY = tmpy;
                }
                if (tmp > maxNeighbour) {
                    maxNeighbour = tmp;
                    maxNeighbourX = tmpx;
                    maxNeighbourY = tmpy;
                }
                if (avgNeighbour < 0) {
                    avgNeighbour = tmp;
                    avgNeighbourX = tmpx;
                    avgNeighbourY = tmpy;
                }
                else {
                    avgNeighbour = (avgNeighbour + tmp) / 2;
                    avgNeighbourX = (avgNeighbourX + tmpx) / 2;
                    avgNeighbourY = (avgNeighbourY + tmpy) / 2;
                }
            }
            else
            {
                if (buffer.connected[i][j] != 0)
                {
                    if (minConn < 0 || tmp < minConn) {
                        minConn = tmp;
                        minConnX = tmpx;
                        minConnY = tmpy;
                    }
                    if (tmp > maxConn) {
                        maxConn = tmp;
                        maxConnX = tmpx;
                        maxConnY = tmpy;
                    }
                    if (avgConn < 0) {
                        avgConn = tmp;
                        avgConnX = tmpx;
                        avgConnY = tmpy;
                    }
                    else {
                        avgConn = (avgConn + tmp) / 2;
                        avgConnX = (avgConnX + tmpx) / 2;
                        avgConnY = (avgConnY + tmpy) / 2;
                    }
                }
                else
                {
                    if (minNo < 0 || tmp < minNo) {
                        minNo = tmp;
                        minNoX = tmpx;
                        minNoY = tmpy;
                    }
                    if (tmp > maxNo) {
                        maxNo = tmp;
                        maxNoX = tmpx;
                        maxNoY = tmpy;
                    }
                    if (avgNo < 0) {
                        avgNo = tmp;
                        avgNoX = tmpx;
                        avgNoY = tmpy;
                    }
                    else {
                        avgNo = (avgNo + tmp) / 2;
                        avgNoX = (avgNoX + tmpx) / 2;
                        avgNoY = (avgNoY + tmpy) / 2;
                    }
                }
            }
        }
        tmp = v[i].targets.length + v[i].sources.length;;
        if (minEdgeDeg < 0) minEdgeDeg = tmp;
        if (tmp < minEdgeDeg) minEdgeDeg = tmp;
        if (tmp > maxEdgeDeg) maxEdgeDeg = tmp;
        if (avgEdgeDeg < 0) avgEdgeDeg = tmp;
        else avgEdgeDeg = (avgEdgeDeg + tmp) / 2;
    }
    console.log('Fokszam:');
    console.log(' Min: ' + minEdgeDeg +' Atlag: ' + avgEdgeDeg.toFixed(2) + ' Max: ' + maxEdgeDeg);

    console.log('Csoport tavolsag (vektor hossz):');
    console.log(' Min: ' + minNeighbour.toFixed(0) +' Atlag: ' + avgNeighbour.toFixed(0) + ' Max: ' + maxNeighbour.toFixed(0));
    console.log('Tavolsag (x, y):');
    console.log(' Min: ' + minNeighbourX.toFixed(0) + ', ' + minNeighbourY.toFixed(0));
    console.log(' Atlag: ' + avgNeighbourX.toFixed(0) + ', ' +  avgNeighbourY.toFixed(0));
    console.log(' Max: ' + maxNeighbourX.toFixed(0) + ', ' +  maxNeighbourY.toFixed(0));

    console.log('Eltavolsag (csoport nelkul) (vektor hossz):');
    console.log(' Min: ' + minConn.toFixed(0) +' Atlag: ' + avgConn.toFixed(0) + ' Max: ' + maxConn.toFixed(0));
    console.log('Tavolsag (x, y):');
    console.log(' Min: ' + minConnX.toFixed(0) + ', ' + minConnY.toFixed(0));
    console.log(' Atlag: ' + avgConnX.toFixed(0) + ', ' +  avgConnY.toFixed(0));
    console.log(' Max: ' + maxConnX.toFixed(0) + ', ' +  maxConnY.toFixed(0));

    console.log('Tavolsag (se csoport, se el) (vektor hossz):');
    console.log(' Min: ' + minNo.toFixed(0) +' Atlag: ' + avgNo.toFixed(0) + ' Max: ' + maxNo.toFixed(0));
    console.log('Tavolsag (x, y):');
    console.log(' Min: ' + minNoX.toFixed(0) + ', ' + minNoY.toFixed(0));
    console.log(' Atlag: ' + avgNoX.toFixed(0) + ', ' +  avgNoY.toFixed(0));
    console.log(' Max: ' + maxNoX.toFixed(0) + ', ' +  maxNoY.toFixed(0));
    //pontszám élszám
    cl = 0;
    for (i = 0; i < vl; i++)
    {
        for (j = i + 1; j < vl; j++)
        {
            if (buffer.connected[i][j] != 0) cl++;
        }
    }
    console.log('Pontszam (|V|): ' + vl + ' Elszam (|E|): ' + cl);
    // kör sugara
    var centerX, centerY, R = 0;
    centerX = minLeft + dx / 2;
    centerY = minTop + dy / 2;
    for (i = 0; i < vl; i++)
    {
        tmp = pitagorasz(v[i].left, v[i].top, centerX, centerY);
        if (tmp > R) R = tmp;
    }
    console.log('Kor sugara: ' + R.toFixed(0));

    //csoport
    if (createGroups)
    {
        var minG = 0, maxG = 0, avgG = 0, gl = 0;
        gl = buffer.groups.length;
        avgG = minG = buffer.groups[0].vertexes.length;
        for (i = 1; i < gl; i++)
        {
            tmp = buffer.groups[i].vertexes.length;
            if (minG > tmp) minG = tmp;
            if (maxG < tmp) maxG = tmp;
            avgG = (avgG + tmp) / 2;
        }
        console.log('Csoport szam: ' + gl);
        console.log(' Min: ' + minG + ' Atlag: ' + avgG.toFixed(2)+ ' Max: ' + maxG);
    }

    //energy
    var E_Eades = 0, E_FR = 0,
        E_Eades_X = 0, E_Eades_Y = 0;
    var min_distance = 100;
    for (i = 0; i < vl; i++)
    {
        for (j = i + 1; j < vl; j++)
        {
            tmp = edgeLength(v[i], v[j]);
            tmpx = Math.abs(v[i].left - v[j].left);
            tmpy = Math.abs(v[i].top - v[j].top);
            min_distance = buffer.distance[i][j] * 100;
            if (buffer.connected[i][j] != 0 || buffer.neighbours[i][j])
            {
                if (tmp > 0) E_Eades += Math.abs(Math.log(tmp / min_distance) - 1 / (tmp * tmp));
                if (tmpx > 0) E_Eades_X += Math.abs(Math.log(tmpx / min_distance) - 1 / (tmpx * tmpx));
                if (tmpy > 0) E_Eades_Y += Math.abs(Math.log(tmpy / min_distance) - 1 / (tmpy * tmpy));
                E_FR += (tmp - min_distance) * (tmp - min_distance);
            }
            else
            {
                if (tmp > 0) E_Eades += 1 / (tmp * tmp);
                if (tmpx > 0) E_Eades_X += 1 / (tmpx * tmpx);
                if (tmpy > 0) E_Eades_Y += 1 / (tmpy * tmpy);
                if (tmp > 0 && tmp < 100) E_FR += (tmp - min_distance) * (tmp - min_distance);
            }
        }
    }
    console.log('Energia (Eades): ' + E_Eades.toFixed(4));
    console.log('Energia (Eades X): ' + (E_Eades_X).toFixed(4));
    console.log('Energia (Eades Y): ' + (E_Eades_Y).toFixed(4));
    console.log('Energia (FR): ' + E_FR.toFixed(0));

    //intersect
    var intersect = 0;
    var k, l;
    var v0, v1, v2, v3;
    for (i = 0; i < vl; i++)
    {
        v0 = buffer.vertexes[i];
        for (j = i + 1; j < vl; j++)
        {
            if (buffer.connected[i][j] != 0)
            {
                v1 = buffer.vertexes[j];
                for (k = i + 1; k < vl; k++)
                {
                    v2 = buffer.vertexes[k];
                    for (l = k + 1; l < vl; l++)
                    {
                        if (buffer.connected[k][l] != 0)
                        {
                            if (i==k || i==j || i==l ||  j==k || j==l) continue;
                            v3 = buffer.vertexes[l];
                            if (edgeIntersection(v0, v1, v2, v3)) intersect++;
                        }
                    }
                }
            }
        }
    }
    console.log('Elmetszesek szama: ' + intersect);
}

function edgeLength(v1, v2)
{
    var x = v1.left - v2.left;
    var y = v1.top - v2.top;
    return Math.sqrt(x*x + y*y);
}

function pitagorasz(x1, y1, x2, y2)
{
    var x = x1 - x2;
    var y = y1 - y2;
    return Math.sqrt(x*x + y*y);
}

function edgeIntersection(v0, v1, v2, v3)
{
    var p0_x = v0.left,
        p0_y = v0.top,
        p1_x = v1.left,
        p1_y = v1.top,
        p2_x = v2.left,
        p2_y = v2.top,
        p3_x = v3.left,
        p3_y = v3.top;
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;     s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;     s2_y = p3_y - p2_y;

    var s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    var t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        return true;
    }

    return false; // No collision
}


/*
function constructPath(shortestPathInfo, endVertex) {
    var path = [];
    while (endVertex != shortestPathInfo.startVertex) {
        path.unshift(endVertex);
        endVertex = shortestPathInfo.predecessors[endVertex];
    }
    return path;
}

function constructPathDistance(shortestPathInfo, endVertex) {
    var dist = 0;
    while (endVertex != shortestPathInfo.startVertex) {
        dist += shortestPathInfo.pathLengths[endVertex];
        endVertex = shortestPathInfo.predecessors[endVertex];
    }
    return dist;
}*/

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
