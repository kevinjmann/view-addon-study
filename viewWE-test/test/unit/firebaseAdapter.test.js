import FirebaseAdapter from '../../../viewWE/firebaseAdapter.js';
import view from '../../../viewWE/content_scripts/js/view.js';

describe("FirebaseAdapter", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  it("Displays a notification when firebase throws an error", () => {
    const firebase = new FirebaseAdapter();
    const addNotification = sandbox.stub(view.notification, "add");
    firebase.initialize({foo: "bar"});

    sinon.assert.calledOnce(addNotification);
  });
});
