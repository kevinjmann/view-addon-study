import firebase from 'firebase';
import FirebaseAdapter from '../../../viewWE/firebaseAdapter.js';
import view from '../../../viewWE/content_scripts/js/view.js';

describe("FirebaseAdapter", () => {
  let sandbox;
  let addNotification;
  before(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Displays a notification when firebase throws an error", () => {
    addNotification = sandbox.stub(view.notification, "add");
    new FirebaseAdapter({foo: "bar"});
    sinon.assert.calledOnce(addNotification);
  });

  it("Doesn't log a notification on duplicate app error", () => {
    addNotification = sandbox.stub(view.notification, "add");
    const initializeFirebase = sandbox.stub(firebase, "initializeApp");
    initializeFirebase.throws({
      "name": "FirebaseError",
      "code": "app/duplicate app"
    });

    new FirebaseAdapter({foo: "bar"});

    sinon.assert.notCalled(addNotification);
  });
});
