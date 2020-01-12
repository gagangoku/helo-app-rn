/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {handleFirebaseMessage} from './src/util/firebase';


AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => handleFirebaseMessage);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessagingService', () => handleFirebaseMessage);
AppRegistry.registerHeadlessTask('RNFirebaseMessaging', () => handleFirebaseMessage);
AppRegistry.registerHeadlessTask('SomeTaskName', () => {
    console.log('SomeTaskName SomeTaskName');
});
