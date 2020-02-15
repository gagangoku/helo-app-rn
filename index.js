/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {Application} from './App';
import {name as appName} from './app.json';
// import {handleFirebaseMessage} from './src/util/firebase';


AppRegistry.registerComponent(appName, () => Application);
// AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => handleFirebaseMessage);
// AppRegistry.registerHeadlessTask('RNFirebaseMessaging', () => handleFirebaseMessage);
