/**
 * Tests for the container.js file of the VIEW add-on.
 *
 * Created by eduard on 29.03.17.
 */

"use strict";

import $ from 'jquery';
import chrome from 'sinon-chrome';
import view from '../../../../viewWE/content_scripts/js/view.js';

describe("container.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    fixture.load("/viewWE-test/fixtures/ru-no-markup.html");
  });

  afterEach(function() {
    sandbox.restore();
    chrome.runtime.getURL.reset();
    $("#wertiview-container").remove();
    $("body").append($("#ru-no-markup-body"));
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
      view.container.add($("#ru-no-markup-body"));

      expect($("#wertiview-container").length).to.be.above(0);
      expect($("#wertiview-content").length).to.be.above(0);
      expect($("#ru-no-markup-body").length).to.be.above(0);
    });
  });

  describe("add", function() {
    it("should call clone(true)", function() {
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
      const fixtureInnerHTML = $("#ru-no-markup-body").html();
      const $FixtureBody = $("<div>");

      $FixtureBody.html(fixtureInnerHTML);

      $("body").append($FixtureBody);

      view.container.add($FixtureBody);

      expect($("#wertiview-content").html()).to.equal(fixtureInnerHTML);

      $FixtureBody.remove();
    });

    it("should put wrapped body content into the container", function() {
      const fixtureInnerHTML = $("#ru-no-markup-body").html();
      const $FixtureBody = $("<div>");

      $FixtureBody.html(fixtureInnerHTML);

      $("body").append($FixtureBody);

      view.container.add($FixtureBody);

      expect($("#wertiview-container").html())
      .to.equal("<div id=\"wertiview-content\">" + fixtureInnerHTML + "</div>");

      $FixtureBody.remove();
    });
  });

  describe("adjustMargin", function() {
    it("should add the class 'margin-at-bottom', as the class isn't present", function() {
      const $Container = $("<div>");
      $Container.attr("id", "wertiview-container");

      $("body").append($Container);

      view.container.adjustMargin();

      expect($Container.hasClass("margin-at-bottom")).to.be.true;
    });

    it("should call restoreToOriginal(), because the class 'margin-at-bottom'" +
      " is present", function() {
      const restoreToOriginalSpy = sandbox.spy(view.enhancer, "restoreToOriginal");

      const $Container = $("<div>");
      $Container.attr("id", "wertiview-container");
      $Container.addClass("margin-at-bottom");

      $("body").append($Container);

      view.container.adjustMargin();

      sinon.assert.calledOnce(restoreToOriginalSpy);
    });

    it("should remove the class 'margin-at-bottom', because it is present", function() {
      const marginClass = "margin-at-bottom";

      const $Container = $("<div>");
      $Container.attr("id", "wertiview-container");
      $Container.addClass(marginClass);

      $("body").append($Container);

      view.container.adjustMargin();

      expect($Container.hasClass(marginClass)).to.be.false;
    });
  });
});
