/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @flow
 */

import React from 'react';
import {createStackNavigator} from 'react-navigation-stack';
import HomeScreen from './src/demos/HomeScreen';
import {setPushyNotificationListeners} from './src/util/pushy';
import ChatDemo from './src/demos/ChatDemo';
import TouchableBug from './src/demos/TouchableBug';
import DocumentPickerDemo from './src/demos/DocumentPickerDemo';
import AnalyticsDemo from './src/demos/AnalyticsDemo';
import {initFirebase} from './moduleSrc/platform/firebase.native';
import GroupPageDemo from './src/demos/GroupPageDemo';
import {setupInternalState} from './moduleSrc/router/InternalState.native';
import GroupListDemo from './src/demos/GroupListDemo';
import {createStore} from 'redux';
import {reducerFn} from './moduleSrc/router/reducers';
import {createAppContainer} from 'react-navigation';


console.log('****** App starting ********', new Date().getTime());

setPushyNotificationListeners();
initFirebase();

const homeScreens = [HomeScreen, ChatDemo, TouchableBug, DocumentPickerDemo, AnalyticsDemo, GroupPageDemo, GroupListDemo];
const allScreens = {};
[homeScreens].forEach(y => {
    y.forEach(x => {
        allScreens[x.URL] = {screen: x};
    });
});

const AppNavigator = createStackNavigator(allScreens, {
    // initialRouteName: ChatDemo.URL,
    initialRouteName: GroupListDemo.URL,
});
const Application = createAppContainer(AppNavigator);

const store = createStore(reducerFn);
setupInternalState(store);

export {
    Application,
    store,
}
