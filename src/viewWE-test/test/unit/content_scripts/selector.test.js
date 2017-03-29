/**
 * Tests for the selector.js file of the VIEW add-on.
 *
 * Created by eduard on 29.03.17.
 */

"use strict";

describe("selector.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    fixture.load("/fixtures/ru-nouns-mc-and-cloze.html");
  });

  afterEach(function() {
    sandbox.restore();
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

      expect($("viewenhancement").length).to.be.above(0);
      expect($("[data-filters~='Pl']").length).to.be.above(0);
    });
  });

  describe("select", function() {
    it("should have class 'selected' for all enhancements as the filter is 'all'", function() {
      view.selector.select("all");

      expect($("viewenhancement").hasClass("selected")).to.be.true;
    });

    it("should have class 'selected' for all enhancements as the filter is 'no-filter'", function() {
      view.selector.select("no-filter");

      expect($("viewenhancement").hasClass("selected")).to.be.true;
    });

    it("should have class 'selected' for all enhancements having the 'data-filter' attribute with the value 'Pl'", function() {
      view.selector.select("Pl");

      expect($("[data-filters~='Pl']").hasClass("selected")).to.be.true;
    });
  });
});
