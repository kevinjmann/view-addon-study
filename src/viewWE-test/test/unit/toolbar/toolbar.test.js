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
    toolbar.topics = {};
    toolbar.activitySelectors = {};
    toolbar.$cache = new Selector_Cache();
  });

  afterEach(function() {
    sandbox.restore();
    chrome.runtime.sendMessage.reset();
    chrome.storage.local.set.reset();
    chrome.storage.local.get.reset();
    $(window).off();
    fixture.cleanup();
  });

  const toolbarStart = "#wertiview-toolbar-";
  const globalServerURL = "https://view.aleks.bg";

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

      expect($("#wertiview-VIEW-menu-btn").length).to.be.above(0);

      expect($(toolbarStart + "enabled").length).to.be.above(0);
      expect($(toolbarStart + "disabled").length).to.be.above(0);

      expect($(toolbarStart + "language-menu").length).to.be.above(0);
      expect($(toolbarStart + "language-unselected").val()).to.equal("unselected");
      expect($(toolbarStart + "language-unselected").next().text()).to.equal("──────────");
      expect($(toolbarStart + "language-en").val()).to.equal("en");
      expect($(toolbarStart + "language-ru").val()).to.equal("ru");

      expect($(toolbarStart + "topic-menu-unselected").length).to.be.above(0);
      expect($(toolbarStart + "topic-unselected").val()).to.equal("unselected");

      expect($(toolbarStart + "topic-menu-en").length).to.be.above(0);
      expect($(toolbarStart + "topic-unselected-en").val()).to.equal("unselected-en");
      expect($(toolbarStart + "topic-unselected-en").next().text()).to.equal("──────────");
      expect($(toolbarStart + "topic-articles").val()).to.equal("articles");
      expect($(toolbarStart + "topic-determiners-en").val()).to.equal("determiners");

      expect($(toolbarStart + "topic-menu-ru").length).to.be.above(0);
      expect($(toolbarStart + "topic-unselected-ru").val()).to.equal("unselected-ru");
      expect($(toolbarStart + "topic-unselected-ru").next().text()).to.equal("──────────");
      expect($(toolbarStart + "topic-nouns").val()).to.equal("nouns");

      expect($(toolbarStart + "filter-menu").length).to.be.above(0);
      expect($(toolbarStart + "filter-no-filter").val()).to.equal("no-filter");
      expect($(toolbarStart + "filter-unselected").val()).to.equal("unselected");
      expect($(toolbarStart + "filter-unselected").next().text()).to.equal("──────────");

      const jsonData = fixture.load("fixtures/json/nouns.json", true);

      toolbar.topics = {nouns: jsonData};

      toolbar.checkForFilters("ru", "nouns");

      expect($(toolbarStart + "filter-all").val()).to.equal("all");
      expect($(toolbarStart + "filter-Sg").val()).to.equal("Sg");
      expect($(toolbarStart + "filter-Pl").val()).to.equal("Pl");

      expect($(toolbarStart + "activity-menu").length).to.be.above(0);
      expect($(toolbarStart + "activity-unselected").val()).to.equal("unselected");
      expect($(toolbarStart + "activity-splitter").text()).to.equal("──────────");
      expect($(toolbarStart + "activity-color").val()).to.equal("color");
      expect($(toolbarStart + "activity-click").val()).to.equal("click");
      expect($(toolbarStart + "activity-mc").val()).to.equal("mc");
      expect($(toolbarStart + "activity-cloze").val()).to.equal("cloze");

      expect($(toolbarStart + "enhance-button").length).to.be.above(0);
      expect($(toolbarStart + "restore-button").length).to.be.above(0);
      expect($(toolbarStart + "abort-button").length).to.be.above(0);
      expect($(toolbarStart + "loading-image").length).to.be.above(0);

      expect($(toolbarStart + "toggle-button").length).to.be.above(0);

      expect($(toolbarStart + "account-sign-in-button").length).to.be.above(0);
      expect($(toolbarStart + "account-menu-button").length).to.be.above(0);
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

      sinon.assert.calledTwice(chrome.runtime.sendMessage);
      sinon.assert.calledWith(chrome.runtime.sendMessage.getCall(0), {action: "sendTopics"});

      sinon.assert.calledOnce(initSpy);
      sinon.assert.calledWithExactly(initSpy, responseData.topics);
    });
  });

  describe("init", function() {
    it("should set the topics, initialize toolbar events and restore prior selections", function() {
      const initViewMenuBtnSpy = sandbox.spy(toolbar, "initViewMenuBtn");
      const initOnWindowClickSpy = sandbox.spy(toolbar, "initOnWindowClick");
      const initAutoEnhanceSpy = sandbox.spy(toolbar, "initAutoEnhance");
      const initLanguageMenuSpy = sandbox.spy(toolbar, "initLanguageMenu");
      const initTopicMenuSpy = sandbox.spy(toolbar, "initTopicMenu");
      const initActivitySelectorsSpy = sandbox.spy(toolbar, "initActivitySelectors");
      const initialInteractionStateSpy = sandbox.spy(toolbar, "initialInteractionState");
      const initEnhanceBtnSpy = sandbox.spy(toolbar, "initEnhanceBtn");
      const initAbortBtnSpy = sandbox.spy(toolbar, "initAbortBtn");
      const initRestoreBtnSpy = sandbox.spy(toolbar, "initRestoreBtn");
      const initSignInBtnSpy = sandbox.spy(toolbar, "initSignInBtn");
      const initAccountMenuBtnSpy = sandbox.spy(toolbar, "initAccountMenuBtn");
      const initToggleToolbarSpy = sandbox.spy(toolbar, "initToggleToolbarBtn");
      const restoreSelectionsSpy = sandbox.spy(toolbar, "restoreSelections");
      const requestToToggleToolbarSpy = sandbox.spy(toolbar, "requestToToggleToolbar");
      const topics = {topic: "some topic info"};

      expect(toolbar.topics).to.be.empty;

      toolbar.init(topics);

      expect(toolbar.topics).to.equal(topics);

      sinon.assert.calledOnce(initViewMenuBtnSpy);
      sinon.assert.calledOnce(initOnWindowClickSpy);
      sinon.assert.calledOnce(initAutoEnhanceSpy);
      sinon.assert.calledOnce(initLanguageMenuSpy);
      sinon.assert.calledOnce(initTopicMenuSpy);
      sinon.assert.calledOnce(initActivitySelectorsSpy);
      sinon.assert.calledOnce(initialInteractionStateSpy);
      sinon.assert.calledOnce(initEnhanceBtnSpy);
      sinon.assert.calledOnce(initAbortBtnSpy);
      sinon.assert.calledOnce(initRestoreBtnSpy);
      sinon.assert.calledOnce(initSignInBtnSpy);
      sinon.assert.calledOnce(initAccountMenuBtnSpy);
      sinon.assert.calledOnce(initToggleToolbarSpy);
      sinon.assert.calledOnce(restoreSelectionsSpy);
      sinon.assert.calledOnce(requestToToggleToolbarSpy);
    });

    describe("initViewMenuBtn", function() {
      it("should initialize the VIEW menu handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initViewMenuBtn();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, "#wertiview-VIEW-menu-btn");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call requestToToggleViewMenu() on click", function() {
        const requestToToggleMenuViewSpy = sandbox.spy(toolbar, "requestToToggleViewMenu");

        toolbar.initViewMenuBtn();

        $("#wertiview-VIEW-menu-btn").trigger("click");

        sinon.assert.calledOnce(requestToToggleMenuViewSpy);
      });

      it("should request to toggle the VIEW menu", function() {
        toolbar.requestToToggleViewMenu();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {action: "toggleVIEWMenu"});
      });
    });

    describe("initOnWindowClick", function() {
      it("should initialize the hide VIEW menu and statistics handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initOnWindowClick();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, window);

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call requestToHideViewMenu(), as the toolbar body was clicked", function() {
        const requestToHideViewMenuSpy = sandbox.spy(toolbar, "requestToHideViewMenu");

        toolbar.initOnWindowClick();

        // anything but the view menu button can be the trigger here
        $("body").trigger("click");

        sinon.assert.calledOnce(requestToHideViewMenuSpy);
      });

      it("should request to hide the VIEW menu", function() {
        toolbar.requestToHideViewMenu();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {action: "hideVIEWMenu"});
      });

      it("should not call requestToHideViewMenu(), as the view menu button was clicked", function() {
        const requestToHideViewMenuSpy = sandbox.spy(toolbar, "requestToHideViewMenu");

        toolbar.initOnWindowClick();

        $("#wertiview-VIEW-menu-btn").trigger("click");

        sinon.assert.notCalled(requestToHideViewMenuSpy);
      });

      it("should call requestToHideAccountMenu(), as the toolbar body was clicked", function() {
        const requestToHideAccountMenuSpy = sandbox.spy(toolbar, "requestToHideAccountMenu");

        toolbar.initOnWindowClick();

        // anything but the view menu button can be the trigger here
        $("body").trigger("click");

        sinon.assert.calledOnce(requestToHideAccountMenuSpy);
      });

      it("should request to hide the account menu", function() {
        toolbar.requestToHideAccountMenu();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {action: "hideAccountMenu"});
      });

      it("should not call requestToHideAccountMenu(), as the account menu button was clicked", function() {
        const requestToHideAccountMenuSpy = sandbox.spy(toolbar, "requestToHideAccountMenu");

        toolbar.initOnWindowClick();

        $(toolbarStart + "account-menu-button").trigger("click");

        sinon.assert.notCalled(requestToHideAccountMenuSpy);
      });

      it("should call requestToHideStatisticsMenu() in any case", function() {
        const requestToHideStatisticsMenuSpy = sandbox.spy(toolbar, "requestToHideStatisticsMenu");

        toolbar.initOnWindowClick();

        // anything but the view menu button can be the trigger here
        $("body").trigger("click");

        sinon.assert.calledOnce(requestToHideStatisticsMenuSpy);
      });

      it("should request to hide the statistics menu", function() {
        toolbar.requestToHideStatisticsMenu();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {action: "hideStatisticsMenu"});
      });

      it("should call requestToRemoveFeedbackDialog() in any case", function() {
        const requestToRemoveDialogSpy = sandbox.spy(toolbar, "requestToRemoveFeedbackDialog");

        toolbar.initOnWindowClick();

        $("body").trigger("click");

        sinon.assert.calledOnce(requestToRemoveDialogSpy);
      });

      it("should request to remove the feedback dialog", function() {
        toolbar.requestToRemoveFeedbackDialog();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {action: "removeFeedbackDialog"});
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

          $(toolbarStart + "enabled").trigger("click");

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
          $(toolbarStart + "enabled").show();
          $(toolbarStart + "disabled").hide();

          toolbar.turnOffAutoEnhance();

          expect($(toolbarStart + "enabled").is(":hidden")).to.be.true;
          expect($(toolbarStart + "disabled").is(":visible")).to.be.true;
        });
      });

      describe("turnOnAutoEnhanceAndSet", function() {
        it("should call turnOnAutoEnhanceAndSet() on click", function() {
          const turnOnAutoEnhanceAndSetSpy = sandbox.spy(toolbar, "turnOnAutoEnhanceAndSet");

          toolbar.initAutoEnhance();

          toolbar.$cache.get(toolbarStart + "disabled").trigger("click");

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

          expect($(toolbarStart + "disabled").is(":hidden")).to.be.true;
          expect($(toolbarStart + "enabled").is(":visible")).to.be.true;
        });
      });
    });
    describe("initLanguageMenu", function() {
      it("should initialize the language menu handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initLanguageMenu();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "language-menu");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "change");
      });

      it("should call selectTopicMenu(language) on language change", function() {
        const selectTopicMenuSpy = sandbox.spy(toolbar, "selectTopicMenu");
        const language = "en";

        toolbar.initLanguageMenu();

        $(toolbarStart + "language-menu").val(language).trigger("change");

        sinon.assert.calledOnce(selectTopicMenuSpy);
        sinon.assert.calledWithExactly(selectTopicMenuSpy, language);
      });

      describe("selectTopicMenu", function() {
        it("should un-select and hide the previous topic menu", function() {
          const selectedLanguage = "en";
          const previousLanguage = "ru";
          const previousTopicMenu = toolbarStart + "topic-menu-" + previousLanguage;
          const selectedTopicMenu = "selected-toolbar-topic-menu";

          $(previousTopicMenu).addClass(selectedTopicMenu);
          $(previousTopicMenu).show();

          toolbar.selectTopicMenu(selectedLanguage);

          expect($(previousTopicMenu).hasClass(selectedTopicMenu)).to.be.false;

          expect($(previousTopicMenu).is(":hidden")).to.be.true;
        });

        it("should show the selected topic menu", function() {
          const selectedLanguage = "en";
          const topicMenu = toolbarStart + "topic-menu-" + selectedLanguage;
          const topic = "articles";

          $(topicMenu).val(topic);

          toolbar.selectTopicMenu(selectedLanguage);

          expect($(topicMenu).hasClass("selected-toolbar-topic-menu")).to.be.true;

          expect($(topicMenu).is(":visible")).to.be.true;
        });

        it("should call checkForFilters(language, topic)", function() {
          const checkForFiltersSpy = sandbox.spy(toolbar, "checkForFilters");
          const selectedLanguage = "en";
          const topicMenu = toolbarStart + "topic-menu-" + selectedLanguage;
          const topic = "articles";

          $(topicMenu).val(topic);

          toolbar.selectTopicMenu(selectedLanguage);

          sinon.assert.calledOnce(checkForFiltersSpy);
          sinon.assert.calledWithExactly(checkForFiltersSpy, selectedLanguage, topic);
        });

        describe("checkForFilters", function() {
          it("should hide the filter menu", function() {
            $(toolbarStart + "filter-menu").show();

            toolbar.checkForFilters("ru", "nouns");

            expect($(toolbarStart + "filter-menu").is(":hidden")).to.be.true;
          });

          it("should select the 'no-filter' option", function() {
            $(toolbarStart + "filter-menu").val("unselected");

            toolbar.checkForFilters("ru", "nouns");

            expect($(toolbarStart + "filter-menu").val()).to.equal("no-filter");
          });

          it("should remove all options followed after the horizontal line", function() {
            const jsonData = fixture.load("fixtures/json/nouns.json", true);

            toolbar.topics = {nouns: jsonData};

            toolbar.checkForFilters("ru", "nouns");

            // noun filter options do exist
            expect($(toolbarStart + "filter-unselected").next().next().length).to.be.above(0);

            toolbar.checkForFilters("en", "articles");

            // articles filter options do not exist, previous filter options were removed
            expect($(toolbarStart + "filter-unselected").next().next().length).to.equal(0);
          });

          it("should call showFilterMenu(filters), as filters exist for the topic", function() {
            const showFilterMenuSpy = sandbox.spy(toolbar, "showFilterMenu");
            const jsonData = fixture.load("fixtures/json/nouns.json", true);

            toolbar.topics = {nouns: jsonData};

            const language = "ru";
            const topic = "nouns";
            const filters = toolbar.topics[topic][language].filters;

            toolbar.checkForFilters(language, topic);

            sinon.assert.calledOnce(showFilterMenuSpy);
            sinon.assert.calledWithExactly(showFilterMenuSpy, filters);
          });

          describe("showFilterMenu", function() {
            it("should select the option 'unselected", function() {
              const jsonData = fixture.load("fixtures/json/nouns.json", true);

              const filters = jsonData.ru.filters;

              $(toolbarStart + "filter-menu").val("no-filter");

              toolbar.showFilterMenu(filters);

              expect($(toolbarStart + "filter-menu").val()).to.equal("unselected");
            });

            it("should call addFilterOptions(filters, $FilterMenu)", function() {
              const addFilterOptionsSpy = sandbox.spy(toolbar, "addFilterOptions");
              const jsonData = fixture.load("fixtures/json/nouns.json", true);

              const filters = jsonData.ru.filters;

              toolbar.showFilterMenu(filters);

              sinon.assert.calledOnce(addFilterOptionsSpy);
              sinon.assert.calledWithExactly(addFilterOptionsSpy,
                filters,
                $(toolbarStart + "filter-menu")
              );
            });

            it("should have options with filter specific data", function() {
              const jsonData = fixture.load("fixtures/json/nouns.json", true);

              const filters = jsonData.ru.filters;
              const $FilterMenu = $(toolbarStart + "filter-menu");

              toolbar.addFilterOptions(filters, $FilterMenu);

              $.each(filters, function(filter) {
                const filterObject = filters[filter];
                const $FilterOption = $("#" + filterObject.id);

                expect($FilterOption.attr("id")).to.equal(filterObject.id);
                expect($FilterOption.val()).to.equal(filterObject.val);
                expect($FilterOption.text()).to.equal(filterObject.text);
              });
            });

            it("should show the filter menu", function() {
              const jsonData = fixture.load("fixtures/json/nouns.json", true);

              const filters = jsonData.ru.filters;

              toolbar.showFilterMenu(filters);

              expect($(toolbarStart + "filter-menu").is(":visible")).to.be.true;
            });
          });

          it("should not call showFilterMenu(filters), as no filters exist for the topic", function() {
            const showFilterMenuSpy = sandbox.spy(toolbar, "showFilterMenu");
            const jsonData = fixture.load("fixtures/json/articles.json", true);

            toolbar.topics = {articles: jsonData};

            const language = "en";
            const topic = "articles";

            toolbar.checkForFilters(language, topic);

            sinon.assert.notCalled(showFilterMenuSpy);
          });

          it("should not call showFilterMenu(filters), as there is no json data for the topic", function() {
            const showFilterMenuSpy = sandbox.spy(toolbar, "showFilterMenu");
            const jsonData = fixture.load("fixtures/json/articles.json", true);

            toolbar.topics = {articles: jsonData};

            const language = "en";
            const topic = "unknown topic";

            toolbar.checkForFilters(language, topic);

            sinon.assert.notCalled(showFilterMenuSpy);
          });

          it("should not call showFilterMenu(filters), as there is no json data for the topic-language combination", function() {
            const showFilterMenuSpy = sandbox.spy(toolbar, "showFilterMenu");
            const jsonData = fixture.load("fixtures/json/articles.json", true);

            toolbar.topics = {articles: jsonData};

            const language = "unknown language";
            const topic = "articles";

            toolbar.checkForFilters(language, topic);

            sinon.assert.notCalled(showFilterMenuSpy);
          });
        });

        it("should call updateActivities(language, topic)", function() {
          const updateActivitiesSpy = sandbox.spy(toolbar, "updateActivities");
          const selectedLanguage = "en";
          const topicMenu = toolbarStart + "topic-menu-" + selectedLanguage;
          const topic = "articles";

          $(topicMenu).val(topic);

          toolbar.selectTopicMenu(selectedLanguage);

          sinon.assert.calledOnce(updateActivitiesSpy);
          sinon.assert.calledWithExactly(updateActivitiesSpy, selectedLanguage, topic);
        });
      });

      describe("updateActivities", function() {
        it("should remove all activity options", function() {
          const language = "unselected";
          const topic = "unselected";

          expect($(toolbarStart + "activity-menu").find("option").length).to.be.above(0);

          toolbar.updateActivities(language, topic);

          expect($(toolbarStart + "activity-menu").find("option").length).to.equal(0);
        });

        it("should append the activity \"unselected\"", function() {
          const language = "unselected";
          const topic = "unselected";

          toolbar.initActivitySelectors();

          toolbar.updateActivities(language, topic);

          expect($(toolbarStart + "activity-unselected").length).to.be.above(0);
        });

        it("should not call enableAndShowActivities(language, topic), as the language is \"unselected\"", function() {
          const enableAndShowActivitiesSpy = sandbox.spy(toolbar, "enableAndShowActivities");
          const language = "unselected";
          const topic = "unselected";

          toolbar.initActivitySelectors();

          toolbar.updateActivities(language, topic);

          sinon.assert.notCalled(enableAndShowActivitiesSpy);
        });

        it("should not call enableAndShowActivities(language, topic), as the topic starts with \"unselected\"", function() {
          const enableAndShowActivitiesSpy = sandbox.spy(toolbar, "enableAndShowActivities");
          const language = "en";
          const topic = "unselected-en";

          toolbar.initActivitySelectors();

          toolbar.updateActivities(language, topic);

          sinon.assert.notCalled(enableAndShowActivitiesSpy);
        });

        it("should not call enableAndShowActivities(language, topic), as the topic json objects don't have the language", function() {
          const jsonData = fixture.load("fixtures/json/articles.json", true);
          const enableAndShowActivitiesSpy = sandbox.spy(toolbar, "enableAndShowActivities");
          const language = "unknownLanguage";
          const topic = "articles";

          toolbar.topics = {articles: jsonData};

          toolbar.initActivitySelectors();

          toolbar.updateActivities(language, topic);

          sinon.assert.notCalled(enableAndShowActivitiesSpy);
        });

        it("should not call enableAndShowActivities(language, topic), as the topic json objects don't have the topic", function() {
          const jsonData = fixture.load("fixtures/json/articles.json", true);
          const enableAndShowActivitiesSpy = sandbox.spy(toolbar, "enableAndShowActivities");
          const language = "en";
          const topic = "unknownTopic";

          toolbar.topics = {articles: jsonData};

          toolbar.initActivitySelectors();

          toolbar.updateActivities(language, topic);

          sinon.assert.notCalled(enableAndShowActivitiesSpy);
        });

        it("should call enableAndShowActivities(language, topic)", function() {
          const jsonData = fixture.load("fixtures/json/articles.json", true);

          const enableAndShowActivitiesSpy = sandbox.spy(toolbar, "enableAndShowActivities");
          const language = "en";
          const topic = "articles";

          toolbar.topics = {articles: jsonData};

          toolbar.initActivitySelectors();

          toolbar.updateActivities(language, topic);

          sinon.assert.calledOnce(enableAndShowActivitiesSpy);
          sinon.assert.calledWithExactly(enableAndShowActivitiesSpy,
            language,
            topic
          );
        });

        describe("enableAndShowActivities", function() {
          it("should append the splitter option", function() {
            const jsonData = fixture.load("fixtures/json/articles.json", true);
            const language = "en";
            const topic = "articles";

            toolbar.topics = {articles: jsonData};

            toolbar.initActivitySelectors();

            toolbar.updateActivities(language, topic);

            expect($(toolbarStart + "activity-splitter").length).to.be.above(0);
          });

          it("should have all activity options available for this topic", function() {
            const jsonData = fixture.load("fixtures/json/articles.json", true);
            const language = "en";
            const topic = "articles";

            toolbar.topics = {articles: jsonData};

            toolbar.initActivitySelectors();

            toolbar.updateActivities(language, topic);

            const availableActivities = toolbar.topics[topic][language].activities;

            $.each(availableActivities, function(activity) {
              expect($(toolbarStart + "activity-" + activity).length).to.be.above(0);
            });
          });

          it("should select the option 'unselected'", function() {
            const jsonData = fixture.load("fixtures/json/articles.json", true);
            const language = "en";
            const topic = "articles";

            toolbar.topics = {articles: jsonData};

            $(toolbarStart + "activity-menu").val("color");

            toolbar.initActivitySelectors();

            toolbar.updateActivities(language, topic);

            expect($(toolbarStart + "activity-menu").val()).to.equal("unselected");
          });
        });

        it("should call toggleEnhanceButton()", function() {
          const toggleEnhanceButtonSpy = sandbox.spy(toolbar, "toggleEnhanceButton");
          const language = "en";
          const topic = "articles";

          toolbar.updateActivities(language, topic);

          sinon.assert.calledOnce(toggleEnhanceButtonSpy);
        });

        describe("toggleEnhanceButton", function() {
          it("should disable the enhance button, as the filter option was 'unselected'", function() {
            $(toolbarStart + "filter-menu").val("unselected");

            toolbar.toggleEnhanceButton();

            expect($(toolbarStart + "enhance-button").is(":disabled")).to.be.true;
          });

          it("should disable the enhance button, as the activity option was 'unselected'", function() {
            $(toolbarStart + "activity-menu").val("unselected");

            $(toolbarStart + "enhance-button").show();

            toolbar.toggleEnhanceButton();

            expect($(toolbarStart + "enhance-button").is(":disabled")).to.be.true;
          });

          it("should enable the enhance button, as the filter and activity option are not 'unselected'", function() {
            $(toolbarStart + "filter-menu").val("Pl");
            $(toolbarStart + "activity-menu").val("color");
            $(toolbarStart + "enhance-button").hide();

            toolbar.toggleEnhanceButton();

            expect($(toolbarStart + "enhance-button").is(":disabled")).to.be.false;
          });
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
          toolbarStart + "topic-menu-unselected, " +
          toolbarStart + "topic-menu-en, " +
          toolbarStart + "topic-menu-de, " +
          toolbarStart + "topic-menu-es, " +
          toolbarStart + "topic-menu-ru");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "change");
      });

      it("should call checkForFilters(language, topic) on topic change", function() {
        const checkForFiltersSpy = sandbox.spy(toolbar, "checkForFilters");
        const language = "en";
        const topic = "articles";

        toolbar.initTopicMenu();

        $(toolbarStart + "language-menu").val(language);

        $(toolbarStart + "topic-menu-" + language).val(topic).trigger("change");

        sinon.assert.calledOnce(checkForFiltersSpy);
        sinon.assert.calledWithExactly(checkForFiltersSpy, language, topic);
      });

      // TODO: Should we do this for each topic menu?
      it("should call updateActivities(language, topic) on topic change", function() {
        const updateActivitiesSpy = sandbox.spy(toolbar, "updateActivities");
        const language = "en";
        const topic = "articles";

        toolbar.initTopicMenu();

        $(toolbarStart + "language-menu").val(language);

        $(toolbarStart + "topic-menu-" + language).val(topic).trigger("change");

        sinon.assert.calledOnce(updateActivitiesSpy);
        sinon.assert.calledWithExactly(updateActivitiesSpy, language, topic);
      });
    });

    describe("initFilterAndActivityMenu", function() {
      it("should initialize the activity menu handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initFilterAndActivityMenu();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy,
          toolbarStart + "filter-menu, " +
          toolbarStart + "activity-menu"
        );

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "change");
      });

      it("should call toggleEnhanceButton() on filter change", function() {
        const toggleEnhanceButtonSpy = sandbox.spy(toolbar, "toggleEnhanceButton");
        const language = "ru";
        const topic = "nouns";
        const filter = "Sg";

        toolbar.initFilterAndActivityMenu();

        $(toolbarStart + "language-menu").val(language);

        $(toolbarStart + "topic-menu-" + language).val(topic);

        $(toolbarStart + "filter-menu").val(filter).trigger("change");

        sinon.assert.calledOnce(toggleEnhanceButtonSpy);
      });

      it("should call toggleEnhanceButton() on activity change", function() {
        const toggleEnhanceButtonSpy = sandbox.spy(toolbar, "toggleEnhanceButton");
        const language = "ru";
        const topic = "nouns";
        const filter = "Sg";
        const activity = "color";

        toolbar.initFilterAndActivityMenu();

        $(toolbarStart + "language-menu").val(language);

        $(toolbarStart + "topic-menu-" + language).val(topic);

        $(toolbarStart + "filter-menu").val(filter);

        $(toolbarStart + "activity-menu").val(activity).trigger("change");

        sinon.assert.calledOnce(toggleEnhanceButtonSpy);
      });
    });

    describe("initActivitySelectors", function() {
      it("should fill the activity selectors", function() {
        expect(toolbar.activitySelectors).to.be.empty;

        const activitySelectors = {};

        $(toolbarStart + "activity-menu").find("option").each(function() {
          activitySelectors[$(this).val()] = $(this);
        });

        toolbar.initActivitySelectors();

        expect(toolbar.activitySelectors).to.eql(activitySelectors);
      });
    });

    describe("initialInteractionState", function() {
      it("should put the toolbar into the initial interaction state", function() {
        $(toolbarStart + "enhance-button").hide();
        $(toolbarStart + "restore-button").show();
        $(toolbarStart + "abort-button").show();
        $(toolbarStart + "loading-image").show();

        toolbar.initialInteractionState();

        expect($(toolbarStart + "enhance-button").is(":visible")).to.be.true;
        expect($(toolbarStart + "restore-button").is(":hidden")).to.be.true;
        expect($(toolbarStart + "abort-button").is(":hidden")).to.be.true;
        expect($(toolbarStart + "loading-image").is(":hidden")).to.be.true;
      });
    });

    describe("initEnhanceBtn", function() {
      it("should initialize the enhancement button handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initEnhanceBtn();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "enhance-button");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call setSelectionsAndPrepareToEnhance() on click", function() {
        const setSelectionsAndPrepareToEnhanceSpy = sandbox.spy(toolbar, "setSelectionsAndPrepareToEnhance");

        toolbar.initEnhanceBtn();

        $(toolbarStart + "enhance-button").trigger("click");

        sinon.assert.calledOnce(setSelectionsAndPrepareToEnhanceSpy);
      });

      describe("setSelectionsAndPrepareToEnhance", function() {
        it("should set language, topic, filter, activity, timestamp and call prepareToEnhance()", function() {
          const prepareToEnhanceSpy = sandbox.spy(toolbar, "prepareToEnhance");
          const dateNowSpy = sandbox.spy(Date, "now");

          const language = "ru";
          const topic = "nouns";
          const filter = "Sg";
          const activity = "color";

          const jsonData = fixture.load("fixtures/json/nouns.json", true);

          toolbar.topics = {nouns: jsonData};

          toolbar.checkForFilters(language, topic);

          chrome.storage.local.set.yields(); // make set synchronous

          $(toolbarStart + "language-menu").val(language);

          $(toolbarStart + "topic-menu-" + language)
          .addClass("selected-toolbar-topic-menu")
          .val(topic);

          $(toolbarStart + "filter-menu").val(filter);

          $(toolbarStart + "activity-menu").val(activity);

          toolbar.setSelectionsAndPrepareToEnhance();

          sinon.assert.calledOnce(dateNowSpy);

          const timestamp = dateNowSpy.firstCall.returnValue;

          sinon.assert.calledOnce(chrome.storage.local.set);
          sinon.assert.calledWith(chrome.storage.local.set, {
            language,
            topic,
            filter,
            activity,
            timestamp
          });

          sinon.assert.calledOnce(prepareToEnhanceSpy);
        });

        it("should prepare and request to call startToEnhance()", function() {
          $(toolbarStart + "enhance-button").show();
          $(toolbarStart + "restore-button").show();
          $(toolbarStart + "loading-image").hide();

          toolbar.prepareToEnhance();

          expect($(toolbarStart + "enhance-button").is(":hidden")).to.be.true;
          expect($(toolbarStart + "restore-button").is(":hidden")).to.be.true;
          expect($(toolbarStart + "loading-image").is(":visible")).to.be.true;

          sinon.assert.calledOnce(chrome.runtime.sendMessage);
          sinon.assert.calledWith(chrome.runtime.sendMessage, {action: "callStartToEnhance"});
        });
      });
    });

    describe("initAbortBtn", function() {
      it("should initialize the abort button handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initAbortBtn();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "abort-button");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call requestToCallAbort() on click", function() {
        const requestToCallAbortSpy = sandbox.spy(toolbar, "requestToCallAbort");

        toolbar.initAbortBtn();

        $(toolbarStart + "abort-button").trigger("click");

        sinon.assert.calledOnce(requestToCallAbortSpy);
      });

      it("should request to call abort()", function() {
        toolbar.requestToCallAbort();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {action: "callAbort"});
      });
    });

    describe("initRestoreBtn", function() {
      it("should initialize the restore button handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initRestoreBtn();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "restore-button");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call requestToCallRestoreToOriginal() on click", function() {
        const requestToCallRestoreToOriginalSpy = sandbox.spy(toolbar, "requestToCallRestoreToOriginal");

        toolbar.initRestoreBtn();

        $(toolbarStart + "restore-button").trigger("click");

        sinon.assert.calledOnce(requestToCallRestoreToOriginalSpy);
      });

      it("should request to call restoreToOriginal()", function() {
        toolbar.requestToCallRestoreToOriginal();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {action: "callRestoreToOriginal"});
      });
    });

    describe("initSignInBtn", function() {
      it("should initialize the sign in btn handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initSignInBtn();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "account-sign-in-button");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call openSignInWindow() on click", function() {
        const openSignInWindowSpy = sandbox.spy(toolbar, "openSignInWindow");

        toolbar.initSignInBtn();

        $(toolbarStart + "account-sign-in-button").trigger("click");

        sinon.assert.calledOnce(openSignInWindowSpy);
      });

      it("should open the sign in window", function() {
        const windowOpenSpy = sandbox.spy(window, "open");

        toolbar.initSignInBtn();

        toolbar.openSignInWindow();

        sinon.assert.calledOnce(windowOpenSpy);
        sinon.assert.calledWithExactly(windowOpenSpy,
          "",
          "",
          "width=985,height=735"
        );
      });

      it("should get the expected values", function() {
        toolbar.initSignInBtn();

        toolbar.openSignInWindow();

        sinon.assert.calledOnce(chrome.storage.local.get);
        sinon.assert.calledWith(chrome.storage.local.get, "authenticator");
      });

      it("should call assignHrefAndFocus(myWindow, authenticatorLink)", function() {
        const windowOpenSpy = sandbox.spy(window, "open");
        const assignHrefAndFocusSpy = sandbox.spy(toolbar, "assignHrefAndFocus");

        const authenticator = globalServerURL + "/authenticator.html";

        chrome.storage.local.get.yields({authenticator});

        toolbar.initSignInBtn();

        toolbar.openSignInWindow();

        const signInWindow = windowOpenSpy.getCall(0).returnValue;

        sinon.assert.calledOnce(assignHrefAndFocusSpy);
        sinon.assert.calledWith(assignHrefAndFocusSpy,
          signInWindow,
          authenticator + "?action=sign-in"
        );
      });

      it("should call focus()", function() {
        const signInWindow = window.open("", "", "width=985,height=735");
        const authenticator = globalServerURL +
          "/authenticator.html"  +
          "?action=sign-in";

        const focusSpy = sandbox.spy(signInWindow, "focus");

        toolbar.assignHrefAndFocus(signInWindow, authenticator);

        sinon.assert.calledOnce(focusSpy);
      });
    });

    describe("initAccountMenuBtn", function() {
      it("should initialize the account menu button handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initAccountMenuBtn();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "account-menu-button");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call requestToToggleAccountMenu() on click", function() {
        const requestToToggleAccountMenuSpy = sandbox.spy(toolbar, "requestToToggleAccountMenu");

        toolbar.initAccountMenuBtn();

        $(toolbarStart + "account-menu-button").trigger("click");

        sinon.assert.calledOnce(requestToToggleAccountMenuSpy);
      });

      it("should request to call requestToToggleToolbar()", function() {
        toolbar.requestToToggleAccountMenu();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {action: "toggleAccountMenu"});
      });
    });

    describe("initToggleToolbarBtn", function() {
      it("should initialize the toggle toolbar button handler", function() {
        const selectorSpy = sandbox.spy(toolbar.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        toolbar.initToggleToolbarBtn();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "toggle-button");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call requestToToggleToolbar() on click", function() {
        const requestToToggleToolbarSpy = sandbox.spy(toolbar, "requestToToggleToolbar");

        toolbar.initToggleToolbarBtn();

        $(toolbarStart + "toggle-button").trigger("click");

        sinon.assert.calledOnce(requestToToggleToolbarSpy);
      });

      it("should request to call requestToToggleToolbar()", function() {
        toolbar.requestToToggleToolbar();

        sinon.assert.calledOnce(chrome.runtime.sendMessage);
        sinon.assert.calledWith(chrome.runtime.sendMessage, {action: "toggleToolbar"});
      });
    });

    describe("restoreSelections", function() {
      it("should call all restoration functions with default values", function() {
        const restoreSelectionMenusSpy = sandbox.spy(toolbar, "restoreSelectionMenus");
        const toggleEnhanceButtonSpy = sandbox.spy(toolbar, "toggleEnhanceButton");
        const verifySignInStatusSpy = sandbox.spy(toolbar, "verifySignInStatus");
        const restoreAutoEnhanceSpy = sandbox.spy(toolbar, "restoreAutoEnhance");

        const language = "unselected";
        const topic = "unselected";
        const filter = "no-filter";
        const activity = "unselected";
        const user = "";
        const enabled = false;

        chrome.storage.local.get.yields({});

        toolbar.restoreSelections();

        sinon.assert.calledOnce(restoreSelectionMenusSpy);
        sinon.assert.calledWithExactly(restoreSelectionMenusSpy, language, topic, filter, activity);

        sinon.assert.called(toggleEnhanceButtonSpy);

        sinon.assert.calledOnce(verifySignInStatusSpy);
        sinon.assert.calledWithExactly(verifySignInStatusSpy, user);

        sinon.assert.calledOnce(restoreAutoEnhanceSpy);
        sinon.assert.calledWithExactly(restoreAutoEnhanceSpy, enabled);
      });

      it("should call all restoration functions with stored values", function() {
        const restoreSelectionMenusSpy = sandbox.spy(toolbar, "restoreSelectionMenus");
        const toggleEnhanceButtonSpy = sandbox.spy(toolbar, "toggleEnhanceButton");
        const verifySignInStatusSpy = sandbox.spy(toolbar, "verifySignInStatus");
        const restoreAutoEnhanceSpy = sandbox.spy(toolbar, "restoreAutoEnhance");

        const language = "ru";
        const topic = "nouns";
        const filter = "Sg";
        const activity = "color";
        const user = "user";
        const enabled = true;

        chrome.storage.local.get.yields({
          language,
          topic,
          filter,
          activity,
          user,
          enabled
        });

        const jsonData = fixture.load("fixtures/json/nouns.json", true);

        toolbar.topics = {nouns: jsonData};

        toolbar.initActivitySelectors();

        toolbar.restoreSelections();

        sinon.assert.calledOnce(restoreSelectionMenusSpy);
        sinon.assert.calledWithExactly(restoreSelectionMenusSpy, language, topic, filter, activity);

        sinon.assert.called(toggleEnhanceButtonSpy);

        sinon.assert.calledOnce(verifySignInStatusSpy);
        sinon.assert.calledWithExactly(verifySignInStatusSpy, user);

        sinon.assert.calledOnce(restoreAutoEnhanceSpy);
        sinon.assert.calledWithExactly(restoreAutoEnhanceSpy, enabled);
      });

      describe("restoreSelectionMenus", function() {
        it("should call all restoration functions with stored values", function() {
          const selectTopicMenuSpy = sandbox.spy(toolbar, "selectTopicMenu");
          const language = "ru";
          const topic = "nouns";
          const filter = "Sg";
          const activity = "color";

          const jsonData = fixture.load("fixtures/json/nouns.json", true);

          toolbar.topics = {nouns: jsonData};

          toolbar.initActivitySelectors();

          toolbar.restoreSelectionMenus(language, topic, filter, activity);

          sinon.assert.calledOnce(selectTopicMenuSpy);
          sinon.assert.calledWithExactly(selectTopicMenuSpy, language);
        });

        it("should restore all usual selections of the selection menus", function() {
          const language = "ru";
          const topic = "nouns";
          const filter = "Sg";
          const activity = "color";
          const selected = "selected";

          const jsonData = fixture.load("fixtures/json/nouns.json", true);

          toolbar.topics = {nouns: jsonData};

          toolbar.initActivitySelectors();

          toolbar.restoreSelectionMenus(language, topic, filter, activity);

          expect($(toolbarStart + "language-" + language).prop(selected)).to.be.true;
          expect($(toolbarStart + "topic-" + topic).prop(selected)).to.be.true;
          expect($(toolbarStart + "filter-" + filter).prop(selected)).to.be.true;
          expect($(toolbarStart + "activity-" + activity).prop(selected)).to.be.true;
        });

        it("should restore the determiners special case", function() {
          const language = "en";
          const topic = "determiners";
          const filter = "no-filter";
          const activity = "color";

          toolbar.restoreSelectionMenus(language, topic, filter, activity);

          expect($(toolbarStart + "topic-" + topic + "-" + language).prop("selected")).to.be.true;
        });

        // TODO: can be activated as soon as the "Preps" topic is available
        // it("should restore the prepositions special case", function() {
        //           //
        //   const language = "en";
        //   const topic = "Preps";
        //   const filter = "no-filter";
        //   const activity = "color";
        //
        //   toolbar.restoreSelectionMenus(language, topic, activity);
        //
        //   expect($(toolbarStart + "topic-" + topic + "-" + language).prop("selected")).to.be.true;
        // });
      });

      describe("verifySignInStatus", function() {
        it("should call signOut() as the user email is empty", function() {
          const singOutSpy = sandbox.spy(toolbar, "signOut");

          const user = "";

          toolbar.verifySignInStatus(user);

          sinon.assert.calledOnce(singOutSpy);
        });

        it("should call signIn(userEmail) as the user email is not empty", function() {
          const signInSpy = sandbox.spy(toolbar, "signIn");
          const user = "user";

          toolbar.verifySignInStatus(user);

          sinon.assert.calledOnce(signInSpy);
          sinon.assert.calledWithExactly(signInSpy, user);
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

    it("should process the message 'show element'", function() {
      const request = {
        action: "showElement",
        selector: toolbarStart + "restore-button"
      };

      chrome.runtime.onMessage.trigger(request);

      expect($(request.selector).is(":visible")).to.be.true;
    });

    it("should process the message 'hide element'", function() {
      const request = {
        action: "hideElement",
        selector: toolbarStart + "restore-button"
      };

      $(request.selector).show();

      chrome.runtime.onMessage.trigger(request);

      expect($(request.selector).is(":hidden")).to.be.true;
    });

    describe("signIn", function() {
      it("should process the message 'call signIn'", function() {
        const signInSpy = sandbox.spy(toolbar, "signIn");

        const user = "user";

        const request = {
          action: "signIn",
          user
        };

        chrome.runtime.onMessage.trigger(request);

        sinon.assert.calledOnce(signInSpy);
        sinon.assert.calledWithExactly(signInSpy, user);
      });

      it("should hide the sign in button", function() {
        $(toolbarStart + "account-sign-in-button").show();

        toolbar.signIn("user");

        expect($(toolbarStart + "account-sign-in-button").is(":hidden")).to.be.true;
      });

      it("should fill the account button text with the first letter of the user", function() {
        const user = "user";

        toolbar.signIn(user);

        expect($(toolbarStart + "account-menu-button").text()).to.equal("u");
      });

      it("should show the account button", function() {
        $(toolbarStart + "account-menu-button").hide();

        toolbar.signIn("user");

        expect($(toolbarStart + "account-menu-button").is(":visible")).to.be.true;
      });
    });

    describe("signOut", function() {
      it("should process the message 'call signOut'", function() {
        const signOutSpy = sandbox.spy(toolbar, "signOut");

        const request = {action: "signOut"};

        chrome.runtime.onMessage.trigger(request);

        sinon.assert.calledOnce(signOutSpy);
      });

      it("should fill the account button text with the empty string", function() {
        toolbar.signOut();

        expect($(toolbarStart + "account-menu-button").text()).to.equal("");
      });

      it("should hide the account button", function() {
        $(toolbarStart + "account-menu-button").show();

        toolbar.signOut();

        expect($(toolbarStart + "account-menu-button").is(":hidden")).to.be.true;
      });

      it("should show the sign in button", function() {
        $(toolbarStart + "account-sign-in-button").hide();

        toolbar.signOut();

        expect($(toolbarStart + "account-sign-in-button").is(":visible")).to.be.true;
      });
    });
  });
});
