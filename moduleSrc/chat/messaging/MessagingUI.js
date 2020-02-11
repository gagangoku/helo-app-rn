import React, {Fragment} from 'react';
import window from "global/window";
import {
    actionButton,
    checkFileType,
    getCtx,
    getFieldNameFromType,
    getGpsLocation,
    getKeysWhereValueIs,
    getUrlParam,
    hashCode,
    haversineDistanceKms,
    Image,
    isDebugMode,
    navigateToLatLon,
    recognizeSpeechMinMaxDuration,
    recordAudio,
    spacer,
    staticMapsImg,
    uploadBlob,
    View
} from "../../util/Util";
import {
    AudioElem,
    bodyOverflowAuto,
    InputElem,
    mobileDetect,
    Modal,
    Popover,
    renderHtmlText,
    resizeForKeyboard,
    reverseGeocode,
    scrollToBottomFn,
    scrollToElemFn,
    stopBodyOverflow,
    Text,
    TextareaElem,
    VideoElem,
    WINDOW_INNER_HEIGHT,
    WINDOW_INNER_WIDTH
} from '../../platform/Util';
import OptionPickerWidget from "../../widgets/OptionPickerWidget";
import IDCard from "../IDCard";
import {
    BANGALORE_LAT,
    BANGALORE_LNG,
    CALL_MISSED_ICON,
    CHAT_FONT_FAMILY,
    FILE_ICON_IMG,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    GROUPS_SUPER_ADMINS,
    IMAGE_ICON_IMG,
    PLAY_ARROW_ICON,
    TROPHY_IMG
} from "../../constants/Constants";
import PlacesAutocompleteWidget from "../../widgets/PlacesAutocompleteWidget";
import {
    ASK_INPUT,
    ENABLE_SPEECH_RECOGNITION,
    LANG_HINDI,
    LANG_THAI,
    OPTION_NO,
    OPTION_YES,
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
    OUTPUT_VIDEO,
    SPEECH_GRAMMAR
} from "../Questions";
import assert from 'assert';
import MicRecorderWidget from "../../widgets/MicRecorderWidget";
import BlinkingAttachIcon from "../../widgets/BlinkingAttachIcon";
import TouchableAnim from "../../platform/TouchableAnim";
import {
    DOWNLOAD_FILE_BUTTON,
    FONT_COLOR,
    MODE_BOT,
    MODE_GROUP_CHAT,
    OTHER_GUY_BACKGROUND_COLOR,
    TOP_BAR_COLOR,
    USER_BACKGROUND_COLOR,
    USER_BACKGROUND_COLOR_DARK,
    WHATSAPP_BACKGROUND_IMAGE
} from '../Constants';
import AttachIcon from "../../widgets/AttachIcon";
import xrange from 'xrange';
import {getJobId} from "../bot/ChatUtil";
import {enqueueSpeechWithPolly, isBotSpeaking} from "../../audio/AwsPolly";
import BriefJobDetailsWidget from "../../widgets/BriefJobDetailsWidget";
import GA from '../../util/GoogleAnalytics';
import format from 'string-format';
import BlinkingIcon from "../../widgets/BlinkingIcon";
import {getKeyFromKVStore, setKeyValueFromKVStore} from "../../util/Api";
import {GroupTopBar, PersonalMessagingTopBar} from "./TopBar";
import {GROUP_URLS, HOME_PAGE_URLS} from "../../controller/Urls";


/**
 * UI for bidirectional messaging between user and visitor
 */
export default class MessagingUI extends React.PureComponent {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);

        this.state = {
            keyboardOpen: false,
            selectedOptions: {},
            micListening: false,
        };
        this.speechDisabledMap = {};

        console.log('MessagingUI constructor: ', props);
    }

    componentDidMount() {
        console.log('MessagingUI componentDidMount: ', this.props);
        const { mode, msgToScrollTo } = this.props;
        resizeForKeyboard({ mode, msgToScrollTo, cbFn: (keyboardOpen) => this.setState({ keyboardOpen }) });
        stopBodyOverflow();
    }
    componentWillUnmount() {
        bodyOverflowAuto();
    }

    setMicListeningFn = (micListening) => this.setState({ micListening });

    displayMessages = (messages) => {
        const list = [];
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const idx = i;
            const { job, msgKey } = message;

            const highlightMsg = this.props.msgToScrollTo === msgKey;
            const allProps = { ...this.props, message, idx, job, key: idx, onNewMsgFn: this.onNewMsgFn,
                               speechDisabledMap: this.speechDisabledMap, setMicListeningFn: this.setMicListeningFn,
                               highlightMsg };

            switch (message.type) {
                case OUTPUT_NONE:
                case OUTPUT_TEXT:
                    list.push(<TextMessage {...allProps} />);
                    break;
                case OUTPUT_PROGRESSIVE_MODULE:
                    list.push(<ProgressiveModule {...allProps} />);
                    break;
                case OUTPUT_IMAGE:
                    list.push(<ImageMessage {...allProps} />);
                    break;
                case OUTPUT_AUDIO:
                    list.push(<AudioMessage {...allProps} />);
                    break;
                case OUTPUT_VIDEO:
                    list.push(<VideoMessage {...allProps} />);
                    break;
                case OUTPUT_PDF:
                    list.push(<PdfMessage {...allProps} />);
                    break;
                case OUTPUT_FILE:
                    list.push(<FileMessage {...allProps} />);
                    break;
                case OUTPUT_LOCATION:
                    list.push(<LocationMessage {...allProps} />);
                    break;
                case OUTPUT_MISSED_CALL:
                    list.push(<MissedCallMessage {...allProps} />);
                    break;
                case OUTPUT_PLACES_AUTOCOMPLETE:
                    list.push(<PlacesAutocompleteMessage {...allProps} />);
                    break;
                case OUTPUT_SINGLE_CHOICE:
                case OUTPUT_MULTIPLE_CHOICE:
                    list.push(<OptionsMessage {...allProps} />);
                    break;
                case OUTPUT_JOB_ACTIONABLE:
                case OUTPUT_JOB_REFERENCE:
                    assert(job, 'Actionable Job is required');
                    list.push(<JobMessage {...allProps} />);
                    break;
                case OUTPUT_JOB_BRIEF:
                    assert(job, 'Brief Job is required');
                    list.push(<BriefJobMessage {...allProps} />);
                    break;
                case OUTPUT_ID_CARD:
                    list.push(<IDCardMessage {...allProps} />);
                    break;
                case OUTPUT_NEW_JOINEE:
                    list.push(<NewJoinee {...allProps} />);
                    break;
                case OUTPUT_SYSTEM_MESSAGE:
                    list.push(<SystemMessage {...allProps} />);
                    break;

                default:
                    console.log('Unknown question type: ', message);
                    break;
            }
        }

        list.push(<View key="spacer-bottom">{spacer(10)}</View>);
        return list;
    };

    onNewMsgFn = async ({ answer, type, ...extra }) => {
        console.log('onNewMsgFn: ', answer, type, extra);
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

        this.props.mode === MODE_BOT && scrollToBottomFn();
    };

    callFn = () => {
        console.log('Calling: ', this.props.otherGuy);
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
        const { isAdminPosting, admins } = groupInfo;
        const botMode = mode === MODE_BOT;
        const keyboardInputDisabled = botMode && (messages.length > 0 && messages[messages.length - 1][ASK_INPUT] && messages[messages.length - 1].type !== OUTPUT_TEXT);
        const enableSpeechRecognition = !botMode || (messages.length > 0 && messages[messages.length - 1][ENABLE_SPEECH_RECOGNITION]);
        const displayMsgs = this.displayMessages(messages);

        const inputLine = <InputLine onNewMsgFn={this.onNewMsgFn} micListening={this.state.micListening} mode={mode}
                                     keyboardInputDisabled={keyboardInputDisabled} enableSpeechRecognition={enableSpeechRecognition} />;
        const adminOnlyText = (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                          fontSize: 15, backgroundColor: '#f4f4f4', color: '#505050', border: '0px solid #000000',
                          height: '100%', width: '100%', userSelect: 'none',
            }}>
                Only admins can send messages
            </View>
        );

        console.log('display messages: ', messages, displayMsgs, keyboardInputDisabled);

        const amIAdmin = admins.includes(me.sender) || GROUPS_SUPER_ADMINS.includes(me.sender);
        return (
            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <View style={customStyle.paper}>
                    {this.props.topBar || this.topBar()}

                    <View style={customStyle.chatRootCtr} id="chatRoot">
                        <View style={customStyle.chatRoot}>
                            {spacer(5)}
                            {displayMsgs}
                        </View>
                    </View>

                    <View style={customStyle.inputLine}>
                        {isAdminPosting && !amIAdmin ? adminOnlyText : inputLine}
                    </View>
                </View>
            </View>
        );
    }
}


class InputLine extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            typed: '',
            showExpanded: false,
            recordingStartTimeMs: -1,
            numDots: 0,

            isPopoverOpen: false,
            isTrainingModuleFlowOpen: false,
            videoUrl: '',
        };
        this.textInputRef = React.createRef();
        this.attachIconParentRef = React.createRef();
    }

    componentDidMount() {
        this.mobileDetect = mobileDetect();
    }

    componentDidUpdate() {
        this.props.mode === MODE_BOT && scrollToBottomFn();
    }

    submitText = async () => {
        const answer = (this.state.typed || '').replace(/\n/g, '<br>');
        await this.props.onNewMsgFn({ answer });
        this.setState({ typed: '' });

        // Scroll to bottom of the page
        this.textInputRef.current.refElem().focus();
        scrollToBottomFn();
    };

    handleKeyDown = async (event) => {
        const { isAndroid, isIphone } = this.mobileDetect;
        if (event.key === 'Enter' && !isAndroid && !isIphone) {
            // Treat Enter key on desktop as submit action
            await this.submitText();
        }
    };

    startRecording = async () => {
        this.recorder = await recordAudio();
        this.recorder.start();
    };
    stopRecording = async () => {
        const obj = await this.recorder.stop();
        const blob = obj.audioBlob;
        const file = new File([blob], "recording." + blob.type.split('/')[1], {lastModified: new Date().getTime(), type: blob.type});
        console.log('Audio file: ', file);

        const audioUrl = await uploadBlob(file);
        console.log('audioUrl: ', audioUrl);

        await this.props.onNewMsgFn({ answer: '', type: OUTPUT_AUDIO, audioUrl });
    };

    onTouchStart = () => {
        const { keyboardInputDisabled, enableSpeechRecognition } = this.props;
        if (!keyboardInputDisabled && enableSpeechRecognition) {
            console.log('mic micMouseDown');
            this.micMouseDown();
        }
    };
    micMouseDown = () => {
        const { keyboardInputDisabled, enableSpeechRecognition } = this.props;
        if (!keyboardInputDisabled && enableSpeechRecognition) {
            console.log('mic micMouseDown');
            this.setState({showExpanded: true, recordingStartTimeMs: new Date().getTime(), numDots: 0});
            this.intervalId = setInterval(() => this.setState({numDots: this.state.numDots + 1}), 200);
            this.timeoutId = setTimeout(this.startRecording, 500);
        }
    };
    onTouchEnd = () => {
        const { keyboardInputDisabled, enableSpeechRecognition } = this.props;
        if (!keyboardInputDisabled && enableSpeechRecognition) {
            console.log('mic onTouchEnd');
            this.micMouseUp();
        }
    };
    micMouseUp = () => {
        const { keyboardInputDisabled, enableSpeechRecognition } = this.props;
        if (!keyboardInputDisabled && enableSpeechRecognition) {
            console.log('mic micMouseUp');
            clearTimeout(this.timeoutId);
            clearInterval(this.intervalId);
            this.setState({showExpanded: false, recordingStartTimeMs: -1, numDots: 0});

            this.stopRecording();
        }
    };

    onAttachBtnClickFn = () => {
        const { keyboardInputDisabled } = this.props;
        if (!keyboardInputDisabled) {
            this.setState({ isPopoverOpen: true });
        }
    };

    onChooseTrainingVideo = (videoUrl) => {
        this.setState({ isTrainingModuleFlowOpen: true, videoUrl, isPopoverOpen: false });
    };
    onAttachCompleteFn = (obj) => {
        console.log('onAttachCompleteFn: ', obj);
        if (obj) {
            this.props.onNewMsgFn(obj);
        }
        this.setState({ isPopoverOpen: false, isTrainingModuleFlowOpen: false });
    };
    submitTrainingModuleFn = ({ imageUrl, moduleName, duration }) => {
        const { videoUrl } = this.state;
        this.onAttachCompleteFn({ imageUrl, moduleName, videoUrl });
        this.props.onNewMsgFn({ answer: moduleName, type: OUTPUT_PROGRESSIVE_MODULE, imageUrl, videoUrl, duration });
    };

    render() {
        const { keyboardInputDisabled, enableSpeechRecognition, micListening } = this.props;
        const { showExpanded, typed, numDots, isPopoverOpen, isTrainingModuleFlowOpen } = this.state;

        const inputStyle = {
            ...customStyle.inputMessage,
            backgroundColor: keyboardInputDisabled ? '#808080b0' : 'white',
            color: keyboardInputDisabled ? 'white' : 'black',
        };
        const inputClassAttr = {};

        // TODO: Disallow svg etc
        const expandedStyle = showExpanded ? customStyle.sendButtonExpanded : customStyle.sendButton;
        const sendBtn = <View style={{...customStyle.sendButton, backgroundImage: `url(${SEND_ICON})` }}
                              onClick={() => keyboardInputDisabled ? '' : this.submitText()} />;

        const micIcon = enableSpeechRecognition ? MIC_ICON : MIC_ICON_DISABLED;
        const micBtn  = <View style={{...expandedStyle, backgroundImage: `url(${micIcon})` }}
                              onMouseDown={this.micMouseDown} onTouchStart={this.onTouchStart}
                              onMouseUp={this.micMouseUp} onTouchEnd={this.onTouchEnd} />;

        const ffff = () => this.setState({ isPopoverOpen: false, isTrainingModuleFlowOpen: false });
        const attachIcon = (
            <View style={{ height: 40, width: 40 }} ref={this.attachIconParentRef}>
                <View style={{ marginTop: 5 }}>
                    <AttachIcon onClickFn={this.onAttachBtnClickFn} size={30} opacity={0.5} />
                </View>
                <Popover id='popover' open={isPopoverOpen}
                         anchorEl={isPopoverOpen ? this.attachIconParentRef.current.divElement() : null}
                         onClose={() => this.setState({ isPopoverOpen: false })}
                         anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                         transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <View style={{ display: 'flex', flexDirection: 'column', fontFamily: CHAT_FONT_FAMILY, padding: 10 }}>
                        <AttachPopup onChooseTrainingVideo={this.onChooseTrainingVideo} onCompleteFn={this.onAttachCompleteFn} />
                    </View>
                </Popover>
                <Modal isOpen={isTrainingModuleFlowOpen} onRequestClose={ffff}
                       style={modalStyle} onAfterOpen={() => {}} contentLabel="Example Modal">
                    <TrainingModuleThumbnailName videoUrl={this.state.videoUrl} onSubmitFn={this.submitTrainingModuleFn} />
                </Modal>
            </View>
        );
        const inputBox = (
            <View style={customStyle.inputBox}>
                <TextareaElem style={inputStyle} placeholder="  Type here ..." type="text" {...inputClassAttr}
                              onKeyDown={this.handleKeyDown} ref={this.textInputRef}
                              disabled={keyboardInputDisabled}
                              value={typed} onChange={(v) => this.setState({ typed: v.target.value })} />
            </View>
        );

        const numDotsStr = xrange(0, numDots % 5).toArray().map(x => '.').join(' ');
        const recordingTime = (
            <View style={customStyle.inputBox}>
                <InputElem style={inputStyle} placeholder={'  Recording ' + numDotsStr} type="text" {...inputClassAttr}
                           disabled={true} value={typed} />
            </View>
        );

        const micListeningDiv = (
            <View style={{ height: 40, width: 10, marginRight: 10 }}>
                <BlinkingIcon style={{ height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Image src='/static/redCircleIcon.png' style={{ height: 15, width: 15 }} />
                </BlinkingIcon>
            </View>
        );

        return (
            <View style={customStyle.inputContainterKeyboardClosed} key={keyboardInputDisabled + '-'}>
                {!showExpanded ? inputBox : recordingTime}
                <View style={{ position: 'absolute', right: 0, top: 0,
                               display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {micListening ? micListeningDiv : <View />}
                    {!typed && !showExpanded ? attachIcon : <View />}
                    {typed ? sendBtn : micBtn}
                </View>
            </View>
        );
    }
}

class AttachPopup extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            videoUrl: '',
        };

        this.INPUT_TYPES = [{
            text: 'Media',
            image: IMAGE_ICON_IMG,
            accept: 'audio/*,video/*,image/*',
            ref: React.createRef(),
            isTraining: false,
        }, {
            text: 'File',
            image: FILE_ICON_IMG,
            accept: 'application/pdf,application/msword',
            ref: React.createRef(),
            isTraining: false,
        }, {
            text: 'Training',
            image: TROPHY_IMG,
            accept: 'video/*',
            ref: React.createRef(),
            isTraining: true,
        }];
        this.INPUT_TYPES.forEach(x => {
            x.onClickFn = () => {
                console.log('form hidden onlick: ', x.ref);
                x.ref.current.refElem().click();
            };
        });
    }

    onSelectFile = async (files, isTraining) => {
        console.log('Files: ', files, isTraining);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const blobUrl = await uploadBlob(file);

            const { type } = checkFileType(file.name, file.type);
            const key = getFieldNameFromType(type);
            if (isTraining) {
                this.setState({ videoUrl: blobUrl });
                this.props.onChooseTrainingVideo(blobUrl);
            } else {
                this.props.onCompleteFn({ answer: '', type, [key]: blobUrl });
            }
        }
    };

    imageTextFn = ({ image, text, onClickFn }) => {
        return (
            <TouchableAnim style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                           onPress={onClickFn} key={image + '-' + text}>
                <Image src={image} style={{ height: 45, width: 45, marginBottom: 10 }} />
                <Text style={{ fontSize: 13 }}>{text}</Text>
            </TouchableAnim>
        );
    };

    render() {
        const { videoUrl } = this.state;
        const inputTypes = this.INPUT_TYPES;
        const inputTypeTraining = inputTypes.filter(x => x.isTraining === true)[0];
        const inputTypeOthers = inputTypes.filter(x => x.isTraining !== true);
        return (
            <View key="hidden-forms" style={{ width: 200, height: 80, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                {this.INPUT_TYPES.map(x => <InputElem type="file" accept={x.accept} ref={x.ref} style={{ display: 'none' }} key={x.text}
                                                      onChange={() => this.onSelectFile(x.ref.current.refElem().files, x.isTraining)} />)}

                {inputTypeOthers.map(x => this.imageTextFn(x))}
                {this.imageTextFn(inputTypeTraining)}
            </View>
        );
    }
}

class TrainingModuleThumbnailName extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            moduleName: '',
            imageUrl: '',
        };
        this.imageRef = React.createRef();
        this.videoRef = React.createRef();
    }

    onSelectFile = async (files) => {
        console.log('Files: ', files);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const blobUrl = await uploadBlob(file);
            this.setState({ imageUrl: blobUrl });
        }
    };
    submitFn = () => {
        const { moduleName, imageUrl } = this.state;
        const { videoUrl } = this.props;
        if (!moduleName || moduleName.length <= 3) {
            return;
        }
        if (!imageUrl) {
            window.alert('Choose thumbnail');
            return;
        }

        const duration = this.videoRef.current.refElem().duration;
        this.props.onSubmitFn({ moduleName, imageUrl, videoUrl, duration });
    };

    render() {
        const { videoUrl } = this.props;
        const { moduleName, imageUrl } = this.state;
        const accept = 'image/*';

        const btnStyle = moduleName.length <= 3 ? { backgroundColor: '#b9b9b9' } : { backgroundColor: USER_BACKGROUND_COLOR_DARK };
        const img = !imageUrl ? <View /> : <Image src={imageUrl} style={{ maxHeight: 100, maxWidth: 100 }} />;
        return (
            <View style={{ width: 250, height: 400, fontFamily: CHAT_FONT_FAMILY,
                           display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
                <VideoElem src={videoUrl} width="150" height="150" ref={this.videoRef} />
                <InputElem placeholder='  Module name' type="text" style={{fontSize: 14, width: '80%', height: 40, letterSpacing: 1, textAlign: 'center'}}
                       value={moduleName} onChange={(elem) => this.setState({ moduleName: elem.target.value })} />
                {spacer(10)}

                <InputElem type="file" accept={accept} ref={this.imageRef} style={{ display: 'none' }}
                           onChange={() => this.onSelectFile(this.imageRef.current.refElem().files)} />
                <TouchableAnim style={{ }} onPress={() => this.imageRef.current.refElem().click()}>
                    <Text>Choose thumbnail</Text>
                </TouchableAnim>
                {spacer(10)}

                {img}

                {spacer(10)}
                {actionButton('Upload', this.submitFn, { width: 100, height: 50, style: btnStyle})}
            </View>
        );
    }
}

class MessageShell extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
        };
    }

    render() {
        const { idx, me, message, mode, idToDetails, ipLocation } = this.props;
        const { type, timestamp, sender, loc } = message;
        const senderName = (idToDetails && sender in idToDetails) ? idToDetails[sender].person.name : sender;
        let senderNameDebug = '';
        const isDebug = isDebugMode();
        let distKms = 1000;
        if (ipLocation && loc) {
            distKms = haversineDistanceKms(ipLocation, loc);
        }
        if (isDebug) {
            senderNameDebug = '(' + distKms.toFixed(1) + ' km)';
            if (distKms <= 20) {
                senderNameDebug += '*';
            }
        }

        const isOwn = sender === me.sender;
        const showSenderLine = !isOwn && mode === MODE_GROUP_CHAT;

        const paddingLeft = type === OUTPUT_TEXT ? 20 : 5;
        const paddingRight = type === OUTPUT_TEXT ? 20 : 5;
        const paddingTop = showSenderLine || type !== OUTPUT_TEXT ? 5 : 20;
        const parentDivStyle = isOwn ? mStyle.userMessage : mStyle.otherGuyMessage;
        const style = this.props.style || {};
        const timeDisplayDiv = !timestamp ? <View /> : <Text style={mStyle.timeDisplayDiv}>{dateDisplay(timestamp)}</Text>;
        const senderNameDiv = (
            <TouchableAnim onPress={() => this.setState({ modalOpen: true })}>
                <Text style={{...customStyle.senderLine, paddingLeft: 20-paddingLeft}}>{senderName} {senderNameDebug}</Text>
            </TouchableAnim>
        );

        const modal = !this.state.modalOpen ? <View /> : <MessageAPersonModal key={'modal-' + idx} sender={sender} {...this.props}
                                                                              modalOpen={true} closeFn={() => this.setState({ modalOpen: false })} />;
        return (
            <View key={idx} style={{ ...mStyle.message, alignItems: isOwn ? 'flex-end' : 'flex-start', ...style }}>
                <View style={{...parentDivStyle, position: 'relative', maxWidth: INNER_WIDTH_MAX - 100, minWidth: 60, fontSize: 15,
                    paddingTop, paddingLeft, paddingRight, paddingBottom: 20 }}>
                    {showSenderLine ? senderNameDiv : <View />}
                    {this.props.children}
                    {timeDisplayDiv}
                </View>
                {modal}
            </View>
        );
    }
}

class MessageAPersonModal extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { me, sender, modalOpen, idToDetails, ipLocation } = this.props;
        const senderName = (idToDetails && sender in idToDetails) ? idToDetails[sender].person.name : sender;
        const avatar = (idToDetails && sender in idToDetails) ? idToDetails[sender].person.image : '';
        const [role, id] = sender.split(':');
        const other = {
            role,
            id,
            sender,
            name: senderName,
            avatar,
        };

        const onPressMessage = () => {
            const url = format('{}?other={}&me={}&collection=chat-messages&ipLocation={}',
                GROUP_URLS.personalMessaging,
                encodeURIComponent(JSON.stringify(other)),
                encodeURIComponent(JSON.stringify(me)),
                encodeURIComponent(JSON.stringify(ipLocation)));
            window.open(url);
            this.props.closeFn();
        };
        const onPressView = () => {
            const url = format('{}?roleId={}', GROUP_URLS.viewPerson, sender);
            window.open(url);
            this.props.closeFn();
        };

        return (
            <Modal isOpen={modalOpen} onRequestClose={this.props.closeFn}
                   style={modalStyle} onAfterOpen={() => {}} contentLabel="Example Modal">
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <TouchableAnim onPress={onPressMessage} style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: 17 }}>
                        <View>Message {senderName}</View>
                    </TouchableAnim>

                    {spacer(25)}

                    <TouchableAnim onPress={onPressView} style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: 17 }}>
                        <View>View {senderName}</View>
                    </TouchableAnim>
                </View>
            </Modal>
        );
    }
}

class TextMessage extends React.PureComponent {
    async componentDidMount() {
        const { idx, message, speechDisabledMap, setMicListeningFn } = this.props;
        // console.log('TextMessage componentDidMount: ', message);
        const { type, text, askInput, language, speak } = message;
        if (speak) {
            enqueueSpeechWithPolly(speak.replace(/(<([^>]+)>)/g, ""), message.language);
        }

        const grammar = (message[SPEECH_GRAMMAR] || {})[language] || [];
        const speakParam = getUrlParam('speak');
        if (askInput && (speakParam === 'true' || speakParam === 'yes')) {
            const intervalId = setInterval(async () => {
                if (!isBotSpeaking()) {
                    clearInterval(intervalId);

                    const { result } = await recognizeSpeechMinMaxDuration(() => {}, MIN_SPEECH_RECOGNITION_MS, MAX_SPEECH_RECOGNITION_MS, language, grammar, setMicListeningFn);
                    console.log('TextMessage speech result: ', result, speechDisabledMap);
                    if (result && !speechDisabledMap[idx]) {
                        this.props.onNewMsgFn({ answer: result });
                    }
                }
            }, 500);
        }
    }

    render () {
        const { message, idx, me, otherGuy, mode } = this.props;
        let { text } = message;
        const { language } = message;
        if (!text) {
            return '';
        }
        text = addPhoneTracking(text, me.sender, message.sender);
        if (text.includes('<div') || text.includes('<b') || text.includes('<a')) {
            text = renderHtmlText(text);
        }
        const styleObj = (language === LANG_HINDI || language === LANG_THAI) ? customStyle.textMessageDivLarger : customStyle.textMessageDivNormal;
        return (
            <MessageShell key={idx} {...this.props} message={{...message, type: OUTPUT_TEXT}}>
                <Text style={styleObj}>{text}</Text>
            </MessageShell>
        );
    }
}

class ProgressiveModule extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            enabled: true,
        };
    }

    openProgressiveModule = () => {
        const { collection, groupId, idx, message, me } = this.props;
        const { videoUrl } = message;
        console.log('[analytics] openProgressiveModule: ', collection, groupId, idx, me.sender);
        const url = format('{}?collection={}&groupId={}&idx={}&user={}&videoUrl={}', HOME_PAGE_URLS.videoAnalytics, collection, groupId, idx, me.sender, encodeURIComponent(videoUrl));
        window.open(url, '_blank');
    };

    render () {
        const { message, idx, me, groupId, collection } = this.props;
        const { imageUrl, videoUrl, text, sender, duration } = message;
        const watched = message.watched;
        const leaderboardFn = this.props.leaderboardFn || (() => {});

        const texts = [
            'Vikram +5 have completed',
            'Mahi +3 have completed',
            'Kumar +10 have completed',
        ];

        const index = ((hashCode(imageUrl) % texts.length) + texts.length) % texts.length;
        const whoAllCompletedText = texts[index];
        const completePercent = Math.min(1, watched / duration);
        const leftOrRight = sender === me.sender? 'left' : 'right';
        const trophyHeight = 30;
        console.log('loggggg: ', { message, idx, me, groupId, collection, sender, duration, watched, completePercent });
        return (
            <MessageShell key={idx} {...this.props}>
                <View style={{ position: 'relative' }}>
                    <Image src={imageUrl} style={customStyle.imageMessage} onClick={this.openProgressiveModule} />

                    <View style={{ }}>
                        <View style={{ marginTop: 2, marginBottom: 0, fontSize: 14, textAlign: 'center' }}>{text}</View>
                        <View style={{ height: 15, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 25, marginRight: 5 }}>
                                <TouchableAnim onPress={this.openProgressiveModule} style={{}}>
                                    <Image src={PLAY_ARROW_ICON} style={{ height: 25, width: 25 }} />
                                </TouchableAnim>
                            </View>
                            <View style={{ width: 'calc(100% - 30px)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ height: 5, width: 100*completePercent + '%', backgroundColor: '#000000' }} />
                                <View style={{ height: 5, width: 100*(1-completePercent) + '%', backgroundColor: '#ababab' }} />
                            </View>
                        </View>
                    </View>
                    <View style={{ marginTop: 10, fontSize: 12, textAlign: 'center', color: '#505050' }}>{whoAllCompletedText}</View>

                    <View style={{ position: 'absolute', top: '50%', [leftOrRight]: -trophyHeight -10 }}>
                        <TouchableAnim onPress={() => leaderboardFn({ idx, message, me, groupId, collection, moduleName: text })}>
                            <Image src={TROPHY_IMG} style={{ height: trophyHeight, width: trophyHeight }} />
                        </TouchableAnim>
                    </View>
                </View>
            </MessageShell>
        );
    }
}

class ImageMessage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            enabled: true,
        };
    }

    openPic = () => {
        const { collection, groupId, idx, message, me } = this.props;
        const { imageUrl } = message;
        console.log('[analytics] openPic: ', collection, groupId, idx, me.sender);
        window.open(imageUrl, '_blank');
    };
    render () {
        const { message, idx, me, otherGuy, onNewMsgFn, mode } = this.props;
        const { askInput, imageUrl } = message;
        const { enabled } = this.state;
        const disableFn = () => this.setState({ enabled: false });

        if (askInput) {
            return renderAttachIcon({ message, idx, type: OUTPUT_IMAGE, enabled, disableFn, onNewMsgFn, me, otherGuy });
        }
        return (
            <MessageShell key={idx} {...this.props}>
                <Image src={imageUrl} style={customStyle.imageMessage} onClick={this.openPic} />
            </MessageShell>
        );
    }
}

class AudioMessage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            enabled: true,
        };
    }

    onTimeUpdate = (elem) => {
        const { collection, groupId, idx, me } = this.props;
        console.log('[analytics] onTimeUpdate audio: ', collection, groupId, idx, me.sender, elem.target, elem.target.currentTime, elem.target.duration);
    };
    render () {
        const { message, idx, me, otherGuy, onNewMsgFn, mode } = this.props;
        const { askInput, audioUrl } = message;
        const u = audioUrl && audioUrl.startsWith('http') ? audioUrl : 'https://audios-lb.heloprotocol.in/' + audioUrl;
        const { enabled } = this.state;
        const disableFn = () => this.setState({ enabled: false });

        if (askInput) {
            return renderAttachIcon({ message, idx, type: OUTPUT_AUDIO, enabled, disableFn, onNewMsgFn, me, otherGuy });
        }
        return (
            <MessageShell key={idx} {...this.props}>
                <AudioElem onTimeUpdate={this.onTimeUpdate} src={u} />
            </MessageShell>
        );
    }
}

class VideoMessage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            enabled: true,
        };
    }

    onTimeUpdate = (elem) => {
        const { collection, groupId, idx, me } = this.props;
        console.log('[analytics] onTimeUpdate video: ', collection, groupId, idx, me.sender, elem.target, elem.target.currentTime, elem.target.duration);
    };
    render () {
        const { message, idx, me, otherGuy, onNewMsgFn, mode } = this.props;
        const { askInput, videoUrl } = message;
        const { enabled } = this.state;
        const disableFn = () => this.setState({ enabled: false });

        if (askInput) {
            return renderAttachIcon({ message, idx, type: OUTPUT_VIDEO, enabled, disableFn, onNewMsgFn, me, otherGuy });
        }

        return (
            <MessageShell key={'' + idx} {...this.props}>
                <View style={{ borderRadius: 16, padding: 5 }}>
                    <VideoElem src={videoUrl} onTimeUpdate={this.onTimeUpdate} />
                </View>
                <LikesWidget id={idx} />
            </MessageShell>
        );
    }
}

class PdfMessage extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    openFile = () => {
        const { collection, groupId, idx, message, me } = this.props;
        const { fileUrl } = message;
        console.log('[analytics] openPdf: ', collection, groupId, idx, me.sender);
        window.open(fileUrl, '_blank');
    };
    render () {
        const { message, idx } = this.props;
        const { fileUrl } = message;

        return (
            <MessageShell key={idx} {...this.props}>
                <View style={{ borderRadius: 16, transform: 'translateY(0px)', padding: 5 }}>
                    <View style={{ position: 'relative', height: 200, width: 200 }}>
                        <TouchableAnim onPress={this.openFile} style={{ height: 200, width: 200, zIndex: 10, position: 'absolute' }} />
                        <iframe width="200px" height="200px" allowFullScreen={true} webkitallowfullscreen="true" mozallowfullscreen="true" allow="autoplay; fullscreen" src={fileUrl} />
                    </View>
                </View>
            </MessageShell>
        );
    }
}

class FileMessage extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    openFile = () => {
        const { collection, groupId, idx, message, me } = this.props;
        const { fileUrl } = message;
        console.log('[analytics] openFile: ', collection, groupId, idx, me.sender);
        window.open(fileUrl, '_blank');
    };
    render () {
        const { message, idx } = this.props;
        const { fileUrl } = message;

        const splits = fileUrl.split('/');
        let name = splits[splits.length - 1];
        if (name.length > 30) {
            const a = name.split('\.');
            const ext = a[a.length - 1];
            let n = a.slice(0, a.length - 1).join('-');
            if (n.length > 30) {
                n = n.substr(0, 30) + '...';
            }
            name = n + '.' + ext;
        }

        return (
            <MessageShell key={idx} {...this.props}>
                <View>
                    <View style={{ borderRadius: 16, transform: 'translateY(0px)', padding: 5, paddingBottom: 0 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableAnim onPress={this.openFile} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Image src={DOWNLOAD_FILE_BUTTON} style={{ height: 25, width: 25 }} />
                            </TouchableAnim>
                            <View style={{ marginLeft: 5 }}>{name}</View>
                        </View>
                    </View>
                </View>
            </MessageShell>
        );
    }
}

class LocationMessage extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    onNewMsgFn = async (answer) => {
        try {
            const {latitude, longitude} = await getGpsLocation();
            const {obj} = await reverseGeocode({latitude, longitude});
            const location = {lat: latitude, lng: longitude};
            await this.props.onNewMsgFn({ answer: obj.address, type: OUTPUT_LOCATION, latitude, longitude, location, geocodeResult: obj });
        } catch (e) {
            console.log('Exception in getting GSP location: ', e);
            const location = {lat: -1, lng: -1};
            await this.props.onNewMsgFn({ answer: 'GPS failed', type: OUTPUT_LOCATION, latitude: -1, longitude: -1, location, geocodeResult: null });
        }
    };
    onOpenLocation = (location) => {
        const { collection, groupId, idx, me } = this.props;
        console.log('[analytics] onOpenLocation: ', collection, groupId, idx, me.sender, location);
        navigateToLatLon(navigator.platform, location.lat, location.lng);
    };

    render () {
        const { message, idx, me, otherGuy, mode } = this.props;
        const { text, askInput, location } = message;

        if (askInput) {
            const allProps = { message, idx, me, otherGuy, key: idx, onNewMsgFn: this.onNewMsgFn };
            return (<OptionsMessage {...allProps} />);
        }
        return (
            <MessageShell key={idx} {...this.props}>
                <View style={customStyle.locationCtr}>
                    <View style={customStyle.locationImgCtr}>
                        <TouchableAnim onPress={() => this.onOpenLocation(location)}>
                            <Image src={staticMapsImg(location.lat, location.lng, STATIC_MAPS_IMG_HEIGHT, STATIC_MAPS_IMG_WIDTH)}
                                 style={customStyle.locationImg}/>
                        </TouchableAnim>
                    </View>
                    <Text style={customStyle.locationText}>{text}</Text>
                </View>
            </MessageShell>
        );
    }
}

class MissedCallMessage extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render () {
        const { message, idx, me, otherGuy, mode } = this.props;
        const { sender, timestamp } = message;
        const isOwn = sender === me.sender;
        const timeDisplay = dateDisplay(timestamp);

        const icon = (
            <Image src={CALL_MISSED_ICON} style={{ height: 15, width: 15 }} />
        );
        const whoToWho = isOwn ? 'Me -> ' + otherGuy.name : otherGuy.name + ' -> Me';
        return (
            <View style={customStyle.missedCallCtr} key={idx + ''}>
                <View style={{...customStyle.missedCall, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    {icon}
                    <Text style={{}}>&nbsp;{whoToWho}: call missed - {timeDisplay}&nbsp;</Text>
                </View>
            </View>
        );
    }
}

class PlacesAutocompleteMessage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            enabled: true,
        };
    }

    onSelectFn = async (obj) => {
        console.log('Selected locality: ', obj);
        this.setState({ enabled: false });
        const { latitude, longitude } = obj;
        const location = { lat: latitude, lng: longitude };
        await this.props.onNewMsgFn({ answer: obj.address, type: OUTPUT_LOCATION, latitude, longitude, location, geocodeResult: obj });
    };

    render () {
        const { message, idx, me, otherGuy, mode } = this.props;
        const { text, placeholder } = message;
        const { enabled } = this.state;
        const widgetKey = 'key-' + idx;

        const searchOptions = {
            location: {lat: () => BANGALORE_LAT, lng: () => BANGALORE_LNG},
            radius: 15000,
            strictBounds: true,
            // type: ["sublocality", "neighborhood"],
            // types: ['(regions)'],
        };

        const textDisplay = <TextMessage idx={idx} key={idx} text={text}
                                         message={{...message, type: OUTPUT_TEXT, askInput: false}} me={me} otherGuy={otherGuy} />;
        const placesWidget = (
            <PlacesAutocompleteWidget searchOptions={searchOptions} innerWidth={INNER_WIDTH_MAX}
                                      placeholder={placeholder}
                                      onSelectFn={this.onSelectFn} key={widgetKey} />
        );
        return (
            <Fragment key={'places-autocomplete-' + widgetKey}>
                {textDisplay}
                {enabled ? placesWidget : ''}
            </Fragment>
        );
    }
}

class OptionsMessage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            enabled: true,
            selectedOptions: [],
            selections: {},
        };
    }

    toggleSingleFn = async (x) => {
        console.log('Selected: ', x);
        this.setState({ selectedOptions: [x], enabled: false });
        await this.props.onNewMsgFn({ answer: x });
    };
    toggleMultipleFn = (x) => {
        console.log('Selected: ', x);
        const s = {...this.state.selections};
        s[x] = x in this.state.selections ? !this.state.selections[x] : true;
        this.setState({ selections: s });
    };
    doneFn = async () => {
        const s = getKeysWhereValueIs(this.state.selections, true);
        this.setState({ selectedOptions: s, enabled: false });
        await this.props.onNewMsgFn({ answer: s });
    };

    render () {
        const { message, idx, me, otherGuy, mode } = this.props;
        const { text, type, options, optionDisplays } = message;

        const displayFn = optionDisplays ? ((x) => optionDisplays[x]) : null;
        const { enabled } = this.state;
        const singleSelection = type !== OUTPUT_MULTIPLE_CHOICE;
        const toggleFn = enabled ? (singleSelection ? this.toggleSingleFn : this.toggleMultipleFn) : () => {};

        const theme = enabled ? OPTION_THEME : OPTION_THEME_DISABLED;
        const initialSelected = enabled ? [] : this.state.selectedOptions;
        const widgetKey = enabled + '-' + idx;
        console.log('enabled, theme, initialSelected, selectedOptions: ', enabled, theme, initialSelected, this.state.selectedOptions);
        console.log('initialSelected: ', initialSelected);



        const selections = getKeysWhereValueIs(this.state.selections, true);
        const doneBtn = selections.length > 0 ?
            actionButton('DONE', this.doneFn, {minWidth: 100, width: 100, height: 40}) :
            actionButton('DONE', () => {}, {minWidth: 100, width: 100, height: 40, style: {backgroundColor: '#969696'}});

        const textDisplay = <TextMessage idx={idx} key={idx} text={text}
                                         message={{...message, type: OUTPUT_TEXT, askInput: false}} me={me} otherGuy={otherGuy} />;
        return (
            <Fragment key={'options-key-' + idx}>
                {textDisplay}
                <OptionPickerWidget optionList={options} displayFn={displayFn} toggleFn={toggleFn}
                                    initialSelected={initialSelected} singleSelection={singleSelection}
                                    theme={theme} disabled={'' + !enabled}
                                    key={widgetKey} />
                <View style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                    {enabled && !singleSelection ? doneBtn : <View />}
                </View>
            </Fragment>
        );
    }
}

class JobMessage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            enabled: true,
        };
    }

    applyJobFn = async (job) => {
        console.log('Applied to job: ', job);
        const jobId = getJobId(job);
        this.setState({ enabled: false });
        await this.props.onNewMsgFn({ answer: OPTION_YES, type: OUTPUT_TEXT, jobId });
    };
    rejectJobFn = async (job) => {
        console.log('Rejected job: ', job);
        const jobId = getJobId(job);
        this.setState({ enabled: false });
        await this.props.onNewMsgFn({ answer: OPTION_NO, type: OUTPUT_TEXT, jobId });
    };

    render () {
        const { message, idx, me, otherGuy } = this.props;
        const { text, type, job, language } = message;

        const { enabled } = this.state;
        const isTest = type === OUTPUT_JOB_REFERENCE;
        const key = idx + '-' + enabled;
        console.log('renderJob: ', message, job, idx, enabled, isTest, key);

        const actionPanel = isTest || !enabled ? { labels: [], actions: [] } :
            { labels: ['APPLY', 'REJECT'], actions: [() => this.applyJobFn(job), () => this.rejectJobFn(job)] };

        const aValue = isTest ? 0.5 : (enabled ? 0.75 : 0);
        const styleOverrides = {root: {backgroundColor: `'rgba(179, 173, 173, ${aValue})'`}};
        const blurStyle = isTest || !enabled ? { opacity: 0.6, pointerEvents: 'none' } : {};

        const textDisplay = <TextMessage idx={idx} key={idx} text={text}
                                         message={{...message, type: OUTPUT_TEXT, askInput: false}} me={me} otherGuy={otherGuy} />;

        // TODO: Fix this
        // const jobWidget = <JobDetailsWidget jobDetails={job} supplyId={-1} highlightJob={false}
        //                                     actionPanel={actionPanel} language={language}
        //                                     key={key} styleOverrides={styleOverrides} />;
        const jobWidget = <Text>JobDetailsWidget</Text>;
        return (
            <Fragment>
                {textDisplay}
                <View style={blurStyle}>
                    {jobWidget}
                </View>
            </Fragment>
        );
    }
}

class BriefJobMessage extends React.PureComponent {
    constructor(props) {
        super(props);

        const { job } = this.props.message;
        this.state = {
            enabled: 'enabled' in job ? job.enabled : true,
        };
        this.myRef = this.props.highlightMsg ? React.createRef() : null;
    }

    async componentDidMount() {
        if (this.props.highlightMsg) {
            this.myRef && this.myRef.current && scrollToElemFn(this.myRef.current);
        }
    }

    callFn = async (job) => {
        const { me } = this.props;
        const label = 'job.phone:' + job.phone + ',user:' + me.sender;
        console.log('brief job label: ', label);
        GA.event({ category: 'job-brief', action: 'call', label });
        window.open('tel:+91' + job.phone, '_blank');
    };
    messageFn = async (job) => {
    };

    render () {
        const { message, idx, me, otherGuy } = this.props;
        const { text, type, job, language } = message;

        const { enabled } = this.state;
        const key = idx + '-' + enabled;
        console.log('renderJob: ', message, job, idx, enabled, key);

        const labels = [];
        const actions = [];
        if (job.phone) {
            labels.push('CALL');
            actions.push(() => this.callFn(job))
        }
        // labels.push('MESSAGE');
        // actions.push(() => this.messageFn(job));
        const actionPanel = { labels, actions };

        const aValue = enabled ? 0.5 : 0;
        const styleOverrides = {root: {backgroundColor: `'rgba(179, 173, 173, ${aValue})'`}};
        const blurStyle = !enabled ? { opacity: 0.6, pointerEvents: 'none' } : {};

        const refProp = this.props.highlightMsg ? { ref: this.myRef } : {};
        return (
            <View {...refProp}>
                <MessageShell key={idx} {...this.props} message={{...message, type: OUTPUT_JOB_BRIEF}}>
                    <View style={blurStyle}>
                        <BriefJobDetailsWidget job={job} actionPanel={actionPanel} language={language}
                                               key={key} styleOverrides={styleOverrides} />
                    </View>
                </MessageShell>
            </View>
        );
    }
}

class IDCardMessage extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render () {
        const { message, idx } = this.props;
        const { structure } = message;
        const key = 'id-card-render-' + idx;
        return (
            <View style={{ marginTop: 5, marginBotton: 5}}>
                <IDCard location={this.props.location} supplyDetails={structure} width={ID_CARD_WIDTH} key={key} />
            </View>
        );
    }
}

class NewJoinee extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
        };
    }

    render () {
        const { idx, me, message, idToDetails, ipLocation, groupInfo } = this.props;
        const { showMemberAddNotifications } = groupInfo;
        const { sender, loc } = message;
        const senderName = (idToDetails && sender in idToDetails) ? idToDetails[sender].person.name : sender;

        const modal = !this.state.modalOpen ? '' : <MessageAPersonModal key={'modal-' + idx} sender={sender} {...this.props}
                                                                        modalOpen={true} closeFn={() => this.setState({ modalOpen: false })} />;

        const distKms = ipLocation && loc ? haversineDistanceKms(ipLocation, loc) : 1000;
        // console.log('ipLocation, loc, dist: ', ipLocation, loc, distKms);
        const text = distKms < SHOW_NEW_JOINEE_DISTANCE_THRESHOLD_KM ? <View>{senderName} joined - {distKms.toFixed(1)} km near you</View> : <View>{senderName} joined</View>;

        if (!showMemberAddNotifications) {
            return (<View key={idx + ''} />);
        }
        return (
            <View style={{ marginTop: 5, marginBotton: 5}} key={idx + ''}>
                <View style={customStyle.missedCallCtr}>
                    <TouchableAnim onPress={() => this.setState({ modalOpen: true })}
                                   style={{...customStyle.missedCall, padding: 10, color: 'rgba(0, 0, 0, 0.7)', backgroundColor: 'rgba(0, 0, 255, 0.12)'}}>
                        {text}
                    </TouchableAnim>
                </View>
                {modal}
            </View>
        );
    }
}

class SystemMessage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
        };
    }

    render () {
        const { idx, me, message, idToDetails, ipLocation } = this.props;
        const { text, sender, loc } = message;

        return (
            <View style={{ marginTop: 5, marginBotton: 5}} key={idx + ''}>
                <View style={customStyle.missedCallCtr}>
                    <TouchableAnim onPress={() => {}}
                                   style={{...customStyle.missedCall, padding: 10, color: 'rgba(0, 0, 0, 0.7)', backgroundColor: 'rgba(0, 0, 255, 0.12)'}}>
                        {text}
                    </TouchableAnim>
                </View>
            </View>
        );
    }
}

class LikesWidget extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            likesObj: null,
        };
    }
    async componentDidMount() {
        const { id } = this.props;
        const key = 'likes-widget1-' + id;
        const value = await getKeyFromKVStore(key);
        console.log('DEBUG likes widget: ', key, value);
        const likesObj = !value ? this.defVal() : JSON.parse(value);
        this.setState({ likesObj });

        this.increment('views');
    }
    increment = async (k) => {
        const { id } = this.props;
        const key = 'likes-widget1-' + id;
        const value = await getKeyFromKVStore(key);
        const likesObj = !value ? this.defVal() : JSON.parse(value);
        likesObj[k] += 1;
        await setKeyValueFromKVStore(key, JSON.stringify(likesObj));
        this.setState({ likesObj });
    };
    defVal = () => ({ likes: 1, thumbsUp: 1, views: 1 });

    render () {
        const { id } = this.props;
        const { likes, views } = this.state.likesObj || this.defVal();
        return (
            <View key={id} style={customStyle.likes}>
                <TouchableAnim style={customStyle.likes} onPress={() => this.increment('views')}>
                    <Text style={{ fontSize: 24, marginRight: 2, marginTop: 2 }}>👀</Text>
                    <Text style={{ fontSize: 14, color: 'rgb(3, 102, 214)', letterSpacing: 1 }}>{views}</Text>
                </TouchableAnim>
                {spacer(0, 20)}
                <TouchableAnim style={customStyle.likes} onPress={() => this.increment('likes')}>
                    <View style={{ marginRight: 2 }}>
                        <Image src={'https://images-lb.heloprotocol.in/thumbsUp.png-6007-940874-1575953003289.png'} style={{ marginTop: 1, height: 25, width: 25 }} />
                    </View>
                    <Text style={{ fontSize: 14, color: 'rgb(3, 102, 214)', letterSpacing: 1 }}>{likes}</Text>
                </TouchableAnim>
            </View>
        );
    }
}

const dateDisplay = (timestamp) => {
    const d = timestamp ? new Date(parseInt(timestamp)) : new Date();
    const hr = d.getHours();
    const mins = d.getMinutes();
    const amPm = hr <= 12 ? 'AM' : 'PM';

    return (hr <= 12 ? hr : hr - 12) + ':' + (mins <= 9 ? '0' + mins : mins) + ' ' + amPm;
};

const renderAttachIcon = ({message, idx, type, enabled, disableFn, onNewMsgFn, me, otherGuy}) => {
    idx = idx + '';
    const fileInputRef = React.createRef();

    const onSelectFile = async (elem) => {
        console.log('elem: ', elem);
        const blobUrl = await uploadBlob(fileInputRef.current.refElem().files[0]);
        disableFn();
        await onNewMsgFn({ answer: blobUrl, type });
    };
    const onAudioDoneFn = async (audioFile) => {
        const blobUrl = await uploadBlob(audioFile);
        disableFn();
        await onNewMsgFn({ answer: blobUrl, type });
    };

    const accept = type === OUTPUT_IMAGE ? 'image/*' : (type === OUTPUT_VIDEO ? 'video/*' : 'audio/*');
    const attachIcon = (
        <View style={{ height: 70, width: '100%', position: 'relative' }}>
            <InputElem type="file" accept={accept} ref={fileInputRef} style={{ display: 'none' }} onChange={onSelectFile} />
            <View style={{...customStyle.attachButton }}>
                <BlinkingAttachIcon onClickFn={() => fileInputRef.current.refElem().click()} size={50} />
            </View>
        </View>
    );
    const audioAttachIcon = (
        <View style={{ height: 50, width: '100%', position: 'relative' }}>
            <View style={{ position: 'absolute', right: 50 }}>
                <MicRecorderWidget onDoneFn={onAudioDoneFn} />
            </View>
        </View>
    );

    const textDisplay = <TextMessage idx={idx} key={idx} text={message.text}
                                     message={{...message, type: OUTPUT_TEXT, askInput: false}} me={me} otherGuy={otherGuy} />;
    return (
        <Fragment key={'attach-' + idx}>
            {textDisplay}
            {enabled ? (type === OUTPUT_AUDIO ? audioAttachIcon : attachIcon) : <View />}
        </Fragment>
    );
};


window.trackPhone = (phone, me, messageSender) => {
    console.log('calling phone: ', { phone, me, messageSender });
    GA.event({category: 'phone-click', action: 'click', label: [phone, me, messageSender].join(',')});
};

const addPhoneTracking = (text, me, messageSender) => {
    return text.replace(/(?:\b|^)(\+91[1-9][0-9]{9}|0[0-9]{10}|[1-9][0-9]{9})\b/g, `<a href="tel:$1" onclick="window.trackPhone(\'$1\', \'${me}\', \'${messageSender}\')">$1</a>`);
};


const SHOW_NEW_JOINEE_DISTANCE_THRESHOLD_KM = 10;
const MIN_SPEECH_RECOGNITION_MS = 3 * 1000;
const MAX_SPEECH_RECOGNITION_MS = 8 * 1000;
const INNER_HEIGHT = WINDOW_INNER_HEIGHT - 55 - 56;
const INNER_WIDTH_MAX = Math.min(WINDOW_INNER_WIDTH, 450);
const SCR_WIDTH = Math.min(WINDOW_INNER_WIDTH - 2, INNER_WIDTH_MAX);
const SEND_ICON = 'https://images-lb.heloprotocol.in/sendButton.png-6412-355572-1556567055483.png';
const MIC_ICON = 'https://images-lb.heloprotocol.in/micTransparent.png-14784-992191-1562241230129.png';
const MIC_ICON_DISABLED = 'https://images-lb.heloprotocol.in/micDisabled.png-10163-675042-1564599701870.png';
const STATIC_MAPS_IMG_HEIGHT = 200;
const STATIC_MAPS_IMG_WIDTH = 300;
const ID_CARD_WIDTH = 390;
const customStyle = {
    paper: {
        width: SCR_WIDTH,
        height: '100%',
        fontFamily: CHAT_FONT_FAMILY,
        overflow: 'hidden',
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
        overflowY: 'auto',
        height: INNER_HEIGHT,
        background: `url(${WHATSAPP_BACKGROUND_IMAGE})`,
    },
    chatRoot: {
        // backgroundColor: 'rgb(255, 255, 255, 0.7)',
    },
    inputLine: {
        height: 55,
    },

    heloMessage: {},
    heloMessageText: {
    },

    otherGuyMessage: {
        backgroundColor: OTHER_GUY_BACKGROUND_COLOR,
        color: FONT_COLOR,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        maxWidth: INNER_WIDTH_MAX - 100,
        fontSize: 15,
        // marginBottom: 2,
    },
    otherGuyMessageText: {
    },

    userMessage: {
        backgroundColor: USER_BACKGROUND_COLOR,
        color: FONT_COLOR,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 0,
        maxWidth: INNER_WIDTH_MAX - 100,
        fontSize: 15,
    },
    userMessageText: {
    },
    imageMessage: {
        maxWidth: 200,
        maxHeight: 200,
        borderRadius: 10,
        // border: '1px solid black',
        cursor: 'pointer',
    },

    missedCallCtr: {
        display: 'flex',
        justifyContent: 'center',
        margin: 5,
    },
    missedCall: {
        color: '#ff0000',
        backgroundColor: '#efefef',
        fontSize: 13,
        padding: 5,
        borderRadius: 10,
        // maxWidth: INNER_WIDTH_MAX - 100,
        // width: 'fit-content',
    },

    inputContainterKeyboardClosed: {
        width: '100%',
        // marginTop: 20,
        position: 'relative',
    },
    inputBox: {
        width: '100%',
    },
    inputMessage: {
        width: '97%',
        height: 30,
        paddingTop: 10,
        border: '1.5px solid #a9a9a9',
        borderRadius: 40,
        outline: 'none',
        paddingLeft: 10,
        fontSize: 16,
        fontFamily: CHAT_FONT_FAMILY,
    },

    sendButton: {
        flex: 1,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        border: '0px',
        height: 40,
        width: 40,
        marginTop: 2,
        marginRight: 2
    },
    sendButtonExpanded: {
        flex: 1,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        border: '0px',
        height: 80,
        width: 80,
        marginTop: 2,
        marginRight: 2
    },

    attachButton: {
        border: '0px',
        position: 'absolute',
        right: 50,
        top: 7,
    },

    debugView: {
        fontSize: 8,
    },
    grow: {
        flexGrow: 1,
        textAlign: 'center',
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },

    locationCtr: {
        padding: 10,
    },
    locationImgCtr: {
        borderRadius: 10,
    },
    locationImg: {
        borderRadius: 10,
        border: '1px solid black',
    },
    locationText: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
        maxWidth: STATIC_MAPS_IMG_WIDTH,

        fontFamily: CHAT_FONT_FAMILY,
        fontWeight: 500,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },

    senderLine: {
        marginTop: 2,
        marginBottom: 3,
        color: 'blue',
        // fontWeight: 'bold',
        letterSpacing: 0.5,
        fontSize: 13,
    },
    textMessageDivNormal: {
        color: 'rgba(0, 0, 0, 0.8)',
        fontSize: 16,
    },
    textMessageDivLarger: {
        color: 'rgba(0, 0, 0, 0.8)',
        fontSize: 17,
    },

    likes: {
        fontFamily: 'Lato, Helvetica, sans-serif',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
};
const mStyle = {
    message: {
        display: 'flex',
        flexDirection: 'column',
        margin: 4,
        marginRight: 8,
        marginBottom: 1,
    },
    messageText: {
        position: 'relative',
        minWidth: 45,
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 20,
    },

    otherGuyMessage: {
        backgroundColor: OTHER_GUY_BACKGROUND_COLOR,
        color: FONT_COLOR,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    userMessage: {
        backgroundColor: USER_BACKGROUND_COLOR,
        color: FONT_COLOR,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 0,
    },
    timeDisplayDiv: {
        position: 'absolute',
        right: 10,
        bottom: 5,
        fontSize: 9,
        opacity: 0.5,
    },

    modal: {
        fontFamily: CHAT_FONT_FAMILY,
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

const OPTION_THEME = {
    textColor: 'black',
    selectedTextColor: 'white',
    backgroundColor: 'white',
    selectedBackgroundColor: USER_BACKGROUND_COLOR_DARK,
    borderColor: 'black',
    selectedBorderColor: USER_BACKGROUND_COLOR_DARK,
};
const OPTION_THEME_DISABLED = {
    textColor: 'black',
    selectedTextColor: 'white',
    backgroundColor: 'white',
    selectedBackgroundColor: '#969696',
    borderColor: 'black',
    selectedBorderColor: '#969696',
};
