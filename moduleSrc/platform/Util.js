import React from "react";
import window from "global";
import format from "string-format";
import {API_URL, PHONE_NUMBER_KEY, TOAST_DURATION_MS, VAPID_PUBLIC_KEY} from "../constants/Constants";
import {
    checkFileType,
    flattenStyleArray,
    getCityFromResults,
    getStateFromResults,
    getSublocalityFromResults,
    setupDeviceId,
    urlBase64ToUint8Array
} from "../util/Util";
import AsyncStorage from "@callstack/async-storage";
import {registerPushSubscription} from "../util/Api";
import {toast} from "react-toastify";
import {commonStyle} from "../styles/common";
import document from "global/document";
import {Switch as Switch2, withStyles} from "@material-ui/core";
import MobileDetect from "mobile-detect";
import Modal from "react-modal";
import PopoverOrig from "@material-ui/core/Popover";
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from "react-places-autocomplete";
import {Route} from "react-router-dom";
import {Helmet} from "react-helmet";
import ReactMinimalPieChart from "react-minimal-pie-chart";
import GoogleMapReact from 'google-map-react';
import {confirmAlert} from 'react-confirm-alert';
import TouchableAnim from "./TouchableAnim";


export const HEIGHT_BUFFER = 5;
export const stopBodyOverflow = () => {
    document && document.body && (document.body.style.overflowY = 'hidden');
};
export const bodyOverflowAuto = () => {
    document && document.body && (document.body.style.overflowY = 'auto');
};
export const historyBack = () => {
    window.history.back();
};

export const Switch = withStyles(theme => ({
    root: {
        height: 30,
    },
    switchBase: {
        height: 30,
    },
}))(Switch2);

export const requestMicPermission = async () => true;

export const recordAudio = (timeslice, dataAvailableCbFn) => new Promise(async resolve => {
    dataAvailableCbFn = dataAvailableCbFn || (() => {});
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        console.log('recordAudio stream: ', stream.active, stream, stream.getAudioTracks());
        const mediaRecorder = new window.MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.addEventListener('start', (x) => {
            console.log('MediaRecorder onstart: ', x);
            return true;
        });
        mediaRecorder.addEventListener('pause', (x) => {
            console.log('MediaRecorder onpause: ', x);
        });
        mediaRecorder.addEventListener('resume', (x) => {
            console.log('MediaRecorder onresume: ', x);
        });
        mediaRecorder.addEventListener('error', (x) => {
            console.log('MediaRecorder onerror: ', x);
        });

        mediaRecorder.addEventListener('dataavailable', (event) => {
            console.log('event.data: ', event.data);
            if (event.data.size > 0) {
                audioChunks.push(event.data);
                try {
                    event.data.arrayBuffer().then(arrayBuffer => {
                        console.log('arrayBuffer: ', arrayBuffer);
                        dataAvailableCbFn(arrayBuffer);
                    });
                } catch (e) {
                    console.log('Error in getting arrayBuffer: ', e);
                }
            }
            return true;
        });

        const start = () => timeslice ? mediaRecorder.start(timeslice) : mediaRecorder.start();

        const stop = () => new Promise(resolve => {
            mediaRecorder.addEventListener('stop', () => {
                console.log('MediaRecorder onstop');
                const type = audioChunks.length > 0 && audioChunks[0].type ? audioChunks[0].type.split(';')[0] : 'audio/webm';
                const audioBlob = new Blob(audioChunks, {type});
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                const play = () => audio.play();

                console.log('audioBlob, audioUrl, play: ', audioBlob, audioUrl, play);
                resolve({ audioBlob, audioUrl, play });
            });

            mediaRecorder.stop();
            stream.getAudioTracks().forEach(track => {
                console.log('Stopping track: ', track);
                track.stop();
            });
        });
        resolve({start, stop});
    } catch (e) {
        console.log('Error in recordAudio: ', e);
        resolve({start: null, stop: null});
    }
});

export const getGpsLocation = async () => {
    // Get GPS location
    return await new Promise((resolve, error) => {
        const resolveFn = (position) => {
            console.log('Got current gps position:', position);
            const { latitude, longitude } = position.coords;
            resolve(position.coords);
        };
        const errorFn = (ex) => {
            console.log('Got error in GPS location: ', ex);
            error(ex);
        };
        navigator.geolocation.getCurrentPosition(resolveFn, errorFn, { timeout: 5000, enableHighAccuracy: true });
    });
};

export const fileFromBlob = (blob, filePrefix) => {
    return new File([blob], filePrefix + '.' + blob.type.split('/')[1], {lastModified: new Date().getTime(), type: blob.type});
};

export const uploadBlob = async (file) => {
    console.log('file: ', file);
    if (!file || file.size === 0) {
        return null;
    }

    const fileName = file.name.toLowerCase();
    const { maxFileSize, serverUrl } = checkFileType(fileName, file.type);
    if (file.size > maxFileSize) {
        window.alert('Too big');
        return null;
    }

    const data = new FormData();
    data.append('file', file);
    console.log(data);

    try {
        const url = format(API_URL + '/v1/blob/uploadBlob?fileType={}&fileName={}', encodeURIComponent(file.type), encodeURIComponent(file.name));
        const response = await fetch(url, {
            method: 'POST',
            body: data,
        });
        console.log('Blob upload response: ', response);
        const text = await response.text();
        console.log('Blob upload output: ', text);
        return serverUrl + '/' + text.split('id=')[1];
    } catch (ex) {
        console.log('Upload failed: ', ex);
        window.alert('Failed: ' + ex + '. Make sure image size is within limits');
        return null;
    }
};

export const initWebPush = async (forceUpdate) => {
    const run = async () => {
        console.log('Registering service worker');
        try {
            const registration = await navigator.serviceWorker.register('/static/worker.js', {scope: '/', updateViaCache: 'none'});
            console.log('Registered service worker: ', registration);

            // NOTE: This does not work in Safari. It uses window.safari.pushNotification
            const pushManager = registration.pushManager;

            console.log('Registering push service: ', pushManager);
            let subscription = await pushManager.getSubscription();
            const isAlreadySubscribed = !!subscription;
            console.log('Current push subscription: ', isAlreadySubscribed, subscription);

            if (forceUpdate || !subscription) {
                subscription = await pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });
                console.log('Registered new push: ', subscription);

                const deviceID = await setupDeviceId();
                const phone = await AsyncStorage.getItem(PHONE_NUMBER_KEY);
                console.log('Got deviceID, phone: ', deviceID, phone);

                await registerPushSubscription(deviceID, phone, subscription, isAlreadySubscribed);
                console.log('Saved in server');
            } else {
                console.log('Push already registered: ', subscription);
            }
        } catch (e) {
            console.log('Exception in service worker registration process: ', e);
        }
    };

    const navigator = window.navigator || {};
    console.log('navigator: ', navigator);
    console.log('navigator.serviceWorker: ', navigator.serviceWorker);
    if ('serviceWorker' in navigator) {
        try {
            await run();
        } catch (error) {
            console.error('Error in registration: ', error);
        }
    }
};

export const showToast = (text) => {
    const id = toast(<div style={commonStyle.toastButton}>{text}</div>);
    setTimeout(() => toast.dismiss(id), TOAST_DURATION_MS);
};

export const reverseGeocode = async ({ latitude, longitude }) => {
    const google = window.google;   // eslint-disable-line
    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(latitude, longitude);

    return await new Promise(resolve => {
        try {
            geocoder.geocode({location: latlng}, (results, status, event) => {
                console.log('Reverse geocoding: ', results, status, event);
                if (status === google.maps.GeocoderStatus.OK) {
                    const area = getSublocalityFromResults(results);
                    const city = getCityFromResults(results);
                    const state = getStateFromResults(results);
                    const obj = {
                        latitude,
                        longitude,
                        address: results[0].formatted_address,
                        addressEntered: results[0].formatted_address,
                        area,
                        city,
                        state,
                    };
                    resolve({results, status, event, obj});
                } else {
                    console.log('Reverse geocoding failed: ', status);
                    resolve({results, status, event});
                }
            });
        } catch (e) {
            console.log('Exception in geocodeByAddress: ', e);
            resolve({results: [], status: 'Exception', event: e});
        }
    });
};

export const playBeepSound = () => {
    const url = "https://www.soundjay.com/button/beep-07.mp3";
    const audio = new Audio(url);
    audio.play();
};




export class StyleSheet {
    static create(obj) {
        return obj;
    }
}
export class View extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    refElem = () => this.ref.current;
    render() {
        return renderF(this);
    }
}
export class Text extends React.Component {
    render() {
        return renderF(this);
    }
}
export class Image extends React.Component {
    render() {
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : ({...this.props.style} || {});
        const props = {...this.props, style};
        return (<img src={this.props.source} {...props} />);
    }
}

export class AudioElem extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }
    refElem = () => this.ref.current;
    onProgress = (elem) => {
        this.props.onTimeUpdate({ currentTime: elem.target.currentTime, duration: elem.target.duration, target: elem.target });
    };
    render() {
        return (
            <audio controls={true} onTimeUpdate={this.onProgress} ref={this.ref} style={{ outline: 'none' }}>
                <source src={this.props.src}/>
            </audio>
        );
    }
}
export class VideoElem extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }
    refElem = () => this.ref.current;
    onProgress = (elem) => {
        this.props.onTimeUpdate({ currentTime: elem.target.currentTime, duration: elem.target.duration, target: elem.target });
    };
    render() {
        const { src, width=250, height=250, controls=true, type='video/mp4' } = this.props;
        return src.includes('youtube.com') || src.includes('helloeko.com') ?
            <iframe width="300px" height="300px" allowFullScreen={true} webkitallowfullscreen="true" mozallowfullscreen="true" allow="autoplay; fullscreen" src={src} /> :
            <video width={width} height={height} controls={controls} onTimeUpdate={this.onProgress} ref={this.ref} style={{ outline: 'none' }}>
                <source src={src} type={type} />
                Your browser does not support the video tag.
            </video>;
    }
}

export class InputElem extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }
    refElem = () => this.ref.current;
    render() {
        return (
            <input {...this.props} ref={this.ref} />
        );
    }
}
export class TextareaElem extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }
    refElem = () => this.ref.current;
    render() {
        const props = {...this.props};
        const { onChangeText } = props;
        props.onChange = (v) => onChangeText(v.target.value);
        delete props.onChangeText;
        return (
            <textarea {...props} ref={this.ref} />
        );
    }
}

export class ScrollView extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }
    refElem = () => this.ref.current;
    render() {
        const props = {...this.props};
        const style = Array.isArray(props.style) ? flattenStyleArray(props.style) : ({...props.style} || {});
        props.style && delete props.style;
        props.children && delete props.children;

        if (props.horizontal) {
            style.overflowX = 'scroll';
        } else {
            style.overflowY = 'scroll';
        }
        return (
            <div {...props} style={style} ref={this.ref}>
                {this.props.children}
            </div>
        );
    }
}

export class ImageBackground extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const props = {...this.props};
        const style = Array.isArray(props.style) ? flattenStyleArray(props.style) : ({...props.style} || {});
        props.style && delete props.style;
        props.children && delete props.children;
        style.background = `url(${props.source.uri})`;
        style.backgroundSize = 'cover';
        return (
            <div {...props} style={style}>
                {this.props.children}
            </div>
        );
    }
}

export class PdfFilePreview extends React.PureComponent {
    render () {
        const { fileUrl, onOpenFile } = this.props;
        return (
            <View style={{ borderRadius: 16, transform: 'translateY(0px)', padding: 5 }}>
                <View style={{ position: 'relative', height: 200, width: 200 }}>
                    <TouchableAnim onPress={onOpenFile} style={{ height: 200, width: 200, zIndex: 10, position: 'absolute' }} />
                    <iframe width="200px" height="200px" src={fileUrl}
                            allowFullScreen={true} webkitallowfullscreen="true" mozallowfullscreen="true" allow="autoplay; fullscreen" />
                </View>
            </View>
        );
    }
}

export class ImagePreviewWidget extends React.PureComponent {
    openPic = () => {
        const onOpenFn = this.props.onOpenFn || (() => {});
        onOpenFn();
        const { imageUrl } = this.props;
        openUrlOrRoute({ url: imageUrl });
    };

    render () {
        const { imageUrl } = this.props;
        return (
            <TouchableAnim onPress={this.openPic}>
                <Image src={imageUrl} style={{ maxHeight: 200, maxWidth: 200 }} />
            </TouchableAnim>
        );
    }
}
export class Popover extends React.PureComponent {
    render() {
        const props = {...this.props};
        const propsToDelete = ['contentStyle', 'arrowStyle', 'backgroundStyle', 'fromRect', 'visible'];
        propsToDelete.forEach(p => delete props[p]);
        return <PopoverOrig {...props} />;
    }
}

export class LongPressMicBtn extends React.PureComponent {
    render() {
        const props = {...this.props};
        const { onPressIn, onPressOut } = props;
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : (this.props.style || {});
        style.background = `url(${props.source.uri})`;
        style.backgroundSize = 'cover';

        return (
            <TouchableAnim style={style} onPressIn={onPressIn} onPressOut={onPressOut}
                           onTouchStart={onPressIn} onTouchEnd={onPressOut}>
            </TouchableAnim>
        );
    }
}

export const openUrlOrRoute = ({ url }) => {
    window.open(url, '_blank');
};

const renderF = (obj, styleOverrides={}) => {
    const s = Array.isArray(obj.props.style) ? flattenStyleArray(obj.props.style) : (obj.props.style || {});
    const s2 = {...styleOverrides, ...s};
    const props = {...obj.props, style: s2};
    if (obj.props.onPress) {
        props.onClick = () => {
            console.log('renderF onclick');
            obj.props.onPress();
        };
        delete props.onPress;
    }
    const refObj = obj.ref ? { ref: obj.ref } : {};
    return (<div {...refObj} {...props}>{obj.props.children}</div>);
};

export const renderHtmlText = (text, styleObj) => <div style={styleObj} dangerouslySetInnerHTML={{__html: text}} />;

export const getUrlParam = (param, loc) => {
    loc = loc || document.location || API_URL;
    return (new URL(loc)).searchParams.get(param);
};
export const getUrlPath = (url) => {
    return new URL(url).pathname;
};
export const getUrlSearchParams = (url) => {
    return (new URL(url)).searchParams;
};

export const isDebugMode = () => {
    return getUrlParam('debug') === 'true' || getUrlParam('debug') === 'yes';
};

export const mobileDetect = () => {
    const mobileDetect = new MobileDetect(navigator.platform);
    const os = mobileDetect.os() || '';
    const isAndroid = os.toLowerCase().includes('android');
    const isIphone = mobileDetect.is('iPhone');
    return { isAndroid, isIphone, isWeb: true };
};

export const scrollToBottomFn = (element) => {
    console.log('scrollToBottomFn: ', element);
    const elem = element.refElem();
    console.log('scrollToBottomFn: ', element, elem);
    try {
        elem.scrollTop = elem.scrollHeight;
        window.scrollTo(0, document.body.scrollHeight);
    } catch (e) {
        console.log('Exception in scrollToBottomFn: ', e);
    }
};
export const scrollToElemFn = (ref) => {
    const elem = ref.refElem();
    console.log('scrollToElemFn: ', ref, elem);
    try {
        elem.scrollIntoView({ behavior: 'instant' });
    } catch (e) {
        console.log('Exception in scrollToElemFn: ', e);
    }
};


export const WINDOW_INNER_WIDTH = window.innerWidth;
export const WINDOW_INNER_HEIGHT = window.innerHeight;

// Exports
export {
    AsyncStorage,
    Modal,
    PlacesAutocomplete, geocodeByAddress, getLatLng, GoogleMapReact,
    Route, Helmet,
    withStyles,
    ReactMinimalPieChart, confirmAlert,
}
