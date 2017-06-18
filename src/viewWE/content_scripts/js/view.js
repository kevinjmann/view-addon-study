const view = {
  url: document.baseURI,
  title: document.title,

  /**
   * Set all items from storage.
   * Afterwards add the toolbar.
   */
  setStorageItemsAndAddToolbar: function() {
    chrome.storage.local.get(function(storageItems) {
      view.setItems(storageItems);

      view.toolbar.add();
    });
  },

  /**
   * Set all given items to view.
   *
   * @param {object} items the items to set
   */
  setItems: function(items) {
    const allItems = Object.keys(items);

    for (const item of allItems) {
      view[item] = items[item];
    }
  },

  /**
   * Set all changes from the storage to view.
   *
   * @param {object} changes the changes made to the storage
   */
  setStorageChange: function(changes) {
    const changedItems = Object.keys(changes);

    for (const item of changedItems) {
      view[item] = changes[item].newValue;
    }
  }
};

module.exports = view;
