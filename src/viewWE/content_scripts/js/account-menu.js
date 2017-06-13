view.accountMenu = {
  selectorStart : "#view-account-menu-",

  add: function() {
    const accountHTML = chrome.extension.getURL("content_scripts/html/account-menu.html");

    const $Account = $("<div>");

    $Account.load(accountHTML, view.accountMenu.init);

    $("body").append($Account);
  },

  /**
   * Init the handlers for the view menu.
   */
  init: function() {
    view.accountMenu.initStatisticsMenuHandler();

    view.accountMenu.initSignOutHandler();

    view.accountMenu.setAccountInfo();
  },

  /**
   * Toggle the statistics menu on click.
   */
  initStatisticsMenuHandler: function() {
    $(view.accountMenu.selectorStart + "statistics").on("click",
      view.statisticsMenu.toggle
    );
  },

  /**
   * Init the handler for the sign out.
   * Call openSignOutWindow() on click.
   */
  initSignOutHandler: function() {
    $(view.accountMenu.selectorStart + "sign-out").on("click",
      view.accountMenu.openSignOutWindow
    );
  },

  /**
   * Open the authenticator sign out window.
   */
  openSignOutWindow: function() {
    const signOutWindow = window.open("", "", "width=1,height=1");
    chrome.storage.local.get("authenticator", function(storageItems) {
      view.accountMenu.assignHref(
        signOutWindow,
        storageItems.authenticator + "?action=sign-out"
      );
    });
  },

  /**
   * Assign the authenticator to the href attribute of the given window.
   *
   * @param {object} myWindow the window we assign the href attribute of
   * @param {string} authenticatorLink the value to be assigned
   */
  assignHref: function(myWindow, authenticatorLink) {
    myWindow.location.href = authenticatorLink;
  },

  /**
   * Set the text of user and e-mail.
   */
  setAccountInfo: function() {
    $(view.accountMenu.selectorStart + "user").text(view.user);
    $(view.accountMenu.selectorStart + "e-mail").text(view.userEmail);
  },

  /**
   * Hide the accountMenu content.
   */
  hide: function() {
    $(view.accountMenu.selectorStart + "content").hide();
  },

  /**
   * Toggle the accountMenu content.
   */
  toggle: function() {
    $(view.accountMenu.selectorStart + "content").toggle();
  },

  /**
   * The extension send the message to sign in the user.
   *
   * @param {*} request the message sent by the calling script
   */
  signIn: function(request) {
    view.userEmail = request.userEmail;
    view.userid = request.userid;
    view.user = request.user;
    view.token = request.token;

    view.accountMenu.setAccountInfo();
  },

  /**
   * The extension send the message to sign out the user.
   */
  signOut: function() {
    view.userEmail = "";
    view.userid = "";
    view.user = "";
    view.token = "";
    view.taskId = "";

    view.accountMenu.setAccountInfo();
  }
};