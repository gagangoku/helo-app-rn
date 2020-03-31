import React, {Fragment} from "react";
import {actionButton, isUserPartOfGroup, processTrainingModules, spacer, View} from "../util/Util";
import GroupMessages from "../chat/groups/GroupMessages";
import {CHAT_FONT_FAMILY, FIREBASE_GROUPS_DB_NAME} from "../constants/Constants";
import {USER_BACKGROUND_COLOR_DARK} from "../chat/Constants";
import {firebase} from '../platform/firebase';
import {OUTPUT_NEW_JOINEE} from "../chat/Questions";
import {Text} from "./Util";
import ModalOrig from 'react-native-modal';
import {goBackFn, leaderboardOnclickFn} from "./Navigators";
import cnsole from 'loglevel';
import {trainingModulesQ} from "../router/JobQueues";
import {getNavigationObject} from "../router/NavigationRef";


export class GroupPage extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
        this.state = {
            exists: true,
        };
    }

    async componentDidMount() {
        const { docRef, groupId, idToDocMap, userDetails } = this.props;
        const doc = await docRef.get();
        const exists = doc.exists;
        this.setState({ exists });

        const groupInfo = idToDocMap[groupId];
        trainingModulesQ.push(async (resolve) => {
            const messages = await processTrainingModules(FIREBASE_GROUPS_DB_NAME, groupId, userDetails.sender, groupInfo.messages);
            resolve();
        });
    }

    joinFn = async () => {
        const { groupInfo, userDetails, ipLocationResponse, docRef } = this.props;
        const { members } = groupInfo;
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
    closeModalFn = () => {
        const navigation = getNavigationObject();
        goBackFn({ navigation });
    };

    leaderboardFn = ({ idx, me, groupId, collection }) => {
        const navigation = getNavigationObject();
        const data = { idx, me, groupId, collection };
        leaderboardOnclickFn({ data, navigation });
    };

    render() {
        cnsole.info('GroupPage render');
        const { docRef, groupInfo, userDetails, ipLocationResponse, idToDocMap, idToDetails, goBackFn } = this.props;
        const { exists } = this.state;
        if (!docRef) {
            return <View />;
        }
        if (!exists) {
            return (
                <View style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{}}>No such group</Text>
                </View>
            );
        }

        if (!groupInfo || !userDetails) {
            cnsole.warn('Did not find either groupInfo or userDetails: ', userDetails, groupInfo);
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

        const { members, groupId } = groupInfo;
        const isLoginModalOpen = !isUserPartOfGroup(me.sender, members);
        const modal = (
            <ModalOrig isVisible={isLoginModalOpen}
                       backdropOpacity={0.5} style={{ margin: 0, padding: 0 }}
                       onRequestClose={this.closeModalFn} onBackdropPress={this.closeModalFn}
                       contentLabel="Example Modal">
                <View style={{ height: '100%', width: '100%',
                               display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ height: 200, width: 200, backgroundColor: 'white', borderRadius: 10,
                                   display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <LoginModal joinFn={this.joinFn} groupId={groupId} userDetails={userDetails} />
                    </View>
                </View>
            </ModalOrig>
        );

        return (
            <Fragment>
                <GroupMessages goBackFn={goBackFn}
                               ipLocation={ipLocationResponse} msgToScrollTo={null}
                               bellFn={this.bellFn} leaderboardFn={this.leaderboardFn}
                               groupInfo={groupInfo} docRef={docRef}
                               idToDetails={idToDetails} idToDocMap={idToDocMap}
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
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                           paddingTop: 20, fontFamily: CHAT_FONT_FAMILY }}>
                <Text style={{ }}>{userDetails.name}</Text>
                {spacer(20)}
                {actionButton('JOIN', this.joinFn, { width: 100, height: 50, style: { backgroundColor: COLOR_BLUE }})}
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
