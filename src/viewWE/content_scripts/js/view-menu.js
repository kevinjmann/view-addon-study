view.VIEWmenu = {
  selectorStart : "#view-VIEW-menu-",

  add: function() {
    const viewMenuHTML = chrome.extension.getURL("content_scripts/html/view-menu.html");

    const $ViewMenu = $("<div>");

    $ViewMenu.load(viewMenuHTML, view.VIEWmenu.init);

    $("body").prepend($ViewMenu);
  },

  /**
   * Init the handlers for the view menu.
   */
  init: function() {
    view.VIEWmenu.initOpenOptionsPageHandler();

    view.VIEWmenu.initOpenHelpPageHandler();

    view.VIEWmenu.initOpenAboutDialogHandler();
  },

  /**
   * Hide the view menu.
   */
  hide: function() {
    $(view.VIEWmenu.selectorStart + "content").hide();
  },

  /**
   * Open the option page when in the toolbar "options" was clicked.
   */
  initOpenOptionsPageHandler: function() {
    $(view.VIEWmenu.selectorStart + "options").on("click",
      view.VIEWmenu.requestToCallOpenOptionsPage);
  },

  /**
   * Send a request to the background script to call openOptionsPage().
   */
  requestToCallOpenOptionsPage: function() {
    chrome.runtime.sendMessage({msg: "call openOptionsPage"});
  },

  /**
   * Open the help page when in the toolbar "help" was clicked.
   */
  initOpenHelpPageHandler: function() {
    $(view.VIEWmenu.selectorStart + "help").on("click",
      view.VIEWmenu.requestToOpenHelpPage);
  },

  /**
   * Send a request to the background script to open the help page.
   */
  requestToOpenHelpPage: function() {
    chrome.runtime.sendMessage({msg: "open help page"});
  },

  /**
   * On clicking "about", open the about dialog.
   */
  initOpenAboutDialogHandler: function() {
    $(view.VIEWmenu.selectorStart + "about").on("click",
      view.about.open);
  },

  /**
   * Toggle the VIEW menu.
   */
  toggle: function() {
    $(view.VIEWmenu.selectorStart + "content").toggle();
  }
};