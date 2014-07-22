/**
 * Created by Attila Gyorok on 2014.07.14..
 */

//detecting virtual nodes - the ones that are not visible, but can be predicted from the DB

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
            found = true;
            if (conn.pairs.indexOf(id) < 0) conn.pairs.push(id);
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
            found = true;
            if (conn.pairs.indexOf(id) < 0) conn.pairs.push(id);
        }
    }
    if (!found)
    {
        this.outConns.push( new ConnectionHolder(targetId, id) );
    }
}

function addVirtualNodes(buffer, virtualWeight)
{
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

    //add virtual nodes to the visible nodes

    //incoming connections
    var virtualcounter = 0;
    for (var index in cc.inConns) {
        i = cc.inConns[index];
        if (i.pairs.length > 1) {
            var v = buffer.addVertex(i.id, "virtual_" + virtualcounter, virtualWeight, true, 0, 0, "virtual_" + virtualcounter++);
            var v_zero = buffer.getVertexById(i.pairs[0]);
            var center_left = v_zero.left, center_top = v_zero.top;
            var length = i.pairs.length;
            var v_index = buffer.getVertexIndex(v);
            for (var index2 in i.pairs) {
                //var tindex = buffer.getVertexIndexById(i.pairs[index2]);
                var d_v = buffer.getVertexById(i.pairs[index2]);
                buffer.addConnection(v.id, d_v.id);
//                var d_v = buffer.getVertexByIndex(tindex);
                center_left = (center_left + d_v.left) / 2.0; //this is not necessary for the first time
                center_top = (center_top + d_v.top) / 2.0; //but a lot cleaner this way
            }
            v.left = center_left; //placing the virtual nodes in the center of the visible nodes
            v.top = center_top;
        }
    }

    //outgoing connections
    for (var index in cc.outConns) {
        i = cc.outConns[index];
        if (i.pairs.length > 1) {
            var v = buffer.addVertex(i.id, "virtual_" + virtualcounter++, virtualWeight, true, 0, 0, "virtual_" + virtualcounter++);
            var v_zero = buffer.getVertexById(i.pairs[0]);
            var center_left = v_zero.left, center_top = v_zero.top;
            for (var index2 in i.pairs) {
                var t = buffer.getVertexById(i.pairs[index2]);
                buffer.addConnection(t.id, v.id);
                center_left = (center_left + t.left) / 2.0;
                center_top = (center_top + t.top) / 2.0;
            }
            v.left = center_left;
            v.top = center_top;
        }
    }
}

function addVirtualTypeNodes(buffer, virtualWeight)
{
    //known unseen virtual points
    //connection match from the database

    var cc = new ConnectionCounter();
    for (var index in Graph.nodes)
    {
        i = Graph.nodes[index];
        cc.addOutgoingConnection(i.resource_id, i.type);
    }
    var virtualcounter = 0;
    //add virtual nodes to the visible nodes
    //outgoing connections
    for (var index in cc.outConns) {
        i = cc.outConns[index];
        if (i.pairs.length > 1) {
            var v = buffer.addVertex(i.id, "virtual_" + virtualcounter++, virtualWeight, true, 0, 0, "virtual_" + virtualcounter++);
            var v_zero = buffer.getVertexById(i.pairs[0]);
            var center_left = v_zero.left, center_top = v_zero.top;
            for (var index2 in i.pairs) {
                var t = buffer.getVertexById(i.pairs[index2]);
                buffer.addConnection(t.id, v.id);
                center_left = (center_left + t.left) / 2.0;
                center_top = (center_top + t.top) / 2.0;
            }
            v.left = center_left;
            v.top = center_top;
        }
    }
}