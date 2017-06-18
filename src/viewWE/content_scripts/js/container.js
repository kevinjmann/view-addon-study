const $ = require('jquery');

module.exports = function(view) {
  return {
    /**
     * Add a container that wraps all children inside the parent element
     * given the selector of the parent.
     *
     * @param {Object} $Element the parent element
     */
    add: function($Element) {
      const $Container = $("<div id='wertiview-container'>");

      let $Content = $("<div id='wertiview-content'>");

      const $OriginalContent = $Element.children();

      view.originalContent = $OriginalContent.clone(true);

      $OriginalContent.wrapAll($Content);

      $Content = $("#wertiview-content");

      $Container.append($Content);

      $Element.append($Container);
    },

    /**
     * Make some margin at the bottom so that there is place
     * for the toolbar and the page content can be fully seen.
     * Remove the margin at the bottom when the toolbar is closed.
     */
    adjustMargin: function() {
      const $Container = $("#wertiview-container");
      const marginClass = "margin-at-bottom";

      if ($Container.hasClass(marginClass)) {
        view.enhancer.restoreToOriginal();
        $Container.removeClass(marginClass);
      }
      else {
        $Container.addClass(marginClass);
      }
    }
  };
};
