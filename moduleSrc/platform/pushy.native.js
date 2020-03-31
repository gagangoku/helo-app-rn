import Pushy from 'pushy-react-native';
import {PermissionsAndroid, Platform} from 'react-native';
import Toast from 'react-native-simple-toast';
import cnsole from 'loglevel';
import {APP_DEBUG_MODE} from "../constants/Constants";


let isInitialized = false;
export const initPushy = (topic) => {
    cnsole.info('Pushy: initPushy: ', { topic, isInitialized });
    if (isInitialized) {
        cnsole.info('Pushy: already initialized, skipping');
        return;     // No-op
    }

    // Start the Pushy service
    Pushy.listen();
    Pushy.setNotificationIcon('ic_notification_icon');

    // Only necessary for Android
    if (Platform.OS === 'android') {
        // Check whether the user has granted the app the WRITE_EXTERNAL_STORAGE permission
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((granted) => {
            if (!granted) {
                // Request the WRITE_EXTERNAL_STORAGE permission so that the Pushy SDK will be able to persist the device token in the external storage
                PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((result) => {
                    // User denied permission?
                    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
                        // Possibly ask the user to grant the permission
                    }
                });
            }
        });
    }

    // Enable FCM fallback delivery
    // Pushy.toggleFCM(true);

    // Register the device for push notifications
    Pushy.register().then(async (deviceToken) => {
        // Display an alert with device token
        cnsole.info('Pushy: device token: ', deviceToken);
        debugMode && Toast.show('Pushy: device token', Toast.SHORT);

        // Send the token to your backend server via an HTTP GET request
        //await fetch('https://your.api.hostname/register/device?token=' + deviceToken);

        // Succeeded, optionally do something to alert the user

        // Subscribe the device to a topic
        Pushy.subscribe(topic).then(() => {
            // Subscribe successful
            cnsole.info('Pushy: Subscribed to topic successfully: ', topic);
            debugMode && Toast.show('Pushy: Subscribed to topic successfully', Toast.LONG);
        }).catch((err) => {
            // Handle errors
            cnsole.error('Pushy: Error in topic subscription: ', topic, err);
        });
    }).catch((err) => {
        // Handle registration errors
        cnsole.error('Pushy: Error in registration: ', err);
    });
    isInitialized = true;
};

export const setPushyNotificationListeners = () => {
    Pushy.setNotificationListener(async (data) => {
        // Print notification payload data
        cnsole.info('Pushy: Received notification: ', JSON.stringify(data));
        debugMode && Toast.show('Pushy: Received notification', Toast.LONG);

        // Notification title
        const notificationTitle = data.title || 'HELO';

        // Attempt to extract the "message" property from the payload: {"message":"Hello World!"}
        const notificationText = data.message || 'Test notification';

        // Display basic system notification
        Pushy.notify(notificationTitle, notificationText, data);
    });
    Pushy.setNotificationClickListener(async (data) => {
        // Display basic alert
        cnsole.info('Pushy: Clicked notification: ', data.message);
        debugMode && Toast.show('Pushy: Clicked notification', Toast.LONG);

        // Navigate the user to another page or
        // execute other logic on notification click
    });
};
const debugMode = APP_DEBUG_MODE;
