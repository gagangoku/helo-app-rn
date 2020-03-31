import React from "react";
import {
    getAllInfoRelatedToGroup,
    getCircularImage,
    getDetailsFromPhone,
    getImageUrl,
    getPersonDetails,
    isDebugMode,
    isSuperAdmin,
    isUserPartOfGroup,
    showToast,
    spacer,
    Text,
    View,
} from "../../util/Util";
import {Linking, Modal, ScrollView, Switch, WINDOW_INNER_HEIGHT} from '../../platform/Util';
import {
    CHAT_FONT_FAMILY,
    FIREBASE_GROUPS_DB_NAME,
    GROUP_INVITE_LINK_BASE,
    RESTAURANT_JOBS_INDIA_GROUP_ADDITION
} from "../../constants/Constants";
import TouchableAnim from "../../platform/TouchableAnim";
import {NUM_MEMBERS_TO_SHOW, USER_BACKGROUND_COLOR_DARK} from "../Constants";
import {sendSms} from "../../util/Api";
import window from "global";
import format from 'string-format';
import EditableTopNameBar from "../../widgets/EditableTopNameBar";
import {firebase} from '../../platform/firebase';
import EditableImageWidget from "../../widgets/EditableImageWidget";
import cnsole from 'loglevel';
import {showPersonDetailsPageOnclickFn} from "../../platform/Navigators";
import {AddMemberModal} from "../../platform/AddMemberModal";
import {getNavigationObject} from "../../router/NavigationRef";


export default class GroupDetailsPage extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {};
        this.idToDetails = {};
        cnsole.log('GroupDetailsPage props: ', this.props);
    }

    async componentDidMount() {
        const { collection, groupId } = this.props;
        const { id, role } = await getDetailsFromPhone();
        const roleId = role + ':' + id;

        const isDebug = isDebugMode();
        const cbFn = async ({ groupInfo }) => {
            await getPersonDetails(this.idToDetails, groupInfo.members.slice(0, NUM_MEMBERS_TO_SHOW), groupInfo.filteredMessages);
            this.setState({ idToDetails: this.idToDetails, groupInfo });
        };
        const { docRef, groupInfo, observer } = await getAllInfoRelatedToGroup({ collection, groupId, cbFn, isDebug, dontProcessMessages: true });
        this.docRef = docRef;
        this.observer = observer;

        if (!isUserPartOfGroup(roleId, groupInfo.members)) {
            window.alert('You are not part of the group');
            return;
        }

        await getPersonDetails(this.idToDetails, groupInfo.members.slice(0, NUM_MEMBERS_TO_SHOW), groupInfo.filteredMessages);
        this.setState({ idToDetails: this.idToDetails, groupInfo, roleId });
    }

    componentWillUnmount() {
        this.observer && this.observer();        // Unsubscribe
    }

    render() {
        const { collection, groupId } = this.props;
        const { roleId, groupInfo, idToDetails } = this.state;
        if (!groupInfo) {
            return <View />;
        }

        const obj = { collection, groupId, roleId, groupInfo, idToDetails, docRef: this.docRef };
        return <GroupDetailsPageUI {...obj} />;
    }
}

export class GroupDetailsPageUI extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            isAddMemberModalOpen: false,
            isAddAdminModalOpen: false,
        };
        this.idToDetails = {};
        cnsole.log('GroupDetailsPage props: ', this.props);
    }

    openMemberModal = () => this.setState({ isAddMemberModalOpen: true });
    closeMemberModal = () => this.setState({ isAddMemberModalOpen: false });
    openAdminModal = () => this.setState({ isAddAdminModalOpen: true });
    closeAdminModal = () => this.setState({ isAddAdminModalOpen: false });
    trueOrFalse = (x, amIAdmin, cbFn) => {
        return (
            <Switch size="medium" checked={x} value={x} onChange={cbFn} disabled={!amIAdmin} key={x + '-' + amIAdmin} />
        );
    };
    onPressMember = (member) => {
        const { userDetails } = this.props;
        const me = {...userDetails, sender: userDetails.role + ':' + userDetails.id};

        const navigation = getNavigationObject();
        const data = { groupId: [me.sender, member].sort().join(','), me };
        cnsole.info('onPressMember: ', data);
        showPersonDetailsPageOnclickFn({ data, navigation });
    };

    groupInviteMessage = ({ name, groupId }) => {
        const groupLink = format('{}?group={}', GROUP_INVITE_LINK_BASE, groupId);
        const message = format('Dear {}, you have been invited to join the group. Join here: {}', name, groupLink);
        return { groupLink, message };
    };
    sendWhatsapp = async ({ phone, message }) => {
        // Send whatsapp
        const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
        showToast('Invite over whatsapp');
        try {
            const can = await Linking.canOpenURL(whatsappUrl);
            if (can) {
                await Linking.openURL(whatsappUrl);
                cnsole.info('Whatsapp sent !');
                return true;
            }
        } catch (e) {
            cnsole.error('Error sending whatsapp: ', e);
        }
        return false;
    };

    addMemberFn = async ({ name, phone }) => {
        const { collection, groupId } = this.props;

        const { message } = this.groupInviteMessage({ name, groupId });
        const whatsappSuccess = await this.sendWhatsapp({ phone, message });
        if (!whatsappSuccess) {
            showToast('Inviting over sms');
            const smsResponse = await sendSms(phone, message);
            cnsole.log('smsResponse: ', smsResponse);
            if (smsResponse !== 'ok') {
                window.alert('Failed to send sms, please contact our team');
                return;
            }
            showToast('Sms sent');
        }

        this.closeMemberModal();
    };

    addAdminFn = async (member) => {
        cnsole.log('addAdminFn: ', member);
        const { docRef } = this.props;
        await docRef.update({ admins: firebase.firestore.FieldValue.arrayUnion(member) });
        this.setState({ isAddAdminModalOpen: false });
    };

    onUpdateNameFn = async (name) => {
        cnsole.log('onUpdateNameFn: ', name);
        const { docRef } = this.props;
        if (name.length > 3) {
            await docRef.update({ name });
            return true;
        }
        return false;
    };
    onUpdateImageFn = async (photo) => {
        cnsole.log('onUpdateImageFn: ', photo);
        const { docRef } = this.props;
        await docRef.update({ photo });
    };

    setProp = async (prop, newVal) => {
        cnsole.log('setProp: ', prop, newVal);
        const { docRef } = this.props;
        await docRef.update({ [prop]: newVal });
    };

    render() {
        const { isAddMemberModalOpen, isAddAdminModalOpen } = this.state;
        const { collection, groupId, userDetails, groupInfo, idToDetails } = this.props;
        const { photo, name, desc, admins, members, shouldApplyFilters,
                isPrivate, isAdminPosting, hasAnalytics, showMemberAddNotifications } = groupInfo;

        const roleId = userDetails.role + ':' + userDetails.id;
        const fn = (member) => {
            const {id, name, image} = idToDetails[member].person;
            const imgSrc = getImageUrl(image);
            const H = 60;
            return (
                <TouchableAnim onPress={() => this.onPressMember(member)} key={id}
                               style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: 5 }} >
                    {getCircularImage({ src: imgSrc, dim: H, border: 0 })}
                    <Text style={{ marginLeft: 30 }}>{name}</Text>
                </TouchableAnim>
            );
        };
        const numMembers = collection === FIREBASE_GROUPS_DB_NAME && groupId === 'restaurant-jobs-india' ? members.length + RESTAURANT_JOBS_INDIA_GROUP_ADDITION : members.length;
        const membersArray = members.slice(0, NUM_MEMBERS_TO_SHOW).map(fn);
        const moreMembers = numMembers > NUM_MEMBERS_TO_SHOW ? (numMembers - NUM_MEMBERS_TO_SHOW) + ' more' : '';

        const adminsArray = admins.map(fn);

        const amIAdmin = admins.includes(roleId) || isSuperAdmin(roleId);
        const addAdminSection = !amIAdmin ? <View /> : (
            <TouchableAnim onPress={this.openAdminModal}>
                <Text style={{ fontSize: 16, marginLeft: 5, marginBottom: 5 }}>Add admin</Text>
            </TouchableAnim>
        );
        const addMemberSection = !amIAdmin ? <View /> : (
            <TouchableAnim onPress={this.openMemberModal}>
                <Text style={{ fontSize: 16, marginLeft: 5, marginBottom: 5 }}>Add member</Text>
            </TouchableAnim>
        );

        const fn1 = () => this.setProp('isPrivate', !isPrivate);
        const fn2 = () => this.setProp('isAdminPosting', !isAdminPosting);
        const fn3 = () => this.setProp('hasAnalytics', !hasAnalytics);
        const fn4 = () => this.setProp('showMemberAddNotifications', !showMemberAddNotifications);
        const fn5 = () => this.setProp('shouldApplyFilters', !shouldApplyFilters);
        return (
            <ScrollView style={{ height: '100%', width: '100%' }}>
                <View style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', ...custom.root }}>
                    <View style={{ width: '100%', maxWidth: MAX_WIDTH }}>
                        <EditableTopNameBar name={name} isEditable={amIAdmin} onUpdateFn={this.onUpdateNameFn}
                                            location={this.props.location} history={this.props.history} />
                        <EditableImageWidget photo={photo} isEditable={amIAdmin} onUpdateFn={this.onUpdateImageFn} />

                        {spacer(20)}
                        <View style={{}}>
                            <Text style={{}}>{desc}</Text>
                        </View>

                        {spacer(20)}
                        <View style={{ marginLeft: 20, marginRight: 20 }}>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{  }}>Is private: </Text>
                                {this.trueOrFalse(isPrivate, false, fn1)}
                            </View>

                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{  }}>Is only admin posting allowed: </Text>
                                {this.trueOrFalse(isAdminPosting, amIAdmin, fn2)}
                            </View>

                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{  }}>Has analytics: </Text>
                                {this.trueOrFalse(hasAnalytics, amIAdmin, fn3)}
                            </View>

                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{  }}>Show member add notifications: </Text>
                                {this.trueOrFalse(showMemberAddNotifications, amIAdmin, fn4)}
                            </View>

                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{  }}>Enable hyperlocal posts: </Text>
                                {this.trueOrFalse(shouldApplyFilters, amIAdmin, fn5)}
                            </View>
                        </View>

                        {spacer(20)}
                        <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 10, marginRight: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Admins</Text>
                            {addAdminSection}
                            <View style={{ display: 'flex', flexDirection: 'column' }}>
                                {adminsArray}
                            </View>
                        </View>

                        {spacer(20)}
                        <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 10, marginRight: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1b8f1e', marginBottom: 5 }}>{numMembers} members</Text>
                            {addMemberSection}
                            <View style={{ display: 'flex', flexDirection: 'column' }}>
                                {membersArray}
                                <Text style={{ fontSize: 18 }}>{moreMembers}</Text>
                            </View>
                        </View>
                    </View>

                    <Modal isOpen={isAddMemberModalOpen} visible={isAddMemberModalOpen} isVisible={isAddMemberModalOpen}
                           backdropOpacity={0.5} style={modalStyle}
                           onRequestClose={this.closeMemberModal} onBackdropPress={this.closeMemberModal}
                           onAfterOpen={() => {}} contentLabel="Example Modal">
                        <AddMemberModal collection={collection} groupId={groupId} contacts={this.props.contacts} addMemberFn={this.addMemberFn} />
                    </Modal>
                    <Modal isOpen={isAddAdminModalOpen} visible={isAddAdminModalOpen} isVisible={isAddAdminModalOpen}
                           backdropOpacity={0.5} style={modalStyle}
                           onRequestClose={this.closeAdminModal} onBackdropPress={this.closeAdminModal}
                           onAfterOpen={() => {}} contentLabel="Example Modal">
                        <ChooseAdminModal admins={admins} members={members} idToDetails={idToDetails} addAdminFn={this.addAdminFn} />
                    </Modal>
                </View>
            </ScrollView>
        );
    }
}

class ChooseAdminModal extends React.Component {
    render() {
        const { admins, members, idToDetails, addAdminFn } = this.props;

        const membersArray = members.filter(x => !admins.includes(x)).map((member) => {
            const {id, name, image} = idToDetails[member].person;
            const imgSrc = getImageUrl(image);
            const H = 60;
            return (
                <TouchableAnim onPress={() => addAdminFn(member)} key={id}
                               style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: 5 }} >
                    {getCircularImage({ src: imgSrc, dim: H, border: 0 })}
                    <Text style={{ marginLeft: 30 }}>{name}</Text>
                </TouchableAnim>
            );
        });

        return (
            <View style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ padding: 20, width: MAX_WIDTH/1.7, height: 0.8*WINDOW_INNER_HEIGHT, maxHeight: 400, backgroundColor: '#ffffff' }}>
                    <ScrollView style={{ width: '100%', height: '100%' }}>
                        <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', width: '100%', ...custom.root }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Choose the member to make admin</Text>
                            {spacer(20)}
                            {membersArray}
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}


const MAX_WIDTH = 450;
const BORDER_COLOR_RED = '#ff8b4a';
const BORDER_COLOR_GRAY = '#b9b9b9';
const COLOR_BLUE = USER_BACKGROUND_COLOR_DARK;
const custom = {
    root: {
        fontFamily: CHAT_FONT_FAMILY,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        backgroundColor: '#ffffff',
    },
    formInputContainer: {
        width: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    },
    textInput: {
        padding: 0,
        margin: 0,
        height: 40,
        fontSize: 20,
        paddingLeft: 2,
        width: '80%',
        border: '0px',
        outline: 'none',
        borderBottom: '1px solid #000000',
        borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#000000',
    },
};
const modalStyle = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
    },
    backgroundColor: '#ffffff',
};
