const $ = require('jquery');

module.exports = {
  /*
   * Blur the page with an overlay and  a loading
   * image on top.
   */
  add: function() {
    if ($("wertiview-blur").length == 0) {
      const $overlay = $("<div>");
      $overlay.attr("id", "wertiview-blur");

      $("body").append($overlay);

      const $LoadingDiv = $("<div>");
      $LoadingDiv.attr("id", "wertiview-blur-loading");

      $("body").append($LoadingDiv);
      $LoadingDiv.css({
        "top": $overlay.height() / 2 - 100,
        "left": $overlay.width() / 2 - 100
      });
      $LoadingDiv.show();
    }
  },


  /*
   * Remove the overlay and loading image that is blurring the page.
   */
  remove: function() {
    $("#wertiview-blur-loading").remove();
    $("#wertiview-blur").remove();
  }
};
