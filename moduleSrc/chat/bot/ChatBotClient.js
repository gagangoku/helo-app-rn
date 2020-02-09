import React, {Fragment} from "react";
import {getCtx, setupDeviceId, View} from "../../util/Util";
import MessagingUI from "../messaging/MessagingUI";
import TouchableAnim from "../../widgets/TouchableAnim";
import {MODE_BOT, TOP_BAR_COLOR} from "../Constants";
import {LANG_ENGLISH, LANG_HINDI, LANG_HINGLISH, LANG_THAI, SENDER_VISITOR} from "../Questions";
import {COOK_ONBOARDING_FLOW, COOK_ONBOARDING_FLOW_NAME, getChatContext} from "./ChatUtil";
import Modal from "react-modal";
import OptionPickerWidget from "../../widgets/OptionPickerWidget";
import uuidv1 from "uuid/v1";
import {WEBSOCKET_URL} from "../../constants/Constants";
import {StepGroupList} from "../../controller/HomePageFlows";
import window from "global";


export default class ChatBotClient extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);

        this.state = {
            messages: [],
            tabValue: 'jobs',
            languageModalOpen: true,
        };
        this.websocket = null;
        this.language = null;
        this.deviceID = null;
        this.uuid = null;
        this.supplyId = null;
    }

    async componentDidMount() {
        this.deviceID = await setupDeviceId();
        this.uuid = uuidv1();
        console.log('ChatBotClient componentDidMount: ', this.deviceID, this.uuid, this.language);
    }

    componentWillUnmount() {
        this.websocket.close();
    }

    connect = () => {
        this.websocket = new WebSocket(WEBSOCKET_URL, 'chat-protocol');
        this.websocket.onopen = () => {
            // Send the context
            const { deviceID, uuid, language } = this;
            const sessionInfo = {...getChatContext(null).sessionInfo, deviceID, uuid, language};
            this.websocket.send(JSON.stringify({ sessionInfo, flowName: COOK_ONBOARDING_FLOW_NAME }));
        };

        this.websocket.onmessage = (e) => {
            console.log('Message:', e.data);
            this.onHeloMsg(e.data);
        };

        this.websocket.onclose = (e) => {
            console.log('Socket is closed. Reconnect will be attempted in 1 second :', e);
            setTimeout(() => this.connect(), 1000);
        };

        this.websocket.onerror = (e) => {
            console.error('Socket encountered error: ', e.message, 'Closing socket');
            this.websocket.close();
        };
    };

    onTriggerUpload = (answer, promise, type) => {};

    onHeloMsg = (heloMessages) => {
        heloMessages = JSON.parse(heloMessages || '{}');
        console.log('onHeloMsg: ', heloMessages);

        const messages = this.state.messages.slice();
        heloMessages.questionsToAsk.forEach(hm => {
            const { text, speak, output, timeDelay, questionKey, type, sender, ...extra } = hm;
            messages.push({
                timestamp: new Date().getTime(),
                language: this.language,
                text: text[this.language],
                speak: speak[this.language],
                type,
                questionKey,
                sender: SENDER_VISITOR,
                ...extra,
            });
        });
        this.setState({ messages });

        if (heloMessages.saveSupplyId) {
            this.supplyId = parseInt(heloMessages.saveSupplyId);
        }
    };

    onUserMsg = async ({ text, type, ...extra }) => {
        console.log('onUserMsg: ', text, type, extra);
        const messages = this.state.messages.slice();
        messages.push({
            timestamp: new Date().getTime(),
            text,
            type,
            sender: SENDER_ME,
            ...extra,
        });
        await new Promise(resolve => this.setState({ messages }, resolve));

        this.websocket.send(JSON.stringify({ text, type, sender: SENDER_VISITOR, ...extra }));
    };
    callFn = () => {};
    openChat = () => {
        if (this.supplyId && this.supplyId > 0) {
            window.open(StepGroupList.URL + '?me=supply:' + this.supplyId, '_blank');
        }
    };

    topBar = () => {
        const s = { width: '50%', textAlign: 'center' };
        const selectedBottom = { borderBottomColor: '#ff0000', borderBottomWidth: 2, borderBottomStyle: 'solid' };
        const jobsStyle = this.state.tabValue === 'jobs' ? selectedBottom : {};
        const chatStyle = this.state.tabValue === 'chat' ? selectedBottom : {};

        const unreadsDiv = <div style={custom.chatUnreadCount}>{1}</div>;
        return (
            <div style={custom.topBarText}>
                <TouchableAnim onPress={() => this.setState({ tabValue: 'jobs' })} style={{...s, ...jobsStyle}}>
                    <div style={{}}>HELO JOBS</div>
                </TouchableAnim>
                <TouchableAnim onPress={this.openChat} style={{...s, ...chatStyle}}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ }}>CHAT</div>
                        {unreadsDiv}
                    </div>
                </TouchableAnim>
            </div>
        );
    };

    languageModal = () => {
        const toggleFn = (language) => {
            console.log('Selected language: ', language);
            this.setState({ languageModalOpen: false });
            this.language = language;
            this.connect();
        };

        return (
            <Modal isOpen={this.state.languageModalOpen} onRequestClose={() => {}}
                   style={modalStyle} onAfterOpen={() => {}} contentLabel="Example Modal">
                <View style={{ width: '100%', maxWidth: MAX_WIDTH }}>
                    <OptionPickerWidget optionList={[LANG_ENGLISH, LANG_HINDI, LANG_HINGLISH, LANG_THAI]} toggleFn={toggleFn}
                                        singleSelection={true} theme={null} key={'lang-modal'} />
                </View>
            </Modal>
        );
    };

    render() {
        const customerId = 1;
        const supplyId = 1;

        const me = {
            role: 'cust',
            id: customerId,
            sender: SENDER_ME,
            avatar: '',
            name: 'Me',
        };
        const heloBot = {
            role: 'supply',
            id: supplyId,
            sender: SENDER_VISITOR,
            avatar: 'https://images-lb.heloprotocol.in/logo-focussed.png-47937-236622-1555160118812.png?name=header.png',
            name: 'HELO',
        };
        const groupInfo = {
            isAdminPosting: false,
            admins: [],
            showMemberAddNotifications: false,
        };

        const chatContext = getChatContext(COOK_ONBOARDING_FLOW);
        return (
            <Fragment>
                <MessagingUI location={this.props.location} history={this.props.history}
                             topBar={this.topBar()} me={me} otherGuy={heloBot}
                             chatContext={chatContext} mode={MODE_BOT} language={this.language}
                             groupInfo={groupInfo} messages={this.state.messages} onUserMsg={this.onUserMsg}
                             onTriggerUpload={this.onTriggerUpload} callFn={this.callFn}
                />
                {this.languageModal()}
            </Fragment>
        );
    }
}

const MAX_WIDTH = 350;
const SENDER_ME = 'me';
const custom = {
    topBarText: {
        backgroundColor: TOP_BAR_COLOR,
        color: '#ffffff',
        height: '100%',
        width: '100%',
        lineHeight: '56px',
        fontSize: 18,

        display: 'flex',
        flexDirection: 'row',
        userSelect: 'none', MozUserSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none',
    },
    chatUnreadCount: {
        fontSize: 10,
        marginLeft: 10,
        height: 18,
        width: 18,
        borderRadius: 9,
        backgroundColor: '#ffffff',
        color: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
};
const modalStyle = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        padding: 5,
    }
};
