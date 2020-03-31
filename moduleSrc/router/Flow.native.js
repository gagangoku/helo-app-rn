import 'react-native-gesture-handler';
import * as React from 'react';
import {DeviceEventEmitter, Easing, NativeModules} from 'react-native';
import {NavigationContainer, useIsFocused} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {AsyncStorage, showToast, Text, View} from "../platform/Util";
import {
    APP_DEBUG_MODE,
    APP_VERSION,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME,
    MWEB_URL,
    PHONE_NUMBER_KEY
} from "../constants/Constants";
import {GroupListUI} from "../chat/groups/GroupListController";
import {GroupPage} from "../platform/GroupPage.native";
import {GroupMessagesWithCreateLogic} from "../chat/groups/GroupMessages";
import {store} from './store';
import {connect, Provider} from 'react-redux';
import {
    createVisitorIfRequired,
    getDetailsFromPhone,
    getImageUrl,
    messageSummary,
    sendMessageToGroup
} from "../util/Util";
import cnsole from 'loglevel';
import LoginScreen from "../chat/login/LoginScreen";
import {GROUP_URLS, HOME_PAGE_URLS} from "../controller/Urls";
import * as functions from '../platform/Navigators';
import {GroupCreatePage} from "../chat/groups/GroupCreatePage";
import {GroupAnalyticsNative} from "../chat/analytics/GroupAnalytics";
import LeaderBoard from "../chat/analytics/LeaderBoard";
import {GroupDetailsPageUI} from "../chat/groups/GroupDetailsPage";
import {ViewPersonProfileUI} from "../chat/profile/ViewPersonProfile";
import {FullscreenVideoWidget} from "../platform/FullscreenVideoWidget.native";
import format from 'string-format';
import {MyProfileUI} from "../chat/profile/MyProfile";
import {getNavigationObject, navigationRef} from "./NavigationRef";
import LottieView from "lottie-react-native";
import animation from "../assets/splash-animation";
import {
    executeOrQueueBranchAction,
    reportSplashLoadedAndExecuteBranchActions,
    setupInternalState
} from "./InternalState.native";
import {gotoShareFileScreen, resetNavigationToHomeUrl} from "../platform/Navigators.native";
import {subscribeToTopic} from "../platform/firebase.native";
import {TaskListCreatorUI} from "../widgets/TaskListCreatorUI";
import {OUTPUT_EXCEL, OUTPUT_TASK_LIST} from "../chat/Questions";
import {Spreadsheet} from "../platform/Spreadsheet";
import {whatToDoWithAppVersion} from "../util/Api";
import {ForceAppUpdateScreen} from "../widgets/ForceAppUpdateScreen.native";
import {ShareFilesScreen} from "../chat/ShareFilesScreen";
import {SimpleBotClient} from "../chat/bot/SimpleBotClient";


const Stack = createStackNavigator();
export function App(props) {
    cnsole.info('App props: ', props);

    // Disable screen transition animation
    const config = { timing: 0, easing: Easing.step0 };
    const options = {
        transitionSpec: {
            open: { animation: 'timing', config },
            close: { animation: 'timing', config },
        },
    };

    const mapStateToPropsDef = state => ({ globalState: state });
    return (
        <Provider store={store}>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={Splash.URL} headerMode="none">
                    {screens.map(x => <Stack.Screen name={x.URL} key={x.URL} options={options}
                                                    component={connect(x.mapStateToProps || mapStateToPropsDef)(x)} />)}
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );
}

const onReceivedIntent = (event) => {
    cnsole.info('Got intent: ', event);
    const { extras, type, action } = event;
    if (action === 'android.intent.action.SEND_MULTIPLE' || action === 'android.intent.action.SEND') {
        executeOrQueueBranchAction(() => {
            const navigation = getNavigationObject();
            cnsole.info('Going to share screen');
            gotoShareFileScreen({data: event, navigation});
        });
    }
};
// DeviceEventEmitter.addListener('receivedShareIntent', onReceivedIntent);


// App initialization code
export const appInit = () => {
};

const masterFlow = async (navigation) => {
    // Register for OTP input
    APP_DEBUG_MODE && showToast("Waiting for OTP");
    NativeModules.PhoneNumberVerificationModule.registerForOtpIntent();

    try {
        const whatToDo = await whatToDoWithAppVersion();
        cnsole.info('whatToDo response: ', whatToDo);
        if (whatToDo.forceUpdate) {
            // Force update the app
            resetNavigationToHomeUrl(navigation, HOME_PAGE_URLS.appUpdate);
            return;
        }
    } catch (e) {
        cnsole.error('whatToDo call failed: ', e);
    }

    const userDetails = await getDetailsFromPhone();
    const { role, id, phone } = userDetails;
    if (!phone) {
        resetNavigationToHomeUrl(navigation, HOME_PAGE_URLS.login);
        return;
    }

    if (!role || !id) {
        const success = await createVisitorIfRequired(phone);
        if (!success) {
            window.alert('Something went wrong creating your account');
            resetNavigationToHomeUrl(navigation, HOME_PAGE_URLS.login);
            return;
        }
    }

    const topic = 'helo-app-rn-' + role + '-' + id;
    subscribeToTopic(topic);

    // Setup the database listeners
    await setupInternalState(store);

    // Mark splash loading as complete and execute any branch actions if exist
    const isDone = reportSplashLoadedAndExecuteBranchActions();

    // Otherwise goto home page
    if (!isDone) {
        resetNavigationToHomeUrl(navigation, GROUP_URLS.groupList);
    }
};


// UI Components
class SplashPage extends React.PureComponent {
    async componentDidMount() {
        const { globalState } = this.props;
        cnsole.info('SplashPage componentDidMount: ', globalState.version);
        setTimeout(this.redirect, 200);
    }
    componentDidUpdate() {
        const { globalState } = this.props;
        cnsole.info('SplashPage componentDidUpdate: ', globalState.version);
    }

    redirect = async () => {
        const navigation = getNavigationObject();
        await masterFlow(navigation);
    };

    render() {
        return (
            <View style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', letterSpacing: 2 }}>HELO</Text>

                <View style={{ marginTop: 50, height: 200, width: 200 }}>
                    <LottieView autoPlay={true} loop={true} ref={animation => this.animation = animation} source={animation} />
                </View>

                <Text style={{ fontSize: 12, marginTop: 50, color: '#969696' }}>Version: {APP_VERSION}</Text>
            </View>
        );
    }
}

function Splash({ navigation, route, globalState }) {
    cnsole.info('Splash version: ', globalState.version, route.params);
    return (
        <SplashPage globalState={globalState} />
    );
}
Splash.URL = GROUP_URLS.splash;
SplashPage.mapStateToProps = state => ({ globalState: state });


function LoginPage({ navigation, route, globalState }) {
    return <LoginScreen onSuccessFn={(phone) => gotPhoneNumberFn(phone, navigation)} />;
}
LoginPage.URL = HOME_PAGE_URLS.login;
LoginPage.mapStateToProps = state => ({ globalState: state });


function ShareFilesPage({ navigation, route, globalState }) {
    const data = route.params;
    return <ShareFilesScreen {...data} />;
}
ShareFilesPage.URL = GROUP_URLS.shareFiles;
ShareFilesPage.mapStateToProps = state => ({ globalState: state });


function ForceAppUpdate({ navigation, route, globalState }) {
    cnsole.info('ForceAppUpdate version: ', globalState.version, route.params);
    return (
        <ForceAppUpdateScreen />
    );
}
ForceAppUpdate.URL = HOME_PAGE_URLS.appUpdate;
ForceAppUpdate.mapStateToProps = state => ({ globalState: state });


function GroupList({ navigation, route, globalState }) {
    const {idToDocMap, idToDetails, userDetails, version} = globalState;
    const isFocus = useIsFocused();
    cnsole.info('GroupList version: ', version, route.params, isFocus);
    if (!isFocus) {
        return <View />;
    }
    if (!idToDocMap || !userDetails) {
        return <Text>Loading ...</Text>;
    }

    const {role, id} = userDetails;
    const me = {...userDetails, sender: role + ':' + id};

    const lineItems = [];
    Object.keys(idToDocMap).forEach(groupId => {
        const doc = idToDocMap[groupId];
        const { collection, groupInfo } = doc;
        const { messages, lastReadIdx } = groupInfo;
        if (messages.length === 0 && collection === FIREBASE_CHAT_MESSAGES_DB_NAME) {
            return;
        }

        const numUnreads = numUnreadsFn(lastReadIdx, messages, me.sender);
        let name, image;
        if (collection === FIREBASE_CHAT_MESSAGES_DB_NAME) {
            const otherPersonId = groupId.split(',').filter(x => x !== me.sender)[0];
            name  = idToDetails[otherPersonId]?.person?.name || '';
            image = idToDetails[otherPersonId]?.person?.image || '';
        } else {
            name  = groupInfo.name;
            image = groupInfo.photo;
        }
        const subHeading = messages.length > 0 ? messageSummary(messages[messages.length -1]) : '';
        const timestamp = messages.length > 0 ? messages[messages.length - 1].timestamp : 0;
        lineItems.push({ collection, groupId, name, subHeading, image, numUnreads, timestamp });
    });

    lineItems.sort((d1, d2) => d2.timestamp - d1.timestamp);
    return (
        <GroupListUI me={me} lineItems={lineItems} />
    );
}
GroupList.URL = GROUP_URLS.groupList;
GroupList.mapStateToProps = state => ({ globalState: state });


function GroupPageEntry({ navigation, route, globalState }) {
    const { groupId, branchInvite } = route.params;
    const { userDetails, ipLocation, idToDocMap, idToDetails, version } = globalState;
    const isFocus = useIsFocused();
    cnsole.info('GroupPageEntry version: ', version, groupId, Object.keys(idToDocMap).length, isFocus, branchInvite);

    if (!idToDocMap || Object.keys(idToDocMap).length === 0) {
        return <View />;
    }
    if (!(groupId in idToDocMap) && !branchInvite) {
        cnsole.warn('Group does not exist, or its details have not been fetched yet: ', groupId);
        return <View />;
    }

    const { groupInfo, docRef } = idToDocMap[groupId];
    const groupInfoCopy = {...groupInfo, filteredMessages: groupInfo.messages};
    return (
        <GroupPage groupInfo={groupInfoCopy} docRef={docRef}
                   groupId={groupId} userDetails={userDetails} ipLocationResponse={ipLocation}
                   idToDetails={idToDetails} idToDocMap={idToDocMap}
                   goBackFn={() => functions.goBackFn({ navigation })} />
    );
}
GroupPageEntry.URL = GROUP_URLS.groupJoin;
GroupPageEntry.mapStateToProps = state => ({ globalState: state });


function PersonalMessagingEntry({ navigation, route, globalState }) {
    let { groupId, otherRoleId } = route.params;
    cnsole.info('PersonalMessagingEntry version: ', globalState.version, { groupId, otherRoleId });

    if (!groupId && !otherRoleId) {
        cnsole.error('BAD personal messaging: ', route);
        window.alert('BAD personal messaging');
        return <View />;
    }

    const { userDetails, ipLocation, idToDocMap, idToDetails } = globalState;
    if (!idToDocMap || !userDetails) {
        return <View />;
    }

    const { role, id } = userDetails;
    const me = {...userDetails, sender: role + ':' + id};

    if (!otherRoleId) {
        otherRoleId = groupId.split(',').filter(x => x !== me.sender)[0];
        cnsole.info('Computed otherRoleId: ', otherRoleId);
    } else if (!groupId) {
        groupId = [me.sender, otherRoleId].sort().join(',');
    }
    const otherPerson = idToDetails[otherRoleId].person;
    cnsole.info('otherPerson: ', otherPerson);

    const { groupInfo, docRef } = idToDocMap[groupId] || {};
    const groupInfoCopy = !groupInfo ? null : {...groupInfo, filteredMessages: groupInfo.messages, photo: getImageUrl(otherPerson.image), name: otherPerson.name};
    return (
        <GroupMessagesWithCreateLogic goBackFn={() => functions.goBackFn({ navigation })}
                                      me={me} otherPerson={otherPerson}
                                      collection={FIREBASE_CHAT_MESSAGES_DB_NAME} groupId={groupId}
                                      ipLocation={ipLocation} idToDocMap={idToDocMap}
                                      groupInfo={groupInfoCopy} docRef={docRef} idToDetails={idToDetails} />
    );
}
PersonalMessagingEntry.URL = GROUP_URLS.personalMessaging;
PersonalMessagingEntry.mapStateToProps = state => ({ globalState: state });


function BotClientEntry({ navigation, route, globalState }) {
    const { groupId } = route.params;
    cnsole.info('BotClientEntry version: ', globalState.version, groupId);

    const { userDetails, idToDocMap, idToDetails } = globalState;
    if (!idToDocMap || !userDetails) {
        return <View />;
    }

    const { role, id } = userDetails;
    const sender = role + ':' + id;
    const me = {
        sender, role, id,
    };

    return (
        <SimpleBotClient botName={groupId} idToDocMap={idToDocMap} idToDetails={idToDetails} me={me} />
    );
}
BotClientEntry.URL = GROUP_URLS.botClientPage;
BotClientEntry.mapStateToProps = state => ({ globalState: state });


function ViewPersonProfile({ navigation, route, globalState }) {
    cnsole.info('ViewPersonProfile version: ', globalState.version, route.params);
    const { groupId } = route.params;
    const { userDetails, idToDocMap, idToDetails } = globalState;
    if (!idToDocMap) {
        return <View />;
    }

    const { role, id } = userDetails;
    const roleId = role + ':' + id;
    const otherRoleId = groupId.split(',').filter(x => x !== roleId)[0];
    if (!otherRoleId) {
        // Trying to view my own profile
        return ViewMyProfile({ navigation, route, globalState });
    }

    const otherPerson = idToDetails[otherRoleId];
    const visitor  = otherRoleId.startsWith('visitor:') ? otherPerson.person : null;
    const customer = otherRoleId.startsWith('cust:') ? otherPerson : null;
    const supply   = otherRoleId.startsWith('supply:') ? otherPerson : null;

    const p1Groups = findGroupsPartOf(roleId, idToDocMap);
    const p2Groups = findGroupsPartOf(otherRoleId, idToDocMap);
    return (
        <ViewPersonProfileUI userDetails={userDetails}
                             visitor={visitor} customer={customer} supply={supply}
                             p1Groups={p1Groups} p2Groups={p2Groups} />
    );
}
ViewPersonProfile.URL = GROUP_URLS.viewPerson;
ViewPersonProfile.mapStateToProps = state => ({ globalState: state });


function ViewMyProfile({ navigation, route, globalState }) {
    cnsole.info('ViewMyProfile version: ', globalState.version, route.params);
    const { userDetails, idToDetails } = globalState;
    if (!idToDetails || !userDetails) {
        return <View />;
    }

    const { role, id, phone } = userDetails;
    const roleId = role + ':' + id;

    const me = idToDetails[roleId];
    const visitor  = roleId.startsWith('visitor:') ? me.person : null;
    const customer = roleId.startsWith('cust:') ? me : null;
    const supply   = roleId.startsWith('supply:') ? me : null;

    return (
        <MyProfileUI visitor={visitor} customer={customer} supply={supply} phone={phone} />
    );
}
ViewMyProfile.URL = GROUP_URLS.viewMyProfile;
ViewMyProfile.mapStateToProps = state => ({ globalState: state });


function NewGroupPage({ navigation, route, globalState }) {
    cnsole.info('NewGroupPage version: ', globalState.version, route.params);

    return (
        <GroupCreatePage />
    );
}
NewGroupPage.URL = GROUP_URLS.createGroup;
NewGroupPage.mapStateToProps = state => ({ globalState: state });


function AnalyticsPage({ navigation, route, globalState }) {
    cnsole.info('AnalyticsPage version: ', globalState.version, route.params);

    const { groupId } = route.params;
    const { idToDocMap, idToDetails } = globalState;
    const { groupInfo } = idToDocMap[groupId];

    return (
        <GroupAnalyticsNative groupId={groupId} groupInfo={groupInfo} roleIdToName={idToDetails} />
    );
}
AnalyticsPage.URL = GROUP_URLS.groupAnalytics;
AnalyticsPage.mapStateToProps = state => ({ globalState: state });


function LeaderboardPage({ navigation, route, globalState }) {
    cnsole.info('LeaderboardPage version: ', globalState.version, route.params);

    const { collection, groupId, idx } = route.params;
    const { userDetails, idToDocMap, idToDetails } = globalState;
    const user = userDetails.role + ':' + userDetails.id;
    const { groupInfo } = idToDocMap[groupId];
    const { name, photo, messages, members } = groupInfo;
    const moduleName = idx >= 0 ? messages[idx].text : null;

    const obj = { collection, groupId, user, idx, roleIdToName: idToDetails,
                  groupName: name, groupPhoto: photo, moduleName, members: members.join(',') };
    cnsole.log('Showing leaderboard for: ', {...obj, roleIdToName: null});

    return (
        <LeaderBoard {...obj} />
    );
}
LeaderboardPage.URL = GROUP_URLS.leaderboard;
LeaderboardPage.mapStateToProps = state => ({ globalState: state });


function GroupDetailsPage({ navigation, route, globalState }) {
    cnsole.log('GroupDetailsPage: ', globalState, navigation, route);
    cnsole.info('GroupDetailsPage version: ', globalState.version, route.params);

    const { collection, groupId } = route.params;
    const { userDetails, idToDocMap, idToDetails, contacts } = globalState;
    const { docRef, groupInfo } = idToDocMap[groupId];

    const obj = { collection, groupId, userDetails, groupInfo, idToDetails, docRef, contacts };
    return (
        <GroupDetailsPageUI {...obj} />
    );
}
GroupDetailsPage.URL = GROUP_URLS.groupDetails;
GroupDetailsPage.mapStateToProps = state => ({ globalState: state });


function PlayVideoPage({ navigation, route, globalState }) {
    cnsole.info('PlayVideoPage version: ', globalState.version, route.params);

    const { collection, groupId, idx, me, videoUrl } = route.params;
    const url = format('{}{}?collection={}&groupId={}&idx={}&user={}&videoUrl={}', MWEB_URL, HOME_PAGE_URLS.videoAnalytics, collection, groupId, idx, me.sender, encodeURIComponent(videoUrl));
    return (
        <FullscreenVideoWidget src={url} />
    );
}
PlayVideoPage.URL = HOME_PAGE_URLS.videoAnalytics;
PlayVideoPage.mapStateToProps = state => ({ globalState: state });


function NewTaskListPage({ navigation, route, globalState }) {
    cnsole.info('NewTaskListPage version: ', globalState.version, route.params);

    const { groupId } = route.params;
    const {idToDocMap, idToDetails, userDetails, version} = globalState;
    if (!idToDocMap || !userDetails) {
        return <Text>Loading ...</Text>;
    }

    const {role, id} = userDetails;
    const me = {...userDetails, sender: role + ':' + id};

    const { groupInfo, docRef } = idToDocMap[groupId];
    const { name } = groupInfo;

    const submitFn = (payload) => newTaskListFn({ docRef, groupInfo, idToDetails, me, groupId, payload });
    return <TaskListCreatorUI groupName={name} submitFn={submitFn} />;
}
NewTaskListPage.URL = HOME_PAGE_URLS.newTaskList;
NewTaskListPage.mapStateToProps = state => ({ globalState: state });


function NewSpreadsheetPage({ navigation, route, globalState }) {
    cnsole.info('NewSpreadsheetPage version: ', globalState.version, route.params);

    const { groupId } = route.params;
    const {idToDocMap, idToDetails, userDetails, version} = globalState;
    if (!idToDocMap || !userDetails) {
        return <Text>Loading ...</Text>;
    }

    const {role, id} = userDetails;
    const me = {...userDetails, sender: role + ':' + id};

    const { groupInfo, docRef } = idToDocMap[groupId];
    const { name } = groupInfo;

    const submitFn = (payload) => newSpreadsheetFn({ docRef, groupInfo, idToDetails, me, groupId, payload });
    return <Spreadsheet mode={Spreadsheet.MODE_EDITING} submitFn={submitFn} />;
}
NewSpreadsheetPage.URL = HOME_PAGE_URLS.newSpreadsheet;
NewSpreadsheetPage.mapStateToProps = state => ({ globalState: state });


const gotPhoneNumberFn = async (phone, navigation) => {
    cnsole.info('Saving phone number: ', phone);
    await AsyncStorage.setItem(PHONE_NUMBER_KEY, phone);

    await masterFlow(navigation);
};
const findGroupsPartOf = (roleId, idToDocMap) => {
    const groups = {};
    Object.keys(idToDocMap).forEach(groupId => {
        const { groupInfo } = idToDocMap[groupId];
        const { collection, members, photo, name } = groupInfo;
        if (collection === FIREBASE_GROUPS_DB_NAME && members.includes(roleId)) {
            groups[groupId] = { groupId, photo, name };
        }
    });
    return groups;
};
const numUnreadsFn = (lastReadIdxMap, messages, roleId) => {
    const idx = parseInt(lastReadIdxMap[roleId] || 0);
    return Math.max(0, messages.length - idx);
};

const newTaskListFn = async ({ docRef, groupInfo, idToDetails, me, groupId, payload }) => {
    await sendMessageToGroup({ me, ipLocation: null, idToDetails, docRef, groupInfo, groupId, updateLastReadIdx: null,
                               text: '', type: OUTPUT_TASK_LIST, taskList: payload });
    const navigation = getNavigationObject();
    functions.goBackFn({ navigation });
};
const newSpreadsheetFn = async ({ docRef, groupInfo, idToDetails, me, groupId, payload }) => {
    await sendMessageToGroup({ me, ipLocation: null, idToDetails, docRef, groupInfo, groupId, updateLastReadIdx: null,
                               text: '', type: OUTPUT_EXCEL, excel: payload });
    const navigation = getNavigationObject();
    functions.goBackFn({ navigation });
};

const screens = [
    ForceAppUpdate,
    ShareFilesPage,
    Splash, LoginPage,
    GroupList, GroupPageEntry, PersonalMessagingEntry,
    NewGroupPage,
    AnalyticsPage,
    LeaderboardPage,
    GroupDetailsPage,
    BotClientEntry,
    ViewPersonProfile,
    ViewMyProfile,
    PlayVideoPage,
    NewTaskListPage,
    NewSpreadsheetPage,
];
