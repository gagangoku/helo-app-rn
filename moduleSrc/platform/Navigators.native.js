import {GROUP_URLS, HOME_PAGE_URLS} from "../controller/Urls";
import cnsole from 'loglevel';
import {CommonActions} from '@react-navigation/native';
import {showToast} from "./Util";
import {getNavigationObject} from "../router/NavigationRef";
import {getUrlForCollection} from "../util/Util";


// Onclick functions
export const backOnclickFn = ({ data, navigation }) => {
    navigation.goBack();
};
export const showPersonDetailsPageOnclickFn = ({ data, navigation }) => {
    const { groupId, me } = data;
    navigation.navigate(GROUP_URLS.viewPerson, { groupId });
};
export const showGroupDetailsPageOnclickFn = ({ data, navigation }) => {
    const { collection, groupId } = data;
    navigation.navigate(GROUP_URLS.groupDetails, { collection, groupId });
};
export const phoneIconOnclickFn = ({ data, navigation }) => {
    showToast('Coming soon');
};

// Functions for more options
export const analyticsOnclickFn = ({ data, navigation }) => {
    const { me, groupId, collection } = data;
    cnsole.info('Group level analytics: ', me, groupId, collection);
    navigation.navigate(GROUP_URLS.groupAnalytics, {me, groupId, collection});
};
export const leaderboardOnclickFn = ({ data, navigation }) => {
    const { idx, me, groupId, collection } = data;
    cnsole.info('Group level leaderboard: ', idx, me, groupId, collection);
    navigation.navigate(GROUP_URLS.leaderboard, { idx, me, groupId, collection });
};
export const settingsOnclickFn = ({ data, navigation }) => {};
export const newGroupOnclickFn = ({ data, navigation }) => {
    navigation.navigate(GROUP_URLS.createGroup, {});
};
export const newSuperGroupOnclickFn = ({ data, navigation }) => {};


export const goToChatFn = ({ data, navigation }) => {
    const { collection, groupId } = data.doc;
    const url = getUrlForCollection(collection);
    if (!url) {
        showToast('Bad collection: ' + collection);
        cnsole.error('Bad collection received: ', collection, groupId);
        return;
    }
    navigation.navigate(url, data.doc);
};

export const goToChatFnReset = ({ data, navigation }) => {
    const { collection, groupId } = data.doc;
    const url = getUrlForCollection(collection);
    if (!url) {
        showToast('Bad collection: ' + collection);
        cnsole.error('Bad collection received: ', collection, groupId);
        return;
    }
    navigation.dispatch(
        CommonActions.reset({
            index: 1,
            routes: [
                { name: GROUP_URLS.groupList },
                { name: url, params: data.doc },
            ],
        })
    );
};

export const viewMyProfileFn = ({ data, navigation }) => {
    navigation.navigate(GROUP_URLS.viewMyProfile, {});
};
export const goBackFn = backOnclickFn;

export const newTaskList = ({ data }) => {
    const { groupId, groupName, collection, me } = data;
    const navigation = getNavigationObject();
    navigation.navigate(HOME_PAGE_URLS.newTaskList, { collection, groupId });
};

export const newSpreadsheet = ({ data }) => {
    const { groupId, groupName, collection, me } = data;
    const navigation = getNavigationObject();
    navigation.navigate(HOME_PAGE_URLS.newSpreadsheet, { collection, groupId });
};

export const playVideoFullscreen = ({ data, navigation }) => {
    const { collection, groupId, idx, me, videoUrl } = data;
    navigation.navigate(HOME_PAGE_URLS.videoAnalytics, { collection, groupId, idx, me, videoUrl });
};

export const gotoShareFileScreen = ({ data, navigation }) => {
    navigation.navigate(GROUP_URLS.shareFiles, data);
};

export const resetNavigationToHomeUrl = (navigation, home) => {
    navigation.dispatch(
        CommonActions.reset({
            index: 1,
            routes: [
                { name: home },
            ],
        })
    );
};
