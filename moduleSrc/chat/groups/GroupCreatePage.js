import React from "react";
import {actionButton, getCtx, getDetailsFromPhone, spacer, Text, uploadBlob, View} from "../../util/Util";
import {ConfigurableTopBar} from "../messaging/TopBar";
import {CHAT_FONT_FAMILY, FIREBASE_GROUPS_DB_NAME} from "../../constants/Constants";
import {firebase} from "@firebase/app";
import '@firebase/firestore';
import window from 'global';
import {StepGroupJoin} from "../../controller/HomePageFlows";
import EditableImageWidget from "../../widgets/EditableImageWidget";


export class GroupCreatePage extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            name: '',
            image: DEFAULT_IMAGE,
            errorText: '',
            successText: '',
        };
        this.imageRef = React.createRef();
    }

    async componentDidMount() {
        const {id, role} = await getDetailsFromPhone();
        if (!id || !role) {
            window.alert('You need to login');
            return;
        }
        const roleId = role + ':' + id;
        this.setState({ roleId });
    }

    getGroupId = (name) => {
        return (name || '').replace(/ /g, '-').replace(/[^0-9a-zA-Z-]/g, '');
    };

    createGroup = async () => {
        const { roleId, name, image } = this.state;
        const groupId = this.getGroupId(name);
        console.log('createGroup: ', name, groupId);

        if (groupId.length <= 3) {
            this.setState({ errorText: 'Too short: ' + groupId });
            return;
        }

        const db = firebase.firestore();
        console.log('db: ', db);
        const docRef = db.collection(FIREBASE_GROUPS_DB_NAME).doc(groupId);
        console.log('docRef: ', docRef);
        const doc = await docRef.get();
        console.log('doc: ', doc);
        if (doc.exists) {
            this.setState({ errorText: 'Group already exists: ' + groupId });
            return;
        }

        await docRef.set({
            desc: '',
            lastReadIdx: {},
            admins: [roleId],
            members: [roleId],
            messages: [],
            muters: [],
            name,
            photo: image,
            watchers: [],
            createdAt: new Date().getTime(),

            isPrivate: true,
            hasAnalytics: true,
            isAdminPosting: true,
            showMemberAddNotifications: true,
            allowChatBotPromptForJobs: false,
        });
        const baseDoc = await docRef.get();
        console.log('Got baseDoc: ', baseDoc);

        this.setState({ successText: 'Group created' });
        setTimeout(() => {
            window.location.href = StepGroupJoin.URL + '?group=' + groupId;
        }, 1000);
    };

    onSelectFile = async (files) => {
        console.log('Files: ', files);
        if (files.length === 0) {
            return;
        }
        const file = files[0];
        const blobUrl = await uploadBlob(file);
        this.setState({ image: blobUrl });
    };
    onUpdateImageFn = (photo) => {
        this.setState({ image: photo });
    };


    onChangeFn = (elem) => {
        this.setState({ name: elem.target.value, errorText: '', successText: '' });
    };

    render() {
        const { name, image, roleId, errorText, successText } = this.state;
        if (!roleId) {
            return <View />;
        }
        const groupId = this.getGroupId(name);

        const sections = [
            { float: 'left', name: ConfigurableTopBar.SECTION_BACK, displayProps: {}, data: {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_NAME, displayProps: {}, data: { name: 'Create Group' }, onClickFn: () => {} },
        ];

        const IMG_DIM = 150;
        return (
            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <View style={custom.root}>
                    <ConfigurableTopBar collection={null} sections={sections}
                                        location={this.props.location} history={this.props.history} />

                    <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {spacer(30)}
                        <View style={{ height: IMG_DIM, width: IMG_DIM }}>
                            <EditableImageWidget photo={image} isEditable={true} onUpdateFn={this.onUpdateImageFn}
                                                 imgStyle={{ height: IMG_DIM, width: IMG_DIM, borderRadius: IMG_DIM/2, border: '1px solid #e0e0e0' }} />
                        </View>
                        {spacer(20)}


                        <View style={{ }}>
                            <View style={custom.formInputContainer}>
                                <input placeholder='  Group Name' type="string" style={{...custom.textInput, letterSpacing: 1, borderColor: '#000000' }}
                                       value={name} onChange={this.onChangeFn} />
                            </View>
                            {spacer(20)}
                            <View style={custom.formInputContainer}>
                                <Text style={{}}>Group id: {groupId}</Text>
                            </View>
                        </View>

                        {spacer(30)}
                        {actionButton('CREATE', this.createGroup)}
                        {spacer(30)}
                        <Text style={{ fontSize: 16, color: '#ff3c51' }}>{errorText}</Text>
                        <Text style={{ fontSize: 16, color: '#22a126' }}>{successText}</Text>
                    </View>
                </View>
            </View>
        );
    }
}

const DEFAULT_IMAGE = 'https://images-lb.heloprotocol.in/groupIcon2.png-44779-852270-1581226157839.png';
const MAX_WIDTH = 450;
const custom = {
    root: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        fontFamily: CHAT_FONT_FAMILY,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },

    formInputContainer: {
        marginBottom: 10,
    },
    textInput: {
        fontSize: 16,
        width: 200,
        height: 30,
        outline: 'none',
        paddingLeft: 5,
        border: 0,
        borderBottom: '1px solid',
    },
};
