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
    fixture.load("/fixtures/options.html");
  });

  afterEach(function() {
    sandbox.restore();
    toolbar.$cache = new Selector_Cache();
    fixture.cleanup();
  });

  describe("jquery selectors", function() {
    it("should be able to find all required jquery selectors in the toolbar", function() {
      // some selectors only need the element, its enough if they exist
      // some selectors need the val(), text() or attr("link"),
      // if there is the value we expect, they exist as well
      // maintain this test, if there are additions or changes
      // the expectations below don't need to be tested in other tests again
      // the selectors below can be freely used in the tests without problems

      expect($("#wertiview-VIEW-menu-btn")).to.exist;

      expect($(toolbar.selectorStart + "enabled")).to.exist;
      expect($(toolbar.selectorStart + "disabled")).to.exist;

      expect($(toolbar.selectorStart + "language-menu")).to.exist;
      expect($(toolbar.selectorStart + "language-unselected").val()).to.equal("unselected");
      expect($(toolbar.selectorStart + "language-en").val()).to.equal("en");

      expect($(toolbar.selectorStart + "topic-menu-unselected")).to.exist;
      expect($(toolbar.selectorStart + "topic-unselected").val()).to.equal("unselected");

      expect($(toolbar.selectorStart + "topic-menu-en")).to.exist;
      expect($(toolbar.selectorStart + "topic-unselected-en").val()).to.equal("unselected-en");
      expect($(toolbar.selectorStart + "topic-articles").val()).to.equal("articles");
      expect($(toolbar.selectorStart + "topic-determiners-en").val()).to.equal("determiners");

      expect($(toolbar.selectorStart + "activity-menu")).to.exist;
      expect($(toolbar.selectorStart + "activity-unselected").val()).to.equal("unselected");
      expect($(toolbar.selectorStart + "activity-unselected").next().text()).to.equal("──────────");
      expect($(toolbar.selectorStart + "activity-color").val()).to.equal("color");
      expect($(toolbar.selectorStart + "activity-click").val()).to.equal("click");
      expect($(toolbar.selectorStart + "activity-mc").val()).to.equal("mc");
      expect($(toolbar.selectorStart + "activity-cloze").val()).to.equal("cloze");

      expect($(toolbar.selectorStart + "enhance-button")).to.exist;
      expect($(toolbar.selectorStart + "restore-button")).to.exist;
      expect($(toolbar.selectorStart + "abort-button")).to.exist;
      expect($(toolbar.selectorStart + "loading-image")).to.exist;

      toolbar.initSignInOutInterfaces(); // adds the link attribute

      expect($(identityIdStart + "signinlink").attr("link"))
      .to.equal("http://sifnos.sfs.uni-tuebingen.de/VIEW/openid/authenticator.html");
      expect($(identityIdStart + "signedinstatus")).to.exist;
      expect($(identityIdStart + "signedinuseremail")).to.exist;
      expect($(identityIdStart + "signoutlink").attr("link"))
      .to.equal("http://sifnos.sfs.uni-tuebingen.de/VIEW/openid/authenticator.html");

      expect($(toolbar.selectorStart + "toggle-button")).to.exist;
    });
  });

  describe("document ready", function() {
    it("should call requestTopicsAndInit() when the document is ready", function(done) {
      const requestTopicsAndInitSpy = sandbox.spy(toolbar, "requestTopicsAndInit");

      $(document).ready(function() {
        sinon.assert.calledOnce(requestTopicsAndInitSpy);
        done();
      });
    });
  });
});
