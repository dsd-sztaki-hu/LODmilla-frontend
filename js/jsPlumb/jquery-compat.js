/* Remove jsPlumb 1.6's dependency on deprecated jQuery collection internals. */
(function($) {
    "use strict";

    if (typeof jsPlumbInstance === "undefined") {
        return;
    }

    jsPlumbInstance.prototype.getDOMElement = function(element) {
        if (element == null) {
            return null;
        }
        if (typeof element === "string") {
            return document.getElementById(element);
        }
        return element.nodeType ? element : element[0];
    };

    jsPlumbInstance.prototype.trigger = function(element, eventName, originalEvent) {
        var target = this.getElementObject(element);
        target.triggerHandler(originalEvent || eventName);
    };
})(jQuery);
