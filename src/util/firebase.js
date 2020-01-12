import firebase from "react-native-firebase";
import type { Notification } from 'react-native-firebase';
import type { RemoteMessage } from 'react-native-firebase';
import Toast from "react-native-simple-toast";


export const initializeFirebase = async () => {
    try {
        const hasPerm = await firebase.messaging().hasPermission();
        const perm = await firebase.messaging().requestPermission();
        if (hasPerm || perm) {
            // User has authorised
            console.log('Firebase allowed');

            // Create the channel
            const channel = new firebase.notifications.Android.Channel('HeloChannel', 'Messages Channel', firebase.notifications.Android.Importance.Max)
                .setDescription('My apps test channel');
            firebase.notifications().android.createChannel(channel);

            firebase.messaging().subscribeToTopic('helo.app.rn.test');
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

export const handleFirebaseNewNotification = (notification: Notification) => {
    // Process your notification as required
    // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
    console.log('firebase new notification: ', notification);
    Toast.show('firebase new notification: ' + notification['body'], Toast.LONG);
};

export const handleFirebaseNotificationDisplayed = (notification: Notification) => {
    // Process your notification as required
    console.log('firebase notification displayed: ', notification);
    Toast.show('firebase notification displayed: ' + notification['body'], Toast.LONG);
};

export const handleFirebaseNotificationOpened = (notification: Notification) => {
    // Process your notification as required
    // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
    console.log('firebase notification opened: ', notification);
    if ('notification' in notification) {
        notification = notification['notification'];
    }
    Toast.show('firebase notification opened: ' + notification['data']['titleText'], Toast.LONG);
};

export const handleFirebaseMessage = async (message: RemoteMessage) => {
    // handle your message
    console.log('firebase message: ', message);
    Toast.show('firebase message: ' + message.data['titleText'], Toast.LONG);
    return Promise.resolve();
};
