/**
 * Tests for the toolbar.js file of the VIEW add-on.
 *
 * Created by eduard on 31.12.16.
 */

"use strict";

describe("toolbar.js", function() {
  let sandbox;

  beforeEach(function() {
    unitTest.setViewDefaults();

    sandbox = sinon.sandbox.create();
    sandbox.stub($.fn, "load").yields();

    fixture.load("/fixtures/toolbar.html");

    view.toolbar.activitySelectors = {};
    view.toolbar.$cache = new Selector_Cache();

    const jsonDataNouns = fixture.load("fixtures/json/nouns.json", true);
    const jsonDataArticles = fixture.load("fixtures/json/articles.json", true);

    view.topics = {
      nouns: jsonDataNouns,
      articles: jsonDataArticles
    };
  });

  afterEach(function() {
    sandbox.restore();
    chrome.runtime.sendMessage.reset();
    chrome.storage.local.set.reset();
    chrome.storage.local.get.reset();
    chrome.runtime.getURL.reset();
    $("*").off();
    fixture.cleanup();
    $("#wertiview-toolbar-container").remove();
  });

  const toolbarStart = "#wertiview-toolbar-";
  const globalServerURL = "https://view.aleks.bg";

  describe("Selector_Cache", function() {
    it("should get the wanted jquery selector", function() {
      const selectorSpy = sandbox.spy(view.toolbar.$cache, "get");
      const getElementByIdSpy = sandbox.spy(document, "getElementById");
      const someSelector = "#someSelector";

      $("body").append("<div id='someSelector'>some text</div>");

      const $CachedObject = view.toolbar.$cache.get(someSelector);
      view.toolbar.$cache.get(someSelector);

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

      view.toolbar.checkForFilters("ru", "nouns");

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
      expect($(toolbarStart + "loading").length).to.be.above(0);

      expect($(toolbarStart + "toggle-button").length).to.be.above(0);

      expect($(toolbarStart + "account-sign-in-button").length).to.be.above(0);
      expect($(toolbarStart + "account-menu-button").length).to.be.above(0);

      view.toolbar.add();
      expect($("#wertiview-toolbar-container").length).to.be.above(0);
    });
  });

  describe("add", function() {
    it("should get the url for the toolbar", function() {
      sandbox.stub(view.toolbar, "init");
      sandbox.stub(view.VIEWmenu, "add");
      sandbox.stub(view.accountMenu, "add");
      sandbox.stub(view.statisticsMenu, "add");

      view.toolbar.add();

      sinon.assert.calledOnce(chrome.runtime.getURL);
      sinon.assert.calledWithExactly(chrome.runtime.getURL, "content_scripts/html/toolbar.html");
    });

    it("should call init()", function() {
      const initStub = sandbox.stub(view.toolbar, "init");

      view.toolbar.add();

      sinon.assert.calledOnce(initStub);
    });


    describe("init", function() {
      it("should set the topics, initialize toolbar events and restore prior selections", function() {
        const initViewMenuBtnStub = sandbox.stub(view.toolbar, "initViewMenuBtn");
        const initAutoEnhanceStub = sandbox.stub(view.toolbar, "initAutoEnhance");
        const initLanguageMenuStub = sandbox.stub(view.toolbar, "initLanguageMenu");
        const initTopicMenuStub = sandbox.stub(view.toolbar, "initTopicMenu");
        const initActivitySelectorsStub = sandbox.stub(view.toolbar, "initActivitySelectors");
        const initialInteractionStateStub = sandbox.stub(view.toolbar, "initialInteractionState");
        const initEnhanceBtnStub = sandbox.stub(view.toolbar, "initEnhanceBtn");
        const initAbortBtnStub = sandbox.stub(view.toolbar, "initAbortBtn");
        const initRestoreBtnStub = sandbox.stub(view.toolbar, "initRestoreBtn");
        const initLoadingImageStub = sandbox.stub(view.toolbar, "initLoadingImage");
        const initSignInBtnStub = sandbox.stub(view.toolbar, "initSignInBtn");
        const initAccountMenuBtnStub = sandbox.stub(view.toolbar, "initAccountMenuBtn");
        const initToggleToolbarStub = sandbox.stub(view.toolbar, "initToggleToolbarBtn");
        const restoreSelectionsStub = sandbox.stub(view.toolbar, "restoreSelections");
        const toggleStub = sandbox.stub(view.toolbar, "toggle");

        view.toolbar.init();

        sinon.assert.calledOnce(initViewMenuBtnStub);
        sinon.assert.calledOnce(initAutoEnhanceStub);
        sinon.assert.calledOnce(initLanguageMenuStub);
        sinon.assert.calledOnce(initTopicMenuStub);
        sinon.assert.calledOnce(initActivitySelectorsStub);
        sinon.assert.calledOnce(initialInteractionStateStub);
        sinon.assert.calledOnce(initEnhanceBtnStub);
        sinon.assert.calledOnce(initAbortBtnStub);
        sinon.assert.calledOnce(initRestoreBtnStub);
        sinon.assert.calledOnce(initLoadingImageStub);
        sinon.assert.calledOnce(initSignInBtnStub);
        sinon.assert.calledOnce(initAccountMenuBtnStub);
        sinon.assert.calledOnce(initToggleToolbarStub);
        sinon.assert.calledOnce(restoreSelectionsStub);
        sinon.assert.calledOnce(toggleStub);
      });

      describe("initViewMenuBtn", function() {
        it("should initialize the VIEW menu handler", function() {
          const selectorSpy = sandbox.spy(view.toolbar.$cache, "get");
          const eventSpy = sandbox.spy($.fn, "on");

          view.toolbar.initViewMenuBtn();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy, "#wertiview-VIEW-menu-btn");

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call view.VIEWmenu.toggle on click", function() {
          const toggleStub = sandbox.stub(view.VIEWmenu, "toggle");

          view.toolbar.initViewMenuBtn();

          $("#wertiview-VIEW-menu-btn").trigger("click");

          sinon.assert.calledOnce(toggleStub);
        });
      });

      describe("initAutoEnhance", function() {
        it("should initialize the auto enhance handler", function() {
          const selectorSpy = sandbox.spy(view.toolbar.$cache, "get");
          const eventSpy = sandbox.spy($.fn, "on");

          view.toolbar.initAutoEnhance();

          sinon.assert.calledTwice(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy.getCall(0), toolbarStart + "enabled");
          sinon.assert.calledWithExactly(selectorSpy.getCall(1), toolbarStart + "disabled");

          sinon.assert.calledTwice(eventSpy);
          sinon.assert.alwaysCalledWith(eventSpy, "click");
        });

        describe("turnOffAutoEnhanceAndSet", function() {
          it("should call turnOffAutoEnhanceAndSet() on click", function() {
            const turnOffAutoEnhanceAndSetStub = sandbox.stub(view.toolbar, "turnOffAutoEnhanceAndSet");

            view.toolbar.initAutoEnhance();

            $(toolbarStart + "enabled").trigger("click");

            sinon.assert.calledOnce(turnOffAutoEnhanceAndSetStub);
          });

          it("should call turn off auto enhance and set enabled to \"false\"", function() {
            const turnOffAutoEnhanceStub = sandbox.stub(view.toolbar, "turnOffAutoEnhance");

            view.toolbar.turnOffAutoEnhanceAndSet();

            sinon.assert.calledOnce(turnOffAutoEnhanceStub);

            sinon.assert.calledOnce(chrome.storage.local.set);
            sinon.assert.calledWithExactly(chrome.storage.local.set, {enabled: false});
          });

          it("should turn off auto enhance", function() {
            $(toolbarStart + "enabled").show();
            $(toolbarStart + "disabled").hide();

            view.toolbar.turnOffAutoEnhance();

            expect($(toolbarStart + "enabled").is(":hidden")).to.be.true;
            expect($(toolbarStart + "disabled").is(":visible")).to.be.true;
          });
        });

        describe("turnOnAutoEnhanceAndSet", function() {
          it("should call turnOnAutoEnhanceAndSet() on click", function() {
            const turnOnAutoEnhanceAndSetStub = sandbox.stub(view.toolbar, "turnOnAutoEnhanceAndSet");

            view.toolbar.initAutoEnhance();

            view.toolbar.$cache.get(toolbarStart + "disabled").trigger("click");

            sinon.assert.calledOnce(turnOnAutoEnhanceAndSetStub);
          });

          it("should call turn on auto enhance and set enabled to \"true\"", function() {
            const turnOnAutoEnhanceStub = sandbox.stub(view.toolbar, "turnOnAutoEnhance");

            view.toolbar.turnOnAutoEnhanceAndSet();

            sinon.assert.calledOnce(turnOnAutoEnhanceStub);

            sinon.assert.calledOnce(chrome.storage.local.set);
            sinon.assert.calledWithExactly(chrome.storage.local.set, {enabled: true});
          });

          it("should turn on auto enhance", function() {
            view.toolbar.turnOnAutoEnhance();

            expect($(toolbarStart + "disabled").is(":hidden")).to.be.true;
            expect($(toolbarStart + "enabled").is(":visible")).to.be.true;
          });
        });
      });
      describe("initLanguageMenu", function() {
        it("should initialize the language menu handler", function() {
          const selectorSpy = sandbox.spy(view.toolbar.$cache, "get");
          const eventSpy = sandbox.spy($.fn, "on");

          view.toolbar.initLanguageMenu();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "language-menu");

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "change");
        });

        it("should call selectTopicMenu(language) on language change", function() {
          const selectTopicMenuStub = sandbox.stub(view.toolbar, "selectTopicMenu");
          const language = "en";

          view.toolbar.initLanguageMenu();

          $(toolbarStart + "language-menu").val(language).trigger("change");

          sinon.assert.calledOnce(selectTopicMenuStub);
          sinon.assert.calledWithExactly(selectTopicMenuStub, language);
        });

        describe("selectTopicMenu", function() {
          it("should un-select and hide the previous topic menu", function() {
            const selectedLanguage = "en";
            const previousLanguage = "ru";
            const previousTopicMenu = toolbarStart + "topic-menu-" + previousLanguage;
            const selectedTopicMenu = "selected-toolbar-topic-menu";

            $(previousTopicMenu).addClass(selectedTopicMenu);
            $(previousTopicMenu).show();

            view.toolbar.selectTopicMenu(selectedLanguage);

            expect($(previousTopicMenu).hasClass(selectedTopicMenu)).to.be.false;

            expect($(previousTopicMenu).is(":hidden")).to.be.true;
          });

          it("should show the selected topic menu", function() {
            const selectedLanguage = "en";
            const topicMenu = toolbarStart + "topic-menu-" + selectedLanguage;
            const topic = "articles";

            $(topicMenu).val(topic);

            view.toolbar.selectTopicMenu(selectedLanguage);

            expect($(topicMenu).hasClass("selected-toolbar-topic-menu")).to.be.true;

            expect($(topicMenu).is(":visible")).to.be.true;
          });

          it("should call checkForFilters(language, topic)", function() {
            const checkForFiltersStub = sandbox.stub(view.toolbar, "checkForFilters");
            const selectedLanguage = "en";
            const topicMenu = toolbarStart + "topic-menu-" + selectedLanguage;
            const topic = "articles";

            $(topicMenu).val(topic);

            view.toolbar.selectTopicMenu(selectedLanguage);

            sinon.assert.calledOnce(checkForFiltersStub);
            sinon.assert.calledWithExactly(checkForFiltersStub, selectedLanguage, topic);
          });

          describe("checkForFilters", function() {
            it("should hide the filter menu", function() {
              sandbox.stub(view.toolbar, "showFilterMenu");

              $(toolbarStart + "filter-menu").show();

              view.toolbar.checkForFilters("ru", "nouns");

              expect($(toolbarStart + "filter-menu").is(":hidden")).to.be.true;
            });

            it("should select the 'no-filter' option", function() {
              sandbox.stub(view.toolbar, "showFilterMenu");

              $(toolbarStart + "filter-menu").val("unselected");

              view.toolbar.checkForFilters("ru", "nouns");

              expect($(toolbarStart + "filter-menu").val()).to.equal("no-filter");
            });

            it("should remove all options followed after the horizontal line", function() {
              view.toolbar.checkForFilters("ru", "nouns");

              // noun filter options do exist
              expect($(toolbarStart + "filter-unselected").next().next().length).to.be.above(0);

              view.toolbar.checkForFilters("en", "articles");

              // articles filter options do not exist, previous filter options were removed
              expect($(toolbarStart + "filter-unselected").next().next().length).to.equal(0);
            });

            it("should call showFilterMenu(filters), as filters exist for the topic", function() {
              const showFilterMenuStub = sandbox.stub(view.toolbar, "showFilterMenu");

              const language = "ru";
              const topic = "nouns";
              const filters = view.topics[topic][language].filters;

              view.toolbar.checkForFilters(language, topic);

              sinon.assert.calledOnce(showFilterMenuStub);
              sinon.assert.calledWithExactly(showFilterMenuStub, filters);
            });

            describe("showFilterMenu", function() {
              it("should select the option 'unselected", function() {
                const language = "ru";
                const topic = "nouns";
                const filters = view.topics[topic][language].filters;

                $(toolbarStart + "filter-menu").val("no-filter");

                view.toolbar.showFilterMenu(filters);

                expect($(toolbarStart + "filter-menu").val()).to.equal("unselected");
              });

              it("should call addFilterOptions(filters, $FilterMenu)", function() {
                const addFilterOptionsStub = sandbox.stub(view.toolbar, "addFilterOptions");
                const language = "ru";
                const topic = "nouns";
                const filters = view.topics[topic][language].filters;

                view.toolbar.showFilterMenu(filters);

                sinon.assert.calledOnce(addFilterOptionsStub);
                sinon.assert.calledWithExactly(addFilterOptionsStub,
                  filters,
                  $(toolbarStart + "filter-menu")
                );
              });

              it("should have options with filter specific data", function() {
                const language = "ru";
                const topic = "nouns";
                const filters = view.topics[topic][language].filters;
                const $FilterMenu = $(toolbarStart + "filter-menu");

                view.toolbar.addFilterOptions(filters, $FilterMenu);

                $.each(filters, function(filter) {
                  const filterObject = filters[filter];
                  const $FilterOption = $("#" + filterObject.id);

                  expect($FilterOption.attr("id")).to.equal(filterObject.id);
                  expect($FilterOption.val()).to.equal(filterObject.val);
                  expect($FilterOption.text()).to.equal(filterObject.text);
                });
              });

              it("should show the filter menu", function() {
                const language = "ru";
                const topic = "nouns";
                const filters = view.topics[topic][language].filters;

                view.toolbar.showFilterMenu(filters);

                expect($(toolbarStart + "filter-menu").is(":visible")).to.be.true;
              });
            });

            it("should not call showFilterMenu(filters), as no filters exist for the topic", function() {
              const showFilterMenuStub = sandbox.stub(view.toolbar, "showFilterMenu");

              const language = "en";
              const topic = "articles";

              view.toolbar.checkForFilters(language, topic);

              sinon.assert.notCalled(showFilterMenuStub);
            });

            it("should not call showFilterMenu(filters), as there is no json data for the topic", function() {
              const showFilterMenuStub = sandbox.stub(view.toolbar, "showFilterMenu");

              const language = "en";
              const topic = "unknown topic";

              view.toolbar.checkForFilters(language, topic);

              sinon.assert.notCalled(showFilterMenuStub);
            });

            it("should not call showFilterMenu(filters), as there is no json data for the topic-language combination", function() {
              const showFilterMenuStub = sandbox.stub(view.toolbar, "showFilterMenu");

              const language = "unknown language";
              const topic = "articles";

              view.toolbar.checkForFilters(language, topic);

              sinon.assert.notCalled(showFilterMenuStub);
            });
          });

          it("should call updateActivities(language, topic)", function() {
            const updateActivitiesStub = sandbox.stub(view.toolbar, "updateActivities");
            const selectedLanguage = "en";
            const topicMenu = toolbarStart + "topic-menu-" + selectedLanguage;
            const topic = "articles";

            $(topicMenu).val(topic);

            view.toolbar.selectTopicMenu(selectedLanguage);

            sinon.assert.calledOnce(updateActivitiesStub);
            sinon.assert.calledWithExactly(updateActivitiesStub, selectedLanguage, topic);
          });
        });

        describe("updateActivities", function() {
          it("should remove all activity options", function() {
            const language = "unselected";
            const topic = "unselected";

            expect($(toolbarStart + "activity-menu").find("option").length).to.be.above(0);

            view.toolbar.updateActivities(language, topic);

            expect($(toolbarStart + "activity-menu").find("option").length).to.equal(0);
          });

          it("should append the activity \"unselected\"", function() {
            const language = "unselected";
            const topic = "unselected";

            view.toolbar.initActivitySelectors();

            view.toolbar.updateActivities(language, topic);

            expect($(toolbarStart + "activity-unselected").length).to.be.above(0);
          });

          it("should not call enableAndShowActivities(language, topic), as the language is \"unselected\"", function() {
            const enableAndShowActivitiesStub = sandbox.stub(view.toolbar, "enableAndShowActivities");
            const language = "unselected";
            const topic = "unselected";

            view.toolbar.initActivitySelectors();

            view.toolbar.updateActivities(language, topic);

            sinon.assert.notCalled(enableAndShowActivitiesStub);
          });

          it("should not call enableAndShowActivities(language, topic), as the topic starts with \"unselected\"", function() {
            const enableAndShowActivitiesStub = sandbox.stub(view.toolbar, "enableAndShowActivities");
            const language = "en";
            const topic = "unselected-en";

            view.toolbar.initActivitySelectors();

            view.toolbar.updateActivities(language, topic);

            sinon.assert.notCalled(enableAndShowActivitiesStub);
          });

          it("should not call enableAndShowActivities(language, topic), as the topic json objects don't have the language", function() {
            const enableAndShowActivitiesStub = sandbox.stub(view.toolbar, "enableAndShowActivities");
            const language = "unknownLanguage";
            const topic = "articles";

            view.toolbar.initActivitySelectors();

            view.toolbar.updateActivities(language, topic);

            sinon.assert.notCalled(enableAndShowActivitiesStub);
          });

          it("should not call enableAndShowActivities(language, topic), as the topic json objects don't have the topic", function() {
            const enableAndShowActivitiesStub = sandbox.stub(view.toolbar, "enableAndShowActivities");
            const language = "en";
            const topic = "unknownTopic";


            view.toolbar.initActivitySelectors();

            view.toolbar.updateActivities(language, topic);

            sinon.assert.notCalled(enableAndShowActivitiesStub);
          });

          it("should call enableAndShowActivities(language, topic)", function() {
            const enableAndShowActivitiesStub = sandbox.stub(view.toolbar, "enableAndShowActivities");
            const language = "en";
            const topic = "articles";


            view.toolbar.initActivitySelectors();

            view.toolbar.updateActivities(language, topic);

            sinon.assert.calledOnce(enableAndShowActivitiesStub);
            sinon.assert.calledWithExactly(enableAndShowActivitiesStub,
              language,
              topic
            );
          });

          describe("enableAndShowActivities", function() {
            it("should append the splitter option", function() {
              const language = "en";
              const topic = "articles";

              view.toolbar.initActivitySelectors();

              view.toolbar.updateActivities(language, topic);

              expect($(toolbarStart + "activity-splitter").length).to.be.above(0);
            });

            it("should have all activity options available for this topic", function() {
              const language = "en";
              const topic = "articles";

              view.toolbar.initActivitySelectors();

              view.toolbar.updateActivities(language, topic);

              const availableActivities = view.topics[topic][language].activities;

              $.each(availableActivities, function(activity) {
                expect($(toolbarStart + "activity-" + activity).length).to.be.above(0);
              });
            });

            it("should select the option 'unselected'", function() {
              const language = "en";
              const topic = "articles";

              $(toolbarStart + "activity-menu").val("color");

              view.toolbar.initActivitySelectors();

              view.toolbar.updateActivities(language, topic);

              expect($(toolbarStart + "activity-menu").val()).to.equal("unselected");
            });
          });

          it("should call toggleEnhanceButton()", function() {
            const toggleEnhanceButtonStub = sandbox.stub(view.toolbar, "toggleEnhanceButton");
            const language = "en";
            const topic = "articles";

            view.toolbar.updateActivities(language, topic);

            sinon.assert.calledOnce(toggleEnhanceButtonStub);
          });

          describe("toggleEnhanceButton", function() {
            it("should disable the enhance button, as the filter option was 'unselected'", function() {
              $(toolbarStart + "filter-menu").val("unselected");

              view.toolbar.toggleEnhanceButton();

              expect($(toolbarStart + "enhance-button").is(":disabled")).to.be.true;
            });

            it("should disable the enhance button, as the activity option was 'unselected'", function() {
              $(toolbarStart + "activity-menu").val("unselected");

              $(toolbarStart + "enhance-button").show();

              view.toolbar.toggleEnhanceButton();

              expect($(toolbarStart + "enhance-button").is(":disabled")).to.be.true;
            });

            it("should enable the enhance button, as the filter and activity option are not 'unselected'", function() {
              $(toolbarStart + "filter-menu").val("Pl");
              $(toolbarStart + "activity-menu").val("color");
              $(toolbarStart + "enhance-button").hide();

              view.toolbar.toggleEnhanceButton();

              expect($(toolbarStart + "enhance-button").is(":disabled")).to.be.false;
            });
          });
        });
      });

      describe("initTopicMenu", function() {
        it("should initialize the topic menu handler", function() {
          const selectorSpy = sandbox.spy(view.toolbar.$cache, "get");
          const eventSpy = sandbox.spy($.fn, "on");

          view.toolbar.initTopicMenu();

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
          const checkForFiltersStub = sandbox.stub(view.toolbar, "checkForFilters");
          const language = "en";
          const topic = "articles";

          view.toolbar.initTopicMenu();

          $(toolbarStart + "language-menu").val(language);

          $(toolbarStart + "topic-menu-" + language).val(topic).trigger("change");

          sinon.assert.calledOnce(checkForFiltersStub);
          sinon.assert.calledWithExactly(checkForFiltersStub, language, topic);
        });

        // TODO: Should we do this for each topic menu?
        it("should call updateActivities(language, topic) on topic change", function() {
          const updateActivitiesStub = sandbox.stub(view.toolbar, "updateActivities");
          const language = "en";
          const topic = "articles";

          view.toolbar.initTopicMenu();

          $(toolbarStart + "language-menu").val(language);

          $(toolbarStart + "topic-menu-" + language).val(topic).trigger("change");

          sinon.assert.calledOnce(updateActivitiesStub);
          sinon.assert.calledWithExactly(updateActivitiesStub, language, topic);
        });
      });

      describe("initFilterAndActivityMenu", function() {
        it("should initialize the activity menu handler", function() {
          const selectorSpy = sandbox.spy(view.toolbar.$cache, "get");
          const eventSpy = sandbox.spy($.fn, "on");

          view.toolbar.initFilterAndActivityMenu();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy,
            toolbarStart + "filter-menu, " +
            toolbarStart + "activity-menu"
          );

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "change");
        });

        it("should call toggleEnhanceButton() on filter change", function() {
          const toggleEnhanceButtonStub = sandbox.stub(view.toolbar, "toggleEnhanceButton");
          const language = "ru";
          const topic = "nouns";
          const filter = "Sg";

          view.toolbar.initFilterAndActivityMenu();

          $(toolbarStart + "language-menu").val(language);

          $(toolbarStart + "topic-menu-" + language).val(topic);

          $(toolbarStart + "filter-menu").val(filter).trigger("change");

          sinon.assert.calledOnce(toggleEnhanceButtonStub);
        });

        it("should call toggleEnhanceButton() on activity change", function() {
          const toggleEnhanceButtonStub = sandbox.stub(view.toolbar, "toggleEnhanceButton");
          const language = "ru";
          const topic = "nouns";
          const filter = "Sg";
          const activity = "color";

          view.toolbar.initFilterAndActivityMenu();

          $(toolbarStart + "language-menu").val(language);

          $(toolbarStart + "topic-menu-" + language).val(topic);

          $(toolbarStart + "filter-menu").val(filter);

          $(toolbarStart + "activity-menu").val(activity).trigger("change");

          sinon.assert.calledOnce(toggleEnhanceButtonStub);
        });
      });

      describe("initActivitySelectors", function() {
        it("should fill the activity selectors", function() {
          expect(view.toolbar.activitySelectors).to.be.empty;

          const activitySelectors = {};

          $(toolbarStart + "activity-menu").find("option").each(function() {
            activitySelectors[$(this).val()] = $(this);
          });

          view.toolbar.initActivitySelectors();

          expect(view.toolbar.activitySelectors).to.eql(activitySelectors);
        });
      });

      describe("initialInteractionState", function() {
        it("should put the toolbar into the initial interaction state", function() {
          $(toolbarStart + "enhance-button").hide();
          $(toolbarStart + "restore-button").show();
          $(toolbarStart + "abort-button").show();
          $(toolbarStart + "loading").show();

          view.toolbar.initialInteractionState();

          expect($(toolbarStart + "enhance-button").is(":visible")).to.be.true;
          expect($(toolbarStart + "restore-button").is(":hidden")).to.be.true;
          expect($(toolbarStart + "abort-button").is(":hidden")).to.be.true;
          expect($(toolbarStart + "loading").is(":hidden")).to.be.true;
        });

        it("should call blur.remove()", function() {
          const removeStub = sandbox.stub(view.blur, "remove");

          view.toolbar.initialInteractionState();

          sinon.assert.calledOnce(removeStub);
        });
      });

      describe("initEnhanceBtn", function() {
        it("should initialize the enhancement button handler", function() {
          const selectorSpy = sandbox.spy(view.toolbar.$cache, "get");
          const eventSpy = sandbox.spy($.fn, "on");

          view.toolbar.initEnhanceBtn();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "enhance-button");

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call setSelectionsPrepareAndEnhance() on click", function() {
          const setSelectionsAndPrepareToEnhanceStub = sandbox.stub(view.toolbar, "setSelectionsPrepareAndEnhance");

          view.toolbar.initEnhanceBtn();

          $(toolbarStart + "enhance-button").trigger("click");

          sinon.assert.calledOnce(setSelectionsAndPrepareToEnhanceStub);
        });

        describe("setSelectionsPrepareAndEnhance", function() {
          it("should set language, topic, filter, activity, timestamp and call prepareAndEnhance()", function() {
            const prepareToEnhanceStub = sandbox.stub(view.toolbar, "prepareAndEnhance");
            const dateNowStub = sandbox.stub(Date, "now");

            const language = "ru";
            const topic = "nouns";
            const filter = "Sg";
            const activity = "color";

            view.toolbar.checkForFilters(language, topic);

            chrome.storage.local.set.yields(); // make set synchronous

            $(toolbarStart + "language-menu").val(language);

            $(toolbarStart + "topic-menu-" + language)
            .addClass("selected-toolbar-topic-menu")
            .val(topic);

            $(toolbarStart + "filter-menu").val(filter);

            $(toolbarStart + "activity-menu").val(activity);

            view.toolbar.setSelectionsPrepareAndEnhance();

            sinon.assert.calledOnce(dateNowStub);

            const timestamp = dateNowStub.firstCall.returnValue;

            sinon.assert.calledOnce(chrome.storage.local.set);
            sinon.assert.calledWith(chrome.storage.local.set, {
              language,
              topic,
              filter,
              activity,
              timestamp
            });

            sinon.assert.calledOnce(prepareToEnhanceStub);
          });

          it("should prepare and call enhance()", function() {
            const enhanceStub = sandbox.stub(view.enhancer, "enhance");

            $(toolbarStart + "enhance-button").show();
            $(toolbarStart + "restore-button").show();
            $(toolbarStart + "loading").hide();

            view.toolbar.prepareAndEnhance();

            expect($(toolbarStart + "enhance-button").is(":hidden")).to.be.true;
            expect($(toolbarStart + "restore-button").is(":hidden")).to.be.true;
            expect($(toolbarStart + "loading").is(":visible")).to.be.true;

            sinon.assert.calledOnce(enhanceStub);
          });
        });
      });

      describe("initAbortBtn", function() {
        it("should initialize the abort button handler", function() {
          const selectorSpy = sandbox.spy(view.toolbar.$cache, "get");
          const eventSpy = sandbox.spy($.fn, "on");

          view.toolbar.initAbortBtn();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "abort-button");

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call view.enhancer.abort() on click", function() {
          const abortStub = sandbox.stub(view.enhancer, "abort");

          view.toolbar.initAbortBtn();

          $(toolbarStart + "abort-button").trigger("click");

          sinon.assert.calledOnce(abortStub);
        });
      });

      describe("initRestoreBtn", function() {
        it("should initialize the restore button handler", function() {
          const selectorSpy = sandbox.spy(view.toolbar.$cache, "get");
          const eventSpy = sandbox.spy($.fn, "on");

          view.toolbar.initRestoreBtn();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "restore-button");

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call view.enhancer.restoreToOriginal() on click", function() {
          const restoreToOriginalStub = sandbox.stub(view.enhancer, "restoreToOriginal");

          view.toolbar.initRestoreBtn();

          $(toolbarStart + "restore-button").trigger("click");

          sinon.assert.calledOnce(restoreToOriginalStub);
        });
      });

      describe("initLoadingImage", function() {
        it("should get the correct url", function() {
          view.toolbar.initLoadingImage();

          sinon.assert.calledOnce(chrome.runtime.getURL);
          sinon.assert.calledWithExactly(chrome.runtime.getURL, "icons/loading.gif");
        });

        it("should find in the loading div an image", function() {
          view.toolbar.initLoadingImage();

          console.log(window.location.href);

          expect($(view.toolbar.selectorStart + "loading").find("img").length)
          .to.be.above(0);
        });
      });

      describe("initSignInBtn", function() {
        it("should initialize the sign in btn handler", function() {
          const selectorSpy = sandbox.spy(view.toolbar.$cache, "get");
          const eventSpy = sandbox.spy($.fn, "on");

          view.toolbar.initSignInBtn();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "account-sign-in-button");

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call openSignInWindow() on click", function() {
          const openSignInWindowStub = sandbox.stub(view.toolbar, "openSignInWindow");

          view.toolbar.initSignInBtn();

          $(toolbarStart + "account-sign-in-button").trigger("click");

          sinon.assert.calledOnce(openSignInWindowStub);
        });

        describe("openSignInWindow", function() {
          it("should open the sign in window", function() {
            const windowOpenSpy = sandbox.spy(window, "open");

            view.toolbar.openSignInWindow();

            sinon.assert.calledOnce(windowOpenSpy);
            sinon.assert.calledWithExactly(windowOpenSpy,
              "",
              "",
              "width=985,height=735"
            );
          });

          it("should call assignHrefAndFocus(myWindow, authenticatorLink)", function() {
            const windowOpenSpy = sandbox.spy(window, "open");
            const assignHrefAndFocusStub = sandbox.stub(view.toolbar, "assignHrefAndFocus");

            const authenticator = globalServerURL + "/authenticator.html";

            view.toolbar.openSignInWindow();

            const signInWindow = windowOpenSpy.getCall(0).returnValue;

            sinon.assert.calledOnce(assignHrefAndFocusStub);
            sinon.assert.calledWith(assignHrefAndFocusStub,
              signInWindow,
              authenticator + "?action=sign-in"
            );
          });

          it("should call focus()", function() {
            const signInWindow = window.open("", "", "width=985,height=735");
            const authenticator = globalServerURL +
              "/authenticator.html"  +
              "?action=sign-in";

            const focusStub = sandbox.stub(signInWindow, "focus");

            view.toolbar.assignHrefAndFocus(signInWindow, authenticator);

            sinon.assert.calledOnce(focusStub);
          });
        });
      });

      describe("initAccountMenuBtn", function() {
        it("should initialize the account menu button handler", function() {
          const selectorSpy = sandbox.spy(view.toolbar.$cache, "get");
          const eventSpy = sandbox.spy($.fn, "on");

          view.toolbar.initAccountMenuBtn();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "account-menu-button");

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call view.accountMenu.toggle() on click", function() {
          const accountMenuToggleStub = sandbox.stub(view.accountMenu, "toggle");

          view.toolbar.initAccountMenuBtn();

          $(toolbarStart + "account-menu-button").trigger("click");

          sinon.assert.calledOnce(accountMenuToggleStub);
        });
      });

      describe("initToggleToolbarBtn", function() {
        it("should initialize the toggle toolbar button handler", function() {
          const selectorSpy = sandbox.spy(view.toolbar.$cache, "get");
          const eventSpy = sandbox.spy($.fn, "on");

          view.toolbar.initToggleToolbarBtn();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy, toolbarStart + "toggle-button");

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call toggle() on click", function() {
          const toggleStub = sandbox.stub(view.toolbar, "toggle");

          view.toolbar.initToggleToolbarBtn();

          $(toolbarStart + "toggle-button").trigger("click");

          sinon.assert.calledOnce(toggleStub);
        });
      });

      describe("restoreSelections", function() {
        it("should call all restoration functions", function() {
          const restoreSelectionMenusStub = sandbox.stub(view.toolbar, "restoreSelectionMenus");
          const toggleEnhanceButtonStub = sandbox.stub(view.toolbar, "toggleEnhanceButton");
          const verifySignInStatusStub = sandbox.stub(view.toolbar, "verifySignInStatus");
          const restoreAutoEnhanceStub = sandbox.stub(view.toolbar, "restoreAutoEnhance");

          const language = "ru";
          const topic = "nouns";
          const filter = "Sg";
          const activity = "color";
          const user = "user";
          const enabled = true;

          unitTest.setViewItems({
            language,
            topic,
            filter,
            activity,
            user,
            enabled
          });

          view.toolbar.initActivitySelectors();

          view.toolbar.restoreSelections();

          sinon.assert.calledOnce(restoreSelectionMenusStub);

          sinon.assert.called(toggleEnhanceButtonStub);

          sinon.assert.calledOnce(verifySignInStatusStub);

          sinon.assert.calledOnce(restoreAutoEnhanceStub);
        });

        describe("restoreSelectionMenus", function() {
          it("should call all restoration functions with stored values", function() {
            const selectTopicMenuStub = sandbox.stub(view.toolbar, "selectTopicMenu");
            const language = "ru";
            const topic = "nouns";
            const filter = "Sg";
            const activity = "color";

            unitTest.setViewItems({
              language,
              topic,
              filter,
              activity
            });

            view.toolbar.initActivitySelectors();

            view.toolbar.restoreSelectionMenus();

            sinon.assert.calledOnce(selectTopicMenuStub);
            sinon.assert.calledWithExactly(selectTopicMenuStub, language);
          });

          it("should restore all usual selections of the selection menus", function() {
            const language = "ru";
            const topic = "nouns";
            const filter = "Sg";
            const activity = "color";
            const selected = "selected";

            unitTest.setViewItems({
              language,
              topic,
              filter,
              activity
            });

            view.toolbar.initActivitySelectors();

            view.toolbar.restoreSelectionMenus();

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

            unitTest.setViewItems({
              language,
              topic,
              filter,
              activity
            });

            view.toolbar.restoreSelectionMenus();

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
          //   view.toolbar.restoreSelectionMenus(language, topic, activity);
          //
          //   expect($(toolbarStart + "topic-" + topic + "-" + language).prop("selected")).to.be.true;
          // });
        });

        describe("verifySignInStatus", function() {
          it("should call signOut() as the user email is empty", function() {
            const singOutStub = sandbox.stub(view.toolbar, "signOut");

            view.user = "";

            view.toolbar.verifySignInStatus();

            sinon.assert.calledOnce(singOutStub);
          });

          describe("signOut", function() {
            it("should fill the account button text with the empty string", function() {
              view.toolbar.signOut();

              expect($(toolbarStart + "account-menu-button").text()).to.equal("");
            });

            it("should hide the account button", function() {
              $(toolbarStart + "account-menu-button").show();

              view.toolbar.signOut();

              expect($(toolbarStart + "account-menu-button").is(":hidden")).to.be.true;
            });

            it("should show the sign in button", function() {
              $(toolbarStart + "account-sign-in-button").hide();

              view.toolbar.signOut();

              expect($(toolbarStart + "account-sign-in-button").is(":visible")).to.be.true;
            });
          });

          it("should call signIn(userEmail) as the user email is not empty", function() {
            const signInStub = sandbox.stub(view.toolbar, "signIn");

            const user = "user";
            view.user = user;

            view.toolbar.verifySignInStatus();

            sinon.assert.calledOnce(signInStub);
            sinon.assert.calledWithExactly(signInStub, user);
          });

          describe("signIn", function() {
            it("should hide the sign in button", function() {
              $(toolbarStart + "account-sign-in-button").show();

              view.toolbar.signIn("user");

              expect($(toolbarStart + "account-sign-in-button").is(":hidden")).to.be.true;
            });

            it("should fill the account button text with the first letter of the user", function() {
              const user = "user";

              view.toolbar.signIn(user);

              expect($(toolbarStart + "account-menu-button").text()).to.equal("u");
            });

            it("should show the account button", function() {
              $(toolbarStart + "account-menu-button").hide();

              view.toolbar.signIn("user");

              expect($(toolbarStart + "account-menu-button").is(":visible")).to.be.true;
            });
          });
        });

        describe("restoreAutoEnhance", function() {
          it("should call turnOnAutoEnhance() and call setSelectionsPrepareAndEnhance() as auto-enhance is enabled", function() {
            const turnOnAutoEnhanceStub = sandbox.stub(view.toolbar, "turnOnAutoEnhance");
            const setSelectionsAndPrepareToEnhanceStub = sandbox.stub(view.toolbar, "setSelectionsPrepareAndEnhance");

            view.enabled = true;

            view.toolbar.initEnhanceBtn();

            view.toolbar.restoreAutoEnhance();

            sinon.assert.calledOnce(turnOnAutoEnhanceStub);

            sinon.assert.calledOnce(setSelectionsAndPrepareToEnhanceStub);
          });

          it("should call turnOffAutoEnhance() as auto-enhance is disabled", function() {
            const turnOffAutoEnhanceStub = sandbox.stub(view.toolbar, "turnOffAutoEnhance");

            view.enabled = false;

            view.toolbar.restoreAutoEnhance();

            sinon.assert.calledOnce(turnOffAutoEnhanceStub);
          });
        });
      });
    });

    it("should move the script tag from the body to the head", function() {
      const $ScriptTag = $("<script>");

      $("body").append($ScriptTag);

      view.toolbar.add();

      expect($("head").find($ScriptTag).length).to.be.above(0);
    });

    it("should call view.container.add(selector)", function() {
      const addStub = sandbox.stub(view.container, "add");

      view.toolbar.add();

      sinon.assert.calledOnce(addStub);
      sinon.assert.calledWithExactly(addStub, $("body"));
    });

    it("should call view.VIEWmenu.add()", function() {
      const addStub = sandbox.stub(view.VIEWmenu, "add");

      view.toolbar.add();

      sinon.assert.calledOnce(addStub);
    });

    it("should call view.accountMenu.add()", function() {
      const addStub = sandbox.stub(view.accountMenu, "add");

      view.toolbar.add();

      sinon.assert.calledOnce(addStub);
    });

    it("should call view.statisticsMenu.add()", function() {
      const addStub = sandbox.stub(view.statisticsMenu, "add");

      view.toolbar.add();

      sinon.assert.calledOnce(addStub);
    });

    it("should call view.lib.initOnWindowClick()", function() {
      const initOnWindowClickStub = sandbox.stub(view.lib, "initOnWindowClick");

      view.toolbar.add();

      sinon.assert.calledOnce(initOnWindowClickStub);
    });

    it("should append the toolbar with correct id", function() {
      view.toolbar.add();

      expect($(toolbarStart + "container").length).to.be.above(0);
    });
  });

  describe("toggleOrAdd", function() {
    it("should call toggle(), as the toolbar already exists", function() {
      const toggleStub = sandbox.stub(view.toolbar, "toggle");

      view.toolbarExists = true;

      view.toolbar.toggleOrAdd();

      sinon.assert.calledOnce(toggleStub);
    });

    describe("toggle", function() {
      it("should toggle the view.toolbar, as it already exists", function() {
        const toggleStub = sandbox.stub($.fn, "toggle");

        $("body").append($("<div id='wertiview-toolbar-container'>"));

        view.toolbar.toggle();

        sinon.assert.called(toggleStub);
      });

      it("should call adjustMargin(), as the toolbar exists", function() {
        const adjustMarginStub = sandbox.stub(view.container, "adjustMargin");

        $("body").append($("<div id='wertiview-toolbar-container'>"));

        view.toolbar.toggle();

        sinon.assert.called(adjustMarginStub);
      });
    });

    it("should call setStorageItemsAndAddToolbar(), as the toolbar doesn't exists yet", function() {
      const setStorageItemsAndAddToolbarStub = sandbox.stub(view, "setStorageItemsAndAddToolbar");

      view.toolbarExists = false;

      view.toolbar.toggleOrAdd();

      sinon.assert.calledOnce(setStorageItemsAndAddToolbarStub);
    });
  });
});
