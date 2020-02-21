import React from 'react';
import {getCtx, spacer, View} from "../../util/Util";
import {
    bodyOverflowAuto,
    HEIGHT_BUFFER,
    ImageBackground,
    scrollToBottomFn,
    stopBodyOverflow,
    Text,
    WINDOW_INNER_HEIGHT,
    WINDOW_INNER_WIDTH
} from '../../platform/Util';
import {CHAT_FONT_FAMILY, FIREBASE_CHAT_MESSAGES_DB_NAME, GROUPS_SUPER_ADMINS} from "../../constants/Constants";
import {
    ASK_INPUT,
    ENABLE_SPEECH_RECOGNITION,
    OUTPUT_AUDIO,
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
    OUTPUT_TEXT,
    OUTPUT_VIDEO
} from "../Questions";
import assert from 'assert';
import {MODE_BOT, TOP_BAR_COLOR, WHATSAPP_BACKGROUND_IMAGE} from '../Constants';
import {ConfigurableTopBar, GroupTopBar, PersonalMessagingTopBar} from "./TopBar";
import {InputLine} from '../../platform/InputLine';
import cnsole from 'loglevel';
import {
    AudioMessage,
    BriefJobMessage,
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
    TextMessage,
    VideoMessage,
} from './MessageTypes';
import ScrollableList from "../../platform/ScrollableList";


/**
 * UI for bidirectional messaging between user and visitor
 */
export default class MessagingUI extends React.PureComponent {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);

        this.state = {
            micListening: false,
            keyboardHeight: 0,
        };
        this.speechDisabledMap = {};
        this.chatRootRef = React.createRef();

        cnsole.log('MessagingUI constructor: ', props);
    }

    componentDidMount() {
        cnsole.log('MessagingUI componentDidMount: ', this.props);
        const { msgToScrollTo } = this.props;
        if (msgToScrollTo) {
            // TODO: Scroll to the message
        } else {
            // TODO: Scroll to the last read message
            scrollToBottomFn(this.chatRootRef.current.refElem());
        }
        stopBodyOverflow();
    }
    componentWillUnmount() {
        bodyOverflowAuto();
    }

    setKeyboardHeightFn = (keyboardHeight) => this.setState({ keyboardHeight });
    setMicListeningFn = (micListening) => this.setState({ micListening });

    renderMessage = (message, idx) => {
        const { job, msgKey } = message;

        const highlightMsg = this.props.msgToScrollTo === msgKey;
        const allProps = { ...this.props, message, idx, job, key: idx, onNewMsgFn: this.onNewMsgFn,
                           speechDisabledMap: this.speechDisabledMap, setMicListeningFn: this.setMicListeningFn,
                           highlightMsg };

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
        cnsole.log('onNewMsgFn: ', answer, type, extra);
        this.speechDisabledMap[this.props.messages.length - 1] = true;

        switch (type) {
            case OUTPUT_PROGRESSIVE_MODULE:
                this.props.onUserMsg({ text: answer, answer, type, ...extra });
                break;
            case OUTPUT_IMAGE:
                this.props.onUserMsg({ text: answer, imageUrl: answer, answer, type, ...extra });
                break;
            case OUTPUT_AUDIO:
                this.props.onUserMsg({ text: answer, audioUrl: answer, answer, type, ...extra });
                break;
            case OUTPUT_VIDEO:
                this.props.onUserMsg({ text: answer, videoUrl: answer, answer, type, ...extra });
                break;
            case OUTPUT_PDF:
            case OUTPUT_FILE:
                this.props.onUserMsg({ text: answer, fileUrl: answer, answer, type, ...extra });
                break;
            case OUTPUT_LOCATION:
                this.props.onUserMsg({ text: answer, answer, type, ...extra });
                break;
            case OUTPUT_JOB_ACTIONABLE:
                this.props.onUserMsg({ text: answer, answer, type, ...extra });
                break;

            default:
                this.props.onUserMsg({ text: Array.isArray(answer) ? answer.join(', ') : answer, answer, type: OUTPUT_TEXT, ...extra });
                break;
        }

        this.props.mode === MODE_BOT && scrollToBottomFn(this.chatRootRef.current.refElem());
    };

    callFn = () => {
        cnsole.log('Calling: ', this.props.otherGuy);
        this.props.callFn();
    };

    topBar = () => {
        const { collection } = this.props;
        const { hasAnalytics } = this.props.groupInfo;
        return collection === FIREBASE_CHAT_MESSAGES_DB_NAME ?
            <PersonalMessagingTopBar {...this.props} /> : <GroupTopBar {...this.props} hasAnalytics={hasAnalytics} />;
    };

    render() {
        const { me, messages, mode, groupInfo } = this.props;
        const { keyboardHeight } = this.state;
        const { isAdminPosting, admins } = groupInfo;
        const botMode = mode === MODE_BOT;
        const keyboardInputDisabled = botMode && (messages.length > 0 && messages[messages.length - 1][ASK_INPUT] && messages[messages.length - 1].type !== OUTPUT_TEXT);
        const enableSpeechRecognition = !botMode || (messages.length > 0 && messages[messages.length - 1][ENABLE_SPEECH_RECOGNITION]);
        const displayMsgs = this.displayMessages(messages);

        const inputLine = <InputLine onNewMsgFn={this.onNewMsgFn} micListening={this.state.micListening} mode={mode}
                                     chatRootRef={null} setKeyboardHeightFn={this.setKeyboardHeightFn}
                                     keyboardInputDisabled={keyboardInputDisabled} enableSpeechRecognition={enableSpeechRecognition} />;
        const adminOnlyText = (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                           fontSize: 15, backgroundColor: '#f4f4f4', color: '#505050', border: '0px solid #000000',
                           height: InputLine.HEIGHT, width: '100%', userSelect: 'none',
            }}>
                <Text>Only admins can send messages</Text>
            </View>
        );

        cnsole.log('display messages: ', messages, displayMsgs, keyboardInputDisabled);

        const INNER_HEIGHT = WINDOW_INNER_HEIGHT - ConfigurableTopBar.HEIGHT - InputLine.HEIGHT - HEIGHT_BUFFER - keyboardHeight;
        const amIAdmin = admins.includes(me.sender) || GROUPS_SUPER_ADMINS.includes(me.sender);
        return (
            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <View style={customStyle.paper}>
                    {this.props.topBar || this.topBar()}

                    <ImageBackground style={{ width: '100%', height: INNER_HEIGHT }} source={{ uri: WHATSAPP_BACKGROUND_IMAGE }}>
                        <ScrollableList list={displayMsgs} height={INNER_HEIGHT} ref={this.chatRootRef} />
                    </ImageBackground>

                    <View style={customStyle.inputLine}>
                        {isAdminPosting && !amIAdmin ? adminOnlyText : inputLine}
                    </View>
                </View>
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
