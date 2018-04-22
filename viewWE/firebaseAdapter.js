import firebase from 'firebase';
import view from './content_scripts/js/view';
import Storage from './Storage';

export default class FirebaseAdapter {
  static firebaseApp = undefined;
  static user = undefined;
  
  static async initialise() {
    if (this.firebaseApp === undefined) {
      try {
        const storage = new Storage();
        const firebaseData = await storage.get('firebaseData');
        this.firebaseApp = firebase.initializeApp(firebaseData.firebaseData);
      } catch (error) {
        // We don't propagate the duplicate app exception, and silently ignore it.
        if (!(error.name === "FirebaseError" && error.code === "app/duplicate app")) {
          view.notification.add("Firebase error: " + error.message);
        }
      }
    }
  }

  static async getToken() {
    await this.initialise();
    const user = await this.getUser();
    const token = await user.getIdToken();

    return token;
  }

  static async getUser() {
    const storage = new Storage();
    if (this.user === undefined) {
      const customToken = await storage.get('customToken');
      // var customToken="eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImV4cCI6MTUyMDAxNjg3MSwiaWF0IjoxNTIwMDEzMjcxLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay0xNmIzY0B2aWV3LTkwOTRlLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstMTZiM2NAdmlldy05MDk0ZS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6ImxzamdDN251SGxmVDRvUzFESkVUSFMweHM2eDEifQ.coQSmn1w26bmObzs7HuW1ZKkdta6wr_UlhwhVeO6mO-JIldnuo1j_dxVHLlqU936pXlgH6uHzG5dCfSDRLSrRrDdLCUGfF4Vv2B3prnUtGY90qPq0kVY45J-1TsbHI1wfpNES0oSUrSy2m2-05fH4A6MAMi6qFhnQYj1-ACBCLAE2rN924Cx8PzgJlQYSAqxLbY42P_cUGgIdutQ-8mvpAzOpKv4AsYDHY0UU-oOdhi8xNDvHhCUlc-6CXtHuo-HJnee4qzA6b8DtQRJ1Aqdi-y9TTlPqVMaN0bFS1yIGB4jDGzL028s_zipKbfDmi7WeozoEi48DRNmu_WcYCQwkQ"
      const user = await firebase.auth().signInWithCustomToken(customToken.customToken);
      this.user = user;
    }
    return this.user;
  }
  
}
