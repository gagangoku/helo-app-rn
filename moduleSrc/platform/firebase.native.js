import * as firebase from 'firebase';
import firestore from 'firebase/firestore';         // NOTE: This import is important, otherwise firestore doesnt work
import cnsole from 'loglevel';


export const initFirebase = () => {
    cnsole.log('firebase.native.js: Initializing firebase');

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBtxjZ8kP8TlnTowlKRwIKqcnbUDSiK04U",
        authDomain: "india-project-e7798.firebaseapp.com",
        databaseURL: "https://india-project-e7798.firebaseio.com",
        projectId: "india-project-e7798",
        storageBucket: "",
        messagingSenderId: "241327438102",
        appId: "1:241327438102:web:0a47583838b4c4dc"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
};

export {
    firebase,
    firestore,
}
