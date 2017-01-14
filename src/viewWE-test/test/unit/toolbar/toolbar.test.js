/**
 * Tests for the toolbar.js file of the VIEW add-on.
 *
 * Created by eduard on 31.12.16.
 */

"use strict";

describe("toolbar.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    fixture.load("/fixtures/toolbar.html");
  });

  afterEach(function() {
    sandbox.restore();
    toolbar.topics = {};
    toolbar.$cache = new Selector_Cache();
    chrome.runtime.sendMessage.reset();
    chrome.storage.local.set.reset();
    chrome.storage.local.get.reset();
    fixture.cleanup();
  });

  const toolbarStart = "#wertiview-toolbar-";
  const identityIdStart = toolbar.selectorStart + "identity-";

  describe("Selector_Cache", function() {
    it("should get the wanted jquery selector", function() {
      const selectorSpy = sandbox.spy(toolbar.$cache, "get");
      const getElementByIdSpy = sandbox.spy(document, "getElementById");
      const someSelector = "#someSelector";

      $("body").append("<div id='someSelector'>some text</div>");

      const $CachedObject = toolbar.$cache.get(someSelector);
      toolbar.$cache.get(someSelector);

      // even though we selected "someSelector" twice...
      sinon.assert.calledTwice(selectorSpy);
      sinon.assert.calledWithExactly(selectorSpy, someSelector);

      // ... in the background we selected it only once and retrieved it
      // from the $cache in the second call
      sinon.assert.calledOnce(getElementByIdSpy);
      sinon.assert.calledWithExactly(getElementByIdSpy, someSelector.substr(1));

      getElementByIdSpy.reset();

      $(someSelector);
      $(someSelector);

      // in contrast jquery selects it every time, without reusing
      // previous selections
      sinon.assert.calledTwice(getElementByIdSpy);

      // the $CachedObject is actually equal to the jquery object counterpart
      expect($CachedObject).to.deep.equal($(someSelector));

      // we can also use the $CachedObject in the same way we do use jquery objects
      expect($CachedObject.text()).to.equal("some text");

      $(someSelector).remove();
    });
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

  describe("requestTopicsAndInit", function() {
    it("should send a request to send the topics and then start to init the toolbar", function() {
      const initSpy = sandbox.spy(toolbar, "init");
      const responseData = {topics: "some topics data"};

      chrome.runtime.sendMessage.yields(responseData);

      toolbar.requestTopicsAndInit();

      sinon.assert.calledOnce(chrome.runtime.sendMessage);
      sinon.assert.calledWith(chrome.runtime.sendMessage, {msg: "call sendTopics"});

      sinon.assert.calledOnce(initSpy);
      sinon.assert.calledWithExactly(initSpy, responseData.topics);
    });
  });

  describe("init", function() {
    it("should set the topics, initialize toolbar events and restore prior selections", function() {
      const initViewMenuSpy = sandbox.spy(toolbar, "initViewMenu");
      const initAutoEnhanceSpy = sandbox.spy(toolbar, "initAutoEnhance");
      const initLanguageMenuSpy = sandbox.spy(toolbar, "initLanguageMenu");
      const initTopicMenuSpy = sandbox.spy(toolbar, "initTopicMenu");
      const initialInteractionStateSpy = sandbox.spy(toolbar, "initialInteractionState");
      const initEnhanceBtnSpy = sandbox.spy(toolbar, "initEnhanceBtn");
      const initAbortBtnSpy = sandbox.spy(toolbar, "initAbortBtn");
      const initRestoreBtnSpy = sandbox.spy(toolbar, "initRestoreBtn");
      const initSignInOutInterfacesSpy = sandbox.spy(toolbar, "initSignInOutInterfaces");
      const initSignInLinkSpy = sandbox.spy(toolbar, "initSignInLink");
      const initSignOutLinkSpy = sandbox.spy(toolbar, "initSignOutLink");
      const initToggleToolbarSpy = sandbox.spy(toolbar, "initToggleToolbar");
      const restoreSelectionsSpy = sandbox.spy(toolbar, "restoreSelections");
      const topics = {topic: "some topic info"};

      expect(toolbar.topics).to.be.empty;

      toolbar.init(topics);

      expect(toolbar.topics).to.equal(topics);

      sinon.assert.calledOnce(initViewMenuSpy);
      sinon.assert.calledOnce(initAutoEnhanceSpy);
      sinon.assert.calledOnce(initLanguageMenuSpy);
      sinon.assert.calledOnce(initTopicMenuSpy);
      sinon.assert.calledOnce(initialInteractionStateSpy);
      sinon.assert.calledOnce(initEnhanceBtnSpy);
      sinon.assert.calledOnce(initAbortBtnSpy);
      sinon.assert.calledOnce(initRestoreBtnSpy);
      sinon.assert.calledOnce(initSignInOutInterfacesSpy);
      sinon.assert.calledOnce(initSignInLinkSpy);
      sinon.assert.calledOnce(initSignOutLinkSpy);
      sinon.assert.calledOnce(initToggleToolbarSpy);
      sinon.assert.calledOnce(restoreSelectionsSpy);
    });

    describe("initViewMenu", function() {
      it("should initialize the VIEW menu handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initViewMenu();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, "#wertiview-VIEW-menu-btn");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call requestToToggleViewMenu() on click", function() {
        const requestToToggleMenuViewSpy = sandbox.spy(toolbar, "requestToToggleViewMenu");

        toolbar.initViewMenu();

        $("#wertiview-VIEW-menu-btn").trigger("click");

        sinon.assert.calledOnce(requestToToggleMenuViewSpy);
      });

      it("should request to toggle the VIEW menu", function() {
        toolbar.requestToToggleViewMenu();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {msg: "toggle VIEW Menu"});
      });
    });

    describe("initAutoEnhance", function() {
      it("should initialize the auto enhance handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initAutoEnhance();

        sinon.assert.calledTwice(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy.getCall(0), toolbarStart + "enabled");
        sinon.assert.calledWithExactly(selectorSpy.getCall(1), toolbarStart + "disabled");

        sinon.assert.calledTwice(eventSpy);
        sinon.assert.alwaysCalledWith(eventSpy, "click");
      });

      describe("turnOffAutoEnhanceAndSet", function() {
        it("should call turnOffAutoEnhanceAndSet() on click", function() {
          const turnOffAutoEnhanceAndSetSpy = sandbox.spy(toolbar, "turnOffAutoEnhanceAndSet");

          toolbar.initAutoEnhance();

          $(toolbar.selectorStart + "enabled").trigger("click");

          sinon.assert.calledOnce(turnOffAutoEnhanceAndSetSpy);
        });

        it("should call turn off auto enhance and set enabled to \"false\"", function() {
          const turnOffAutoEnhanceSpy = sandbox.spy(toolbar, "turnOffAutoEnhance");

          toolbar.turnOffAutoEnhanceAndSet();

          sinon.assert.calledOnce(turnOffAutoEnhanceSpy);

          sinon.assert.calledOnce(chrome.storage.local.set);
          sinon.assert.calledWithExactly(chrome.storage.local.set, {enabled: false});
        });

        it("should turn off auto enhance", function() {
          toolbar.turnOffAutoEnhance();

          expect($(toolbar.selectorStart + "enabled").is(":hidden")).to.be.true;
          expect($(toolbar.selectorStart + "disabled").is(":visible")).to.be.true;
        });
      });

      describe("turnOnAutoEnhanceAndSet", function() {
        it("should call turnOnAutoEnhanceAndSet() on click", function() {
          const turnOnAutoEnhanceAndSetSpy = sandbox.spy(toolbar, "turnOnAutoEnhanceAndSet");

          toolbar.initAutoEnhance();

          toolbar.$cache.get(toolbar.selectorStart + "disabled").trigger("click");

          sinon.assert.calledOnce(turnOnAutoEnhanceAndSetSpy);
        });

        it("should call turn on auto enhance and set enabled to \"true\"", function() {
          const turnOnAutoEnhanceSpy = sandbox.spy(toolbar, "turnOnAutoEnhance");

          toolbar.turnOnAutoEnhanceAndSet();

          sinon.assert.calledOnce(turnOnAutoEnhanceSpy);

          sinon.assert.calledOnce(chrome.storage.local.set);
          sinon.assert.calledWithExactly(chrome.storage.local.set, {enabled: true});
        });

        it("should turn on auto enhance", function() {
          toolbar.turnOnAutoEnhance();

          expect($(toolbar.selectorStart + "disabled").is(":hidden")).to.be.true;
          expect($(toolbar.selectorStart + "enabled").is(":visible")).to.be.true;
        });
      });
    });
    describe("initLanguageMenu", function() {
      it("should initialize the language menu handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initLanguageMenu();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbar.selectorStart + "language-menu");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "change");
      });

      it("should call selectTopicMenu(language) on language change", function() {
        const selectTopicMenuSpy = sandbox.spy(toolbar, "selectTopicMenu");
        const language = "en";

        toolbar.initLanguageMenu();

        $(toolbar.selectorStart + "language-menu").val(language).trigger("change");

        sinon.assert.calledOnce(selectTopicMenuSpy);
        sinon.assert.calledWithExactly(selectTopicMenuSpy, language);
      });

      it("should go through all topic menus and call toggleTopicMenu(l1, l2)", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const findSpy = sandbox.spy($.fn, "find");
        const toggleTopicMenuSpy = sandbox.spy(toolbar, "toggleTopicMenu");
        const language = "en";

        toolbar.selectTopicMenu(language);

        sinon.assert.calledOnce(selectorSpy.withArgs(toolbar.selectorStart + "language-menu"));

        sinon.assert.calledWithExactly(findSpy.getCall(0), "option");

        sinon.assert.callCount(toggleTopicMenuSpy, 3);
        sinon.assert.calledWithExactly(toggleTopicMenuSpy.getCall(0), language, "unselected");
        sinon.assert.calledWithExactly(toggleTopicMenuSpy.getCall(1), language, "──────────");
        sinon.assert.calledWithExactly(toggleTopicMenuSpy.getCall(2), language, "en");
      });

      describe("toggleTopicMenu", function() {
        it("should show the selected topic menu and call updateActivities(language, topic)", function() {
          const updateActivitiesSpy = sandbox.spy(toolbar, "updateActivities");
          const selectedLanguage = "en";
          const currentLanguage = "en";
          const topicMenu = toolbar.selectorStart + "topic-menu-" + currentLanguage;
          const topic = "articles";

          $(topicMenu).val(topic);

          toolbar.toggleTopicMenu(selectedLanguage, currentLanguage);

          expect($(topicMenu).hasClass("selected-toolbar-topic-menu")).to.be.true;

          expect($(topicMenu).is(":visible")).to.be.true;

          sinon.assert.calledOnce(updateActivitiesSpy);
          sinon.assert.calledWithExactly(updateActivitiesSpy, selectedLanguage, topic);
        });

        it("should un-select and hide the topic menu", function() {
          const selectedLanguage = "en";
          const currentLanguage = "unselected";
          const topicMenu = toolbar.selectorStart + "topic-menu-" + currentLanguage;
          const selectedTopicMenu = "selected-toolbar-topic-menu";

          $(topicMenu).addClass(selectedTopicMenu);
          expect($(topicMenu).hasClass(selectedTopicMenu)).to.be.true;

          toolbar.toggleTopicMenu(selectedLanguage, currentLanguage);

          expect($(topicMenu).hasClass(selectedTopicMenu)).to.be.false;

          expect($(topicMenu).is(":hidden")).to.be.true;
        });
      });

      describe("updateActivities", function() {
        it("should call fillActivitySelectors() and show the activity \"unselected\"", function() {
          const fillActivitySelectorsSpy = sandbox.spy(toolbar, "fillActivitySelectors");
          const language = "unselected";
          const topic = "unselected";

          toolbar.updateActivities(language, topic);

          sinon.assert.calledOnce(fillActivitySelectorsSpy);

          const $ActivityUnselected = $(toolbar.selectorStart + "activity-unselected");

          expect($ActivityUnselected.prop("disabled")).to.be.false;
          expect($ActivityUnselected.prop("selected")).to.be.true;
          expect($ActivityUnselected.is(":visible")).to.be.true;
        });

        it("should fill and return an object of activity selectors", function() {
          const selectorSpy = sandbox.spy(toolbar.$cache, "get");
          const findSpy = sandbox.spy($.fn, "find");

          const activitySelectors = toolbar.fillActivitySelectors();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy, toolbar.selectorStart + "activity-menu");

          sinon.assert.calledOnce(findSpy);
          sinon.assert.calledWithExactly(findSpy, "option[value]");

          expect(Object.keys(activitySelectors).length).to.equal(5);

          for (let activity in activitySelectors) {
            if (Object.prototype.hasOwnProperty.call(activitySelectors, activity)) {
              expect(activitySelectors[activity].prop("disabled")).to.be.true;
              expect(activitySelectors[activity].is(":hidden")).to.be.true;
            }
          }
        });

        it("should only hide the horizontal separator, as the language is \"unselected\"", function() {
          const language = "unselected";
          // the topic will be in this case always be "unselected"
          const topic = "unselected";

          toolbar.updateActivities(language, topic);

          expect($(toolbar.selectorStart + "activity-unselected").next().is(":hidden")).to.be.true;
        });

        it("should only hide the horizontal separator, as the topic starts with \"unselected\"", function() {
          const language = "en";
          const topic = "unselected-en";

          toolbar.updateActivities(language, topic);

          expect($(toolbar.selectorStart + "activity-unselected").next().is(":hidden")).to.be.true;
        });

        it("should only hide the horizontal separator, as the topic json objects don't have the language", function() {
          const language = "unknownLanguage";
          const topic = "determiners";

          toolbar.updateActivities(language, topic);

          expect($(toolbar.selectorStart + "activity-unselected").next().is(":hidden")).to.be.true;
        });

        it("should only hide the horizontal separator, as the topic json objects don't have the topic", function() {
          const language = "en";
          const topic = "unknownTopic";

          toolbar.updateActivities(language, topic);

          expect($(toolbar.selectorStart + "activity-unselected").next().is(":hidden")).to.be.true;
        });

        it("should call enableAndShowActivities(language, topic, activitySelections)", function() {
          const jsonData = fixture.load("fixtures/json/articles.json", true);

          const fillActivitySelectorsSpy = sandbox.spy(toolbar, "fillActivitySelectors");
          const enableAndShowActivitiesSpy = sandbox.spy(toolbar, "enableAndShowActivities");
          const language = "en";
          const topic = "articles";

          toolbar.topics = {en: {articles: {activities: jsonData.activities}}};

          toolbar.updateActivities(language, topic);

          sinon.assert.calledOnce(enableAndShowActivitiesSpy);
          sinon.assert.calledWithExactly(enableAndShowActivitiesSpy,
            language,
            topic,
            fillActivitySelectorsSpy.returnValues[0]);
        });

        it("should show the horizontal separator and all activities available for this topic", function() {
          const jsonData = fixture.load("fixtures/json/articles.json", true);

          const enableAndShowActivitiesSpy = sandbox.spy(toolbar, "enableAndShowActivities");
          const language = "en";
          const topic = "articles";

          toolbar.topics = {en: {articles: {activities: jsonData.activities}}};

          toolbar.updateActivities(language, topic);

          expect($(toolbar.selectorStart + "activity-unselected").next().is(":visible")).to.be.true;

          const availableActivities = toolbar.topics[language][topic].activities;
          const activitySelectors = enableAndShowActivitiesSpy.firstCall.args[2];

          for (let i = 0; i < availableActivities.length; i++) {
            expect(activitySelectors[availableActivities[i].activity].prop("disabled")).to.be.false;
            expect(activitySelectors[availableActivities[i].activity].is(":visible")).to.be.true;
          }
        });
      });
    });

    describe("initTopicMenu", function() {
      it("should initialize the topic menu handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initTopicMenu();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy,
          toolbar.selectorStart + "topic-menu-unselected, " +
          toolbar.selectorStart + "topic-menu-en, " +
          toolbar.selectorStart + "topic-menu-de, " +
          toolbar.selectorStart + "topic-menu-es, " +
          toolbar.selectorStart + "topic-menu-ru");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "change");
      });

      // TODO: Should we do this for each topic menu?
      it("should call updateActivities(language, topic) on topic change", function() {
        const updateActivitiesSpy = sandbox.spy(toolbar, "updateActivities");
        const language = "en";
        const topic = "articles";

        toolbar.initTopicMenu();

        $(toolbar.selectorStart + "language-menu").val(language);

        $(toolbar.selectorStart + "topic-menu-" + language).val(topic).trigger("change");

        sinon.assert.calledOnce(updateActivitiesSpy);
        sinon.assert.calledWithExactly(updateActivitiesSpy, language, topic);
      });
    });

    describe("initialInteractionState", function() {
      it("should put the toolbar into the initial interaction state", function() {
        toolbar.initialInteractionState();

        expect($(toolbar.selectorStart + "enhance-button").is(":visible")).to.be.true;
        expect($(toolbar.selectorStart + "restore-button").is(":hidden")).to.be.true;
        expect($(toolbar.selectorStart + "abort-button").is(":hidden")).to.be.true;
        expect($(toolbar.selectorStart + "loading-image").is(":hidden")).to.be.true;
      });
    });

    describe("initEnhanceBtn", function() {
      it("should initialize the enhancement button handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initEnhanceBtn();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbar.selectorStart + "enhance-button");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call setSelectionsAndPrepareToEnhance() on click", function() {
        const setSelectionsAndPrepareToEnhanceSpy = sandbox.spy(toolbar, "setSelectionsAndPrepareToEnhance");

        toolbar.initEnhanceBtn();

        $(toolbar.selectorStart + "enhance-button").trigger("click");

        sinon.assert.calledOnce(setSelectionsAndPrepareToEnhanceSpy);
      });

      describe("setSelectionsAndPrepareToEnhance", function() {
        it("should create an unselectedNotification as the language was not selected", function() {
          const language = "unselected";
          const topic = "unselected";
          const activity = "unselected";

          $(toolbar.selectorStart + "language-menu").val(language);

          $(toolbar.selectorStart + "topic-menu-" + language)
          .addClass("selected-toolbar-topic-menu")
          .val(topic);

          $(toolbar.selectorStart + "activity-menu").val(activity);

          toolbar.setSelectionsAndPrepareToEnhance();

          sinon.assert.calledOnce(chrome.runtime.sendMessage);
          sinon.assert.calledWith(chrome.runtime.sendMessage, {msg: "create unselectedNotification"});
        });

        it("should create an unselectedNotification as the topic was not selected", function() {
          const language = "en";
          const topic = "unselected-en";
          const activity = "unselected";

          $(toolbar.selectorStart + "language-menu").val(language);

          $(toolbar.selectorStart + "topic-menu-" + language)
          .addClass("selected-toolbar-topic-menu")
          .val(topic);

          $(toolbar.selectorStart + "activity-menu").val(activity);

          toolbar.setSelectionsAndPrepareToEnhance();

          sinon.assert.calledOnce(chrome.runtime.sendMessage);
          sinon.assert.calledWith(chrome.runtime.sendMessage, {msg: "create unselectedNotification"});
        });

        it("should create an unselectedNotification as the activity was not selected", function() {
          const language = "en";
          const topic = "articles";
          const activity = "unselected";

          $(toolbar.selectorStart + "language-menu").val(language);

          $(toolbar.selectorStart + "topic-menu-" + language)
          .addClass("selected-toolbar-topic-menu")
          .val(topic);

          $(toolbar.selectorStart + "activity-menu").val(activity);

          toolbar.setSelectionsAndPrepareToEnhance();

          sinon.assert.calledOnce(chrome.runtime.sendMessage);
          sinon.assert.calledWith(chrome.runtime.sendMessage, {msg: "create unselectedNotification"});
        });

        it("should set language, topic and activity and call prepareToEnhance()", function() {
          const prepareToEnhanceSpy = sandbox.spy(toolbar, "prepareToEnhance");

          const language = "en";
          const topic = "articles";
          const activity = "color";

          chrome.storage.local.set.yields(); // make set synchronous

          $(toolbar.selectorStart + "language-menu").val(language);

          $(toolbar.selectorStart + "topic-menu-" + language)
          .addClass("selected-toolbar-topic-menu")
          .val(topic);

          $(toolbar.selectorStart + "activity-menu").val(activity);

          toolbar.setSelectionsAndPrepareToEnhance();

          sinon.assert.calledOnce(chrome.storage.local.set);
          sinon.assert.calledWith(chrome.storage.local.set, {
            language: language,
            topic: topic,
            activity: activity
          });

          sinon.assert.calledOnce(prepareToEnhanceSpy);
        });

        it("should prepare and request to call startToEnhance()", function() {
          toolbar.prepareToEnhance();

          expect($(toolbar.selectorStart + "enhance-button").is(":hidden")).to.be.true;
          expect($(toolbar.selectorStart + "restore-button").is(":hidden")).to.be.true;
          expect($(toolbar.selectorStart + "loading-image").is(":visible")).to.be.true;

          sinon.assert.calledOnce(chrome.runtime.sendMessage);
          sinon.assert.calledWith(chrome.runtime.sendMessage, {msg: "call startToEnhance"});
        });
      });
    });

    describe("initAbortBtn", function() {
      it("should initialize the abort button handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initAbortBtn();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbar.selectorStart + "abort-button");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call requestToCallAbort() on click", function() {
        const requestToCallAbortSpy = sandbox.spy(toolbar, "requestToCallAbort");

        toolbar.initAbortBtn();

        $(toolbar.selectorStart + "abort-button").trigger("click");

        sinon.assert.calledOnce(requestToCallAbortSpy);
      });

      it("should request to call abort()", function() {
        toolbar.requestToCallAbort();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {msg: "call abort"});
      });
    });

    describe("initRestoreBtn", function() {
      it("should initialize the restore button handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initRestoreBtn();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbar.selectorStart + "restore-button");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call requestToCallRestoreToOriginal() on click", function() {
        const requestToCallRestoreToOriginalSpy = sandbox.spy(toolbar, "requestToCallRestoreToOriginal");

        toolbar.initRestoreBtn();

        $(toolbar.selectorStart + "restore-button").trigger("click");

        sinon.assert.calledOnce(requestToCallRestoreToOriginalSpy);
      });

      it("should request to call restoreToOriginal()", function() {
        toolbar.requestToCallRestoreToOriginal();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {msg: "call restoreToOriginal"});
      });
    });

    describe("initSignInOutInterfaces", function() {
      it("should initialize the sign in and sign out interfaces", function() {
        // TODO: This test is going to change when the authenticator works on the new server
        const link = "http://sifnos.sfs.uni-tuebingen.de/VIEW/openid/authenticator.html";

        toolbar.initSignInOutInterfaces();

        expect($(toolbar.selectorStart + "identity-signinlink").attr("link")).to.equal(link);
        expect($(toolbar.selectorStart + "identity-signoutlink").attr("link")).to.equal(link);
      });
    });

    describe("initSignInLink", function() {
      it("should initialize the sign in link handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initSignInLink();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbar.selectorStart + "identity-signinlink");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call openSignInWindow() on click", function() {
        const openSignInWindowSpy = sandbox.spy(toolbar, "openSignInWindow");

        toolbar.initSignInLink();

        $(toolbar.selectorStart + "identity-signinlink").trigger("click");

        sinon.assert.calledOnce(openSignInWindowSpy);
      });

      it("should open the sign in window", function() {
        const windowOpenSpy = sandbox.spy(window, "open");

        toolbar.initSignInOutInterfaces("https://view.aleks.bg");

        toolbar.initSignInLink();

        toolbar.openSignInWindow();

        sinon.assert.calledOnce(windowOpenSpy);
        sinon.assert.calledWithExactly(windowOpenSpy,
          $(toolbar.selectorStart + "identity-signinlink").attr("link"),
          "Sign In",
          "width=985,height=735");

        // TODO: Find out how to check if the window has focus as expected
      });
    });

    describe("initSignOutLink", function() {
      it("should initialize the sign out link handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initSignOutLink();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbar.selectorStart + "identity-signoutlink");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call openSignOutWindow() on click", function() {
        const openSignOutWindowSpy = sandbox.spy(toolbar, "openSignOutWindow");

        toolbar.initSignOutLink();

        $(toolbar.selectorStart + "identity-signoutlink").trigger("click");

        sinon.assert.calledOnce(openSignOutWindowSpy);
      });

      it("should open the sign out window", function() {
        const windowOpenSpy = sandbox.spy(window, "open");

        toolbar.initSignInOutInterfaces("https://view.aleks.bg");

        toolbar.openSignOutWindow();

        sinon.assert.calledOnce(windowOpenSpy);
        sinon.assert.calledWithExactly(windowOpenSpy,
          $(toolbar.selectorStart + "identity-signoutlink").attr("link"),
          "Sign Out",
          "width=1,height=1");

        // TODO: Find out how to test if window.moveTo(x, y) was called
      });
    });

    describe("initToggleToolbar", function() {
      it("should initialize the toggle toolbar button handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initToggleToolbar();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbar.selectorStart + "toggle-button");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call requestToToggleToolbar() on click", function() {
        const requestToToggleToolbarSpy = sandbox.spy(toolbar, "requestToToggleToolbar");

        toolbar.initToggleToolbar();

        $(toolbar.selectorStart + "toggle-button").trigger("click");

        sinon.assert.calledOnce(requestToToggleToolbarSpy);
      });

      it("should request to call requestToToggleToolbar()", function() {
        toolbar.requestToToggleToolbar();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {msg: "toggle toolbar"});
      });
    });

    describe("restoreSelections", function() {
      it("should call all restoration functions with default values", function() {
        const restoreSelectionMenusSpy = sandbox.spy(toolbar, "restoreSelectionMenus");
        const selectTopicMenuSpy = sandbox.spy(toolbar, "selectTopicMenu");
        const verifySignInStatusSpy = sandbox.spy(toolbar, "verifySignInStatus");
        const restoreAutoEnhanceSpy = sandbox.spy(toolbar, "restoreAutoEnhance");

        const language = "unselected";
        const topic = "unselected";
        const activity = "unselected";
        const userEmail = "";
        const enabled = false;

        chrome.storage.local.get.yields({});

        toolbar.restoreSelections();

        sinon.assert.calledOnce(restoreSelectionMenusSpy);
        sinon.assert.calledWithExactly(restoreSelectionMenusSpy, language, topic, activity);

        sinon.assert.calledOnce(selectTopicMenuSpy);
        sinon.assert.calledWithExactly(selectTopicMenuSpy, language);

        sinon.assert.calledOnce(verifySignInStatusSpy);
        sinon.assert.calledWithExactly(verifySignInStatusSpy, userEmail);

        sinon.assert.calledOnce(restoreAutoEnhanceSpy);
        sinon.assert.calledWithExactly(restoreAutoEnhanceSpy, enabled);
      });

      it("should call all restoration functions with stored values", function() {
        const restoreSelectionMenusSpy = sandbox.spy(toolbar, "restoreSelectionMenus");
        const selectTopicMenuSpy = sandbox.spy(toolbar, "selectTopicMenu");
        const verifySignInStatusSpy = sandbox.spy(toolbar, "verifySignInStatus");
        const restoreAutoEnhanceSpy = sandbox.spy(toolbar, "restoreAutoEnhance");

        const language = "en";
        const topic = "articles";
        const activity = "color";
        const userEmail = "some.mail";
        const enabled = true;

        chrome.storage.local.get.yields({
          language: language,
          topic: topic,
          activity: activity,
          userEmail: userEmail,
          enabled: enabled
        });

        toolbar.restoreSelections();

        sinon.assert.calledOnce(restoreSelectionMenusSpy);
        sinon.assert.calledWithExactly(restoreSelectionMenusSpy, language, topic, activity);

        sinon.assert.calledOnce(selectTopicMenuSpy);
        sinon.assert.calledWithExactly(selectTopicMenuSpy, language);

        sinon.assert.calledOnce(verifySignInStatusSpy);
        sinon.assert.calledWithExactly(verifySignInStatusSpy, userEmail);

        sinon.assert.calledOnce(restoreAutoEnhanceSpy);
        sinon.assert.calledWithExactly(restoreAutoEnhanceSpy, enabled);
      });

      describe("restoreSelectionMenus", function() {
        it("should restore all usual selections of the selection menus", function() {
          const language = "en";
          const topic = "articles";
          const activity = "color";
          const selected = "selected";

          toolbar.restoreSelectionMenus(language, topic, activity);

          expect($(toolbar.selectorStart + "language-" + language).prop(selected)).to.be.true;
          expect($(toolbar.selectorStart + "topic-" + topic).prop(selected)).to.be.true;
          expect($(toolbar.selectorStart + "activity-" + activity).prop(selected)).to.be.true;
        });

        it("should restore the determiners special case", function() {
          const language = "en";
          const topic = "determiners";
          const activity = "color";

          toolbar.restoreSelectionMenus(language, topic, activity);

          expect($(toolbar.selectorStart + "topic-" + topic + "-" + language).prop("selected")).to.be.true;
        });

        // TODO: can be activated as soon as the "Preps" topic is available
        // it("should restore the prepositions special case", function() {
        //           //
        //   const language = "en";
        //   const topic = "Preps";
        //   const activity = "color";
        //
        //   toolbar.restoreSelectionMenus(language, topic, activity);
        //
        //   expect($(toolbar.selectorStart + "topic-" + topic + "-" + language).prop("selected")).to.be.true;
        // });
      });

      describe("verifySignInStatus", function() {
        it("should call signOut() as the user email is empty", function() {
          const singOutSpy = sandbox.spy(toolbar, "signOut");

          const userEmail = "";

          toolbar.verifySignInStatus(userEmail);

          sinon.assert.calledOnce(singOutSpy);
        });

        it("should call signIn(userEmail) as the user email is not empty", function() {
          const signInSpy = sandbox.spy(toolbar, "signIn");
          const userEmail = "some.email";

          toolbar.verifySignInStatus(userEmail);

          sinon.assert.calledOnce(signInSpy);
          sinon.assert.calledWithExactly(signInSpy, userEmail);
        });
      });

      describe("restoreAutoEnhance", function() {
        it("should call turnOnAutoEnhance() and call setSelectionsAndPrepareToEnhance() as auto-enhance is enabled", function() {
          const turnOnAutoEnhanceSpy = sandbox.spy(toolbar, "turnOnAutoEnhance");
          const setSelectionsAndPrepareToEnhanceSpy = sandbox.spy(toolbar, "setSelectionsAndPrepareToEnhance");

          toolbar.initEnhanceBtn();

          toolbar.restoreAutoEnhance(true);

          sinon.assert.calledOnce(turnOnAutoEnhanceSpy);

          sinon.assert.calledOnce(setSelectionsAndPrepareToEnhanceSpy);
        });

        it("should call turnOffAutoEnhance() as auto-enhance is disabled", function() {
          const turnOffAutoEnhanceSpy = sandbox.spy(toolbar, "turnOffAutoEnhance");

          toolbar.restoreAutoEnhance(false);

          sinon.assert.calledOnce(turnOffAutoEnhanceSpy);
        });
      });
    });
  });

  describe("processMessageForToolbar", function() {
    it("should register one listener for runtime onMessage", function() {
      sinon.assert.calledOnce(chrome.runtime.onMessage.addListener);
    });

    it("should process the message \"show element\"", function() {
      const request = {
        msg: "show element",
        selector: toolbar.selectorStart + "restore-button"
      };

      chrome.runtime.onMessage.trigger(request);

      expect($(request.selector).is(":visible")).to.be.true;
    });

    it("should process the message \"hide element\"", function() {
      const request = {
        msg: "hide element",
        selector: toolbar.selectorStart + "restore-button"
      };

      chrome.runtime.onMessage.trigger(request);

      expect($(request.selector).is(":hidden")).to.be.true;
    });

    describe("signIn", function() {
      it("should process the message \"call signIn\"", function() {
        const signInSpy = sandbox.spy(toolbar, "signIn");

        const userEmail = "some.email";

        const request = {
          msg: "call signIn",
          userEmail: userEmail
        };

        chrome.runtime.onMessage.trigger(request);

        sinon.assert.calledOnce(signInSpy);
        sinon.assert.calledWithExactly(signInSpy, userEmail);
      });

      it("should sign in the user", function() {
        const userEmail = "some.email";

        toolbar.signIn(userEmail);

        expect($(identityIdStart + "signinlink").is(":hidden")).to.be.true;

        expect($(identityIdStart + "signedinstatus").is(":visible")).to.be.true;
        expect($(identityIdStart + "signedinuseremail").is(":visible")).to.be.true;
        expect($(identityIdStart + "signoutlink").is(":visible")).to.be.true;

        expect($(identityIdStart + "signedinuseremail").text()).to.equal(userEmail);
      });
    });

    describe("signOut", function() {
      it("should process the message \"call signOut\"", function() {
        const signOutSpy = sandbox.spy(toolbar, "signOut");

        const request = {msg: "call signOut"};

        chrome.runtime.onMessage.trigger(request);

        sinon.assert.calledOnce(signOutSpy);
      });

      it("should sign out the user", function() {
        toolbar.signOut();

        expect($(identityIdStart + "signinlink").is(":visible")).to.be.true;

        expect($(identityIdStart + "signedinstatus").is(":hidden")).to.be.true;
        expect($(identityIdStart + "signedinuseremail").is(":hidden")).to.be.true;
        expect($(identityIdStart + "signoutlink").is(":hidden")).to.be.true;
      });
    });
  });
});
