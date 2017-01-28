/**
 * Tests for the view.js file of the VIEW add-on.
 *
 * Created by eduard on 11.01.17.
 */

"use strict";

describe("view.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
    chrome.runtime.sendMessage.reset();
    chrome.storage.local.get.reset();
    chrome.storage.local.set.reset();
    view.userEmail = "";
    view.userid = "";
    view.enabled = false;
  });

  describe("saveGeneralOptions", function() {
    it("should send a request to send the topics and then save the general options", function() {
      const setAllGeneralOptionsSpy = sandbox.spy(view, "setAllGeneralOptions");
      const responseData = {topics: "some topics data"};

      chrome.runtime.sendMessage.yields(responseData);

      chrome.storage.local.get.yields({});

      expect(view.topics).to.be.empty;

      view.saveGeneralOptions();

      expect(view.topics).to.equal(responseData.topics);

      sinon.assert.calledOnce(chrome.runtime.sendMessage);
      sinon.assert.calledWith(chrome.runtime.sendMessage, {msg: "call sendTopics"});

      sinon.assert.calledOnce(setAllGeneralOptionsSpy);
      sinon.assert.calledWithExactly(setAllGeneralOptionsSpy, {});
    });

    describe("setAllGeneralOptions", function() {
      it("should call setFixedGeneralOptions() and setMutableGeneralOptions(storageItems)", function() {
        const setFixedGeneralOptionsSpy = sandbox.spy(view, "setFixedGeneralOptions");
        const setMutableGeneralOptionsSpy = sandbox.spy(view, "setMutableGeneralOptions");

        view.setAllGeneralOptions({});

        sinon.assert.calledOnce(setFixedGeneralOptionsSpy);

        sinon.assert.calledOnce(setMutableGeneralOptionsSpy);
        sinon.assert.calledWithExactly(setMutableGeneralOptionsSpy, {});
      });

      it("should set all fixed general options", function() {
        view.setFixedGeneralOptions();

        sinon.assert.calledOnce(chrome.storage.local.set);
        sinon.assert.calledWithExactly(chrome.storage.local.set, {
          serverURL: view.serverURL,
          servletURL: view.servletURL,
          cookie_name: view.cookie_name,
          cookie_path: view.cookie_path,
          ajaxTimeout: view.ajaxTimeout
        });
      });

      describe("setMutableGeneralOptions", function() {
        it("should call setAuthenticationDetails(email, id) and setAutoEnhance(enabled)", function() {
          const setAuthenticationDetailsSpy = sandbox.spy(view, "setAuthenticationDetails");
          const setAutoEnhanceSpy = sandbox.spy(view, "setAutoEnhance");

          const userEmail = "some.email";
          const userid = "someid";
          const enabled = true;
          const storageItems = {
            userEmail,
            userid,
            enabled
          };

          view.setMutableGeneralOptions(storageItems);

          sinon.assert.calledOnce(setAuthenticationDetailsSpy);
          sinon.assert.calledWithExactly(setAuthenticationDetailsSpy, storageItems);

          sinon.assert.calledOnce(setAutoEnhanceSpy);
          sinon.assert.calledWithExactly(setAutoEnhanceSpy, enabled);
        });

        describe("setAuthenticationDetails", function() {
          it("should set the user email and id to the defaults, as the id is undefined", function() {
            const userEmail = "some.email";
            const userid = undefined;
            const storageItems = {
              userEmail,
              userid
            };

            view.setAuthenticationDetails(storageItems);

            sinon.assert.calledOnce(chrome.storage.local.set);
            sinon.assert.calledWithExactly(chrome.storage.local.set, {
              userEmail: view.userEmail,
              userid: view.userid
            });
          });

          it("should set the user email and id from storage, as the id is defined", function() {
            const userEmail = "some.email";
            const userid = "someid";
            const storageItems = {
              userEmail,
              userid
            };

            expect(view.userEmail).to.be.empty;
            expect(view.userid).to.be.empty;

            view.setAuthenticationDetails(storageItems);

            expect(view.userEmail).to.equal(userEmail);
            expect(view.userid).to.equal(userid);
          });
        });

        it("should set the auto enhance option to the default, as enabled is undefined", function() {
          const enabled = undefined;

          view.setAutoEnhance(enabled);

          sinon.assert.calledOnce(chrome.storage.local.set);
          sinon.assert.calledWithExactly(chrome.storage.local.set, {enabled: view.enabled});
        });
      });
    });
  });

  describe("startToEnhance", function() {
    it("should call saveUserOptions(storageItems), setAuthenticationDetails(email, id), saveSelections(storageItems) and enhance()", function() {
      const saveUserOptionsSpy = sandbox.spy(view, "saveUserOptions");
      const setAuthenticationDetailsSpy = sandbox.spy(view, "setAuthenticationDetails");
      const saveSelectionsSpy = sandbox.spy(view, "saveSelections");
      const enhanceSpy = sandbox.spy(view.interaction, "enhance");
      const getTopicNameSpy = sandbox.spy(view.interaction, "getTopicName");

      const topic = "articles";
      const userEmail = "some.email";
      const userid = "someid";

      const storageItems = {
        topic,
        userEmail,
        userid
      };

      chrome.storage.local.get.yields(storageItems);

      view.startToEnhance();

      sinon.assert.calledOnce(saveUserOptionsSpy);
      sinon.assert.calledWithExactly(saveUserOptionsSpy, storageItems);

      sinon.assert.calledOnce(setAuthenticationDetailsSpy);
      sinon.assert.calledWithExactly(setAuthenticationDetailsSpy, storageItems);

      sinon.assert.calledOnce(saveSelectionsSpy);
      sinon.assert.calledWithExactly(saveSelectionsSpy, storageItems);

      sinon.assert.calledOnce(getTopicNameSpy);
      sinon.assert.calledWithExactly(getTopicNameSpy, view.topic);

      expect(view.topicName).to.equal("pos");

      sinon.assert.calledOnce(enhanceSpy);
    });

    it("should save all user options from the options page, as fixedOrPercentage is defined", function() {
      const fixedOrPercentage = "1";
      const fixedNumberOfExercises = "30";
      const percentageOfExercises = "90";
      const choiceMode = "1";
      const firstOffset = "5";
      const intervalSize = "3";
      const showInst = true;

      const storageItems = {
        fixedOrPercentage,
        fixedNumberOfExercises,
        percentageOfExercises,
        choiceMode,
        firstOffset,
        intervalSize,
        showInst
      };

      chrome.storage.local.get.yields(storageItems);

      view.saveUserOptions(storageItems);

      expect(view.fixedOrPercentage).to.equal(fixedOrPercentage);
      expect(view.fixedNumberOfExercises).to.equal(fixedNumberOfExercises);
      expect(view.percentageOfExercises).to.equal(percentageOfExercises);
      expect(view.choiceMode).to.equal(choiceMode);
      expect(view.firstOffset).to.equal(firstOffset);
      expect(view.intervalSize).to.equal(intervalSize);
      expect(view.showInst).to.equal(showInst);
    });

    it("should save all user selections", function() {
      const enabled = true;
      const language = "en";
      const topic = "articles";
      const activity = "color";

      const storageItems = {
        enabled,
        language,
        topic,
        activity
      };

      chrome.storage.local.get.yields(storageItems);

      view.saveSelections(storageItems);

      expect(view.enabled).to.equal(enabled);
      expect(view.language).to.equal(language);
      expect(view.topic).to.equal(topic);
      expect(view.activity).to.equal(activity);
    });
  });
});
