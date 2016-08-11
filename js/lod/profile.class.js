/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

/*
 * Class:Profile
 */
var Profile = new function() {

    this.graphSize = 5000;

    this.minNodeDistance = 150;
    this.maxRadiusAroundNode = 250;
    this.maxNodePlaceIter = 50;
    this.nodeHeight = 75;
    this.nodeWidth = 95;
    this.panelWidth = 300;
    this.sidemenuWidth = 200;
    this.buttonsHeight = 50;
    
    this.serverProxyUrl = 'http://munkapad.sztaki.hu/lodback/';

    this.defaultEndpointURI = "http://lod.sztaki.hu/sparql";
    this.defaultEndpointLabel = "n/a";
    this.defaultResourceURIprefix = "http://lod.sztaki.hu/edited/";


    this.defaultConnectionURI = "[EMPTY]";
    this.defaultConnectionsColor = "#056";
    this.highlightedConnectionsColor = "#f00";
    this.connectorType = "Straight"; //StateMachine, Straight, Bezier
    this.connectorStrokeStyle = "#5c96bc";
    this.connectorLineWidth = 1;
    this.connectorOutlineWidth = 3;
    this.connectorGap = 5;
    this.connectorStub = 5;

    this.connectionLabelLocation = 0.5;
    this.connectionArrowLocation = 0.75;
    this.connectionArrowWidth = 10;
    this.connectionArrowLength = 12;

    this.endpointForm = "Rectangle";
    this.endPointWidth = 10;
    this.endPointHeight = 10;

    this.nodeLabelMaxLength = 30;
    this.nodeEndpointLabelMaxLength = 10;

    this.addNewResourceSearchDelay = 500;

    this.addNewResourceSearchMaxHits = 20;
    this.addNewResourceSearchMaxTitleLen = 40;
    this.addNewResourceSearchMinLength = 3;

    this.searchMaxHits = 20;
    this.searchMaxTitleLen = 40;
    this.searchMinLength = 3;

    this.imageWidth = "auto";
    this.imageHeight = 42;

    this.propertyList = {};

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
        'dbpedia': 'http://lookup.dbpedia.org/api/search.asmx/PrefixSearch?QueryClass=&MaxHits=' + this.addNewResourceSearchMaxHits.toString() + '&QueryString=MPAD_SEARCH_TERM',

        'sztaki': 'http://lod.sztaki.hu/sparql?default-graph-uri=&should-sponge=&query='
            + encodeURIComponent('select ?object, ?label, max(?sc) as ?rank where { ?object rdfs:label ?label . '
                + "?label bif:contains \'\"MPAD_SEARCH_TERM\"\' option (score ?sc) . "
                + 'FILTER(lang(?label)=""). } group by ?object ?label order by desc (?rank) ?label limit '
                + this.addNewResourceSearchMaxHits.toString()) 
            +'&format=application%2Fsparql-results%2Bxml&save=display&fname=',

        'civilkapocs': 'http://civilkapocs.hu:8890/sparql?default-graph-uri=&should-sponge=&query='
            + encodeURIComponent('select ?object, ?label where { ?object rdfs:label ?label . '
                + "FILTER(REGEX(?label, \"MPAD_SEARCH_TERM\", \"i\")) } limit " + this.addNewResourceSearchMaxHits.toString()) 
            +'&format=application%2Fsparql-results%2Bxml&save=display&fname=',

        'europeana' : 'http://europeana.ontotext.com/sparql.xml?query='
            + encodeURIComponent("PREFIX luc: <http://www.ontotext.com/owlim/lucene#>\n" 
                + 'select ?object ?label WHERE { ?proxy ore:proxyFor ?object; dc:title ?label. ?label luc: "MPAD_SEARCH_TERM" } LIMIT '+ this.addNewResourceSearchMaxHits.toString() )
            + '&_implicit=false&implicit=true&_equivalent=false&_form=%2Fsparql',

        'britishmuseum' : 'http://collection.britishmuseum.org/sparql.xml?query='
            + encodeURIComponent("PREFIX crm: <http://erlangen-crm.org/current/>\n"
                + "PREFIX fts: <http://www.ontotext.com/owlim/fts#>\n"
                + 'SELECT DISTINCT ?object ?label WHERE { ?object crm:P102_has_title ?title . ?title rdfs:label ?label . FILTER(REGEX(?label, "MPAD_SEARCH_TERM")) } LIMIT '+ this.addNewResourceSearchMaxHits.toString() )
            + '&_implicit=false&implicit=true&_equivalent=false&_form=%2Fsparql',

        'szepmuveszeti' : 'http://data.szepmuveszeti.hu/sparql?default-graph-uri=&should-sponge=&query='
            + encodeURIComponent("PREFIX crm: <http://erlangen-crm.org/current/>\n"
                + 'SELECT ?object ?label WHERE { ?object crm:P3_has_note ?label. FILTER(REGEX(?label, "MPAD_SEARCH_TERM", "i")) } LIMIT '+ this.addNewResourceSearchMaxHits.toString() )
            +'&format=application%2Fsparql-results%2Bjson',

        'uni-obuda': 'http://lod.nik.uni-obuda.hu/sparql?default-graph-uri=&should-sponge=&query='
            + encodeURIComponent('select ?object, ?label where { ?object rdfs:label ?label . '
                + "FILTER(REGEX(?label, \"MPAD_SEARCH_TERM\", \"i\")) } limit " + this.addNewResourceSearchMaxHits.toString()) 
            +'&format=application%2Fsparql-results%2Bxml&save=display&fname=',
            // + encodeURIComponent('select ?object, ?label, max(?sc) as ?rank where { ?object rdfs:label ?label . '
                // + "?label bif:contains \'\"MPAD_SEARCH_TERM\"\' option (score ?sc) . "
                // + 'FILTER(lang(?label)=""). } group by ?object ?label order by desc (?rank) ?label limit '
                // + this.addNewResourceSearchMaxHits.toString()) 
            // +'&format=application%2Fsparql-results%2Bxml&save=display&fname=',

//        'factforge' : 'http://factforge.net/sparql.xml?query='
//            + encodeURIComponent('SELECT distinct ?object ?label WHERE { ?object rdfs:label ?label; FILTER(regex(?label, "MPAD_SEARCH_TERM", "i")) } LIMIT '
//                + this.addNewResourceSearchMaxHits.toString() )
//            + '&_implicit=false&implicit=true&_equivalent=false&_form=%2Fsparql',
    }

    // props to get the label for nodes, with ascending priority
    // DO NOT CHANGE THE ORDERING!!!
    this.labelURIs = {
        '0': 'http://erlangen-crm.org/current/P3_has_note',
        '1': 'http://rdf.freebase.com/ns/type.object.name',
        '2': 'http://xmlns.com/foaf/0.1/name',
        '3': 'http://www.w3.org/2000/01/rdf-schema#label',
        '4': 'http://purl.org/dc/elements/1.1/title',
        '5': 'http://purl.org/dc/terms/title',
        '6': 'http://www.w3.org/2004/02/skos/core#prefLabel'
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
        'propPropertyURI': 'http://dbpedia.org/property/',
        'thingURI': 'http://schema.org/Thing'
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
    this.imgPatt = new RegExp(this.findImagesRegexp, "i");

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


    this.addPropertyToList = function(propURI, propLabel){
        this.propertyList[propURI] = propLabel;
    };

    this.getPropertyLabel = function(propertyURI) {
        var propLabel = '';
        if (this.propertyList[propertyURI] && this.propertyList[propertyURI] !== '')
            propLabel = this.propertyList[propertyURI];
        else
            propLabel = Helper.getShortTypeFromURL(propertyURI);

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
        if (this.externalLinkProperties.indexOf(propValue) < 0) return false;
        return true;
    };
/*
    this.isPropertyExternalLink = function(propValue) {
        if (this.externalLinkProperties.indexOf(propValue) >= 0)
            return true;
        else
            return false;
    };*/


    this.getPropertyIfImage = function(targetNodeURI, label, propertyUri, sourceNodeURI, connectionType) {
        if (connectionType == 'literals') return "";
        var retval = [];
        if (targetNodeURI != null && this.imgPatt.test(targetNodeURI)) {
            // Image
            retval.push('<a title="', targetNodeURI,
                '" class="property-value-normal fancybox" rel="group" href="', targetNodeURI,
                '" ><img src="', targetNodeURI, '" alt=\"\" /></a>'
            );

        }
        else if (label != null && this.imgPatt.test(label)) {
            // Image
            retval.push('<a title="', label,
                '" class="property-value-normal fancybox" rel="group" href="', label,
                '" ><img src="', label, '" alt=\"\" /></a>'
            );
        }
        else if (this.isPropertyExternalLink(propertyUri))
        {
            // External link
            retval.push('<a title="', targetNodeURI,
                '" class="property-value-normal" href="', targetNodeURI,
                '" target="_blank">', label.replace(/_/g, " "), '</a>'
            );
        }
        else
        {
//            var sourceNodeURI_hash = sourceNodeURI,
//                targetNodeURI_hash = targetNodeURI;
//            // ha befele jovo kapcsolat, akkor a source es target felcserelodik
//            if (connectionType == 'in'){
//                targetNodeURI_hash = [sourceNodeURI_hash, sourceNodeURI_hash = targetNodeURI_hash][0];
//            }
            retval.push('<a title="', targetNodeURI,
                '" refProp="', propertyUri,
                '" refPropVal="', targetNodeURI,
                '" direction="', connectionType);
            // ha befele jovo kapcsolat, akkor a source es target felcserelodik
            if (connectionType == 'in')
                retval.push('" id="', md5(targetNodeURI + propertyUri + sourceNodeURI));
            else
                retval.push('" id="', md5(sourceNodeURI + propertyUri + targetNodeURI));
            retval.push('" class="property-value-normal showableNodeUri" href="', targetNodeURI,
                '">', label, '</a>'
            );
        }

        return retval.join("");
    };


/*
    this.getPropertyIfImage = function(targetNodeURI, label, propertyUri, sourceNodeURI, connectionType) {
        if (connectionType == 'literals') return "";
            var sourceNodeURI_hash = sourceNodeURI,
                targetNodeURI_hash = targetNodeURI;
            // ha befele jovo kapcsolat, akkor a source es target felcserelodik
            if (connectionType == 'in'){
                targetNodeURI_hash = [sourceNodeURI_hash, sourceNodeURI_hash = targetNodeURI_hash][0];
            }
            var cval = document.createElement("a");
            cval.setAttribute('title', targetNodeURI);
            cval.setAttribute('refProp', propertyUri);
            cval.setAttribute('refPropVal', targetNodeURI);
            cval.setAttribute('class', 'property-value-normal');
            cval.setAttribute('rel', 'group');
            cval.setAttribute('direction', connectionType);
            cval.setAttribute('id', md5(sourceNodeURI_hash + propertyUri + targetNodeURI_hash));
            var retval = $(cval);
                if (targetNodeURI != null && this.imgPatt.test(targetNodeURI)) {
                    // Image
                    retval
                        .addClass('fancybox')
                        .attr('href', targetNodeURI)
                        .append("<img src='" + targetNodeURI + "' alt=\"\" />");
                }
                else if (label != null && this.imgPatt.test(label)) {
                    // Image
                    retval
                        .addClass('fancybox')
                        .attr('href', label)
                        .append("<img src='" + label + "' alt=\"\" />");
                }
                else if (this.isPropertyExternalLink(propertyUri))
                {
                    // External link
                    retval
                        .attr('href', targetNodeURI)
                        .attr('target', '_blank')
                        .append(label.replace(/_/g, " "));
                }
                else return label.replace(/_/g, " ");
        return retval.prop('outerHTML');
    };
*/

    /*
    this.getPropertyIfImage = function(targetNodeURI, label, propertyUri, sourceNodeURI, connectionType) {
        var retval = "";
        var patt = new RegExp(this.findImagesRegexp, "i");
        var isImage = false;
        if ((targetNodeURI !== null && patt.test(targetNodeURI)) || (targetNodeURI === null && label !== null && patt.test(label))) {
            isImage = true;
        }
        if (connectionType === 'literals') {
        }
        else {

            var sourceNodeURI_hash = sourceNodeURI,
                connectionURI_hash = propertyUri,
                targetNodeURI_hash = targetNodeURI;
            // ha befele jovo kapcsolat, akkor a source es target felcserelodik
            if (connectionType === 'in'){
                targetNodeURI_hash = [sourceNodeURI_hash, sourceNodeURI_hash = targetNodeURI_hash][0];
            }
            var hashedID = md5(sourceNodeURI_hash + connectionURI_hash + targetNodeURI_hash);
            retval = $("<a title='"+ targetNodeURI +"'    refProp='" + propertyUri + "' refPropVal='" + targetNodeURI + "' class='property-value-normal' rel='group' direction="+connectionType+" id="+hashedID+"></a>");
            if (isImage === true && targetNodeURI !== null) {
                // Image
                retval
                        .addClass('fancybox')
                        .attr('href', targetNodeURI)
                        .append("<img src='" + targetNodeURI + "' alt=\"\" />");
            } else if (isImage === true && label !== null) {
                // Image
                retval
                        .addClass('fancybox')
                        .attr('href', label)
                        .append("<img src='" + label + "' alt=\"\" />");
            } else if (this.isPropertyExternalLink(propertyUri)) {
                // External link
                retval
                        .attr('href', targetNodeURI)
                        .attr('target', '_blank')
                        .append(label.replace(/_/g, " "));
            } else if (!isImage) {
                retval
                        .addClass('showableNodeUri')
                        .attr('href', targetNodeURI)
                        .append(decodeURI(label.replace(/_/g, " ")));
            } else if (!isImage && label !== null) {
                retval = label.replace(/_/g, " ");
                return retval;
            }
        }

        return retval.prop('outerHTML');
    };
    */

    this.addService = function(name, shortDescription, description, endpoint, prefix, graph, sparqlTemplates, disabled) {
        var s = new Service(name, shortDescription, description, endpoint, prefix, graph, sparqlTemplates, disabled);
        this.services.push(s);
    };

    this.init = function() {
        if(this.services.length > 0) {
            console.log('services already loaded', this.services);
            return;
        }
        var self = this;
        console.log('loading services');
        $.each(Lodmilla_services, function(key, value) {
            //console.log("add service", key, value);
            self.addService(key, value.shortDescription.en, value.description.en, value.endpoint, value.prefix, value.graph, value.sparql, value.disabled);
        });
        /*
        // var jqxhr = $.ajax({
            // type: "GET",
            dataType: "json",
            // url: "js/lod/services.json",
            async: false,
            data: {},
       }).done(function(json) {
            // success: function(json) {
                // console.log("json", json);
                // $.each(json, function(key, value) {
                    // console.log("add service", key, value);
                    // self.addService(key, value.shortDescription.en, value.description.en, value.endpoint, value.prefix, value.graph, value.sparql, value.disabled);
                // });
            // },
            // error: function (ajaxContext) {
                // console.log("error", ajaxContext);
                // alert(ajaxContext.responseText)
            // }
        // });
       .fail(function() { alert("error"); })
       .always(function() { alert("complete"); });
       */
    };
    
    //this.init();

};


