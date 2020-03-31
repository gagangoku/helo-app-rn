import React from 'react';
import {isSuperAdmin, showToast, spacer, View} from "../../util/Util";
import {
    bodyOverflowAuto,
    copyToClipboard,
    HEIGHT_BUFFER,
    ImageBackground,
    mobileDetect,
    Modal,
    scrollToBottomFn,
    stopBodyOverflow,
    Text,
    WINDOW_INNER_HEIGHT,
    WINDOW_INNER_WIDTH
} from '../../platform/Util';
import {CHAT_FONT_FAMILY, FIREBASE_CHAT_MESSAGES_DB_NAME} from "../../constants/Constants";
import {
    ASK_INPUT,
    ENABLE_SPEECH_RECOGNITION,
    OUTPUT_AUDIO,
    OUTPUT_EXCEL,
    OUTPUT_FILE,
    OUTPUT_ID_CARD,
    OUTPUT_IMAGE,
    OUTPUT_JOB_ACTIONABLE,
    OUTPUT_JOB_BRIEF,
    OUTPUT_JOB_REFERENCE,
    OUTPUT_LOCATION,
    OUTPUT_MISSED_CALL,
    OUTPUT_MULTIPLE_CHOICE,
    OUTPUT_NEW_JOINEE,
    OUTPUT_NONE,
    OUTPUT_PDF,
    OUTPUT_PLACES_AUTOCOMPLETE,
    OUTPUT_PROGRESSIVE_MODULE,
    OUTPUT_SINGLE_CHOICE,
    OUTPUT_SYSTEM_MESSAGE,
    OUTPUT_TASK_LIST,
    OUTPUT_TEXT,
    OUTPUT_VIDEO
} from "../Questions";
import assert from 'assert';
import {MODE_BOT, TOP_BAR_COLOR, WHATSAPP_BACKGROUND_IMAGE} from '../Constants';
import {ConfigurableTopBar, GroupTopBar, MessageForwarderTopBar, PersonalMessagingTopBar} from "./TopBar";
import {InputLine} from '../../platform/InputLine';
import cnsole from 'loglevel';
import {
    AudioMessage,
    BriefJobMessage,
    ExcelMessage,
    FileMessage,
    IDCardMessage,
    ImageMessage,
    JobMessage,
    LocationMessage,
    MissedCallMessage,
    NewJoinee,
    OptionsMessage,
    PdfMessage,
    PlacesAutocompleteMessage,
    ProgressiveModule,
    SystemMessage,
    TaskListMessage,
    TextMessage,
    VideoMessage,
} from './MessageTypes';
import {ContactsPage} from "../contacts/ContactsPage";
import {RecyclerView} from "../../platform/RecyclerView";
import ScrollableList from "../../platform/ScrollableList";


/**
 * UI for bidirectional messaging between user and visitor
 */
export default class MessagingUI extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
        this.state = {
            micListening: false,
            keyboardHeight: 0,
            longpressedIdxMap: [],
            forwardModalOpen: false,
        };
        this.speechDisabledMap = {};

        cnsole.log('MessagingUI constructor: ', props);
    }

    componentDidMount() {
        cnsole.log('MessagingUI componentDidMount: ', this.props);
        stopBodyOverflow();
    }
    componentWillUnmount() {
        bodyOverflowAuto();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        // TODO: Handle the case if message is deleted etc.
        if (mobileDetect().isWeb && prevProps.messages.length < this.props.messages.length) {
            scrollToBottomFn(this.chatRootRef.refElem());
        }
    }

    setRef = (ref) => {
        this.chatRootRef = ref;
        cnsole.log('setRef: ', ref);
        const { msgToScrollTo } = this.props;
        if (msgToScrollTo) {
            // TODO: Scroll to the message
        } else {
            scrollToBottomFn(this.chatRootRef.refElem());
        }
    };

    closeForwardModal = () => this.setState({ forwardModalOpen: false });

    setKeyboardHeightFn = (keyboardHeight) => {
        this.setState({ keyboardHeight });
        mobileDetect().isWeb && this.chatRootRef && scrollToBottomFn(this.chatRootRef.refElem());
    };
    setMicListeningFn = (micListening) => this.setState({ micListening });

    renderMessage = (message, idx) => {
        const { longpressedIdxMap } = this.state;
        const { job, msgKey } = message;

        const highlightMsg = this.props.msgToScrollTo === msgKey;
        const allProps = { ...this.props, message, idx, job, key: idx, onNewMsgFn: this.onNewMsgFn,
                           speechDisabledMap: this.speechDisabledMap, setMicListeningFn: this.setMicListeningFn,
                           highlightMsg, onMessageLongPressed: this.onMessageLongPressed, longpressedIdxMap };

        switch (message.type) {
            case OUTPUT_NONE:
            case OUTPUT_TEXT:
                return <TextMessage {...allProps} />;
            case OUTPUT_PROGRESSIVE_MODULE:
                return <ProgressiveModule {...allProps} />;
            case OUTPUT_IMAGE:
                return <ImageMessage {...allProps} />;
            case OUTPUT_AUDIO:
                return <AudioMessage {...allProps} />;
            case OUTPUT_VIDEO:
                return <VideoMessage {...allProps} />;
            case OUTPUT_PDF:
                return <PdfMessage {...allProps} />;
            case OUTPUT_FILE:
                return <FileMessage {...allProps} />;
            case OUTPUT_LOCATION:
                return <LocationMessage {...allProps} />;
            case OUTPUT_MISSED_CALL:
                return <MissedCallMessage {...allProps} />;
            case OUTPUT_PLACES_AUTOCOMPLETE:
                return <PlacesAutocompleteMessage {...allProps} />;
            case OUTPUT_SINGLE_CHOICE:
            case OUTPUT_MULTIPLE_CHOICE:
                return <OptionsMessage {...allProps} />;
            case OUTPUT_JOB_ACTIONABLE:
            case OUTPUT_JOB_REFERENCE:
                assert(job, 'Actionable Job is required');
                return <JobMessage {...allProps} />;
            case OUTPUT_JOB_BRIEF:
                assert(job, 'Brief Job is required');
                return <BriefJobMessage {...allProps} />;
            case OUTPUT_ID_CARD:
                return <IDCardMessage {...allProps} />;
            case OUTPUT_NEW_JOINEE:
                return <NewJoinee {...allProps} />;
            case OUTPUT_SYSTEM_MESSAGE:
                return <SystemMessage {...allProps} />;
            case OUTPUT_EXCEL:
                return <ExcelMessage {...allProps} />;
            case OUTPUT_TASK_LIST:
                return <TaskListMessage {...allProps} />;

            default:
                cnsole.log('Unknown question type: ', message);
                return null;
        }
    };

    displayMessages = (messages) => {
        const list = [];
        list.push(<View key="spacer-top">{spacer(5)}</View>);
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const m = this.renderMessage(message, i);
            if (m !== null) {
                list.push(m);
            }
        }
        list.push(<View key="spacer-bottom">{spacer(10)}</View>);
        return list;
    };

    onNewMsgFn = async ({ answer, type, ...extra }) => {
        const { messages, mode, onUserMsg } = this.props;
        cnsole.log('onNewMsgFn: ', answer, type, extra);
        this.speechDisabledMap[messages.length - 1] = true;

        switch (type) {
            case OUTPUT_PROGRESSIVE_MODULE:
                onUserMsg({ text: answer, answer, type, ...extra });
                break;
            case OUTPUT_IMAGE:
                onUserMsg({ text: answer, imageUrl: answer, answer, type, ...extra });
                break;
            case OUTPUT_AUDIO:
                onUserMsg({ text: answer, audioUrl: answer, answer, type, ...extra });
                break;
            case OUTPUT_VIDEO:
                onUserMsg({ text: answer, videoUrl: answer, answer, type, ...extra });
                break;
            case OUTPUT_PDF:
            case OUTPUT_FILE:
                onUserMsg({ text: answer, fileUrl: answer, answer, type, ...extra });
                break;
            case OUTPUT_LOCATION:
                onUserMsg({ text: answer, answer, type, ...extra });
                break;
            case OUTPUT_JOB_ACTIONABLE:
                onUserMsg({ text: answer, answer, type, ...extra });
                break;
            case OUTPUT_EXCEL:
                onUserMsg({ text: answer, answer, type, ...extra });
                break;
            case OUTPUT_TASK_LIST:
                onUserMsg({ text: answer, answer, type, ...extra });
                break;

            default:
                onUserMsg({ text: Array.isArray(answer) ? answer.join(', ') : answer, answer, type: OUTPUT_TEXT, ...extra });
                break;
        }

        if (mode === MODE_BOT) {
            this.chatRootRef && scrollToBottomFn(this.chatRootRef.refElem());
        }
    };

    callFn = () => {
        cnsole.log('Calling: ', this.props.otherGuy);
        this.props.callFn();
    };

    cancelAllLongpress = () => {
        this.setState({ longpressedIdxMap: {} });
    };
    trashLongpressed = () => {
        showToast('Coming soon');
        this.cancelAllLongpress();
    };
    onCopyClipboardFn = () => {
        const { longpressedIdxMap } = this.state;
        const { messages } = this.props;
        const m = Object.keys(longpressedIdxMap).sort().map(idx => messages[parseInt(idx)]);
        if (m.length > 0) {
            const tt = m[m.length - 1].text || '';
            copyToClipboard(tt);
            showToast('Copied: ', tt);
        }
        this.cancelAllLongpress();
    };
    forwardLongpressed = () => {
        this.setState({ forwardModalOpen: true });
    };
    onMessageLongPressed = (idx) => {
        const longpressedIdxMap = { ...this.state.longpressedIdxMap };
        if (longpressedIdxMap[idx]) {
            delete longpressedIdxMap[idx];
        } else {
            longpressedIdxMap[idx] = true;
        }
        this.setState({ longpressedIdxMap });
    };
    forwardToFn = (obj) => {
        const { longpressedIdxMap } = this.state;
        cnsole.info('forwardToFn: ', obj, longpressedIdxMap);
        const forwardToFn = this.props.forwardToFn || (() => {});
        const { messages } = this.props;

        const m = Object.keys(longpressedIdxMap).map(idx => messages[parseInt(idx)]);
        forwardToFn({ ...obj, messages: m });
        this.setState({ forwardModalOpen: false });
        this.cancelAllLongpress();
        showToast('Forwarded !');
    };

    topBar = () => {
        const { longpressedIdxMap } = this.state;
        const { collection, topBar } = this.props;
        const { hasAnalytics } = this.props.groupInfo;

        const numLongpressed = Object.keys(longpressedIdxMap).length;
        if (numLongpressed > 0) {
            return <MessageForwarderTopBar goBackFn={this.cancelAllLongpress} numLongpressed={numLongpressed}
                                           onTrashFn={this.trashLongpressed} onForwardFn={this.forwardLongpressed}
                                           onCopyClipboardFn={this.onCopyClipboardFn}
            />;
        }
        if (topBar) {
            return topBar;
        }
        return collection === FIREBASE_CHAT_MESSAGES_DB_NAME ?
            <PersonalMessagingTopBar {...this.props} /> : <GroupTopBar {...this.props} hasAnalytics={hasAnalytics} />;
    };

    render() {
        cnsole.info('MessagingUI render');
        const { me, messages, mode, groupInfo } = this.props;
        const { keyboardHeight, forwardModalOpen, longpressedIdxMap } = this.state;
        const { isAdminPosting, admins } = groupInfo;
        const botMode = mode === MODE_BOT;
        const keyboardInputDisabled = botMode && (messages.length > 0 && messages[messages.length - 1][ASK_INPUT] && messages[messages.length - 1].type !== OUTPUT_TEXT);
        const enableSpeechRecognition = !botMode || (messages.length > 0 && messages[messages.length - 1][ENABLE_SPEECH_RECOGNITION]);

        const messagesWithIdx = messages.map((x, idx) => ({...x, idx}));
        const inputLine = <InputLine onNewMsgFn={this.onNewMsgFn} micListening={this.state.micListening} mode={mode}
                                     me={me} groupInfo={groupInfo}
                                     setKeyboardHeightFn={this.setKeyboardHeightFn}
                                     keyboardInputDisabled={keyboardInputDisabled} enableSpeechRecognition={enableSpeechRecognition} />;
        const adminOnlyText = (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                           fontSize: 15, backgroundColor: '#f4f4f4', color: '#505050', border: '0px solid #000000',
                           height: InputLine.HEIGHT, width: '100%', userSelect: 'none',
            }}>
                <Text>Only admins can send messages</Text>
            </View>
        );

        const INNER_HEIGHT = WINDOW_INNER_HEIGHT - ConfigurableTopBar.HEIGHT - InputLine.HEIGHT - HEIGHT_BUFFER - keyboardHeight;
        const amIAdmin = admins.includes(me.sender) || isSuperAdmin(me.sender);

        mobileDetect().isWeb && cnsole.info('messages: ', messages);
        const messageList = mobileDetect().isWeb ?
            <ScrollableList list={[...messagesWithIdx.map(x => this.renderMessage(x, x.idx)), spacer(5)]}
                            ref={this.setRef} style={{ height: INNER_HEIGHT }} /> :
            <RecyclerView data={messagesWithIdx} longpressedIdxMap={longpressedIdxMap} renderItem={this.renderMessage} inverted={true} />;
        return (
            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <View style={customStyle.paper}>
                    {this.topBar()}

                    <ImageBackground style={{ width: '100%', height: INNER_HEIGHT }} source={{ uri: WHATSAPP_BACKGROUND_IMAGE }}>
                        {messageList}
                    </ImageBackground>

                    <View style={customStyle.inputLine}>
                        {isAdminPosting && !amIAdmin ? adminOnlyText : inputLine}
                    </View>
                </View>

                {forwardModalOpen && <Modal isOpen={forwardModalOpen} visible={forwardModalOpen} isVisible={forwardModalOpen}
                                            backdropOpacity={1} style={{ margin: 0, padding: 0 }}
                                            onRequestClose={this.closeForwardModal} onBackdropPress={this.closeForwardModal}>
                    <View style={{ height: '100%', width: '100%', backgroundColor: '#ffffff', margin: 0, padding: 0,
                                   display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <ContactsPage forwardToFn={this.forwardToFn} />
                    </View>
                </Modal>}
            </View>
        );
    }
}



const INNER_WIDTH_MAX = Math.min(WINDOW_INNER_WIDTH, 450);
const SCR_WIDTH = Math.min(WINDOW_INNER_WIDTH - 2, INNER_WIDTH_MAX);
const customStyle = {
    paper: {
        width: SCR_WIDTH,
        height: '100%',
        fontFamily: CHAT_FONT_FAMILY,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
    },
    topBar: {
        width: SCR_WIDTH,
    },
    topBarText: {
        backgroundColor: TOP_BAR_COLOR,
        color: '#ffffff',
        height: '100%',
        width: '100%',
        lineHeight: '56px',
        fontSize: 18,

        display: 'flex',
        flexDirection: 'row',
    },
    chatRootCtr: {
        paddingLeft: 1,
        paddingRight: 1,
        overflowY: 'scroll',
    },
    chatRoot: {
        // backgroundColor: 'rgb(255, 255, 255, 0.7)',
    },
    inputLine: {
    },
};
