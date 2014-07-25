/**
 * Created by Attila Gyorok on 2014.07.23..
 * Source: http://jsfiddle.net/hybrid13i/JXrwM/, http://jsfiddle.net/sturtevant/AZFvQ/
 */

function getColor(type)
{
    if (type == "work") return "#feeacb";
    if (type == "group") return "#e5ecf1";
    return "#e0f5d6";
}

function exportToDot() {

    var dot = '';
    dot += "digraph " + $("#graph_name").val() + "{\r\n"
    $.each(Graph.nodes, function(index, node) {
        dot += '\"' + node.resource_id + "\"[label=\"" + node.label
            + "\" pos=\"" + node.left + "," + node.top + "!\""
            + " fillcolor=\"" + getColor(node.type) + "\""
            + " shape=box style=filled"
            + "]\n";
    });
    var conns = jsPlumbInstance.getAllConnections();
    $.each(conns, function() {
        var source = $(this.source).attr('uri');
        var target = $(this.target).attr('uri');
        var overlay = this.getOverlay("label");
        dot += '\"' + source +'\"->' + '\"' + target + '\"' + '[label=\"' + overlay.label + '\"]\n';
    });

    dot += "}"

    //Generate a file name
    var fileName = "LODmilla_graph";

    //Initialize file format you want csv or xls
    var uri = 'data:text;charset=utf-8,' + escape(dot);

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".gv";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

