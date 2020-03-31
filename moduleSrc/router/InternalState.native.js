import {
    getDetailsFromPhone,
    getGroupInfo,
    getPersonalMessageDocInfo,
    getPersonDetails2,
    isSuperAdmin,
    messageSummary,
    showToast
} from "../util/Util";
import {getLocationFromIPAddress} from "../util/Api";
import {firebase} from '../platform/firebase.native';
import {
    CHAT_MESSAGES_DOC_NAME_PREFIX,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME,
    GROUPS_DOC_NAME_PREFIX
} from "../constants/Constants";
import lodash from "lodash";
import {AsyncStorage, requestMicPermission} from "../platform/Util";
import {store} from '../router/store';
import cnsole from 'loglevel';
import {NUM_MEMBERS_TO_SHOW} from "../chat/Constants";
import wifi from 'react-native-android-wifi';
import {initPushy} from "../platform/pushy.native";
import {getAndStoreAllContacts} from "../platform/Contacts.native";
import {CHAT_DOCS_1, CHAT_DOCS_2, GROUP_DOCS_2} from "../router/reducers";
import {chatsJobQ, detailsLookupQ, groupsJobQ} from './JobQueues';
import {PermissionsAndroid} from 'react-native';


const PERSIST_KEY_ID_TO_DETAILS = 'persist-idToDetails';
const PERSIST_KEY_USER_DETAILS = 'persist-userDetails';
const PERSIST_KEY_ID_TO_DOCUMENT_MAP = 'persist-idToDocs2';

const PERSON_DETAILS_REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const PERSON_DETAILS_STALE_INTERVAL_MS   = 10 * 60 * 1000;

let stateVersion = 0;
const observers = [];
let areObserversSetup = false;

// TODO: Make this more efficient, maybe publisher subscriber based
const refreshDetails = async () => {
    cnsole.info('Periodic refreshDetails');
    const idToDetails = store.getState().idToDetails;
    const roleIds = Object.keys(idToDetails).filter(x => {
        return !x.lastUpdatedAt || parseInt(x.lastUpdatedAt) < new Date().getTime() - PERSON_DETAILS_STALE_INTERVAL_MS;
    });

    if (roleIds.length > 0) {
        await refetchDetails(roleIds);
    }
};
setInterval(refreshDetails, PERSON_DETAILS_REFRESH_INTERVAL_MS);            // Every 10 minutes

const dispatch = (newState) => {
    const state = {...newState, version: ++stateVersion};
    cnsole.info('Dispatching new state: ', state.version, state.str);
    store.dispatch({ type: 'set', ts: new Date().getTime(), state });
};

// Indicates splash loading is done
export const reportSplashLoadedAndExecuteBranchActions = () => {
    const { branchActions } = store.getState();
    cnsole.info('reportSplashLoaded. branchActions: ', branchActions);

    dispatch({ ...store.getState(), branchActions: [], splashLoaded: true, str: 'v-splashLoaded' });
    if (branchActions.length === 0) {
        return false;
    }
    const action = branchActions[branchActions.length - 1];
    (action)();
    return true;
};
export const executeOrQueueBranchAction = (action) => {
    const { splashLoaded, branchActions } = store.getState();
    if (splashLoaded) {
        cnsole.info('executeOrQueueBranchAction executing action');
        action();
    } else {
        cnsole.info('executeOrQueueBranchAction enqueuing action');
        branchActions.push(action);
        dispatch({ ...store.getState(), branchActions, str: 'v-branch-q' });
    }
};

export const setupInternalStateFromLocal = async () => {
    const contactsPromise = getAndStoreAllContacts(false);
    const [ ipLocation, idToDetails, userDetails, idToDocMap ] = await Promise.all([
        getLocationFromIPAddress(),
        readFromOffline(PERSIST_KEY_ID_TO_DETAILS),
        readFromOffline(PERSIST_KEY_USER_DETAILS),
        readFromOffline(PERSIST_KEY_ID_TO_DOCUMENT_MAP),
    ]);

    const ssid = await new Promise(resolve => wifi.getSSID(ssid => resolve(ssid)));
    const isWifiEnabled = await new Promise(resolve => wifi.isEnabled(isEnabled => resolve(isEnabled)));
    cnsole.info('SSID: ', ssid);
    cnsole.info("wifi service: ", isWifiEnabled);

    const idToDocRef = await getCachedRefs({ idToDocMap });
    Object.keys(idToDocMap).forEach(groupId => {
        idToDocMap[groupId].docRef = idToDocRef[groupId];
    });
    dispatch({ ...store.getState(), idToDetails, userDetails, idToDocMap, ipLocation, ssid, isWifiEnabled, str: 'v1-base' });

    const contacts = await contactsPromise;
    dispatch({ ...store.getState(), contacts, str: 'v2-contacts' });
};

export const setupInternalState = async () => {
    cnsole.info('setupInternalState called: ', { areObserversSetup });

    const userDetails = await getDetailsFromPhone();
    const { role, id } = userDetails;
    if (!role || !id) {
        window.alert('BAD: this should not happen');
        return;
    }
    await persistOffline(userDetails, PERSIST_KEY_USER_DETAILS);
    dispatch({ ...store.getState(), userDetails, str: 'v3-userDetails' });

    refetchDetails([role + ':' + id]);

    await askPermissions();
    // setupPushy(userDetails);
    if (!areObserversSetup) {
        setupObservers({ role, id });
    }
};

const askPermissions = async () => {
    // Required to check wifi name
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    // User denied permission?
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        // Possibly ask the user to grant the permission
        showToast('Location denied, all features will not work well');
    }

    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        // Possibly ask the user to grant the permission
        showToast('Storage denied, all features will not work well');
    }

    const micPermGranted = await requestMicPermission();
    if (!micPermGranted) {
        // Possibly ask the user to grant the permission
        showToast('Mic permission denied, all features will not work well');
    }
};

const setupPushy = (userDetails) => {
    const { id, role } = userDetails;
    if (role && id) {
        const roleId = role + ':' + id;
        initPushy('topic-' + roleId.replace(':', '-'));       // Initialize Pushy for notifications
    }
};

const getCachedRefs = async ({ idToDocMap }) => {
    const startTimeMs = new Date().getTime();

    const db = firebase.firestore();
    const groupsCol = db.collection(FIREBASE_GROUPS_DB_NAME);
    const chatCol = db.collection(FIREBASE_CHAT_MESSAGES_DB_NAME);

    const idToDocRef = {};
    const keys = Object.keys(idToDocMap);
    for (let i = 0; i < keys.length; i++) {
        const groupId = keys[i];
        const { collection } = idToDocMap[groupId];
        const col = collection === FIREBASE_GROUPS_DB_NAME ? groupsCol : chatCol;
        idToDocRef[groupId] = col.doc(groupId);
    }

    cnsole.info('Time taken in getCachedRefs: ', new Date().getTime() - startTimeMs, keys.length);
    return idToDocRef;
};

export const refetchDetails = (roleIds) => {
    detailsLookupQ.push(async (resolve) => {
        const roleIdToName = await getPersonDetails2({}, roleIds);
        const idToDetails = {...store.getState().idToDetails, ...roleIdToName};
        dispatch({...store.getState(), idToDetails, str: 'v-refetch-details'});

        await persistOffline(store.getState().idToDetails, PERSIST_KEY_ID_TO_DETAILS);
        resolve()
    });
};

export const observeGroupByInvite = (groupId) => {
    const nowMs = new Date().getTime();
    const { userDetails } = store.getState();
    const roleId = userDetails.role + ':' + userDetails.id;

    const db = firebase.firestore();
    const queryRef = db.collection(FIREBASE_GROUPS_DB_NAME).where(firebase.firestore.FieldPath.documentId(), '==', groupId);
    const observer = queryRef.onSnapshot(snapshot => {
        funcGroups(roleId, snapshot, nowMs, 'branch-group-' + groupId, store);
        observer();     // Unsubscribe
        cnsole.info('Read group from branch: ', groupId);
    });
    cnsole.info('Reading group from branch: ', groupId);
};

const setupObservers = ({ role, id }) => {
    const nowMs = new Date().getTime();
    const roleId = role + ':' + id;
    const csrole = role === 'supply' ? 'supplyId' : 'customerId';

    const db = firebase.firestore();
    const groupsCol = db.collection(FIREBASE_GROUPS_DB_NAME);
    const chatCol = db.collection(FIREBASE_CHAT_MESSAGES_DB_NAME);

    // TODO: Not showing public groups for now
    // const queryRef1 = groupsCol.where('isPrivate', '==', false);        // Public groups
    const queryRef2 = isSuperAdmin(roleId) ?            // Private groups
        groupsCol.where('isPrivate', '==', true) :
        groupsCol.where('isPrivate', '==', true).where('members', 'array-contains', roleId);
    const queryRef3 = chatCol.where('members', 'array-contains', roleId);
    const queryRef4 = chatCol.where(csrole, '==', parseInt(id));

    // const observer1 = queryRef1.onSnapshot((snapshot) => funcGroups(roleId, snapshot, nowMs, GROUP_DOCS_1, store));
    const observer2 = queryRef2.onSnapshot((snapshot) => funcGroups(roleId, snapshot, nowMs, GROUP_DOCS_2, store));
    const observer3 = queryRef3.onSnapshot((snapshot) => funcChatMessages(roleId, snapshot, nowMs, CHAT_DOCS_1, store));
    const observer4 = queryRef4.onSnapshot((snapshot) => funcChatMessages(roleId, snapshot, nowMs, CHAT_DOCS_2, store));
    // observers.push(observer1, observer2, observer3, observer4);
    observers.push(observer2, observer3, observer4);

    areObserversSetup = true;
    cnsole.info('Observers setup !');
};


const funcGroups = async (roleId, snapshot, nowMs, docsKey) => {
    groupsJobQ.push((resolve) => {
        funcGroups1(roleId, snapshot, nowMs, docsKey);
        resolve();
    });
};
const funcChatMessages = async (roleId, snapshot, nowMs, docsKey) => {
    chatsJobQ.push((resolve) => {
        funcChatMessages1(roleId, snapshot, nowMs, docsKey, store);
        resolve();
    });
};

const funcGroups1 = async (roleId, snapshot, nowMs, docsKey) => {
    cnsole.info('funcGroups: ', { roleId, nowMs, docsKey });
    cnsole.log('roleId, snapshot, nowMs, docsKey: ', { roleId, snapshot, nowMs, docsKey });

    if (store.getState().numUpdates[docsKey] <= 1) {
        cnsole.info('Time taken in firebase snapshot: ', new Date().getTime() - nowMs, docsKey);
    }

    const docChanges = snapshot.docChanges;
    cnsole.info('docChanges: ', docsKey, docChanges.length);

    const docs = [];
    const idToDocMapOverride = {};
    for (let i = 0; i < docChanges.length; i++) {
        const d = docChanges[i].doc;
        const { groupId, obj } = processGroupDocChange(d, roleId);
        if (obj) {
            idToDocMapOverride[groupId] = obj;
            docs.push(obj);
        }
    }
    const numDocsUpdated = docs.length;
    cnsole.info('Group Documents matching: ', docsKey, numDocsUpdated);

    const { numUpdates, idToDocMap } = store.getState();
    numUpdates[docsKey]++;
    cnsole.info('Num docs updated: ', docsKey, numDocsUpdated);
    dispatch({ ...store.getState(), numUpdates, idToDocMap: {...idToDocMap, ...idToDocMapOverride}, str: 'v-groups-1-' + docsKey });

    // Lookup the people that haven't already been looked up
    const needLookup1 = lodash.uniq(docs.flatMap(x => x.groupInfo.members.slice(0, NUM_MEMBERS_TO_SHOW)));
    const needLookup2 = lodash.uniq(docs.flatMap(x => x.groupInfo.messages.map(x => x.sender).reverse().slice(0, 50)));
    const needLookup = lodash.uniq(needLookup2.concat(needLookup1));

    detailsLookupQ.push(async (resolve) => {
        const roleIdToName = await getPersonDetails2(store.getState().idToDetails, needLookup);
        const idToDetails = { ...(store.getState().idToDetails), ...roleIdToName };
        dispatch({ ...store.getState(), idToDetails, str: 'v-groups-2-' + docsKey });

        await persistOffline(store.getState().idToDetails, PERSIST_KEY_ID_TO_DETAILS);
        await persistOfflineDocs(store.getState().idToDocMap, PERSIST_KEY_ID_TO_DOCUMENT_MAP);

        resolve();
    });
};

const funcChatMessages1 = async (roleId, snapshot, nowMs, docsKey) => {
    cnsole.info('funcChatMessages: ', { roleId, nowMs, docsKey });
    cnsole.log('roleId, snapshot, nowMs, docsKey: ', roleId, snapshot, nowMs, docsKey);
    const newState = store.getState();

    if (store.getState().numUpdates[docsKey] <= 1) {
        cnsole.info('Time taken in firebase snapshot: ', new Date().getTime() - nowMs, docsKey);
    }

    const docChanges = snapshot.docChanges;
    cnsole.info('docChanges: ', docsKey, docChanges.length);

    const docs = [];
    const idToDocMapOverride = {};
    for (let i = 0; i < docChanges.length; i++) {
        const d = docChanges[i].doc;
        const { groupId, obj } = await processChatDocChange(d, roleId);
        if (obj) {
            idToDocMapOverride[groupId] = obj;
            docs.push(obj);
        }
    }
    const numDocsUpdated = docs.length;
    cnsole.info('Chat Documents matching: ', docsKey, numDocsUpdated);

    const { numUpdates, idToDocMap } = store.getState();
    numUpdates[docsKey]++;
    cnsole.info('Num docs updated: ', docsKey, numDocsUpdated);
    dispatch({ ...store.getState(), numUpdates, idToDocMap: {...idToDocMap, ...idToDocMapOverride}, str: 'v-chats-1-' + docsKey });

    // Lookup the people that haven't already been looked up
    const needLookup = lodash.uniq(docs.flatMap(x => x.groupInfo.members));

    detailsLookupQ.push(async (resolve) => {
        const roleIdToName = await getPersonDetails2(store.getState().idToDetails, needLookup);
        const idToDetails = { ...(store.getState().idToDetails), ...roleIdToName };
        dispatch({ ...store.getState(), idToDetails, str: 'v-chats-2-' + docsKey });

        await persistOffline(store.getState().idToDetails, PERSIST_KEY_ID_TO_DETAILS);
        await persistOfflineDocs(store.getState().idToDocMap, PERSIST_KEY_ID_TO_DOCUMENT_MAP);

        resolve();
    });
};

const processGroupDocChange = (docChange, roleId) => {
    const groupId = docChange.id;
    cnsole.info('Processing group doc: ', groupId);
    cnsole.log('Processing group doc: ', docChange, groupId);
    if (groupId.startsWith(GROUPS_DOC_NAME_PREFIX)) {
        const data = docChange.data();

        const groupInfo = getGroupInfo(data, docChange);
        const { messages } = groupInfo;
        // TODO: Handle processing of training modules
        // const messages = await processTrainingModules(FIREBASE_GROUPS_DB_NAME, groupId, roleId, groupInfo.messages);
        // groupInfo.messages = messages;

        const { createdAt, photo, name, members } = groupInfo;
        const numUnreads = numUnreadsFn(data, roleId);
        const timestamp = messages.length > 0 ? messages[messages.length -1].timestamp : createdAt;
        const subHeading = messages.length > 0 ? messageSummary(messages[messages.length -1]) : '';

        const obj = { collection: FIREBASE_GROUPS_DB_NAME, groupId, docRef: docChange.ref, title: name, avatar: photo,
                      numUnreads, timestamp, subHeading, messages, members, groupInfo };
        return { obj, groupId };
    }
    return {};
};
const processChatDocChange = (docChange, roleId) => {
    const groupId = docChange.id;
    cnsole.info(' Processing chat doc: ', groupId);
    cnsole.log('Processing chat doc: ', docChange, groupId);
    if (groupId.startsWith(CHAT_MESSAGES_DOC_NAME_PREFIX)) {
        const data = docChange.data();

        const groupInfo = getPersonalMessageDocInfo(data, docChange);
        const { messages } = groupInfo;
        // TODO: Handle processing of training modules
        // const messages = await processTrainingModules(FIREBASE_CHAT_MESSAGES_DB_NAME, groupId, roleId, groupInfo.messages);
        // groupInfo.messages = messages;

        const { members } = groupInfo;
        const numUnreads = numUnreadsFn(data, roleId);
        const timestamp = messages.length > 0 ? messages[messages.length -1].timestamp : -1;
        const subHeading = messages.length > 0 ? messageSummary(messages[messages.length -1]) : '';

        const obj = { collection: FIREBASE_CHAT_MESSAGES_DB_NAME, groupId, docRef: docChange.ref, title: '', avatar: '',
                      numUnreads, timestamp, subHeading, messages, members, groupInfo };
        return { obj, groupId };
    }
    return {};
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
        delete copy.groupInfo.docRef;
        map[k] = copy;
    });
    await AsyncStorage.setItem(keyName, JSON.stringify(map));
};

const readFromOffline = async (keyName) => {
    cnsole.info('readFromOffline: ', keyName);
    const nowMs = new Date().getTime();
    const str = (await AsyncStorage.getItem(keyName)) || '{}';
    const obj = JSON.parse(str);
    cnsole.info('readFromOffline num keys: ', keyName, Object.keys(obj).length, (new Date().getTime() - nowMs));
    return obj;
};
