import React from 'react';
import {
    getCircularImage,
    getCtx,
    getGroupInfo,
    getImageUrl,
    isSuperAdmin,
    isUserPartOfGroup,
    messageSummary,
    noOpFn,
    showToast,
    sumFn,
    View
} from "../../util/Util";
import {firebase} from '../../platform/firebase';
import {
    CHAT_FONT_FAMILY,
    CHAT_MESSAGES_DOC_NAME_PREFIX,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME,
    GROUPS_DOC_NAME_PREFIX
} from "../../constants/Constants";
import TouchableAnim from "../../platform/TouchableAnim";
import {getPersonNamesByRoleId} from "../../util/Api";
import lodash from 'lodash';
import {ConfigurableTopBar} from "../messaging/TopBar";
import {HEIGHT_BUFFER, Text, WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH} from "../../platform/Util";
import cnsole from 'loglevel';
import ScrollableList from "../../platform/ScrollableList";
import * as functions from '../../platform/Navigators';
import {getNavigationObject} from "../../router/NavigationRef";


/**
 * Chat list UI
 */
export default class GroupListController extends React.PureComponent {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);

        this.state = {
            groupDocs: null,
            chatDocs1: null,
            chatDocs2: null,
            numUpdates: 0,
        };
        cnsole.log('GroupListController props: ', props);
    }

    async componentDidMount() {
        const roleId = this.props.me.role + ':' + this.props.me.id;
        const csrole = this.props.me.role === 'supply' ? 'supplyId' : 'customerId';

        this.db = firebase.firestore();
        // TODO: Fix. Commented for now to allow everyone to see the groups
        const queryRef = this.db.collection(FIREBASE_GROUPS_DB_NAME);    //.where('members', 'array-contains', roleId);
        const queryRef2 = this.db.collection(FIREBASE_CHAT_MESSAGES_DB_NAME).where(csrole, '==', parseInt(this.props.me.id));
        const queryRef3 = this.db.collection(FIREBASE_CHAT_MESSAGES_DB_NAME).where('members', 'array-contains', roleId);

        const nowMs = new Date().getTime();
        this.observer1 = queryRef.onSnapshot((snapshot) => this.funcGroups(roleId, snapshot, nowMs, 'groupDocs'));
        this.observer2 = queryRef2.onSnapshot((snapshot) => this.funcChatMessages(roleId, snapshot, nowMs, 'chatDocs1'));
        this.observer3 = queryRef3.onSnapshot((snapshot) => this.funcChatMessages(roleId, snapshot, nowMs, 'chatDocs2'));
    }

    funcGroups = async (roleId, snapshot, nowMs, docsKey) => {
        cnsole.log('roleId, snapshot, nowMs, docsKey: ', roleId, snapshot, nowMs, docsKey);
        if (this.state.numUpdates <= 1) {
            cnsole.log('Time taken in firebase snapshot: ', new Date().getTime() - nowMs);
        }

        const docs = [];
        snapshot.forEach(d => {
            const groupId = d.id;
            cnsole.log('Processing group doc: ', d, groupId);
            if (groupId.startsWith(GROUPS_DOC_NAME_PREFIX)) {
                const data = d.data();

                const { createdAt, members, messages, isPrivate, name, photo } = getGroupInfo(data, d);
                if (isPrivate && !isUserPartOfGroup(roleId, members)) {
                    return;
                }

                const numUnreads = this.numUnreads(data, roleId);
                const timestamp = messages.length > 0 ? messages[messages.length -1].timestamp : createdAt;
                const subHeading = messages.length > 0 ? this.summary(messages[messages.length -1]) : '';
                docs.push({ collection: FIREBASE_GROUPS_DB_NAME, groupId, title: name, avatar: getImageUrl(photo),
                            numUnreads, timestamp, subHeading, messages, members });
            }
        });
        cnsole.log('Group Documents matching :', docsKey, ' - ', docs);

        this.setState({ [docsKey]: docs, numUpdates: this.state.numUpdates + 1 });
    };

    funcChatMessages = async (roleId, snapshot, nowMs, docsKey) => {
        cnsole.log('roleId, snapshot, nowMs, docsKey: ', roleId, snapshot, nowMs, docsKey);
        if (this.state.numUpdates <= 1) {
            cnsole.log('Time taken in firebase snapshot: ', new Date().getTime() - nowMs);
        }

        const docs = [];
        snapshot.forEach(d => {
            const groupId = d.id;
            cnsole.log('Processing chat doc: ', d, groupId);
            if (groupId.startsWith(CHAT_MESSAGES_DOC_NAME_PREFIX)) {
                const data = d.data();

                const title = '';       // Will be filled later
                const avatar = '';      // Will be filled later
                const numUnreads = this.numUnreads(data, roleId);
                const messages = data.messages || [];
                const members = data.members || groupId.split(',');
                const timestamp = messages.length > 0 ? messages[messages.length -1].timestamp : -1;
                const subHeading = messages.length > 0 ? this.summary(messages[messages.length -1]) : '';
                docs.push({ collection: FIREBASE_CHAT_MESSAGES_DB_NAME, groupId, title, avatar, numUnreads, timestamp, subHeading, messages, members });
            }
        });
        cnsole.log('Chat Documents matching: ', docs);

        const needLookup = lodash.uniq(docs.flatMap(x => x.members)).filter(x => x !== roleId);
        const roleIdToName = await getPersonNamesByRoleId(needLookup);
        docs.forEach(d => {
            const otherGuy = d.members[0] === roleId ? d.members[1] : d.members[0];
            if (!roleIdToName[otherGuy]) {
                cnsole.log('roleIdToName[otherGuy] bad: ', otherGuy, roleIdToName);
                return;
            }
            d.title = roleIdToName[otherGuy].person.name;
            d.avatar = getImageUrl(roleIdToName[otherGuy].person.thumbImage || roleIdToName[otherGuy].person.image);
        });

        this.setState({ [docsKey]: docs, numUpdates: this.state.numUpdates + 1 });
    };

    componentWillUnmount() {
        this.observer1 && this.observer1();        // Unsubscribe
        this.observer2 && this.observer2();        // Unsubscribe
        this.observer3 && this.observer3();        // Unsubscribe
    }

    summary = (message) => messageSummary(message);

    numUnreads = (doc, roleId) => {
        const lastReadIdxMap = doc.lastReadIdx || {};
        const lastReadIdx = parseInt(lastReadIdxMap[roleId] || 0);
        const messages = (doc.messages || []);
        return messages.length - lastReadIdx;
    };

    render() {
        if (!this.state.groupDocs || !this.state.chatDocs1 || !this.state.chatDocs2) {
            return <View />;
        }

        const { groupDocs, chatDocs1, chatDocs2 } = this.state;
        const docs = groupDocs.concat(chatDocs1).concat(chatDocs2).filter(x => x.messages.length > 0 || x.collection === FIREBASE_GROUPS_DB_NAME);
        docs.sort((d1, d2) => d2.timestamp - d1.timestamp);
        cnsole.log('Documents matching after sorting: ', docs);

        const numUnreadChats = docs.map(x => x.numUnreads && x.numUnreads > 0 ? 1 : 0).reduce(sumFn, 0);
        return (<GroupListUI location={this.props.location} history={this.props.history}
                             me={this.props.me} docs={docs} numUnreadChats={numUnreadChats}
                             goToChatFn={this.props.goToChatFn}
        />);
    }
}

export class GroupListUI extends React.PureComponent {
    viewMyProfileFn = () => {
        const navigation = getNavigationObject();
        functions.viewMyProfileFn({ navigation });
    };
    itemRenderFn = (item) => {
        const { me } = this.props;
        return <ListItem key={item.groupId} item={item} me={me} />;
    };

    render() {
        const { me, lineItems } = this.props;
        cnsole.info('GroupListUI render');

        const list = lineItems.map(x => <ListItem key={x.groupId} item={x} me={me} />);
        const numUnreadChats = lineItems.map(x => Math.min(x.numUnreads, 1)).reduce(sumFn, 0);

        const options = !isSuperAdmin(me.sender) ? [] : [
            { title: 'New group', type: ConfigurableTopBar.SECTION_DOTDOTDOT_NEW_GROUP },
            { title: 'New supergroup', type: ConfigurableTopBar.SECTION_DOTDOTDOT_NEW_SUPERGROUP, onClickFn: () => showToast('Coming soon') },
        ];
        options.push({ title: 'Settings', type: ConfigurableTopBar.SECTION_DOTDOTDOT_SETTINGS, onClickFn: this.viewMyProfileFn });
        const sections = [
            { float: 'left', name: ConfigurableTopBar.SECTION_NAME, displayProps: { name: { fontSize: 22 } }, data: { name: 'Messages' }, onClickFn: noOpFn },
            { float: 'right', name: ConfigurableTopBar.SECTION_UNREADS, displayProps: {}, data: { unreads: numUnreadChats } },
            { float: 'right', name: ConfigurableTopBar.SECTION_DOTDOTDOT, displayProps: {}, data: { options } },
        ];

        const height = WINDOW_INNER_HEIGHT - ConfigurableTopBar.HEIGHT - HEIGHT_BUFFER;
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
                <View style={custom.paper}>
                    <ConfigurableTopBar collection={null} sections={sections}
                                        location={this.props.location} history={this.props.history} />

                    <View style={custom.chatRoot} id="chatRoot">
                        <ScrollableList data={lineItems} itemRenderFn={this.itemRenderFn} style={{ height }} flatListProps={{ removeClippedSubviews: false, maxToRenderPerBatch: 20 }} />
                    </View>
                </View>
            </View>
        );
    }
}

class ListItem extends React.PureComponent {
    dateDisplay = (timestamp) => {
        const d = timestamp ? new Date(parseInt(timestamp)) : new Date();
        const hr = d.getHours();
        const mins = d.getMinutes();
        const amPm = hr < 12 ? 'am' : 'pm';

        return (hr <= 12 ? hr : hr - 12) + ':' + (mins <= 9 ? '0' + mins : mins) + ' ' + amPm;
    };
    unreadsDisplay = (num) => {
        return (
            <View style={custom.unreadCtr}>
                <Text style={custom.unreadText}>{num}</Text>
            </View>
        );
    };
    goToChatFn = () => {
        const { item } = this.props;
        const { collection, groupId } = item;
        const navigation = getNavigationObject();
        functions.goToChatFn({ data: { doc: { collection, groupId } }, navigation });
    };

    render() {
        const { item } = this.props;
        const { groupId, name, subHeading, image, numUnreads, timestamp } = item;

        const imgH = 50;
        const divHeight = 1.7 * imgH;
        return (
            <TouchableAnim key={groupId} id={groupId} onPress={this.goToChatFn} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: '15%', height: divHeight, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {getCircularImage({ src: getImageUrl(image), dim: imgH })}
                </View>
                <View style={{ width: '85%', height: divHeight, display: 'flex', flexDirection: 'row', alignItems: 'center',
                               borderBottom: '1px solid', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: LIGHTER_COLOR }}>
                    <View style={{ width: '80%', paddingLeft: 10 }}>
                        <Text style={custom.title}>{name}</Text>
                        <Text style={custom.subheading}>{subHeading}</Text>
                    </View>
                    <View style={{ width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: 5 }}>
                        <Text style={{ fontSize: 12, color: LIGHT_COLOR, marginBottom: 5 }}>{this.dateDisplay(timestamp)}</Text>
                        {numUnreads > 0 ? this.unreadsDisplay(numUnreads) : <View />}
                    </View>
                </View>
            </TouchableAnim>
        );
    }
}

const HEADING_COLOR = '#393939';
const LIGHT_COLOR = '#a1a1a1';
const LIGHTER_COLOR = '#cfcfcf';
const SCR_WIDTH = Math.min(WINDOW_INNER_WIDTH, 450);
const custom = {
    paper: {
        fontFamily: CHAT_FONT_FAMILY,
        width: SCR_WIDTH,
    },
    chatRoot: {
        width: '100%',
        textAlign: 'left',
        paddingLeft: 4,
        paddingRight: 4,
    },

    unreadCtr: {
        backgroundColor: '#0085ff',
        height: 20,
        width: 20,
        borderRadius: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadText: {
        fontFamily: CHAT_FONT_FAMILY,
        fontSize: 10,
        fontWeight: 400,
        color: '#ffffff',
    },

    title: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        color: HEADING_COLOR,
    },
    subheading: {
        fontSize: 14,
        color: '#8d8d8d',
        letterSpacing: 0.5,
        marginTop: 5,
    },
};


const numUnreadsFn = (lastReadIdxMap, messages, roleId) => {
    const idx = parseInt(lastReadIdxMap[roleId] || 0);
    return messages.length - idx;
};

// Useful in emergencies to create a sample
const copyDoc = async () => {
    const db = firebase.firestore();
    const baseDoc = await db.collection(FIREBASE_CHAT_MESSAGES_DB_NAME).doc('cust:0,supply:0').get();
    cnsole.log('Got baseDoc: ', baseDoc);

    const messages = baseDoc.data().messages;
    messages.forEach(m => {
        m.sender = m.sender.startsWith('cust') ? 'cust:2796' : 'supply:352';
    });
    await db.collection(FIREBASE_CHAT_MESSAGES_DB_NAME).doc('cust:2796,supply:352').set({
        customerId: 2796,
        supplyId: 352,
        messages,
    });
};
