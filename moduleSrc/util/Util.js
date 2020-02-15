import React from "react";
import {commonStyle} from "../styles/common";
import {
    AsyncStorage,
    getGpsLocation,
    getUrlParam,
    Image,
    initWebPush,
    isDebugMode,
    playBeepSound,
    recordAudio,
    showToast,
    StyleSheet,
    Text,
    uploadBlob,
    View,
} from '../platform/Util';
import {
    AUDIOS_URL,
    DESCRIPTOR_VISITOR,
    FILES_URL,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME,
    GOOGLE_MAPS_API_KEY,
    IMAGES_URL,
    MAX_AUDIO_SIZE_BYTES,
    MAX_FILE_SIZE_BYTES,
    MAX_IMAGE_SIZE_BYTES,
    MAX_VIDEO_SIZE_BYTES,
    MONTHS,
    PERSON_BORDER_COLOR,
    PERSON_ICON,
    PHONE_NUMBER_KEY,
    PREVIOUS_SESSION_KEY,
    SPEECH_RECOGNITION_SAMPLE_MS,
    SPEECH_RECOGNITION_TERMINATOR,
    VIDEO_ANALYTICS_INTERVAL_SECONDS,
    VIDEOS_URL,
    WEBSOCKET_URL
} from "../constants/Constants";
import window from "global/window";
import format from "string-format";
import {
    LANG_ENGLISH,
    LANG_HINDI,
    LANG_HINGLISH,
    LANG_THAI,
    OUTPUT_AUDIO,
    OUTPUT_FILE,
    OUTPUT_IMAGE,
    OUTPUT_NEW_JOINEE,
    OUTPUT_PDF,
    OUTPUT_PROGRESSIVE_MODULE,
    OUTPUT_SYSTEM_MESSAGE,
    OUTPUT_VIDEO
} from "../chat/Questions";
import uuidv1 from "uuid/v1";
import {crudsSearch, getPersonNamesByRoleId, hgetAllFromKVStore, searchCustomer, searchSupply} from "./Api";
import {firebase, initFirebase} from '../platform/firebase';
import xrange from 'xrange';
import lodash from "lodash";
import TouchableAnim from "../platform/TouchableAnim";
import cnsole from 'loglevel';


export const getCtx = (obj) => {
    // Useful for directly testing screens
    const state = obj.props.location && obj.props.location.state ? obj.props.location.state : {};
    if (obj.props.match) {
        state.match = obj.props.match;
    }
    return state;
};

export const navigateTo = (obj, url, prevCtx, overrides, replace=false) => {
    cnsole.log('navigateTo obj, url: ', obj, url);
    const s = {...prevCtx, ...overrides};
    if (replace) {
        cnsole.log('replace state: ', url, s);
        obj.props.history.replace(url, s);
    } else {
        cnsole.log('push state: ', url, s);
        obj.props.history.push(url, s);
    }
};

export const spacer = (h=10, w=0) => {
    return (<View style={{ height: h, width: w }} />);
};

export const fabButton = (text, cbFn, {width}={}) => {
    width = width || 200;
    return (
        <View style={commonStyle.fabButtonContainer}>
            {actionButton(text, cbFn, {width})}
        </View>
    );
};

export const actionButton = (text, cbFn, {width, height, style}={}) => {
    width = width || 200;
    height = height || 50;
    const fontSize = (style && style.fontSize) || commonStyle.actionButton.fontSize;
    return (
        <TouchableAnim onPress={cbFn} key={text}>
            <View style={{...commonStyle.actionButtonContainer, ...style, width, height}}>
                <Text style={{...commonStyle.actionButton, fontSize}}>
                    {text}
                </Text>
            </View>
        </TouchableAnim>
    );
};

export const latLonFn = (lat, lon) => ({latitude: lat, longitude: lon});

// Haversine distance in meters
export const haversineDistanceKms = (point1, point2, latField='latitude', lonField='longitude') => {
    const R = 6371;                                 // Earth radius in km
    const dLat = toRad(point2[latField] - point1[latField]);
    const dLon = toRad(point2[lonField] - point1[lonField]);
    const lat1 = toRad(point1[latField]);
    const lat2 = toRad(point2[latField]);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

const toRad = (value) => {
    return value * Math.PI / 180;
};

export const sumFn = (a, b) => a + b;
export const differenceFn = (a, b) => a - b;
export const amPm = (hr) => {
    return hr <= 12 ? hr + ' am' : (hr - 12) + ' pm';
};

export const flattenStyleArray = (s) => {
    let obj = {};
    for (let i = 0; i < s.length; i++) {
        obj = {...obj, ...s[i]};
    }
    return obj;
};

export const redirectIfNotFlow = (ctx, flowName, redirectUrl) => {
    // Redirect if not part of the flow
    if (ctx.flowName !== flowName) {
        cnsole.log('Flowname not found, navigating to: ', redirectUrl);
        window.location.href = redirectUrl;
    }
};

export const logoutFromWebsite = async (contextObj) => {
    cnsole.log('Logging out');
    await AsyncStorage.removeItem(PHONE_NUMBER_KEY);
    contextObj.phoneNumber = null;
    contextObj.customerProfile = null;

    cnsole.log('Logged out');
    window.location.reload();
};

export function getKeysWhereValueIs(dict, val) {
    const array = [];
    Object.keys(dict).forEach(x => {
        if (dict[x] === val) {
            array.push(x);
        }
    });
    return array;
}

export function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
}
export function capitalizeEachWord(str) {
    return str.trim().toLowerCase().replace(/_/g, ' ').replace(/  */g, ' ').split(' ').map(x => capitalizeFirstLetter(x)).join(' ');
}

export function getImageUrl(imageUrl) {
    if (!imageUrl) {
        return PERSON_ICON;
    }
    if (imageUrl.startsWith('id=')) {
        return IMAGES_URL + '/' + imageUrl.split('id=')[1];
    }
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }
    return IMAGES_URL + '/' + imageUrl;
}

export function hashCode(str) {
    let hash = 0, chr;
    if (str.length === 0) {
        return hash;
    }
    for (let i = 0; i < str.length; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}


// dateStr - yyyy-MM-dd format
export function ageFn(dateStr, now=new Date().getTime()) {
    let years = (now - new Date(parseDate(dateStr))) / (1000 * 60 * 60 * 24 * 365);
    return Math.round(years * 10) / 10;
}
export function parseDate(str) {
    let splits = str.split('-');
    return dateObj(splits[0], splits[1], splits[2]);
}
function dateObj(year, month, day) {
    year = parseInt(year);
    day = parseInt(day);
    month = isNaN(month) ? _lookupMonth(month) : parseInt(month);

    if (!month || year <= 0 || month <= 0 || day <= 0) {
        return null;
    }
    const d = new Date(year, month-1, day);
    if (d.getFullYear() !== year || d.getMonth() !== (month - 1) || d.getDate() !== day) {
        return null;
    }
    return d;
}
function _lookupMonth(month) {
    let idx = MONTHS.indexOf(month);
    return idx < 0 ? null : idx + 1;
}
export function getDateStr(date) {
    let dd = date.getDate();
    dd = (dd <= 9 ? '0' : '') + dd;
    let mm = date.getMonth() + 1;
    mm = (mm <= 9 ? '0' : '') + mm;
    const yyyy = date.getFullYear() + '';
    return [yyyy, mm, dd].join('-');
}
export function getDateToday() {
    return getDateStr(new Date());
}

export function stripPII(supply) {
    delete supply.person.phone;
    delete supply.person.metadata.addedOnDate;

    // Mask the actual lat lon
    supply.person.presentAddress.location.lat += Math.random() * 0.005;
    supply.person.presentAddress.location.lng += Math.random() * 0.005;
}


export function priceFn(customer, cook) {
    const cookCuisines = (cook.cuisines || []).map(x => x.toUpperCase());
    const cookLanguages = (cook.languages || []).map(x => x.toUpperCase());

    return 1500 + (cookCuisines.indexOf('CONTINENTAL') >= 0 ? 1000 : 0);
}
export function relevanceFn(customer, cook) {
    // Filters have already been accommodated before. Only check location and ratings
    return 1;
}


// Fire promises for the API's which don't yet have data
export function fireApiCalls(staticContext, keys, promiseFn) {
    const vals = {};
    keys.forEach(key => {
        const d = staticContext.data[key];
        const p = staticContext.promises[key];

        if (d) {
            vals[key] = d;
        } else if (!p) {
            staticContext.promises[key] = promiseFn(key);
        }
    });
    return vals;
}

// Wait for the promises to return and set data
export async function awaitPromises(staticContext, keys, setFn, errorFn) {
    keys.forEach(async (key) => {
        const d = staticContext.data[key];
        const p = staticContext.promises[key];

        if (!d && p) {
            try {
                staticContext.data[key] = await p;
                setFn(key, staticContext.data[key]);
            } catch (e) {
                cnsole.log('Exception in getting api: ', key, supplyId, e);
                errorFn();
            }
        }
    });
}


export const navigateToLatLon = (platform, lat, lon) => {
    if (platform.includes("iPhone") || platform.includes("iPod") || platform.includes("iPad")) {
        // If it's an iPhone..
        window.open('maps://maps.google.com/maps?daddr=' + lat + ',' + lon + '&amp;ll=');
    } else {
        window.open('http://maps.google.com/maps?daddr=' + lat + ',' + lon + '&amp;ll=');
    }
};


const checkFileTypeFromExtension = (fileName, fileType) => {
    const mimeTypes = [
        {ext: '.bmp', type: OUTPUT_IMAGE, fileType: 'image/bmp'},
        {ext: '.jpg', type: OUTPUT_IMAGE, fileType: 'image/jpeg'},
        {ext: '.jpeg', type: OUTPUT_IMAGE, fileType: 'image/jpeg'},
        {ext: '.png', type: OUTPUT_IMAGE, fileType: 'image/png'},
        {ext: '.gif', type: OUTPUT_IMAGE, fileType: 'image/gif'},
        {ext: '.mpeg', type: OUTPUT_VIDEO, fileType: 'video/mpeg'},
        {ext: '.mp4', type: OUTPUT_VIDEO, fileType: 'video/mp4'},
        {ext: '.m4v', type: OUTPUT_VIDEO, fileType: 'video/webm'},
        {ext: '.mov', type: OUTPUT_VIDEO, fileType: 'video/mp4'},
        {ext: '.avi', type: OUTPUT_VIDEO, fileType: 'video/x-msvideo'},
        {ext: '.mp3', type: OUTPUT_AUDIO, fileType: 'audio/mpeg3'},
        {ext: '.wav', type: OUTPUT_AUDIO, fileType: 'audio/wav'},
        {ext: '.ogg', type: OUTPUT_AUDIO, fileType: 'audio/ogg'},
        {ext: '.aac', type: OUTPUT_AUDIO, fileType: 'audio/aac'},
        {ext: '.pdf', type: OUTPUT_PDF, fileType: 'application/pdf'},
        {ext: '.doc', type: OUTPUT_FILE, fileType: 'application/msword'},
        {ext: '.docx', type: OUTPUT_FILE, fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},
        {ext: '.bz', type: OUTPUT_FILE, fileType: 'application/x-bzip'},
        {ext: '.bz2', type: OUTPUT_FILE, fileType: 'application/x-bzip2'},
        {ext: '.gz', type: OUTPUT_FILE, fileType: 'application/gzip'},
    ];

    fileName = fileName.toLowerCase();
    if (fileName.endsWith(".webm")) {
        if (fileType && fileType.startsWith('aud')) {
            return {ext: '.webm', type: OUTPUT_AUDIO, fileType: 'audio/webm'};
        }
        // Else treat it as video
        return {ext: '.webm', type: OUTPUT_VIDEO, fileType: 'video/webm'};
    }

    const match = mimeTypes.filter(x => fileName.endsWith(x.ext));
    return match.length === 1 ? match[0] : null;
};

export const checkFileType = (fileName, fileType) => {
    const ret = checkFileTypeFromExtension(fileName, fileType);
    if (ret) {
        switch (ret.type) {
            case OUTPUT_IMAGE:
                return {...ret, maxFileSize: MAX_IMAGE_SIZE_BYTES, serverUrl: IMAGES_URL};
            case OUTPUT_VIDEO:
                return {...ret, maxFileSize: MAX_VIDEO_SIZE_BYTES, serverUrl: VIDEOS_URL};
            case OUTPUT_AUDIO:
                return {...ret, maxFileSize: MAX_AUDIO_SIZE_BYTES, serverUrl: AUDIOS_URL};
            case OUTPUT_PDF:
            case OUTPUT_FILE:
                return {...ret, maxFileSize: MAX_FILE_SIZE_BYTES, serverUrl: FILES_URL};
            default:
                return null;
        }
    }
};


// Remove null / undefined elements
export const removeNullUndefined = (obj) => {
    obj = {...obj};
    Object.keys(obj).forEach(k => {
        if (obj[k] === undefined || obj[k] === null) {
            delete obj[k];
        }
    });
    return obj;
};


export const getAddressComponent = (results, type) => {
    const loc = results[0]['address_components'];
    for (let i = 0; i < loc.length; i++) {
        const { types, short_name, long_name } = loc[i];
        if (types && types.includes(type)) {
            cnsole.log(type, ':', long_name, short_name);
            return long_name || short_name;
        }
    }
    return null;
};

export const getSublocalityFromResults = (results) => {
    return getAddressComponent(results, 'sublocality') || getAddressComponent(results, 'political') || 'not_found';
};

export const getCityFromResults = (results) => {
    return getAddressComponent(results, 'locality') || 'not_found';
};

export const getStateFromResults = (results) => {
    return getAddressComponent(results, 'administrative_area_level_1') || 'not_found';
};



export const findJobReq = (customer, jobReqId) => {
    const jobOpenings = customer.jobOpenings || [];
    const openings = jobOpenings.filter(x => parseInt(x.id) === parseInt(jobReqId));
    if (openings.length !== 1) {
        cnsole.log('Something is wrong, jobReq not found: ', customer, jobReqId);
        return null;
    }

    return openings[0];
};

export const staticMapsImg = (lat, lon, height, width, zoom=14) => {
    return format('https://maps.googleapis.com/maps/api/staticmap?center={},{}&zoom={}&size={}x{}&maptype=roadmap&key={}&markers=color:red%7C{},{}', lat, lon, zoom, width, height, GOOGLE_MAPS_API_KEY, lat, lon);
};

export const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const setupDeviceId = async () => {
    const prevSession = await AsyncStorage.getItem(PREVIOUS_SESSION_KEY);
    cnsole.log('prevSession: ', prevSession);

    let deviceID;
    try {
        deviceID = prevSession ? (JSON.parse(prevSession).deviceID || uuidv1()) : uuidv1();
    } catch (e) {
        cnsole.log('Exception parsing prevSession: ', e);
        deviceID = uuidv1();
    }
    await AsyncStorage.setItem(PREVIOUS_SESSION_KEY, JSON.stringify({ deviceID }));
    return deviceID;
};

export const getDetailsFromPhone = async () => {
    const startTimeMs = new Date().getTime();
    const obj = await getDetailsFromPhoneInternal();
    cnsole.log('getDetailsFromPhone: ', obj);
    cnsole.log('getDetailsFromPhone took: ', new Date().getTime() - startTimeMs);
    return obj;
};
const getDetailsFromPhoneInternal = async () => {
    const phone = await AsyncStorage.getItem(PHONE_NUMBER_KEY);
    cnsole.log('Got phone: ', phone);
    if (!phone) {
        return {};
    }

    const promise1 = searchSupply({ phone });
    const promise2 = searchCustomer({ phone });
    const promise3 = crudsSearch(DESCRIPTOR_VISITOR, { phone });

    // 1. Lookup supply
    const supplyList = await promise1;
    cnsole.log('Got supplyList: ', supplyList);
    if (supplyList && supplyList.length > 0) {
        const { id, name, image } = supplyList[0].person;
        return { phone, id, name, role: 'supply', image };
    }

    // 2. Lookup customer
    const customerList = await promise2;
    cnsole.log('Got customerList: ', customerList);
    if (customerList && customerList.length > 0) {
        const { id, name, image } = customerList[0].person;
        return { phone, id, name, role: 'cust', image };
    }

    // 3. Lookup visitor
    const visitorList = await promise3;
    cnsole.log('Got visitorList: ', visitorList);
    if (visitorList && visitorList.length > 0) {
        const { id, name, photo } = visitorList[0];
        return { phone, id, name, role: 'visitor', image: photo };
    }

    cnsole.log('Neither customer, nor supply, nor visitor: ', phone);
    return { phone };
};
export const getLangCode = (language) => {
    switch (language) {
        case LANG_HINDI:
            return 'hi';
        case LANG_THAI:
            return 'th';
        case LANG_HINGLISH:
            return 'en-IN';
        case LANG_ENGLISH:
        default:
            return 'en-IN';
    }
};

export const recognizeSpeechMinMaxDuration = async (eventListenerFn, minListenTimeMs, timeoutMs, language, grammarHints, setMicListeningFn) => {
    cnsole.log('recognizeSpeechMinMaxDuration: ', minListenTimeMs, timeoutMs);
    let startTimeMs = new Date().getTime();
    let websocket;
    let recording = true;
    const transcripts = [];
    let recorder = null;

    await new Promise(async resolve => {
        const onMessageFn = (msg) => {
            transcripts.push(msg);
            resolve();
        };

        const dataAvailableCbFn = (arrayBuffer) => {
            cnsole.log('arrayBuffer: ', arrayBuffer);
            websocket && websocket.send(arrayBuffer);

            if (!recording) {
                // This is the last buffer of data received after stop is called
                websocket && websocket.send(SPEECH_RECOGNITION_TERMINATOR);
            }
        };

        // Open the websocket and start recording from Mic
        websocket = openSpeechWebsocket(onMessageFn);
        recorder = await recordAudio(SPEECH_RECOGNITION_SAMPLE_MS, dataAvailableCbFn);
        recorder.start();
        setMicListeningFn(true);

        // Wait for timeout or onMessageFn which ever happens sooner
        await new Promise(resolveFn => setTimeout(resolve, timeoutMs));
    });

    await recorder.stop();
    recording = false;
    setMicListeningFn(false);

    // Timeout case. Wait for last mic input buffer for another 5 seconds
    let counter = 0;
    while (transcripts.length === 0 && counter++ <= 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    websocket.close();
    websocket = null;

    playBeepSound();

    const result = transcripts.length > 0 ? transcripts[0].results[0].alternatives[0].transcript : '';
    const confidence = transcripts.length > 0 ? transcripts[0].results[0].alternatives[0].confidence : 0;

    return { result, confidence };
};

const openSpeechWebsocket = (onMessageFn) => {
    const websocket = new WebSocket(WEBSOCKET_URL + '/speech', 'chat-protocol');

    websocket.onopen = () => {};
    websocket.onmessage = (e) => {
        const msg = JSON.parse(e.data || '{}');
        cnsole.log('Message received:', msg);
        onMessageFn(msg);
    };

    websocket.onclose = (e) => {
        cnsole.log('Socket is closed :', e);
    };

    websocket.onerror = (e) => {
        cnsole.error('Socket encountered error. Closing socket: ', e.message, e);
        websocket.close();
    };
    return websocket;
};

export const getRandomCode = (len) => {
    return parseInt(xrange(0, len).toArray().map(x => {
        const num = Math.floor(Math.random() * 10) % 10;
        return x === 0 && num === 0 ? 1 : num;      // Code doesn't start with 0
    }).join(''));
};

export const getFieldNameFromType = (type) => {
    switch (type) {
        case OUTPUT_IMAGE:
            return 'imageUrl';
        case OUTPUT_AUDIO:
            return 'audioUrl';
        case OUTPUT_VIDEO:
            return 'videoUrl';
        case OUTPUT_FILE:
        default:
            return 'fileUrl';
    }
};

export const getPersonDetails = async (idToDetails, members, messages) => {
    const startTimeMs = new Date().getTime();
    let m = lodash.uniq(messages.map(x => x.sender));
    m = lodash.uniq(m.concat(members));
    const needLookup = m.filter(x => !(x in idToDetails));
    if (needLookup.length > 0) {
        const roleIdToName = await getPersonNamesByRoleId(needLookup);
        Object.keys(roleIdToName).forEach(k => {
            idToDetails[k] = roleIdToName[k];
        });
    }
    // cnsole.log('idToDetails: ', idToDetails);
    cnsole.log('getPersonDetails took: ', new Date().getTime() - startTimeMs);
};

export const getPersonalMessageDocInfo = (docData, doc) => {
    cnsole.log('Getting personal message doc info: ', docData, doc);
    const admins = [];
    const createdAt = docData.createdAt || 1575158400000;
    const messages = docData.messages || [];
    const members  = docData.members || doc.id.split(',');
    const lastReadIdx = docData.lastReadIdx || {};
    const isPrivate = true;
    const hasAnalytics = false;
    const isAdminPosting = false;
    const showMemberAddNotifications = false;
    const allowChatBotPromptForJobs = false;
    const shouldApplyFilters = false;

    return { groupId: doc.id, photo: '', name: '', desc: '', createdAt, admins, messages, members, lastReadIdx, isAdminPosting, hasAnalytics,
             isPrivate, showMemberAddNotifications, allowChatBotPromptForJobs, shouldApplyFilters };
};

export const getGroupInfo = (docData, doc) => {
    // cnsole.log('Getting group info: ', docData, doc);
    const { photo, name, desc } = docData;
    const admins = lodash.uniq(docData.admins || []);
    const createdAt = docData.createdAt || 1575158400000;
    const messages = docData.messages || [];
    const members  = lodash.uniq(docData.members || doc.id.split(','));
    const lastReadIdx = docData.lastReadIdx || {};
    const isPrivate = docData.isPrivate || false;
    const hasAnalytics = docData.hasAnalytics || false;
    const isAdminPosting = docData.isAdminPosting || false;
    const showMemberAddNotifications = docData.showMemberAddNotifications === undefined ? true : docData.showMemberAddNotifications;
    const allowChatBotPromptForJobs = docData.allowChatBotPromptForJobs || false;
    const shouldApplyFilters = docData.shouldApplyFilters || false;

    return { groupId: doc.id, photo, name, desc, createdAt, admins, messages, members, lastReadIdx, isAdminPosting, hasAnalytics,
             isPrivate, showMemberAddNotifications, allowChatBotPromptForJobs, shouldApplyFilters };
};

const processMessages = ({ messages, collection, isDebug, ipLocation }) => {
    if (collection !== FIREBASE_GROUPS_DB_NAME) {
        return messages;
    }

    const m1 = hyperLocalPostsFilter(messages, ipLocation, isDebug);
    const m2 = hyperLocalNewJoineeFilter(m1, ipLocation, isDebug);
    const m3 = mergeMultipleNewJoineeFilter(m2, ipLocation, isDebug);
    cnsole.log('Post filter sizes: ', messages.length, m1.length, m2.length, m3.length);
    return m3;
};

const hyperLocalPostsFilter = (messages, ipLocation, isDebug) => {
    if (isDebug) {
        return messages;
    }
    const ts = new Date(2019, 10, 1).getTime();
    const filteredMessages = [];
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const { type, timestamp, loc } = msg;
        const distKms = ipLocation && loc ? haversineDistanceKms(ipLocation, loc) : 1000;

        if (type !== OUTPUT_NEW_JOINEE && parseInt(timestamp) > ts && distKms > SHOW_POSTS_WITHIN_RADIUS_KM) {
            continue;
        }
        filteredMessages.push(msg);
    }
    return filteredMessages;
};

const hyperLocalNewJoineeFilter = (messages, ipLocation, isDebug) => {
    if (isDebug) {
        return messages;
    }
    const filteredMessages = [];
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const { type, timestamp, loc } = msg;
        const distKms = ipLocation && loc ? haversineDistanceKms(ipLocation, loc) : 1000;

        if (type === OUTPUT_NEW_JOINEE && distKms > SHOW_NEW_JOINEE_WITHIN_RADIUS_KM) {
            continue;
        }
        filteredMessages.push(msg);
    }
    return filteredMessages;
};

const mergeMultipleNewJoineeFilter = (messages, ipLocation, isDebug) => {
    if (isDebug) {
        return messages;
    }
    const filteredMessages = [];
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const { type, timestamp, loc } = msg;
        if (type === OUTPUT_NEW_JOINEE) {
            let j = i + 1;
            for (; j < messages.length; j++) {
                if (messages[j].type !== OUTPUT_NEW_JOINEE) {
                    break;
                }
            }
            if (j - i >= 3) {
                filteredMessages.push({
                    type: OUTPUT_SYSTEM_MESSAGE,
                    text: (j - i - 1) + ' more users joined',
                    sender: 'visitor:1',
                });
                i = j - 1;
            }
        }
        filteredMessages.push(msg);
    }
    return filteredMessages;
};

const processTrainingModules = async (collection, groupId, messages) => {
    if (collection !== FIREBASE_GROUPS_DB_NAME) {
        return messages;
    }

    const { phone, id, name, role } = await getDetailsFromPhone();
    if (!phone || !id) {
        return messages;
    }
    const roleId = role + ':' + id;

    const hash = format('/analytics/group/{}', groupId);
    const rsp = await hgetAllFromKVStore(hash);

    const keys = Object.keys(rsp).filter(x => x.includes("/user/" + roleId));
    cnsole.log('processTrainingModules keys: ', keys, rsp, hash);
    keys.forEach(k => rsp[k] = JSON.parse(rsp[k]));

    const filtered = [];
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const { type } = msg;
        if (type === OUTPUT_PROGRESSIVE_MODULE) {
            const watched = keys.filter(x => x.startsWith('/idx/' + i)).map(k => {
                const { compressed } = rsp[k];
                return compressed.map(([a, b]) => b + 1 - a).reduce(sumFn, 0) * VIDEO_ANALYTICS_INTERVAL_SECONDS;
            }).reduce(sumFn, 0);
            cnsole.log('messages[i].watched: ', watched, msg);
            filtered.push({...msg, watched});
        } else {
            filtered.push(msg);
        }
    }
    return filtered;
};

export const getAllInfoRelatedToGroup = async ({ collection, groupId, cbFn, isDebug, ipLocationPromise, dontProcessMessages, createDocIfDoesntExist }) => {
    const startTimeMs = new Date().getTime();
    const db = firebase.firestore();
    const docRef = db.collection(collection).doc(groupId);

    let doc = await docRef.get();
    if (!doc.exists) {
        if (!createDocIfDoesntExist) {
            window.alert('Doc does not exist');
            return null;
        }
        await docRef.set({
            createdAt: new Date().getTime(),
            lastReadIdx: {},
            members: groupId.split(','),
            messages: [],
        });
        doc = await docRef.get();
    }

    const docData = doc.data();
    cnsole.log('Firebase took: ', new Date().getTime() - startTimeMs);

    const groupInfo = collection === FIREBASE_CHAT_MESSAGES_DB_NAME ? getPersonalMessageDocInfo(docData, doc) : getGroupInfo(docData, doc);
    const { shouldApplyFilters, messages, hasAnalytics } = groupInfo;

    const ts1 = new Date().getTime();
    const ipLocation = shouldApplyFilters && !dontProcessMessages ? await ipLocationPromise : null;
    cnsole.log('ipLocation resolve took: ', new Date().getTime() - ts1);

    const fm1 = shouldApplyFilters && !dontProcessMessages ? processMessages({ messages, collection, isDebug, ipLocation }) : messages;
    const fm2 = hasAnalytics && !dontProcessMessages ? await processTrainingModules(collection, groupId, fm1) : fm1;
    groupInfo.filteredMessages = fm2;

    const observer = docRef.onSnapshot(async snapshot => {
        cnsole.log('Got snapshot: ', snapshot);
        const docData = snapshot.data();
        const doc = snapshot.ref;
        const groupInfo = collection === FIREBASE_CHAT_MESSAGES_DB_NAME ? getPersonalMessageDocInfo(docData, doc) : getGroupInfo(docData, doc);
        const { shouldApplyFilters, messages, hasAnalytics } = groupInfo;
        const fm1 = shouldApplyFilters && !dontProcessMessages ? processMessages({ messages, collection, isDebug, ipLocation }) : messages;
        const fm2 = hasAnalytics && !dontProcessMessages ? await processTrainingModules(collection, groupId, fm1) : fm1;
        groupInfo.filteredMessages = fm2;

        cbFn({ groupInfo });
    });
    return { db, docRef, doc, groupInfo, observer };
};

const SHOW_POSTS_WITHIN_RADIUS_KM = 15;
const SHOW_NEW_JOINEE_WITHIN_RADIUS_KM = 3;

export const computeLeaderBoardPoints = ({ key, roleId, watched, duration, lastUpdatedAtMs, minLastUpdatedAtMs, maxLastUpdatedAtMs }) => {
    const s1 = watched / duration;
    const s2 = (maxLastUpdatedAtMs - lastUpdatedAtMs + 1) / (maxLastUpdatedAtMs - minLastUpdatedAtMs + 1);
    const points = 100*s1 + 20*s2;

    cnsole.log({ key, roleId, s1, s2, points, watched, duration, lastUpdatedAtMs, minLastUpdatedAtMs, maxLastUpdatedAtMs });
    return Math.ceil(points);
};

export const getCircularImage = ({ src, dim, cbFn, border }) => {
    const borderStyle = {};
    if (border === undefined) {
        border = `1px solid ${PERSON_BORDER_COLOR}`;
        borderStyle.borderWidth = 1;
        borderStyle.borderStyle = 'solid';
        borderStyle.borderColor = PERSON_BORDER_COLOR;
    }
    return (
        <TouchableAnim onPress={cbFn} style={{ height: dim, width: dim, borderRadius: dim/2, borderWidth: 0 }}>
            <Image src={src} style={{ height: dim, width: dim, borderRadius: dim/2, objectFit: 'cover', border, ...borderStyle }} />
        </TouchableAnim>
    );
};

export {
    recordAudio,
    getGpsLocation,
    uploadBlob,
    initWebPush,
    initFirebase,
    StyleSheet, View, Text, Image,
    showToast,
    isDebugMode,
    getUrlParam,
};
