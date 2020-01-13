import firebase from "react-native-firebase";
import {
    CHAT_MESSAGES_DOC_NAME_PREFIX,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME,
    GROUPS_DOC_NAME_PREFIX,
} from '../constants/Constants';
import {getImageUrl} from './Utils';
import lodash from 'lodash';
import {getPersonNamesByRoleId} from './Api';


export const initFirestore = async (role, id, cbFn) => {
    const csrole = role === 'supply' ? 'supplyId' : 'customerId';
    const roleId = role + '-' + id;

    const db = firebase.firestore();
    const queryRef1 = db.collection(FIREBASE_GROUPS_DB_NAME);    //.where('members', 'array-contains', roleId);
    const queryRef2 = db.collection(FIREBASE_CHAT_MESSAGES_DB_NAME).where(csrole, '==', parseInt(id));
    const queryRef3 = db.collection(FIREBASE_CHAT_MESSAGES_DB_NAME).where('members', 'array-contains', roleId);

    const nowMs = new Date().getTime();
    const observer1 = queryRef1.onSnapshot((snapshot) => funcGroups(roleId, snapshot, nowMs, 'groupDocs', cbFn));
    const observer2 = queryRef2.onSnapshot((snapshot) => funcChatMessages(roleId, snapshot, nowMs, 'chatDocs1', cbFn));
    const observer3 = queryRef3.onSnapshot((snapshot) => funcChatMessages(roleId, snapshot, nowMs, 'chatDocs2', cbFn));

};

let numUpdates = 0;
const funcGroups = async (roleId, snapshot, nowMs, docsKey, cbFn) => {
    console.log('roleId, snapshot, nowMs, docsKey: ', roleId, snapshot, nowMs, docsKey);
    if (numUpdates++ < 1) {
        console.log('Time taken in firebase snapshot: ', new Date().getTime() - nowMs);
    }

    const docs = [];
    snapshot.forEach(d => {
        const groupId = d.id;
        console.log('Processing group doc: ', d, groupId);
        if (groupId.startsWith(GROUPS_DOC_NAME_PREFIX)) {
            const data = d.data();

            const isPrivate = data.isPrivate || false;
            const members = data.members || [];
            if (isPrivate && !members.includes(roleId)) {
                return;
            }

            const title = data.name;
            const avatar = getImageUrl(data.photo);
            const numUnreads = numUnreadsFn(data, roleId);
            const messages = data.messages || [];
            const timestamp = messages.length > 0 ? messages[messages.length -1].timestamp : -1;
            const subHeading = messages.length > 0 ? summaryFn(messages[messages.length -1]) : '';
            docs.push({ collection: FIREBASE_GROUPS_DB_NAME, groupId, title, avatar, numUnreads, timestamp, subHeading, messages, members });
        }
    });
    console.log('Group Documents matching: ', docs);

    cbFn({[docsKey]: docs});
};

const funcChatMessages = async (roleId, snapshot, nowMs, docsKey, cbFn) => {
    console.log('roleId, snapshot, nowMs, docsKey: ', roleId, snapshot, nowMs, docsKey);
    if (numUpdates++ < 1) {
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
            const subHeading = messages.length > 0 ? summaryFn(messages[messages.length -1]) : '';
            docs.push({ collection: FIREBASE_CHAT_MESSAGES_DB_NAME, groupId, title, avatar, numUnreads, timestamp, subHeading, messages, members });
        }
    });
    console.log('Chat Documents matching: ', docs);

    const needLookup = lodash.uniq(docs.flatMap(x => x.members)).filter(x => x !== roleId);
    const roleIdToName = await getPersonNamesByRoleId(needLookup);
    docs.forEach(d => {
        const otherGuy = d.members[0] === roleId ? d.members[1] : d.members[0];
        if (!roleIdToName[otherGuy]) {
            console.log('roleIdToName[otherGuy] bad: ', otherGuy, roleIdToName);
            return;
        }
        d.title = roleIdToName[otherGuy].person.name;
        d.avatar = getImageUrl(roleIdToName[otherGuy].person.thumbImage || roleIdToName[otherGuy].person.image);
    });

    cbFn({[docsKey]: docs});
};

const numUnreadsFn = (doc, roleId) => {
    const lastReadIdxMap = doc.lastReadIdx || {};
    const lastReadIdx = parseInt(lastReadIdxMap[roleId] || 0);
    const messages = (doc.messages || []);
    if (messages.length === 0) {
        console.log('Bad chat: ', doc);
        return 0;
    }
    return messages.length - lastReadIdx;
};

const summaryFn = (message) => {
    return message.type;
    // switch (message.type) {
    //     case OUTPUT_NONE:
    //     case OUTPUT_TEXT:
    //         const text = message.text.replace(/<br>/g, ' ').replace(/<br\/>/g, ' ');
    //         return text.substr(0, Math.min(20, message.text.length)) + ' ...';
    //     case OUTPUT_IMAGE:
    //         return 'Image';
    //     case OUTPUT_AUDIO:
    //         return 'Audio';
    //     case OUTPUT_VIDEO:
    //         return 'Video';
    //     case OUTPUT_LOCATION:
    //         return 'Location';
    //     case OUTPUT_MISSED_CALL:
    //         return 'Missed call';
    //     case OUTPUT_JOB_ACTIONABLE:
    //     case OUTPUT_JOB_REFERENCE:
    //         return 'Job';
    //
    //     default:
    //         console.log('Unknown question type: ', message);
    //         return '';
    // }
};
