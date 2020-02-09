import React from "react";
import window from "global";
import format from "string-format";
import {API_URL, PHONE_NUMBER_KEY, TOAST_DURATION_MS, VAPID_PUBLIC_KEY} from "../constants/Constants";
import {
    checkFileType,
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
import {MODE_BOT} from "../chat/Constants";
import Modal from "react-modal";
import Popover from "@material-ui/core/Popover";
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from "react-places-autocomplete";


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

export const uploadBlob = async (file) => {
    console.log('file: ', file);
    if (!file) {
        return null;
    }

    const fileName = file.name.toLowerCase();
    const { maxFileSize, serverUrl } = checkFileType(fileName);
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
    render() {
        return renderF(this);
    }
}
export class Text extends React.Component {
    render() {
        return renderF(this);
    }
}
export class TouchableOpacity extends React.Component {
    render() {
        return renderF(this, {cursor: 'pointer'});
    }
}
export class Image extends React.Component {
    render() {
        const obj = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : this.props.style;
        const props = {...this.props, style: obj};
        return (<img src={this.props.source} {...props} />);
    }
}

const renderF = (obj, styleOverrides={}) => {
    const s = Array.isArray(obj.props.style) ? flattenStyleArray(obj.props.style) : (obj.props.style || {});
    const s2 = {...styleOverrides, ...s};
    const props = {...obj.props, style: s2};
    if (obj.props.onPress) {
        props.onClick = () => {
            console.log('TouchableOpacity onclick');
            obj.props.onPress();
        };
        delete props.onPress;
    }
    return (<div {...props}>{obj.props.children}</div>);
};

const flattenStyleArray = (s) => {
    let obj = {};
    for (let i = 0; i < s.length; i++) {
        obj = {...obj, ...s[i]};
    }
    return obj;
};

export const mobileDetect = () => {
    const mobileDetect = new MobileDetect(navigator.platform);
    const os = mobileDetect.os() || '';
    const isAndroid = os.toLowerCase().includes('android');
    const isIphone = mobileDetect.is('iPhone');
    return { isAndroid, isIphone };
};

export const resizeForKeyboard = ({ mode, msgToScrollTo, cbFn }) => {
    const origHeight = window.innerHeight;
    if (mode === MODE_BOT) {
        window.addEventListener('resize', () => {
            console.log('resize event fired');
            if (window.innerHeight !== origHeight) {
                console.log('keyboard open');
                cbFn(true);
            } else {
                console.log('keyboard closed');
                cbFn(false);
            }
            scrollToBottomFn();
        }, true);
    }

    !msgToScrollTo && scrollToBottomFn();
};

export const scrollToBottomFn = () => {
    console.log('scrollToBottomFn');
    try {
        const elem = document.getElementById('chatRoot');
        elem.scrollTop = elem.scrollHeight;
        window.scrollTo(0, document.body.scrollHeight);
    } catch (e) {
        console.log('Exception in scrollToBottomFn: ', e);
    }
};
export const scrollToElemFn = (ref) => {
    console.log('scrollToElemFn');
    try {
        ref.scrollIntoView({ behavior: 'instant' });
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
    Popover,
    PlacesAutocomplete, geocodeByAddress, getLatLng,
}
