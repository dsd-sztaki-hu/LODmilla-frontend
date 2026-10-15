/*
 * Compatibility wrapper for LODmilla's historical $.jsonp calls.
 * Uses jQuery's supported JSONP transport instead of jquery-jsonp 2.4.0.
 */
(function($) {
    "use strict";

    $.jsonp = function(options) {
        options = $.extend({}, options);

        var complete = options.complete;
        var ajaxOptions = {
            url: options.url,
            data: options.data,
            dataType: "jsonp",
            jsonp: options.callbackParameter || "callback",
            jsonpCallback: options.callback,
            cache: options.cache,
            timeout: options.timeout,
            traditional: options.traditional,
            context: options.context,
            beforeSend: options.beforeSend
        };

        return $.ajax(ajaxOptions)
            .done(function(data, textStatus, jqXHR) {
                if (options.success) {
                    options.success.call(options.context || options, data, textStatus, jqXHR);
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                if (options.error) {
                    options.error.call(options.context || options, jqXHR, textStatus, errorThrown);
                }
            })
            .always(function(first, textStatus, third) {
                if (complete) {
                    var jqXHR = first && first.readyState !== undefined ? first : third;
                    complete.call(options.context || options, jqXHR, textStatus);
                }
            });
    };
})(jQuery);
