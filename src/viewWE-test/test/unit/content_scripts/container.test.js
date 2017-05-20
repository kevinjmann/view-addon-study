/**
 * Tests for the container.js file of the VIEW add-on.
 *
 * Created by eduard on 29.03.17.
 */

"use strict";

describe("container.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    sandbox.stub($.fn, "load").yields();
  });

  afterEach(function() {
    sandbox.restore();
    chrome.extension.getURL.reset();
    $("#view-toolbar-iframe").remove();
    $("body").append($("#ru-no-markup-body"));
    $("#wertiview-container").remove();
    view.originalContent = "";
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
      fixture.load("/fixtures/ru-no-markup.html");

      view.toolbarIframe.init();

      expect($("#view-toolbar-iframe").length).to.be.above(0);
      expect($("#wertiview-container").length).to.be.above(0);
      expect($("#wertiview-content").length).to.be.above(0);
      expect($("#ru-no-markup-body").length).to.be.above(0);
    });
  });

  describe("add", function() {
    it("should call clone(true)", function() {
      fixture.load("/fixtures/ru-no-markup.html");

      const cloneSpy = sandbox.spy($.fn, "clone");
      const fixtureInnerHTML = $("#ru-no-markup-body").html();
      const $FixtureBody = $("<div>");

      $FixtureBody.html(fixtureInnerHTML);

      $("body").append($FixtureBody);

      view.container.add($FixtureBody);

      sinon.assert.calledTwice(cloneSpy);
      sinon.assert.calledWithExactly(cloneSpy, true);
    });

    it("should store the body content into view.originalContent", function() {
      fixture.load("/fixtures/ru-no-markup.html");

      const fixtureInnerHTML = $("#ru-no-markup-body").html();
      const $FixtureBody = $("<div>");

      $FixtureBody.html(fixtureInnerHTML);

      $("body").append($FixtureBody);

      view.container.add($FixtureBody);

      const $ContentChildren = $("#wertiview-content").children();

      expect($ContentChildren.length).to.equal(3);
      expect($ContentChildren.get(0).outerHTML)
      .to.equal(view.originalContent.get(0).outerHTML);
      expect($ContentChildren.get(1).outerHTML)
      .to.equal(view.originalContent.get(1).outerHTML);
      expect($ContentChildren.get(2).outerHTML)
      .to.equal(view.originalContent.get(2).outerHTML);

      $FixtureBody.remove();
    });

    it("should wrap all body content of 'ru-no-markup.html' into a new element", function() {
      fixture.load("/fixtures/ru-no-markup.html");

      const fixtureInnerHTML = $("#ru-no-markup-body").html();
      const $FixtureBody = $("<div>");

      $FixtureBody.html(fixtureInnerHTML);

      $("body").append($FixtureBody);

      view.container.add($FixtureBody);

      expect($("#wertiview-content").html()).to.equal(fixtureInnerHTML);

      $FixtureBody.remove();
    });

    it("should put wrapped body content into the container", function() {
      fixture.load("/fixtures/ru-no-markup.html");

      const fixtureInnerHTML = $("#ru-no-markup-body").html();
      const $FixtureBody = $("<div>");

      $FixtureBody.html(fixtureInnerHTML);

      $("body").append($FixtureBody);

      view.container.add($FixtureBody);

      const bodyContainerSelector = "#wertiview-container";

      expect($(bodyContainerSelector).html())
      .to.equal("<div id=\"wertiview-content\">" + fixtureInnerHTML + "</div>");

      $FixtureBody.remove();
    });

    it("should have the class 'margin-at-bottom' in the container", function() {
      fixture.load("/fixtures/ru-no-markup.html");

      const fixtureInnerHTML = $("#ru-no-markup-body").html();
      const $FixtureBody = $("<div>");

      $FixtureBody.html(fixtureInnerHTML);

      $("body").append($FixtureBody);

      view.container.add($FixtureBody);

      expect($("#wertiview-container").hasClass("margin-at-bottom")).to.be.true;

      $FixtureBody.remove();
    });
  });

  describe("adjustMargin", function() {
    it("should find the class 'margin-at-bottom' inside the container, as the toolbar is visible", function() {
      view.toolbarIframe.init();

      $("#wertiview-container").removeClass("margin-at-bottom");

      view.container.adjustMargin();

      expect($("#wertiview-container").hasClass("margin-at-bottom")).to.be.true;
    });

    it("should call restoreToOriginal()", function() {
      const restoreToOriginalSpy = sandbox.spy(view.enhancer, "restoreToOriginal");

      view.container.adjustMargin();

      sinon.assert.calledOnce(restoreToOriginalSpy);
    });

    it("should not find the class 'margin-at-bottom' inside the container, as the toolbar is hidden", function() {
      view.toolbarIframe.init();

      $("#view-toolbar-iframe").hide();

      expect($("#wertiview-container").hasClass("margin-at-bottom")).to.be.true;

      view.container.adjustMargin();

      expect($("#wertiview-container").hasClass("margin-at-bottom")).to.be.false;
    });
  });
});
