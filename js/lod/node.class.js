/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth - MTA SZTAKI DSD
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
    this.images = new Array();
    this.nodeImageURL = '';
    
    this.type = Profile.unloadedNodeType;
    
    this.endpoint = {
        'shortDescription': '',
        'endpointURL': ''
    };

    this.connections = new Array();
    this.literals = {};
    this.top = null;
    this.left = null;

    this.loaded = false;
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

    this.addConnection = function(target, connectionLabel, direction, endpointLabel) {
        var alreadyAdded = false;                              
        $.each(this.connections, function(index, conn){
            if (connectionLabel===conn.connectionLabel && target===conn.target){
                alreadyAdded = true;
                return false;
            }
        });
        if (!alreadyAdded)
            this.connections.push(new Connection(target, connectionLabel, direction, endpointLabel));
    };

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
            if (!content[item.direction][item.connectionLabel])
                content[item.direction][item.connectionLabel] = new Array();

            // TODO item.endpointLabel is missing sometimes, bugfix! while loading the resource
            var label;
            if (item.endpointLabel && item.endpointLabel !== '')
                label = item.endpointLabel;
            else
                label = item.target;
            content[item.direction][item.connectionLabel].push({target: item.target, label: label});
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
        
        if (this.endpoint && this.endpoint.endpointURL === "http://lod.sztaki.hu/sparql") {
            if (this.type === 'person') {
                resourceId = this.resource_id.replace('http://lod.sztaki.hu/sztaki/auth/', '');
                nodeImageURL = Profile.nodeTypesImagesURLs.sztaki.person.replace('{RESOURCE_ID}', resourceId);
            }
            else if (this.type === 'work') {
                resourceId = this.resource_id.replace('http://lod.sztaki.hu/sztaki/item/', '');
                nodeImageURL = Profile.nodeTypesImagesURLs.sztaki.work.replace('{RESOURCE_ID}', resourceId);;
            }
            else if (this.type === 'group') {

            }
        }
        else{
            if (this.images[Profile.commonURIs.propThumbnailURI]) {
                nodeImageURL = this.images[Profile.commonURIs.propThumbnailURI];
            }
            else if (this.images[Profile.commonURIs.propDepictionURI]) {
                nodeImageURL = this.images[Profile.commonURIs.propDepictionURI];
            }            
        }     
        this.nodeImageURL = nodeImageURL;
    };

    this.storeImage = function(propVal, itemVal) {
        var self = this;
        if (propVal === Profile.commonURIs.propThumbnailURI) {
            if (!(self.images[Profile.commonURIs.propThumbnailURI]))
                self.images[Profile.commonURIs.propThumbnailURI] = new Array();
            self.images[Profile.commonURIs.propThumbnailURI].push(itemVal);
        }
        if (propVal === Profile.commonURIs.propDepictionURI) {
            if (!(self.images[Profile.commonURIs.propDepictionURI]))
                self.images[Profile.commonURIs.propDepictionURI] = new Array();
            self.images[Profile.commonURIs.propDepictionURI].push(itemVal);
        }
    };
    this.getResourceCallback = function(json, service, highlight, undoActionLabel) {        
        var self = this;        
        var aroundNode = Graph.getAroundNode(false, false);
        if (json === false || json === undefined) {
            console.log('failed to download a resource: ' + this.resource_id);
            self.vis_remove_load_progressbar();
            self.vis_refresh(highlight, aroundNode);
            self.vis_repaintConnections();
        } else {
            // JSON comes from a known LOD - present in the Profile
            if (service) {                
                self.endpoint.shortDescription = service.shortDescription;
                self.endpoint.endpointURL = service.endpoint;

                // in DBpedia, the same property can be in /ontology/X or /property/X form as well.. ontology is more important, keep that if available
                var ontologiesAndPropertiesOUT = {};
                var ontologiesAndPropertiesIN = {};
                // TODO: filtering duplicates because of "en, nolang" languages; in and out
                $.each(json.results.bindings, function(index, item) {

                    // store property labels in Profile, if available
                    if (item.proplabel && item.proplabel.value && item.proplabel.value !== '')
                        Profile.propertyLabels[item.prop.value] = item.proplabel.value;

                    if (item.out) {
                        // store images in Node
                        self.storeImage(item.prop.value, item.out.value);

                        if (item.out.type === 'uri') {
                            var endpointLabel = Profile.getEndpointLabelOrUriEnd(item, 'out');
                            
                            // set node type
                            if (item.prop.value === Profile.commonURIs.propTypeURI) {
                                var val = decodeURIComponent(item.out.value);                                
                                $.each(Profile.nodeTypes, function(nodeType, uris) {
                                    var pos = $.inArray(val, uris);
                                    if (pos !== -1) {
                                        // if changed once, dont change it again (duplicate types)
                                        if (self.type === Profile.unloadedNodeType)
                                            self.type = nodeType;
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

                        } else if (item.out.type === 'literal' || item.out.type === 'typed-literal') {
                            // TODO put in function
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
                        } else {
                            console.log('TODO: out.type not known yet');
                        }
                    } else if (item.in) {
                        if (item.in.type === 'uri') {
                            var endpointLabel = Profile.getEndpointLabelOrUriEnd(item, 'in');

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

                        } else {
                            console.log('TODO: in.type not known yet');
                        }
                    } else {
                        console.log('TODO: not in and not out');
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
                // TODO: sometimes more items have
                var trueResourceUri = '';
				if (json){				
					$.each(json, function(fromUrl, propertyList) {
						if (fromUrl === self.resource_id){                        
							trueResourceUri = self.resource_id;
							return false;
						}
					});
					if (trueResourceUri === ''){                    
						$.each(json, function(fromUrl, propertyList) {
							$.each(propertyList, function(property, toObjList) {
								// TODO: what if not this label? (http://www.w3.org/2000/01/rdf-schema#label)
								if (property === Profile.labelURIs[2]) {
									trueResourceUri = fromUrl;
									return false;
								}
							});
						});
					}

					// normal parsing
					$.each(json, function(fromUrl, propertyList) {
						$.each(propertyList, function(property, toObjList) {
							$.each(toObjList, function(index2, toObj) {
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
										}
										else{
											self.addConnection(fromUrl, property, 'in', toObj.value);
										}
									}
									else if (toObj.type === 'uri') {
										// set node type
										if (property === Profile.commonURIs.propTypeURI) {
											var val = decodeURIComponent(toObj.value);                                
											$.each(Profile.nodeTypes, function(nodeType, uris) {
												var pos = $.inArray(val, uris);
												if (pos !== -1) {
													// if changed once, dont change it again (duplicate types)
													if (self.type === Profile.unloadedNodeType)
														self.type = nodeType;
													return false;
												}
											});                                                                
										}
										// OUT connections
										if (fromUrl === trueResourceUri) {
											// store image in Node
											self.storeImage(property, toObj.value);

											var endpointLabel = Profile.getShortTypeFromURL(toObj.value);
											self.addConnection(toObj.value, property, 'out', endpointLabel);
										}
										// IN connections
										else {
											var endpointLabel = Profile.getShortTypeFromURL(fromUrl);
											self.addConnection(fromUrl, property, 'in', endpointLabel);
										}
									} else {
										console.log('TODO: type not known yet');
									}
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
                self.label = Profile.getShortTypeFromURL(this.resource_id);
              
            self.loaded = true;
            
        }
        
        if (self.type === Profile.unloadedNodeType)
            self.type = Profile.defaultNodeType;     
        
        var isAdded = Graph.addNodeType(self.type);
        if (isAdded)
            Sidemenu.refreshTypeSelectList(self.type);

        Sidemenu.refreshSearchDatabase();        
        
        self.vis_refresh(highlight, aroundNode);
        self.vis_repaintConnections();            
                
        var nodeList = [{resource_id:this.resource_id, action:'added',highlighted:highlight}];
        Graph.logUndoAction(undoActionLabel, nodeList);
    };

    this.collectData = function(highlight, undoActionLabel) {
        Profile.data_getConnectionsLabels(resource_id, this, "getResourceCallback", highlight, undoActionLabel);
    };

};
