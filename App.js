/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @flow
 */

import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {initFirebase} from './moduleSrc/platform/firebase.native';
import {App as Application, appInit} from './moduleSrc/router/Flow.native';
import cnsole from 'loglevel';
import {CHAT_FONT_FAMILY} from './moduleSrc/constants/Constants';
import {checkForCodepushUpdateAsync} from './src/util/codepush';
import {setPushyNotificationListeners} from './moduleSrc/platform/pushy.native';
import {store} from './moduleSrc/router/store';
import {setupInternalStateFromLocal} from './moduleSrc/router/InternalState.native';
import {initBranch} from './moduleSrc/platform/Branch.native';

setPushyNotificationListeners();


cnsole.setLevel('info');
cnsole.info('****** App starting ********', new Date().getTime());

setupInternalStateFromLocal(store);
initFirebase();
checkForCodepushUpdateAsync();
appInit();
initBranch();


if (Platform.OS === 'android') {
    const styles = StyleSheet.create({
        defaultFontFamily: {
            fontFamily: CHAT_FONT_FAMILY,       // 'lucida grande',
        }
    });

    const oldRender = Text.render;
    if (!oldRender) {
        cnsole.warn('Did not find Text.render');
    } else {
        cnsole.info('Found Text.render, overriding');
        Text.render = function (...args) {
            const origin = oldRender.call(this, ...args);
            return React.cloneElement(origin, {
                style: [styles.defaultFontFamily, origin.props.style]
            });
        };
    }
}

export {
    Application,
}
