import {AsyncStorage, Dimensions, Image, Modal, StyleSheet, Text, ToastAndroid as Toast, View} from 'react-native';
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
export class PlacesAutocomplete extends React.Component {
    render() {
        return <View />;
    }
}
export class Route extends React.Component {
    render() {
        return <View />;
    }
}
export class Helmet extends React.Component {
    render() {
        return <View />;
    }
}
export class ReactMinimalPieChart extends React.Component {
    render() {
        return <View />;
    }
}
export class Dummy extends React.Component {
    render() {
        return <View />;
    }
}
export const GoogleMapReact = Dummy;

export const withStyles = (styles) => {
    return (component) => component;
};


export const confirmAlert = () => {};
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
    AsyncStorage, StyleSheet, View, Text, Image, Modal, Toast,
}
