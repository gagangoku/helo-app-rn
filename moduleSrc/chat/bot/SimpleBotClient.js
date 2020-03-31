import React, {Fragment} from "react";
import MessagingUI from "../messaging/MessagingUI";
import {MODE_BOT, TOP_BAR_COLOR} from "../Constants";
import {ENABLE_SPEECH_RECOGNITION, LANG_ENGLISH, SENDER_VISITOR} from "../Questions";
import {COOK_ONBOARDING_FLOW, getChatContext} from "./ChatUtil";
import {WEBSOCKET_URL} from "../../constants/Constants";
import cnsole from 'loglevel';
import {ConfigurableTopBar} from "../messaging/TopBar";
import {showToast} from "../../platform/Util";
import {sendMessageToGroup} from "../../util/Util";


export class SimpleBotClient extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
        };
        this.websocket = null;
        this.reconnectDelay = 0;
    }

    async componentDidMount() {
        this.connect();
    }

    componentWillUnmount() {
        this.websocket.close();
    }

    connect = () => {
        this.websocket = new WebSocket(WEBSOCKET_URL + '/bot/' + this.props.botName, 'chat-protocol');
        this.websocket.onopen = () => {
            // Send the context
            // this.websocket.send(JSON.stringify({  }));
        };

        this.websocket.onmessage = (e) => {
            cnsole.log('Message:', e.data);
            this.onHeloMsg(e.data);
        };

        this.websocket.onclose = (e) => {
            this.reconnectDelay = Math.max(5000, this.reconnectDelay + 300);
            cnsole.warn('Socket is closed. Reconnect will be attempted in :', this.reconnectDelay, e);
            setTimeout(() => this.connect(), this.reconnectDelay);
        };

        this.websocket.onerror = (e) => {
            cnsole.error('Socket encountered error, closing: ', e.message);
            this.websocket.close();
        };
    };

    onHeloMsg = (heloMessages) => {
        heloMessages = JSON.parse(heloMessages || '{}');
        cnsole.info('onHeloMsg: ', heloMessages);

        const messages = this.state.messages.slice();
        heloMessages.forEach(hm => {
            const { text, speak, output, timeDelay, questionKey, type, sender, ...extra } = hm;
            messages.push({
                timestamp: new Date().getTime(),
                text,
                type,
                questionKey,
                sender: SENDER_VISITOR,
                [ENABLE_SPEECH_RECOGNITION]: true,          // HACK: to enable mic recorder
                ...extra,
            });
        });
        this.setState({ messages });
    };

    onUserMsg = async ({ text, type, ...extra }) => {
        cnsole.log('onUserMsg: ', text, type, extra);
        const messages = this.state.messages.slice();
        messages.push({
            timestamp: new Date().getTime(),
            text,
            type,
            sender: SENDER_ME,
            [ENABLE_SPEECH_RECOGNITION]: true,          // HACK: to enable mic recorder
            ...extra,
        });
        await new Promise(resolve => this.setState({ messages }, resolve));

        this.websocket.send(JSON.stringify({ text, type, sender: SENDER_VISITOR, ...extra }));
    };

    callFn = () => {};
    onTriggerUpload = (answer, promise, type) => {};

    topBar = () => {
        const sections = [
            { float: 'left', name: ConfigurableTopBar.SECTION_BACK, displayProps: {}, data: {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_AVATAR, displayProps: {}, data: { avatar: BOT_LOGO }, onClickFn: () => {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_NAME, displayProps: {}, data: { name: 'Helo Bot', subheading: 'Get more done with voice', }, onClickFn: () => {} },
        ];
        return (
            <ConfigurableTopBar collection={null} sections={sections}
                                location={this.props.location} history={this.props.history} />
        );
    };

    forwardToFn = async ({ roleId, groupId, messages }) => {
        cnsole.info('forwardToFn: ', { roleId, groupId, messages });
        const { me, idToDocMap } = this.props;
        if (!idToDocMap) {
            showToast('BAD: idToDocMap doesnt exist');
            return;
        }

        const g = groupId || [me.sender, roleId].sort().join(',');
        if (!idToDocMap[g]) {
            cnsole.warn('BAD: idToDocMap doesnot have: ', g, idToDocMap);
            return;
        }

        for (let i = 0; i < messages.length; i++) {
            const m = {...messages[i]};
            delete m.sender;

            const { docRef, groupInfo } = idToDocMap[g];
            await this.sendMessage({ updateLastReadIdx: false, docRef, groupInfo, groupId: g, ...m });
        }

        showToast('Forwarded !');
    };
    sendMessage = async ({ docRef, groupInfo, groupId, updateLastReadIdx, text, type, answer, ...extra }) => {
        const { me, ipLocation, idToDetails } = this.props;
        await sendMessageToGroup({ me, ipLocation, idToDetails, docRef, groupInfo, groupId, updateLastReadIdx, text, type, answer, ...extra });
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
                             chatContext={chatContext} mode={MODE_BOT} language={LANG_ENGLISH}
                             forwardToFn={this.forwardToFn}
                             groupInfo={groupInfo} messages={this.state.messages} onUserMsg={this.onUserMsg}
                             onTriggerUpload={this.onTriggerUpload} callFn={this.callFn}
                />
            </Fragment>
        );
    }
}

const BOT_LOGO = 'https://cdn3.iconfinder.com/data/icons/chat-bot-emoji-blue-filled-color/300/14134081Untitled-3-512.png';
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
