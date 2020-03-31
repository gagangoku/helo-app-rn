import cnsole from "loglevel";
import format from "string-format";
import {GROUP_URLS, HOME_PAGE_URLS} from "../controller/Urls";
import window from "global";
import {FIREBASE_CHAT_MESSAGES_DB_NAME} from "../constants/Constants";
import {showToast} from "./Util";


// Onclick functions
export const backOnclickFn = ({ data }) => {
    cnsole.log('backOnclickFn: ');
    window.history.back();
};
export const showPersonDetailsPageOnclickFn = ({ data }) => {
    const { groupId, me } = data;
    const otherRoleId = groupId.split(',').filter(x => x !== me.sender)[0];
    const url = format('{}?roleId={}&otherRoleId={}', GROUP_URLS.viewPerson, otherRoleId, otherRoleId);
    window.open(url);
};
export const showGroupDetailsPageOnclickFn = ({ data }) => {
    const { groupId } = data;
    const url = format('{}?group={}', GROUP_URLS.groupDetails, groupId);
    window.open(url);
};
export const phoneIconOnclickFn = ({ data }) => {
    showToast('Coming soon');
};

// Functions for more options
export const analyticsOnclickFn = ({ data }) => {
    const { me, groupId, collection } = data;
    cnsole.log('Group level analytics: ', me, groupId, collection);
    const url = format('{}/?me={}&groupId={}&collection={}', GROUP_URLS.groupAnalytics, me.sender, groupId, collection);
    window.open(url, '_blank');
};
export const leaderboardOnclickFn = ({ data }) => {
    const { me, groupId, collection, leaderboardFn } = data;
    cnsole.log('Group level leaderboard: ', me, groupId, collection);
    leaderboardFn({ idx: -1, me, groupId, collection });
};
export const settingsOnclickFn = ({ data }) => {};
export const newGroupOnclickFn = ({ data }) => {
    window.open(GROUP_URLS.createGroup, '_blank');
};
export const newSuperGroupOnclickFn = ({ data }) => {};


export const goToChatFn = ({ data }) => {
    const { collection, groupId, otherRoleId } = data.doc;
    if (collection === FIREBASE_CHAT_MESSAGES_DB_NAME) {
        const url = format('{}?otherPerson={}', GROUP_URLS.personalMessaging, otherRoleId);
        window.open(url, '_blank');
    } else {
        const url = format('{}?collection={}&group={}', GROUP_URLS.groupJoin, collection, groupId);
        window.open(url, '_blank');
    }
};
export const viewMyProfileFn = ({ data }) => {
    window.open(GROUP_URLS.viewMyProfile, '_blank');
};
export const goBackFn = backOnclickFn;

export const playVideoFullscreen = ({ data }) => {
    const { collection, groupId, idx, me, videoUrl } = data;
    const url = format('{}?collection={}&groupId={}&idx={}&user={}&videoUrl={}', HOME_PAGE_URLS.videoAnalytics, collection, groupId, idx, me.sender, encodeURIComponent(videoUrl));
    window.open(url, '_blank');
};

export const newTaskList = ({ data }) => {
    const { groupId, groupName, collection, me } = data;
    const url = format('{}?groupId={}&groupName={}&collection={}&me={}',
                       HOME_PAGE_URLS.newTaskList, groupId, groupName, collection, encodeURIComponent(JSON.stringify(me)));
    window.open(url, '_blank');
};

export const newSpreadsheet = ({ data }) => {
    const { groupId, groupName, collection, me } = data;
    const url = format('{}?groupId={}&groupName={}&collection={}&me={}',
                        HOME_PAGE_URLS.newSpreadsheet, groupId, groupName, collection, encodeURIComponent(JSON.stringify(me)));
    window.open(url, '_blank');
};
