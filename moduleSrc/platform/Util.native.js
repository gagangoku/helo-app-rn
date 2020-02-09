import {AsyncStorage, Modal, Image, StyleSheet, Text, ToastAndroid as Toast, TouchableOpacity, View, Platform} from 'react-native';
import React from "react";


// TODO: Implement
export const stopBodyOverflow = () => {};
export const bodyOverflowAuto = () => {};
export const historyBack = () => {};

export class Switch extends React.Component {
    render() {
        return <View />;
    }
}
export class Popover extends React.Component {
    render() {
        return <View />;
    }
}

export const mobileDetect = () => {
    return { isAndroid: true, isIphone: false };
};

export const recordAudio = (timeslice, dataAvailableCbFn) => new Promise(async resolve => {});

export const getGpsLocation = async () => {};

export const uploadBlob = async (file) => {};

export const initWebPush = async (forceUpdate) => {};

export const showToast = (text) => {
    Toast.show(text, Toast.LONG);
};

export const geocodeByAddress = async ({ latitude, longitude }) => {};

export const playBeepSound = () => {};
export const scrollToBottomFn = () => {};
export const scrollToElemFn = (ref) => {};
export const resizeForKeyboard = ({ mode, msgToScrollTo, cbFn }) => {};


export {
    AsyncStorage, StyleSheet, View, Text, TouchableOpacity, Image, Modal, Toast,
}
