import React from "react";
import {
    getAllInfoRelatedToGroup,
    getCtx,
    getDetailsFromPhone,
    getImageUrl,
    getPersonDetails,
    getUrlParam,
    isDebugMode,
    navigateTo,
    setupDeviceId,
    View
} from "../util/Util";
import {getUrlSearchParams} from '../platform/Util';
import {crudsRead, getLocationFromIPAddress, getPersonNamesByRoleId} from "../util/Api";
import {
    API_URL,
    CATEGORY_COOK,
    DESCRIPTOR_CUSTOMER,
    DESCRIPTOR_SUPPLY,
    DESCRIPTOR_VISITOR,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME
} from "../constants/Constants";
import format from "string-format";
import GroupListController from "../chat/groups/GroupListController";
import window from "global";
import GroupMessages from "../chat/groups/GroupMessages";
import {GroupCreatePage} from "../chat/groups/GroupCreatePage";
import {GroupJoinPage} from "../chat/groups/GroupJoinPage";
import GroupDetailsPage from "../chat/groups/GroupDetailsPage";
import ViewPersonProfile from "../chat/profile/ViewPersonProfile";
import MyProfile from "../chat/profile/MyProfile";
import {Route} from "react-router-dom";
import QRScanner from "../chat/qrcode/QRScanner";
import IDVerifier from "../chat/verifier/IDVerifier";
import GreyList from "../chat/verifier/GreyList";
import LeaderBoard from "../chat/analytics/LeaderBoard";
import GroupAnalytics from "../chat/analytics/GroupAnalytics";
import {GROUP_URLS} from "./Urls";
import {QUESTION_WORK_CATEGORIES} from "../chat/Questions";
import ChatBotClient from "../chat/bot/ChatBotClient";


export class StepGroupList extends React.Component {
    static URL = GROUP_URLS.groupList;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            id: null,
            name: null,
            role: null,
            errorMsg: '',
        };
        this.idToDetails = {};
    }

    async componentDidMount() {
        const deviceID = await setupDeviceId();
        const ipLocation = await getLocationFromIPAddress(deviceID);
        this.setState({ ipLocation });

        try {
            const me = getUrlParam('me') || '';
            console.log('StepGroupList me: ', me);
            if (me) {
                const [role, id] = me.split(':');
                switch (role) {
                    case 'supply':
                        const supply = await crudsRead(DESCRIPTOR_SUPPLY, id);
                        this.setState({ id, name: supply.person.name, role });
                        return;
                    case 'cust':
                        const cust = await crudsRead(DESCRIPTOR_CUSTOMER, id);
                        this.setState({ id, name: cust.person.name, role });
                        return;
                    case 'visitor':
                        const visitor = await crudsRead(DESCRIPTOR_VISITOR, id);
                        this.setState({ id, name: visitor.name, role });
                        return;
                    default:
                        console.log('Unknown role: ', me, role);
                }
            }
        } catch (e) {
            console.log('Error in parsing me param: ', e);
        }

        const { phone, id, name, role } = await getDetailsFromPhone();
        if (!phone || (!id && !name && !role)) {
            this.setState({ errorMsg: 'Login is required' });
        } else {
            this.setState({ id, name, role });
        }
    }

    goToChatFn = async ({ collection, groupId, avatar }) => {
        console.log('goToChatFn: ', groupId);
        const { id, name, role, ipLocation } = this.state;

        if (collection === FIREBASE_GROUPS_DB_NAME) {
            const groupUrl = format('{}?collection={}&group={}', GROUP_URLS.groupJoin, collection, groupId);
            navigateTo(this, groupUrl, this.contextObj, {});
            return;
        }

        // 1 on 1 chat
        const me = {
            id, name, role,
            sender: role + ':' + id,
        };

        const otherRoleId = groupId.split(',').filter(x => x !== me.sender)[0];
        console.log('me, otherRoleId; ', me, otherRoleId);
        await getPersonDetails(this.idToDetails, [otherRoleId], []);
        const other = {
            id: otherRoleId.split(':')[1],
            name: this.idToDetails[otherRoleId].person.name,
            role: otherRoleId.split(':')[0],
            sender: otherRoleId,
            avatar,
        };

        const messagingUrl = format('{}?collection={}&me={}&other={}&ipLocation={}',
            StepPersonalMessaging.URL, collection,
            encodeURIComponent(JSON.stringify(me)),
            encodeURIComponent(JSON.stringify(other)),
            encodeURIComponent(JSON.stringify(ipLocation)));
        navigateTo(this, messagingUrl, this.contextObj, {});
    };

    render() {
        if (!this.state.role) {
            return <div>{this.state.errorMsg}</div>;
        }

        const me = {
            role: this.state.role,
            id: this.state.id,
            sender: this.state.role + ':' + this.state.id,
            avatar: '',
            name: this.state.name,
        };
        return (<GroupListController location={this.props.location} history={this.props.history}
                                     me={me} goToChatFn={this.goToChatFn} />);
    }
}

export class StepPersonalMessaging extends React.Component {
    static URL = GROUP_URLS.personalMessaging;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {};
        console.log('StepPersonalMessaging props: ', props);
    }

    async componentDidMount() {
        console.log('StepPersonalMessaging componentDidMount: ');
        const collection = FIREBASE_CHAT_MESSAGES_DB_NAME;
        const meParam = getUrlParam('me');
        const otherParam = getUrlParam('other');
        const ipLocationParam = getUrlParam('ipLocation');

        let me, other, ipLocation;
        if (!meParam) {
            const { id, name, role, image } = await getDetailsFromPhone();
            me = {
                role,
                id,
                sender: role + ':' + id,
                name,
                avatar: image,
            };
        } else {
            me = JSON.parse(meParam);
        }
        if (!otherParam) {
            const otherPersonParam = getUrlParam('otherPerson');
            const [role, id] = otherPersonParam.split(':');
            const map = await getPersonNamesByRoleId([otherPersonParam]);
            const { name, image } = map[otherPersonParam].person;
            other = { role, id, name, sender: otherPersonParam, avatar: image };
        } else {
            other = JSON.parse(otherParam);
        }

        if (me.sender === other.sender) {
            // Trying to chat with yourself eh
            window.location.href = StepViewMyProfile.URL;
            return;
        }
        if (!ipLocationParam) {
            ipLocation = await getLocationFromIPAddress();
        } else {
            ipLocation = JSON.parse(ipLocationParam);
        }

        const groupId = [me.sender, other.sender].sort().join(',');
        this.detailsObj = { collection, me, other, ipLocation, groupId };
        console.log('detailsObj: ', this.detailsObj);

        const isDebug = isDebugMode();
        const cbFn = ({ groupInfo }) => {
            this.setState({ groupInfo });
        };

        const obj = await getAllInfoRelatedToGroup({ collection, groupId, cbFn, isDebug, ipLocationPromise: Promise.resolve(ipLocation), createDocIfDoesntExist: true });
        console.log('Got getAllInfoRelatedToGroup: ', obj);
        this.setState(obj);

        const idToDetails = {};
        await getPersonDetails(idToDetails, obj.groupInfo.members, []);
        this.setState({ idToDetails });
    }
    componentWillUnmount() {
        this.state.observer && this.state.observer();           // Unsubscribe
    }

    goBackFn = () => window.open(StepGroupList.URL);

    render() {
        const { groupInfo, docRef, idToDetails } = this.state;
        if (!docRef) {
            return <View />;
        }

        const { collection, me, other, ipLocation, groupId } = this.detailsObj;
        const groupInfoCopy = {...groupInfo, photo: getImageUrl(other.avatar), name: other.name};
        return (<GroupMessages location={this.props.location} history={this.props.history}
                               goBackFn={this.goBackFn}
                               me={me} otherPerson={other} collection={collection} groupId={groupId} ipLocation={ipLocation}
                               groupInfo={groupInfoCopy} docRef={docRef} idToDetails={idToDetails} />);
    }
}

export class StepCreateGroup extends React.Component {
    static URL = GROUP_URLS.createGroup;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        return (<GroupCreatePage location={this.props.location} history={this.props.history} />);
    }
}

export class StepGroupJoin extends React.Component {
    static URLS = [GROUP_URLS.groupJoin, GROUP_URLS.groupJoin2];
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        const collection = getUrlParam('collection');
        const groupId = getUrlParam('group');
        return (<GroupJoinPage location={this.props.location} history={this.props.history}
                               collection={collection} groupId={groupId} />);
    }
}

export class StepGroupDetailsPage extends React.Component {
    static URL = GROUP_URLS.groupDetails;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        const groupId = getUrlParam('group');
        return (<GroupDetailsPage location={this.props.location} history={this.props.history}
                                  collection={FIREBASE_GROUPS_DB_NAME} groupId={groupId} />);
    }
}

export class StepViewPerson extends React.Component {
    static URL = GROUP_URLS.viewPerson;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<ViewPersonProfile location={this.props.location} history={this.props.history} />);
    }
}

export class StepViewMyProfile extends React.Component {
    static URL = GROUP_URLS.viewMyProfile;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<MyProfile location={this.props.location} history={this.props.history} />);
    }
}

export class StepQRCodeScanner extends React.Component {
    static URL = GROUP_URLS.qrScanner;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<QRScanner location={this.props.location} history={this.props.history} />);
    }
}

export class StepIDVerifier extends React.Component {
    static URLS = [GROUP_URLS.idVerifier, GROUP_URLS.idVerifier2];
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<IDVerifier location={this.props.location} history={this.props.history} />);
    }
}

export class StepGreyList extends React.Component {
    static URLS = [GROUP_URLS.grayList, GROUP_URLS.grayList2];
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<GreyList location={this.props.location} history={this.props.history} />);
    }
}

export class StepLeaderBoard extends React.Component {
    static URLS = [GROUP_URLS.leaderboard, GROUP_URLS.leaderboard2];
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<LeaderBoard location={this.props.location} history={this.props.history} />);
    }
}

export class StepGroupAnalytics extends React.Component {
    static URL = GROUP_URLS.groupAnalytics;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<GroupAnalytics location={this.props.location} history={this.props.history} />);
    }
}

export class StepCookChatBot extends React.Component {
    static URLS = [GROUP_URLS.chatBot, GROUP_URLS.chatBot2];
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        console.log('rendering SupplyOnboardingChatBot');
        const params = {};
        getUrlSearchParams(document.location || API_URL).forEach((v, k) => params[k] = v);
        params[QUESTION_WORK_CATEGORIES] = CATEGORY_COOK;     // For cooks
        return (<ChatBotClient location={this.props.location} history={this.props.history} params={params} />);
    }
}

const steps = [
    StepGroupList,
    StepPersonalMessaging,
    StepCreateGroup,
    StepGroupJoin,
    StepGroupDetailsPage,

    StepViewPerson,
    StepViewMyProfile,
    StepIDVerifier,
    StepGreyList,
    StepQRCodeScanner,
    StepLeaderBoard,
    StepGroupAnalytics,
    StepCookChatBot,
];
export const routes = steps.flatMap(x => {
    const urls = x.URLS ? x.URLS : [x.URL];
    return urls.map(y => <Route exact path={y} component={x} key={y} />);
});
