/**
 * Tests for the background.js file of the VIEW add-on.
 *
 * Created by eduard on 22.12.16.
 */

"use strict";

describe("background.js", function() {
  let sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();

    // reset calls to all chrome functions
    chrome.extension.getURL.reset();
    chrome.tabs.sendMessage.reset();
    chrome.storage.local.set.reset();
    chrome.notifications.create.reset();
    chrome.tabs.create.reset();
    chrome.runtime.openOptionsPage.reset();
    background.currentTabId = -1;
    background.clickCounter = 0;
    background.topics = {};
  });

  describe("browserAction", function() {
    it("should register one listener for browserAction onClicked", function() {
      sinon.assert.calledOnce(chrome.browserAction.onClicked.addListener);
    });

    it("should set topics when the button is clicked the first time", function(done) {
      const setTopicsSpy = sandbox.spy(background, "setTopics");

      chrome.browserAction.onClicked.trigger({id: 5});

      expect(background.clickCounter).to.equal(1);

      setTimeout(function() { // wait for asynchronous code to finish
        sinon.assert.calledOnce(setTopicsSpy);
        done();
      }, 0);
    });

    it("should send a message to toggle the toolbar without setting topics otherwise", function(done) {
      const toggleToolbarSpy = sandbox.spy(background, "toggleToolbar");

      chrome.browserAction.onClicked.trigger({id: 5});
      chrome.browserAction.onClicked.trigger({id: 5});

      expect(background.clickCounter).to.equal(2);

      setTimeout(function() { // wait for asynchronous code to finish (first trigger on setTopics)
        sinon.assert.calledOnce(toggleToolbarSpy);
        done();
      }, 0);
    });
  });

  describe("setTopics", function() {
    it("should call initTopics() and getAndSetTopicURLs()", function(done) {
      const initTopicsSpy = sandbox.spy(background, "initTopics");
      const getAndSetTopicURLsSpy = sandbox.spy(background, "getAndSetTopicURLs");

      background.setTopics();

      setTimeout(function() { // wait for asynchronous code to finish
        sinon.assert.calledOnce(initTopicsSpy);
        sinon.assert.calledOnce(getAndSetTopicURLsSpy);
        done();
      }, 0);
    });

    it("should init all topics", function() {
      expect(background.topics.en).to.not.exist;
      expect(background.topics.de).to.not.exist;

      background.initTopics();

      expect(Object.keys(background.topics.en).length).to.equal(2);
      expect(Object.keys(background.topics.de).length).to.equal(1);

      expect(background.topics.en.determiners).to.exist;
      expect(background.topics.en.articles).to.exist;
      expect(background.topics.de.determiners).to.exist;
    });

    it("should get and set all topic urls", function() {
      background.initTopics();
      background.getAndSetTopicURLs();

      sinon.assert.callCount(chrome.extension.getURL, 3);
      sinon.assert.calledWithExactly(chrome.extension.getURL.getCall(0), "topics/en/articles.json");
      sinon.assert.calledWithExactly(chrome.extension.getURL.getCall(1), "topics/en/determiners.json");
      sinon.assert.calledWithExactly(chrome.extension.getURL.getCall(2), "topics/de/determiners.json");
    });

    it("should call for all topic json objects, store activity data and proceed to set", function() {
      const getJSONStub = sandbox.stub($, "getJSON");
      const setAndToggleSpy = sandbox.spy(background, "proceedToSetAndToggleToolbar");

      const jsonData = {activities: "some json data"};

      getJSONStub.yields(jsonData);

      background.setTopics(); // stub on $.getJSON makes setTopics synchronous

      sinon.assert.callCount(getJSONStub, 3);

      expect(background.topics.en.articles).to.include(jsonData);

      sinon.assert.calledOnce(setAndToggleSpy);
    });

    it("should proceed to set topics and toggle the toolbar", function() {
      const jsonData = {
        activities: "some json data",
        url: "some url to json data"
      };

      chrome.storage.local.set.yields();

      background.initTopics();

      // fill with fake data
      background.topics.en.articles = jsonData;
      background.topics.en.determiners = jsonData;
      background.topics.de.determiners = jsonData;

      background.currentTabId = 5;

      background.proceedToSetAndToggleToolbar();

      sinon.assert.calledOnce(chrome.storage.local.set);
      sinon.assert.calledWithMatch(chrome.storage.local.set, {
        topics: {
          en: {
            articles: jsonData,
            determiners: jsonData
          },
          de: {determiners: jsonData}
        }
      });

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {msg: "toggle toolbar"});
    });

    it("should fail to get the topic json objects", function(done) {
      const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

      const id = "topics-not-loaded-notification";
      const title = "Topics not loaded!";
      const message = "There was a problem while loading the topics!";

      background.setTopics();

      setTimeout(function() { // wait for asynchronous code to finish
        sinon.assert.calledOnce(createBasicNotificationSpy);
        sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        done();
      }, 0);
    });
  });

  describe("createBasicNotification", function() {
    it("should create a basic notification", function() {
      const id = "some-unique-id";
      const title = "some title shown in notice header";
      const message = "some useful notice message";

      background.createBasicNotification(
        id,
        title,
        message
      );

      sinon.assert.calledOnce(chrome.notifications.create);
      sinon.assert.calledWithExactly(chrome.notifications.create,
        id, {
          "type": "basic",
          "title": title,
          "message": message
        }
      );
    });
  });

  describe("processMessage", function() {
    it("should register one listener for runtime onMessage", function() {
      sinon.assert.calledOnce(chrome.runtime.onMessage.addListener);
    });

    it("should process the message \"toggle toolbar\"", function() {
      const toggleToolbarSpy = sandbox.spy(background, "toggleToolbar");

      const request = {msg: "toggle toolbar"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(toggleToolbarSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message \"toggle Menu VIEW\"", function() {
      const toggleMenuVIEWSpy = sandbox.spy(background, "callToggleMenuVIEW");

      const request = {msg: "toggle Menu VIEW"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(toggleMenuVIEWSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message \"call startToEnhance\"", function() {
      const callStartToEnhanceSpy = sandbox.spy(background, "callStartToEnhance");

      const request = {msg: "call startToEnhance"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(callStartToEnhanceSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message \"show element\"", function() {
      const showHideElementSpy = sandbox.spy(background, "showHideElement");

      const request = {
        msg: "show element",
        selector: "some jquery selector"
      };
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(showHideElementSpy);
      sinon.assert.calledWithExactly(showHideElementSpy, request);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message \"hide element\"", function() {
      const showHideElementSpy = sandbox.spy(background, "showHideElement");

      const request = {
        msg: "hide element",
        selector: "some jquery selector"
      };
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(showHideElementSpy);
      sinon.assert.calledWithExactly(showHideElementSpy, request);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message \"call sendTopics\"", function() {
      const sendTopicsSpy = sandbox.spy(background, "sendTopics");

      const request = {msg: "call sendTopics"};
      const sender = {tab: {id: 5}};
      const sendResponse = sandbox.spy();

      const articlesData = {articles: "some articles data"};

      // fill with fake data
      background.topics = articlesData;

      chrome.runtime.onMessage.trigger(request, sender, sendResponse);

      sinon.assert.calledOnce(sendTopicsSpy);
      sinon.assert.calledWithExactly(sendTopicsSpy, sendResponse);

      sinon.assert.calledOnce(sendResponse);
      sinon.assert.calledWithExactly(sendResponse, {topics: articlesData});
    });

    it("should process the message \"call abort\"", function() {
      const callAbortSpy = sandbox.spy(background, "callAbort");

      const request = {msg: "call abort"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(callAbortSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message \"call restoreToOriginal\"", function() {
      const callRestoreToOriginalSpy = sandbox.spy(background, "callRestoreToOriginal");

      const request = {msg: "call restoreToOriginal"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(callRestoreToOriginalSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message \"redirect to link\"", function() {
      const redirectSpy = sandbox.spy(background, "redirect");

      const request = {
        msg: "redirect to link",
        link: "some link to redirect to"
      };
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(redirectSpy);
      sinon.assert.calledWithExactly(redirectSpy, request.link);

      sinon.assert.calledOnce(chrome.tabs.create);
      sinon.assert.calledWithExactly(chrome.tabs.create, {url: request.link});
    });

    it("should process the message \"open options page\"", function() {
      const openOptionsPageSpy = sandbox.spy(background, "openOptionsPage");

      const request = {msg: "open options page"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(openOptionsPageSpy);

      sinon.assert.calledOnce(chrome.runtime.openOptionsPage);
    });

    it("should process the message \"open help page\"", function() {
      const openHelpPageSpy = sandbox.spy(background, "openHelpPage");

      const request = {msg: "open help page"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(openHelpPageSpy);

      sinon.assert.calledOnce(chrome.tabs.create);
      sinon.assert.calledWithExactly(chrome.tabs.create,
        {url: "http://sifnos.sfs.uni-tuebingen.de/VIEW/index.jsp?content=activities"});
    });

    it("should process the message \"open about dialog\"", function() {
      const openAboutDialogSpy = sandbox.spy(background, "openAboutDialog");

      const request = {msg: "open about dialog"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(openAboutDialogSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should enter the default case and create the \"unhandled-message-notification\"", function() {
      const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

      const id = "unhandled-message-notification";
      const title = "Unhandled Message!";
      const message = "There was an unhandled message!";

      const request = {msg: "some unhandled message"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(createBasicNotificationSpy);
      sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
    });

    describe("ajax related functions", function() {
      it("should call ajaxPost with expected values", function() {
        const $PostSpy = sandbox.spy($, "post");

        const serverURL = "https://some.url";
        const data = {data: "some data"};
        const ajaxTimeout = 10000;

        background.ajaxPost(serverURL, data, ajaxTimeout);

        sinon.assert.calledOnce($PostSpy);
        sinon.assert.calledWithExactly($PostSpy, {
          url: serverURL,
          data: JSON.stringify(data),
          dataType: "text",
          processData: false,
          timeout: ajaxTimeout
        });
      });

      describe("sendActivityData", function() {
        it("should process the message \"send activityData\"", function() {
          const sendActivityDataSpy = sandbox.spy(background, "sendActivityData");

          const request = {
            msg: "send activityData",
            ajaxTimeout: 10000,
            servletURL: "https://some.url",
            activityData: "some activity data"
          };
          const sender = {tab: {id: 5}};

          chrome.runtime.onMessage.trigger(request, sender);

          sinon.assert.calledOnce(sendActivityDataSpy);
          sinon.assert.calledWithExactly(sendActivityDataSpy, request);
        });

        it("should succeed to send activity data and call addServerMarkup(data)", function() {
          const callAddServerMarkupSpy = sandbox.spy(background, "callAddServerMarkup");

          const request = {
            msg: "send activityData",
            servletURL: "https://some.url",
            activityData: "some activity data"
            // ajaxTimeout not given by request to test "or branch"
          };

          sandbox.useFakeServer();

          const serverURL = "https://some.url";
          const serverData = "some server data";

          sandbox.server.respondWith("POST", serverURL,
            [200, {"Content-Type": "text"}, serverData]);

          background.sendActivityData(request);

          sandbox.server.respond();

          sinon.assert.calledOnce(callAddServerMarkupSpy);
          sinon.assert.calledWithExactly(callAddServerMarkupSpy, serverData);
        });

        it("should send a request to the content script to add server markup", function() {
          const serverData = "some server data";

          background.currentTabId = 5;

          background.callAddServerMarkup(serverData);

          sinon.assert.calledOnce(chrome.tabs.sendMessage);
          sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
            msg: "call addServerMarkup",
            data: serverData
          });
        });

        it("should succeed to send activity data but fail to receive data from the server", function() {
          const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

          const request = {
            msg: "send activityData",
            servletURL: "https://some.url",
            activityData: "some activity data"
          };

          sandbox.useFakeServer();

          const serverURL = "https://some.url";

          sandbox.server.respondWith("POST", serverURL,
            [200, {"Content-Type": "text"}, ""]);

          background.sendActivityData(request);

          sandbox.server.respond();

          sinon.assert.calledOnce(ajaxErrorSpy);
          expect(ajaxErrorSpy.firstCall.args[1]).to.equal("nodata");
        });

        it("should fail to send activity data", function() {
          const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

          const request = {
            msg: "send activityData",
            servletURL: "https://some.url",
            activityData: "some activity data"
          };

          sandbox.useFakeServer();

          const serverURL = "https://some.url";

          sandbox.server.respondWith("POST", serverURL,
            [404, {}, ""]);

          background.sendActivityData(request);

          sandbox.server.respond();

          sinon.assert.calledOnce(ajaxErrorSpy);
          expect(ajaxErrorSpy.firstCall.args[1]).to.equal("error");
        });
      });

      describe("sendInteractionData", function() {
        it("should process the message \"send interactionData\"", function() {
          const sendInteractionDataSpy = sandbox.spy(background, "sendInteractionData");

          const request = {
            msg: "send interactionData",
            servletURL: "https://some.url",
            interactionData: "some interaction data"
          };
          const sender = {tab: {id: 5}};

          chrome.runtime.onMessage.trigger(request, sender);

          sinon.assert.calledOnce(sendInteractionDataSpy);
          sinon.assert.calledWithExactly(sendInteractionDataSpy, request);
        });
      });

      describe("sendRequestDataAbort", function() {
        it("should process the message \"send requestData abort\"", function() {
          const sendRequestDataAbortSpy = sandbox.spy(background, "sendRequestDataAbort");

          const request = {
            msg: "send requestData abort",
            ajaxTimeout: 10000,
            servletURL: "https://some.url",
            requestData: "some request data"
          };
          const sender = {tab: {id: 5}};

          chrome.runtime.onMessage.trigger(request, sender);

          sinon.assert.calledOnce(sendRequestDataAbortSpy);
          sinon.assert.calledWithExactly(sendRequestDataAbortSpy, request);
        });

        it("should succeed to send request data and call abortEnhancement()", function() {
          const callAbortEnhancementSpy = sandbox.spy(background, "callAbortEnhancement");

          const request = {
            msg: "send activityData",
            servletURL: "https://some.url",
            requestData: "some request data"
            // ajaxTimeout not given by request to test "or branch"
          };

          sandbox.useFakeServer();

          const serverURL = "https://some.url";

          sandbox.server.respondWith("POST", serverURL,
            [200, {"Content-Type": "text"}, ""]);

          background.sendRequestDataAbort(request);

          sandbox.server.respond();

          sinon.assert.calledOnce(callAbortEnhancementSpy);
        });

        it("should send a request to the content script to abort the enhancement", function() {
          background.currentTabId = 5;

          background.callAbortEnhancement();

          sinon.assert.calledOnce(chrome.tabs.sendMessage);
          sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {msg: "call abortEnhancement"});
        });
      });

      describe("ajaxError", function() {
        it("should send a request to the content script to return to the initial interaction state", function() {
          background.currentTabId = 5;

          background.callInitialInteractionState();

          sinon.assert.calledOnce(chrome.tabs.sendMessage);
          sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {msg: "call initialInteractionState"});
        });

        it("should create the \"no-xhr-or-textstatus-notification\", because there is no xhr", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "no-xhr-or-textstatus-notification";
          const title = "(!xhr || !textStatus)!";
          const message = "The VIEW server encountered an error.";

          background.ajaxError(undefined, "error");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should create the \"no-xhr-or-textstatus-notification\", because there is no text status", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "no-xhr-or-textstatus-notification";
          const title = "(!xhr || !textStatus)!";
          const message = "The VIEW server encountered an error.";

          background.ajaxError({}, "");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should create the \"nodata-notification\"", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "nodata-notification";
          const title = "No data!";
          const message = "The VIEW server is taking too long to respond.";

          background.ajaxError({}, "nodata");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should create the \"timeout-notification\" and call abortEnhancement()", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");
          const callAbortEnhancementSpy = sandbox.spy(background, "callAbortEnhancement");

          const id = "timeout-notification";
          const title = "Timeout!";
          const message = "The VIEW server is currently unavailable.";

          background.ajaxError({}, "timeout");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);

          sinon.assert.calledOnce(callAbortEnhancementSpy);
        });

        it("should create the \"error-490-notification\"", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "error-490-notification";
          const title = "Error 490!";
          const message = "The VIEW server no longer supports this version of the VIEW " +
            "extension.\nPlease check for a new version of the add-on in the " +
            "Tools->Add-ons menu!";

          background.ajaxError({status: 490}, "error");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should create the \"error-491-notification\"", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "error-491-notification";
          const title = "Error 491!";
          const message = "The topic selected isn't available.\nPlease select a " +
            "different topic from the toolbar menu.";

          background.ajaxError({status: 491}, "error");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should create the \"error-492-notification\"", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "error-492-notification";
          const title = "Error 492!";
          const message = "The topic selected isn't available for the language " +
            "selected.\nPlease select a different language or topic from " +
            "the toolbar menu.";

          background.ajaxError({status: 492}, "error");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should create the \"error-493-notification\"", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "error-493-notification";
          const title = "Error 493!";
          const message = "The server is too busy right now. Please try again " +
            "in a few minutes.";

          background.ajaxError({status: 493}, "error");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should trigger error 494, but nothing should happen", function() {
          // enhancement was stopped on client's request, we do nothing
          // to not scare off the user
          background.ajaxError({status: 494}, "error");
        });

        it("should create the \"unknown-error-notification\", when the error status is unknown", function() {
          const createUnknownErrorNotificationSpy = sandbox.spy(background, "createUnknownErrorNotification");

          background.ajaxError({status: 495}, "error");

          sinon.assert.calledOnce(createUnknownErrorNotificationSpy);
        });

        it("should create the \"unknown-error-notification\", when the text status is unknown", function() {
          const createUnknownErrorNotificationSpy = sandbox.spy(background, "createUnknownErrorNotification");

          background.ajaxError({}, "unknown");

          sinon.assert.calledOnce(createUnknownErrorNotificationSpy);
        });

        it("should create the \"unknown-error-notification\"", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "unknown-error-notification";
          const title = "Unknown error!";
          const message = "The VIEW server encountered an unknown error.";

          background.createUnknownErrorNotification();

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });
      });
    });
  });

  describe("cookies", function() {
    it("should register one listener for cookies onChanged", function() {
      sinon.assert.calledOnce(chrome.cookies.onChanged.addListener);
    });

    it("should register a change event on the correct cookie", function() {
      const processUserIdCookieSpy = sandbox.spy(background, "processUserIdCookie");

      const cookieChangeInfo = {cookie: {name: "wertiview_userid"}};

      chrome.cookies.onChanged.trigger(cookieChangeInfo);

      sinon.assert.calledOnce(processUserIdCookieSpy);
      sinon.assert.calledWithExactly(processUserIdCookieSpy, cookieChangeInfo);
    });

    it("should not register a change event on the incorrect cookie", function() {
      const processUserIdCookieSpy = sandbox.spy(background, "processUserIdCookie");

      const cookieChangeInfo = {cookie: {name: "unknown_cookie"}};

      chrome.cookies.onChanged.trigger(cookieChangeInfo);

      sinon.assert.notCalled(processUserIdCookieSpy);
    });

    it("should sign out the user as the cookie got removed", function() {
      const signOutUserSpy = sandbox.spy(background, "signOutUser");

      background.processUserIdCookie({removed: true});

      sinon.assert.calledOnce(signOutUserSpy);
    });

    it("should sign in the user as the cookie has a value", function() {
      const signInUserSpy = sandbox.spy(background, "signInUser");

      const cookieInfo = {
        name: "wertiview_userid",
        value: "name/email/id"
      };

      const cookieChangeInfo = {
        cookie: cookieInfo
      };

      background.processUserIdCookie(cookieChangeInfo);

      sinon.assert.calledOnce(signInUserSpy);
      sinon.assert.calledWithExactly(signInUserSpy, cookieInfo.value);
    });

    it("should reset user email and id and send a request to sign out the user", function() {
      background.currentTabId = 5;

      background.signOutUser();

      sinon.assert.calledOnce(chrome.storage.local.set);
      sinon.assert.calledWith(chrome.storage.local.set, {
        userEmail: "",
        userid: ""
      });

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {msg: "call signOut"});
    });

    it("should set user email and id and send a request to sign in the user", function() {
      const userData = "name/email/id";

      background.currentTabId = 5;

      background.signInUser(userData);

      sinon.assert.calledOnce(chrome.storage.local.set);
      sinon.assert.calledWith(chrome.storage.local.set, {
        userEmail: "email",
        userid: "id"
      });

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
        msg: "call signIn",
        userEmail: "email"
      });
    });
  });
});
