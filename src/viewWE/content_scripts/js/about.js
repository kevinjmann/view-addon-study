view.about = {
  /**
   * The extension send the message to open the about dialog.
   * Create it with "about.html" and insert the image "view-128.png".
   * Show the about dialog over the background page.
   */
  open: function() {
    if (!$("#view-about").length) {
      // get the url of the about page
      const aboutDialog = chrome.extension.getURL("content_scripts/html/about.html");

      // get the url of the view icon
      const viewLogo = chrome.extension.getURL("icons/view-128.png");

      // create image element with the view icon
      const $viewImg = $("<img>");
      $viewImg.attr("src", viewLogo);

      // get the website's dimensions
      const wHeight = $(window).height();
      const dHeight = wHeight * 0.8;

      // create and open the about dialog
      const $aboutDialog = $("<div>");

      // load the about page and append the view icon
      $aboutDialog.load(aboutDialog, function() {
        // attach the view icon to the span element
        $("#view-icon").append($viewImg);
      });

      // create the about dialog
      $aboutDialog.dialog({
        modal: true,
        title: "About VIEW",
        overlay: {opacity: 0.1, background: "black"},
        width: "auto",
        height: dHeight,
        draggable: true,
        resizable: true
      });

      $aboutDialog.on("dialogclose", function() {
        console.log("click on X: close about dialog");
        // remove the about dialog so that it can be loaded properly next time
        $aboutDialog.remove();
      });
    }
  }
};