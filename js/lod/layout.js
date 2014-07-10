/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2014 Attila Gyorok, Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

/**
 * Places the nodes on a grid structure.
 */
function applyGridLayout() {
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

//Buffer classess for faster computing with the graph.
function Vertex(id, label, weight) {
    this.id = id;
    this.label = label; //for debugging
    this.weight;
    this.targets = [];
}

/**
 * Buffer class for faster graph computing. First you need to add all the nodes, then you can add the connections.
 * @constructor
 */
function Buffer() {
    this.vertexes = [];
}

Vertex.prototype.addConnection = function(index)
{
    this.targets.push(index);
}

Vertex.prototype.clearConnections = function()
{
    this.targets = [];
}

Buffer.prototype.addVertex = function(id,weight)
{
    this.vertexes.push( new Vertex(id, weight) );
}

Buffer.prototype.addConnection = function(sourceID, targetID)
{
    var source = this.getVertexById(sourceID);
    var target = this.getVertexById(targetID);
    var targetIndex = this.getVertexIndex(target);
    if (targetIndex >= 0) source.addConnection(targetIndex);
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
    for (var index in this.vertexes)
    {
        if (this.vertexes[index].id == vertex.id)
            return index;
    }
    return -1;
}

//detecting virtual nodes

function ConnectionHolder(id, targetId) {
    this.id = id;
    this.pairs = [];
    this.pairs.push(targetId);
}

function ConnectionCounter() {
    this.inConns = [];
    this.outConns = [];
}

/**
 * Adds an incoming connection to the list.
 * @param id This is the connection's target id.
 * @param sourceId This is the connection's source id.
 */
ConnectionCounter.prototype.addIncomingConnection = function(id, sourceId)
{
    var found = false;
    for (var index in this.inConns)
    {
        var conn = this.inConns[index];
        if (conn.id == sourceId)
        {
            conn.pairs.push(id);
            found = true;
        }
    }
    if (!found)
    {
        this.inConns.push( new ConnectionHolder(sourceId, id) );
    }
}

/**
 * Adds an outgoing connection to the list.
 * @param id This is the connection's source id.
 * @param targetId This is the connection's target id.
 */
ConnectionCounter.prototype.addOutgoingConnection = function(id, targetId)
{
    var found = false;
    for (var index in this.outConns)
    {
        var conn = this.outConns[index];
        if (conn.id == targetId)
        {
            conn.pairs.push(id);
            found = true;
        }
    }
    if (!found)
    {
        this.outConns.push( new ConnectionHolder(targetId, id) );
    }
}


/**
 * Force based simulation graph layout.
 */
function applySpringLayout() {
    var R = 1;
    var dist = 1;
    var i,j;
    var buffer = new Buffer();
    //loading nodes to buffer
    for (var index in Graph.nodes)
    {
        buffer.addVertex(Graph.nodes[index].resource_id, Graph.nodes[index].label, 1);
    }

    //loading edges to buffer
    var conns = jsPlumbInstance.getAllConnections();
    $.each(conns, function() {
        var source = $(this.source).attr('uri');
        var target = $(this.target).attr('uri');
        buffer.addConnection(source, target);
    });

    //known unseen virtual points
    //connection match from the database
    var cc = new ConnectionCounter();
    for (var index in Graph.nodes)
    {
        i = Graph.nodes[index];
        for (var index2 in i.connections)
        {
            var c = i.connections[index2];
            if (c.direction == "out")
                cc.addOutgoingConnection(i.resource_id, c.target);
            else
                cc.addIncomingConnection(i.resource_id, c.target);
        }
    }
/*
    j = Graph.nodes[index2];
    for (var index3 = 0; index3 < length; index3++) {
        connection = i.Connections[index3];
        target = decodeURIComponent(connection.label);
        buffer.addConnection(index, target);
    }
*/
    animateMovement("slow");
    console.log("Spring layout finished");
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
