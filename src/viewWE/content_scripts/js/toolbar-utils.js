view.toolbarUtils = {
  toolbar: undefined,

  /**
   * Create the toolbar ui toolbar and inject it in the current page.
   *
   * @returns the toolbar containing the toolbar
   */
  init: function() {
    const toolbarHTML = chrome.runtime.getURL("toolbar/toolbar.html");

    const $iframe = $("<iframe>");
    $iframe.attr("id", "view-toolbar-iframe");
    $iframe.attr("src", toolbarHTML);

    const $Body = $("body");

    view.toolbarUtils.addContainer($Body);

    view.VIEWmenu.add();

    $Body.prepend($iframe);

    return view.toolbarUtils.toolbar = $iframe;
  },

  /**
   * Add a container that wraps all children inside the parent element
   * given the selector of the parent.
   *
   * @param {Object} $Element the parent element
   */
  addContainer: function($Element) {
    const $Container = $("<div id='wertiview-container'>");

    let $Content = $("<div id='wertiview-content'>");

    $Element.children().wrapAll($Content);

    $Content = $("#wertiview-content");

    $Container.append($Content);

    $Container.addClass("down");

    $Element.append($Container);
  },

  /**
   * Toggle the toolbar directly if it already exists,
   * initialize it otherwise.
   * Hide the view menu in case it is still open.
   */
  toggle: function() {
    const toolbar = view.toolbarUtils.toolbar;
    if (toolbar) {
      toolbar.toggle();
      view.toolbarUtils.moveContainer();
    } else {
      view.setGeneralOptions();
      view.toolbarUtils.init();
    }
  },

  /**
   * Move the container down when the toolbar is visible,
   * but move it back and hide the VIEW menu otherwise.
   */
  moveContainer: function() {
    const $Container = $("#wertiview-container");

    if (view.toolbarUtils.toolbar.is(":visible")) {
      $Container.addClass("down");
    }
    else {
      view.VIEWmenu.hide();
      $Container.removeClass("down");
    }
  }
};