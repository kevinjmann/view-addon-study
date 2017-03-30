view.container = {
  /**
   * Add a container that wraps all children inside the parent element
   * given the selector of the parent.
   *
   * @param {Object} $Element the parent element
   */
  add: function($Element) {
    const $Container = $("<div id='wertiview-container'>");

    let $Content = $("<div id='wertiview-content'>");

    $Element.children().wrapAll($Content);

    $Content = $("#wertiview-content");

    $Container.append($Content);

    $Container.addClass("down");

    $Element.append($Container);
  },

  /**
   * Move the container down when the toolbar is visible,
   * but move it back and hide the VIEW menu otherwise.
   */
  move: function() {
    const $Container = $("#wertiview-container");

    if ($("#view-toolbar-iframe").is(":visible")) {
      $Container.addClass("down");
    }
    else {
      view.VIEWmenu.hide();
      $Container.removeClass("down");
    }
  }
};