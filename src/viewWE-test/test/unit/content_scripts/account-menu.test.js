/**
 * Tests for the account-menu.js file of the VIEW add-on.
 *
 * Created by eduard on 13.06.17.
 */

"use strict";

describe("account-menu.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    fixture.load("/fixtures/account-menu.html");
    sandbox.stub($.fn, "load").yields();
  });

  afterEach(function() {
    sandbox.restore();
    chrome.runtime.sendMessage.reset();
    chrome.extension.getURL.reset();
    chrome.storage.local.get.reset();
    fixture.cleanup();
    view.user = "";
    view.userEmail = "";
    view.userid = "";
    view.token = "";
  });

  describe("jquery selectors", function() {
    it("should be able to find all required jquery selectors in the view menu", function() {
      // some selectors only need the element, its enough if they exist
      // some selectors need the val(), text() or attr("link"),
      // if there is the value we expect, they exist as well
      // maintain this test, if there are additions or changes
      // the expectations below don't need to be tested in other tests again
      // the selectors below can be freely used in the tests without problems

      expect($(view.accountMenu.selectorStart + "content").length).to.be.above(0);
      expect($(view.accountMenu.selectorStart + "user").length).to.be.above(0);
      expect($(view.accountMenu.selectorStart + "e-mail").length).to.be.above(0);
      expect($(view.accountMenu.selectorStart + "statistics").length).to.be.above(0);
      expect($(view.accountMenu.selectorStart + "sign-out").length).to.be.above(0);
    });
  });

  describe("add", function() {
    it("should get the url for the account menu", function() {
      view.accountMenu.add();

      sinon.assert.calledOnce(chrome.extension.getURL);
      sinon.assert.calledWithExactly(chrome.extension.getURL, "content_scripts/html/account-menu.html");
    });

    it("should call init()", function() {
      const initSpy = sandbox.spy(view.accountMenu, "init");

      view.accountMenu.add();

      sinon.assert.calledOnce(initSpy);
    });

    it("should call append(accountMenu)", function() {
      const selectorSpy = sandbox.spy($.fn, "find");
      const appendSpy = sandbox.spy($.fn, "append");

      view.accountMenu.add();

      sinon.assert.calledOnce(selectorSpy);
      sinon.assert.calledWithExactly(selectorSpy, "body");

      sinon.assert.calledOnce(appendSpy);
    });

    describe("init", function() {
      it("should call initStatisticsMenuHandler()", function() {
        const initStatisticsMenuHandlerSpy = sandbox.spy(view.accountMenu, "initStatisticsMenuHandler");

        view.accountMenu.init();

        sinon.assert.calledOnce(initStatisticsMenuHandlerSpy);
      });

      describe("initStatisticsMenuHandler", function() {
        it("should initialize the statistic menu handler", function() {
          const selectorSpy = sandbox.spy(document, "getElementById");
          const eventSpy = sandbox.spy($.fn, "on");

          view.accountMenu.initStatisticsMenuHandler();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy,
            view.accountMenu.selectorStart.substr(1) + "statistics"
          );

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call view.statisticsMenu.toggle() on click", function() {
          const statisticsMenuToggleSpy = sandbox.spy(view.statisticsMenu, "toggle");

          view.accountMenu.initStatisticsMenuHandler();

          $(view.accountMenu.selectorStart + "statistics").trigger("click");

          sinon.assert.calledOnce(statisticsMenuToggleSpy);
        });
      });

      it("should call initSignOutHandler()", function() {
        const initSignOutHandlerSpy = sandbox.spy(view.accountMenu, "initSignOutHandler");

        view.accountMenu.init();

        sinon.assert.calledOnce(initSignOutHandlerSpy);
      });

      describe("initSignOutHandler", function() {
        it("should initialize the sign out handler", function() {
          const selectorSpy = sandbox.spy(document, "getElementById");
          const eventSpy = sandbox.spy($.fn, "on");

          view.accountMenu.initSignOutHandler();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy,
            view.accountMenu.selectorStart.substr(1) + "sign-out"
          );

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call openSignOutWindow() on click", function() {
          const openSignOutWindowSpy = sandbox.spy(view.accountMenu, "openSignOutWindow");

          view.accountMenu.initSignOutHandler();

          $(view.accountMenu.selectorStart + "sign-out").trigger("click");

          sinon.assert.calledOnce(openSignOutWindowSpy);
        });

        describe("openSignOutWindow", function() {
          it("should open the sign out window", function() {
            const windowOpenSpy = sandbox.spy(window, "open");

            view.accountMenu.openSignOutWindow();

            sinon.assert.calledOnce(windowOpenSpy);
            sinon.assert.calledWithExactly(windowOpenSpy,
              "",
              "",
              "width=1,height=1"
            );
          });

          it("should get the expected values", function() {
            view.accountMenu.openSignOutWindow();

            sinon.assert.calledOnce(chrome.storage.local.get);
            sinon.assert.calledWith(chrome.storage.local.get, "authenticator");
          });

          it("should call assignHref(myWindow, authenticatorLink)", function() {
            const windowOpenSpy = sandbox.spy(window, "open");
            const assignHrefSpy = sandbox.spy(view.accountMenu, "assignHref");

            const authenticator = view.serverURL + "/authenticator.html";

            chrome.storage.local.get.yields({authenticator});

            view.accountMenu.openSignOutWindow();

            const signInWindow = windowOpenSpy.getCall(0).returnValue;

            sinon.assert.calledOnce(assignHrefSpy);
            sinon.assert.calledWith(assignHrefSpy,
              signInWindow,
              authenticator + "?action=sign-out"
            );
          });
        });
      });

      it("should call setAccountInfo()", function() {
        const setAccountInfoSpy = sandbox.spy(view.accountMenu, "setAccountInfo");

        view.accountMenu.init();

        sinon.assert.calledOnce(setAccountInfoSpy);
      });

      it("should set uesr name and e-mail", function() {
        const user = "user";
        const email = "email";

        view.user = user;
        view.userEmail = email;

        view.accountMenu.setAccountInfo();

        expect($(view.accountMenu.selectorStart + "user").text()).to.equal(user);
        expect($(view.accountMenu.selectorStart + "e-mail").text()).to.equal(email);
      });
    });
  });

  describe("hide", function() {
    it("should hide the account menu", function() {
      $(view.accountMenu.selectorStart + "content").show();

      view.accountMenu.hide();

      expect($(view.accountMenu.selectorStart + "content").is(":hidden")).to.be.true;
    });
  });

  describe("toggle", function() {
    it("should hide the account menu", function() {
      $(view.accountMenu.selectorStart + "content").show();

      view.accountMenu.toggle();

      expect($(view.accountMenu.selectorStart + "content").is(":hidden")).to.be.true;

      view.accountMenu.toggle();

      expect($(view.accountMenu.selectorStart + "content").is(":visible")).to.be.true;
    });
  });

  describe("signIn", function() {
    it("should set user email, user, user-id and token with the values in the request", function() {
      $(view.accountMenu.selectorStart + "content").show();

      const userEmail = "userEmail";
      const userid = "userid";
      const user = "user";
      const token = "token";

      const request = {
        userEmail,
        userid,
        user,
        token
      };

      view.accountMenu.signIn(request);

      expect(view.userEmail).to.equal(userEmail);
      expect(view.userid).to.equal(userid);
      expect(view.user).to.equal(user);
      expect(view.token).to.equal(token);
    });

    it("should call setAccountInfo()", function() {
      const setAccountInfoSpy = sandbox.spy(view.accountMenu, "setAccountInfo");

      const userEmail = "userEmail";
      const userid = "userid";
      const user = "user";
      const token = "token";

      const request = {
        userEmail,
        userid,
        user,
        token
      };

      view.accountMenu.signIn(request);

      sinon.assert.calledOnce(setAccountInfoSpy);
    });
  });

  describe("signOut", function() {
    it("should set user email, user, user-id and token to their default values", function() {
      $(view.accountMenu.selectorStart + "content").show();

      view.accountMenu.signOut();

      expect(view.userEmail).to.equal("");
      expect(view.userid).to.equal("");
      expect(view.user).to.equal("");
      expect(view.token).to.equal("");
    });

    it("should call setAccountInfo()", function() {
      const setAccountInfoSpy = sandbox.spy(view.accountMenu, "setAccountInfo");

      view.accountMenu.signOut();

      sinon.assert.calledOnce(setAccountInfoSpy);
    });
  });
});