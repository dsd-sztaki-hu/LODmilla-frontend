/**
 * Created by Attila Gyorok on 2014.07.14..
 */

//Buffer classess for faster computing with the graph.
function Vertex(id, label, weight, isVirtual, left, top) {
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
}

/**
 * Buffer class for faster graph computing. First you need to add all the nodes, then you can add the connections.
 * @constructor
 */
function Buffer() {
    this.vertexes = [];
}

Vertex.prototype.addConnection = function(target_index, source_index)
{
    if (this.targets.indexOf(index) < 0) this.targets.push(index);
}

Vertex.prototype.clearConnections = function()
{
    this.targets = [];
}

Buffer.prototype.addVertex = function(id, label, weight, isVirtual, left, top)
{
    var index = this.vertexes.indexOf(id);
    if (index < 0) {
        var v = new Vertex(id, label, weight, isVirtual, left, top);
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
    if (targetIndex >= 0 && sourceIndex >= 0) source.addConnection(targetIndex, sourceIndex);
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
    for (var index in this.vertexes)
    {
        if (this.vertexes[index].id == id)
            return index;
    }
    return -1;
}