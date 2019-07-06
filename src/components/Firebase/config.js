//<!-- The core Firebase JS SDK is always required and must be listed first -->
//<script src="https://www.gstatic.com/firebasejs/6.2.2/firebase-app.js"></script>

import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase';


// Your web app's Firebase configuration
const config = {
	apiKey: process.env.REACT_APP_API_KEY,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	databaseURL: process.env.REACT_APP_DATABASE_URL,
	projectId: process.env.REACT_APP_PROJECT_ID,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

class Firebase {
	constructor() {
		let firebaseApp = app.initializeApp(config);

		this.auth = app.auth();
		this.db = app.firestore(firebaseApp);
	}

	  // *** Auth API ***

	doCreateUserWithEmailAndPassword = (email, password) =>
		this.auth.createUserWithEmailAndPassword(email, password);

	doSignInWithEmailAndPassword = (email, password) =>
		this.auth.signInWithEmailAndPassword(email, password);

	doSignOut = () => this.auth.signOut();

	doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

	doPasswordUpdate = password =>
		this.auth.currentUser.updatePassword(password);
		
	// *** User API ***

	user = uid => this.db.ref(`users/${uid}`);

	users = () => this.db.ref('users');
}
  
export default Firebase;
