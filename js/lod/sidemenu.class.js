/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

/*
 * Class:Sidemenu
 * Elements which are not parts of the graph structure.  
 */
var Sidemenu = new function() {
    this.paletteBox = '';
    this.openResBox = '';
    this.openResForm = '';
    this.addNewResBox = '';
    this.addNewResForm = '';
    this.searchBox = '';
    this.searchRemoteBox = '';
    this.searchConnectionBox = '';
    this.searchForm = '';
    this.selectBox = '';
    this.selectForm = '';
    this.findPathBox = '';

    var self = this;

    this.init = function(parent) {
        self.paletteBox = $('<div id="paletteBox"></div>');

        // ADD NEW resource palette

        self.addNewResBox = $('<div id="addNewResourcePalette" class="paletteItem opacityItem" title="Add new resource"></div>');
        self.addNewResForm = $('<form id="addNewResForm"></form>');
        self.addNewResForm.append('<div class="searchInput resourceLabelInput"><input type="text" placeholder="Enter new node label" value="" /></div>');
        self.addNewResForm.append('<div class="searchInput uriPrefixInput"><input type="text" placeholder="Enter new node URI prefix" value="" /></div>');
        self.addNewResForm.append('<select><option value="" selected="selected">-Select a type-</option><option value="'+ Profile.commonURIs.thingURI +'" title="'+ Profile.commonURIs.thingURI +'">Thing</option></select>');
        self.addNewResForm.append('<div class="searchInput typeUriInput"><input type="text" placeholder="Enter new node type URI" value="" /></div>');
//        self.addNewResForm.append('<div class="searchInput endpointUriInput"><input type="text" placeholder="Enter new node endpoint URI.." value="" /></div>');
        self.addNewResForm.append('<div class="searchInput thumbnailUrlInput"><input type="text" placeholder="Enter thumbnail URL" value="" /></div>');
        self.addNewResForm.append('<div class="addNewResourceAddButton"><input type="button" value="Add" /></div>');
        self.addNewResBox.append(self.addNewResForm);

        self.addNewResForm.find('select').change(function() {
            var typeURI = $(this).find('option:selected').attr('value');
            if (typeURI){
                self.addNewResForm.find('div.typeUriInput input').val(typeURI);
            }
        });

        // add button
        self.addNewResForm.find('div input[type="button"]').button();

        // OPEN resource palette

        self.openResBox = $('<div id="addResourcePalette" class="paletteItem opacityItem" title="Open resource"></div>');
        self.openResForm = $('<form id="searchForm"></form>');
        var openNodeSearchOptions = '';
        for (var searchProvider in Profile.searchURLs){
            if (Profile.searchURLs.hasOwnProperty(searchProvider)){
                openNodeSearchOptions += '<option value="'+searchProvider+'">'+searchProvider+'</option>';
            }
        }
        self.openResForm.append('<select>' + openNodeSearchOptions + '</select>');
        self.openResForm.append('<div class="searchInput resourceLabelInput"><input type="text" placeholder="Find node in store" value="" /></div>');
        self.openResForm.append('<div class="searchInput resourceUriInput"><input type="text" placeholder="Or enter node URI" value="" /></div>');
        self.openResForm.append('<div class="addResourceClearButton"><input type="button" value="Clear" /></div>');
        self.openResForm.append('<div class="addResourceOpenButton"><input type="submit" value="Open" /></div>');
        self.openResBox.append(self.openResForm);

        self.openResForm.find('select').change(function() {
            self.openResForm.find('div.resourceLabelInput input').removeClass('ui-autocomplete-loading');
            var lodServer = $(this).find('option:selected').attr('value');
            var searchInput = self.openResForm.find('div.resourceLabelInput input');
            if (lodServer) {
                self.openResForm.find('div.resourceLabelInput').removeClass('searchInputInactive');
                searchInput.val('').removeAttr('readonly').focus();
            }
            else {
                self.openResForm.find('div.resourceLabelInput').addClass('searchInputInactive');
                searchInput.val('').attr('readonly', 'readonly');
            }
            self.openResForm.find('div.resourceUriInput input').val('');
        });

        // open button
        self.openResForm.find('div.addResourceOpenButton input').button();

        // clear button
        self.openResForm.find('div.addResourceClearButton input').button();
        
        // event for pressing enter in 2nd input aka adding resource from URI
        self.openResForm.find('div.resourceUriInput input').keypress(function(e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                var newURI = $(this).val();
                var undoActionLabel = 'action_sidemenu_openNode';
                self.openNode(newURI, undoActionLabel);
                return false;
            }
        });

        // event for submitting, aka clicking on a found resource
        self.openResForm.bind('submit', function(e) {
            e.preventDefault();
            var newURI = $(this).find('div.resourceUriInput input').val();
            var undoActionLabel = 'action_sidemenu_openNode';
            self.openNode(newURI, undoActionLabel);
            return false;
        });

        // add new res search autocomplete        
        self.openResForm.find('div.resourceLabelInput input').autocomplete({
            minLength: Profile.addNewResourceSearchMinLength,
            delay: Profile.addNewResourceSearchDelay,
            source: function(request, response) {
                var lodServer = self.openResForm.find('select option:selected').val();
                var searchResults = [];
                var searchTerm, sparqlURL;

                // search on dbpedia LOD
                // TODO: success and complete functions to server_connectorba. DRY!
                if (lodServer === 'dbpedia') {
                    searchTerm = request.term;
                    sparqlURL = Profile.searchURLs[lodServer].replace('MPAD_SEARCH_TERM', searchTerm);
                    $.ajax({
                        url: sparqlURL,
                        async: true,
                        success: function(data) {
                            var results = $(data);
                            results.find('Result').each(function() {
                                var label = $(this).children('Label').text();
                                searchResults.push({
                                    uri: $(this).children('URI').text(),
                                    label: label
                                });
                            });
                            // if no results for search on LOD
                            if (results.find('Result').length === 0) {
                            }
                            response(
                                $.map(searchResults, function(item) {
                                    return {
                                        label: item.label,
                                        value: item.label,
                                        uri: item.uri
                                    };
                                })
                            );
                        },
                        complete: function(a, b) {
                            if (b === 'error' || b === 'parsererror' || b === 'timeout') {
                                if (a.status !== 500) {
                                    alert('Endpoint not available or slow');
                                }
                                else {
                                    // min 3 chars required
                                    console.log(a.statusText);
//                                    alert('Please enter at least ' + Profile.addNewResourceSearchMinLength.toString() + ' chars!');
                                }
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR, textStatus, errorThrown);
                            self.openResForm.find('div.resourceLabelInput input').removeClass('ui-autocomplete-loading');
                            alert('DBpedia server error');
                        }
                    });
                }
                // search in sztaki LOD
                // TODO: search in different graphs separately in sztaki LOD
                else if (lodServer === 'sztaki') {
                    searchTerm = request.term;
                    searchTerm = searchTerm.split(' ');
                    for (var i = 0; i < searchTerm.length; i++) {
                        if (searchTerm[i].length > 3) {
                            searchTerm[i] += '*';
                        }
                    }
                    searchTerm = searchTerm.join(' ');
                    sparqlURL = Profile.searchURLs[lodServer].replace('MPAD_SEARCH_TERM', searchTerm);
                    $.ajax({
                        url: sparqlURL,
                        async: true,
                        //dataType: "jsonp",
                        data: {
                        },
                        success: function(data) {
                            var results = $(data);
                            results.find('result').each(function() {
                                var label = $(this).children("binding[name='label']").children('literal').text();
                                searchResults.push({
                                    uri: $(this).children("binding[name='object']").children('uri').text(),
                                    label: label
                                });
                            });
                            // if no results for search in LOD
                            if (results.find('result').length === 0) {
                            }
                            response(
                                $.map(searchResults, function(item) {
                                    return {
                                        label: item.label,
                                        value: item.label,
                                        uri: item.uri
                                    };
                                })
                            );
                        },
                        complete: function(a, b) {
                            if (b === 'error' || b === 'parsererror' || b === 'timeout') {
                                if (a.status !== 500) {
                                    alert('Endpoint not available or slow');
                                }
                                else {
                                    // min 3 chars required
                                    console.log(a.statusText);
//                                    alert('Please enter at least ' + Profile.addNewResourceSearchMinLength.toString() + ' chars!');
                                }
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR, textStatus, errorThrown);
                            self.openResForm.find('div.resourceLabelInput input').removeClass('ui-autocomplete-loading');
                            alert("SZTAKI server error");
                        }
                    });
                }
                else if (lodServer === 'britishmuseum' || lodServer === 'factforge' || lodServer === 'europeana') {
                    searchTerm = request.term;
                    sparqlURL = Profile.searchURLs[lodServer].replace('MPAD_SEARCH_TERM', searchTerm);
                    $.ajax({
                        url: sparqlURL,
                        async: true,
                        success: function(data) {
                            var results = $(data);
                            results.find('result').each(function() {
                                var label = $(this).children('binding[name="label"]').children('literal').text();
                                searchResults.push({
                                    uri: $(this).children('binding[name="object"]').children('uri').text(),
                                    label: label
                                });
                            });
                            // if no results for search on LOD
                            if (results.find('result').length === 0) {
                            }
                            response(
                                $.map(searchResults, function(item) {
                                    return {
                                        label: item.label,
                                        value: item.label,
                                        uri: item.uri
                                    };
                                })
                            );
                        },
                        complete: function(a, b) {
                            if (b === 'error' || b === 'parsererror' || b === 'timeout') {
                                if (a.status !== 500) {
                                    alert('Endpoint not available or slow');
                                }
                                else {
                                    // min 3 chars required
                                    console.log(a.statusText);
//                                    alert('Please enter at least ' + Profile.addNewResourceSearchMinLength.toString() + ' chars!');
                                }
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR, textStatus, errorThrown);
                            self.openResForm.find('div.resourceLabelInput input').removeClass('ui-autocomplete-loading');
                            alert('DBpedia server error');
                        }
                    });
                }
                // other LOD server
                else {

                }
            },
            select: function(event, ui) {
                self.openResForm.find('div.resourceLabelInput input').val(ui.item.label);
                self.openResForm.find('div.resourceUriInput input').val(ui.item.uri);
                self.openResForm.submit();
            // "Nothing selected, input was " + this.value;
            },
            close: function(event, ui) {

            }
        });

        // SELECT box palette
        self.selectBox = $('<div id="selectPalette" class="paletteItem opacityItem"></div>');
        self.selectBox.append('<span class="node-highlight-all"></span><span class="node-highlight-type-label"></span>');
        self.selectBox.find('span.node-highlight-type-label').append('<form><select name="nodeType"></select></form>');

        self.selectBox.find('select').change(function(){
            var selectedTypeUri = $('#paletteBox #selectPalette .node-highlight-type-label form select option').filter(":selected").val();
            var selNodes = Graph.getNodesByType(selectedTypeUri);
            for (var i=0; i<selNodes.length; i++){
                Graph.highlight($('div.resourceNodeBox[uri="' + selNodes[i].resource_id + '"]'), 2);
            }
        });

        // SEARCH box palette
        self.searchBox = $('<div id="searchPalette" class="paletteItem opacityItem"></div>');
        self.searchForm = $('<form id="searchForm"></form>');
        self.searchForm.append('<div class="searchInput"><input type="text" placeholder="Search text.." value="" /></div>');

        self.searchBox.append(self.searchForm);
        self.searchBox.append('<div class="clearSearchButton"><input type="button" value="Clear results" /></div>');
        self.searchBox.find('div.clearSearchButton input').button();

        self.searchForm.find('div.searchInput input').autocomplete({
            minLength: Profile.searchMinLength,
            source: new Array(),
            create: function(event, ui) {
            },
            change: function(event, ui) {
            },
            open: function(event, ui) {
            },
            select: function(event, ui) {
                event.preventDefault();
                var node = Graph.getNode(ui.item.value);
                node.vis_switchTab(ui.item.type, ui.item.property, ui.item.target);
            },
            focus: function(event, ui) {
                event.preventDefault();
            },
            response: function(event, ui) {
                // TODO: limit the num of results, orderings
                var query = self.searchForm.find('div.searchInput input').val();
                var label = '';
                $.each(ui.content, function(index, item) {
                    label = item.label;
                    var firstOcc = label.toLowerCase().indexOf(query.toLowerCase());
                    var fromPos = Math.max(0, firstOcc - Math.floor(Profile.searchMaxTitleLen / 2));
                    var toPos = Math.min(firstOcc + Math.ceil(Profile.searchMaxTitleLen / 2), item.label.length);
                    label = label.substring(fromPos, toPos);

                    if (fromPos > 0)
                        label = '..' + label;
                    if (toPos < item.label.length)
                        label = label + '..';

                    item.label = item.node + ' - ' + Profile.getPropertyLabel(item.property) + ' | ' + label;
                });
                self.refreshSearchDatabase();
            },
            close: function(event, ui) {
            }
        });

        // REMOTE Search nodes ii
        var searchIIPathDepthValueDefault = 2;
        var searchIINodeNumValueDefault = 10;
        self.searchRemoteBox = $('<div id="remoteSearchPalette" class="paletteItem opacityItem"></div>');
        self.searchRemoteBox.append('<div class="searchIIPathDepth"><div id="searchIIPathDepthSlider"></div><div id="searchIIPathDepthValue">max depth: ' + searchIIPathDepthValueDefault + '</div></div>');
        self.searchRemoteBox.append('<div class="serachIINodeNum"><div id="serachIINodeNumSlider"></div><div id="serachIINodeNumValue">max nodes: ' + searchIINodeNumValueDefault + '</div></div>');
        self.searchRemoteBox.append('<div class="searchIIInput"><input type="text" placeholder="Search content.." value="" /></div>');

        self.searchRemoteBox.append('<div class="remoteSearchButton"><input type="button" value="Search" /></div>');
        self.searchRemoteBox.find('.remoteSearchButton input').button();

        self.searchRemoteBox.find("#searchIIPathDepthSlider").slider({
            value: searchIIPathDepthValueDefault,
            min: 0,
            max: 5,
            step: 1,
            slide: function(event, ui) {
                self.searchRemoteBox.find("#searchIIPathDepthValue").empty().html("max depth: " + ui.value);
            }
        });
        self.searchRemoteBox.find("#serachIINodeNumSlider").slider({
            value: searchIINodeNumValueDefault,
            min: 1,
            max: 25,
            step: 1,
            slide: function(event, ui) {
                self.searchRemoteBox.find("#serachIINodeNumValue").empty().html("max nodes: " + ui.value);
            }
        });


        // REMOTE Connection Search
        var searchConnectionPathDepthValueDefault = 2;
        var searchConnectionNodeNumValueDefault = 10;
        self.searchConnectionBox = $('<div id="searchConnectionPalette" class="paletteItem opacityItem"></div>');
        self.searchConnectionBox.append('<div class="searchConnectionPathDepth"><div id="searchConnectionPathDepthSlider"></div><div id="searchConnectionPathDepthValue">max depth: ' + searchConnectionPathDepthValueDefault + '</div></div>');
        self.searchConnectionBox.append('<div class="serachConnectionNodeNum"><div id="serachConnectionNodeNumSlider"></div><div id="serachConnectionNodeNumValue">max nodes: ' + searchConnectionNodeNumValueDefault + '</div></div>');
        self.searchConnectionBox.append('<div class="searchConnectionInput"><input type="text" placeholder="Search connection.." value="" /></div>');

        self.searchConnectionBox.append('<div class="searchConnectionButton"><input type="button" value="Search" /></div>');
        self.searchConnectionBox.find('.searchConnectionButton input').button();

        self.searchConnectionBox.find("#searchConnectionPathDepthSlider").slider({
            value: searchConnectionPathDepthValueDefault,
            min: 0,
            max: 5,
            step: 1,
            slide: function(event, ui) {
                self.searchConnectionBox.find("#searchConnectionPathDepthValue").empty().html("max depth: " + ui.value);
            }
        });
        self.searchConnectionBox.find("#serachConnectionNodeNumSlider").slider({
            value: searchConnectionNodeNumValueDefault,
            min: 1,
            max: 25,
            step: 1,
            slide: function(event, ui) {
                self.searchConnectionBox.find("#serachConnectionNodeNumValue").empty().html("max nodes: " + ui.value);
            }
        });

        // FIND PATH box palette
        var findPathDepthValueDefault = 2;
        var findPathNodeNumValueDefault = 10;
        self.findPathBox = $('<div id="findPathPalette" class="paletteItem opacityItem"></div>');
        self.findPathBox.append('<div class="findPathDepth"><div id="findPathDepthSlider"></div><div id="findPathDepthValue">max depth: ' + findPathDepthValueDefault + '</div></div>');
        self.findPathBox.append('<div class="findPathNodeNum"><div id="findPathNodeNumSlider"></div><div id="findPathNodeNumValue">max nodes: ' + findPathNodeNumValueDefault + '</div></div>');

        self.findPathBox.append('<div class="findPathButton"><input type="button" value="Find path" /></div>');
        self.findPathBox.find('.findPathButton input').button();

        self.findPathBox.find("#findPathDepthSlider").slider({
            value: findPathDepthValueDefault,
            min: 2,
            max: 6,
            step: 2,
            slide: function(event, ui) {
                self.findPathBox.find("#findPathDepthValue").empty().html("max depth: " + ui.value);
            }
        });
        self.findPathBox.find("#findPathNodeNumSlider").slider({
            value: findPathNodeNumValueDefault,
            min: 2,
            max: 30,
            step: 1,
            slide: function(event, ui) {
                self.findPathBox.find("#findPathNodeNumValue").empty().html("max nodes: " + ui.value);
            }
        });

        // LOAD button
        self.buttonLoad = $('<div class="buttonWrap"><button id="loadGraphButton" title="Load current graph">Load</button></div>');
        parent.append(self.buttonLoad);


        // SAVE button
        self.buttonSave = $('<div class="buttonWrap"><button id="saveGraphButton" title="Save/Share current graph">Save/Share</button></div>');
        parent.append(self.buttonSave);

        // My Edits button
        self.buttonMyEdits = $('<div class="buttonWrap"><button id="myEditsButton" title="My edits - inserted and deleted connections">My edits</button></div>');
        parent.append(self.buttonMyEdits);

        // CLEAR button
        self.buttonClear = $('<div class="buttonWrap"><button id="clearGraphButton" title="Hide all nodes">Hide all</button></div>');
        parent.append(self.buttonClear);

        // DELETE selected button        
        self.buttonDeleteSelected = $('<div class="buttonWrap"><button id="deleteSelectedButton" title="Hide selected nodes">Hide selected</button></div>');
        parent.append(self.buttonDeleteSelected);

        // UNDO selected button        
        self.buttonUndo = $('<div class="buttonWrap"><button id="undoButton" title="Undo last action">Undo</button></div>');
        parent.append(self.buttonUndo);

        // edit mode button
//        self.buttonEdit = $('<div class="buttonWrap"><button id="editButton" title="Edit mode">Edit mode</button></div>')
//        parent.append(self.buttonEdit);

        // HELP button
        self.buttonHelp = $('<a href="help.html" id="helpButton" title="Help" target="_blank" width="32" height="32"><img src="img/system-help-3.png" width="32" height="32" /></button>').zIndex(1500);
        parent.append(self.buttonHelp);

        // logo
        self.logoWrap = $('<div id="logowrap"><div id="logo"><a href="http://www.sztaki.hu" target="_blank"><img src="img/SZTAKI_logo_2012_small_RGB.png" width="94" height="50" /></a></div></div>');
        parent.append(self.logoWrap);

        $("#loadGraphButton, #saveGraphButton, #myEditsButton, #clearGraphButton, #deleteSelectedButton, #undoButton, #editButton").button();

        self.buttonLoad.position({my: "left bottom", at: "left+10 bottom-10", of: window});
        self.buttonSave.position({my: "left bottom", at: "right bottom", of: self.buttonLoad});
        self.buttonMyEdits.position({my: "left bottom", at: "right bottom", of: self.buttonSave});
        self.buttonClear.position({my: "left bottom", at: "right bottom", of: self.buttonMyEdits});
        self.buttonDeleteSelected.position({my: "left bottom", at: "right bottom", of: self.buttonClear});
        self.buttonUndo.position({my: "left bottom", at: "right bottom", of: self.buttonDeleteSelected});
//        self.buttonEdit.position({my: "left bottom", at: "right bottom", of: self.buttonUndo});
        self.buttonHelp.position({my: "right bottom", at: "right-5 bottom-5", of: window});
        self.logoWrap.position({my: "left bottom", at: "left top", of: self.buttonLoad});

        // window resize - fix the position of the buttom 3 buttons 
        $(window).resize(function() {
            self.buttonLoad.position({my: "left bottom", at: "left+10 bottom-10", of: window});
            self.buttonSave.position({my: "left bottom", at: "right bottom", of: self.buttonLoad});
            self.buttonMyEdits.position({my: "left bottom", at: "right bottom", of: self.buttonSave});
            self.buttonClear.position({my: "left bottom", at: "right bottom", of: self.buttonMyEdits});
            self.buttonDeleteSelected.position({my: "left bottom", at: "right bottom", of: self.buttonClear});
            self.buttonUndo.position({my: "left bottom", at: "right bottom", of: self.buttonDeleteSelected});
//            self.buttonEdit.position({my: "left bottom", at: "right bottom", of: self.buttonUndo});
            self.buttonHelp.position({my: "right bottom", at: "right-5 bottom-5", of: window});
            self.logoWrap.position({my: "left bottom", at: "left top", of: self.buttonLoad});
        });

        // make paletteBox, Accordion for now
        parent.append(self.paletteBox);
        self.paletteBox.append('<h3>Show node</h3>');
        self.paletteBox.append(self.openResBox);
        self.paletteBox.append('<h3>Add new node</h3>');
        self.paletteBox.append(self.addNewResBox);
        self.paletteBox.append('<h3>Select nodes</h3>');
        self.paletteBox.append(self.selectBox);
        self.paletteBox.append('<h3>Find content in visible nodes</h3>');
        self.paletteBox.append(self.searchBox);
        self.paletteBox.append('<h3>Find content in neighbourhood</h3>');
        self.paletteBox.append(self.searchRemoteBox);
        self.paletteBox.append('<h3>Find connections in neighbourhood</h3>');
        self.paletteBox.append(self.searchConnectionBox);
        self.paletteBox.append('<h3>Find path between nodes</h3>');
        self.paletteBox.append(self.findPathBox);
        self.paletteBox.accordion({
            collapsible: true,
            heightStyle: "content",
            active: 0,
            beforeActivate: function( event, ui ) {

            },
            activate: function(event, ui) {
                if (ui.newPanel.attr('id') === 'addResourcePalette'){
                    self.openResForm.find('div.resourceLabelInput input').focus();
                }
                else if (ui.newPanel.attr('id') === 'addNewResourcePalette'){
                    self.addNewResForm.find('div.resourceLabelInput input').focus();
                    var select = self.addNewResForm.find('select');
                    select.empty();

                    var nodeTypesListSorted = Helper.getDictionaryListSorted(Graph.nodeTypes);
                    for (var i = 0; i < nodeTypesListSorted.length; i++) {
                        if (nodeTypesListSorted[i].key.toLowerCase() !== 'thing'){
                            select.append('<option value="' + nodeTypesListSorted[i].value + '" title="'+ nodeTypesListSorted[i].value +'">' + nodeTypesListSorted[i].key + '</option>');
                        }
                    }

                    select.prepend('<option value="http://schema.org/Thing" title="http://schema.org/Thing">Thing</option>');
                    select.prepend('<option value="" title="-Select a type-">-Select a type-</option>');
                }
                else if (ui.newPanel.attr('id') === 'searchPalette'){
                    self.searchForm.find('div.searchInput input').focus();
                }
                else if (ui.newPanel.attr('id') === 'selectPalette'){
                    var select = self.selectBox.find('form select');
                    select.empty();

                    var nodeTypesListSorted = Helper.getDictionaryListSorted(Graph.nodeTypes);
                    for (var i = 0; i < nodeTypesListSorted.length; i++) {
                        if (nodeTypesListSorted[i].key.toLowerCase() !== 'thing'){
                            select.append('<option value="' + nodeTypesListSorted[i].value + '" title="'+ nodeTypesListSorted[i].value +'">' + nodeTypesListSorted[i].key + '</option>');
                        }
                    }

                    select.prepend('<option value="" selected="selected">-Select a type-</option>');
                }
            }
        }).css({
            'position': 'fixed',
            'width': '200px',
            'z-index': '1100'
        }).parent().addClass('opacityItem');

        self.paletteBox.position({at: "left bottom", my: "left top", of: $("#headerWrapper")})
    };

    this.graphSaveFinished = function(json) {
        if (json.error !== undefined) {
            Helper.alertDialog(Profile.alertTexts.loadGraph.title, Profile.alertTexts.loadGraph.text);
        } else {
            Graph.lastsavedgraphid = json.graph_id;
            Graph.lastsavedgraphname = json.graph_name;
            Graph.lastsavedgraphusername = json.graph_username;
            var locationport = (location.port === "") ? "" : ":" + location.port;

            $('#main').append('<div id="save-finished-dialog" title="Saving the graph has been finished"><p>You might share the link of your graph: <a href=\"' + location.protocol + '//' + location.hostname + locationport + location.pathname + '?id=' + Graph.lastsavedgraphid + '" target="_blank">' + Graph.lastsavedgraphname + '</a></p></div>');
            $("#save-finished-dialog").dialog({
                autoOpen: true,
                height: 150,
                width: 400,
                modal: true,
                buttons: {
                    "Ok": function() {
                        $(this).dialog("close");
                    }
                },
                close: function() {
                    $(this).remove();
                }
            });
        }
    };


    this.graphNameAutoComplete = function(json, response) {
//        console.log(json);
        var data = $.map(json.graph_names, function(item) {
            return {
                label: item,
                value: item
            };
        });
        response(data);
    };

    this.getSearchData = function() {
        var data = new Array();
        $.each(Graph.nodes, function(index, node) {
            $.each(node.literals, function(property, literalObj) {
                $.each(literalObj, function(language, literalArray) {
                    $.each(literalArray, function(index, literal) {
                        data.push({
                            type: 'literals',
                            label: literal,
                            value: node.resource_id,
                            node: node.label,
                            property: property,
                            target: literal
                        });
                    });
                });
            });
            $.each(node.connections, function(index, connObj) {
                data.push({
                    type: connObj.direction,
                    label: connObj.endpointLabel,
                    value: node.resource_id,
                    node: node.label,
                    property: connObj.connectionUri,
                    target: connObj.target
                });
            });
        });

        return data;
    };

    this.graphNameAutoComplete = function(json, response) {
        if (json.error !== undefined) {
            $("#loadgraphclosebtn").click();
            Helper.alertDialog(Profile.alertTexts.loadGraph.title, Profile.alertTexts.loadGraph.text);
        } else {

            var data = $.map(json.graph_names, function(item) {
                return {
                    label: item,
                    value: item
                };
            });
            response(data);
        }
    };

    this.refreshSearchDatabase = function() {
        self.searchForm.find('div.searchInput input').autocomplete('option', 'source', self.getSearchData());
    };

    this.openNode = function(newURI, undoActionLabel) {
        if (newURI && newURI !== '') {
            Graph.addNode(newURI, false, false, false, false, undoActionLabel);
        }
        self.openResForm.find('div.resourceLabelInput input').removeClass('ui-autocomplete-loading');
    };

    this.addNewNode = function(uriPrefix, nodeLabel, typeLabel, typeUri, endpointUri, thumbnailURL, undoActionLabel) {
        var newURI = uriPrefix + new Date().getTime();

        var isNewNodeAdded = Graph.addNewNode(newURI, nodeLabel, typeLabel, typeUri, endpointUri, thumbnailURL, undoActionLabel);
        if (isNewNodeAdded){
            Graph.insertConnection(newURI, Profile.labelURIs[2], nodeLabel, "literalConnection");
            Graph.insertConnection(newURI, Profile.commonURIs.propTypeURI, typeUri, "nodeConnection");
            if (thumbnailURL && thumbnailURL !== 'undefined'){
                Graph.insertConnection(newURI, Profile.commonURIs.propDepictionURI, thumbnailURL, "literalConnection");
            }
        }
    };

    this.vis_add_load_progressbar = function(selector) {
        selector.append('<div class="progressbar"><div class="progress-label">Loading...</div></div>');
        var pbar = selector.find('.progressbar');
        pbar.progressbar({
            value: false
        });
    };
    this.vis_remove_load_progressbar = function(selector) {
        var pbar = selector.find('.progressbar').remove();
    };

};
