import {
    AsyncStorage,
    Dimensions,
    Image as ImageOrig,
    Modal,
    StyleSheet,
    Text as TextOrig,
    ToastAndroid as Toast,
    View as ViewOrig,
} from 'react-native';
import React from "react";
import {flattenStyleArray} from "../util/Util";


// TODO: Implement
export const stopBodyOverflow = () => {};
export const bodyOverflowAuto = () => {};
export const historyBack = () => {};


export class Dummy extends React.Component {
    render() {
        return <ViewOrig />;
    }
}
export class View extends React.Component {
    render() {
        // React Native expects fontWeight to be string
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : (this.props.style || {});
        const { fontWeight } = style;
        if (Number.isInteger(fontWeight)) {
            style.fontWeight = '' + fontWeight;
        }

        const props = {...this.props, style};
        return (
            <ViewOrig {...props}>
                {this.props.children}
            </ViewOrig>
        );
    }
}
export class Text extends React.Component {
    render() {
        // React Native expects fontWeight to be string
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : (this.props.style || {});
        if (Number.isInteger(style.fontWeight)) {
            style.fontWeight = '' + style.fontWeight;
        }

        const props = {...this.props, style: {...style}};
        return (
            <TextOrig {...props}>
                {this.props.children}
            </TextOrig>
        );
    }
}
export class Image extends React.Component {
    render() {
        let props = {...this.props};
        const { src,  } = props;
        if (src) {
            delete props.src;
        }

        // TODO: Fix these properties properly
        const style = props.style ? {...props.style} : {};
        props.style && delete props.style;
        if (style.cursor) {
            delete style.cursor;
        }
        if (style.objectFit) {
            delete style.objectFit;
        }
        if (style.border) {
            delete style.border;
        }
        return <ImageOrig source={{ uri: src }} style={style} {...props} />;
    }
}

export class AudioElem extends React.Component {
    render() {
        return <Text>audio element</Text>;
    }
}
export class VideoElem extends React.Component {
    render() {
        return <Text>video elem</Text>;
    }
}
export class InputElem extends React.Component {
    render() {
        return <Text>input elem</Text>;
    }
}
export class TextareaElem extends React.Component {
    render() {
        return <Text>textarea elem</Text>;
    }
}

export const Switch = Dummy;
export const Popover = Dummy;
export const PlacesAutocomplete = Dummy;
export const Route = Dummy;
export const Helmet = Dummy;
export const ReactMinimalPieChart = Dummy;
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

export const getUrlParam = (param, loc) => {
    return '';
};
export const getUrlPath = (url) => {
    return '';
};
export const getUrlSearchParams = (url) => {
    return {};
};
export const isDebugMode = () => {
    return false;
};
// export const renderHtmlText = (html) => <WebView source={{ html }} />;
export const renderHtmlText = (html) => <Text>{html}</Text>;

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
    AsyncStorage, StyleSheet, Modal, Toast,
}
