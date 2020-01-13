import type {RemoteMessage} from 'react-native-firebase';
import firebase from 'react-native-firebase';
import Toast from 'react-native-simple-toast';


export const initializeFirebaseNotifications = async () => {
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
        } else {
            // User has rejected permissions
            console.log('Firebase permission rejected: ');
        }
    } catch (e) {
        // User has rejected permissions
        console.log('Firebase rejected: ', e);
    }
};

export const handleFirebaseMessage = async (message: RemoteMessage) => {
    // handle your message
    console.log('firebase message: ', message);
    Toast.show('firebase message: ' + message.data['titleText'], Toast.LONG);
    return Promise.resolve();
};
