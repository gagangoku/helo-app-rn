import React, {Fragment} from "react";
import {
    actionButton,
    getAllInfoRelatedToGroup,
    getCtx,
    getDetailsFromPhone,
    getPersonDetails,
    getUrlParam,
    haversineDistanceKms,
    initWebPush,
    isDebugMode,
    isUserPartOfGroup,
    latLonFn,
    setupDeviceId,
    spacer,
    View
} from "../../util/Util";
import GroupMessages from "./GroupMessages";
import {
    BANGALORE_LAT,
    BANGALORE_LNG,
    CHAT_FONT_FAMILY,
    DESCRIPTOR_VISITOR,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME,
    PHONE_NUMBER_KEY
} from "../../constants/Constants";
import {AsyncStorage, confirmAlert, Modal, WINDOW_INNER_WIDTH} from '../../platform/Util';
import {crudsCreate, crudsSearch, getLocationFromIPAddress, getOtp, logDataToServer, verifyOtp} from "../../util/Api";
import {USER_BACKGROUND_COLOR_DARK} from "../Constants";
import {firebase} from '../../platform/firebase';
import window from 'global';
import GA from "../../util/GoogleAnalytics";
import {OUTPUT_NEW_JOINEE, OUTPUT_PROGRESSIVE_MODULE} from "../Questions";
import format from 'string-format';
import {GROUP_URLS} from "../../controller/Urls";
import cnsole from 'loglevel';


export class GroupJoinPage extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            init: false,
            userDetails: null,
            groupInfo: null,
            ipLocationResponse: null,
        };
        this.observer = null;
        this.idToDetails = {};
    }

    async componentDidMount() {
        const startTimeMs = new Date().getTime();
        const groupId = this.getGroupId();
        const collection = FIREBASE_GROUPS_DB_NAME;
        const isDebug = isDebugMode();

        this.deviceID = await setupDeviceId();
        const ipLocationPromise = getLocationFromIPAddress(this.deviceID);
        const userDetailsPromise = getDetailsFromPhone();

        const cbFn = async ({ groupInfo }) => {
            this.setState({ groupInfo });

            await getPersonDetails(this.idToDetails, groupInfo.members, groupInfo.filteredMessages);
            this.setState({ idToDetails: this.idToDetails });
        };
        const groupInfoPromise = new Promise(async resolve => {
            const { docRef, groupInfo, observer } = await getAllInfoRelatedToGroup({ collection, groupId, cbFn, isDebug, ipLocationPromise });
            this.observer = observer;
            this.docRef = docRef;
            resolve(groupInfo);
        });

        const _obbj = await Promise.all([userDetailsPromise, groupInfoPromise]);
        cnsole.info('_obbj: ', _obbj);
        const [userDetails, groupInfo] = _obbj;
        cnsole.log('Getting userDetails & groupInfo took: ', new Date().getTime() - startTimeMs);

        const ipLocationResponse = await ipLocationPromise;
        cnsole.log('Got ip address location: ', ipLocationResponse);

        this.setState({ init: true, userDetails, groupInfo, ipLocationResponse });
        cnsole.log('GroupJoinPage userDetails, groupInfo, ipLocationResponse: ', userDetails, groupInfo, ipLocationResponse);

        const { phone, name, role, id } = userDetails;
        const roleId = role + ':' + id;
        const { members } = groupInfo;
        await getPersonDetails(this.idToDetails, [roleId], groupInfo.filteredMessages);
        this.setState({ idToDetails: this.idToDetails });

        // Track source
        const sourceParam = getUrlParam('source') || 'empty';
        const label = id && role ? roleId : this.deviceID;
        GA.event({ category: 'source', action: sourceParam, label });

        // TODO: Uncomment when testing
        // setTimeout(() => createJobOpening(db), 2000);
        // setTimeout(() => createVideoMsg(db), 2000);
        // setTimeout(() => createGroup(db, 'box8-indiranagar', 'Box8 - Indiranagar'), 2000);
        // setTimeout(() => createVideoTrainingMessages(db), 2000);
        // setTimeout(() => findPrivateConversations(db), 2000);
        // setTimeout(() => deleteSelectedConversations(db, 1675, 3), 2000);
        // setTimeout(() => findDuplicatedVisitors(db), 2000);

        if (phone && name && members.includes(roleId)) {
            await this.initializeWebPushAndChatBot();
        }
        cnsole.log('GroupJoinPage componentDidMount finished: ', new Date().getTime() - startTimeMs);
    }
    componentWillUnmount() {
        this.observer && this.observer();        // Unsubscribe
    }

    getGroupId = () => this.props.group || this.props.groupId || this.contextObj.group || getUrlParam('group');
    getMsgKey = () => this.props.msgKey || this.contextObj.msgKey || getUrlParam('msgKey');

    joinFn = async ({phone, id, name, role}) => {
        const { groupInfo } = this.state;
        const members = groupInfo.members;

        this.setState({ userDetails: { phone, id, name, role } });

        const roleId = role + ':' + id;
        if (!members.includes(roleId)) {
            const groupId = this.getGroupId();
            this.docRef.update({
                members: firebase.firestore.FieldValue.arrayUnion(roleId),
            });

            members.push(roleId);
            this.setState({ groupInfo: {...groupInfo} });

            // New person joined the group
            await this.newJoineePostProcess({id, name, role});
        }

        await this.initializeWebPushAndChatBot();
    };

    newJoineePostProcess = async ({id, name, role}) => {
        const newMsgPayload = {
            timestamp: new Date().getTime(),
            type: OUTPUT_NEW_JOINEE,
            sender: role + ':' + id,
        };
        if (this.state.ipLocationResponse) {
            const { latitude, longitude } = this.state.ipLocationResponse;
            newMsgPayload.loc = { latitude, longitude };
        }
        this.docRef.update({
            messages: firebase.firestore.FieldValue.arrayUnion(newMsgPayload),
        });
    };

    initializeWebPushAndChatBot = async () => {
        await this.initializeWebPush();

        cnsole.log('GroupJoinPage checking for chat bot');
        setTimeout(this.chatBotRedirectConfirm, 1000);
    };

    initializeWebPush = async () => {
        cnsole.log('initializeWebPush called');
        const perm = window.Notification && window.Notification.permission;
        cnsole.log('Notification.permission: ', perm);
        const deviceID = await setupDeviceId();

        await new Promise(async resolve => {
            switch (perm) {
                case 'default':
                    confirmAlert({
                        willUnmount: () => {
                            cnsole.log('willUnmount');
                            resolve();
                        },
                        onClickOutside: () => {
                            cnsole.log('onClickOutside');
                            resolve();
                        },
                        onKeypressEscape: () => {
                            cnsole.log('onKeypressEscape');
                            resolve();
                        },
                        customUI: ({ onClose }) => {
                            const fn = async () => {
                                onClose();
                                resolve();
                            };
                            const yesFn = async () => {
                                GA.event({ category: 'group-notification', action: 'allow', label: deviceID });
                                await initWebPush(true);       // Initiate web push notification request
                                await fn();
                            };
                            const noFn = async () => {
                                GA.event({ category: 'group-notification', action: 'block', label: deviceID });
                                await fn();
                            };

                            return <NotificationPerm yesFn={yesFn} noFn={noFn} />
                        }
                    });
                    break;

                case 'denied':
                    // TODO: Open chrome://settings/content/notifications and allow them to change
                    await initWebPush(false);
                    resolve();
                    break;

                case 'granted':
                default:
                    // TODO: Handle expiration properly. This is a hack for now - forcefully re-saving the subscription
                    await initWebPush(true);
                    resolve();
                    break;
            }
        });
    };

    chatBotRedirectConfirm = async () => {
        cnsole.log('chatBotRedirectConfirm called');
        let isCityBangalore = false;
        const deviceID = this.deviceID;
        const { ipLocationResponse, groupInfo } = this.state;

        if (ipLocationResponse.latitude && ipLocationResponse.longitude) {
            const dist = haversineDistanceKms(ipLocationResponse, latLonFn(BANGALORE_LAT, BANGALORE_LNG));
            isCityBangalore = dist <= 20;

            cnsole.log('deviceID, ipLocationResponse, isCityBangalore: ', deviceID, ipLocationResponse, isCityBangalore);
            try {
                logDataToServer({deviceID, ipLocationResponse, isCityBangalore});
            } catch (e) {
                cnsole.log('Error in logging location to server: ', e);
            }
        }

        if (isCityBangalore && groupInfo.allowChatBotPromptForJobs) {
            await new Promise(resolve => setTimeout(resolve, 1000));

            await new Promise(async resolve => {
                confirmAlert({
                    willUnmount: () => {
                        cnsole.log('willUnmount');
                        resolve();
                    },
                    onClickOutside: () => {
                        cnsole.log('onClickOutside');
                        resolve();
                    },
                    onKeypressEscape: () => {
                        cnsole.log('onKeypressEscape');
                        resolve();
                    },
                    customUI: ({onClose}) => {
                        const fn = async () => {
                            onClose();
                            resolve();
                        };
                        const yesFn = async () => {
                            GA.event({category: 'group-chat-bot-prompt', action: 'ok', label: deviceID});
                            this.takeToChatBot();
                            await fn();
                        };
                        const noFn = async () => {
                            GA.event({category: 'group-chat-bot-prompt', action: 'no', label: deviceID});
                            await fn();
                        };

                        return <GotoChatBotPrompt yesFn={yesFn} noFn={noFn}/>
                    }
                });
            });
        }
    };

    takeToChatBot = () => {
        window.open(GROUP_URLS.chatBot, '_blank');
    };

    bellFn = ({ me, groupId, collection }) => {
        cnsole.log('bellFn: ', me, groupId, collection);
    };
    leaderboardFn = ({ idx, message, me, groupId, collection, moduleName }) => {
        cnsole.log('leaderboardFn: ', idx, message, me, groupId, collection);
        const { photo, name, members } = this.state.groupInfo;

        const url = format('{}/?idx={}&me={}&groupId={}&collection={}&groupName={}&groupPhoto={}&moduleName={}&members={}',
            GROUP_URLS.leaderboard, idx, me.sender, groupId, collection, name, encodeURIComponent(photo), moduleName || '', members.join(','));
        window.open(url, '_blank');
    };

    goBackFn = () => window.open(GROUP_URLS.groupList);

    render() {
        const { init, userDetails, groupInfo, ipLocationResponse, idToDetails } = this.state;
        if (!init) {
            return <View />;
        }

        const msgKey = this.getMsgKey();
        const groupId = this.getGroupId();
        const { phone, id, name, role } = userDetails;
        const me = {
            role,
            id,
            sender: role + ':' + id,
            avatar: '',
            name,
        };

        const { members } = groupInfo;
        const isLoginModalOpen = !phone || !name || !isUserPartOfGroup(me.sender, members);
        return (
            <Fragment>
                <GroupMessages location={this.props.location} history={this.props.history} key={'msg'}
                               goBackFn={this.goBackFn}
                               ipLocation={ipLocationResponse} msgToScrollTo={msgKey}
                               bellFn={this.bellFn} leaderboardFn={this.leaderboardFn}
                               groupInfo={groupInfo} docRef={this.docRef}
                               idToDetails={idToDetails}
                               me={me} collection={FIREBASE_GROUPS_DB_NAME} groupId={groupId} />

                <Modal isOpen={isLoginModalOpen} onRequestClose={() => {}}
                       style={modalStyle} onAfterOpen={() => {}} contentLabel="Example Modal">
                    <LoginModal joinFn={this.joinFn} groupId={groupId}
                                phone={phone} name={name} />
                </Modal>
            </Fragment>
        );
    }
}

class NotificationPerm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { yesFn, noFn } = this.props;
        return (
            <div style={custom.confirmDialog.div}>
                <h1 style={custom.confirmDialog.h1}>Press ALLOW for latest information</h1>
                <p style={custom.confirmDialog.p}>You will receive notifications when someone responds to you</p>
                <p style={custom.confirmDialog.p}>इससे आपको नोटिफिकेशन आ जाएगी |</p>
                <p style={custom.confirmDialog.p}>ಯಾರಾದರೂ ನಿಮಗೆ ಪ್ರತಿಕ್ರಿಯಿಸಿದಾಗ ನೀವು ಅಧಿಸೂಚನೆಗಳನ್ನು ಸ್ವೀಕರಿಸುತ್ತೀರಿ</p>
                <button style={custom.confirmDialog.button} onClick={yesFn}>ALLOW</button>
                <button style={custom.confirmDialog.button} onClick={noFn}>BLOCK</button>
            </div>
        );
    }
}

class GotoChatBotPrompt extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { yesFn, noFn } = this.props;
        return (
            <div style={custom.confirmDialog.div}>
                <h1 style={{ ...custom.confirmDialog.h1, fontSize: 22 }}>See 100+ jobs near you</h1>
                <p style={custom.confirmDialog.p}>Apne aas pass ka kaam dekhein</p>
                <p style={custom.confirmDialog.p}>अपने आस पास का काम देखें</p>
                <button style={custom.confirmDialog.button} onClick={yesFn}>OK</button>
                <button style={custom.confirmDialog.button} onClick={noFn}>NO</button>
            </div>
        );
    }
}


class LoginModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.name || '',
            phoneNum: this.props.phone || '',
            otpGot: '',
            otpEntered: '',
            errorMsg: '',
        };
        this.otpRef = React.createRef();
    }

    joinFn = async () => {
        const phone = this.state.phoneNum;
        const { otpGot, otpEntered, name } = this.state;

        if (this.props.name && this.props.phone) {
            const { id, role } = await getDetailsFromPhone();
            this.props.joinFn({ phone, name, id, role });
            return;
        }

        if (name.length < 3 || phone.length !== 10) {
            return;
        }

        if (!otpGot) {
            const otpGot = await new Promise((resolve, error) => getOtp(phone, 'visitor', resolve, error));
            // const otpGot = '111111';     // For testing
            await new Promise(resolve => this.setState({ otpGot }, resolve));
            this.otpRef.current && this.otpRef.current.focus();
            return;
        }

        try {
            const otpResponse = await new Promise((resolve, error) => verifyOtp(phone, otpEntered, resolve, error));
            // const otpResponse = otpEntered === otpGot ? 'ok' : 'no';     // For testing
            if (otpResponse === 'ok') {
                // OTP Verified. Save the phone number
                await AsyncStorage.setItem(PHONE_NUMBER_KEY, phone);
                const deviceID = await setupDeviceId();

                const { id, role } = await getDetailsFromPhone();
                if (!role) {
                    const createResponse = await crudsCreate(DESCRIPTOR_VISITOR, { phone, name, deviceID });
                    const id2 = parseInt(createResponse.split(' ')[1]);
                    cnsole.log('Created new visitor id: ', id2);
                    this.props.joinFn({ phone, name, id: id2, role: 'visitor' });
                } else {
                    this.props.joinFn({ phone, name, id, role });
                }
            } else {
                throw 'otp mismatch';
            }
        } catch (e) {
            this.setState({ errorMsg: 'Wrong / गलत OTP' });
        }
    };

    onChangePhoneFn = (elem) => {
        if (elem.target.value.length <= 10) {
            this.setState({ phoneNum: elem.target.value });
        }
    };
    onChangeOtpFn = (elem) => {
        if (elem.target.value.length <= 6) {
            this.setState({ otpEntered: elem.target.value, errorMsg: '' });
        }
    };

    render() {
        const name = this.state.name || '';
        const phoneNum = this.state.phoneNum || '';
        const nameDisabled = this.props.name ? { 'disabled': true } : {};
        const phoneDisabled = this.props.phone ? { 'disabled': true } : {};
        const otpEntered = this.state.otpEntered || '';
        const nameBorderColor = name.length < 3 ? BORDER_COLOR_RED : BORDER_COLOR_GRAY;
        const phoneBorderColor = phoneNum.length !== 10 ? BORDER_COLOR_RED : BORDER_COLOR_GRAY;
        const otpBorderColor = this.state.otpGot && otpEntered.length !== 6 ? BORDER_COLOR_RED : BORDER_COLOR_GRAY;
        const btnStyle = name.length < 3 || phoneNum.length !== 10 ? { backgroundColor: BORDER_COLOR_GRAY } : { backgroundColor: COLOR_BLUE };
        const btnText = (this.props.name && this.props.phone) || this.state.otpGot ? 'JOIN / जोईन' : 'OTP भेजो';
        const otpFieldDisabled = !this.state.otpGot ? 'disabled' : '';

        const welcomeTitle = (
            <div style={{...custom.formInputContainer, textAlign: 'center', color: COLOR_BLUE}}>
                See jobs near you and make friends
                <br/>
                पास का काम देखें और दोस्त बनाएं
            </div>
        );

        const otpSection = this.props.name && this.props.phone ? '' : (
            <div style={custom.formInputContainer}>
                <input placeholder='  OTP' type="number" style={{...custom.textInput, letterSpacing: 5, textAlign: 'center', borderColor: otpBorderColor}}
                       disabled={otpFieldDisabled}
                       value={this.state.otpEntered} onChange={this.onChangeOtpFn} ref={this.otpRef} />
            </div>
        );
        return (
            <div style={custom.root}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20 }}>
                    <div style={custom.formInputContainer}>
                        <input placeholder='  Name' type="string" style={{...custom.textInput, letterSpacing: 1, borderColor: nameBorderColor}}
                               value={this.state.name} {...nameDisabled} onChange={(elem) => this.setState({ name: elem.target.value })} />
                    </div>
                    <div style={custom.formInputContainer}>
                        <input placeholder='  Phone' type="number" style={{...custom.textInput, letterSpacing: 2, borderColor: phoneBorderColor}}
                               value={phoneNum} {...phoneDisabled} onChange={this.onChangePhoneFn} />
                    </div>

                    {otpSection}
                    <div style={custom.errorMsg}>{this.state.errorMsg}</div>

                    {spacer(20)}
                    {actionButton(btnText, this.joinFn, { width: 100, height: 50, style: btnStyle})}
                </div>
            </div>
        );
    }
}

const BORDER_COLOR_RED = '#ff8b4a';
const BORDER_COLOR_GRAY = '#b9b9b9';
const COLOR_BLUE = USER_BACKGROUND_COLOR_DARK;
const custom = {
    root: {
        fontFamily: CHAT_FONT_FAMILY,
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
        border: '1px solid',
    },
    errorMsg: {
        textAlign: 'center',
        color: 'red',
    },

    confirmDialog: {
        div: {
            fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
            textAlign: 'center',
            width: Math.min(300, WINDOW_INNER_WIDTH * 0.8),
            padding: 40,
            background: '#FFF',
            boxShadow: '0 20px 75px rgba(0, 0, 0, 0.23)',
            color: '#fff',
        },
        h1: {
            marginTop: 0,
            marginBottom: 30,
            fontSize: 19,
            color: '#666',
            textAlign: 'center',
            wordWrap: 'break-word',
        },
        p: {
            opacity: 0.8,
            fontSize: 14,
            color: '#666',
            letterSpacing: '0.48px',
            textAlign: 'center',
            marginBottom: 5,
        },
        button: {
            width: 80,
            height: 40,
            padding: 10,
            border: '0.3px solid #333',
            borderRadius: 5,
            margin: 10,
            marginTop: 20,
            cursor: 'pointer',
            background: '#333',
            color: 'white',
            fontSize: 14,
        },
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


// Useful in creating job openings
const createJobOpening = async (db) => {
    cnsole.log('createJobOpening');
    const doc = db.collection(FIREBASE_GROUPS_DB_NAME).doc('restaurant-jobs-india');
    const baseDoc = await doc.get();
    cnsole.log('Got baseDoc: ', baseDoc);

    const messages = baseDoc.data().messages;
    cnsole.log('messages: ', messages);

    const jobMsg = {
        job: {
            company: 'Ola',
            location: 'Bangalore',
            phone: '9008781096',
            pic: 'https://images-lb.heloprotocol.in/ola.png-42697-954266-1574953717282.png',
            position: 'CDP / Commi 1,2,3',
            likes: 10,
            desc: [
                '12 Commis needed, salary - Rs 18,000',
                '12 Helpers needed, salary - Rs 12,000',
                'Food provided',
                'Joining bonus: Rs 2000 जोइन करने पे',
            ],
        },
        sender: 'supply:352',
        text: 'Good salary',
        timestamp: new Date().getTime(),
        type: 'job-brief',
        msgKey: 'j2',
    };
    const msg1 = {
        sender: 'supply:352',
        text: 'Job in Bangalore. Very good salary ☝️ biggest restaurant bangalore',
        timestamp: new Date().getTime(),
        type: 'text',
    };
    cnsole.log('jobMsg: ', jobMsg);

    await doc.update({
        messages: firebase.firestore.FieldValue.arrayUnion(jobMsg, msg1),
    });
};
const createVideoMsg = async (db) => {
    cnsole.log('createVideoMsg');
    const doc = db.collection(FIREBASE_GROUPS_DB_NAME).doc('restaurant-jobs-india');
    const baseDoc = await doc.get();
    cnsole.log('Got baseDoc: ', baseDoc);

    const messages = baseDoc.data().messages;
    cnsole.log('messages: ', messages);

    const videoMsg = {
        sender: 'supply:352',
        text: '',
        timestamp: new Date().getTime(),
        type: 'video',
        videoUrl: 'https://helloeko.com/buzzfeed-tasty-eko-fast/biscuit-fast/embed?autoplay=true',
    };
    cnsole.log('videoMsg: ', videoMsg);

    await doc.update({
        messages: firebase.firestore.FieldValue.arrayUnion(videoMsg),
    });
};
const createGroup = async (db, groupId, name) => {
    cnsole.log('createGroup');
    const doc = db.collection(FIREBASE_GROUPS_DB_NAME).doc(groupId);
    await doc.set({
        desc: '',
        lastReadIdx: {},
        members: ['supply:352'],
        messages: [{
            text: 'Hi',
            sender: 'supply:352',
            timestamp: new Date().getTime(),
            type: 'text',
        }],
        muters: [],
        name,
        photo: 'https://d1jj0nsekkethp.cloudfront.net/20200118010213/assets/images/logo.png',
        watchers: [],

        isPrivate: true,
        hasAnalytics: true,
        isAdminPosting: true,
        showMemberAddNotifications: true,
        allowChatBotPromptForJobs: false,
    });
    const baseDoc = await doc.get();
    cnsole.log('Got baseDoc: ', baseDoc);

    createVideoTrainingMessages(db, groupId);
};
const findPrivateConversations = async (db) => {
    cnsole.log('findPrivateConversations');
    const snapshot = await db.collection(FIREBASE_CHAT_MESSAGES_DB_NAME).get();
    snapshot.forEach(doc => {
        const messages = doc.data().messages;
        cnsole.log('doc: ', doc.id, messages.length);
    });
};
const deleteSelectedConversations = async (db, startIdx, numItems) => {
    cnsole.log('deleteSelectedConversations');
    const doc = db.collection(FIREBASE_GROUPS_DB_NAME).doc('restaurant-jobs-india');
    const baseDoc = await doc.get();
    cnsole.log('Got baseDoc: ', baseDoc);

    const messages = baseDoc.data().messages;
    cnsole.log('messages: ', messages);

    const msgCopy = messages.slice();
    const removed = msgCopy.splice(startIdx, numItems);
    await doc.update({
        messages: msgCopy,
    });
};
const findDuplicatedVisitors = async (db) => {
    cnsole.log('findDuplicatedVisitors');

    const visitors = await crudsSearch(DESCRIPTOR_VISITOR, {});
    cnsole.log('visitors: ', visitors);

    const phoneNumberToIds = {};
    for (let i = 0; i < visitors.length; i++) {
        const {id, phone} = visitors[i];
        if (i+1 !== parseInt(id)) {
            cnsole.log('Bad record: ', i, visitors[i]);
            continue;
        }
        if (!phoneNumberToIds[phone]) {
            phoneNumberToIds[phone] = [];
        }
        phoneNumberToIds[phone].push(parseInt(id));
    }

    const idsToRemove = [];
    Object.values(phoneNumberToIds).forEach(vals => {
        if (vals.length > 1) {
            vals.slice(1, vals.length).forEach(v => {
                idsToRemove.push(v);
            });
        }
    });

    cnsole.log('phoneNumberToIds: ', phoneNumberToIds);
    cnsole.log('idsToRemove: ', idsToRemove);

    const doc = db.collection(FIREBASE_GROUPS_DB_NAME).doc('restaurant-jobs-india');
    const baseDoc = await doc.get();
    cnsole.log('Got baseDoc: ', baseDoc);

    const messages = baseDoc.data().messages;
    cnsole.log('messages: ', messages);

    const filteredMessages = messages.filter(m => {
        const { sender, type } = m;
        const [role, id] = sender.split(':');
        if (type === 'new-joinee' && role === 'visitor' && idsToRemove.includes(parseInt(id))) {
            return false;
        }
        return true;
    });
    cnsole.log('filteredMessages: ', filteredMessages);

    await doc.update({
        messages: filteredMessages,
    });

    cnsole.log('DELETE from Visitor where id IN (', idsToRemove.join(', '), ')');
};
const createVideoTrainingMessages = async (db, groupId) => {
    cnsole.log('createVideoTrainingMessages');
    const doc = db.collection(FIREBASE_GROUPS_DB_NAME).doc(groupId);
    const baseDoc = await doc.get();
    cnsole.log('Got baseDoc: ', baseDoc);

    const messages = baseDoc.data().messages;
    cnsole.log('messages: ', messages);

    const newMessages = [{
        imageUrl: 'https://images-lb.heloprotocol.in/liq.png-434036-969878-1580287698109.png',
        videoUrl: 'https://videos-lb.heloprotocol.in/5-bartender-v1.m4v-137295685-954600-1580286556619.mp4',
        duration: 497,
        sender: 'supply:352',
        text: 'Bar training',
        timestamp: new Date().getTime(),
        type: OUTPUT_PROGRESSIVE_MODULE,
    }, {
        imageUrl: 'https://images-lb.heloprotocol.in/2020-01-23.png-196516-382137-1579704499055.png',
        videoUrl: 'https://videos-lb.heloprotocol.in/2-kitchen-v1.m4v-51416658-709718-1580286284768.mp4',
        duration: 191,
        sender: 'supply:352',
        text: 'Hygiene',
        timestamp: new Date().getTime(),
        type: OUTPUT_PROGRESSIVE_MODULE,
    }, {
        imageUrl: 'https://images-lb.heloprotocol.in/pic1.png-242499-262692-1580311145442.png',
        videoUrl: 'https://videos-lb.heloprotocol.in/1-org-chart-v1.m4v-8542024-176447-1580310739922.mp4',
        duration: 75,
        sender: 'supply:352',
        text: 'Organization chart',
        timestamp: new Date().getTime(),
        type: OUTPUT_PROGRESSIVE_MODULE,
    }, {
        imageUrl: 'https://images-lb.heloprotocol.in/pic2.png-1115255-547908-1580311178844.png',
        videoUrl: 'https://videos-lb.heloprotocol.in/4-storage-v1.m4v-22097664-836950-1580310787055.mp4',
        duration: 87,
        sender: 'supply:352',
        text: 'Food storage',
        timestamp: new Date().getTime(),
        type: OUTPUT_PROGRESSIVE_MODULE,
    }];
    cnsole.log('newMessages: ', newMessages);

    await doc.update({
        messages: firebase.firestore.FieldValue.arrayUnion(...newMessages),
    });
};
