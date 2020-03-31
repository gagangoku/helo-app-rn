import {firebase} from '../platform/firebase';
import {FIREBASE_CHAT_MESSAGES_DB_NAME, FIREBASE_GROUPS_DB_NAME, GROUPS_SUPER_ADMINS} from "../constants/Constants";
import cnsole from 'loglevel';
import lodash from 'lodash';


export const setupFirebaseListener = () => {
    const db = firebase.firestore();

    db.collection(FIREBASE_GROUPS_DB_NAME).onSnapshot((snapshot) => onSnapshot(snapshot, FIREBASE_GROUPS_DB_NAME));
    db.collection(FIREBASE_CHAT_MESSAGES_DB_NAME).onSnapshot((snapshot) => onSnapshot(snapshot, FIREBASE_CHAT_MESSAGES_DB_NAME));
};

export const getLastReadIdx = (roleId) => {
    const now = new Date().getTime();
    const ret = getLastReadIdxGroup(roleId);
    cnsole.info('getLastReadIdxGroup took: ', new Date().getTime() - now);
    return ret;
};

const getLastReadIdxGroup = (roleId) => {
    const { lastReadIdx } = roleIdToLastReadIdx[roleId] || {};
    if (!lastReadIdx) {
        return {};
    }

    const ret = [];
    Object.keys(lastReadIdx).forEach(groupId => {
        const { lastMsg, total } = idTolastMessages[groupId];
        const idx = lastReadIdx[groupId];

        ret.push({ groupId, lastMsg, total, idx });
    });

    ret.sort((a, b) => b.lastMsg.timestamp - a.lastMsg.timestamp);
    cnsole.info('Returning view: ', roleId, ret.length);
    return ret;
};

const idToDocMap = {};
const roleIdToLastReadIdx = {};
const idTolastMessages = {};

const onSnapshot = (snapshot, collection) => {
    let idx = 0;

    const docChanges = snapshot.docChanges();
    docChanges.forEach(doc => {
        const groupId = doc.doc.id;
        const data = doc.doc.data();

        data.collection = collection;
        idToDocMap[groupId] = data;
        cnsole.info('snapshot: ', collection, groupId);
    });

    computeView();
    cnsole.info('Processed snapshot: ', collection, idx, docChanges.length);
};

const computeView = () => {
    Object.keys(idToDocMap).forEach(groupId => {
        const data = idToDocMap[groupId];
        const { collection } = data;
        const messages = data.messages || [];
        const lastMsg = messages.length > 0 ? messages[messages.length - 1] : { text: '', timestamp: 0 };
        let members = data.members || [];
        if (collection === GROUPS_SUPER_ADMINS) {
            members = lodash.uniq(members.concat(GROUPS_SUPER_ADMINS));
        }
        const lastReadIdx = data.lastReadIdx || {};

        if (!lastMsg.timestamp) {
            lastMsg.timestamp = 0;
        }
        delete lastMsg.loc;

        idTolastMessages[groupId] = { lastMsg, total: messages.length };
        members.forEach(roleId => {
            const idx = parseInt(lastReadIdx[roleId] || '-1');
            setLastViewed({ roleId, idx, lastMsg, groupId, collection });
        });
    });
};

const setLastViewed = ({ roleId, idx, groupId, collection }) => {
    if (!roleIdToLastReadIdx[roleId]) {
        roleIdToLastReadIdx[roleId] = { lastReadIdx: {} };
    }
    roleIdToLastReadIdx[roleId].lastReadIdx[groupId] = idx;
};
