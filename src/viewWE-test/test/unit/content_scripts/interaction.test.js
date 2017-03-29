/**
 * Tests for the interaction.js file of the VIEW add-on.
 *
 * Created by eduard on 29.03.17.
 */

"use strict";

describe("interaction.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    sandbox.stub($.fn, "load").yields();
  });

  afterEach(function() {
    sandbox.restore();
    chrome.extension.getURL.reset();
    view.interaction.toolbarUI = undefined;
    $("#view-toolbar-iframe").remove();
    $("#wertiview-body-container").remove();
    fixture.cleanup();
  });

  describe("jquery selectors", function() {
    it("should be able to find all required jquery selectors for this module", function() {
      // some selectors only need the element, its enough if they exist
      // some selectors need the val(), text() or attr("link"),
      // if there is the value we expect, they exist as well
      // maintain this test, if there are additions or changes
      // the expectations below don't need to be tested in other tests again
      // the selectors below can be freely used in the tests without problems

      view.interaction.initToolbar();

      expect($("#view-toolbar-iframe").length).to.be.above(0);
    });
  });

  describe("initToolbar", function() {
    it("should get the correct url", function() {
      view.interaction.initToolbar();

      sinon.assert.called(chrome.runtime.getURL);
      sinon.assert.calledWithExactly(chrome.runtime.getURL, "toolbar/toolbar.html");
    });

    it("should assign the correct id", function() {
      const attrSpy = sandbox.spy($.fn, "attr");

      view.interaction.initToolbar();

      sinon.assert.called(attrSpy);
      sinon.assert.calledWithExactly(attrSpy.getCall(0),
        "id",
        "view-toolbar-iframe"
      );
    });

    it("should assign a src", function() {
      const attrSpy = sandbox.spy($.fn, "attr");

      view.interaction.initToolbar();

      sinon.assert.called(attrSpy);
      sinon.assert.calledWith(attrSpy.getCall(1), "src");
    });

    it("should call addChildContainer(selector)", function() {
      const addChildContainerSpy = sandbox.spy(view.interaction, "addChildContainer");

      view.interaction.initToolbar();

      sinon.assert.calledOnce(addChildContainerSpy);
    });

    describe("addChildContainer", function() {
      it("should wrap all body content of 'ru-no-markup.html' into a new element", function() {
        const htmlFixture = fixture.load("/fixtures/ru-no-markup.html");
        const fixtureContent = htmlFixture[2];
        const fixtureContentInnerHTML = fixtureContent.innerHTML;

        $("body").append(fixtureContent);

        const fixtureBody = $("#ru-no-markup-body");

        view.interaction.addChildContainer(fixtureBody);

        expect($("#wertiview-body-content").html())
        .to.equal(fixtureContentInnerHTML);

        fixtureBody.remove();
      });

      it("should put wrapped body content into the container", function() {
        const htmlFixture = fixture.load("/fixtures/ru-no-markup.html");
        const fixtureContent = htmlFixture[2];
        const fixtureContentInnerHTML = fixtureContent.innerHTML;

        $("body").append(fixtureContent);

        const fixtureBody = $("#ru-no-markup-body");

        view.interaction.addChildContainer(fixtureBody);

        const bodyContainerSelector = "#wertiview-body-container";

        expect($(bodyContainerSelector).html())
        .to.equal("<div id=\"wertiview-body-content\">" + fixtureContentInnerHTML + "</div>");

        fixtureBody.remove();
      });

      it("should have the class 'down' in the container", function() {
        const htmlFixture = fixture.load("/fixtures/ru-no-markup.html");
        const fixtureContent = htmlFixture[2];

        $("body").append(fixtureContent);

        const fixtureBody = $("#ru-no-markup-body");

        view.interaction.addChildContainer(fixtureBody);

        expect($("#wertiview-body-container").hasClass("down")).to.be.true;

        fixtureBody.remove();
      });
    });

    it("should call VIEWmenu.add()", function() {
      const addSpy = sandbox.spy(view.VIEWmenu, "add");

      view.interaction.initToolbar();

      sinon.assert.calledOnce(addSpy);
    });

    it("should call prepend(iframe)", function() {
      const prependSpy = sandbox.spy($.fn, "prepend");

      view.interaction.initToolbar();

      sinon.assert.called(prependSpy);
      expect($(prependSpy.getCall(1).args[0]).attr("id")).to.equal("view-toolbar-iframe");
    });

    it("should return the iframe", function() {
      view.interaction.initToolbar();
      expect($(view.interaction.toolbarUI).attr("id")).to.equal("view-toolbar-iframe");
    });
  })
});
