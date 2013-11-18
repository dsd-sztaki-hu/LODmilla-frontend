/*
 * Class:Sidemenu
 * Elements which are not parts of the graph structure.  
 */
var Sidemenu = new function() {
    this.paletteBox = '';
    this.addResBox = '';
    this.addResForm = '';
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

        self.addResBox = $('<div id="addResourcePalette" class="paletteItem opacityItem" title="Add new resource"></div>');
        self.addResForm = $('<form id="searchForm"></form>');
        self.addResForm.append('<select><option value="sztaki" selected="selected">Sztaki</option><option value="dbpedia">DBpedia</option></select>');
        self.addResForm.append('<div class="searchInput resourceLabelInput"><input type="text" value="" /></div>');
        self.addResForm.append('<div class="searchInput searchInputInactive resourceUriInput"><input type="text" value="" /></div>');
        self.addResForm.append('<div class="addResourceClearButton"><input type="button" value="Clear" /></div>');
        self.addResForm.append('<div class="addResourceHint">(or add URL from grey with enter)</div>');        

        // ADD NEW resource palette
        self.addResForm.find('select').change(function() {
            self.addResForm.find('div.resourceLabelInput input').removeClass('ui-autocomplete-loading');
            var lodServer = $(this).find('option:selected').attr('value');
            var searchInput = self.addResForm.find('div.resourceLabelInput input');
            if (lodServer) {
                self.addResForm.find('div.resourceLabelInput').removeClass('searchInputInactive');
                searchInput.val('').removeAttr('readonly').focus();
            }
            else {
                self.addResForm.find('div.resourceLabelInput').addClass('searchInputInactive');
                searchInput.val('').attr('readonly', 'readonly');
            }
            self.addResForm.find('div.resourceUriInput input').val('');
        });

        self.addResBox.append(self.addResForm);
        
        // clear button
        self.addResForm.find('div input[type="button"]').button();
        self.addResForm.find('div input[type="button"]').click(function() {
            self.addResForm.find('div.resourceLabelInput input').val('');
            self.addResForm.find('div.resourceUriInput input').val('');
            self.addResForm.find('div.resourceLabelInput input').removeClass('ui-autocomplete-loading');
            self.addResForm.find('div.resourceLabelInput input').focus();
        });
        
        // event for pressing enter in grey input aka adding resource from URI
        self.addResForm.find('div.resourceUriInput input').keypress(function(e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                var newURI = $(this).val();
                var undoActionLabel = 'action_sidemenu_addNewNode';
                self.addNewNode(newURI, undoActionLabel);
                return false;
            }
        });

        // event for submitting, aka clicking on a found resource
        self.addResForm.bind('submit', function(e) {
            e.preventDefault();
            var newURI = $(this).find('div.resourceUriInput input').val();
            var undoActionLabel = 'action_sidemenu_addNewNode';
            self.addNewNode(newURI, undoActionLabel);
            return false;
        });

        // add new res search autocomplete        
        self.addResForm.find('div.resourceLabelInput input').autocomplete({
            minLength: Profile.addNewResourceSearchMinLength,
            delay: Profile.addNewResourceSearchDelay,
            source: function(request, response) {
                var lodServer = self.addResForm.find('select option:selected').val();
                var searchResults = [];

                // search on dbpedia LOD
                // TODO: success and complete functions to server_connectorba. DRY!
                if (lodServer === 'dbpedia') {
                    var searchTerm = request.term;
                    var sparqlURL = Profile.searchURLs.dbpedia.replace('{SEARCH_TERM}', searchTerm);
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
                            self.addResForm.find('div.resourceLabelInput input').removeClass('ui-autocomplete-loading');
                            alert(errorThrown);
                        }
                    });
                }
                // search in sztaki LOD
                // TODO: search in different graphs separately in sztaki LOD
                else if (lodServer === 'sztaki') {
                    var searchTerm = request.term;
                    var sparqlURL = Profile.searchURLs.sztaki[0];
                    searchTerm = searchTerm.split(' ');
                    for (var i = 0; i < searchTerm.length; i++) {
                        if (searchTerm[i].length > 3) {
                            searchTerm[i] += '*';
                        }
                    }
                    searchTerm = searchTerm.join(' ');
                    sparqlURL += searchTerm + Profile.searchURLs.sztaki[1];
                    $.ajax({
                        url: sparqlURL,
                        async: true,
                        //dataType: "jsonp",
                        data: {
                        },
                        success: function(data) {
                            var results = $(data);
                            results.find('result').each(function() {
                                var label = $(this).children("binding[name='o1']").children('literal').text();
                                searchResults.push({
                                    uri: $(this).children("binding[name='s1']").children('uri').text(),
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
                            self.addResForm.find('div.resourceLabelInput input').removeClass('ui-autocomplete-loading');
                            alert(errorThrown);
                        }
                    });
                }
                // other LOD server
                else {

                }
            },
            select: function(event, ui) {
                self.addResForm.find('div.resourceLabelInput input').val(ui.item.label);
                self.addResForm.find('div.resourceUriInput input').val(ui.item.uri);
                self.addResForm.submit();
            // "Nothing selected, input was " + this.value;
            },
            close: function(event, ui) {

            }
        });

        // SELECT box palette
        self.selectBox = $('<div id="selectPalette" class="paletteItem opacityItem"></div>');
        self.selectBox.append('<span class="node-highlight-type"></span><span class="node-highlight-type-label"></span>');
        self.selectBox.find('span.node-highlight-type-label').append('<form><label for="nodeType">type: </label><select name="nodeType"><option value="_all" selected="selected">*all nodes</option></select></form>');

        self.selectBox.find('.node-highlight-type').click(function() {
            $(this).addClass('opened-half');
            if ($(this).hasClass('opened')) {
                Graph.removeAllHighlights();
            }
            else {
                var selectedType = $('#paletteBox #selectPalette .node-highlight-type-label form select option').filter(":selected").val();
                if (selectedType === '_all')
                    Graph.highlightAll();
                else
                    Graph.highlight($('div.resourceNodeBox[nodetype="' + selectedType + '"]'), 2);
            }
        });

        // SEARCH box palette
        self.searchBox = $('<div id="searchPalette" class="paletteItem opacityItem"></div>');
        self.searchForm = $('<form id="searchForm"></form>');
        self.searchForm.append('<div class="searchInput"><input type="text" value="" /></div>');
        var buttonClearSearch = $('<div class="clearSearchButton"><input type="button" value="Clear results" /></div>');

        buttonClearSearch.find('input').button();
        buttonClearSearch.click(function() {
            $('#nodeOpenedContentTabs .property-value-normal').removeClass('property-value-highlighted');
        });

        self.searchBox.append(self.searchForm);
        self.searchBox.append(buttonClearSearch);

        self.searchBox.find("#searchDepthSlider").slider({
            value: 1,
            min: 1,
            max: 5,
            step: 1,
            slide: function(event, ui) {
                self.searchBox.find("#searchDepthValue").empty().html("depth: " + ui.value);
            }
        });

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
        self.searchForm.find('div.searchInput input').click(function() {
            self.refreshSearchDatabase();
        });

        // REMOTE Search nodes ii
        var searchIIPathDepthValueDefault = 2;
        var searchIINodeNumValueDefault = 10;
        self.searchRemoteBox = $('<div id="searchIIPalette" class="paletteItem opacityItem"></div>');
        self.searchRemoteBox.append('<div class="searchIIPathDepth"><div id="searchIIPathDepthSlider"></div><div id="searchIIPathDepthValue">max depth: ' + searchIIPathDepthValueDefault + '</div></div>');
        self.searchRemoteBox.append('<div class="serachIINodeNum"><div id="serachIINodeNumSlider"></div><div id="serachIINodeNumValue">max nodes: ' + searchIINodeNumValueDefault + '</div></div>');
        self.searchRemoteBox.append('<div class="searchIIInput"><input type="text" value="" /></div>');
        var buttonSearchRemote = $('<div class="searchIIButton"><input type="button" value="Search" /></div>');

        buttonSearchRemote.find('input').button();
        self.searchRemoteBox.append(buttonSearchRemote);

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

        buttonSearchRemote.click(function() {
            if ($(this).attr('loading') !== 'true') {
                var nodesHighlighted = $('.resourceNodeBox.highlighted');
                if (nodesHighlighted.size() === 0) {
                    Profile.alertDialog(Profile.alertTexts.searchRemoteSelected.title, Profile.alertTexts.searchRemoteSelected.text);
                } else if ($('#searchIIPalette input').val().trim() === "") {
                    Profile.alertDialog(Profile.alertTexts.searchRemoteSearchText.title, Profile.alertTexts.searchRemoteSearchText.text);
                }
                else {
                    $(this).attr('loading', 'true');
                    self.vis_add_load_progressbar($('#searchIIPalette'));
                    var depth = $('#searchIIPalette #searchIIPathDepthSlider').slider('value');
                    var nodesNum = $('#searchIIPalette #serachIINodeNumSlider').slider('value');
                    var searchText = $('#searchIIPalette input').val().trim();
                    var nodes = {'urls': []};
                    $.each(nodesHighlighted, function(index, node) {
                        nodes['urls'].push($(node).attr('uri'));
                    });
                    var undoActionLabel = 'action_sidemenu_searchRemote';
                    BackendCommunicator.findContent(JSON.stringify(nodes), depth, nodesNum, searchText, Graph.searchRemote, undoActionLabel);
                }
            }
            else
                Profile.alertDialog(Profile.alertTexts.searchRemoteIdle.title, Profile.alertTexts.searchRemoteIdle.text);
        });


        // REMOTE Connection Search
        var searchConnectionPathDepthValueDefault = 2;
        var searchConnectionNodeNumValueDefault = 10;
        self.searchConnectionBox = $('<div id="searchConnectionPalette" class="paletteItem opacityItem"></div>');
        self.searchConnectionBox.append('<div class="searchConnectionPathDepth"><div id="searchConnectionPathDepthSlider"></div><div id="searchConnectionPathDepthValue">max depth: ' + searchConnectionPathDepthValueDefault + '</div></div>');
        self.searchConnectionBox.append('<div class="serachConnectionNodeNum"><div id="serachConnectionNodeNumSlider"></div><div id="serachConnectionNodeNumValue">max nodes: ' + searchConnectionNodeNumValueDefault + '</div></div>');
        self.searchConnectionBox.append('<div class="searchConnectionInput"><input type="text" value="" /></div>');
        var buttonSearchConnection = $('<div class="searchConnectionButton"><input type="button" value="Search" /></div>');

        buttonSearchConnection.find('input').button();
        self.searchConnectionBox.append(buttonSearchConnection);

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

        buttonSearchConnection.click(function() {
            if ($(this).attr('loading') !== 'true') {
                var nodesHighlighted = $('.resourceNodeBox.highlighted');
                if (nodesHighlighted.size() === 0) {
                    Profile.alertDialog(Profile.alertTexts.searchConnectionSelected.title, Profile.alertTexts.searchConnectionSelected.text);
                } else if ($('#searchConnectionPalette input').val().trim() === "") {
                    Profile.alertDialog(Profile.alertTexts.searchConnectionSearchText.title, Profile.alertTexts.searchConnectionSearchText.text);
                }
                else {
                    $(this).attr('loading', 'true');
                    self.vis_add_load_progressbar($('#searchConnectionPalette'));
                    var depth = $('#searchConnectionPalette #searchConnectionPathDepthSlider').slider('value');
                    var nodesNum = $('#searchConnectionPalette #serachConnectionNodeNumSlider').slider('value');
                    var searchText = $('#searchConnectionPalette input').val().trim();
                    var nodes = {'urls': []};
                    $.each(nodesHighlighted, function(index, node) {
                        nodes['urls'].push($(node).attr('uri'));
                    });
                    var undoActionLabel = 'action_sidemenu_searchConnection';
                    BackendCommunicator.findConnections(JSON.stringify(nodes), depth, nodesNum, searchText, Graph.searchConnections, undoActionLabel);
                }
            }
            else
                Profile.alertDialog(Profile.alertTexts.searchConnectionIdle.title, Profile.alertTexts.searchConnectionIdle.text);
        });

        // FIND PATH box palette
        var findPathDepthValueDefault = 2;
        var findPathNodeNumValueDefault = 10;
        self.findPathBox = $('<div id="findPathPalette" class="paletteItem opacityItem"></div>');
        self.findPathBox.append('<div class="findPathDepth"><div id="findPathDepthSlider"></div><div id="findPathDepthValue">max depth: ' + findPathDepthValueDefault + '</div></div>');
        self.findPathBox.append('<div class="findPathNodeNum"><div id="findPathNodeNumSlider"></div><div id="findPathNodeNumValue">max nodes: ' + findPathNodeNumValueDefault + '</div></div>');
        var buttonFindPath = $('<div class="findPathButton"><input type="button" value="Find path" /></div>');

        buttonFindPath.find('input').button();
        self.findPathBox.append(buttonFindPath);

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

        buttonFindPath.click(function() {
            if ($(this).attr('loading') !== 'true') {
                var nodesHighlighted = $('.resourceNodeBox.highlighted');
                if (nodesHighlighted.size() !== 2) {
                    Profile.alertDialog(Profile.alertTexts.findPathNodesSelected.title, Profile.alertTexts.findPathNodesSelected.text);
                }
                else {
                    $(this).attr('loading', 'true');
                    self.vis_add_load_progressbar($('#findPathPalette'));
                    var depth = $('#findPathPalette #findPathDepthSlider').slider('value');
                    var nodesNum = $('#findPathPalette #findPathNodeNumSlider').slider('value');
                    var nodes = {'urls': []};
                    $.each(nodesHighlighted, function(index, node) {
                        nodes['urls'].push($(node).attr('uri'));
                    });
                    var undoActionLabel = 'action_sidemenu_findPath';
                    BackendCommunicator.findPath(JSON.stringify(nodes), depth, nodesNum, Graph.findPath, undoActionLabel);
                }
            }
            else
                Profile.alertDialog(Profile.alertTexts.findPathNodesIdle.title, Profile.alertTexts.findPathNodesIdle.text);
        });

        // LOAD button
        self.buttonLoad = $('<div class="buttonWrap"><button id="loadGraphButton" title="Load">Load</button></div>');
        parent.append(self.buttonLoad);
        $("#loadGraphButton").button();
        self.buttonLoad.position({my: "left bottom", at: "left+10 bottom-10", of: window});

        $("#loadGraphButton").click(function() {
            $('#main').append('<div id="dialog-form" title="Load a graph from the backend"><form><fieldset><label for="graphid">ID</label><input type="text" name="graphid" id="graphid" value="" class="text ui-widget-content ui-corner-all" /><p>Or</p><label for="user_name">Username</label><input type="text" name="user_name" id="user_name" class="text ui-widget-content ui-corner-all" /><label for="graph_name">Graph title</label><input type="text" name="graph_name" id="graph_name" class="text ui-widget-content ui-corner-all" /></fieldset></form><div id="dialog-confirm" title="Load the graph?"><p><span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0;"></span>The actual content of the graph will be lost. Are you sure?</p></div></div>');

            allFields = $([]).add($('#user_name')).add($('#graphid')).add($('#graph_name'));

            $("#graphid").keyup(function() {
                if ($("#graphid").val().length === 0) {
                    $("#user_name").removeAttr('disabled');
                    $("[for=user_name]").fadeTo(100, 1);
                    $("#user_name").fadeTo(100, 1);
                    $("#graph_name").removeAttr('disabled');
                    $("[for=graph_name]").fadeTo(100, 1);
                    $("#graph_name").fadeTo(100, 1);
                } else {
                    $("#user_name").attr('disabled', '');
                    $("[for=user_name]").fadeTo(100, 0.5);
                    $("#user_name").fadeTo(100, 0.5);
                    $("#graph_name").attr('disabled', '');
                    $("[for=graph_name]").fadeTo(100, 0.5);
                    $("#graph_name").fadeTo(100, 0.5);
                }
            });

            $("#graph_name").autocomplete({
                source: BackendCommunicator.graphNameAutocomplete,
                //appendTo: "#graph_name",
                minLength: 0,
                open: function() {
//                    console.log("open");
                },
                close: function() {
//                    console.log("close");
                }
            }).focus(function() {
                $(this).autocomplete("search", "");
            });

            $("#dialog-form").dialog({
                autoOpen: true,
                height: 350,
                width: 350,
                modal: true,
                draggable: false,
                buttons: {
                    "Load": function() {
                        var bValid = true;
                        allFields.removeClass("ui-state-error");
                        if ($("#user_name").val().length === 0 && $("#graph_name").val().length !== 0 && $("#graphid").val().length === 0) {
                            bValid = false;
                            $("#user_name").addClass("ui-state-error");
                        }
                        else if ($("#graph_name").val().length === 0 && $("#user_name").val().length !== 0 && $("#graphid").val().length === 0) {
                            bValid = false;
                            $("#graph_name").addClass("ui-state-error");
                        }
                        else if ($("#graphid").val().length === 0 && $("#user_name").val().length === 0 && $("#graph_name").val().length === 0) {
                            bValid = false;
                            $("#graphid").addClass("ui-state-error");
                            $("#user_name").addClass("ui-state-error");
                            $("#graph_name").addClass("ui-state-error");
                        }
                        if (bValid) {
                            var undoActionLabel = 'action_bottomMenu_loadGraph';
                            BackendCommunicator.load($("#graphid").val(), $("#user_name").val(), $("#graph_name").val(), Graph.load, undoActionLabel);
                            $(this).dialog("close");
                        }
                    },
                    Cancel: {
                        text: "Cancel",
                        id: "loadgraphclosebtn",
                        click: function() {
                            $(this).dialog("close");
                        }
                    }
                },
                close: function() {
                    $(this).remove();
                }
            });

        });

        // SAVE button
        self.buttonSave = $('<div class="buttonWrap"><button id="saveGraphButton" title="Save/Share">Save/Share</button></div>');
        parent.append(self.buttonSave);
        $("#saveGraphButton").button();
        self.buttonSave.position({my: "left bottom", at: "right bottom", of: self.buttonLoad});

        $("#saveGraphButton").click(function() {
            var lastsavedhandler = "";
            if (Graph.lastsavedgraphid !== null) {
                var locationport = (location.port === "") ? "" : ":" + location.port;
                lastsavedhandler = '<fieldset><h3>Share</h3><label for="lastsavedlink">Link to the last saved/loaded version: </label><a href="' + location.protocol + '//' + location.hostname + locationport + location.pathname + '?id=' + Graph.lastsavedgraphid + '" target="_blank">' + Graph.lastsavedgraphname + '</a><p>If you have updated the graph, you have to save it first (below)!</p></fieldset>';
            } else {
                lastsavedhandler = '<fieldset><h3>Share</h3><p>Before sharing the graph you have to save it first (below)!</p></fieldset>';
            }
            $('#main').append('<div id="dialog-form" title="Save/Share the graph"><form>' + lastsavedhandler + '<fieldset><h3>Save</h3><label for="user_name">Your name</label><input type="text" name="user_name" id="user_name" class="text ui-widget-content ui-corner-all" value="' + Graph.lastsavedgraphusername + '" /><label for="graph_name">Graph title</label><input type="text" name="graph_name" id="graph_name" class="text ui-widget-content ui-corner-all" value="' + Graph.lastsavedgraphname + '" /></fieldset></form></div>');

            allFields = $([]).add($('#user_name')).add($('#graph_name'));

            $("#dialog-form").dialog({
                autoOpen: true,
                height: (Graph.lastsavedgraphid === null) ? 400 : 450,
                width: 400,
                modal: true,
                buttons: {
                    "Save": function() {
                        var bValid = true;
                        allFields.removeClass("ui-state-error");
                        if ($("#user_name").val().length === 0) {
                            bValid = false;
                            $("#user_name").addClass("ui-state-error");
                        }
                        if ($("#graph_name").val().length === 0) {
                            bValid = false;
                            $("#graph_name").addClass("ui-state-error");
                        }
                        if (bValid) {
//                            console.log(Graph.serialize_0());
                            BackendCommunicator.save($("#user_name").val(), $("#graph_name").val(), Graph.serialize_0(), Sidemenu.graphSaveFinished);
                            $(this).dialog("close");
                        }
                    },
                    Cancel: function() {
                        $(this).dialog("close");
                    }
                },
                close: function() {
                    $(this).remove();
                }
            });

        });

        // CLEAR button
        self.buttonClear = $('<div class="buttonWrap"><button id="clearGraphButton" title="Clear">Clear</button></div>');
        parent.append(self.buttonClear);
        $("#clearGraphButton").button();

        self.buttonClear.position({my: "left bottom", at: "right bottom", of: self.buttonSave});
        $("#clearGraphButton").click(function() {
            var nodeList = [];
            var highlighted;
            $.each($('div.resourceNodeBox'), function() {
                if ($(this).hasClass('highlighted'))
                    highlighted = true;
                else
                    highlighted = false;
                var top = Graph.getNode(this.getAttribute('uri')).top;
                var left = Graph.getNode(this.getAttribute('uri')).left;
                nodeList.push({resource_id: this.getAttribute('uri'), action: 'removed', highlighted: highlighted, top: top, left: left});
            });
            Graph.clear();
            var undoActionLabel = 'action_bottomMenu_clearGraph';
            Graph.logUndoAction(undoActionLabel, nodeList);
        });

        // DELETE selected button        
        self.buttonDeleteSelected = $('<div class="buttonWrap"><button id="deleteSelectedButton" title="Delete selected">Delete selected</button></div>');
        parent.append(self.buttonDeleteSelected);
        $("#deleteSelectedButton").button();

        self.buttonDeleteSelected.position({my: "left bottom", at: "right bottom", of: self.buttonClear});
        $("#deleteSelectedButton").click(function() {
            var nodeList = [];
            $.each($('div.resourceNodeBox.highlighted'), function() {
                var top = Graph.getNode(this.getAttribute('uri')).top;
                var left = Graph.getNode(this.getAttribute('uri')).left;
                nodeList.push({resource_id: this.getAttribute('uri'), action: 'removed', highlighted: true, top: top, left: left});
                Graph.deleteNode(this.getAttribute('uri'));
            });
            var undoActionLabel = 'action_bottomMenu_deleteSelected';
            Graph.logUndoAction(undoActionLabel, nodeList);
        });

        // UNDO selected button        
        self.buttonUndo = $('<div class="buttonWrap"><button id="undoButton" title="Undo">Undo</button></div>');
        parent.append(self.buttonUndo);
        $("#undoButton").button();

        self.buttonUndo.position({my: "left bottom", at: "right bottom", of: self.buttonDeleteSelected});
        $("#undoButton").click(function() {
            Graph.undo();
        });

        // HELP button
        self.buttonHelp = $('<a href="help.html" id="helpButton" title="Help" target="_blank" width="32" height="32"><img src="img/system-help-3.png" width="32" height="32" /></button>').zIndex(1500);
        parent.append(self.buttonHelp);

        self.buttonHelp.position({my: "right bottom", at: "right-5 bottom-5", of: window});

        // logo
        self.logoWrap = $('<div id="logowrap"><div id="logo"><a href="http://www.sztaki.hu" target="_blank"><img src="img/SZTAKI_logo_2012_small_RGB.png" width="94" height="50" /></a></div></div>');
        parent.append(self.logoWrap);
        self.logoWrap.position({at: "left top", my: "left bottom", of: self.buttonLoad});

        // window resize - fix the position of the buttom 3 buttons 
        $(window).resize(function() {
            self.buttonLoad.position({my: "left bottom", at: "left+10 bottom-10", of: window});
            self.buttonSave.position({my: "left bottom", at: "right bottom", of: self.buttonLoad});
            self.buttonClear.position({my: "left bottom", at: "right bottom", of: self.buttonSave});
            self.buttonDeleteSelected.position({my: "left bottom", at: "right bottom", of: self.buttonClear});
            self.buttonUndo.position({my: "left bottom", at: "right bottom", of: self.buttonDeleteSelected});
            self.buttonHelp.position({my: "right bottom", at: "right-5 bottom-5", of: window});
            self.logoWrap.position({at: "left top", my: "left bottom", of: self.buttonLoad});
        });

        // make paletteBox, Accordion for now
        parent.append(self.paletteBox);
        self.paletteBox.append('<h3>Add new node</h3>');
        self.paletteBox.append(self.addResBox);
        self.paletteBox.append('<h3>Select nodes</h3>');
        self.paletteBox.append(self.selectBox);
        self.paletteBox.append('<h3>Search in nodes</h3>');
        self.paletteBox.append(self.searchBox);
        self.paletteBox.append('<h3>Remote content search</h3>');
        self.paletteBox.append(self.searchRemoteBox);
        self.paletteBox.append('<h3>Remote connection search</h3>');
        self.paletteBox.append(self.searchConnectionBox);
        self.paletteBox.append('<h3>Find path between nodes</h3>');
        self.paletteBox.append(self.findPathBox);
        self.paletteBox.accordion({
            collapsible: true,
            heightStyle: "content",
            active: 0,
            activate: function(event, ui) {
                if (ui.newPanel.attr('id') === 'addResourcePalette')
                    self.addResForm.find('div.resourceLabelInput input').focus();
                else if (ui.newPanel.attr('id') === 'searchPalette')
                    self.searchForm.find('div.searchInput input').focus();
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
            Profile.alertDialog(Profile.alertTexts.loadGraph.title, Profile.alertTexts.loadGraph.text);
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
                    property: connObj.connectionLabel,
                    target: connObj.target
                });
            });
        });

        return data;
    };

    this.graphNameAutoComplete = function(json, response) {
        if (json.error !== undefined) {
            $("#loadgraphclosebtn").click();
            Profile.alertDialog(Profile.alertTexts.loadGraph.title, Profile.alertTexts.loadGraph.text);
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

    this.refreshSearchDatabase = function(header, text) {
        self.searchForm.find('div.searchInput input').autocomplete('option', 'source', self.getSearchData());
    };

    this.refreshTypeSelectList = function(type) {
        var sel = self.selectBox.find('.node-highlight-type-label form select');
        sel.append('<option value="' + type + '">' + type + '</option>');
    };

    this.addNewNode = function(newURI, undoActionLabel) {        
        if (newURI && newURI !== '') {
            Graph.addNode(newURI, false, false, false, false, undoActionLabel);
        }
        self.addResForm.find('div.resourceLabelInput input').removeClass('ui-autocomplete-loading');
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
