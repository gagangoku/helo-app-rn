/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @flow
 */

import React from 'react';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import HomeScreen from './src/demos/HomeScreen';
import {setPushyNotificationListeners} from './src/util/pushy';
import ChatDemo from './src/demos/ChatDemo';
import TouchableBug from './src/demos/TouchableBug';


setPushyNotificationListeners();

const homeScreens = [HomeScreen, ChatDemo, TouchableBug];
const allScreens = {};
[homeScreens].forEach(y => {
    y.forEach(x => {
        allScreens[x.URL] = {screen: x};
    });
});

const MainNavigator = createStackNavigator(allScreens, {
    initialRouteName: ChatDemo.URL,
    // initialRouteName: TouchableBug.URL,
});

const App = createAppContainer(MainNavigator);
export default App;
