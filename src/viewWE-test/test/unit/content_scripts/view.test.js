/**
 * Tests for the view.js file of the VIEW add-on.
 *
 * Created by eduard on 11.01.17.
 */

"use strict";

describe("view.js", function() {
  let sandbox;
  const theServerURL = "https://view.aleks.bg";

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sandbox.stub($.fn, "load").yields();
  });

  afterEach(function() {
    sandbox.restore();
    chrome.runtime.sendMessage.reset();
    chrome.storage.local.get.reset();
    chrome.storage.local.set.reset();
    view.serverURL = theServerURL;
    view.servletURL = theServerURL + "/view";
    view.serverTaskURL = theServerURL + "/act/task";
    view.serverTrackingURL = theServerURL + "/act/tracking";
    view.authenticator = theServerURL + "/authenticator.html";
    view.topics = {};
    view.userEmail = "";
    view.userid = "";
    view.user = "";
    view.token = "";
    view.taskId = "";
    view.enabled = false;

    view.timestamp = "";
    view.numberOfExercises = 0;

    view.fixedOrPercentage = 0;
    view.fixedNumberOfExercises = 25;
    view.percentageOfExercises = 100;
    view.choiceMode = 0;
    view.firstOffset = 0;
    view.intervalSize = 1;
    view.showInst = false;
    view.debugSentenceMarkup = false;

    view.enabled = false; // should the page be enhanced right away?
    view.language = "unselected";
    view.topic = "unselected";
    view.filter = "unselected";
    view.activity = "unselected";

    $("#view-toolbar-iframe").remove();
  });

  describe("setGeneralOptionsAndInitToolbar", function() {
    it("should send a request to send the topics", function() {
      view.setGeneralOptionsAndInitToolbar();

      sinon.assert.calledOnce(chrome.runtime.sendMessage);
      sinon.assert.calledWith(chrome.runtime.sendMessage, {action: "sendTopics"});
    });

    it("should get the expected storage items", function() {
      const responseData = {topics: "some topics data"};

      chrome.runtime.sendMessage.yields(responseData);

      view.setGeneralOptionsAndInitToolbar();

      sinon.assert.calledOnce(chrome.storage.local.get);
      sinon.assert.calledWith(chrome.storage.local.get, [
        "serverURL",
        "servletURL",
        "serverTaskURL",
        "serverTrackingURL",
        "authenticator",
        "userEmail",
        "userid",
        "user",
        "token",
        "taskId",
        "enabled"
      ]);
    });

    it("should call setAllGeneralOptions(storageItems, topics)", function() {
      const setAllGeneralOptionsSpy = sandbox.spy(view, "setAllGeneralOptions");

      const responseData = {topics: "some topics data"};
      const storageItems = {};

      chrome.runtime.sendMessage.yields(responseData);

      chrome.storage.local.get.yields(storageItems);

      view.setGeneralOptionsAndInitToolbar();

      sinon.assert.calledOnce(setAllGeneralOptionsSpy);
      sinon.assert.calledWithExactly(setAllGeneralOptionsSpy,
        storageItems,
        responseData.topics
      );
    });

    describe("setAllGeneralOptions", function() {
      it("should call setFixedGeneralOptions(topics)", function() {
        const setFixedGeneralOptionsSpy = sandbox.spy(view, "setFixedGeneralOptions");

        const responseData = {topics: "some topics data"};
        const storageItems = {};

        view.setAllGeneralOptions(storageItems, responseData.topics);

        sinon.assert.calledOnce(setFixedGeneralOptionsSpy);
        sinon.assert.calledWithExactly(setFixedGeneralOptionsSpy, responseData.topics);
      });

      it("should set all fixed general options", function() {
        const topics = "some topics data";

        view.setFixedGeneralOptions(topics);

        expect(view.topics).to.equal(topics);

        sinon.assert.calledOnce(chrome.storage.local.set);
        sinon.assert.calledWithExactly(chrome.storage.local.set, {
          cookie_name: "wertiview_userid",
          cookie_path: "/VIEW/openid",
          ajaxTimeout: 60000
        });
      });

      it("should call setMutableGeneralOptions(storageItems)", function() {
        const setMutableGeneralOptionsSpy = sandbox.spy(view, "setMutableGeneralOptions");

        const responseData = {topics: "some topics data"};
        const storageItems = {};

        view.setAllGeneralOptions(storageItems, responseData.topics);

        sinon.assert.calledOnce(setMutableGeneralOptionsSpy);
        sinon.assert.calledWithExactly(setMutableGeneralOptionsSpy, storageItems);
      });

      describe("setMutableGeneralOptions", function() {
        it("should call setServerOptions(storageItems)", function() {
          const setServerOptionsSpy = sandbox.spy(view, "setServerOptions");

          const storageItems = {};

          view.setMutableGeneralOptions(storageItems);

          sinon.assert.calledOnce(setServerOptionsSpy);
          sinon.assert.calledWithExactly(setServerOptionsSpy, storageItems);
        });

        describe("setServerOptions", function() {
          it("should call setServerOptionsFromStorage(storageItems), because the server url is defined", function() {
            const setServerOptionsSpy = sandbox.spy(view, "setServerOptions");

            const storageItems = {serverURL: "some server"};

            view.setServerOptions(storageItems);

            sinon.assert.calledOnce(setServerOptionsSpy);
            sinon.assert.calledWithExactly(setServerOptionsSpy, storageItems);
          });

          it("should set the server, servlet url and tracking urls to the storage values", function() {
            const serverURL = "http://localhost:8080";
            const servletURL = serverURL + "/view";
            const serverTaskURL = serverURL + "/act/task";
            const serverTrackingURL = serverURL + "/act/tracking";
            const authenticator = serverURL + "/authenticator.html";

            const storageItems = {
              serverURL,
              servletURL,
              serverTaskURL,
              serverTrackingURL,
              authenticator
            };

            view.setServerOptionsFromStorage(storageItems);

            expect(view.serverURL).to.equal(serverURL);
            expect(view.servletURL).to.equal(serverURL + "/view");
            expect(view.serverTaskURL).to.equal(serverURL + "/act/task");
            expect(view.serverTrackingURL).to.equal(serverURL + "/act/tracking");
          });

          it("should call setServerOptionsToStorage(), because the server url is undefined", function() {
            const setServerOptionsToStorageSpy = sandbox.spy(view, "setServerOptionsToStorage");

            const storageItems = {};

            view.setServerOptions(storageItems);

            sinon.assert.calledOnce(setServerOptionsToStorageSpy);
          });

          it("should set the server, servlet url and tracking urls to local storage", function() {
            const server = "some server";
            view.serverURL = server;
            view.servletURL = server + "/view";
            view.serverTaskURL = server + "/act/task";
            view.serverTrackingURL = server + "/act/tracking";
            view.authenticator = server + "/authenticator.html";

            view.setServerOptionsToStorage();

            sinon.assert.calledOnce(chrome.storage.local.set);
            sinon.assert.calledWithExactly(chrome.storage.local.set, {
              serverURL: view.serverURL,
              servletURL: view.servletURL,
              serverTaskURL: view.serverTaskURL,
              serverTrackingURL: view.serverTrackingURL,
              authenticator: view.authenticator
            });
          });
        });

        it("should call setAuthenticationDetails(storageItems)", function() {
          const setAuthenticationDetailsSpy = sandbox.spy(view, "setAuthenticationDetails");

          const storageItems = {};

          view.setMutableGeneralOptions(storageItems);

          sinon.assert.calledOnce(setAuthenticationDetailsSpy);
          sinon.assert.calledWithExactly(setAuthenticationDetailsSpy, storageItems);
        });

        describe("setAuthenticationDetails", function() {
          it("should set authentication details to the defaults, as the id is undefined", function() {
            view.setAuthenticationDetails({});

            sinon.assert.calledOnce(chrome.storage.local.set);
            sinon.assert.calledWithExactly(chrome.storage.local.set, {
              userEmail: "",
              userid: "",
              user: "",
              token: ""
            });
          });

          it("should set authentication details from storage, as the id is defined", function() {
            const userEmail = "some.email";
            const userid = "someid";
            const user = "some user";
            const token = "some token";
            const storageItems = {
              userEmail,
              userid,
              user,
              token
            };

            view.setAuthenticationDetails(storageItems);

            expect(view.userEmail).to.equal(userEmail);
            expect(view.userid).to.equal(userid);
            expect(view.user).to.equal(user);
            expect(view.token).to.equal(token);
          });
        });

        it("should call setAutoEnhance(enabled)", function() {
          const setAutoEnhanceSpy = sandbox.spy(view, "setAutoEnhance");

          const enabled = true;
          const storageItems = {enabled};

          view.setMutableGeneralOptions(storageItems);

          sinon.assert.calledOnce(setAutoEnhanceSpy);
          sinon.assert.calledWithExactly(setAutoEnhanceSpy, enabled);
        });

        it("should set the auto enhance option to the default, as enabled is undefined", function() {
          view.setAutoEnhance(undefined);

          sinon.assert.calledOnce(chrome.storage.local.set);
          sinon.assert.calledWithExactly(chrome.storage.local.set, {enabled: false});
        });

        describe("setLatestTaskId", function() {
          it("should set the latest task id to the default, as the task id is undefined", function() {
            view.setLatestTaskId(undefined);

            sinon.assert.calledOnce(chrome.storage.local.set);
            sinon.assert.calledWithExactly(chrome.storage.local.set, {taskId: ""});
          });

          it("should set the latest task id from storage, as the task id is defined", function() {
            const taskId = 5;

            view.setLatestTaskId(taskId);

            expect(view.taskId).to.equal(taskId);
          });
        });
      });
    });
  });

  describe("startToEnhance", function() {
    it("should get the expected storage items", function() {
      view.startToEnhance();

      sinon.assert.calledOnce(chrome.storage.local.get);
      sinon.assert.calledWith(chrome.storage.local.get, [
        "serverURL",
        "servletURL",
        "serverTaskURL",
        "serverTrackingURL",
        "authenticator",
        "fixedOrPercentage",
        "fixedNumberOfExercises",
        "percentageOfExercises",
        "choiceMode",
        "firstOffset",
        "intervalSize",
        "showInst",
        "debugSentenceMarkup",
        "userEmail",
        "userid",
        "user",
        "token",
        "timestamp",
        "enabled",
        "language",
        "topic",
        "filter",
        "activity"
      ]);
    });

    it("should call setUserOptions(storageItems)", function() {
      const setUserOptionsSpy = sandbox.spy(view, "setUserOptions");

      const storageItems = {topic: "articles"};

      chrome.storage.local.get.yields(storageItems);

      view.startToEnhance();

      sinon.assert.calledOnce(setUserOptionsSpy);
      sinon.assert.calledWithExactly(setUserOptionsSpy, storageItems);
    });

    describe("setUserOptions", function() {
      it("should save all user options from the options page, as serverURL is defined", function() {
        const serverURL = "http://localhost:8080";
        const servletURL = serverURL + "/view";
        const serverTaskURL = serverURL + "/act/task";
        const serverTrackingURL = serverURL + "/act/tracking";
        const authenticator = serverURL + "/authenticator.html";
        const fixedOrPercentage = 1;
        const fixedNumberOfExercises = 30;
        const percentageOfExercises = 90;
        const choiceMode = 1;
        const firstOffset = 5;
        const intervalSize = 3;
        const showInst = false;
        const debugSentenceMarkup = false;

        const storageItems = {
          serverURL,
          servletURL,
          serverTaskURL,
          serverTrackingURL,
          authenticator,
          fixedOrPercentage,
          fixedNumberOfExercises,
          percentageOfExercises,
          choiceMode,
          firstOffset,
          intervalSize,
          showInst,
          debugSentenceMarkup
        };

        view.setUserOptions(storageItems);

        expect(view.serverURL).to.equal(serverURL);
        expect(view.servletURL).to.equal(servletURL);
        expect(view.serverTaskURL).to.equal(serverTaskURL);
        expect(view.serverTrackingURL).to.equal(serverTrackingURL);
        expect(view.authenticator).to.equal(authenticator);
        expect(view.fixedOrPercentage).to.equal(fixedOrPercentage);
        expect(view.fixedNumberOfExercises).to.equal(fixedNumberOfExercises);
        expect(view.percentageOfExercises).to.equal(percentageOfExercises);
        expect(view.choiceMode).to.equal(choiceMode);
        expect(view.firstOffset).to.equal(firstOffset);
        expect(view.intervalSize).to.equal(intervalSize);
        expect(view.showInst).to.equal(showInst);
        expect(view.debugSentenceMarkup).to.equal(debugSentenceMarkup);
      });

      it("should call setServerOptionsFromStorage(serverSelection), as serverURL is defined", function() {
        const setServerOptionsFromStorageSpy = sandbox.spy(view, "setServerOptionsFromStorage");

        const serverURL = "http://localhost:8080";
        const servletURL = serverURL + "/view";
        const serverTaskURL = serverURL + "/act/task";
        const serverTrackingURL = serverURL + "/act/tracking";
        const authenticator = serverURL + "/authenticator.html";
        const fixedOrPercentage = 1;
        const fixedNumberOfExercises = 30;
        const percentageOfExercises = 90;
        const choiceMode = 1;
        const firstOffset = 5;
        const intervalSize = 3;
        const showInst = false;
        const debugSentenceMarkup = false;

        const storageItems = {
          serverURL,
          servletURL,
          serverTaskURL,
          serverTrackingURL,
          authenticator,
          fixedOrPercentage,
          fixedNumberOfExercises,
          percentageOfExercises,
          choiceMode,
          firstOffset,
          intervalSize,
          showInst,
          debugSentenceMarkup
        };

        view.setUserOptions(storageItems);

        sinon.assert.calledOnce(setServerOptionsFromStorageSpy);
        sinon.assert.calledWithExactly(setServerOptionsFromStorageSpy, storageItems);
      });
    });

    it("should call setAuthenticationDetails(storageItems)", function() {
      const setAuthenticationDetailsSpy = sandbox.spy(view, "setAuthenticationDetails");

      const storageItems = {topic: "articles"};

      chrome.storage.local.get.yields(storageItems);

      view.startToEnhance();

      sinon.assert.calledOnce(setAuthenticationDetailsSpy);
      sinon.assert.calledWithExactly(setAuthenticationDetailsSpy, storageItems);
    });

    it("should call setSelections(storageItems)", function() {
      const setSelectionsSpy = sandbox.spy(view, "setSelections");

      const storageItems = {topic: "articles"};

      chrome.storage.local.get.yields(storageItems);

      view.startToEnhance();

      sinon.assert.calledOnce(setSelectionsSpy);
      sinon.assert.calledWithExactly(setSelectionsSpy, storageItems);
    });

    it("should save all user selections", function() {
      const enabled = true;
      const language = "en";
      const topic = "articles";
      const filter = "no-filter";
      const activity = "color";

      const storageItems = {
        enabled,
        language,
        topic,
        filter,
        activity
      };

      view.setSelections(storageItems);

      expect(view.enabled).to.equal(enabled);
      expect(view.language).to.equal(language);
      expect(view.topic).to.equal(topic);
      expect(view.filter).to.equal(filter);
      expect(view.activity).to.equal(activity);
    });

    it("should call setTimestamp(timestamp)", function() {
      const setTimestampSpy = sandbox.spy(view, "setTimestamp");

      const timestamp = 1000;
      const storageItems = {
        timestamp: timestamp,
        topic: "articles"
      };

      chrome.storage.local.get.yields(storageItems);

      view.startToEnhance();

      sinon.assert.calledOnce(setTimestampSpy);
      sinon.assert.calledWithExactly(setTimestampSpy, timestamp);
    });

    it("should set the timestamp", function() {
      const timestamp = 1000;

      view.setTimestamp(timestamp);

      expect(view.timestamp).to.equal(timestamp);
    });

    it("should call enhance()", function() {
      const enhanceSpy = sandbox.spy(view.enhancer, "enhance");

      const storageItems = {topic: "articles"};

      chrome.storage.local.get.yields(storageItems);

      view.startToEnhance();

      sinon.assert.calledOnce(enhanceSpy);
    });
  });

  describe("setNumberOfExercises", function() {
    it("should set the number of exercises", function() {
      view.setNumberOfExercises(10);

      expect(view.numberOfExercises).to.equal(10);
    });
  });

  describe("requestToSendTaskDataAndGetTaskId", function() {
    it("should call createTaskData()", function() {
      const createTaskDataSpy = sandbox.spy(view, "createTaskData");

      view.requestToSendTaskDataAndGetTaskId();

      sinon.assert.calledOnce(createTaskDataSpy);
    });

    it("should create task data", function() {
      const token = "some token";
      const url = "some url";
      const title = "some title";
      const language = "some language";
      const topic = "some topic";
      const filter = "some filter";
      const activity = "some activity";
      const timestamp = 99;
      const numberOfExercises = 100;

      view.token = token;
      view.url = url;
      view.title = title;
      view.language = language;
      view.topic = topic;
      view.filter = filter;
      view.activity = activity;
      view.timestamp = timestamp;
      view.numberOfExercises = numberOfExercises;

      const returnedTaskData = view.createTaskData();

      expect(returnedTaskData).to.eql({
        token,
        url,
        title,
        language,
        topic,
        filter,
        activity,
        timestamp,
        "number-of-exercises": numberOfExercises
      });
    });

    it("should send a request to get the task id from the server", function() {
      const taskData = view.createTaskData();

      view.requestToSendTaskDataAndGetTaskId();

      sinon.assert.calledOnce(chrome.runtime.sendMessage);
      sinon.assert.calledWith(chrome.runtime.sendMessage, {
        action: "sendTaskDataAndGetTaskId",
        taskData: taskData,
        serverTaskURL: "https://view.aleks.bg/act/task"
      });
    });
  });

  describe("setTaskId", function() {
    it("should set the task id", function() {
      const taskId = "some-task-id";

      chrome.storage.local.set.yields(taskId);

      view.setTaskId(taskId);

      expect(view.taskId).to.equal(taskId);
    });
  });
});
