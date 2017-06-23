/**
 * Tests for the background.js file of the VIEW add-on.
 *
 * Created by eduard on 22.12.16.
 */

"use strict";

const $ = require('jquery');
const chrome = require('sinon-chrome');

describe("background.js", function() {
  let sandbox;
  const theServerURL = "https://view.aleks.bg";

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();

    // reset calls to all chrome functions
    chrome.runtime.getURL.reset();
    chrome.tabs.sendMessage.reset();
    chrome.storage.local.set.reset();
    chrome.storage.local.get.reset();
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

    it("should call setDefaults() when the button is clicked the first time", function() {
      const setDefaultsSpy = sandbox.spy(background, "setDefaults");

      chrome.browserAction.onClicked.trigger({id: 5});

      expect(background.clickCounter).to.equal(1);

      sinon.assert.calledOnce(setDefaultsSpy);
    });

    it("should set the defaults to the storage", function() {
      background.setDefaults();

      sinon.assert.calledOnce(chrome.storage.local.set);
      sinon.assert.calledWith(chrome.storage.local.set, {
        // General options
        serverURL: theServerURL,
        servletURL: theServerURL + "/view",
        serverTaskURL: theServerURL + "/act/task",
        serverTrackingURL: theServerURL + "/act/tracking",
        authenticator: theServerURL + "/authenticator.html",
        ajaxTimeout: 60000,
        topics: {},
        userEmail: "",
        userid: "",

        // task data
        user: "",
        token: "",
        taskId: "",
        timestamp: "",
        numberOfExercises: 0,

        // user options
        fixedOrPercentage: 0,
        fixedNumberOfExercises: 25,
        percentageOfExercises: 100,
        choiceMode: 0,
        firstOffset: 0,
        intervalSize: 1,
        showInst: false,
        debugSentenceMarkup: false,

        // enabled, language, topic and activity selections
        enabled: false, // should the page be enhanced right away?
        language: "unselected",
        topic: "unselected",
        filter: "no-filter",
        activity: "unselected"
      });
    });

    it("should set topics when the button is clicked the first time", function() {
      const setTopicsSpy = sandbox.stub(background, "setTopics");

      chrome.browserAction.onClicked.trigger({id: 5});

      expect(background.clickCounter).to.equal(1);

      sinon.assert.calledOnce(setTopicsSpy);
    });

    it("should send a message to toggle or add the toolbar without setting topics otherwise", function() {
      const requestToToggleOrAddToolbarSpy =
        sandbox.spy(background, "requestToToggleOrAddToolbar");

      chrome.browserAction.onClicked.trigger({id: 5});
      chrome.browserAction.onClicked.trigger({id: 5});

      expect(background.clickCounter).to.equal(2);

      sinon.assert.calledOnce(requestToToggleOrAddToolbarSpy);
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

      sinon.assert.callCount(chrome.runtime.getURL, 3);
      sinon.assert.calledWithExactly(chrome.runtime.getURL.getCall(0), "topics/articles.json");
      sinon.assert.calledWithExactly(chrome.runtime.getURL.getCall(1), "topics/determiners.json");
      sinon.assert.calledWithExactly(chrome.runtime.getURL.getCall(2), "topics/nouns.json");
    });

    it("should call for all topic json objects, store activity data and proceed to set", function() {
      const getJSONStub = sandbox.stub($, "getJSON");
      const setAndToggleSpy = sandbox.spy(background, "proceedToSetAndToggleToolbar");

      const jsonData = fixture.load("/viewWE-test/fixtures/json/articles.json");

      getJSONStub.yields(jsonData); // make $.getJSON synchronous

      background.setTopics();

      sinon.assert.callCount(getJSONStub, 3);

      expect(background.topics.articles).to.include(jsonData);

      sinon.assert.calledOnce(setAndToggleSpy);

      fixture.cleanup();
    });

    it("should proceed to set topics and call view.toolbar.toggleOrAddToolbar()", function() {
      const jsonData = fixture.load("/viewWE-test/fixtures/json/articles.json");

      chrome.storage.local.set.yields(); // make chrome.storage.local.set synchronous

      background.initTopics();

      // fill with fake data
      background.topics.articles = jsonData;

      background.currentTabId = 5;

      background.proceedToSetAndToggleToolbar();

      sinon.assert.calledOnce(chrome.storage.local.set);
      sinon.assert.calledWithMatch(chrome.storage.local.set, {topics: background.topics});

      sinon.assert.calledOnce(chrome.tabs.sendMessage);
      sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {action: "toggleOrAddToolbar"});

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

    it("should process the message 'openOptionsPage'", function() {
      const openOptionsPageSpy = sandbox.spy(background, "openOptionsPage");

      const request = {action: "openOptionsPage"};
      const sender = {tab: {id: 5}};
      const sendResponse = sandbox.spy();
      const parameters = {
        request,
        sender,
        sendResponse
      };

      chrome.runtime.onMessage.trigger(request, sender, sendResponse);

      sinon.assert.calledOnce(openOptionsPageSpy);
      sinon.assert.calledWithExactly(openOptionsPageSpy, parameters);

      sinon.assert.calledOnce(chrome.runtime.openOptionsPage);
    });

    it("should process the message 'openHelpPage'", function() {
      const openHelpPageSpy = sandbox.spy(background, "openHelpPage");

      const request = {action: "openHelpPage"};
      const sender = {tab: {id: 5}};
      const sendResponse = sandbox.spy();
      const parameters = {
        request,
        sender,
        sendResponse
      };

      chrome.runtime.onMessage.trigger(request, sender, sendResponse);

      sinon.assert.calledOnce(openHelpPageSpy);
      sinon.assert.calledWithExactly(openHelpPageSpy, parameters);

      sinon.assert.calledOnce(chrome.tabs.create);
      sinon.assert.calledWithExactly(chrome.tabs.create,
        {url: "http://sifnos.sfs.uni-tuebingen.de/VIEW/index.jsp?content=activities"});
    });

    it("should create the 'unhandled-message-notification', because 'action' function does not exist", function() {
      const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

      const request = {action: "some unhandled message"};
      const sender = {tab: {id: 5}};
      const sendResponse = sandbox.spy();

      const id = "unhandled-message-notification";
      const title = "Unhandled Message!";
      const message = "There was no handler for message: " + JSON.stringify(request) + "!";

      chrome.runtime.onMessage.trigger(request, sender, sendResponse);

      sinon.assert.calledOnce(createBasicNotificationSpy);
      sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
    });

    it("should create the 'unhandled-message-notification', because the 'action' parameter is missing", function() {
      const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

      const request = {};
      const sender = {tab: {id: 5}};
      const sendResponse = sandbox.spy();

      const id = "unhandled-message-notification";
      const title = "Unhandled Message!";
      const message = "There was no handler for message: " + JSON.stringify(request) + "!";

      chrome.runtime.onMessage.trigger(request, sender, sendResponse);

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
          it("should process the message 'sendActivityDataAndGetEnhancementMarkup'", function() {
            const sendActivityDataAndGetEnhancementMarkupSpy =
            sandbox.spy(background, "sendActivityDataAndGetEnhancementMarkup");

            const request = {
              action: "sendActivityDataAndGetEnhancementMarkup",
              ajaxTimeout: 10000,
              servletURL: "https://some.url",
              activityData: "some activity data"
            };
            const sender = {tab: {id: 5}};
            const sendResponse = sandbox.spy();
            const parameters = {
              request,
              sender,
              sendResponse
            };

            chrome.runtime.onMessage.trigger(request, sender, sendResponse);

            sinon.assert.calledOnce(sendActivityDataAndGetEnhancementMarkupSpy);
            sinon.assert.calledWithExactly(sendActivityDataAndGetEnhancementMarkupSpy, parameters);
          });

          it("should succeed to send activity data and call addEnhancementMarkup(data)", function() {
            const requestToAddEnhancementMarkupSpy =
              sandbox.spy(background, "requestToAddEnhancementMarkup");
            const serverURL = "https://some.url";

            const request = {
              action: "sendActivityDataAndGetEnhancementMarkup",
              activityData: "some activity data"
              // ajaxTimeout not given by request to test "or branch"
            };

            sandbox.useFakeServer();

            const serverData = "some server data";

            sandbox.server.respondWith("POST", serverURL,
              [200, {"Content-Type": "text"}, serverData]);

            chrome.storage.local.get.yields({"servletURL": serverURL});
            background.sendActivityDataAndGetEnhancementMarkup({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(requestToAddEnhancementMarkupSpy);
            sinon.assert.calledWithExactly(requestToAddEnhancementMarkupSpy, serverData);
          });

          it("should send a request to the content script to call view.enhancer.addEnhancementMarkup()", function() {
            const serverData = "some server data";

            background.currentTabId = 5;

            background.requestToAddEnhancementMarkup(serverData);

            sinon.assert.calledOnce(chrome.tabs.sendMessage);
            sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
              action: "addEnhancementMarkup",
              data: serverData
            });
          });

          it("should succeed to send activity data but fail to receive data from the server", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const request = {
              action: "sendActivityDataAndGetEnhancementMarkup",
              servletURL: "https://some.url",
              activityData: "some activity data"
            };

            sandbox.useFakeServer();

            const serverURL = "https://some.url";

            sandbox.server.respondWith("POST", serverURL,
              [200, {"Content-Type": "text"}, ""]);

            background.sendActivityDataAndGetEnhancementMarkup({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("nodata");
          });

          it("should fail to send activity data", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const request = {
              action: "sendActivityDataAndGetEnhancementMarkup",
              servletURL: "https://some.url",
              activityData: "some activity data"
            };

            sandbox.useFakeServer();

            const serverURL = "https://some.url";

            sandbox.server.respondWith("POST", serverURL,
              [404, {}, ""]);

            background.sendActivityDataAndGetEnhancementMarkup({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("error");
          });
        });

        describe("sendTaskDataAndGetTaskId", function() {
          it("should process the message 'sendTaskDataAndGetTaskId'", function() {
            const sendTaskDataAndGetTaskIdSpy = sandbox.spy(background, "sendTaskDataAndGetTaskId");

            const request = {
              action: "sendTaskDataAndGetTaskId",
              serverTaskURL: "https://view.aleks.bg/act/task",
              taskData: "some task data"
            };
            const sender = {tab: {id: 5}};
            const sendResponse = sandbox.spy();
            const parameters = {
              request,
              sender,
              sendResponse
            };

            chrome.runtime.onMessage.trigger(request, sender, sendResponse);

            sinon.assert.calledOnce(sendTaskDataAndGetTaskIdSpy);
            sinon.assert.calledWithExactly(sendTaskDataAndGetTaskIdSpy, parameters);
          });

          it("should call ajaxPost(url, data, ajaxTimeout)", function() {
            const ajaxPostSpy = sandbox.spy(background, "ajaxPost");

            const serverTaskURL = "https://view.aleks.bg/act/task";
            const taskData = "some task data";

            const request = {
              action: "sendTaskDataAndGetTaskId",
              taskData: taskData
            };

            chrome.storage.local.get.yields({serverTaskURL: serverTaskURL});
            background.sendTaskDataAndGetTaskId({request});

            sinon.assert.calledOnce(ajaxPostSpy);
            sinon.assert.calledWithExactly(ajaxPostSpy,
              serverTaskURL,
              taskData,
              10000
            );
          });

          it("should succeed to send task data, get the task id and call setTaskId(taskId)", function() {
            const callSetTaskIdSpy = sandbox.spy(background, "setTaskId");

            const serverTaskURL = "https://view.aleks.bg/act/task";

            const request = {
              action: "sendTaskDataAndGetTaskId",
              serverTaskURL: serverTaskURL,
              taskData: "some task data"
            };

            sandbox.useFakeServer();

            const taskId = 1;

            const serverData = {"task-id": taskId};

            sandbox.server.respondWith("POST", serverTaskURL,
              [200, {"Content-Type": "application/json"}, JSON.stringify(serverData)]);

            background.sendTaskDataAndGetTaskId({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(callSetTaskIdSpy);
            sinon.assert.calledWithExactly(callSetTaskIdSpy, taskId);
          });

          it("should set the task id", function() {
            const taskId = 1;

            background.setTaskId(taskId);

            sinon.assert.calledOnce(chrome.storage.local.set);
            sinon.assert.calledWith(chrome.storage.local.set, {taskId});
          });

          it("should succeed to send task data, but fail to receive data from the server", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const serverTaskURL = "https://view.aleks.bg/act/task";

            const request = {
              action: "sendTaskDataAndGetTaskId",
              serverTaskURL: serverTaskURL,
              taskData: "some task data"
            };

            sandbox.useFakeServer();

            sandbox.server.respondWith("POST", serverTaskURL,
              [200, {"Content-Type": "application/json"}, ""]);

            background.sendTaskDataAndGetTaskId({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("no-task-data");
          });

          it("should fail to send task data, and call signOut()", function() {
            const signOutSpy = sandbox.spy(background, "signOut");

            const serverTaskURL = "https://view.aleks.bg/act/task";

            const request = {
              action: "sendTaskDataAndGetTaskId",
              serverTaskURL: serverTaskURL,
              taskData: "some task data"
            };

            sandbox.useFakeServer();

            sandbox.server.respondWith("POST", serverTaskURL,
              [404, {}, ""]);

            background.sendTaskDataAndGetTaskId({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(signOutSpy);
          });

          it("should fail to send task data, and create a 'auth-token-expired' notification", function() {
            const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

            const serverTaskURL = "https://view.aleks.bg/act/task";

            const request = {
              action: "sendTaskDataAndGetTaskId",
              serverTaskURL: serverTaskURL,
              taskData: "some task data"
            };

            sandbox.useFakeServer();

            sandbox.server.respondWith("POST", serverTaskURL,
              [404, {}, ""]);

            background.sendTaskDataAndGetTaskId({request});

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
          it("should process the message 'sendTrackingData'", function() {
            const sendTrackingDataSpy = sandbox.spy(background, "sendTrackingData");

            const request = {
              action: "sendTrackingData",
              serverTrackingURL: "https://view.aleks.bg/act/tracking",
              trackingData: "some tracking data"
            };
            const sender = {tab: {id: 5}};
            const sendResponse = sandbox.spy();
            const parameters = {
              request,
              sender,
              sendResponse
            };

            chrome.runtime.onMessage.trigger(request, sender, sendResponse);

            sinon.assert.calledOnce(sendTrackingDataSpy);
            sinon.assert.calledWithExactly(sendTrackingDataSpy, parameters);
          });

          it("should call ajaxPost(url, data, ajaxTimeout)", function() {
            const ajaxPostSpy = sandbox.spy(background, "ajaxPost");

            const serverTrackingURL = "https://view.aleks.bg/act/tracking";
            const trackingData = "some tracking data";

            const request = {
              action: "sendTrackingData",
              trackingData: trackingData
            };

            chrome.storage.local.get.yields({serverTrackingURL: serverTrackingURL});
            background.sendTrackingData({request});

            sinon.assert.calledOnce(ajaxPostSpy);
            sinon.assert.calledWithExactly(ajaxPostSpy,
              serverTrackingURL,
              trackingData,
              10000
            );
          });

          it("should succeed to send tracking data, get the submission response data and call requestToShowFeedback(data)", function() {
            const callShowFeedbackSpy = sandbox.spy(background, "requestToShowFeedback");

            const serverTrackingURL = "https://view.aleks.bg/act/tracking";
            const trackingData = "some tracking data";

            const request = {
              action: "sendTrackingData",
              serverTrackingURL: serverTrackingURL,
              trackingData: trackingData
            };

            sandbox.useFakeServer();

            const submissionResponseData = "some submission response data";

            sandbox.server.respondWith("POST", serverTrackingURL,
              [200, {"Content-Type": "application/json"}, JSON.stringify(submissionResponseData)]);

            background.sendTrackingData({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(callShowFeedbackSpy);
            sinon.assert.calledWithExactly(callShowFeedbackSpy, submissionResponseData);
          });

          it("should send a request to call view.feedbacker.showFeedback(data)", function() {
            const submissionResponseData = "some submission response data";

            background.currentTabId = 5;

            background.requestToShowFeedback(submissionResponseData);

            sinon.assert.calledOnce(chrome.tabs.sendMessage);
            sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
              action: "showFeedback",
              submissionResponseData: submissionResponseData
            });
          });

          it("should succeed to send tracking data, but fail to receive data from the server", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const serverTrackingURL = "https://view.aleks.bg/act/tracking";
            const trackingData = "some tracking data";

            const request = {
              action: "sendTrackingData",
              serverTrackingURL: serverTrackingURL,
              trackingData: trackingData
            };

            sandbox.useFakeServer();

            sandbox.server.respondWith("POST", serverTrackingURL,
              [200, {"Content-Type": "application/json"}, ""]);

            background.sendTrackingData({request});

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
          it("should process the message 'getAllTasks'", function() {
            const getAllTasksSpy = sandbox.spy(background, "getAllTasks");

            const request = {
              action: "getAllTasks",
              ajaxTimeout: 10000,
              serverTaskURL: "https://view.aleks.bg/act/task",
              queryParam: "?token=token"
            };
            const sender = {tab: {id: 5}};
            const sendResponse = sandbox.spy();
            const parameters = {
              request,
              sender,
              sendResponse
            };

            chrome.runtime.onMessage.trigger(request, sender, sendResponse);

            sinon.assert.calledOnce(getAllTasksSpy);
            sinon.assert.calledWithExactly(getAllTasksSpy, parameters);
          });

          it("should succeed to get all tasks and call requestToShowAllTasks(data)", function() {
            const callShowAllTasksSpy = sandbox.spy(background, "requestToShowAllTasks");

            const serverTaskURL= "https://view.aleks.bg/act/task";
            const queryParam = "?token=token";

            const request = {
              action: "getAllTasks",
              serverTaskURL: serverTaskURL,
              queryParam: queryParam
              // ajaxTimeout not given by request to test "or branch"
            };

            sandbox.useFakeServer();

            const serverURL = serverTaskURL + queryParam;
            const serverData = "some server data";

            sandbox.server.respondWith("GET", serverURL,
              [200, {"Content-Type": "text"}, serverData]);

            background.getAllTasks({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(callShowAllTasksSpy);
            sinon.assert.calledWithExactly(callShowAllTasksSpy, serverData);
          });

          it("should send a request to the content script to call view.feedbacker.showAllTasks(data)", function() {
            const serverData = "some server data";

            background.currentTabId = 5;

            background.requestToShowAllTasks(serverData);

            sinon.assert.calledOnce(chrome.tabs.sendMessage);
            sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
              action: "showAllTasks",
              tasksData: serverData
            });
          });

          it("should succeed to get all tasks but fail to receive data from the server", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const serverTaskURL= "https://view.aleks.bg/act/task";
            const queryParam = "?token=token";

            const request = {
              action: "getAllTasks",
              ajaxTimeout: 10000,
              serverTaskURL: serverTaskURL,
              queryParam: queryParam
            };

            sandbox.useFakeServer();

            const serverURL = serverTaskURL + queryParam;

            sandbox.server.respondWith("GET", serverURL,
              [200, {"Content-Type": "text"}, ""]);

            background.getAllTasks({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("no-task-data");
          });

          it("should fail to send activity data", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const serverTaskURL= "https://view.aleks.bg/act/task";
            const queryParam = "?token=token";

            const request = {
              action: "getAllTasks",
              ajaxTimeout: 10000,
              serverTaskURL: serverTaskURL,
              queryParam: queryParam
            };

            sandbox.useFakeServer();

            const serverURL = serverTaskURL + queryParam;

            sandbox.server.respondWith("GET", serverURL,
              [404, {}, ""]);

            background.getAllTasks({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("error");
          });
        });

        describe("getTask", function() {
          it("should process the message 'getTask'", function() {
            const getTaskSpy = sandbox.spy(background, "getTask");

            const request = {
              action: "getTask",
              ajaxTimeout: 10000,
              serverTrackingURL: "https://view.aleks.bg/act/tracking",
              queryParam: "?token=token&taskId=7"
            };
            const sender = {tab: {id: 5}};
            const sendResponse = sandbox.spy();
            const parameters = {
              request,
              sender,
              sendResponse
            };

            chrome.runtime.onMessage.trigger(request, sender, sendResponse);

            sinon.assert.calledOnce(getTaskSpy);
            sinon.assert.calledWithExactly(getTaskSpy, parameters);
          });

          it("should succeed to get the task and call requestToShowTask(data)", function() {
            const ccallShowTaskSpy = sandbox.spy(background, "requestToShowTask");

            const serverTrackingURL= "https://view.aleks.bg/act/tracking";
            const queryParam = "?token=token&taskId=7";

            const request = {
              action: "getTask",
              serverTrackingURL: serverTrackingURL,
              queryParam: queryParam
              // ajaxTimeout not given by request to test "or branch"
            };

            sandbox.useFakeServer();

            const serverURL = serverTrackingURL + queryParam;
            const serverData = "some server data";

            sandbox.server.respondWith("GET", serverURL,
              [200, {"Content-Type": "text"}, serverData]);

            background.getTask({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(ccallShowTaskSpy);
            sinon.assert.calledWithExactly(ccallShowTaskSpy, serverData);
          });

          it("should send a request to the content script to call view.feedbacker.showTask(data)", function() {
            const serverData = "some server data";

            background.currentTabId = 5;

            background.requestToShowTask(serverData);

            sinon.assert.calledOnce(chrome.tabs.sendMessage);
            sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
              action: "showTask",
              performancesData: serverData
            });
          });

          it("should succeed to get all tasks but fail to receive data from the server", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const serverTrackingURL= "https://view.aleks.bg/act/tracking";
            const queryParam = "?token=token&taskId=7";

            const request = {
              action: "getTask",
              serverTrackingURL: serverTrackingURL,
              queryParam: queryParam
            };

            sandbox.useFakeServer();

            const serverURL = serverTrackingURL + queryParam;

            sandbox.server.respondWith("GET", serverURL,
              [200, {"Content-Type": "text"}, ""]);

            background.getTask({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("no-performance-data");
          });

          it("should fail to send activity data", function() {
            const ajaxErrorSpy = sandbox.spy(background, "ajaxError");

            const serverTrackingURL= "https://view.aleks.bg/act/tracking";
            const queryParam = "?token=token&taskId=7";

            const request = {
              action: "getTask",
              serverTrackingURL: serverTrackingURL,
              queryParam: queryParam
            };

            sandbox.useFakeServer();

            const serverURL = serverTrackingURL + queryParam;

            sandbox.server.respondWith("GET", serverURL,
              [404, {}, ""]);

            background.getTask({request});

            sandbox.server.respond();

            sinon.assert.calledOnce(ajaxErrorSpy);
            expect(ajaxErrorSpy.firstCall.args[1]).to.equal("error");
          });
        });
      });

      describe("ajaxError", function() {
        it("should send a request to the content script to return to the initial interaction state", function() {
          background.currentTabId = 5;

          background.requestToCallInitialInteractionState();

          sinon.assert.calledOnce(chrome.tabs.sendMessage);
          sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {action: "initialInteractionState"});
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

        it("should create the 'timeout-notification'", function() {
          const createBasicNotificationSpy = sandbox.spy(background, "createBasicNotification");

          const id = "timeout-notification";
          const title = "Timeout!";
          const message = "The VIEW server is taking too long to respond.";

          background.ajaxError({}, "timeout");

          sinon.assert.calledOnce(createBasicNotificationSpy);
          sinon.assert.calledWithExactly(createBasicNotificationSpy, id, title, message);
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

    describe("processUserIdCookie", function() {
      it("should sign out the user as the cookie got removed", function() {
        const signOutSpy = sandbox.spy(background, "signOut");

        background.processUserIdCookie({removed: true});

        sinon.assert.calledOnce(signOutSpy);
      });

      it("should sign in the user as the cookie has a value", function() {
        const signInSpy = sandbox.spy(background, "signIn");

        const cookieInfo = {
          name: "wertiview_userid",
          value: "name/email/id"
        };

        const cookieChangeInfo = {
          cookie: cookieInfo
        };

        background.processUserIdCookie(cookieChangeInfo);

        sinon.assert.calledOnce(signInSpy);
        sinon.assert.calledWithExactly(signInSpy, cookieInfo.value);
      });

      it("should call requestToSetAccountInfo() in any case", function() {
        const requestToSetAccountInfoSpy = sandbox.spy(background, "requestToSetAccountInfo");

        const cookieInfo = {
          name: "wertiview_userid",
          value: "name/email/id"
        };

        const cookieChangeInfo = {
          cookie: cookieInfo
        };

        background.processUserIdCookie(cookieChangeInfo);

        sinon.assert.calledOnce(requestToSetAccountInfoSpy);
      });

      it("should send the message to call view.accountMenu.setAccountInfo()", function() {
        background.currentTabId = 5;

        background.requestToSetAccountInfo();

        sinon.assert.calledOnce(chrome.tabs.sendMessage);
        sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {action: "setAccountInfo"});
      });
    });

    describe("signOut", function() {
      it("should reset user email, user id, user, token and task id", function() {
        background.signOut();

        sinon.assert.calledOnce(chrome.storage.local.set);
        sinon.assert.calledWith(chrome.storage.local.set, {
          userEmail: "",
          userid: "",
          user: "",
          token: "",
          taskId: ""
        });
      });

      it("should call requestToSignOut()", function() {
        const requestToSignOutSpy = sandbox.spy(background, "requestToSignOut");

        background.signOut();

        sinon.assert.calledOnce(requestToSignOutSpy);
      });

      it("should send the message to call view.accountMenu.signOut()", function() {
        background.currentTabId = 5;

        background.requestToSignOut();

        sinon.assert.calledOnce(chrome.tabs.sendMessage);
        sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {action: "signOut"});
      });
    });

    describe("signIn", function() {
      it("should set user email, user id, user and token", function() {
        const encodedUser = "user%20name";
        const userData = encodedUser + "/email/id/authtoken";
        const userEmail = "email";
        const userid = "id";
        const user = "user name";
        const token = "authtoken";

        background.signIn(userData);

        sinon.assert.calledOnce(chrome.storage.local.set);
        sinon.assert.calledWith(chrome.storage.local.set, {
          userEmail: userEmail,
          userid: userid,
          user: user,
          token: token
        });
      });

      it("should call requestToSignIn()", function() {
        const requestToSignInSpy = sandbox.spy(background, "requestToSignIn");

        const user = "user name";

        background.signIn(user + "/email/id/authtoken");

        sinon.assert.calledOnce(requestToSignInSpy);
        sinon.assert.calledWithExactly(requestToSignInSpy, user);

      });

      it("should send the message to view.accountMenu.signIn()", function() {
        background.currentTabId = 5;

        const user = "user name";

        background.requestToSignIn(user);

        sinon.assert.calledOnce(chrome.tabs.sendMessage);
        sinon.assert.calledWithExactly(chrome.tabs.sendMessage, 5, {
          action: "signIn",
          user: user
        });
      });
    });
  });
});
