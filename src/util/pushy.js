import Pushy from 'pushy-react-native';
import {PermissionsAndroid} from 'react-native';
import Toast from 'react-native-simple-toast';


const TOPIC = 'pushy-topic-test';
export const initPushy = () => {
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

    // Register the device for push notifications
    Pushy.register().then(async (deviceToken) => {
        // Display an alert with device token
        console.log('Pushy device token: ', deviceToken);
        Toast.show('Pushy device token', Toast.LONG);

        // Send the token to your backend server via an HTTP GET request
        //await fetch('https://your.api.hostname/register/device?token=' + deviceToken);

        // Succeeded, optionally do something to alert the user

        // Subscribe the device to a topic
        Pushy.subscribe(TOPIC).then(() => {
            // Subscribe successful
            console.log('Subscribed to topic successfully: ', TOPIC);
            Toast.show('Subscribed to topic successfully: ' + TOPIC, Toast.LONG);
        }).catch((err) => {
            // Handle errors
            console.error(err);
        });
    }).catch((err) => {
        // Handle registration errors
        console.error(err);
    });
};

Pushy.setNotificationListener(async (data) => {
    // Print notification payload data
    console.log('Received notification: ', JSON.stringify(data));
    Toast.show('Received notification', Toast.LONG);

    // Notification title
    let notificationTitle = 'MyApp';

    // Attempt to extract the "message" property from the payload: {"message":"Hello World!"}
    let notificationText = data.message || 'Test notification';

    // Display basic system notification
    Pushy.notify(notificationTitle, notificationText, data);
});
Pushy.setNotificationClickListener(async (data) => {
    // Display basic alert
    console.log('Clicked notification: ', data.message);
    Toast.show('Clicked notification', Toast.LONG);

    // Navigate the user to another page or
    // execute other logic on notification click
});
