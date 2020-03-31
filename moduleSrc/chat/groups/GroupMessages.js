import React from 'react';
import {createPersonalMessageDoc, getLastMessageIdx, sendMessageToGroup, showToast, View} from "../../util/Util";
import MessagingUI from "../messaging/MessagingUI";
import {MODE_GROUP_CHAT, MODE_PERSONAL_MESSAGE} from "../Constants";
import {phoneConnectApi} from "../../util/Api";
import {
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME,
    RESTAURANT_JOBS_INDIA_GROUP_ADDITION
} from "../../constants/Constants";
import cnsole from 'loglevel';
import {Text} from "../../platform/Util";


/**
 * Messaging controller
 */
export default class GroupMessages extends React.Component {
    componentDidMount() {
        this.triggerReadIdx();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.triggerReadIdx();
    }

    triggerReadIdx = () => {
        const { groupInfo, me, docRef } = this.props;
        const { lastReadIdx, messages } = groupInfo;

        const oldIdx = lastReadIdx[me.sender] || 0;
        const newIdx = getLastMessageIdx(messages);
        if (newIdx > oldIdx) {
            const payload = { [`lastReadIdx.${me.sender}`]: newIdx };
            cnsole.info('triggerReadIdx: ', payload);
            docRef && docRef.update(payload);
        }
    };

    sendMessage = async ({ docRef, groupInfo, groupId, updateLastReadIdx, text, type, answer, ...extra }) => {
        const { me, ipLocation, idToDetails } = this.props;
        await sendMessageToGroup({ me, ipLocation, idToDetails, docRef, groupInfo, groupId, updateLastReadIdx, text, type, answer, ...extra });
    };

    onUserMsg = async ({ text, type, answer, ...extra }) => {
        const { docRef, groupInfo, groupId } = this.props;
        await this.sendMessage({ docRef, groupInfo, groupId, text, type, answer, ...extra });
    };

    forwardToFn = async ({ roleId, groupId, messages }) => {
        cnsole.info('forwardToFn: ', { roleId, groupId, messages });
        const { me, idToDocMap } = this.props;
        if (!idToDocMap) {
            showToast('BAD: idToDocMap doesnt exist');
            return;
        }

        const g = groupId || [me.sender, roleId].sort().join(',');
        if (!idToDocMap[g]) {
            cnsole.warn('BAD: idToDocMap doesnot have: ', g, idToDocMap);
            return;
        }

        for (let i = 0; i < messages.length; i++) {
            const m = {...messages[i]};
            delete m.sender;

            const { docRef, groupInfo } = idToDocMap[g];
            await this.sendMessage({ updateLastReadIdx: false, docRef, groupInfo, groupId: g, ...m });
        }

        showToast('Forwarded !');
    };

    callFn1 = async () => {
        const { me, otherPerson } = this.props;
        cnsole.log('Call btn clicked: ', me, otherPerson);

        const customerId = me.role === 'cust' ? me.id : otherPerson.id;
        const supplyId = me.role === 'supply' ? me.id : otherPerson.id;

        let success = false;
        try {
            const callSid = await phoneConnectApi(customerId, supplyId, me.role);
            cnsole.log('callSid: ', callSid);
            success = true;
        } catch (e) {
            cnsole.log('Exception in phone connect api: ', e);
        }

        if (success) {
            window.alert('Arranging a call');
        } else {
            window.alert('Call failed');
        }
    };
    callFn = async () => {
        showToast('Coming soon !');
    };

    render() {
        cnsole.info('GroupMessages render');
        const { collection, groupId, groupInfo, docRef, idToDetails } = this.props;
        const { photo, name } = groupInfo;
        if (!docRef || !groupInfo) {
            return <View><Text>Waiting for docRef</Text></View>;
        }
        const { filteredMessages, members } = groupInfo;
        cnsole.log('Rendering GroupMessages with messages: ', filteredMessages);

        const otherGuy = {
            avatar: photo,
            name,
        };
        if (collection === FIREBASE_GROUPS_DB_NAME) {
            const add = groupId === 'restaurant-jobs-india' ? RESTAURANT_JOBS_INDIA_GROUP_ADDITION : 0;
            otherGuy.subheading = (members.length + add) + ' members';
        }

        const mode = collection === FIREBASE_GROUPS_DB_NAME ? MODE_GROUP_CHAT : MODE_PERSONAL_MESSAGE;
        const callFn = collection === FIREBASE_GROUPS_DB_NAME ? null : this.callFn;
        return (
            <MessagingUI location={this.props.location} history={this.props.history} goBackFn={this.props.goBackFn}
                         me={this.props.me} otherGuy={otherGuy} mode={mode}
                         bellFn={this.props.bellFn} leaderboardFn={this.props.leaderboardFn}
                         groupInfo={groupInfo} forwardToFn={this.forwardToFn}
                         ipLocation={this.props.ipLocation}
                         collection={collection} groupId={groupId}
                         messages={filteredMessages} onUserMsg={this.onUserMsg} msgToScrollTo={this.props.msgToScrollTo}
                         callFn={callFn} idToDetails={idToDetails}
            />
        );
    }
}

export class GroupMessagesWithCreateLogic extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            docRefNew: null,
        };
    }
    static getDerivedStateFromProps(props, state) {
        cnsole.info('GroupMessagesWithCreateLogic getDerivedStateFromProps');
        return { docRefNew: null };
    }

    async componentDidMount() {
        cnsole.info('GroupMessagesWithCreateLogic componentDidMount: ', this.props.groupId);
        this.foo();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        cnsole.info('GroupMessagesWithCreateLogic componentDidUpdate: ', this.props.groupId);
        this.foo();
    }
    foo = async () => {
        const { collection, groupId, docRef } = this.props;
        if (!docRef && collection === FIREBASE_CHAT_MESSAGES_DB_NAME) {
            const o = await createPersonalMessageDoc({ collection, groupId });
            this.setState({ docRefNew: o.docRef });
        }
    };

    render() {
        const { collection, groupId, docRef } = this.props;
        cnsole.info('GroupMessagesWithCreateLogic render: ', groupId);
        const { docRefNew } = this.state;
        const o = docRef || docRefNew;
        if (!o) {
            return <View><Text>Setting up ...</Text></View>;
        }

        return <GroupMessages {...this.props} docRef={o} />;
    }
}
