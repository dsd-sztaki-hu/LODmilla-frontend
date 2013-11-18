/*
 * Class:Profile
 */
var Profile = new function() {
    this.minNodeDistance = 150;
    this.maxRadiusAroundNode = 250;
    this.maxNodePlaceIter = 50;
    this.nodeHeight = 135;
    this.nodeWidth = 125;
    this.panelWidth = 300;
    this.sidemenuWidth = 200;
    this.buttonsHeight = 50;
    
    this.serverProxyUrl = 'http://munkapad.sztaki.hu/lodback/';

    this.defaultConnectionsColor = "#056";
    this.highlightedConnectionsColor = "#f00";

    this.nodeLabelMaxLength = 30;

    this.addNewResourceSearchDelay = 500;

    this.addNewResourceSearchMaxHits = 20;
    this.addNewResourceSearchMaxTitleLen = 40;
    this.addNewResourceSearchMinLength = 3;

    this.searchMaxHits = 20;
    this.searchMaxTitleLen = 40;
    this.searchMinLength = 3;

    this.propertyLabels = {};

    this.alertTexts = {
        'loadGraph': {
            'title': 'Problem with the backend server',
            'text': 'No load and save operations are working right now. Please try it again later!'
        },
        'findPathNodesSelected': {
            'title': 'Problem with finding the path',
            'text': 'Please select exactly 2 nodes! (temporary limitation)'
        },
        'findPathNodesResult': {
            'title': 'Problem with finding the path',
            'text': 'Server error! Path not found!'
        },
        'findPathNodesIdle': {
            'title': 'Problem with finding the path',
            'text': 'Previous path finding is still in progress!'
        },
        'searchRemoteSelected': {
            'title': 'Problem with remote search',
            'text': 'Please select at least 1 node!'
        },
        'searchRemoteSearchText': {
            'title': 'Problem with remote search',
            'text': 'No text to search has been given!'
        },
        'searchRemoteResult': {
            'title': 'Problem with remote search',
            'text': 'Server error! Result not found!'
        },
        'searchRemoteIdle': {
            'title': 'Problem with remote search',
            'text': 'Previous searching is still in progress!'
        },
        'searchConnectionSelected': {
            'title': 'Problem with remote connection search',
            'text': 'Please select at least 1 node!'
        },
        'searchConnectionSearchText': {
            'title': 'Problem with remote connection search',
            'text': 'No text to search has been given!'
        },
        'searchConnectionResult': {
            'title': 'Problem with remote connection search',
            'text': 'Server error! Result not found!'
        },
        'searchConnectionIdle': {
            'title': 'Problem with remote connection search',
            'text': 'Previous searching is still in progress!'
        }
    };

    this.searchURLs = {
        'dbpedia': 'http://lookup.dbpedia.org/api/search.asmx/PrefixSearch?QueryClass=&MaxHits=' + this.addNewResourceSearchMaxHits.toString() + '&QueryString={SEARCH_TERM}',
        'sztaki': [
            'http://lod.sztaki.hu/sparql?default-graph-uri=&should-sponge=&query=select+%3Fs1%2C+%3Fo1%2C+max%28%3Fsc%29+as+%3Frank%0D%0Awhere+{++%0D%0A++%3Fs1+rdfs%3Alabel+%3Fo1+.+%3Fo1+bif%3Acontains++%27%22',
            '%22%27++option+%28score+%3Fsc%29++.+%0D%0AFILTER%28lang%28%3Fo1%29%3D%27%27%29.%0D%0A}+group+by+%3Fs1+%3Fo1+order+by+desc+%28%3Frank%29+%3Fo1+limit+' + this.addNewResourceSearchMaxHits.toString() + '++offset+0+%0D%0A&debug=on&timeout=&format=application%2Fsparql-results%2Bxml&save=display&fname='
        ]
    };

    // props to get the label for nodes, with ascending priority
    this.labelURIs = {
        '0': 'http://rdf.freebase.com/ns/type.object.name',
        '1': 'http://xmlns.com/foaf/0.1/name',
        '2': 'http://www.w3.org/2000/01/rdf-schema#label'
    };
    // wired property labels, somehow they dont get it automatically(?). Extend the list if needed :)
    this.labelsManual = {
        'http://www.w3.org/2002/07/owl#sameAs': 'Same as'
    };

    this.geoProperties = new Array(
        "http://www.w3.org/2003/01/geo/wgs84_pos#geometry",
        "http://www.georss.org/georss/point",
        "http://www.w3.org/2003/01/geo/wgs84_pos#lat",
        "http://www.w3.org/2003/01/geo/wgs84_pos#long"
    );

    this.externalLinkProperties = new Array(
        "http://dbpedia.org/ontology/wikiPageExternalLink",
        "http://dbpedia.org/property/hasPhotoCollection",
        "http://xmlns.com/foaf/0.1/homepage",
        "http://dbpedia.org/property/website"
    );

    this.commonURIs = {
        'propThumbnailURI': "http://dbpedia.org/ontology/thumbnail",
        'propDepictionURI': "http://xmlns.com/foaf/0.1/depiction",
        'propTypeURI': "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        'propOntologyURI': 'http://dbpedia.org/ontology/',
        'propPropertyURI': 'http://dbpedia.org/property/'
    };

    this.nodeTypesDefaultImages = {
        'noEndpoint': 'img/default-rdf-type-noendpoint-32.png',
        'thingEmpty': 'img/default-rdf-type-thing-empty-32.png',
        'person': 'img/default-rdf-type-person-32.png',
        'group': 'img/default-rdf-type-group-32.png',
        'work': 'img/default-rdf-type-work-32.png',
        'agent': 'img/default-rdf-type-person-32.png'
    };
    this.nodeTypesImagesURLs = {
        'sztaki': {
            'person': 'http://www.sztaki.hu/sztatik/getbinarydata.php?dn=niifUniqueId={RESOURCE_ID},ou=People,o=SZTAKI,o=NIIF,c=HU&attrib=photo',
            'work': 'http://www.sztaki.hu/sztatik/getbinarydata.php?dn=documentIdentifier={RESOURCE_ID},ou=Publications,o=sztaki,o=niif,c=hu&attrib=jpegphoto'
        }
    };

    // regexp for searching images in the connections
    this.findImagesRegexp = "^http.*(jpg|png|gif|svg)$";

    this.defaultNodeType = 'default';
    this.unloadedNodeType = 'unloaded';

    this.nodeTypes = {
        'person': ['http://xmlns.com/foaf/0.1/Person', 'http://dbpedia.org/ontology/Person', 'http://schema.org/Person'],
        'group': ['http://xmlns.com/foaf/0.1/Group'],
        'work': ['http://dbpedia.org/ontology/Work', 'http://schema.org/CreativeWork'],
        'agent': ['http://xmlns.com/foaf/0.1/Agent']
    };

    this.services = new Array();

    this.QueryString = function() {
        // This function is anonymous, is executed immediately and 
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], pair[1]];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
        return query_string;
    }();

    this.util_truncateString = function(str, maxlen) {
        if (str && str.length > maxlen) {
            str = str.substring(0, maxlen) + '..';
        }
        return str;
    };

    this.util_getCapitalizedString = function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    this.getEndpointLabelOrUriEnd = function(item, direction) {
        var label = decodeURIComponent(item[direction].value);
        if (item.label && item.label.value) {
            label = item.label.value;
        }
        else {
            label = label.replace(/\/+$/, "").split('/');
            label = label[(label.length) - 1];
        }
        return label;
    };

    this.getShortTypeFromURL = function(node_uri) {
        while (node_uri.indexOf('/') > -1) {
            node_uri = node_uri.substring(node_uri.indexOf('/') + 1);
        }
        while (node_uri.indexOf('#') > -1) {
            node_uri = node_uri.substring(node_uri.indexOf('#') + 1);
        }
        return node_uri;
    };

    this.getLodServerBaseUrl = function(uri) {
        var temp = uri.replace('http://', '');
        return 'http://' + temp.substring(0, temp.indexOf('/'));
    };

    this.getPropertyLabel = function(propertyURI) {
        var propLabel = '';
        if (this.propertyLabels[propertyURI] && this.propertyLabels[propertyURI] !== '')
            propLabel = this.propertyLabels[propertyURI];
        else
            propLabel = this.getShortTypeFromURL(propertyURI);

        if (this.labelsManual[propertyURI] !== undefined)
            propLabel = this.labelsManual[propertyURI];

        return propLabel;
    };

    this.getPropertyIfGeo = function(prop, propValue, content, label) {
        var retVal = '';
        var lat = '';
        var long = '';
        propValue = propValue.toLowerCase();
        if (this.geoProperties.indexOf(prop) >= 0) {
            if (prop === 'http://www.w3.org/2003/01/geo/wgs84_pos#geometry') {
                propValue = propValue.replace('point', '').replace('(', '').replace(')', '');
                lat = propValue.split(' ')[1];
                long = propValue.split(' ')[0];
            }
            else if (prop === 'http://www.georss.org/georss/point') {
                lat = propValue.split(' ')[0];
                long = propValue.split(' ')[1];
            }
            else if (prop === 'http://www.w3.org/2003/01/geo/wgs84_pos#lat') {
                lat = propValue;
                if (content && content['http://www.w3.org/2003/01/geo/wgs84_pos#long']) {
                    long = content['http://www.w3.org/2003/01/geo/wgs84_pos#long'][0];
                }
            }
            else if (prop === 'http://www.w3.org/2003/01/geo/wgs84_pos#long') {
                if (content && content['http://www.w3.org/2003/01/geo/wgs84_pos#lat']) {
                    lat = content['http://www.w3.org/2003/01/geo/wgs84_pos#lat'][0];
                }
                long = propValue;
            }
            retVal = 'http://maps.googleapis.com/maps/api/staticmap?size=800x600&maptype=roadmap&sensor=false&zoom=6&markers=color:blue%7Clabel:' + label + '%7C' + lat + ',' + long;
        }

        return retVal;

    };
    this.isPropertyExternalLink = function(propValue) {
        if (this.externalLinkProperties.indexOf(propValue) >= 0)
            return true;
        else
            return false;
    };

    this.getPropertyIfImage = function(target, label, connectionType, propertyUri) {
        var retval = "";
        var patt = new RegExp(this.findImagesRegexp, "i");
        var isImage = false;
        if ((target !== null && patt.test(target)) || (target === null && label !== null && patt.test(label))) {
            isImage = true;
        }
        if (connectionType === 'literals') {
        }
        else {
            retval = $("<a refProp='" + propertyUri + "' refPropVal='" + target + "' class='property-value-normal' rel='group'></a>");
            if (isImage === true && target !== null) {
                // Image
                retval
                        .addClass('fancybox')
                        .attr('href', target)
                        .append("<img src='" + target + "' alt=\"\" />");
            } else if (isImage === true && label !== null) {
                // Image
                retval
                        .addClass('fancybox')
                        .attr('href', label)
                        .append("<img src='" + label + "' alt=\"\" />");
            } else if (this.isPropertyExternalLink(propertyUri)) {
                // External link
                retval
                        .attr('href', target)
                        .attr('target', '_blank')
                        .append(label.replace(/_/g, " "));
            } else if (!isImage) {
                retval
                        .addClass('handlehere')
                        .attr('href', target)
                        .append(label.replace(/_/g, " "));
            } else if (!isImage && label !== null) {
                retval = label.replace(/_/g, " ");
                return retval;
            }
        }

        return retval.prop('outerHTML');
    };

    this.addService = function(name, shortDescription, description, endpoint, prefix, graph, sparqlTemplates) {
        var s = new Service(name, shortDescription, description, endpoint, prefix, graph, sparqlTemplates);
        this.services.push(s);
    };

    this.alertDialog = function(title, text) {
        if ($("#alert-dialog").length) {
            return;
        }
        $('#main').append('<div id="alert-dialog" title="' + title + '"><p><span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0;"></span>' + text + '</p></div>');
        $("#alert-dialog").dialog({
            autoOpen: true,
            height: 200,
            width: 400,
            modal: true,
            buttons: {
                "Close": function() {
                    $(this).dialog("close");
                }
            },
            close: function() {
                $(this).remove();
            }
        });
    };

    this.init = function() {
        var self = this;
        var jqxhr = $.ajax({
            type: "GET",
            dataType: "json",
            url: "js/lod/services.json",
            async: false,
            data: {}
        }).done(function(json) {
            $.each(json, function(key, value) {
                self.addService(key, value.shortDescription.en, value.description.en, value.endpoint, value.prefix, value.graph, value.sparql);
            });
        });
//        .fail(function() { alert("error"); })
//        .always(function() { alert("complete"); });
    };

};


