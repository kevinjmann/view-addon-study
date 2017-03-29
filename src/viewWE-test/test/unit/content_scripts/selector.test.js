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

      expect($("viewenhancement[data-filters~='Pl']").hasClass("selected")).to.be.true;
    });
  })
});
