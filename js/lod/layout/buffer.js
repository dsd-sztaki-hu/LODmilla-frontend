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
    this.top = top;
    this.left = left;
    this.diffTop = 0;
    this.diffLeft = 0;
    this.type = type;
}

/**
 * Buffer class for faster graph computing. First you need to add all the nodes, then you can add the connections.
 * @constructor
 */
function Buffer() {
    this.vertexes = [];
}

Vertex.prototype.addTargetConnection = function(target_index)
{
    if (this.targets.indexOf(target_index) < 0) this.targets.push(target_index);
}

Vertex.prototype.addSourceConnection = function(source_index)
{
    if (this.sources.indexOf(source_index) < 0) this.sources.push(source_index);
}

Vertex.prototype.clearConnections = function()
{
    this.targets = [];
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

Buffer.prototype.addConnection = function(sourceID, targetID)
{
    var source = this.getVertexById(sourceID);
    var target = this.getVertexById(targetID);
    var targetIndex = this.getVertexIndex(target);
    var sourceIndex = this.getVertexIndex(source);
    if (targetIndex >= 0) source.addTargetConnection(targetIndex);
    if (sourceIndex >= 0) target.addSourceConnection(sourceIndex);
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
    var i, j;
    var count = 0;
    for (i in v1.targets)
    {
        for (j in v2.targets)
        {
            if (v1.targets[i] == v2.targets[j]) count++;
        }
        for (j in v2.sources)
        {
            if (v1.targets[i] == v2.sources[j]) count++;
        }
    }
    for (i in v1.sources)
    {
        for (j in v2.targets)
        {
            if (v1.sources[i] == v2.targets[j]) count++;
        }
        for (j in v2.sources)
        {
            if (v1.sources[i] == v2.sources[j]) count++;
        }
    }
    if (count == v1.targets.length + v1.sources.length) return true;
    return false;
}