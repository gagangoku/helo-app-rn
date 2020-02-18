/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @flow
 */

import React from 'react';
import {initFirebase} from './moduleSrc/platform/firebase.native';
import {setupInternalState} from './moduleSrc/router/InternalState.native';
import {store} from './moduleSrc/router/store';
import {App as Application} from './moduleSrc/router/Flow.native';
import cnsole from 'loglevel';
import {setPushyNotificationListeners} from './src/util/pushy';


cnsole.setLevel('info');
cnsole.info('****** App starting ********', new Date().getTime());

setPushyNotificationListeners();
initFirebase();
setupInternalState(store);

export {
    Application,
}
