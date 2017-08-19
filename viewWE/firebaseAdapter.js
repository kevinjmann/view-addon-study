import firebase from 'firebase';
import view from './content_scripts/js/view';
import Storage from './Storage';

export default class FirebaseAdapter {
  static firebaseApp = undefined;
  static user = undefined;

  static initialise(firebaseData) {
    if (this.firebaseApp === undefined) {
      try {
        this.firebaseApp = firebase.initializeApp(firebaseData);
      } catch (error) {
        // We don't propagate the duplicate app exception, and silently ignore it.
        if (!(error.name === "FirebaseError" && error.code === "app/duplicate app")) {
          view.notification.add("Firebase error: " + error.message);
        }
      }
    }
  }

  static async getToken() {
    const storage = new Storage();

    if (this.firebaseApp === undefined) {
      const firebaseData = await storage.get('firebaseData');
      this.initialise(firebaseData.firebaseData);
    }

    if (this.user === undefined) {
      const customToken = await storage.get('customToken');
      this.user = await this.getUser(customToken.customToken);
    }

    return this.user.getIdToken();
  }

  static async getUser(token) {
    return firebase.auth().signInWithCustomToken(token);
  }
}
