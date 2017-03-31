/**
 * Tests for the enhancement.js file of the VIEW add-on.
 *
 * Created by eduard on 29.03.17.
 */

"use strict";

describe("enhancer.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
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
      fixture.load("/fixtures/ru-no-markup.html");

      const fixtureInnerHTML = $("#ru-no-markup-body").html();
      const $FixtureBody = $("<div id='wertiview-content'>");

      $FixtureBody.html(fixtureInnerHTML);

      $("body").append($FixtureBody);

      expect($("#wertiview-content").length).to.be.above(0);
      expect($("#ru-no-markup-body").length).to.be.above(0);
    });
  });
});
