import firebase from 'react-native-firebase';
import {showToast} from "./Util";
import {APP_DEBUG_MODE} from "../constants/Constants";


export const isFirebaseEnabled = () => true;
export const subscribeToTopic = (topic) => {
    console.log('Subscribing to firebase topic: ', topic);
    firebase.messaging().subscribeToTopic(topic);
};

// Initialize firebase
export const initFirebase = async () => {
    try {
        const hasPerm = await firebase.messaging().hasPermission();
        const perm = await firebase.messaging().requestPermission();
        if (hasPerm || perm) {
            // User has authorised
            console.log('Firebase allowed');

            firebase.messaging().onMessage(handleFirebaseMessage);

            firebase.notifications().onNotificationDisplayed(handleFirebaseNotificationDisplayed);
            firebase.notifications().onNotification(handleFirebaseNewNotification);
            firebase.notifications().onNotificationOpened(handleFirebaseNotificationOpened);
        } else {
            // User has rejected permissions
            console.log('Firebase permission rejected: ');
        }
    } catch (e) {
        // User has rejected permissions
        console.log('Firebase rejected: ', e);
    }
};

export const handleFirebaseNewNotification = (notification) => {
    // Process your notification as required
    // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
    console.log('firebase new notification: ', notification);
    APP_DEBUG_MODE && showToast('firebase new notification: ' + notification['body']);
};

export const handleFirebaseNotificationDisplayed = (notification) => {
    // Process your notification as required
    console.log('firebase notification displayed: ', notification);
    APP_DEBUG_MODE && showToast('firebase notification displayed: ' + notification['body']);
};

export const handleFirebaseNotificationOpened = (notification) => {
    // Process your notification as required
    // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
    console.log('firebase notification opened: ', notification);
    if ('notification' in notification) {
        notification = notification['notification'];
    }
    APP_DEBUG_MODE && showToast('firebase notification opened: ' + notification['data']['titleText']);
};

export const handleFirebaseMessage = async (message) => {
    // handle your message
    console.log('firebase message: ', message);
    APP_DEBUG_MODE && showToast('firebase message: ' + message.data['titleText']);
    return Promise.resolve();
};

export {
    firebase,
}
