/**
 * Tests for the lib.js file of the VIEW add-on.
 *
 * Created by eduard on 10.04.17.
 */

"use strict";

describe("lib.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
    $("#view-dialog").remove();
    $("#view-performance-dialog").remove();
    $(window).off("click");
    $("a").remove();
  });

  describe("noResponse", function() {
    it("should return nothing", function() {
      const noResponseSpy = sandbox.spy(view.lib, "noResponse");

      view.lib.noResponse();

      expect(noResponseSpy.firstCall.returnValue).to.be.undefined;
    });
  });

  describe("initOnWindowClick", function() {
    it("should initialize hide menu handler", function() {
      const selectorSpy = sandbox.spy($.fn, "init");
      const eventSpy = sandbox.spy($.fn, "on");

      view.lib.initOnWindowClick();

      sinon.assert.calledOnce(selectorSpy);
      sinon.assert.calledWith(selectorSpy, window);

      sinon.assert.calledOnce(eventSpy);
      sinon.assert.calledWith(eventSpy, "click");
    });

    it("should call VIEWmenu.hide() on click", function() {
      const hideSpy = sandbox.spy(view.VIEWmenu, "hide");

      view.lib.initOnWindowClick();

      $(window).trigger("click");

      sinon.assert.calledOnce(hideSpy);
    });

    it("should call statisticsMenu.hide() on click", function() {
      const hideSpy = sandbox.spy(view.statisticsMenu, "hide");

      view.lib.initOnWindowClick();

      $(window).trigger("click");

      sinon.assert.calledOnce(hideSpy);
    });

    it("should call lib.removeDialog($Dialog) on click, as the dialog was not clicked", function() {
      const removeDialogSpy = sandbox.spy(view.lib, "removeDialog");

      view.lib.initOnWindowClick();

      const $Dialog = $("<div id='view-performance-dialog'>");
      const $Body = $("body");

      $Dialog.wrap($("<div>"));

      $Body.append($Dialog.parent());

      $Body.trigger("click");

      sinon.assert.calledOnce(removeDialogSpy);
    });

    it("should not call lib.removeDialog($Dialog) on click, as the dialog was clicked", function() {
      const removeDialogSpy = sandbox.spy(view.lib, "removeDialog");

      view.lib.initOnWindowClick();

      const $Dialog = $("<div id='view-performance-dialog'>");

      $("body").append($Dialog);

      $Dialog.trigger("click");

      sinon.assert.notCalled(removeDialogSpy);
    });
  });

  describe("createButton", function() {
    it("should return a button element with the expected values", function() {
      const createButtonSpy = sandbox.spy(view.lib, "createButton");

      const id = "id";
      const aClass = "class";
      const text = "text";

      const $Button = $("<button>");
      $Button.attr("id", id);
      $Button.addClass(aClass);
      $Button.text(text);

      view.lib.createButton(id, aClass, text);

      expect(createButtonSpy.firstCall.returnValue).to.eql($Button);
    });
  });

  describe("createList", function() {
    it("should return list element with the expected values", function() {
      const createListSpy = sandbox.spy(view.lib, "createList");

      const allItems = [
        "firstItem",
        "secondItem"
      ];
      const id = "id";

      const $List = $("<ul>");
      $List.attr("id", id);

      $.each(allItems, function(index) {
        $List.append($("<li>").text(allItems[index]));
      });

      view.lib.createList(id, allItems);

      expect(createListSpy.firstCall.returnValue).to.eql($List);
    });
  });

  describe("addItems", function() {
    it("should add all items to a given list element", function() {
      const allItems = [
        "firstItem",
        "secondItem"
      ];

      const $List = $("<ul>");

      view.lib.addItems($List, allItems);

      expect($List.find("li:eq(0)").text()).to.equal("firstItem");
      expect($List.find("li:eq(1)").text()).to.equal("secondItem");
    });
  });

  describe("dialogSetup", function() {
    it("should call dialogSetup($Dialog, title, height, position)", function() {
      const dialogSpy = sandbox.spy($.fn, "dialog");

      const $Dialog = $("<div>");
      $Dialog.attr("id", "view-dialog");

      const title = "All Tasks";
      const height = $(window).height() * 0.8;
      const position = {
        my: "left",
        at: "left",
        of: window
      };

      view.lib.dialogSetup($Dialog, title, height, position);

      // the test fails with this property, probably because it has
      // an anonymous function
      delete dialogSpy.firstCall.args[0].buttons;

      sinon.assert.calledOnce(dialogSpy);
      sinon.assert.calledWithExactly(dialogSpy, {
          modal: true,
          title: title,
          overlay: {opacity: 0.1, background: "black"},
          width: "auto",
          height: height,
          position: position,
          draggable: true,
          resizable: true
        }
      );
    });

    it("should call removeDialog($Dialog) when the 'Ok' button was pressed", function() {
      const removeDialogSpy = sandbox.spy(view.lib, "removeDialog");

      const $Dialog = $("<div>");
      $Dialog.attr("id", "view-dialog");

      const title = "All Tasks";
      const height = $(window).height() * 0.8;
      const position = {
        my: "left",
        at: "left",
        of: window
      };

      view.lib.dialogSetup($Dialog, title, height, position);

      // trigger a click on the 'Ok' button
      $Dialog.dialog("option", "buttons").Ok();

      sinon.assert.calledOnce(removeDialogSpy);
      sinon.assert.calledWith(removeDialogSpy, $Dialog);
    });

    it("should remove the dialog", function() {
      const $Dialog = $("<div>");
      $Dialog.attr("id", "view-dialog");

      $("body").append($Dialog);

      expect($("#view-dialog").length).to.be.above(0);

      view.lib.removeDialog($Dialog);

      expect($("#view-dialog").length).to.equal(0);
    });
  });

  describe("initDialogClose", function() {
    it("should init the dialog with a dialogclose handler", function() {
      const eventSpy = sandbox.spy($.fn, "on");

      const $Dialog = $("<div>");
      $Dialog.attr("id", "view-dialog");

      view.lib.initDialogClose($Dialog);

      sinon.assert.calledOnce(eventSpy);
      sinon.assert.calledWith(eventSpy, "dialogclose");
    });

    it("should call removeDialog($Dialog) on dialogclose", function() {
      const removeDialogSpy = sandbox.spy(view.lib, "removeDialog");

      const $Dialog = $("<div>");
      $Dialog.attr("id", "view-dialog");

      view.lib.initDialogClose($Dialog);

      $Dialog.trigger("dialogclose");

      sinon.assert.calledOnce(removeDialogSpy);
      sinon.assert.calledWith(removeDialogSpy, $Dialog);
    });
  });

  describe("disableAnchors", function() {
    it("should store the 'href' attribute of all anchor elements in a data attribute", function() {
      const href1 = "http://www.test.html";
      const href2 = "http://www.test2.html";
      const $Body = $("body");

      $Body.append("<a href='" + href1 + "'>");
      $Body.append("<a href='" + href2 + "'>");

      view.lib.disableAnchors();

      expect($("a:eq(0)").data("href")).to.equal(href1);
      expect($("a:eq(1)").data("href")).to.equal(href2);
    });

    it("should have removed the 'href' attribute from all anchor elements", function() {
      const href1 = "http://www.test.html";
      const href2 = "http://www.test2.html";
      const $Body = $("body");

      $Body.append("<a href='" + href1 + "'>");
      $Body.append("<a href='" + href2 + "'>");
      view.lib.disableAnchors();

      expect($("a[href]").length).to.equal(0);
    });
  });

  describe("enableAnchors", function() {
    it("should recover the 'href' attribute of all anchor elements", function() {
      const href1 = "http://www.test.html";
      const href2 = "http://www.test2.html";
      const $Body = $("body");

      $Body.append("<a href='" + href1 + "'>");
      $Body.append("<a href='" + href2 + "'>");

      view.lib.disableAnchors();

      view.lib.enableAnchors();

      expect($("a:eq(0)").attr("href")).to.equal(href1);
      expect($("a:eq(1)").attr("href")).to.equal(href2);
    });
  });

  describe("shuffleList", function() {
    it("should rearrange an array", function() {
      const allItems = [
        "firstItem",
        "secondItem",
        "thirdItem",
        "fourthItem"
      ];

      // make randomness predictable
      sinon.stub(Math, "random", function(){
        return 0.5;
      });

      view.lib.shuffleList(allItems);

      expect(allItems).to.eql([
        "firstItem",
        "fourthItem",
        "secondItem",
        "thirdItem"
      ]);
    });
  });

  describe("detectCapitalization", function() {
    it("should return 1, as everything is in upper case", function() {
      const detectCapitalizationSpy = sandbox.spy(view.lib, "detectCapitalization");

      view.lib.detectCapitalization("TEST");

      expect(detectCapitalizationSpy.firstCall.returnValue).to.equal(1);
    });

    it("should return 2, as the first letter is in upper case", function() {
      const detectCapitalizationSpy = sandbox.spy(view.lib, "detectCapitalization");

      view.lib.detectCapitalization("Test");

      expect(detectCapitalizationSpy.firstCall.returnValue).to.equal(2);
    });

    it("should return 0, as everything is in lower case", function() {
      const detectCapitalizationSpy = sandbox.spy(view.lib, "detectCapitalization");

      view.lib.detectCapitalization("test");

      expect(detectCapitalizationSpy.firstCall.returnValue).to.equal(0);
    });
  });

  describe("matchCapitalization", function() {
    it("should return the word unchanged, as the captype is 0", function() {
      const matchCapitalizationSpy = sandbox.spy(view.lib, "matchCapitalization");

      const word = "test";

      view.lib.matchCapitalization(word, 0);

      expect(matchCapitalizationSpy.firstCall.returnValue).to.equal(word);
    });

    it("should return the word completely in upper case, as the captype is 1", function() {
      const matchCapitalizationSpy = sandbox.spy(view.lib, "matchCapitalization");

      const word = "test";

      view.lib.matchCapitalization(word, 1);

      expect(matchCapitalizationSpy.firstCall.returnValue).to.equal("TEST");
    });

    it("should return the word with the first letter in upper case, as the captype is 2", function() {
      const matchCapitalizationSpy = sandbox.spy(view.lib, "matchCapitalization");

      const word = "test";

      view.lib.matchCapitalization(word, 2);

      expect(matchCapitalizationSpy.firstCall.returnValue).to.equal("Test");
    });

    it("should return the word unchanged, as the captype is 4 (default case triggered)", function() {
      const matchCapitalizationSpy = sandbox.spy(view.lib, "matchCapitalization");

      const word = "test";

      view.lib.matchCapitalization(word, 4);

      expect(matchCapitalizationSpy.firstCall.returnValue).to.equal(word);
    });
  });
});
