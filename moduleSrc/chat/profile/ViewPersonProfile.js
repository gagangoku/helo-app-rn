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
    FIREBASE_GROUPS_DB_NAME,
    PHONE_BLACK_ICON
} from "../../constants/Constants";
import {crudsRead, crudsUpdate} from "../../util/Api";
import TouchableAnim from "../../widgets/TouchableAnim";
import {WHATSAPP_ICON} from "../Constants";
import format from "string-format";
import {StepPersonalMessaging} from "../../controller/HomePageFlows";
import window from "global";
import EditableTopNameBar from "../../widgets/EditableTopNameBar";
import EditableImageWidget from "../../widgets/EditableImageWidget";
import {StepViewMyProfile} from "../../controller/SupplyPageFlows";
import {firebase} from "@firebase/app";
import '@firebase/firestore';
import lodash from 'lodash';


export default class ViewPersonProfile extends React.Component {
    constructor(props) {
        super(props);
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

        const roleId = getUrlParam('roleId');
        const [role, id] = roleId.split(':');
        console.log('role, id: ', role, id);
        if (detailsFromPhone.role === role && detailsFromPhone.id === id) {
            // My profile
            window.location.href = StepViewMyProfile.URL;
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

    gotoGroup = (groupId) => {};
    chatFn = (roleId) => {
        const url = format('{}?otherPerson={}', StepPersonalMessaging.URL, roleId);
        window.open(url);
    };
    callFn = (phone) => {
        showToast('Coming soon');
    };
    whatsappFn = (phone) => {};

    onUpdateNameFn = async (name) => {
        console.log('onUpdateNameFn: ', name);
        const { visitor, customer } = this.state;
        if (name.length >= 3 && visitor) {
            const v = await crudsRead(DESCRIPTOR_VISITOR, visitor.id);
            const newVisitor = { ...v, name };
            await crudsUpdate(DESCRIPTOR_VISITOR, visitor.id, newVisitor);
            this.setState({ visitor: newVisitor, editing: false });
        }
    };
    onUpdateImageFn = async (photo) => {
        console.log('onUpdateImageFn: ', photo);
        const { visitor, customer } = this.state;
        if (visitor) {
            const v = await crudsRead(DESCRIPTOR_VISITOR, visitor.id);
            const newVisitor = { ...v, photo };
            await crudsUpdate(DESCRIPTOR_VISITOR, visitor.id, newVisitor);
            this.setState({ visitor: newVisitor });
        }
    };

    renderVisitor = (visitor) => {
        console.log('renderVisitor: ', visitor);
        const { id, name, photo, phone } = visitor;
        const { detailsFromPhone, p1Groups, p2Groups } = this.state;
        const roleId = 'visitor:' + id;
        const desc = '';
        const isDebug = isDebugMode();
        const isEditable = isDebug || (detailsFromPhone && parseInt(detailsFromPhone.id) === parseInt(id) && detailsFromPhone.role === 'visitor');

        const groupsInCommon = lodash.intersectionBy(Object.keys(p1Groups), Object.keys(p2Groups)).map(x => p1Groups[x]);

        const fn = (groupInfo) => {
            const { groupId, photo, name } = groupInfo;
            const imgSrc = getImageUrl(photo);
            const H = 60;
            return (
                <TouchableAnim onPress={() => this.gotoGroup(groupId)} key={id}
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
            <View style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', ...custom.root }}>
                <View style={{ width: '100%', maxWidth: MAX_WIDTH }}>
                    <EditableTopNameBar name={name} isEditable={isEditable} onUpdateFn={this.onUpdateNameFn} />
                    <EditableImageWidget photo={photo} isEditable={isEditable} onUpdateFn={this.onUpdateImageFn} />

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

                    {spacer(20)}
                    <View style={{ display: 'flex', flexDirection: 'column', marginLeft: 10, marginRight: 10 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1b8f1e' }}>{groupsInCommon.length} groups in common</Text>
                        <View style={{ display: 'flex', flexDirection: 'column', marginTop: 10 }}>
                            {groupsArray}
                            {moreGroups}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    render() {
        const { visitor, customer } = this.state;
        if (!visitor && !customer) {
            return <View />;
        }

        if (visitor) {
            return this.renderVisitor(visitor);
        }
        if (customer) {
            return (
                <View>
                    <Text>{customer.person.name}</Text>
                    <Text>{customer.person.email}</Text>
                </View>
            );
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
    },
};
