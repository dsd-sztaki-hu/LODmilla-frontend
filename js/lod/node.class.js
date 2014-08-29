/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

/*
 * Class:Node
 */
var Node = function(resource_id, label) {
    //this.resource_id = encodeURIComponent(resource_id);    
    if (!label)
        this.label = resource_id;
    else
        this.label = label;

    this.resource_id = resource_id;
    this.images = {};
    this.nodeImageURL = '';
    
    this.type = Profile.unloadedNodeType;
    this.typeUris = {};

    this.endpoint = {
        'shortDescription': '',
        'endpointURL': ''
    };

    this.connections = new Array();
    this.hasConnection = [];
    this.literals = {};
    this.top = null;
    this.left = null;
    this.width = Profile.nodeWidth;
    this.height = Profile.nodeHeight;

    this.weight = 1;

    this.loaded = false;

    this.content = null;
    this.contentParent = null;

    var self = this;

    this.getLiteralsNum = function() {
        var num = 0;
        $.each(this.literals, function(prop, langs) {
            $.each(langs, function(lang, litArr) {
                $.each(litArr, function(index, literal) {
                    num++;
                });
            });
        });
        return num;
    };

    this.addConnection = function(targetURI, connectionLabel, direction, endpointLabel) {
        var s = targetURI + connectionLabel;
//        var f = this.hasConnection[s];
        if (this.hasConnection[s] === undefined)
        {
            this.hasConnection[s] = true;
            var newConn = new Connection(targetURI, connectionLabel, direction, endpointLabel);
            this.connections.push(newConn);
            return newConn;
        }
        return false;
    };
    /*
    this.addConnection = function(targetURI, connectionLabel, direction, endpointLabel) {
        var length = this.connections.length;
        var conn;
        for (var i = 0; i < length; i++)
        {
            conn = this.connections[i];
            if (targetURI==conn.target && connectionLabel==conn.connectionUri)
                return false;
        }
        var newConn = new Connection(targetURI, connectionLabel, direction, endpointLabel);
        this.connections.push(newConn);
        return newConn;
    };
    */
    /*
    this.addConnection = function(targetURI, connectionLabel, direction, endpointLabel) {
        var alreadyAdded = false;                              
        $.each(this.connections, function(index, conn){
            if (connectionLabel===conn.connectionUri && targetURI===conn.target){
                alreadyAdded = true;
                //console.log('already added');
                return false;
            }
        });
        if (!alreadyAdded){
            var newConn = new Connection(targetURI, connectionLabel, direction, endpointLabel);
            this.connections.push(newConn);
            //console.log('added');
            return newConn;
        }
    };
    */

    this.getContent = function() {
        var content = {};

        content.literals = {};
        $.each(this.literals, function(index, item) {
            if (!content.literals[index])
                content.literals[index] = new Array();
            $.each(item, function(lang, itemarray) {
                $.each(itemarray, function(itemarrayindex, element) {
                    element = element.toString();                    
                    content.literals[index].push(element);
                });
                return false;
            });
        });

        $.each(this.connections, function(index, item) {
            if (!content[item.direction]) {
                content[item.direction] = {};
            }
            if (!content[item.direction][item.connectionUri])
                content[item.direction][item.connectionUri] = new Array();

            // TODO item.endpointLabel is missing sometimes, bugfix! while loading the resource
            var label;
            if (item.endpointLabel && item.endpointLabel !== '')
                label = item.endpointLabel;
            else
                label = item.target;
            content[item.direction][item.connectionUri].push({target: item.target, label: label});
        });
        
        var contentOrdered = new Array();
        if (content.literals)
            contentOrdered.push({'literals': content.literals})
        if (content.out)
            contentOrdered.push({'out': content.out});        
        if (content.in)
            contentOrdered.push({'in': content.in});
        
        return contentOrdered;
    };

    this.serialize_0 = function() {
        return {
            resource_id: this.resource_id,
            label: this.label,
            top: this.top,
            left: this.left
        };
    };

    this.setImageURL = function() {
        var resourceId = '';
        var nodeImageURL = '';
        
        if (this.endpoint && this.endpoint.endpointURL === Profile.defaultEndpointURI) {
            if (this.type === 'person') {
                resourceId = this.resource_id.replace('http://lod.sztaki.hu/sztaki/auth/', '');
                nodeImageURL = Profile.nodeTypesImagesURLs.sztaki.person.replace('{RESOURCE_ID}', resourceId);
            }
            else if (this.type === 'work') {
                resourceId = this.resource_id.replace('http://lod.sztaki.hu/sztaki/item/', '');
                nodeImageURL = Profile.nodeTypesImagesURLs.sztaki.work.replace('{RESOURCE_ID}', resourceId);
            }
            else if (this.type === 'group') {

            }
            else{
                if (this.images[Profile.commonURIs.propDepictionURI]) {
                    nodeImageURL = this.images[Profile.commonURIs.propDepictionURI][0];
                }
                else if (this.images[Profile.commonURIs.propThumbnailURI]) {
                    nodeImageURL = this.images[Profile.commonURIs.propThumbnailURI][0];
                }
            }
        }
        else{
            if (this.images[Profile.commonURIs.propDepictionURI]) {
                nodeImageURL = this.images[Profile.commonURIs.propDepictionURI][0];
            }
            else if (this.images[Profile.commonURIs.propThumbnailURI]) {
                nodeImageURL = this.images[Profile.commonURIs.propThumbnailURI][0];
            }
        }
        this.nodeImageURL = nodeImageURL;
    };

    this.storeImage = function(propVal, itemVal) {
        var self = this;
        if (propVal === Profile.commonURIs.propDepictionURI) {
            if (!(self.images[Profile.commonURIs.propDepictionURI]))
                self.images[Profile.commonURIs.propDepictionURI] = new Array();
            self.images[Profile.commonURIs.propDepictionURI].push(itemVal);
        }
        if (propVal === Profile.commonURIs.propThumbnailURI) {
            if (!(self.images[Profile.commonURIs.propThumbnailURI]))
                self.images[Profile.commonURIs.propThumbnailURI] = new Array();
            self.images[Profile.commonURIs.propThumbnailURI].push(itemVal);
        }
    };

    this.addLiteral = function(item){
        if (!self.literals[item.prop.value])
            self.literals[item.prop.value] = {};

        if (item.out['xml:lang'] === 'en' && !self.literals[item.prop.value]['en']) {
            self.literals[item.prop.value] = {};
            self.literals[item.prop.value]['en'] = new Array();
        } else if (!self.literals[item.prop.value]['en']) {
            if (!item.out['xml:lang'] && !self.literals[item.prop.value]['nolang']) {
                self.literals[item.prop.value] = {};
                self.literals[item.prop.value]['nolang'] = new Array();
            }
        }

        if (item.out['xml:lang'] && item.out['xml:lang'] === 'en') {
            self.literals[item.prop.value]['en'].push(item.out.value);

        } else if (self.literals[item.prop.value]['nolang'] && !item.out['xml:lang']) {
            self.literals[item.prop.value]['nolang'].push(item.out.value);
        } else if (!self.literals[item.prop.value]['en'] && !self.literals[item.prop.value]['nolang']) {
            if (!self.literals[item.prop.value][item.out['xml:lang']])
                self.literals[item.prop.value][item.out['xml:lang']] = new Array();
            self.literals[item.prop.value][item.out['xml:lang']].push(item.out.value);
        }
    };

    this.getResourceCallback = function(json, service, highlight, undoActionLabel) {
        var self = this;
        self.hasConnection = [];
        var aroundNode = Graph.getAroundNode(false, false);
//        if (json === false || json === undefined || (json && (!json.hasOwnProperty('head') || !json.hasOwnProperty('results')))) {
        if (json === false || json === undefined ) {
            console.log('failed to download a resource: ' + this.resource_id);
            self.vis_remove_load_progressbar();
            self.vis_refresh(highlight, aroundNode);
//            self.vis_repaintConnections();
        } else {
            console.log('loading: ' + this.resource_id);
            console.time('load time');
            // JSON comes from a known LOD - present in the Profile
            if (service && service !== "") {
                self.endpoint.shortDescription = service.shortDescription;
                self.endpoint.endpointURL = service.endpoint;

                // in DBpedia, the same property can be in /ontology/X or /property/X form as well.. ontology is more important, keep that if available
                var ontologiesAndPropertiesOUT = {};
                var ontologiesAndPropertiesIN = {};
                // TODO: filtering duplicates because of "en, nolang" languages; in and out
                $.each(json.results.bindings, function(index, item) {
                    var selfTargetConnectionFound = false;
                    if (item.out) {
                        // store images in Node
                        self.storeImage(item.prop.value, item.out.value);

                        if (item.out.type === 'uri') {
                            if (decodeURI(item.out.value) === decodeURI(self.resource_id)){
                                selfTargetConnectionFound = true;
                            }
                            else{
                                var endpointLabel = Helper.getEndpointLabelOrUriEnd(item, 'out');

                                // store node type
                                if (item.prop.value === Profile.commonURIs.propTypeURI) {
                                    // if changed once, dont change it again (duplicate types)
                                    var nodeTypeURI = decodeURIComponent(item.out.value);
                                    var nodeTypeLabel;
                                    if (item.label && item.label !== 'undefined')
                                        nodeTypeLabel = item.label.value;
                                    else
                                        nodeTypeLabel = Helper.getShortTypeFromURL(nodeTypeURI);
                                    Graph.addNodeType(nodeTypeURI, nodeTypeLabel);
                                    self.typeUris[nodeTypeURI] = nodeTypeLabel;

                                    $.each(Profile.nodeTypes, function(profileNodeType, uris) {
                                        var pos = $.inArray(nodeTypeURI, uris);
                                        // if its type is in the Profile
                                        if (pos !== -1) {
                                            // if changed once, dont change it again (duplicate types)
                                            if (self.type === Profile.unloadedNodeType)
                                                self.type = profileNodeType;
                                            return false;
                                        }
                                    });
                                }
                                // in case of DBpedia, ontology and property check
                                if (service.endpoint === 'http://dbpedia.org/sparql') {
                                    // if property or ontology, check it
                                    if (item.prop.value.indexOf(Profile.commonURIs.propOntologyURI) !== -1 || item.prop.value.indexOf(Profile.commonURIs.propPropertyURI) !== -1) {
                                        if (!(ontologiesAndPropertiesOUT[item.out.value]))
                                            ontologiesAndPropertiesOUT[item.out.value] = {};
                                        ontologiesAndPropertiesOUT[item.out.value][item.prop.value] = endpointLabel;
                                    }
                                    // if other prop, no check, just add it
                                    else {
                                        self.addConnection(item.out.value, item.prop.value, 'out', endpointLabel);
                                    }
                                }
                                // in case of non-DBpedia, no check at all
                                else {
                                    self.addConnection(item.out.value, item.prop.value, 'out', endpointLabel);
                                }
                            }
                        } else if (item.out.type === 'literal' || item.out.type === 'typed-literal') {
                            self.addLiteral(item);
                        } else {
                            console.log('TODO: out.type not known yet');
                        }
                    } else if (item.in) {
                        if (item.in.type === 'uri') {
                            if (decodeURI(item.in.value) === decodeURI(self.resource_id)){
                                selfTargetConnectionFound = true;
                            }
                            else{
                                var endpointLabel = Helper.getEndpointLabelOrUriEnd(item, 'in');

                                // in case of DBpedia, ontology and property check
                                if (service.endpoint === 'http://dbpedia.org/sparql') {
                                    // if property or ontology, check it
                                    if (item.prop.value.indexOf(Profile.commonURIs.propOntologyURI) !== -1 || item.prop.value.indexOf(Profile.commonURIs.propPropertyURI) !== -1) {
                                        if (!(ontologiesAndPropertiesIN[item.in.value]))
                                            ontologiesAndPropertiesIN[item.in.value] = {};
                                        ontologiesAndPropertiesIN[item.in.value][item.prop.value] = endpointLabel;
                                    }
                                    // if other prop, no check, just add it
                                    else {
                                        self.addConnection(item.in.value, item.prop.value, 'in', endpointLabel);
                                    }
                                }
                                // in case of non-DBpedia, no check at all
                                else {
                                    self.addConnection(item.in.value, item.prop.value, 'in', endpointLabel);
                                }
                            }
                        } else {
                            console.log('TODO: in.type not known yet');
                        }
                    } else {
                        console.log('TODO: not in and not out');
                    }
                    if (!selfTargetConnectionFound){
                        // store types labels in Profile
                        var typeLabel;
                        if (item.proplabel && item.proplabel.value && item.proplabel.value !== '')
                            typeLabel = item.proplabel.value;
                        else
                            typeLabel = Helper.getShortTypeFromURL(item.prop.value);
                        Profile.addPropertyToList(item.prop.value, typeLabel);
                        Profile.propertyList[item.prop.value] = typeLabel;
                    }
                });
                // TODO: more efficient filtering
                // TODO: merge properties with different char case:
                // eg.: http://dbpedia.org/property/placeOfDeath VS http://dbpedia.org/property/placeofdeath
                var ontologiesAndProperties = {
                    'out': ontologiesAndPropertiesOUT,
                    'in': ontologiesAndPropertiesIN
                };
                $.each(ontologiesAndProperties, function(dir, op) {
                    $.each(op, function(resourceURI, oANDp) {
                        var temp = {};
                        $.each(oANDp, function(propURI, endpointLabel) {
                            var prop = propURI.split('/');
                            propType = prop[prop.length - 2];
                            propEnd = prop[prop.length - 1];
                            if (!(temp[propEnd])) {
                                temp[propEnd] = new Array();
                                temp[propEnd].push(endpointLabel);
                            }
                            temp[propEnd].push(propType);
                        });
                        $.each(temp, function(propEnd, endpointLabelAndoORp) {
                            var posOntology = $.inArray('ontology', endpointLabelAndoORp.slice(1));
                            var posProperty = $.inArray('property', endpointLabelAndoORp.slice(1));
                            // if ontology version exists
                            if (posOntology !== -1) {
                                self.addConnection(resourceURI, Profile.commonURIs.propOntologyURI + propEnd, dir, endpointLabelAndoORp[0]);
                            }
                            // if no ontology exists -> property exists
                            else {
                                self.addConnection(resourceURI, Profile.commonURIs.propPropertyURI + propEnd, dir, endpointLabelAndoORp[0]);
                            }
                        });
                    });
                });
            }

            // endpoint not in Profile: get data through own proxy server
            else {
                // pre-parsing: in case of redirection, [resource_id] !== [main URI in the JSON] ..
                // TODO: van, hogy tobb elemben is van label, ilyenkor bugos lehet, ha nincs self.resource_id nincs a JSONban..
                var trueResourceUri = '';
                if (json){
                    $.each(json, function(fromUrl, propertyList) {
                        if (fromUrl.toLowerCase() === self.resource_id.toLowerCase()){
                            trueResourceUri = fromUrl;
                            console.log("match", fromUrl);
                            return false;
                        }
                    });
                    if (trueResourceUri === ''){
                        $.each(json, function(fromUrl, propertyList) {
                            $.each(propertyList, function(property, toObjList) {
//                                if (property === Profile.labelURIs[2]) {
//                                    trueResourceUri = fromUrl;
//                                    return false;
//                                }
                                for (var labelURI in Profile.labelURIs){
                                    if (Profile.labelURIs.hasOwnProperty(labelURI)){
                                        if (Profile.labelURIs[labelURI] === property){
                                            trueResourceUri = fromUrl;
                                            //console.log("match2", fromUrl);
                                            return false;
                                        }
                                    }
                                }
                            });
                            if(trueResourceUri)
                                return false;
                        });
                    }
                    // normal parsing
                    console.log('trueResouceURI', trueResourceUri);
                    $.each(json, function(fromUrl, propertyList) {
                        $.each(propertyList, function(property, toObjList) {
                            $.each(toObjList, function(index2, toObj) {
                                //console.log('parsing', toObj);
                                if (fromUrl === trueResourceUri || toObj.value === trueResourceUri){
                                    if (toObj.type === 'literal' || toObj.type === 'typed-literal') {
                                        // label storing
                                        if (fromUrl === trueResourceUri) {
                                            // TODO put in function
                                            if (!self.literals[property])
                                                self.literals[property] = {};

                                            if (toObj.lang === 'en' && !self.literals[property]['en']) {
                                                self.literals[property] = {};
                                                self.literals[property]['en'] = new Array();
                                            } else if (!self.literals[property]['en']) {
                                                if (!toObj.lang && !self.literals[property]['nolang']) {
                                                    self.literals[property] = {};
                                                    self.literals[property]['nolang'] = new Array();
                                                }
                                            }

                                            if (toObj.lang && toObj.lang === 'en') {
                                                self.literals[property]['en'].push(toObj.value);

                                            } else if (self.literals[property]['nolang'] && !toObj.lang) {
                                                self.literals[property]['nolang'].push(toObj.value);
                                            } else if (!self.literals[property]['en'] && !self.literals[property]['nolang']) {
                                                if (!self.literals[property][toObj.lang])
                                                    self.literals[property][toObj.lang] = new Array();
                                                self.literals[property][toObj.lang].push(toObj.value);
                                            }
                                            //console.log('literals', self.literals);
                                        }
                                        else{
                                            self.addConnection(fromUrl, property, 'in', toObj.value);
                                        }
                                    }
                                    else if (toObj.type === 'uri') {
                                        var selfTargetConnectionFound = false;
                                        var propertyURI = false;

                                        // OUT connections
                                        if (fromUrl === trueResourceUri) {
                                            if (decodeURI(toObj.value) === decodeURI(trueResourceUri) || decodeURI(toObj.value) === decodeURI(self.resource_id)){
                                                selfTargetConnectionFound = true;
                                            }
                                            else{
                                                propertyURI = toObj.value;
                                                // store image in Node
                                                self.storeImage(property, toObj.value);

                                                var endpointLabel = Helper.getShortTypeFromURL(toObj.value);
                                                self.addConnection(toObj.value, property, 'out', endpointLabel);
                                            }
                                        }
                                        // IN connections
                                        else {
                                            if (decodeURI(fromUrl) === decodeURI(trueResourceUri) || decodeURI(fromUrl) === decodeURI(self.resource_id)){
                                                selfTargetConnectionFound = true;
                                            }
                                            else{
                                                propertyURI = fromUrl;
                                                var endpointLabel = Helper.getShortTypeFromURL(fromUrl);
                                                self.addConnection(fromUrl, property, 'in', endpointLabel);
                                            }
                                        }

                                        if (!selfTargetConnectionFound){
                                            // store node type
                                            if (property === Profile.commonURIs.propTypeURI) {
                                                var nodeTypeURI = decodeURIComponent(toObj.value);
                                                var nodeTypeLabel;
                                                if (toObj.label && toObj.label !== 'undefined')
                                                    nodeTypeLabel = toObj.label.value;
                                                else
                                                    nodeTypeLabel = Helper.getShortTypeFromURL(nodeTypeURI);
                                                Graph.addNodeType(nodeTypeURI, nodeTypeLabel);
                                                self.typeUris[nodeTypeURI] = nodeTypeLabel;

                                                $.each(Profile.nodeTypes, function(profileNodeType, uris) {
                                                    var pos = $.inArray(nodeTypeURI, uris);
                                                    // if its type is in the Profile
                                                    if (pos !== -1) {
                                                        // if changed once, dont change it again (duplicate types)
                                                        if (self.type === Profile.unloadedNodeType)
                                                            self.type = profileNodeType;
                                                        return false;
                                                    }
                                                });
                                            }

                                            // store types labels in Profile
                                            if (propertyURI){
                                                var typeLabel = Helper.getShortTypeFromURL(propertyURI);
                                                Profile.addPropertyToList(propertyURI, typeLabel);
                                            }
                                        }
                                    }
                                    else {
                                        console.log('TODO: type not known yet');
                                    }

                                }
                                else{
//                                    console.log('not processed ' +fromUrl, toObj.value)
                                }
                            });
                        });
                    });
                }
            }
            // post-parseing, settings
            var templabel;
            var labels = {
                'en': new Array(),
//                'hu': new Array(),
                'nolang': new Array()
            };
            $.each(Profile.labelURIs, function(index, labelURI) {
                if (self.literals[labelURI]) {
                    $.each(self.literals[labelURI], function(index, item) {
                        if (labels[index])
                            labels[index].push(item[0]);
                        else
                            labels['nolang'].push(item[0]);
                    });
                }
            });
            
            // var labels contains labels from every three (en, hu, nolang) langs
            // usage priority is: en, hu, nolang; decreasing
            // TODO: better choice from langs and/or show every langs?
            $.each(labels.nolang, function(index, label) {
                templabel = label;
            });
//            $.each(labels.hu, function(index, label) {
//                templabel = label;
//            });
            $.each(labels.en, function(index, label) {
                templabel = label;
            });

            if (templabel !== self.label) {
                self.label = templabel;
            }
            if (!(self.label) || self.label === undefined)
                self.label = Helper.getShortTypeFromURL(this.resource_id);
              
            self.loaded = true;
            
        }
        
        if (self.type === Profile.unloadedNodeType)
            self.type = Profile.defaultNodeType;     

        Sidemenu.refreshSearchDatabase();
        console.timeEnd('load time');
        self.vis_refresh(highlight, aroundNode);
                
        var nodeList = [{resource_id:this.resource_id, action:'added',highlighted:highlight}];
        Graph.logUndoAction(undoActionLabel, nodeList);
    };

    this.collectData = function(highlight, undoActionLabel) {
        Profile.data_getConnectionsLabels(resource_id, this, "getResourceCallback", highlight, undoActionLabel);
    };

};
