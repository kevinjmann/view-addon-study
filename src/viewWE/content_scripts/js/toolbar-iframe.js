view.toolbarIframe = {
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

    view.container.add($Body);

    view.VIEWmenu.add();

    view.statisticsMenu.add();

    view.lib.initOnWindowClick();

    $Body.prepend($iframe);
  },

  /**
   * Toggle the toolbar directly if it already exists,
   * initialize it otherwise.
   * Hide the view menu in case it is still open.
   */
  toggle: function() {
    const toolbar = $("#view-toolbar-iframe");
    if (toolbar.length) {
      toolbar.toggle();
      view.container.move();
    } else {
      view.setGeneralOptions();
      view.toolbarIframe.init();
    }
  }
};