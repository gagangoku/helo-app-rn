import {firebase} from '@firebase/app';
import '@firebase/firestore';
import cnsole from 'loglevel';


export const initFirebase = () => {
    cnsole.log('Initializing firebase');

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

export const firestore = firebase.firestore;

export {
    firebase,
}
