import React from "react";
import {
    fileFromBlob,
    Image,
    InputElem,
    mobileDetect,
    Modal,
    Popover,
    recordAudio,
    scrollToBottomFn,
    TextareaElem,
    uploadBlob,
    View
} from "./Util";
import {MODE_BOT} from "../chat/Constants";
import {OUTPUT_AUDIO, OUTPUT_PROGRESSIVE_MODULE} from "../chat/Questions";
import AttachIcon from "../widgets/AttachIcon";
import {CHAT_FONT_FAMILY} from "../constants/Constants";
import xrange from "xrange";
import BlinkingIcon from "../widgets/BlinkingIcon";
import {AttachPopup} from "../widgets/AttachPopup";
import {TrainingModuleThumbnailName} from "../widgets/TrainingModuleThumbnailName";
import window from "global";


export class InputLine extends React.Component {
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
    static HEIGHT = 55;

    componentDidMount() {
        this.mobileDetect = mobileDetect();
        this.origHeight = window.innerHeight;
        window.addEventListener('resize', this.resizeEventListener, true);
    }

    componentDidUpdate() {
        this.props.mode === MODE_BOT && scrollToBottomFn(this.props.chatRootRef.current);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeEventListener);
    }

    resizeEventListener = () => {
        if (window.innerHeight !== this.origHeight) {
            console.log('keyboard open');
            this.props.setKeyboardHeightFn(this.origHeight - window.innerHeight);
        } else {
            console.log('keyboard closed');
            this.props.setKeyboardHeightFn(0);
        }
    };

    submitText = async () => {
        const answer = (this.state.typed || '').replace(/\n/g, '<br>');
        await this.props.onNewMsgFn({ answer });
        this.setState({ typed: '' });

        // Scroll to bottom of the page
        this.textInputRef.current.refElem().focus();
        scrollToBottomFn(this.props.chatRootRef.current);
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
        const file = fileFromBlob(obj.audioBlob, 'recording');
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
                         anchorEl={isPopoverOpen ? this.attachIconParentRef.current.refElem() : null}
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
                              value={typed} onChangeText={(typed) => this.setState({ typed })} />
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



const SEND_ICON = 'https://images-lb.heloprotocol.in/sendButton.png-6412-355572-1556567055483.png';
const MIC_ICON = 'https://images-lb.heloprotocol.in/micTransparent.png-14784-992191-1562241230129.png';
const MIC_ICON_DISABLED = 'https://images-lb.heloprotocol.in/micDisabled.png-10163-675042-1564599701870.png';

const customStyle = {
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
