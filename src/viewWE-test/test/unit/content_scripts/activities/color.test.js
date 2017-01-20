/**
 * Tests for the options.js file of the VIEW add-on.
 *
 * Created by eduard on 06.01.17.
 */

"use strict";

describe("options.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    fixture.load("/fixtures/ru-nouns-color.html");
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

      expect($("viewenhancement")).to.exist;
    });
  });

  describe("run", function() {
    it("should add the color class to all viewenhancement tags", function() {
      const topic = "nouns";
      const colorizeStyleClass = "colorize-style-nouns";
      const $Enhancement = $("viewenhancement");

      expect($Enhancement.hasClass(colorizeStyleClass)).to.be.false;

      view.color.run(topic);

      $Enhancement.each(function() {
        expect($(this).data("view-original-text")).to.exist;
        expect($(this).hasClass(colorizeStyleClass)).to.be.true;
      });
    });
  });
});
