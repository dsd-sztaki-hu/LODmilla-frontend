/* Image-only lightbox for dynamically created .fancybox links. */
var LodmillaLightbox = (function($) {
    "use strict";

    var initialized = false;
    var canOpen = function() { return true; };

    function close() {
        $("#lodmilla-lightbox").remove();
        $(document).off("keydown.lodmillaLightbox");
    }

    function open(url, title) {
        close();
        var overlay = $('<div id="lodmilla-lightbox" role="dialog" aria-modal="true"></div>');
        var closeButton = $('<button type="button" class="lodmilla-lightbox-close" aria-label="Close">&times;</button>');
        var image = $('<img class="lodmilla-lightbox-image" alt="">').attr("src", url);
        if (title) {
            image.attr("alt", title);
        }
        overlay.append(closeButton, image).appendTo("body");
        closeButton.trigger("focus");
        overlay.on("click", function(event) {
            if (event.target === overlay[0] || $(event.target).hasClass("lodmilla-lightbox-close")) {
                close();
            }
        });
        $(document).on("keydown.lodmillaLightbox", function(event) {
            if (event.key === "Escape" || event.keyCode === 27) {
                close();
            }
        });
    }

    return {
        init: function(options) {
            canOpen = options && options.canOpen ? options.canOpen : canOpen;
            if (initialized) {
                return;
            }
            initialized = true;
            $(document).on("click.lodmillaLightbox", "a.fancybox", function(event) {
                if (!canOpen()) {
                    return;
                }
                event.preventDefault();
                open(this.href, this.title || $(this).find("img").attr("alt") || "");
            });
        },
        close: close
    };
})(jQuery);
