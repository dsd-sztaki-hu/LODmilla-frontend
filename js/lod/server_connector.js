/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

Profile.data_getService = function(resourceURI) {
    var service = '';
    // TODO: meg jobb matching a services_json-bol a prefixekre...van amelyik lod itemnel generalt, uh kitalalando hogy legyen ez
    try{
        $.each(this.services, function(key, value) {
            var resourcePath = resourceURI.split('//')[1];
//            var resourcePrefix = resourceURI.split('//')[0] + '//' + resourcePath.split('/', resourcePath.split('/').length-1).join('/');
            var resourcePrefix = resourceURI.split('//')[0] + '//' + resourcePath.split('/')[0];

            var isPrefixFound = false;
            //console.log("value", value);
            for (var prefix in value.prefix){
                //console.log("prefix", prefix);
                if (value.prefix[prefix]){
//                    if (value.prefix[prefix] === resourcePrefix){
                    //console.log("matching", prefix, value.prefix[prefix], resourcePrefix);
                    if (value.prefix[prefix].indexOf(resourcePrefix) !== -1){
                        isPrefixFound = true;
                    }
                }
            }
            if (value.disabled !== 'true' && isPrefixFound) {
                service = value;
            }
        });
    }
    catch (e){ console.log("EXCEPTION", e); }
    console.log("Using service", service);
    return service;
};

Profile.data_makeSparql = function(service, sparqlTemplate, resourceURI) {
    var sparql = "";

    var s = encodeURIComponent(service.sparqlTemplates[sparqlTemplate].replace(/\{URI\}/ig, resourceURI));
    sparql = service.endpoint + '?';
    sparql += 'output=json';
    sparql += '&format=application/json';
    sparql += '&timeout=0';
    sparql += '&query=' + s;

    return sparql;
};

Profile.data_getConnectionsLabels = function(resourceURI, object, callbackFunc, highlight, undoActionLabel) {
    var service = this.data_getService(resourceURI);
    var url = '';

    if (service && service !== '') {
        url = this.data_makeSparql(service, 'resourceConnectionsLabels', resourceURI);
    }
    else {
        url = this.serverProxyUrl + 'lod_resource_proxy.jsp?url=' + encodeURIComponent(resourceURI);
    }
    $.jsonp({
        url: url,
        callbackParameter: "callback",
        callback: "mpadJson",
        beforeSend: function() {
        },
        success: function(json) {
            object[callbackFunc].call(object, json, service, highlight, undoActionLabel);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            object[callbackFunc].call(object, false, false, highlight, undoActionLabel);
        }
    });
};

var BackendCommunicator = new function() {
    this.findPath = function(nodes, depth, nodes_max, callbackfunc, undoActionLabel) {
        $.jsonp({
            url: Profile.serverProxyUrl + "graph_conn_search.jsp",
            cache: false,
            callbackParameter: 'callback',
            callback: 'mpadCB',
            data: {'urls': nodes, 'path_max': depth, 'nodes_max': nodes_max},
            beforeSend: function() {
            },
            success: function(json, textStatus, xOptions) {
                callbackfunc(json, undoActionLabel);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                callbackfunc({error: textStatus}, undoActionLabel);
                console.log('error 1');
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    };
    this.findContent = function(nodes, depth, nodes_max, searchText, callbackfunc, undoActionLabel) {
        $.jsonp({
            url: Profile.serverProxyUrl + "graph_content_search.jsp",
            cache: false,
            callbackParameter: 'callback',
            callback: 'mpadCB',
            data: {'urls': nodes, 'path_max': depth, 'nodes_max': nodes_max, 'search': searchText},
            beforeSend: function() {
            },
            success: function(json, textStatus, xOptions) {
                callbackfunc(json, undoActionLabel);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                callbackfunc({error: textStatus}, undoActionLabel);
                console.log('error 1');
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    };
    this.findConnections = function(nodes, depth, nodes_max, searchText, callbackfunc, undoActionLabel) {
        $.jsonp({
            url: Profile.serverProxyUrl + "graph_link_search.jsp",
            cache: false,
            callbackParameter: 'callback',
            callback: 'mpadCB',
            data: {'urls': nodes, 'path_max': depth, 'nodes_max': nodes_max, 'search': searchText},
            beforeSend: function() {
            },
            success: function(json, textStatus, xOptions) {
                callbackfunc(json, undoActionLabel);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                callbackfunc({error: textStatus}, undoActionLabel);
                console.log('error 1');
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    };
    this.load = function(graphid, user_name, graph_name, callbackfunc, undoActionLabel) {
        $.jsonp({
            url: Profile.serverProxyUrl + "graph_load.jsp",
            cache: false,
            callbackParameter: 'callback',
            callback: 'mpadCB',
            data: {'graph_name': graph_name, 'user_name': user_name, 'graph_id': graphid},
            beforeSend: function() {
            },
            success: function(json, textStatus, xOptions) {
                callbackfunc(json, undoActionLabel);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                callbackfunc({error: textStatus}, undoActionLabel);
                console.log('error 1');
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    };

    this.save = function(user_name, graph_name, graph, callbackfunc) {
        $.ajax({
            url: Profile.serverProxyUrl + "graph_save.jsp",
            cache: false,
            callbackParameter: 'callback',
            callback: 'mpadCB',
            type: "POST",
            data: {'user_name': user_name, 'graph_name': graph_name, 'graph': graph},
            beforeSend: function() {
            },
            success: function(json, textStatus, xOptions) {
                callbackfunc(json);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                callbackfunc({error: textStatus});
                console.log('error 2');
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    };

    this.graphNameAutocomplete = function(request, response) {
        //TODO: it is not too nice to include jquery here...
        var user_name = $("#user_name").val();
        $.jsonp({
            url: Profile.serverProxyUrl + "graph_name_autocomplete.jsp",
            cache: false,
            callbackParameter: 'callback',
            callback: 'mpadCB',
            async: "false",
            data: {
                user_name: user_name,
                graph_name: request.term
            },
            success: function(json, textStatus, xOptions) {
                Sidemenu.graphNameAutoComplete(json, response);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                Sidemenu.graphNameAutoComplete({error: textStatus}, response);
                console.log('error 3');
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    };
};

