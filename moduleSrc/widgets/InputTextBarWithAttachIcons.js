import React from "react";
import {OUTPUT_AUDIO, OUTPUT_PROGRESSIVE_MODULE} from "../chat/Questions";
import AttachIcon from "../widgets/AttachIcon";
import {CHAT_FONT_FAMILY, RED_RECORDING_ICON} from "../constants/Constants";
import xrange from "xrange";
import BlinkingIcon from "../widgets/BlinkingIcon";
import {AttachPopup} from "../widgets/AttachPopup";
import {TrainingModuleThumbnailName} from "../widgets/TrainingModuleThumbnailName";
import {
    fileFromBlob,
    HEIGHT_BUFFER,
    Image,
    InputElem,
    LongPressMicBtn,
    mobileDetect,
    Modal,
    Popover,
    recordAudio,
    requestMicPermission,
    TextareaElem,
    uploadBlob,
    View,
    WINDOW_INNER_HEIGHT,
    WINDOW_INNER_WIDTH
} from "../platform/Util";
import TouchableAnim from "../platform/TouchableAnim";
import {commonStyle} from "../styles/common";


export class InputTextBarWithAttachIcons extends React.Component {
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

            mobileDetect: {},
        };
        this.textInputRef = React.createRef();
        this.attachIconParentRef = React.createRef();
    }
    static HEIGHT = 55;

    componentDidMount() {
        const md = mobileDetect();
        this.setState({ mobileDetect: md });
    }

    submitText = async () => {
        const answer = (this.state.typed || '').replace(/\n/g, '<br>');
        await this.props.onNewMsgFn({ answer });
        this.setState({ typed: '' });
    };

    handleKeyDown = async (event) => {
        const { isAndroid, isIphone } = this.state.mobileDetect;
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
        if (!this.recorder) {
            return;
        }
        const obj = await this.recorder.stop();

        const file = fileFromBlob(obj.audioBlob, 'recording');
        console.log('Audio file: ', file);

        const audioUrl = await uploadBlob(file);
        console.log('audioUrl: ', audioUrl);

        if (audioUrl) {
            await this.props.onNewMsgFn({answer: '', type: OUTPUT_AUDIO, audioUrl});
        } else {
            window.alert('Recording failed');
        }
    };

    micMouseDown = async () => {
        const { keyboardInputDisabled, enableSpeechRecognition } = this.props;
        if (!keyboardInputDisabled && enableSpeechRecognition) {
            console.log('mic micMouseDown');

            if (await requestMicPermission()) {
                this.setState({showExpanded: true, recordingStartTimeMs: new Date().getTime(), numDots: 0});
                this.intervalId = setInterval(() => this.setState({numDots: this.state.numDots + 1}), 200);
                this.timeoutId = setTimeout(this.startRecording, 100);
            }
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
    submitTrainingModuleFn = ({ moduleName, imageUrl, videoUrl, duration }) => {
        this.onAttachCompleteFn();
        this.props.onNewMsgFn({ answer: moduleName, type: OUTPUT_PROGRESSIVE_MODULE, imageUrl, videoUrl, duration });
    };

    render() {
        const lineHeight = InputTextBarWithAttachIcons.HEIGHT;
        const { keyboardInputDisabled, enableSpeechRecognition, micListening } = this.props;
        const { showExpanded, typed, numDots, isPopoverOpen, isTrainingModuleFlowOpen, mobileDetect } = this.state;
        const { isWeb } = mobileDetect;

        const inputStyle = {
            ...customStyle.inputMessage,
            marginTop: isWeb ? 20 : 0,
            height: isWeb ? lineHeight - 22 : 50,
            backgroundColor: keyboardInputDisabled ? '#808080b0' : 'white',
            color: keyboardInputDisabled ? 'white' : 'black',
        };
        const inputClassAttr = {};

        const sendBtn = (
            <TouchableAnim onPress={() => keyboardInputDisabled ? '' : this.submitText()}>
                <Image src={SEND_ICON} style={{ ...commonStyle.noneSelect, height: 40, width: 40 }} />
            </TouchableAnim>
        );

        const dim = showExpanded ? 60 : 40;
        const micIcon = enableSpeechRecognition ? MIC_ICON : MIC_ICON_DISABLED;
        const micBtn  = <LongPressMicBtn onPressIn={this.micMouseDown} onPressOut={this.micMouseUp}
                                         style={{ height: dim, width: dim    }} source={{ uri: micIcon}} />;

        const ffff = () => this.setState({ isPopoverOpen: false, isTrainingModuleFlowOpen: false });
        const popoverY = WINDOW_INNER_HEIGHT - lineHeight - HEIGHT_BUFFER;
        const popoverX = WINDOW_INNER_WIDTH / 2;

        const attachIcon = (
            <View style={{ height: 40, width: 40 }} ref={this.attachIconParentRef}>
                <View style={{ marginTop: 5 }}>
                    <AttachIcon onClickFn={this.onAttachBtnClickFn} size={30} opacity={0.5} />
                </View>
                <Popover open={isPopoverOpen} visible={isPopoverOpen}
                         anchorEl={isPopoverOpen ? this.attachIconParentRef.current.refElem() : null}
                         anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                         transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                         contentStyle={{ padding: 0 }} arrowStyle={{ padding: 0 }} backgroundStyle={{ padding: 0 }}
                         style={{ }}
                         fromRect={{ x: popoverX, y: popoverY, width: 0, height: 0 }} placement="top"
                         onClose={() => this.setState({ isPopoverOpen: false })}
                >
                    <View style={{ display: 'flex', flexDirection: 'column', fontFamily: CHAT_FONT_FAMILY, padding: 10 }}>
                        <AttachPopup onChooseTrainingVideo={this.onChooseTrainingVideo} onCompleteFn={this.onAttachCompleteFn} />
                    </View>
                </Popover>

                <Modal isOpen={isTrainingModuleFlowOpen} visible={isTrainingModuleFlowOpen} isVisible={isTrainingModuleFlowOpen}
                       backdropOpacity={0.5} style={modalStyle}
                       onRequestClose={ffff} onBackdropPress={ffff}
                       onAfterOpen={() => {}} contentLabel="Example Modal">
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
                    <Image src={RED_RECORDING_ICON} style={{ height: 15, width: 15 }} />
                </BlinkingIcon>
            </View>
        );

        return (
            <View style={{...customStyle.inputContainterKeyboardClosed, height: InputTextBarWithAttachIcons.HEIGHT}} key={keyboardInputDisabled + '-'}>
                <View style={{ flex: 1, paddingRight: 2, }}>
                    {!showExpanded ? inputBox : recordingTime}
                </View>
                <View style={{ marginRight: 2, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {micListening || showExpanded ? micListeningDiv : <View />}
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
        width: '95%',
        marginLeft: '2%',
        marginRight: '2%',
        borderWidth: 1.5,
        border: '1.5px solid',
        borderColor: '#a9a9a9',
        borderRadius: 20,
        display: 'flex', flexDirection: 'row', alignItems: 'center',
    },
    inputBox: {
        width: '100%',
        height: '100%',
    },
    inputMessage: {
        width: '90%',
        height: 50,
        marginLeft: 10,
        borderWidth: 0,
        outline: 'none',
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
    },
    backgroundColor: '#ffffff',
};
