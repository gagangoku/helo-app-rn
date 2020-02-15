import React from 'react';
import {FIREBASE_GROUPS_DB_NAME, PHONE_NUMBER_KEY} from '../../moduleSrc/constants/Constants';
import {getAllInfoRelatedToGroup, getDetailsFromPhone, getPersonDetails} from '../../moduleSrc/util/Util';
import {getLocationFromIPAddress} from '../../moduleSrc/util/Api';
import {GroupPage} from '../../moduleSrc/platform/GroupPage';
import {AsyncStorage, View} from '../../moduleSrc/platform/Util';


export default class GroupPageDemo extends React.Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        title: null,
        headerShown: false,
    });
    static URL = '/demos/group';
    constructor(props) {
        super(props);
        this.state = {};
        this.idToDetails = {};
    }

    async componentDidMount() {
        console.log('GroupPageDemo componentDidMount: ', this.props);

        AsyncStorage.setItem(PHONE_NUMBER_KEY, '9008781096');

        const collection = FIREBASE_GROUPS_DB_NAME;
        const groupId = 'Helo-Trial';
        const isDebug = false;
        const dontProcessMessages = true;
        const createDocIfDoesntExist = false;
        const ipLocationPromise = getLocationFromIPAddress();

        const cbFn = async ({ groupInfo }) => {
            await getPersonDetails(this.idToDetails, groupInfo.members.slice(0, 100), groupInfo.filteredMessages);
            this.setState({ idToDetails: this.idToDetails, groupInfo });
        };
        const { docRef, groupInfo, observer } = await getAllInfoRelatedToGroup({ collection, groupId, cbFn, isDebug, ipLocationPromise, dontProcessMessages, createDocIfDoesntExist });
        const userDetails = await getDetailsFromPhone();
        const ipLocation = await ipLocationPromise;

        this.docRef = docRef;
        this.observer = observer;
        this.setState({ groupInfo, userDetails, ipLocation, docRef });
    }

    render() {
        const { groupInfo, userDetails, idToDetails, ipLocation, docRef } = this.state;
        if (!groupInfo) {
            return <View />;
        }
        return <GroupPage groupInfo={groupInfo} userDetails={userDetails} ipLocationResponse={ipLocation}
                          idToDetails={idToDetails} docRef={docRef} />;
    }
}
