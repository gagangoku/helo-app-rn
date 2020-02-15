import {getDetailsFromPhone, getGroupInfo, getImageUrl, getPersonDetails} from "../util/Util";
import {getLocationFromIPAddress} from "../util/Api";
import {firebase} from '../platform/firebase';
import {
    CHAT_MESSAGES_DOC_NAME_PREFIX,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME,
    GROUPS_DOC_NAME_PREFIX,
    GROUPS_SUPER_ADMINS
} from "../constants/Constants";
import lodash from "lodash";
import {AsyncStorage} from "../platform/Util";
import LRU from 'lru-cache';
import {createStore} from "redux";
import {reducerFn} from "./reducers";


const GROUP_DOCS_1 = 'groupDocs1';
const GROUP_DOCS_2 = 'groupDocs2';
const CHAT_DOCS_1  = 'chatDocs1';
const CHAT_DOCS_2  = 'chatDocs2';
const PERSIST_KEY_ID_TO_DETAILS = 'persist-idToDetails';


const store = createStore(reducerFn);

const globalState = {
    observers: [],
    documentsCache: {},
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
setInterval(() => persistOffline(globalState.idToDetails, PERSIST_KEY_ID_TO_DETAILS), 2 * 60 * 1000);

const setupInternalState = async (watchFn) => {
    watchFn = watchFn || (() => {});
    globalState.idToDetails = await readFromOffline(PERSIST_KEY_ID_TO_DETAILS);

    const ipLocationPromise = getLocationFromIPAddress();
    const userDetailsPromise = getDetailsFromPhone();

    globalState.userDetails = await userDetailsPromise;
    const { phone, id, name, role, image } = globalState.userDetails;
    if (!id || !role) {
        // Not logged in
        return;
    }

    globalState.ipLocation = await ipLocationPromise;
    setupObservers({ role, id, watchFn });
};

const setupObservers = ({ role, id, watchFn }) => {
    const nowMs = new Date().getTime();
    const roleId = role + ':' + id;
    const csrole = role === 'supply' ? 'supplyId' : 'customerId';

    const db = firebase.firestore();
    const groupsCol = this.db.collection(FIREBASE_GROUPS_DB_NAME);
    const chatCol = this.db.collection(FIREBASE_CHAT_MESSAGES_DB_NAME);

    const queryRef1 = groupsCol.where('isPrivate', '==', false);        // Public groups
    const queryRef2 = GROUPS_SUPER_ADMINS.includes(roleId) ?            // Private groups
        groupsCol.where('isPrivate', '==', true) :
        groupsCol.where('isPrivate', '==', true).where('members', 'array-contains', roleId);
    const queryRef3 = chatCol.where('members', 'array-contains', roleId);
    const queryRef4 = chatCol.where(csrole, '==', parseInt(id));

    const observer1 = queryRef1.onSnapshot((snapshot) => funcGroups(roleId, snapshot, nowMs, GROUP_DOCS_1, watchFn));
    const observer2 = queryRef2.onSnapshot((snapshot) => funcGroups(roleId, snapshot, nowMs, GROUP_DOCS_2, watchFn));
    const observer3 = queryRef3.onSnapshot((snapshot) => funcChatMessages(roleId, snapshot, nowMs, CHAT_DOCS_1, watchFn));
    const observer4 = queryRef4.onSnapshot((snapshot) => funcChatMessages(roleId, snapshot, nowMs, CHAT_DOCS_2, watchFn));
    globalState.observers.push(observer1, observer2, observer3, observer4);
};

const funcGroups = async (roleId, snapshot, nowMs, docsKey, watchFn) => {
    console.log('roleId, snapshot, nowMs, docsKey: ', roleId, snapshot, nowMs, docsKey);
    const { numUpdates, documentsCache } = globalState;

    if (numUpdates[docsKey] <= 1) {
        console.log('Time taken in firebase snapshot: ', new Date().getTime() - nowMs);
    }

    const docs = [];
    snapshot.forEach(d => {
        const groupId = d.id;
        console.log('Processing group doc: ', d, groupId);
        if (groupId.startsWith(GROUPS_DOC_NAME_PREFIX)) {
            const data = d.data();

            const { createdAt, members, messages, isPrivate, name, photo } = getGroupInfo(data, d);
            if (isPrivate && !members.concat(GROUPS_SUPER_ADMINS).includes(roleId)) {
                return;
            }

            const numUnreads = numUnreadsFn(data, roleId);
            const timestamp = messages.length > 0 ? messages[messages.length -1].timestamp : createdAt;
            const subHeading = messages.length > 0 ? this.summary(messages[messages.length -1]) : '';
            docs.push({ collection: FIREBASE_GROUPS_DB_NAME, groupId, title: name, avatar: getImageUrl(photo),
                        numUnreads, timestamp, subHeading, messages, members });
        }
    });
    console.log('Group Documents matching :', docsKey, ' - ', docs);

    numUpdates[docsKey]++;
    documentsCache[docsKey] = docs;
    watchFn(globalState);
};

const funcChatMessages = async (roleId, snapshot, nowMs, docsKey, watchFn) => {
    console.log('roleId, snapshot, nowMs, docsKey: ', roleId, snapshot, nowMs, docsKey);
    const { numUpdates, documentsCache, idToDetails } = globalState;

    if (numUpdates[docsKey] <= 1) {
        console.log('Time taken in firebase snapshot: ', new Date().getTime() - nowMs);
    }

    const docs = [];
    snapshot.forEach(d => {
        const groupId = d.id;
        console.log('Processing chat doc: ', d, groupId);
        if (groupId.startsWith(CHAT_MESSAGES_DOC_NAME_PREFIX)) {
            const data = d.data();

            const title = '';       // Will be filled later
            const avatar = '';      // Will be filled later
            const numUnreads = numUnreadsFn(data, roleId);
            const messages = data.messages || [];
            const members = data.members || groupId.split(',');
            const timestamp = messages.length > 0 ? messages[messages.length -1].timestamp : -1;
            const subHeading = messages.length > 0 ? this.summary(messages[messages.length -1]) : '';
            docs.push({ collection: FIREBASE_CHAT_MESSAGES_DB_NAME, groupId, title, avatar, numUnreads, timestamp, subHeading, messages, members });
        }
    });
    console.log('Chat Documents matching: ', docs);

    // Lookup the people that haven't already been looked up
    const needLookup = lodash.uniq(docs.flatMap(x => x.members)).filter(x => x !== roleId);
    await getPersonDetails(idToDetails, needLookup, []);

    docs.forEach(d => {
        const otherGuy = d.members[0] === roleId ? d.members[1] : d.members[0];
        if (!idToDetails[otherGuy]) {
            console.log('roleIdToName[otherGuy] bad: ', otherGuy, Object.keys(idToDetails));
            return;
        }
        d.title = idToDetails[otherGuy].person.name;
        d.avatar = getImageUrl(idToDetails[otherGuy].person.thumbImage || idToDetails[otherGuy].person.image);
    });

    numUpdates[docsKey]++;
    documentsCache[docsKey] = docs;
    watchFn(globalState);
};

const numUnreadsFn = (doc, roleId) => {
    const lastReadIdxMap = doc.lastReadIdx || {};
    const lastReadIdx = parseInt(lastReadIdxMap[roleId] || 0);
    const messages = (doc.messages || []);
    return messages.length - lastReadIdx;
};

const persistOffline = async (map, mapName) => {
    await AsyncStorage.setItem(mapName, JSON.stringify(map));
};

const readFromOffline = async (mapName) => {
    const str = (await AsyncStorage.getItem(mapName)) || '{}';
    return JSON.parse(str);
};

// TODO: Use when appropriate
const lruCache = new LRU({
    max: 10000,
    maxAge: 1000 * 60 * 60,
    dispose: (key, val) => {
        globalState.disposedKeys.push(key);
    },
});

export {
    setupInternalState,
    store,
}
