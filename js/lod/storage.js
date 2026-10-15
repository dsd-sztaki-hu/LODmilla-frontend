/* Small, failure-tolerant storage used by the node inspector. */
var LodmillaStorage = (function() {
    "use strict";

    var prefix = "lodmilla.";
    var memory = {};

    return {
        get: function(key, fallback) {
            try {
                var value = window.localStorage.getItem(prefix + key);
                return value === null ? fallback : value;
            } catch (error) {
                return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : fallback;
            }
        },
        set: function(key, value) {
            memory[key] = String(value);
            try {
                window.localStorage.setItem(prefix + key, String(value));
            } catch (error) {}
        },
        remove: function(key) {
            delete memory[key];
            try {
                window.localStorage.removeItem(prefix + key);
            } catch (error) {}
        }
    };
})();
