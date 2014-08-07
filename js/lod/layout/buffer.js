/**
 * Created by Attila Gyorok on 2014.07.14..
 */

//Buffer classess for faster computing with the graph.
function Vertex(id, label, weight, isVirtual, left, top, type) {
    this.id = id;
    this.label = label; //for debugging
    this.weight = weight;
    this.isvVirtual = isVirtual;
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
}

/**
 * Buffer class for faster graph computing. First you need to add all the nodes, then you can add the connections.
 * @constructor
 */
function Buffer() {
    this.vertexes = [];
    this.neighbours = []; //they are connected to the same nodes
    this.connected = [];
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
    if (targetIndex > -1) this.vertexes[sourceIndex].addTargetConnection(targetIndex, label);
    if (sourceIndex > -1) this.vertexes[targetIndex].addSourceConnection(sourceIndex, label);
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