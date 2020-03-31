import React from "react";
import {
    getCtx,
    getDetailsFromPhone,
    getGroupInfo,
    getImageUrl,
    getUrlParam,
    Image,
    isDebugMode,
    showToast,
    spacer,
    Text,
    View
} from "../../util/Util";
import {
    CHAT_FONT_FAMILY,
    CHAT_ICON,
    DESCRIPTOR_CUSTOMER,
    DESCRIPTOR_VISITOR,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME,
    PHONE_BLACK_ICON
} from "../../constants/Constants";
import {crudsRead, crudsUpdate} from "../../util/Api";
import TouchableAnim from "../../platform/TouchableAnim";
import {WHATSAPP_ICON} from "../Constants";
import format from "string-format";
import window from "global";
import EditableTopNameBar from "../../widgets/EditableTopNameBar";
import EditableImageWidget from "../../widgets/EditableImageWidget";
import {firebase} from '../../platform/firebase';
import lodash from 'lodash';
import {GROUP_URLS} from "../../controller/Urls";
import cnsole from 'loglevel';
import {refetchDetails, ScrollView} from "../../platform/Util";
import {goToChatFn} from "../../platform/Navigators";
import {getNavigationObject} from "../../router/NavigationRef";
import EditableTextBox from "../../widgets/EditableTextBox";


export default class ViewPersonProfile extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.contextObj = getCtx(this);
        this.state = {
            visitor: null,
            customer: null,
            detailsFromPhone: null,

            p1Groups: {},
            p2Groups: {},
        };
    }

    async componentDidMount() {
        const detailsFromPhone = await getDetailsFromPhone();
        this.setState({ detailsFromPhone });

        const roleId = getUrlParam('otherRoleId') || getUrlParam('roleId');
        const [role, id] = roleId.split(':');
        cnsole.log('role, id: ', role, id);
        if (detailsFromPhone.role === role && detailsFromPhone.id === id) {
            // My profile
            window.location.href = GROUP_URLS.viewMyProfile;
            return;
        }

        switch (role) {
            case 'supply':
                window.location.href = '/person/' + id;
                break;
            case 'visitor':
                const visitor = await crudsRead(DESCRIPTOR_VISITOR, id);
                this.setState({ visitor });
                break;
            case 'cust':
                const customer = await crudsRead(DESCRIPTOR_CUSTOMER, id);
                this.setState({ customer });
                break;
            default:
        }

        this.db = firebase.firestore();
        const queryRef1 = this.db.collection(FIREBASE_GROUPS_DB_NAME).where('members', 'array-contains', roleId);
        const queryRef2 = this.db.collection(FIREBASE_GROUPS_DB_NAME).where('members', 'array-contains', detailsFromPhone.role + ':' + detailsFromPhone.id);

        const fn = (key, snapshot) => {
            const groupMap = {};
            snapshot.forEach(d => {
                const groupId = d.id;
                const data = d.data();
                const { name, photo } = getGroupInfo(data, d);
                groupMap[groupId] = ({ groupId, name, photo });
            });
            this.setState({ [key]: groupMap });

        };
        this.observer1 = queryRef1.onSnapshot((snapshot) => fn('p1Groups', snapshot));
        this.observer2 = queryRef2.onSnapshot((snapshot) => fn('p2Groups', snapshot));
    }

    componentWillUnmount() {
        // Unsubscribe
        this.observer1 && this.observer1();
        this.observer2 && this.observer2();
    }

    render() {
        const { visitor, customer, p1Groups, p2Groups } = this.state;
        if (!visitor && !customer) {
            return <View />;
        }

        return <ViewPersonProfileUI visitor={visitor} customer={customer} p1Groups={p1Groups} p2Groups={p2Groups} />;
    }
}

export class ViewPersonProfileUI extends React.Component {
    gotoGroup = (groupId) => {
        const data = { doc: { collection: FIREBASE_GROUPS_DB_NAME, groupId } };
        const navigation = getNavigationObject();
        goToChatFn({ data, navigation });
    };
    chatFn = (roleId) => {
        const { userDetails } = this.props;
        const groupId = [roleId, userDetails.role + ':' + userDetails.id].sort().join(',');
        const data = { doc: { collection: FIREBASE_CHAT_MESSAGES_DB_NAME, groupId } };
        const navigation = getNavigationObject();
        goToChatFn({ data, navigation });
    };
    callFn = (phone) => {
        showToast('Coming soon');
    };
    whatsappFn = (phone) => {
        const url = format('https://wa.me/91{}?text=Hi', phone);
        window.open(url);
    };

    onUpdateNameFn = async (name) => this.onUpdateFn({ name });
    onUpdateImageFn = async (photo) => this.onUpdateFn({ photo });
    onUpdateDesignationFn = async (designation) => this.onUpdateFn({ designation });
    onUpdateFn = async (obj) => {
        cnsole.info('onUpdateFn: ', obj);
        const { visitor } = this.props;
        if (visitor) {
            const v = await crudsRead(DESCRIPTOR_VISITOR, visitor.id);
            const newVisitor = { ...v, ...obj };
            await crudsUpdate(DESCRIPTOR_VISITOR, visitor.id, newVisitor);
            refetchDetails(['visitor:' + visitor.id]);
        }
    };

    renderCustomer = (customer) => {
        cnsole.info('renderCustomer: ', customer);
        const { id, name, image, thumbImage, phone } = customer.person;
        const v = { role: 'cust', id, name, image, phone: phone?.phoneNumber };
        return this.renderRole(v);
    };
    renderSupply = (supply) => {
        cnsole.info('renderSupply: ', supply);
        const { id, name, image, thumbImage, phone } = supply.person;
        const v = { role: 'supply', id, name, image, phone: phone?.phoneNumber };
        return this.renderRole(v);
    };
    renderVisitor = (visitor) => {
        cnsole.info('renderVisitor: ', visitor);
        return this.renderRole({ ...visitor, role: 'visitor' });
    };

    renderRole = (obj) => {
        cnsole.info('renderRole: ', obj);
        const { role, id, name, image, phone, designation } = obj;
        const { detailsFromPhone, p1Groups, p2Groups } = this.props;
        const roleId = role + ':' + id;
        const desc = '';
        const isDebug = isDebugMode();
        const isEditable = isDebug || (detailsFromPhone && parseInt(detailsFromPhone.id) === parseInt(id) && detailsFromPhone.role === 'visitor');

        const groupsInCommon = lodash.intersectionBy(Object.keys(p1Groups), Object.keys(p2Groups)).map(x => p1Groups[x]);

        const fn = (groupInfo) => {
            const { groupId, photo, name } = groupInfo;
            const imgSrc = getImageUrl(photo);
            const H = 60;
            return (
                <TouchableAnim onPress={() => this.gotoGroup(groupId)} key={groupId}
                               style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 5 }} >
                    <Image style={{ height: H, width: H, borderRadius: H/2, border: '1px solid #e0e0e0' }} src={imgSrc} />
                    <Text style={{ marginLeft: 30 }}>{name}</Text>
                </TouchableAnim>
            );
        };
        const groupsArray = groupsInCommon.slice(0, 20).map(fn);
        const moreGroups = groupsInCommon.length > 20 ? (groupsInCommon.length - 20) + ' more' : '';

        const CHAT_BTN_DIM = 35;
        const whatsappIcon = (
            <TouchableAnim onPress={() => this.whatsappFn(phone)} style={{ height: CHAT_BTN_DIM, width: CHAT_BTN_DIM, marginRight: 20 }}>
                <Image src={WHATSAPP_ICON} style={{ height: CHAT_BTN_DIM, width: CHAT_BTN_DIM, }} />
            </TouchableAnim>
        );

        return (
            <ScrollView style={{ height: '100%', width: '100%' }}>
                <View style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', ...custom.root }}>
                    <View style={{ width: '100%', maxWidth: MAX_WIDTH }}>
                        <EditableTopNameBar name={name} isEditable={isEditable} onUpdateFn={this.onUpdateNameFn} />
                        <EditableImageWidget photo={image} isEditable={isEditable} onUpdateFn={this.onUpdateImageFn} />

                        {spacer(20)}
                        <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <TouchableAnim onPress={() => this.chatFn(roleId)} style={{ marginRight: 20 }}>
                                    <Image src={CHAT_ICON} style={{ height: CHAT_BTN_DIM + 4, width: CHAT_BTN_DIM + 4, marginTop: 6 }} />
                                </TouchableAnim>
                                <TouchableAnim onPress={() => this.callFn(phone)} style={{ marginRight: 20 }}>
                                    <Image src={PHONE_BLACK_ICON} style={{ height: CHAT_BTN_DIM, width: CHAT_BTN_DIM }} />
                                </TouchableAnim>
                                {isEditable ? whatsappIcon : <View />}
                            </View>
                        </View>

                        {spacer(20)}
                        <View style={{ }}>
                            <Text style={{ }}>{desc}</Text>
                        </View>
                        <View style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <View style={{ width: '80%' }}>
                                <EditableTextBox name={designation} isEditable={isEditable} onUpdateFn={this.onUpdateDesignationFn} label={'Designation'} />
                            </View>
                        </View>

                        {spacer(20)}
                        <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 10, marginRight: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1b8f1e' }}>{groupsInCommon.length} groups in common</Text>
                            <View style={{ display: 'flex', flexDirection: 'column', marginTop: 10 }}>
                                {groupsArray}
                                <Text style={{ }}>{moreGroups}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    };

    render() {
        const { visitor, customer, supply } = this.props;
        if (!visitor && !customer && !supply) {
            return <View />;
        }

        if (visitor) {
            return this.renderVisitor(visitor);
        }
        if (customer) {
            return this.renderCustomer(customer);
        }
        if (supply) {
            return this.renderSupply(supply);
        }
        return null;
    }
}

const MAX_WIDTH = 450;
const custom = {
    root: {
        width: '100%',
        fontSize: 18,
        fontFamily: CHAT_FONT_FAMILY,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        backgroundColor: '#ffffff',
    },
};
