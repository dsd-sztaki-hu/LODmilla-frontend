/**
 * Created by Attila Gyorok on 2014.07.14..
 */

//Buffer classess for faster computing with the graph.
function Vertex(id, label, weight, isVirtual, left, top, type) {
    this.id = id;
    this.label = label; //for debugging
    this.weight = weight;
    this.isVirtual = isVirtual;
    this.targets = [];
    this.sources = [];
    this.targetLabels = [];
    this.sourceLabels = [];
    this.top = top;
    this.left = left;
    this.diffTop = 0;
    this.diffLeft = 0;
    this.type = type;
    this.inConnCounter = 0;
    this.outConnCounter = 0;
    this.gridX = 0;
    this.gridY = 0;
    this.inGroup = false;
    this.allConnCounter = 0;
}

function Group(id) {
    this.id = id;
    this.vertexes = [];
    this.label = ""; //for debugging
    this.weight = 1;
    this.isVirtual = false;
    this.connections = [];
    this.top = 0;
    this.left = 0;
    this.diffTop = 0;
    this.diffLeft = 0;
    this.type = "";
    this.gridX = 0;
    this.gridY = 0;
    this.theta = 0;
    this.gamma = 0;
    this.level = 0;
}

/**
 * Buffer class for faster graph computing. First you need to add all the nodes, then you can add the connections.
 * @constructor
 */
function Buffer() {
    this.vertexes = [];
    this.neighbours = []; //they are connected to the same nodes
    this.connected = [];
    this.groups = [];
    this.groupsConnected = [];
    this.distance = [];
    this.groupDistance = [];
}

Vertex.prototype.addTargetConnection = function(target_index, label)
{
    this.outConnCounter++;
    var index = this.targets.indexOf(target_index);
    if (index < 0)
    {
        this.targets.push(target_index);
        var label_index = this.targets.length - 1;
        this.targetLabels[label_index] = [];
        this.targetLabels[label_index].push(label);
    }
    else
    {
        this.targetLabels[index].push(label);
    }
}

Vertex.prototype.addSourceConnection = function(source_index, label)
{
//    if (this.sources.indexOf(source_index) < 0) this.sources.push(source_index);
    this.inConnCounter++;
    var index = this.sources.indexOf(source_index);
    if (index < 0)
    {
        this.sources.push(source_index);
        var label_index = this.sources.length - 1;
        this.sourceLabels[label_index] = [];
        this.sourceLabels[label_index].push(label);
    }
    else
    {
        this.sourceLabels[index].push(label);
    }
}

Group.prototype.addVertex = function(vertex)
{
    this.vertexes.push(vertex);
    vertex.inGroup = true;
}

Buffer.prototype.addVertex = function(id, label, weight, isVirtual, left, top, type)
{
    var index = this.vertexes.indexOf(id);
    if (index < 0) {
        var v = new Vertex(id, label, weight, isVirtual, left, top, type);
        this.vertexes.push(v);
        return v;
    }
    else
    {
        console.log("Vertex already exist: " + id + " - " + label);
        return this.vertexes[index];
    }
}

Buffer.prototype.addConnection = function(sourceID, targetID, label)
{
    var targetIndex = this.getVertexIndexById(targetID);
    var sourceIndex = this.getVertexIndexById(sourceID);
    if (targetIndex > -1 && sourceIndex > -1) {
        this.vertexes[sourceIndex].addTargetConnection(targetIndex, label);
        this.vertexes[targetIndex].addSourceConnection(sourceIndex, label);
    }
}

Buffer.prototype.clear = function()
{
    this.vertexes = [];
}

Buffer.prototype.getVertexByIndex = function(index)
{
    return this.vertexes[index];
}

Buffer.prototype.getVertexById = function(id)
{
    for (var index in this.vertexes)
    {
        if (this.vertexes[index].id == id)
            return this.vertexes[index];
    }
    return null;
}

Buffer.prototype.getVertexIndex = function(vertex)
{
    var length = this.vertexes.length;
    for (var i = 0; i < length; i++)
    {
        if (this.vertexes[i].id == vertex.id)
            return i;
    }
    return -1;
}

Buffer.prototype.getVertexIndexById = function(id)
{
    var length = this.vertexes.length
    for (var index = 0; index < length; index++)
    {
        if (this.vertexes[index].id == id)
            return index;
    }
    return -1;
}
/*
Buffer.prototype.areNeighbours = function(index1, index2)
{
    var v1 = this.getVertexByIndex(index1);
    var v2 = this.getVertexByIndex(index2);
    var i, j, k, l;
    var count1 = 0, count2 = 0, match = 0;
    for (i in v1.targets)
    {
        for (j in v2.targets)
        {
            if (v1.targets[i] == v2.targets[j])
            {
                for (k in v1.targetLabels[i])
                {
                    for (l in v2.targetLabels[j])
                    {
                        if (v1.targetLabels[i][k] == v2.targetLabels[j][l]) match++;
                    }
                }
                count1++;
                count2 += 2 * v1.targetLabels[i].length - v2.targetLabels[j].length;
            }
        }
    }
    for (i in v1.sources)
    {
        for (j in v2.sources)
        {
            if (v1.sources[i] == v2.sources[j])
            {
                for (k in v1.sourceLabels[i])
                {
                    for (l in v2.sourceLabels[j])
                    {
                        if (v1.sourceLabels[i][k] == v2.sourceLabels[j][l]) match++;
                    }
                }
                count1++;
                count2 += 2 * v1.sourceLabels[i].length - v2.sourceLabels[j].length;
            }
//            if (v1.sources[i] == v2.sources[j]) count++;
        }
    }
    if (match > 0 && match == count2 && count1 == v1.targets.length + v1.sources.length)
        return true;
//    if (count == v1.targets.length + v1.sources.length) return true;
    return false;
//    return true;
}*/

Buffer.prototype.areNeighbours = function(index1, index2)
{
    var v1 = this.getVertexByIndex(index1);
    var v2 = this.getVertexByIndex(index2);
    var i, j, k, l;
    var match = 0, count = 0;
    if (v1.targets.length != v2.targets.length) return false;
    for (i in v1.targets)
    {
        count = 0;
        for (j in v2.targets)
        {
            if (v1.targets[i] == v2.targets[j])
            {
                if (v1.targetLabels[i].length != v2.targetLabels[j].length) return false;
                match = 0;
                for (k in v1.targetLabels[i])
                {
                    for (l in v2.targetLabels[j])
                    {
                        if (v1.targetLabels[i][k] == v2.targetLabels[j][l]) match++;
                    }
                }
                if (match != v1.targetLabels[i].length) return false;
            }
            else count++;
        }
        if (count == v2.targets.length) return false;
    }
    if (v1.sources.length != v2.sources.length) return false;
    for (i in v1.sources)
    {
        count = 0;
        for (j in v2.sources)
        {
            if (v1.sources[i] == v2.sources[j])
            {
                if (v1.sourceLabels[i].length != v2.sourceLabels[j].length) return false;
                match = 0;
                for (k in v1.sourceLabels[i])
                {
                    for (l in v2.sourceLabels[j])
                    {
                        if (v1.sourceLabels[i][k] == v2.sourceLabels[j][l]) match++;
                    }
                }
                if (match != v1.sourceLabels[i].length) return false;
            }
            else count++;
        }
        if (count == v2.sources.length) return false;
    }
    return true;
    //if (match > 0 && match == count2 && count1 == v1.targets.length + v1.sources.length)
        //return true;
//    if (count == v1.targets.length + v1.sources.length) return true;
    //return false;
//    return true;
}

Buffer.prototype.createConnectionMap = function()
{
    var i, j, jl = this.vertexes.length, il = jl -1;
    var i_node, j_node;
    this.connected = [];
    for (i = 0; i < il; i++)
    {
        i_node = this.vertexes[i];
        for (j = i + 1; j < jl; j++)
        {
            j_node = this.vertexes[j];
            if (i_node.targets.indexOf(j) > -1) {
                if (this.connected[i] === undefined) this.connected[i] = [];
                this.connected[i][j] = 1;
                if (this.connected[j] === undefined) this.connected[j] = [];
                this.connected[j][i] = -1;
            }
            else {
                if (j_node.targets.indexOf(i) > -1)
                {
                    if (this.connected[i] === undefined) this.connected[i] = [];
                    this.connected[i][j] = -1;
                    if (this.connected[j] === undefined) this.connected[j] = [];
                    this.connected[j][i] = 1;
                }
                else {
                    if (this.connected[i] === undefined) this.connected[i] = [];
                    this.connected[i][j] = 0;
                    if (this.connected[j] === undefined) this.connected[j] = [];
                    this.connected[j][i] = 0;
                }
            }
        }
    }
}

Buffer.prototype.createNeighboursMap = function()
{
    var i, j, jl = this.vertexes.length, il = jl -1;
    this.neighbours = [];
    for (i = 0; i < il; i++)
    {
        for (j = i + 1; j < jl; j++)
        {
            if (this.areNeighbours(i,j)) {
                if (this.neighbours[i] === undefined) this.neighbours[i] = [];
                this.neighbours[i][j] = true;
                if (this.neighbours[j] === undefined) this.neighbours[j] = [];
                this.neighbours[j][i] = true;
            }
            else {
                if (this.neighbours[i] === undefined) this.neighbours[i] = [];
                this.neighbours[i][j] = false;
                if (this.neighbours[j] === undefined) this.neighbours[j] = [];
                this.neighbours[j][i] = false;
            }
        }
    }
}

Buffer.prototype.isGroupsConnected = function(g1, g2)
{
    var v1 = g1.vertexes,
        v2 = g2.vertexes;
    var g1l = v1.length,
        g2l = v2.length;
    var i, j;
    var act1, act2;
    var counter = 0;
    for (i = 0; i < g1l; i++)
    {
        act1 = this.getVertexIndex(v1[i]);
        for (j = 0; j < g2l; j++)
        {
            act2 = this.getVertexIndex(v2[j]);
            if (this.connected[act1][act2])
            {
                counter++;
            }
        }
    }
    return counter;
}

Buffer.prototype.createGroups = function()
{
    var i, j, jl = this.vertexes.length, il = jl;
    var v = this.vertexes;
    var db = 0;
    var group = null;
    for (i = 0; i < il; i++)
    {
        if (v[i].inGroup) continue;
        group = new Group(db);
        db++;
        group.addVertex(v[i]);
        this.groups.push(group);
        for (j = i + 1; j < jl; j++)
        {
            if (v[j].inGroup) continue;
            if (this.neighbours[i][j]) {
                group.addVertex(v[j]);
            }
        }
    }
    var g = this.groups;
    jl = this.groups.length;
    il = jl -1;
    for (i = 0; i < il; i++)
    {
        for (j = i + 1; j < jl; j++)
        {
            db = this.isGroupsConnected(g[i], g[j]);
            if (this.groupsConnected[i] === undefined) this.groupsConnected[i] = [];
            this.groupsConnected[i][j] = db;
            if (this.groupsConnected[j] === undefined) this.groupsConnected[j] = [];
            this.groupsConnected[j][i] = db;
            if (db > 0) {
                g[i].connections.push(g[j]);
                g[j].connections.push(g[i]);
            }
        }
    }
}

Buffer.prototype.createDistanceMap = function()
{
    //path
    var dijkstra = [];
    var conn;
    var vl = this.vertexes.length;
    var i, j, v0;
    for (i = 0; i < vl; i++)
    {
        dijkstra[i] = [];
        for (j = 0; j < vl; j++)
        {
            conn = Math.abs(this.connected[i][j]);
            if (conn != 0)
            {
                dijkstra[i][j] = conn;
            }
            else
            {
                if (this.neighbours[i][j])
                {
                    dijkstra[i][j] = 1;
                }
                else
                {
                    dijkstra[i][j] = Infinity;
                }
            }
        }
    }
    for (i = 0; i < vl; i++)
    {
        v0 = this.vertexes[i];
        var shortestPathInfo = shortestPath(dijkstra, vl, i);
        this.distance[i] = [];
        for (j = 0; j < vl; j++)
        {
            this.distance[i][j] = shortestPathInfo.pathLengths[j];
            //var path = constructPathDistance(shortestPathInfo, j);
            //console.log(v0.label + ' - ' + buffer.vertexes[j].label + ': ' + shortestPathInfo.pathLengths[j])
        }
    }
}

Buffer.prototype.createGroupDistanceMap = function()
{
    //path
    var dijkstra = [];
    var conn;
    var vl = this.groups.length;
    var i, j, v0;
    for (i = 0; i < vl; i++)
    {
        dijkstra[i] = [];
        for (j = 0; j < vl; j++)
        {
            conn = Math.abs(this.groupsConnected[i][j]);
            if (conn != 0)
            {
                //dijkstra[i][j] = conn;
                dijkstra[i][j] = 1;
            }
            else
            {
                dijkstra[i][j] = Infinity;
            }
        }
    }
    for (i = 0; i < vl; i++)
    {
        v0 = this.groups[i];
        var shortestPathInfo = shortestPath(dijkstra, vl, i);
        this.groupDistance[i] = [];
        for (j = 0; j < vl; j++)
        {
            this.groupDistance[i][j] = shortestPathInfo.pathLengths[j];
        }
    }
}

//base from Cameron McCormack <cam (at) mcc.id.au> Dijkstra's single source shortest path algorithm in JavaScript
function shortestPath(edges, numVertices, startVertex) {
    var done = new Array(numVertices);
    done[startVertex] = true;
    var pathLengths = new Array(numVertices);
    var predecessors = new Array(numVertices);
    for (var i = 0; i < numVertices; i++) {
        pathLengths[i] = edges[startVertex][i];
        if (edges[startVertex][i] != Infinity) {
            predecessors[i] = startVertex;
        }
    }
    pathLengths[startVertex] = 0;
    for (var i = 0; i < numVertices - 1; i++) {
        var closest = -1;
        var closestDistance = Infinity;
        for (var j = 0; j < numVertices; j++) {
            if (!done[j] && pathLengths[j] < closestDistance) {
                closestDistance = pathLengths[j];
                closest = j;
            }
        }
        done[closest] = true;
        for (var j = 0; j < numVertices; j++) {
            if (!done[j]) {
                var possiblyCloserDistance = pathLengths[closest] + edges[closest][j];
                if (possiblyCloserDistance < pathLengths[j]) {
                    pathLengths[j] = possiblyCloserDistance;
                    predecessors[j] = closest;
                }
            }
        }
    }
    return { "startVertex": startVertex,
        "pathLengths": pathLengths,
        "predecessors": predecessors };
}

Buffer.prototype.createConnectionCost = function()
{
    var conn;
    var vl = this.vertexes.length;
    var counter = 0;
    for (i = 0; i < vl; i++)
    {
        counter = 0;
        for (j = 0; j < vl; j++)
        {
            conn = Math.abs(this.connected[i][j]);
            if (conn != 0)
            {
                counter++;
            }
            else
            {
                if (this.neighbours[i][j])
                {
                    counter++;
                }
            }
        }
        this.vertexes[i].allConnCounter = counter;
    }
}