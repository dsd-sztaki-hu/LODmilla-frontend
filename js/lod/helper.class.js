/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth - MTA SZTAKI DSD
 *
 */

 /**
 * Created by turbo on 2014.04.30..
 */
var Helper = new function(){

    this.isLoadScreenOpen = false;
    this.loadScreen;
    this.loadText;

    this.getCapitalizedString = function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    this.truncateString = function(str, maxlen) {
        if (str && str.length > maxlen) {
            str = str.substring(0, maxlen) + '..';
        }
        return str;
    };

    this.getEndpointLabelOrUriEnd = function(item, direction) {
        var label = decodeURIComponent(item[direction].value);
        if (item.label && item.label.value) {
            label = item.label.value;
        }
        else {
            label = this.getShortTypeFromURL(label);
//            label = label.replace(/\/+$/, "").split('/');
//            label = label[(label.length) - 1];
        }
        return label;
    };

    this.getShortTypeFromURL = function(node_uri) {
        var node_uri_orig = node_uri;
        while (node_uri.indexOf('/') > -1) {
            node_uri = node_uri.substring(node_uri.indexOf('/') + 1);
        }
        while (node_uri.indexOf('#') > -1) {
            node_uri = node_uri.substring(node_uri.indexOf('#') + 1);
        }
        // TODO: ha nincs semmi az utolso / vagy # utan, akkor valamit adjon vissza, jelenleg akkor az egesz URLt
        if (!node_uri || node_uri === "")
            return node_uri_orig;
        else
            return node_uri;
    };

    this.getLodServerBaseUrl = function(uri) {
        var temp = uri.replace('http://', '');
        return 'http://' + temp.substring(0, temp.indexOf('/'));
    };

    this.getDictionaryListSorted = function(dictionaryList){
        var sorted = [];
        for (var prop in dictionaryList){
            if (dictionaryList.hasOwnProperty(prop)){
                sorted.push({key: dictionaryList[prop], value: prop});
            }
        }
        sorted.sort(function(a, b){
            var labelA = a.key.toLowerCase(), labelB = b.key.toLowerCase();
            if (labelA < labelB) return -1;
            if (labelA > labelB) return 1;
            return 0;
        });
        return sorted;
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

    this.isUrl = function(s) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
        return regexp.test(s);
    }

    this.getImgSrc = function(uri) {
        return '<img src="' + uri + '"/>' ;
            //+ '" style=width:' + Profile.imageWidth + ';height:' + Profile.imageHeight +
            //';margin-bottom:32px;position:relative;" />'
    }

    this.pushCollImgStr = function(number, array, connectionURI, propertyName, addConnectionBtn) {
        array.push("<p class='conncollapse'><b class='conncollapsetoggle' title='", connectionURI, "'>", propertyName, " (<span class='propNum'>",number,"</span>)</b> ", addConnectionBtn, "</p><ul>");
    }

     this.showLoadScreen = function()
     {
         if (!this.isLoadScreenOpen) {
            this.isLoadScreenOpen = true;
             this.loadScreen.style.display = "inherit";
             this.loadText.style.display = "inherit";
         }
     }

     this.closeLoadScreen = function()
     {
         if (this.isLoadScreenOpen) {
             this.loadScreen.style.display = "none";
             this.loadText.style.display = "none";
             this.isLoadScreenOpen = false;
         }
     }

};
