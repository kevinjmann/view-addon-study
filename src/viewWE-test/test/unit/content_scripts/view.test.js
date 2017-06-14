/**
 * Tests for the view.js file of the VIEW add-on.
 *
 * Created by eduard on 11.01.17.
 */

"use strict";

describe("view.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sandbox.stub($.fn, "load").yields();
  });

  afterEach(function() {
    sandbox.restore();
    chrome.runtime.sendMessage.reset();
    chrome.storage.local.get.reset();
    chrome.storage.local.set.reset();
    view.item1 = "";
    view.item2 = "";

    $("#view-toolbar-iframe").remove();
  });

  describe("setStorageItemsAndInitToolbar", function() {
    it("should call setItems(storageItems)", function() {
      const setItemsSpy = sandbox.spy(view, "setItems");

      const storageItems = {};

      chrome.storage.local.get.yields(storageItems);

      view.setStorageItemsAndInitToolbar();

      sinon.assert.calledOnce(setItemsSpy);
      sinon.assert.calledWithExactly(setItemsSpy, storageItems);
    });

    it("should set the given items to view", function() {
      const item1 = "item1";
      const item2 = "item1";
      const storageItems = {item1, item2};

      view.setItems(storageItems);

      expect(view.item1).to.equal(item1);
      expect(view.item2).to.equal(item2);
    });

    it("should call view.toolbarIframe.init()", function() {
      const toolbarIframeInitSpy = sandbox.spy(view.toolbarIframe, "init");

      chrome.storage.local.get.yields({});

      view.setStorageItemsAndInitToolbar();

      sinon.assert.calledOnce(toolbarIframeInitSpy);
    });
  });

  describe("setStorageChange", function() {
    it("should register one listener for chrome.storage.onChanged", function() {
      sinon.assert.calledOnce(chrome.storage.onChanged.addListener);
    });

    it("should set the given changes to view on change", function() {
      const item1 = {
        oldValue: "old1",
        newValue: "new1"
      };
      const item2 = {
        oldValue: "old2",
        newValue: "new2"
      };
      const changes = {item1, item2};

      chrome.storage.onChanged.trigger(changes);

      expect(view.item1).to.equal(item1.newValue);
      expect(view.item2).to.equal(item2.newValue);
    });
  });
});
