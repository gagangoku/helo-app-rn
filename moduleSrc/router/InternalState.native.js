import {
    getDetailsFromPhone,
    getGroupInfo,
    getImageUrl,
    getPersonalMessageDocInfo,
    getPersonDetails
} from "../util/Util";
import {getLocationFromIPAddress} from "../util/Api";
import {firebase} from '../platform/firebase.native';
import {
    CHAT_MESSAGES_DOC_NAME_PREFIX,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME,
    GROUPS_DOC_NAME_PREFIX,
    GROUPS_SUPER_ADMINS, PHONE_NUMBER_KEY
} from "../constants/Constants";
import lodash from "lodash";
import {AsyncStorage} from "../platform/Util";
import LRU from 'lru-cache';
import {
    OUTPUT_AUDIO,
    OUTPUT_IMAGE,
    OUTPUT_JOB_ACTIONABLE,
    OUTPUT_JOB_REFERENCE,
    OUTPUT_LOCATION,
    OUTPUT_MISSED_CALL,
    OUTPUT_NONE,
    OUTPUT_PROGRESSIVE_MODULE,
    OUTPUT_TEXT,
    OUTPUT_VIDEO
} from "../chat/Questions";
import {store} from '../router/store';
import cnsole from 'loglevel';
import {NUM_MEMBERS_TO_SHOW} from "../chat/Constants";


const GROUP_DOCS_1 = 'groupDocs1';
const GROUP_DOCS_2 = 'groupDocs2';
const CHAT_DOCS_1  = 'chatDocs1';
const CHAT_DOCS_2  = 'chatDocs2';
const PERSIST_KEY_ID_TO_DETAILS = 'persist-idToDetails';
const PERSIST_KEY_USER_DETAILS = 'persist-userDetails';
const PERSIST_KEY_ID_TO_DOCUMENT_MAP = 'persist-idToDocs2';

let stateVersion = 0;
const initialState = {
    userDetails: null,
    documentsCache: {},
    idToDocMap: {},
    idToDetails: {},
    disposedKeys: [],
    ipLocation: null,
    numUpdates: {
        [GROUP_DOCS_1]: 0,
        [GROUP_DOCS_2]: 0,
        [CHAT_DOCS_1]: 0,
        [CHAT_DOCS_2]: 0,
    },
};
const observers = [];


const dispatch = (newState) => {
    const state = {...newState, version: ++stateVersion};
    cnsole.info('Dispatching new state: ', state.version);
    store.dispatch({ type: 'set', ts: new Date().getTime(), state });

    const doc = state.idToDocMap['supply:352,visitor:1'];
    cnsole.info('DEBUG: doc.groupInfo.messages: ', state.version, doc && doc.groupInfo.messages);
};


const setupInternalState = async (store) => {
    const newState = {...initialState};

    // TODO: Remove after testing
    // await AsyncStorage.setItem(PHONE_NUMBER_KEY, '9008781096');
    // store.dispatch({ type: 'set', ts: new Date().getTime(), state: { init: true } });
    const phoneNumber = await AsyncStorage.getItem(PHONE_NUMBER_KEY);
    if (!phoneNumber) {
        cnsole.info("No phone number saved, login first");
        return;
    }

    const ipLocationPromise = getLocationFromIPAddress();

    newState.idToDetails = await readFromOffline(PERSIST_KEY_ID_TO_DETAILS);
    newState.userDetails = (await readFromOffline(PERSIST_KEY_USER_DETAILS)) || {};
    getDetailsFromPhone().then(userDetails => {
        newState.userDetails = userDetails;
        persistOffline(userDetails, PERSIST_KEY_USER_DETAILS);
        dispatch(newState);
    });

    const { id, role } = newState.userDetails;
    if (!id || !role) {
        // Not logged in
        window.alert('Not logged in');
        return;
    }

    const idToDocMap = await readFromOffline(PERSIST_KEY_ID_TO_DOCUMENT_MAP);
    if (Object.keys(idToDocMap).length > 0) {
        newState.idToDocMap = idToDocMap;
        dispatch(newState);
    }

    newState.ipLocation = await ipLocationPromise;
    dispatch(newState);
    setupObservers({ role, id, store });
};
const setupInternalState2 = async (store) => {
    store.dispatch({ type: 'set', ts: new Date().getTime(), state: {count: 1} });
    setTimeout(() => {
        store.dispatch({ type: 'set', ts: new Date().getTime(), state: {count: 2} });
    }, 3000);
};

const setupObservers = ({ role, id, store }) => {
    const nowMs = new Date().getTime();
    const roleId = role + ':' + id;
    const csrole = role === 'supply' ? 'supplyId' : 'customerId';

    const db = firebase.firestore();
    const groupsCol = db.collection(FIREBASE_GROUPS_DB_NAME);
    const chatCol = db.collection(FIREBASE_CHAT_MESSAGES_DB_NAME);

    const queryRef1 = groupsCol.where('isPrivate', '==', false);        // Public groups
    const queryRef2 = GROUPS_SUPER_ADMINS.includes(roleId) ?            // Private groups
        groupsCol.where('isPrivate', '==', true) :
        groupsCol.where('isPrivate', '==', true).where('members', 'array-contains', roleId);
    const queryRef3 = chatCol.where('members', 'array-contains', roleId);
    const queryRef4 = chatCol.where(csrole, '==', parseInt(id));

    const observer1 = queryRef1.onSnapshot((snapshot) => funcGroups(roleId, snapshot, nowMs, GROUP_DOCS_1, store));
    const observer2 = queryRef2.onSnapshot((snapshot) => funcGroups(roleId, snapshot, nowMs, GROUP_DOCS_2, store));
    const observer3 = queryRef3.onSnapshot((snapshot) => funcChatMessages(roleId, snapshot, nowMs, CHAT_DOCS_1, store));
    const observer4 = queryRef4.onSnapshot((snapshot) => funcChatMessages(roleId, snapshot, nowMs, CHAT_DOCS_2, store));
    observers.push(observer1, observer2, observer3, observer4);
};

const funcGroups = async (roleId, snapshot, nowMs, docsKey, store) => {
    cnsole.info('funcGroups: roleId, nowMs, docsKey: ', roleId, nowMs, docsKey);
    cnsole.log('roleId, snapshot, nowMs, docsKey: ', roleId, snapshot, nowMs, docsKey);
    const newState = store.getState();
    const { numUpdates, idToDetails, idToDocMap } = newState;

    if (numUpdates[docsKey] <= 1) {
        cnsole.info('Time taken in firebase snapshot: ', new Date().getTime() - nowMs);
    }

    const docs = [];
    snapshot.forEach(d => {
        const groupId = d.id;
        cnsole.info('Processing group doc: ', groupId);
        cnsole.log('Processing group doc: ', d, groupId);
        if (groupId.startsWith(GROUPS_DOC_NAME_PREFIX)) {
            const data = d.data();

            const groupInfo = getGroupInfo(data, d);
            const { createdAt, photo, name, messages, members } = groupInfo;

            const numUnreads = numUnreadsFn(data, roleId);
            const timestamp = messages.length > 0 ? messages[messages.length -1].timestamp : createdAt;
            const subHeading = messages.length > 0 ? summary(messages[messages.length -1]) : '';

            idToDocMap[groupId] = { collection: FIREBASE_GROUPS_DB_NAME, groupId, docRef: d.ref, title: name, avatar: photo,
                                    numUnreads, timestamp, subHeading, messages, members, groupInfo };
            docs.push(idToDocMap[groupId]);
        }
    });
    const numDocsUpdated = docs.length;
    cnsole.info('Group Documents matching: ', docsKey, numDocsUpdated);
    numUpdates[docsKey]++;
    cnsole.info('Num docs updated: ', docsKey, numDocsUpdated);
    dispatch(newState);

    // Lookup the people that haven't already been looked up
    const needLookup1 = lodash.uniq(docs.flatMap(x => x.groupInfo.members.slice(0, NUM_MEMBERS_TO_SHOW)));
    const needLookup2 = lodash.uniq(docs.flatMap(x => x.groupInfo.messages.map(x => x.sender).reverse().slice(0, 50)));
    await getPersonDetails(idToDetails, needLookup2.concat(needLookup1), []);
    dispatch(newState);

    await persistOffline(idToDetails, PERSIST_KEY_ID_TO_DETAILS);
    await persistOfflineDocs(idToDocMap, PERSIST_KEY_ID_TO_DOCUMENT_MAP);
};

const funcChatMessages = async (roleId, snapshot, nowMs, docsKey, store) => {
    cnsole.info('funcChatMessages: roleId, nowMs, docsKey: ', roleId, nowMs, docsKey);
    cnsole.log('roleId, snapshot, nowMs, docsKey: ', roleId, snapshot, nowMs, docsKey);
    const newState = store.getState();
    const { numUpdates, idToDetails, idToDocMap } = newState;

    if (numUpdates[docsKey] <= 1) {
        cnsole.info('Time taken in firebase snapshot: ', new Date().getTime() - nowMs);
    }

    const docs = [];
    snapshot.forEach(d => {
        const groupId = d.id;
        cnsole.info(docsKey, ' Processing chat doc: ', groupId);
        cnsole.log('Processing chat doc: ', d, groupId);
        if (groupId.startsWith(CHAT_MESSAGES_DOC_NAME_PREFIX)) {
            const data = d.data();

            const groupInfo = getPersonalMessageDocInfo(data, d);
            const { members, messages } = groupInfo;

            const numUnreads = numUnreadsFn(data, roleId);
            const timestamp = messages.length > 0 ? messages[messages.length -1].timestamp : -1;
            const subHeading = messages.length > 0 ? summary(messages[messages.length -1]) : '';

            idToDocMap[groupId] = { collection: FIREBASE_CHAT_MESSAGES_DB_NAME, groupId, docRef: d.ref, title: '', avatar: '',
                                    numUnreads, timestamp, subHeading, messages, members, groupInfo };
            docs.push(idToDocMap[groupId]);
        }
        if (groupId === 'supply:352,visitor:1') {
            cnsole.info('idToDocMap[groupId]: ', idToDocMap[groupId]);
        }
    });
    const numDocsUpdated = docs.length;
    cnsole.info('Chat Documents matching: ', docsKey, numDocsUpdated);

    // Lookup the people that haven't already been looked up
    const needLookup = lodash.uniq(docs.flatMap(x => x.groupInfo.members));
    await getPersonDetails(idToDetails, needLookup, []);

    docs.forEach(d => {
        const otherGuy = d.groupInfo.members[0] === roleId ? d.groupInfo.members[1] : d.groupInfo.members[0];
        if (!idToDetails[otherGuy]) {
            cnsole.warn('roleIdToName[otherGuy] bad: ', otherGuy, Object.keys(idToDetails));
            return;
        }
        d.title = idToDetails[otherGuy].person.name;
        d.avatar = getImageUrl(idToDetails[otherGuy].person.thumbImage || idToDetails[otherGuy].person.image);
    });

    numUpdates[docsKey]++;
    cnsole.info('Num docs updated: ', docsKey, numDocsUpdated);
    dispatch(newState);

    await persistOffline(idToDetails, PERSIST_KEY_ID_TO_DETAILS);
    await persistOfflineDocs(idToDocMap, PERSIST_KEY_ID_TO_DOCUMENT_MAP);
};

const numUnreadsFn = (doc, roleId) => {
    const lastReadIdxMap = doc.lastReadIdx || {};
    const lastReadIdx = parseInt(lastReadIdxMap[roleId] || 0);
    const messages = (doc.messages || []);
    return messages.length - lastReadIdx;
};

const persistOffline = async (map, mapName) => {
    cnsole.info('persistOffline: ', mapName);
    await AsyncStorage.setItem(mapName, JSON.stringify(map));
};
const persistOfflineDocs = async (idToDocMap, keyName) => {
    cnsole.info('persistOfflineDocs: ', keyName);
    const map = {};
    Object.keys(idToDocMap).forEach(k => {
        const doc = idToDocMap[k];
        const copy = {...doc};
        delete copy.docRef;
        copy.messages = copy.messages.slice(copy.messages.length - 10, copy.messages.length);
        copy.groupInfo = {...copy.groupInfo, messages: copy.messages};
        delete copy.groupInfo.filteredMessages;
        map[k] = copy;
    });
    await AsyncStorage.setItem(keyName, JSON.stringify(map));
};

const readFromOffline = async (keyName) => {
    cnsole.info('readFromOffline: ', keyName);
    const str = (await AsyncStorage.getItem(keyName)) || '{}';
    const obj = JSON.parse(str);
    cnsole.info('readFromOffline num keys: ', keyName, Object.keys(obj).length);
    return obj;
};


const summary = (message) => {
    const { type, text, imageUrl } = message;
    switch (type) {
        case OUTPUT_NONE:
        case OUTPUT_TEXT:
            const t = message.text.replace(/<br>/g, ' ').replace(/<br\/>/g, ' ');
            return t.substr(0, Math.min(20, message.text.length)) + ' ...';
        case OUTPUT_IMAGE:
            return 'Image';
        case OUTPUT_AUDIO:
            return 'Audio';
        case OUTPUT_VIDEO:
            return 'Video';
        case OUTPUT_LOCATION:
            return 'Location';
        case OUTPUT_MISSED_CALL:
            return 'Missed call';
        case OUTPUT_JOB_ACTIONABLE:
        case OUTPUT_JOB_REFERENCE:
            return 'Job';
        case OUTPUT_PROGRESSIVE_MODULE:
            return 'Training module: ' + text;

        default:
            cnsole.warn('Unknown question type: ', message);
            return '';
    }
};

export {
    setupInternalState,
}
