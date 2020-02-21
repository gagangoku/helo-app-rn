import 'react-native-gesture-handler';
import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {PhoneNumberSelector, Text, View} from "../platform/Util";
import {FIREBASE_CHAT_MESSAGES_DB_NAME, FIREBASE_GROUPS_DB_NAME} from "../constants/Constants";
import {GroupListUI} from "../chat/groups/GroupListController";
import {GroupPage} from "../platform/GroupPage";
import GroupMessages from "../chat/groups/GroupMessages";
import {store} from './store';
import {connect, Provider} from 'react-redux';
import {getImageUrl, sumFn} from "../util/Util";
import cnsole from 'loglevel';
import SplashPage from "../chat/SplashPage";
import {NativeModules} from 'react-native';


const Stack = createStackNavigator();
export function App() {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={Splash.URL} headerMode="none">
                    {screens.map(x => <Stack.Screen name={x.URL} key={x.URL} component={connect(state => ({ globalState: state }))(x)} />)}
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );
}

// Splash page
// Group list screen
// Group messaging screen
// Personal messaging screen
// GroupDetails
// Person profile
// My profile
// Leaderboard
// Analytics


function Splash({ navigation, route, globalState }) {
    cnsole.log('Splash: ');
    return (
        <PhoneNumberSelector>
            <SplashPage onDoneFn={() => goToGroupListFn(navigation)} onDoneTimeoutMs={10000} />
        </PhoneNumberSelector>
    );
}
Splash.URL = '/splash';


function GroupList({ navigation, route, globalState }) {
    cnsole.log('GroupList: ', globalState, navigation, route);
    cnsole.info('GroupList version: ', globalState.version);
    const {idToDocMap, userDetails} = globalState;
    if (!idToDocMap || !userDetails) {
        return <Text>Loading ...</Text>;
    }

    console.info('idToDocMap: ', idToDocMap);
    const {role, id} = userDetails;
    const me = {...userDetails, sender: role + ':' + id};

    const docs = Object.values(idToDocMap).filter(x => x.groupInfo.messages.length > 0 || x.collection === FIREBASE_GROUPS_DB_NAME);
    docs.sort((d1, d2) => d2.timestamp - d1.timestamp);
    cnsole.info('Documents matching after sorting at: ', new Date().getTime(), docs.length);
    cnsole.debug('DEBUG: Documents matching after sorting: ', docs.map(x => ([ x.collection, x.groupId, x.title, x.avatar ])));

    const numUnreadChats = docs.map(x => x.numUnreads && x.numUnreads > 0 ? 1 : 0).reduce(sumFn, 0);
    return <GroupListUI me={me} docs={docs} numUnreadChats={numUnreadChats}
                        goToChatFn={(doc) => goToChatFn(doc, navigation)} />;
}
GroupList.URL = '/group-list';


function GroupPageEntry({ navigation, route, globalState }) {
    cnsole.log('GroupPageEntry: ', globalState, navigation, route);
    cnsole.info('GroupPageEntry version: ', globalState.version);
    const { groupId } = route.params;
    const { userDetails, ipLocation, idToDocMap, idToDetails } = globalState;
    if (!idToDocMap) {
        return <View />;
    }

    const { groupInfo, docRef } = idToDocMap[groupId];
    const groupInfoCopy = {...groupInfo, filteredMessages: groupInfo.messages};
    return <GroupPage groupInfo={groupInfoCopy} userDetails={userDetails} ipLocationResponse={ipLocation}
                      idToDetails={idToDetails} docRef={docRef}
                      goBackFn={() => goBackFn(navigation)} />;
}
GroupPageEntry.URL = '/message/group';


function PersonalMessagingEntry({ navigation, route, globalState }) {
    cnsole.info('PersonalMessagingEntry: ', globalState, navigation, route);
    cnsole.info('PersonalMessagingEntry version: ', globalState.version);
    const { groupId } = route.params;
    const { userDetails, ipLocation, idToDocMap, idToDetails } = globalState;
    if (!idToDocMap) {
        return <View />;
    }

    const { role, id } = userDetails;
    const me = {...userDetails, sender: role + ':' + id};

    const other = groupId.split(',').filter(x => x !== me.sender)[0];
    const otherPerson = idToDetails[other].person;
    cnsole.info('otherPerson: ', otherPerson);

    const { groupInfo, docRef } = idToDocMap[groupId];
    const groupInfoCopy = {...groupInfo, filteredMessages: groupInfo.messages, photo: getImageUrl(otherPerson.image), name: otherPerson.name};
    return (<GroupMessages goBackFn={() => goBackFn(navigation)}
                           me={me} otherPerson={otherPerson} collection={FIREBASE_CHAT_MESSAGES_DB_NAME} groupId={groupId} ipLocation={ipLocation}
                           groupInfo={groupInfoCopy} docRef={docRef} idToDetails={idToDetails} />);
}
PersonalMessagingEntry.URL = '/message/personal';


const goToGroupListFn = (navigation) => {
    navigation.replace(GroupList.URL, {});

};
const goToChatFn = (doc, navigation) => {
    const { collection, groupId } = doc;
    const url = collection === FIREBASE_CHAT_MESSAGES_DB_NAME ? PersonalMessagingEntry.URL : GroupPageEntry.URL;
    navigation.navigate(url, {groupId});
};
const goBackFn = (navigation) => navigation.goBack();


const screens = [
    Splash,
    GroupList, GroupPageEntry, PersonalMessagingEntry,
];
