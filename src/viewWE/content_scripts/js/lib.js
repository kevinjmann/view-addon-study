view.lib = {
  /**
   * A function that is supposed to be a placeholder for a response callback.
   */
  noResponse: function() {
    // This is intentional
  },

  /**
   * Close the dropdown menu if the user clicks outside of it.
   * Remove the instant feedback dialog, if the user clicks outside of it.
   */
  initOnWindowClick: function() {
    $(window).on("click", function(event) {
        view.VIEWmenu.hide();
        view.statisticsMenu.hide();

        const $Dialog = $("#view-performance-dialog").parent();
        if(!$(event.target).closest($Dialog).length){
          view.lib.removeDialog($Dialog);
        }
    });
  },

  /**
   * Create a button element with a given id, class and text.
   *
   * @param {string} id the id of the button
   * @param {string} aClass the class of the button
   * @param {string} text the text of the button
   * @returns {*|jQuery|HTMLElement} the button element
   */
  createButton: function(id, aClass, text) {
    const $Button = $("<button>");
    $Button.attr("id", id);
    $Button.addClass(aClass);
    $Button.text(text);

    return $Button;
  },

  /**
   * Create a list element with a given id and containing
   * an array of items.
   *
   * @param {string} id the id of the list element
   * @param {Array} allItems the list items of the list element
   * @returns {*|jQuery|HTMLElement} the list element with items
   */
  createList: function(id, allItems) {
    const $List = $("<ul>");
    $List.attr("id", id);

    view.lib.addItems(
      $List,
      allItems
    );

    return $List;
  },

  /**
   * Add all items to a given list element.
   *
   * @param {Object} $List the list element the items are added to
   * @param {Array} allItems the items to add
   */
  addItems: function($List, allItems) {
    $.each(allItems, function(index) {
      $List.append($("<li>").text(allItems[index]));
    });
  },

  /**
   * Define a setup for the given dialog element.
   *
   * @param {boolean} isModal if the dialog should be modal or not
   * @param {object} $Dialog the dialog element
   * @param {string} title the title of the dialog
   * @param {*} height the height of the dialog
   * @param {object} position the position at which the dialog will appear
   * @param {object} buttons the buttons inside the dialog
   */
  dialogSetup: function(isModal, $Dialog, title, height, position, buttons) {
    $Dialog.dialog({
      modal: isModal,
      title: title,
      overlay: {opacity: 0.1, background: "black"},
      width: "auto",
      height: height,
      position: position,
      draggable: true,
      resizable: true,
      buttons: buttons
    });
  },

  /**
   * Remove the given dialog.
   *
   * @param {Object} $Dialog the dialog to be removed
   */
  removeDialog: function($Dialog) {
    $Dialog.remove();
  },

  /**
   * Init the given dialog element with a dialogclose event.
   * Will remove the given dialog element on dialogclose.
   *
   * @param $Dialog the dialog element
   */
  initDialogClose: function($Dialog) {
    $Dialog.on("dialogclose", function(){
      view.lib.removeDialog($Dialog);
    });
  },

  /**
   * Disable all anchors, so that links can't be followed.
   */
  disableAnchors: function() {
    $("a").each(function() {
      $(this).data("href", $(this).attr("href"));
      $(this).removeAttr("href");
    });
  },

  /**
   * Enable all anchors, so that links can be followed again.
   */
  enableAnchors: function() {
    $("a").each(function() {
      $(this).attr("href", $(this).data("href"));
    });
  },

  /**
   * Fisher-Yates shuffle, rearrange an array.
   *
   * @param {Array} elemList the array to rearrange
   */
  shuffleList: function(elemList) {
    let i, j, tempElem;
    for (i = elemList.length; i > 1; i--) {
      j = parseInt(Math.random() * i);
      tempElem = elemList[j];
      elemList[j] = elemList[i - 1];
      elemList[i - 1] = tempElem;
    }
  },

  /**
   * Detect capitalization pattern in target word.
   *
   * 0 = not capitalized or weird enough to leave alone
   * 1 = all caps
   * 2 = first letter capitalized
   *
   * @param {String} word the target for detecting capitalization
   * @return {number} the capitalization type
   */
  detectCapitalization: function(word) {
    if (word === word.toUpperCase()) {
      return 1;
    }
    else if (word === word.substr(0, 1).toUpperCase() + word.substr(1)) {
      return 2;
    }
    else{
      return 0;
    }
  },

  /**
   * Parallel capitalization (for multiple choice drop-downs).
   *
   * @param {string} word the target to be matched with the cap type
   * @param {number} type the capitalization type
   */
  matchCapitalization: function(word, type) {
    switch (type) {
      case 0:
        return word;
      case 1:
        return word.toUpperCase();
      case 2:
        return word.slice(0, 1).toUpperCase() + word.slice(1);
      default:
        return word;
    }
  }
};