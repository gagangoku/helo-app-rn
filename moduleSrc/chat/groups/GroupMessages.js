import React from 'react';
import {getCtx, getImageUrl, View} from "../../util/Util";
import MessagingUI from "../messaging/MessagingUI";
import {HELO_LOGO, MODE_GROUP_CHAT, MODE_PERSONAL_MESSAGE} from "../Constants";
import {phoneConnectApi, sendNotificationToMembers} from "../../util/Api";
import {FIREBASE_GROUPS_DB_NAME, RESTAURANT_JOBS_INDIA_GROUP_ADDITION} from "../../constants/Constants";
import {
    OUTPUT_AUDIO,
    OUTPUT_IMAGE,
    OUTPUT_JOB_ACTIONABLE,
    OUTPUT_LOCATION,
    OUTPUT_NONE,
    OUTPUT_PROGRESSIVE_MODULE,
    OUTPUT_TEXT,
    OUTPUT_VIDEO
} from "../Questions";
import format from "string-format";
import {firebase} from '../../platform/firebase';


/**
 * Messaging controller
 */
export default class GroupMessages extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
        };
        console.log('GroupMessages props: ', this.props);
    }

    async componentDidMount() {
    }
    componentWillUnmount() {
        this.observer && this.observer();        // Unsubscribe
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.triggerReadIdx();
    }

    getLastMessageIdx = (messages) => {
        if (messages && messages.length >= 1) {
            return messages.length;
        }
        return 0;
    };

    triggerReadIdx = () => {
        const lastReadIdx = this.getLastMessageIdx(this.props.groupInfo.messages);
        const payload = { [`lastReadIdx.${this.props.me.sender}`]: lastReadIdx };
        console.log('triggerReadIdx: ', payload);
        // this.props.docRef.update(payload);
    };

    onUserMsg = async ({ text, type, answer, ...extra }) => {
        const { me, ipLocation, groupId, groupInfo } = this.props;

        const sender = me.sender;
        console.log('text, type, sender, extra: ', text, type, sender, extra);

        const newMsgPayload = {
            timestamp: new Date().getTime(),
            text,
            type,
            sender,
            ...extra,
        };
        if (ipLocation) {
            const { latitude, longitude } = ipLocation;
            newMsgPayload.loc = { latitude, longitude };
        }

        const lastReadIdx = this.getLastMessageIdx(groupInfo.messages);
        console.log('newMsgPayload: ', newMsgPayload);
        this.props.docRef.update({
            messages: firebase.firestore.FieldValue.arrayUnion(newMsgPayload),
            [`lastReadIdx.${sender}`]: lastReadIdx + 1,
        });

        // Notify the other group members
        const message = this.getMessageFromType({type, text, ...extra});

        // TODO: Fix the clickUrl, it could have come from a personal chat message
        const clickUrl = format('/group?group={}&source=notif', groupId);
        await sendNotificationToMembers(groupInfo.members, me, message, getImageUrl(sender.avatar || HELO_LOGO), clickUrl);
    };

    getMessageFromType = ({type, text, imageUrl}) => {
        switch (type) {
            case OUTPUT_PROGRESSIVE_MODULE:
                return 'Training module: ' + text;
            case OUTPUT_TEXT:
            case OUTPUT_NONE:
                return text;
            case OUTPUT_IMAGE:
                return text || 'Photo';
            case OUTPUT_AUDIO:
                return text || 'Audio';
            case OUTPUT_VIDEO:
                return text || 'Video';
            case OUTPUT_LOCATION:
                return text || 'Location';
            case OUTPUT_JOB_ACTIONABLE:
                return text || 'Job';
            default:
                break;
        }
    };

    callFn = async () => {
        const { me, otherPerson } = this.props;
        console.log('Call btn clicked: ', me, otherPerson);

        const customerId = me.role === 'cust' ? me.id : otherPerson.id;
        const supplyId = me.role === 'supply' ? me.id : otherPerson.id;

        let success = false;
        try {
            const callSid = await phoneConnectApi(customerId, supplyId, me.role);
            console.log('callSid: ', callSid);
            success = true;
        } catch (e) {
            console.log('Exception in phone connect api: ', e);
        }

        if (success) {
            window.alert('Arranging a call');
        } else {
            window.alert('Call failed');
        }
    };

    render() {
        const { collection, groupId, groupInfo, idToDetails } = this.props;
        const { photo, name } = groupInfo;
        if (!groupInfo) {
            return <View />;
        }
        const { filteredMessages, members } = groupInfo;
        console.log('Rendering GroupMessages with messages: ', filteredMessages);

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
                         groupInfo={groupInfo}
                         ipLocation={this.props.ipLocation}
                         collection={collection} groupId={groupId}
                         messages={filteredMessages} onUserMsg={this.onUserMsg} msgToScrollTo={this.props.msgToScrollTo}
                         callFn={callFn} idToDetails={idToDetails}
            />
        );
    }
}

