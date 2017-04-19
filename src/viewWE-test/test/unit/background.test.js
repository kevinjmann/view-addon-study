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
      expect(background.topics.articles).to.not.exist;
      expect(background.topics.determiners).to.not.exist;
      expect(background.topics.nouns).to.not.exist;

      background.initTopics();

      expect(Object.keys(background.topics).length).to.equal(3);

      expect(background.topics.articles).to.exist;
      expect(background.topics.determiners).to.exist;
      expect(background.topics.nouns).to.exist;
    });

    it("should get and set all topic urls", function() {
      background.initTopics();
      background.getAndSetTopicURLs();

      sinon.assert.callCount(chrome.extension.getURL, 3);
      sinon.assert.calledWithExactly(chrome.extension.getURL.getCall(0), "topics/articles.json");
      sinon.assert.calledWithExactly(chrome.extension.getURL.getCall(1), "topics/determiners.json");
      sinon.assert.calledWithExactly(chrome.extension.getURL.getCall(2), "topics/nouns.json");
    });

    it("should call for all topic json objects, store activity data and proceed to set", function() {
      const getJSONStub = sandbox.stub($, "getJSON");
      const setAndToggleSpy = sandbox.spy(background, "proceedToSetAndToggleToolbar");

      const jsonData = fixture.load("fixtures/json/articles.json");

      getJSONStub.yields(jsonData); // make $.getJSON synchronous

      background.setTopics();

      sinon.assert.callCount(getJSONStub, 3);

      expect(background.topics.articles).to.include(jsonData);

      sinon.assert.calledOnce(setAndToggleSpy);

      fixture.cleanup();
    });

    it("should proceed to set topics and toggle the toolbar", function() {
      const jsonData = fixture.load("fixtures/json/articles.json");

      chrome.storage.local.set.yields(); // make chrome.storage.local.set synchronous

      background.initTopics();

      // fill with fake data
      background.topics.articles = jsonData;

      background.currentTabId = 5;

      background.proceedToSetAndToggleToolbar();

      sinon.assert.calledOnce(chrome.storage.local.set);
      sinon.assert.calledWithMatch(chrome.storage.local.set, {topics: background.topics});

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {msg: "toggle toolbar"});

      fixture.cleanup();
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

    it("should process the message 'toggle toolbar'", function() {
      const toggleToolbarSpy = sandbox.spy(background, "toggleToolbar");

      const request = {msg: "toggle toolbar"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(toggleToolbarSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message 'toggle VIEW Menu'", function() {
      const toggleMenuVIEWSpy = sandbox.spy(background, "toggleVIEWMenu");

      const request = {msg: "toggle VIEW Menu"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(toggleMenuVIEWSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message 'hide VIEW Menu'", function() {
      const hideVIEWMenuSpy = sandbox.spy(background, "hideVIEWMenu");

      const request = {msg: "hide VIEW Menu"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(hideVIEWMenuSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message 'toggle statistics menu'", function() {
      const toggleStatisticsMenuSpy = sandbox.spy(background, "toggleStatisticsMenu");

      const request = {msg: "toggle statistics menu"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(toggleStatisticsMenuSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message 'hide statistics menu'", function() {
      const hideStatisticsMenuSpy = sandbox.spy(background, "hideStatisticsMenu");

      const request = {msg: "hide statistics menu"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(hideStatisticsMenuSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message 'remove performance dialog'", function() {
      const removePerformanceDialogSpy = sandbox.spy(background, "removePerformanceDialog");

      const request = {msg: "remove performance dialog"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(removePerformanceDialogSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message 'call startToEnhance'", function() {
      const callStartToEnhanceSpy = sandbox.spy(background, "callStartToEnhance");

      const request = {msg: "call startToEnhance"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(callStartToEnhanceSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message 'show element'", function() {
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

    it("should process the message 'hide element'", function() {
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

    it("should process the message 'call sendTopics'", function() {
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

    it("should process the message 'call abort'", function() {
      const callAbortSpy = sandbox.spy(background, "callAbort");

      const request = {msg: "call abort"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(callAbortSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message 'call restoreToOriginal'", function() {
      const callRestoreToOriginalSpy = sandbox.spy(background, "callRestoreToOriginal");

      const request = {msg: "call restoreToOriginal"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(callRestoreToOriginalSpy);

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, request);
    });

    it("should process the message 'redirect to link'", function() {
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

    it("should process the message 'call openOptionsPage'", function() {
      const callOpenOptionsPageSpy = sandbox.spy(background, "callOpenOptionsPage");

      const request = {msg: "call openOptionsPage"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(callOpenOptionsPageSpy);

      sinon.assert.calledOnce(chrome.runtime.openOptionsPage);
    });

    it("should process the message 'open help page'", function() {
      const openHelpPageSpy = sandbox.spy(background, "openHelpPage");

      const request = {msg: "open help page"};
      const sender = {tab: {id: 5}};

      chrome.runtime.onMessage.trigger(request, sender);

      sinon.assert.calledOnce(openHelpPageSpy);

      sinon.assert.calledOnce(chrome.tabs.create);
      sinon.assert.calledWithExactly(chrome.tabs.create,
        {url: "http://sifnos.sfs.uni-tuebingen.de/VIEW/index.jsp?content=activities"});
    });

    it("should enter the default case and create the 'unhandled-message-notification'", function() {
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
      describe("ajax post", function() {
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

        describe("sendActivityDataAndGetEnhancementMarkup", function() {
          it("should process the message 'send activityData and get enhancement markup'", function() {
            const sendActivityDataAndGetEnhancementMarkupSpy =
            sandbox.spy(background, "sendActivityDataAndGetEnhancementMarkup");

            const request = {
              msg: "send activityData and get enhancement markup",
              ajaxTimeout: 10000,
              servletURL: "https://some.url",
              activityData: "some activity data"
            };
            const sender = {tab: {id: 5}};

            chrome.runtime.onMessage.trigger(request, sender);

            sinon.assert.calledOnce(sendActivityDataAndGetEnhancementMarkupSpy);
            sinon.assert.calledWithExactly(sendActivityDataAndGetEnhancementMarkupSpy, request);
          });

          it("should succeed to send activity data and call addEnhancementMarkup(data)", function() {
            const callAddEnhancementMarkupSpy = sandbox.spy(background, "callAddEnhancementMarkup");

            const request = {
              msg: "send activityData and get enhancement markup",
              servletURL: "https://some.url",
              activityData: "some activity data"
              // ajaxTimeout not given by request to test "or branch"
            };

            sandbox.useFakeServer();

            const serverURL = "https://some.url";
            const serverData = "some server data";

            sandbox.server.respondWith("POST", serverURL,
              [200, {"Content-Type": "text"}, serverData]);

            background.sendActivityDataAndGetEnhancementMarkup(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(callAddEnhancementMarkupSpy);
            sinon.assert.calledWithExactly(callAddEnhancementMarkupSpy, serverData);
          });

          it("should send a request to the content script to add server markup", function() {
            const serverData = "some server data";

            background.currentTabId = 5;

            background.callAddEnhancementMarkup(serverData);

            sinon.assert.calledOnce(chrome.tabs.sendMessage);
            sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
              msg: "call addEnhancementMarkup",
              data: serverData
            });
          });

          it("should succeed to send activity data but fail to receive data from the server", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const request = {
              msg: "send activityData and get enhancement markup",
              servletURL: "https://some.url",
              activityData: "some activity data"
            };

            sandbox.useFakeServer();

            const serverURL = "https://some.url";

            sandbox.server.respondWith("POST", serverURL,
              [200, {"Content-Type": "text"}, ""]);

            background.sendActivityDataAndGetEnhancementMarkup(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("nodata");
          });

          it("should fail to send activity data", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const request = {
              msg: "send activityData and get enhancement markup",
              servletURL: "https://some.url",
              activityData: "some activity data"
            };

            sandbox.useFakeServer();

            const serverURL = "https://some.url";

            sandbox.server.respondWith("POST", serverURL,
              [404, {}, ""]);

            background.sendActivityDataAndGetEnhancementMarkup(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("error");
          });
        });

        describe("sendTaskDataAndGetTaskId", function() {
          it("should process the message 'send taskData and get taskId'", function() {
            const sendTaskDataAndGetTaskIdSpy = sandbox.spy(background, "sendTaskDataAndGetTaskId");

            const request = {
              msg: "send taskData and get taskId",
              serverTaskURL: "https://view.aleks.bg/act/task",
              taskData: "some task data"
            };
            const sender = {tab: {id: 5}};

            chrome.runtime.onMessage.trigger(request, sender);

            sinon.assert.calledOnce(sendTaskDataAndGetTaskIdSpy);
            sinon.assert.calledWithExactly(sendTaskDataAndGetTaskIdSpy, request);
          });

          it("should call ajaxPost(url, data, ajaxTimeout)", function() {
            const ajaxPostSpy = sandbox.spy(background, "ajaxPost");

            const serverTaskURL = "https://view.aleks.bg/act/task";
            const taskData = "some task data";

            const request = {
              msg: "send taskData and get taskId",
              serverTaskURL: serverTaskURL,
              taskData: taskData
            };

            background.sendTaskDataAndGetTaskId(request);

            sinon.assert.calledOnce(ajaxPostSpy);
            sinon.assert.calledWithExactly(ajaxPostSpy,
              serverTaskURL,
              taskData,
              10000
            );
          });

          it("should succeed to send task data, get the task id and call callSetTaskId(taskId)", function() {
            const callSetTaskIdSpy = sandbox.spy(background, "callSetTaskId");

            const serverTaskURL = "https://view.aleks.bg/act/task";

            const request = {
              msg: "send taskData and get taskId",
              serverTaskURL: serverTaskURL,
              taskData: "some task data"
            };

            sandbox.useFakeServer();

            const taskId = 1;

            const serverData = {"task-id": taskId};

            sandbox.server.respondWith("POST", serverTaskURL,
              [200, {"Content-Type": "application/json"}, JSON.stringify(serverData)]);

            background.sendTaskDataAndGetTaskId(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(callSetTaskIdSpy);
            sinon.assert.calledWithExactly(callSetTaskIdSpy, taskId);
          });

          it("should send a request to call setTaskId(taskId)", function() {
            const taskId = 1;

            background.currentTabId = 5;

            background.callSetTaskId(taskId);

            sinon.assert.calledOnce(chrome.tabs.sendMessage);
            sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
              msg: "call setTaskId",
              taskId: taskId
            });
          });

          it("should succeed to send task data, but fail to receive data from the server", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const serverTaskURL = "https://view.aleks.bg/act/task";

            const request = {
              msg: "send taskData and get taskId",
              serverTaskURL: serverTaskURL,
              taskData: "some task data"
            };

            sandbox.useFakeServer();

            sandbox.server.respondWith("POST", serverTaskURL,
              [200, {"Content-Type": "application/json"}, ""]);

            background.sendTaskDataAndGetTaskId(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("no-task-data");
          });

          it("should fail to send task data, and call signOutUser()", function() {
            const signOutUserSpy = sandbox.spy(background, "signOutUser");

            const serverTaskURL = "https://view.aleks.bg/act/task";

            const request = {
              msg: "send taskData and get taskId",
              serverTaskURL: serverTaskURL,
              taskData: "some task data"
            };

            sandbox.useFakeServer();

            sandbox.server.respondWith("POST", serverTaskURL,
              [404, {}, ""]);

            background.sendTaskDataAndGetTaskId(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(signOutUserSpy);
          });

          it("should fail to send task data, and create a 'auth-token-expired' notification", function() {
            const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

            const serverTaskURL = "https://view.aleks.bg/act/task";

            const request = {
              msg: "send taskData and get taskId",
              serverTaskURL: serverTaskURL,
              taskData: "some task data"
            };

            sandbox.useFakeServer();

            sandbox.server.respondWith("POST", serverTaskURL,
              [404, {}, ""]);

            background.sendTaskDataAndGetTaskId(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(createBasicNotificationSpy);
            sinon.assert.calledWithExactly(createBasicNotificationSpy,
              "auth-token-expired",
              "The auth token expired!",
              "The token for user authentication expired, " +
              "you will be signed out automatically. " +
              "Please sign in again!"
            );
          });
        });

        describe("sendTrackingData", function() {
          it("should process the message 'send trackingData'", function() {
            const sendTrackingDataSpy = sandbox.spy(background, "sendTrackingData");

            const request = {
              msg: "send trackingData",
              serverTrackingURL: "https://view.aleks.bg/act/tracking",
              trackingData: "some tracking data"
            };
            const sender = {tab: {id: 5}};

            chrome.runtime.onMessage.trigger(request, sender);

            sinon.assert.calledOnce(sendTrackingDataSpy);
            sinon.assert.calledWithExactly(sendTrackingDataSpy, request);
          });

          it("should call ajaxPost(url, data, ajaxTimeout)", function() {
            const ajaxPostSpy = sandbox.spy(background, "ajaxPost");

            const serverTrackingURL = "https://view.aleks.bg/act/tracking";
            const trackingData = "some tracking data";

            const request = {
              msg: "send trackingData",
              serverTrackingURL: serverTrackingURL,
              trackingData: trackingData
            };

            background.sendTrackingData(request);

            sinon.assert.calledOnce(ajaxPostSpy);
            sinon.assert.calledWithExactly(ajaxPostSpy,
              serverTrackingURL,
              trackingData,
              10000
            );
          });

          it("should succeed to send tracking data, get the performance data and call callShowPerformance(data)", function() {
            const callShowPerformanceSpy = sandbox.spy(background, "callShowPerformance");

            const serverTrackingURL = "https://view.aleks.bg/act/tracking";
            const trackingData = "some tracking data";

            const request = {
              msg: "send trackingData",
              serverTrackingURL: serverTrackingURL,
              trackingData: trackingData
            };

            sandbox.useFakeServer();

            const performanceData = "some performance data";

            sandbox.server.respondWith("POST", serverTrackingURL,
              [200, {"Content-Type": "application/json"}, JSON.stringify(performanceData)]);

            background.sendTrackingData(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(callShowPerformanceSpy);
            sinon.assert.calledWithExactly(callShowPerformanceSpy, performanceData);
          });

          it("should send a request to call showPerformance(data)", function() {
            const performanceData = "some performance data";

            background.currentTabId = 5;

            background.callShowPerformance(performanceData);

            sinon.assert.calledOnce(chrome.tabs.sendMessage);
            sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
              msg: "call showPerformance",
              performanceData: performanceData
            });
          });

          it("should succeed to send tracking data, but fail to receive data from the server", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const serverTrackingURL = "https://view.aleks.bg/act/tracking";
            const trackingData = "some tracking data";

            const request = {
              msg: "send trackingData",
              serverTrackingURL: serverTrackingURL,
              trackingData: trackingData
            };

            sandbox.useFakeServer();

            sandbox.server.respondWith("POST", serverTrackingURL,
              [200, {"Content-Type": "application/json"}, ""]);

            background.sendTrackingData(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("no-performance-data");
          });
        });
      });

      describe("ajax get", function() {
        it("should call ajaxGet with expected values", function() {
          const $GetSpy = sandbox.spy($, "get");

          const serverTaskURL = "https://view.aleks.bg/act/task";
          const queryParam = "?token=token";
          const ajaxTimeout = 10000;

          background.ajaxGet(serverTaskURL, queryParam, ajaxTimeout);

          sinon.assert.calledOnce($GetSpy);
          sinon.assert.calledWithExactly($GetSpy, {
            url: serverTaskURL + queryParam,
            timeout: ajaxTimeout
          });
        });

        describe("getAllTasks", function() {
          it("should process the message 'get all tasks'", function() {
            const getAllTasksSpy = sandbox.spy(background, "getAllTasks");

            const request = {
              msg: "get all tasks",
              ajaxTimeout: 10000,
              serverTaskURL: "https://view.aleks.bg/act/task",
              queryParam: "?token=token"
            };
            const sender = {tab: {id: 5}};

            chrome.runtime.onMessage.trigger(request, sender);

            sinon.assert.calledOnce(getAllTasksSpy);
            sinon.assert.calledWithExactly(getAllTasksSpy, request);
          });

          it("should succeed to get all tasks and call callShowAllTasks(data)", function() {
            const callShowAllTasksSpy = sandbox.spy(background, "callShowAllTasks");

            const serverTaskURL= "https://view.aleks.bg/act/task";
            const queryParam = "?token=token";

            const request = {
              msg: "get all tasks",
              serverTaskURL: serverTaskURL,
              queryParam: queryParam
              // ajaxTimeout not given by request to test "or branch"
            };

            sandbox.useFakeServer();

            const serverURL = serverTaskURL + queryParam;
            const serverData = "some server data";

            sandbox.server.respondWith("GET", serverURL,
              [200, {"Content-Type": "text"}, serverData]);

            background.getAllTasks(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(callShowAllTasksSpy);
            sinon.assert.calledWithExactly(callShowAllTasksSpy, serverData);
          });

          it("should send a request to the content script to call showAllTasks(data)", function() {
            const serverData = "some server data";

            background.currentTabId = 5;

            background.callShowAllTasks(serverData);

            sinon.assert.calledOnce(chrome.tabs.sendMessage);
            sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
              msg: "call showAllTasks",
              tasksData: serverData
            });
          });

          it("should succeed to get all tasks but fail to receive data from the server", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const serverTaskURL= "https://view.aleks.bg/act/task";
            const queryParam = "?token=token";

            const request = {
              msg: "get all tasks",
              ajaxTimeout: 10000,
              serverTaskURL: serverTaskURL,
              queryParam: queryParam
            };

            sandbox.useFakeServer();

            const serverURL = serverTaskURL + queryParam;

            sandbox.server.respondWith("GET", serverURL,
              [200, {"Content-Type": "text"}, ""]);

            background.getAllTasks(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("no-task-data");
          });

          it("should fail to send activity data", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const serverTaskURL= "https://view.aleks.bg/act/task";
            const queryParam = "?token=token";

            const request = {
              msg: "get all tasks",
              ajaxTimeout: 10000,
              serverTaskURL: serverTaskURL,
              queryParam: queryParam
            };

            sandbox.useFakeServer();

            const serverURL = serverTaskURL + queryParam;

            sandbox.server.respondWith("GET", serverURL,
              [404, {}, ""]);

            background.getAllTasks(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("error");
          });
        });

        describe("getTask", function() {
          it("should process the message 'get task'", function() {
            const getTaskSpy = sandbox.spy(background, "getTask");

            const request = {
              msg: "get task",
              ajaxTimeout: 10000,
              serverTrackingURL: "https://view.aleks.bg/act/tracking",
              queryParam: "?token=token&taskId=7"
            };
            const sender = {tab: {id: 5}};

            chrome.runtime.onMessage.trigger(request, sender);

            sinon.assert.calledOnce(getTaskSpy);
            sinon.assert.calledWithExactly(getTaskSpy, request);
          });

          it("should succeed to get the task and call callShowTask(data)", function() {
            const ccallShowTaskSpy = sandbox.spy(background, "callShowTask");

            const serverTrackingURL= "https://view.aleks.bg/act/tracking";
            const queryParam = "?token=token&taskId=7";

            const request = {
              msg: "get task",
              serverTrackingURL: serverTrackingURL,
              queryParam: queryParam
              // ajaxTimeout not given by request to test "or branch"
            };

            sandbox.useFakeServer();

            const serverURL = serverTrackingURL + queryParam;
            const serverData = "some server data";

            sandbox.server.respondWith("GET", serverURL,
              [200, {"Content-Type": "text"}, serverData]);

            background.getTask(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(ccallShowTaskSpy);
            sinon.assert.calledWithExactly(ccallShowTaskSpy, serverData);
          });

          it("should send a request to the content script to call callShowTask(data)", function() {
            const serverData = "some server data";

            background.currentTabId = 5;

            background.callShowTask(serverData);

            sinon.assert.calledOnce(chrome.tabs.sendMessage);
            sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
              msg: "call showTask",
              performancesData: serverData
            });
          });

          it("should succeed to get all tasks but fail to receive data from the server", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const serverTrackingURL= "https://view.aleks.bg/act/tracking";
            const queryParam = "?token=token&taskId=7";

            const request = {
              msg: "get task",
              serverTrackingURL: serverTrackingURL,
              queryParam: queryParam
            };

            sandbox.useFakeServer();

            const serverURL = serverTrackingURL + queryParam;

            sandbox.server.respondWith("GET", serverURL,
              [200, {"Content-Type": "text"}, ""]);

            background.getTask(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("no-performance-data");
          });

          it("should fail to send activity data", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const serverTrackingURL= "https://view.aleks.bg/act/tracking";
            const queryParam = "?token=token&taskId=7";

            const request = {
              msg: "get task",
              serverTrackingURL: serverTrackingURL,
              queryParam: queryParam
            };

            sandbox.useFakeServer();

            const serverURL = serverTrackingURL + queryParam;

            sandbox.server.respondWith("GET", serverURL,
              [404, {}, ""]);

            background.getTask(request);

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("error");
          });
        });
      });

      describe("ajaxError", function() {
        it("should send a request to the content script to return to the initial interaction state", function() {
          background.currentTabId = 5;

          background.callInitialInteractionState();

          sinon.assert.calledOnce(chrome.tabs.sendMessage);
          sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {msg: "call initialInteractionState"});
        });

        it("should create the 'no-xhr-or-textstatus-notification', because there is no xhr", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "no-xhr-or-textstatus-notification";
          const title = "(!xhr || !textStatus)!";
          const message = "The VIEW server encountered an error.";

          background.ajaxError(undefined, "error");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should create the 'no-xhr-or-textstatus-notification', because there is no text status", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "no-xhr-or-textstatus-notification";
          const title = "(!xhr || !textStatus)!";
          const message = "The VIEW server encountered an error.";

          background.ajaxError({}, "");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should create the 'nodata-notification'", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "nodata-notification";
          const title = "No data!";
          const message = "The VIEW server did not send any data.";

          background.ajaxError({}, "nodata");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should create the 'no-task-data-notification'", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "no-task-data-notification";
          const title = "No task data!";
          const message = "The VIEW server did not send any task data.";

          background.ajaxError({}, "no-task-data");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should create the 'no-performance-data-notification'", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "no-performance-data-notification";
          const title = "No performance data!";
          const message = "The VIEW server did not send any performance data.";

          background.ajaxError({}, "no-performance-data");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should create the 'timeout-notification' and call callAbort()", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");
          const callAbortSpy = sandbox.spy(background, "callAbort");

          const id = "timeout-notification";
          const title = "Timeout!";
          const message = "The VIEW server is taking too long to respond.";

          background.ajaxError({}, "timeout");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);

          sinon.assert.calledOnce(callAbortSpy);
        });

        it("should create the 'error-490-notification'", function() {
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

        it("should create the 'error-491-notification'", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "error-491-notification";
          const title = "Error 491!";
          const message = "The topic selected isn't available.\nPlease select a " +
            "different topic from the toolbar menu.";

          background.ajaxError({status: 491}, "error");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
        });

        it("should create the 'error-492-notification'", function() {
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

        it("should create the 'error-493-notification'", function() {
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
          // enhancer was stopped on client's request, we do nothing
          // to not scare off the user
          background.ajaxError({status: 494}, "error");
        });

        it("should create the 'unknown-error-notification', when the error status is unknown", function() {
          const createUnknownErrorNotificationSpy = sandbox.spy(background, "createUnknownErrorNotification");

          background.ajaxError({status: 495}, "error");

          sinon.assert.calledOnce(createUnknownErrorNotificationSpy);
        });

        it("should create the 'unknown-error-notification', when the text status is unknown", function() {
          const createUnknownErrorNotificationSpy = sandbox.spy(background, "createUnknownErrorNotification");

          background.ajaxError({}, "unknown");

          sinon.assert.calledOnce(createUnknownErrorNotificationSpy);
        });

        it("should create the 'unknown-error-notification'", function() {
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
        userid: "",
        user: "",
        token: "",
        taskId: ""
      });

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {msg: "call signOut"});
    });

    it("should set user email and id and send a request to sign in the user", function() {
      const userData = "user/email/id/authtoken";
      const userEmail = "email";
      const userid = "id";
      const user = "user";
      const token = "authtoken";

      background.currentTabId = 5;

      background.signInUser(userData);

      sinon.assert.calledOnce(chrome.storage.local.set);
      sinon.assert.calledWith(chrome.storage.local.set, {
        userEmail: userEmail,
        userid: userid,
        user: user,
        token: token
      });

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
        msg: "call signIn",
        userEmail: userEmail,
        userid: userid,
        user: user,
        token: token
      });
    });
  });
});
