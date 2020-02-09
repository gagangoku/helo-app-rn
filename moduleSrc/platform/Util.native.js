import {
    AsyncStorage,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    ToastAndroid as Toast,
    TouchableOpacity,
    View
} from 'react-native';
import React from "react";
import window from "global";


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
export class PlacesAutocomplete extends React.Component {
    render() {
        return <View />;
    }
}
export const geocodeByAddress = () => {};
export const getLatLng = () => {};

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

export const reverseGeocode = async ({ latitude, longitude }) => {};
export const playBeepSound = () => {};
export const scrollToBottomFn = () => {};
export const scrollToElemFn = (ref) => {};
export const resizeForKeyboard = ({ mode, msgToScrollTo, cbFn }) => {};

export const WINDOW_INNER_WIDTH = Dimensions.get('window').width;
export const WINDOW_INNER_HEIGHT = Dimensions.get('window').height;


export {
    AsyncStorage, StyleSheet, View, Text, TouchableOpacity, Image, Modal, Toast,
}
