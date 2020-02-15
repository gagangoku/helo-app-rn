import React, {Fragment} from "react";
import {actionButton, spacer, View} from "../util/Util";
import GroupMessages from "../chat/groups/GroupMessages";
import {CHAT_FONT_FAMILY, FIREBASE_GROUPS_DB_NAME} from "../constants/Constants";
import {USER_BACKGROUND_COLOR_DARK} from "../chat/Constants";
import {firebase} from '../platform/firebase';
import {OUTPUT_NEW_JOINEE} from "../chat/Questions";
import {Text} from "./Util";
import ModalOrig from 'react-native-modal';


export class GroupPage extends React.PureComponent {
    constructor(props) {
        super(props);
        console.log('GroupPage constructor: ', props);
    }

    joinFn = async () => {
        const { groupInfo, userDetails, ipLocationResponse } = this.props;
        const { members, docRef } = groupInfo;
        const { id, role } = userDetails;

        const roleId = role + ':' + id;
        if (!members.includes(roleId)) {
            // New person joined the group
            const newMsgPayload = {
                timestamp: new Date().getTime(),
                type: OUTPUT_NEW_JOINEE,
                sender: roleId,
            };
            if (ipLocationResponse) {
                const { latitude, longitude } = ipLocationResponse;
                newMsgPayload.loc = { latitude, longitude };
            }
            docRef.update({
                members: firebase.firestore.FieldValue.arrayUnion(roleId),
                messages: firebase.firestore.FieldValue.arrayUnion(newMsgPayload),
            });
        }
    };

    render() {
        const { groupInfo, userDetails, ipLocationResponse, idToDetails } = this.props;
        if (!groupInfo || !userDetails) {
            return <View />;
        }

        const { id, name, role } = userDetails;
        const me = {
            role,
            id,
            sender: role + ':' + id,
            avatar: '',
            name,
        };

        const { members, groupId, docRef } = groupInfo;
        const isLoginModalOpen = !members || !members.includes(me.sender);
        const modal = (
            <ModalOrig isVisible={isLoginModalOpen}
                       backdropOpacity={0.5} style={{ margin: 0, padding: 0 }}
                       onRequestClose={() => {}} onBackdropPress={() => {}}
                       contentLabel="Example Modal">
                <LoginModal joinFn={this.joinFn} groupId={groupId} userDetails={userDetails} />
            </ModalOrig>
        );
        return (
            <Fragment>
                <GroupMessages location={this.props.location} history={this.props.history} key={'msg'}
                               goBackFn={this.goBackFn}
                               ipLocation={ipLocationResponse} msgToScrollTo={null}
                               bellFn={this.bellFn} leaderboardFn={this.leaderboardFn}
                               groupInfo={groupInfo} docRef={docRef}
                               idToDetails={idToDetails}
                               me={me} collection={FIREBASE_GROUPS_DB_NAME} groupId={groupId} />
                {isLoginModalOpen && modal}
            </Fragment>
        );
    }
}

class LoginModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    joinFn = async () => {
        this.props.joinFn();
    };

    render() {
        const { userDetails } = this.props;
        return (
            <View style={custom.root}>
                <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20 }}>
                    <Text style={{}}>{userDetails.name}</Text>
                    {spacer(20)}
                    {actionButton('JOIN', this.joinFn, { width: 100, height: 50, style: { backgroundColor: COLOR_BLUE }})}
                </View>
            </View>
        );
    }
}

const COLOR_BLUE = USER_BACKGROUND_COLOR_DARK;
const custom = {
    root: {
        fontFamily: CHAT_FONT_FAMILY,
    },
};
