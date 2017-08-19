import firebase from 'firebase';
import view from './content_scripts/js/view.js';

export default class FirebaseAdapter {
  constructor(firebaseData) {
    this.initialize(firebaseData);
  }

  initialize(firebaseData) {
    try {
      firebase.initializeApp(firebaseData);
    } catch (error) {
      // We don't propagate the duplicate app exception, and silently ignore it.
      if (!(error.name === "FirebaseError" && error.code === "app/duplicate app")) {
        view.notification.add("Firebase error: " + error.message);
      }
    }
  }

  getNewToken(oldToken) {
    return oldToken;
  }

  getUser(token) {
    return firebase.auth().signInWithCustomToken(token);
  }
}
