import React from "react";
import {
    actionButton,
    getAllInfoRelatedToGroup,
    getCircularImage,
    getCtx,
    getDetailsFromPhone,
    getImageUrl,
    getPersonDetails,
    isDebugMode,
    spacer,
    Text,
    View,
} from "../../util/Util";
import {Switch} from '../../platform/Util';
import {
    CHAT_FONT_FAMILY,
    FIREBASE_GROUPS_DB_NAME,
    GROUPS_SUPER_ADMINS,
    MWEB_URL,
    RESTAURANT_JOBS_INDIA_GROUP_ADDITION
} from "../../constants/Constants";
import TouchableAnim from "../../widgets/TouchableAnim";
import Modal from "react-modal";
import {USER_BACKGROUND_COLOR_DARK} from "../Constants";
import {sendSms} from "../../util/Api";
import window from "global";
import format from 'string-format';
import {StepViewPerson} from "../../controller/SupplyPageFlows";
import EditableTopNameBar from "../../widgets/EditableTopNameBar";
import {firebase} from '../../platform/firebase';
import EditableImageWidget from "../../widgets/EditableImageWidget";


export default class GroupDetailsPage extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);

        this.state = {
            isAddMemberModalOpen: false,
            isAddAdminModalOpen: false,
        };
        this.idToDetails = {};
        console.log('GroupDetailsPage props: ', this.props);
    }

    async componentDidMount() {
        const { collection, groupId } = this.props;
        const { id, role } = await getDetailsFromPhone();
        const roleId = role + ':' + id;

        const isDebug = isDebugMode();
        const cbFn = async ({ groupInfo }) => {
            await getPersonDetails(this.idToDetails, groupInfo.members, groupInfo.filteredMessages);
            this.setState({ idToDetails: this.idToDetails, groupInfo });
        };
        const { docRef, groupInfo, observer } = await getAllInfoRelatedToGroup({ collection, groupId, cbFn, isDebug, dontProcessMessages: true });
        this.docRef = docRef;
        this.observer = observer;

        if (!groupInfo.members.includes(roleId)) {
            window.alert('You are not part of the group');
            return;
        }

        await getPersonDetails(this.idToDetails, groupInfo.members, groupInfo.filteredMessages);
        this.setState({ idToDetails: this.idToDetails, groupInfo, roleId });
    }

    componentWillUnmount() {
        this.observer && this.observer();        // Unsubscribe
    }

    trueOrFalse = (x, amIAdmin, cbFn) => {
        return (
            <Switch size="medium" checked={x} onChange={cbFn} disabled={!amIAdmin} />
        );
    };
    onPressMember = (member) => {
        const url = format('{}?roleId={}', StepViewPerson.URL, member);
        window.open(url);
    };

    addMemberFn = async ({ name, phone }) => {
        const { collection, groupId } = this.props;

        const groupLink = format('{}/group/join?group={}', MWEB_URL, groupId);
        const msg = format('Dear {}, you have been invited to join the group. Join here: {}', name, groupLink);
        const smsResponse = await sendSms(phone, msg);
        console.log('smsResponse: ', smsResponse);
        if (smsResponse !== 'ok') {
            window.alert('Failed to send sms, please contact our team');
            return;
        }

        this.setState({ isAddMemberModalOpen: false });
    };
    addAdminFn = async (member) => {
        console.log('addAdminFn: ', member);
        await this.docRef.update({ admins: firebase.firestore.FieldValue.arrayUnion(member) });
        this.setState({ isAddAdminModalOpen: false });
    };

    onUpdateNameFn = async (name) => {
        console.log('onUpdateNameFn: ', name);
        if (name.length > 3) {
            await this.docRef.update({ name });
            return true;
        }
        return false;
    };
    onUpdateImageFn = async (photo) => {
        console.log('onUpdateImageFn: ', photo);
        await this.docRef.update({ photo });
    };

    setProp = async (prop, newVal) => {
        console.log('setProp: ', prop, newVal);
        await this.docRef.update({ [prop]: newVal });
    };

    render() {
        const { collection, groupId } = this.props;
        const { roleId, groupInfo } = this.state;
        if (!groupInfo) {
            return <View />;
        }
        const { photo, name, desc, admins, members, shouldApplyFilters,
                isPrivate, isAdminPosting, hasAnalytics, showMemberAddNotifications } = groupInfo;

        const fn = (member) => {
            const {id, name, image} = this.idToDetails[member].person;
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

        const amIAdmin = admins.includes(roleId) || GROUPS_SUPER_ADMINS.includes(roleId);
        const addAdminSection = !amIAdmin ? <View /> : (
            <TouchableAnim onPress={() => this.setState({ isAddAdminModalOpen: true })}>
                <Text style={{ fontSize: 16, marginLeft: 5, marginBottom: 5 }}>Add admin</Text>
            </TouchableAnim>
        );
        const addMemberSection = !amIAdmin ? <View /> : (
            <TouchableAnim onPress={() => this.setState({ isAddMemberModalOpen: true })}>
                <Text style={{ fontSize: 16, marginLeft: 5, marginBottom: 5 }}>Add member</Text>
            </TouchableAnim>
        );

        const fn1 = () => this.setProp('isPrivate', !isPrivate);
        const fn2 = () => this.setProp('isAdminPosting', !isAdminPosting);
        const fn3 = () => this.setProp('hasAnalytics', !hasAnalytics);
        const fn4 = () => this.setProp('showMemberAddNotifications', !showMemberAddNotifications);
        const fn5 = () => this.setProp('shouldApplyFilters', !shouldApplyFilters);
        return (
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
                            <Text style={{  }}>{this.trueOrFalse(isPrivate, false, fn1)}</Text>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{  }}>Is only admin posting allowed: </Text>
                            <Text style={{  }}>{this.trueOrFalse(isAdminPosting, amIAdmin, fn2)}</Text>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{  }}>Has analytics: </Text>
                            <Text style={{  }}>{this.trueOrFalse(hasAnalytics, amIAdmin, fn3)}</Text>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{  }}>Show member add notifications: </Text>
                            <Text style={{  }}>{this.trueOrFalse(showMemberAddNotifications, amIAdmin, fn4)}</Text>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{  }}>Enable hyperlocal posts: </Text>
                            <Text style={{  }}>{this.trueOrFalse(shouldApplyFilters, amIAdmin, fn5)}</Text>
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
                            {moreMembers}
                        </View>
                    </View>
                </View>

                <Modal isOpen={this.state.isAddMemberModalOpen} onRequestClose={() => this.setState({ isAddMemberModalOpen : false })}
                       style={modalStyle} onAfterOpen={() => {}} contentLabel="Example Modal">
                    <AddMemberModal collection={collection} groupId={groupId} addMemberFn={this.addMemberFn} />
                </Modal>
                <Modal isOpen={this.state.isAddAdminModalOpen} onRequestClose={() => this.setState({ isAddAdminModalOpen : false })}
                       style={modalStyle} onAfterOpen={() => {}} contentLabel="Example Modal">
                    <ChooseAdminModal admins={admins} members={members} idToDetails={this.idToDetails} addAdminFn={this.addAdminFn} />
                </Modal>
            </View>
        );
    }
}

class ChooseAdminModal extends React.Component {
    constructor(props) {
        super(props);
    }

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
            <View style={{ width: MAX_WIDTH/2, height: '80vw', maxHeight: 400, overflowY: 'scroll', ...custom.root }}>
                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', width: '100%' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Choose the member to make admin</Text>
                    {spacer(20)}
                    {membersArray}
                </View>
            </View>
        );
    }
}

class AddMemberModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            phone: '',
            name: '',
        };
    }

    onChangePhoneFn = (elem) => {
        if (elem.target.value.length <= 10) {
            this.setState({ phone: elem.target.value });
        }
    };
    render() {
        const { name, phone } = this.state;
        const nameBorderColor = name.length < 3 ? BORDER_COLOR_RED : BORDER_COLOR_GRAY;
        const phoneBorderColor = phone.length !== 10 ? BORDER_COLOR_RED : BORDER_COLOR_GRAY;
        const nameDisabled = this.props.name ? { 'disabled': true } : {};
        const phoneDisabled = this.props.phone ? { 'disabled': true } : {};
        const btnStyle = name.length < 3 || phone.length !== 10 ? { backgroundColor: BORDER_COLOR_GRAY } : { backgroundColor: COLOR_BLUE };

        return (
            <View style={{ width: MAX_WIDTH/2 }}>
                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    {spacer(20)}
                    <View style={custom.formInputContainer}>
                        <input placeholder='  Name' type="string" style={{...custom.textInput, letterSpacing: 1, borderColor: nameBorderColor}}
                               value={name} {...nameDisabled} onChange={(elem) => this.setState({ name: elem.target.value })} />
                    </View>
                    {spacer(10)}
                    <View style={custom.formInputContainer}>
                        <input placeholder='  Phone' type="number" style={{...custom.textInput, letterSpacing: 2, borderColor: phoneBorderColor}}
                               value={phone} {...phoneDisabled} onChange={this.onChangePhoneFn} />
                    </View>

                    {spacer(20)}
                    {actionButton('ADD', () => this.props.addMemberFn({ name, phone }), { width: 100, height: 50, style: btnStyle})}
                </View>
            </View>
        );
    }
}

const NUM_MEMBERS_TO_SHOW = 100;
const MAX_WIDTH = 450;
const BORDER_COLOR_RED = '#ff8b4a';
const BORDER_COLOR_GRAY = '#b9b9b9';
const COLOR_BLUE = USER_BACKGROUND_COLOR_DARK;
const custom = {
    root: {
        fontFamily: CHAT_FONT_FAMILY,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
    formInputContainer: {
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    },
    textInput: {
        height: 40,
        fontSize: 20,
        paddingLeft: 2,
        width: '100%',
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
    }
};
