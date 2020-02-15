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
import {connect, Provider} from 'react-redux';
import GroupListDemo from './src/demos/GroupListDemo';
import {
    createNavigationReducer,
    createReactNavigationReduxMiddleware,
    createReduxContainer,
} from 'react-navigation-redux-helpers';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {reducerFn} from './moduleSrc/router/reducers';


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


const navReducer = createNavigationReducer(AppNavigator);
const appReducer = combineReducers({
    nav: navReducer,
    set: reducerFn,
});
const middleware = createReactNavigationReduxMiddleware(
    state => state.nav,
);

const App = createReduxContainer(AppNavigator);
const mapStateToProps = (state) => ({
    state: state.nav,
});
const AppWithNavigationState = connect(mapStateToProps)(App);

const store = createStore(
    appReducer,
    applyMiddleware(middleware),
);
setupInternalState(store);

class Application extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <AppWithNavigationState />
            </Provider>
        );
    }
}

export {
    Application,
    store,
}
