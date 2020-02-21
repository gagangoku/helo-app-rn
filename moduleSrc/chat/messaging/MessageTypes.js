import React, {Fragment} from "react";
import {enqueueSpeechWithPolly, isBotSpeaking} from "../../audio/AwsPolly";
import {
    LANG_HINDI,
    LANG_THAI,
    OPTION_NO,
    OPTION_YES,
    OUTPUT_AUDIO,
    OUTPUT_IMAGE,
    OUTPUT_JOB_BRIEF,
    OUTPUT_JOB_REFERENCE,
    OUTPUT_LOCATION,
    OUTPUT_MULTIPLE_CHOICE,
    OUTPUT_TEXT,
    OUTPUT_VIDEO,
    SPEECH_GRAMMAR
} from "../Questions";
import {
    AudioElem,
    getGpsLocation,
    getUrlParam,
    Image,
    ImagePreviewWidget,
    InputElem,
    isDebugMode,
    Modal,
    openUrlOrRoute,
    PdfFilePreview,
    renderHtmlText,
    reverseGeocode,
    scrollToElemFn,
    Text,
    uploadBlob,
    VideoElem,
    View,
    WINDOW_INNER_WIDTH
} from "../../platform/Util";
import {
    actionButton,
    getKeysWhereValueIs,
    hashCode,
    haversineDistanceKms,
    navigateToLatLon,
    recognizeSpeechMinMaxDuration,
    spacer,
    staticMapsImg
} from "../../util/Util";
import cnsole from "loglevel";
import format from "string-format";
import {GROUP_URLS, HOME_PAGE_URLS} from "../../controller/Urls";
import TouchableAnim from "../../platform/TouchableAnim";
import {
    BANGALORE_LAT,
    BANGALORE_LNG,
    CALL_MISSED_ICON,
    CHAT_FONT_FAMILY,
    FIREBASE_GROUPS_DB_NAME,
    PLAY_ARROW_ICON,
    TROPHY_IMG
} from "../../constants/Constants";
import {
    DOWNLOAD_FILE_BUTTON,
    FONT_COLOR,
    MODE_GROUP_CHAT,
    OTHER_GUY_BACKGROUND_COLOR,
    TOP_BAR_COLOR,
    USER_BACKGROUND_COLOR,
    USER_BACKGROUND_COLOR_DARK
} from "../Constants";
import PlacesAutocompleteWidget from "../../widgets/PlacesAutocompleteWidget";
import OptionPickerWidget from "../../widgets/OptionPickerWidget";
import {getJobId} from "../bot/ChatUtil";
import GA from "../../util/GoogleAnalytics";
import window from "global";
import BriefJobDetailsWidget from "../../widgets/BriefJobDetailsWidget";
import IDCard from "../IDCard";
import {getKeyFromKVStore, setKeyValueFromKVStore} from "../../util/Api";
import BlinkingAttachIcon from "../../widgets/BlinkingAttachIcon";
import MicRecorderWidget from "../../widgets/MicRecorderWidget";


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
                <View style={{...parentDivStyle, position: 'relative', maxWidth: MESSAGE_SHELL_MAX_WIDTH, minWidth: 60, fontSize: 15,
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

class TextMessage extends React.PureComponent {
    async componentDidMount() {
        const { idx, message, speechDisabledMap, setMicListeningFn } = this.props;
        // cnsole.log('TextMessage componentDidMount: ', message);
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
                    cnsole.log('TextMessage speech result: ', result, speechDisabledMap);
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
        const styleObj = (language === LANG_HINDI || language === LANG_THAI) ? customStyle.textMessageDivLarger : customStyle.textMessageDivNormal;

        text = addPhoneTracking(text, me.sender, message.sender);
        if (text.includes('<div') || text.includes('<b') || text.includes('<a')) {
            text = renderHtmlText(text, styleObj);
        } else {
            text = <Text style={styleObj}>{text}</Text>;
        }
        return (
            <MessageShell key={idx} {...this.props} message={{...message, type: OUTPUT_TEXT}}>
                <View style={{}}>{text}</View>
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
        cnsole.log('[analytics] openProgressiveModule: ', collection, groupId, idx, me.sender);
        const url = format('{}?collection={}&groupId={}&idx={}&user={}&videoUrl={}', HOME_PAGE_URLS.videoAnalytics, collection, groupId, idx, me.sender, encodeURIComponent(videoUrl));
        openUrlOrRoute({ url });
    };

    render () {
        const { message, idx, me, groupId, collection } = this.props;
        const { imageUrl, videoUrl, text, sender } = message;
        const duration = message.duration || 100;
        const watched = message.watched || 0;
        const leaderboardFn = this.props.leaderboardFn || (() => {});

        const texts = [
            'Vikram +5 have completed',
            'Mahi +3 have completed',
            'Kumar +10 have completed',
        ];

        const index = ((hashCode(imageUrl) % texts.length) + texts.length) % texts.length;
        const whoAllCompletedText = texts[index];
        const completePercent = Math.min(1, watched / (duration + 1));

        const lFn = () => leaderboardFn({ idx, message, me, groupId, collection, moduleName: text });
        const trophyDim = 30;
        const leaderBoardIcon = (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <TouchableAnim onPress={lFn}>
                    <Image src={TROPHY_IMG} style={{ height: trophyDim, width: trophyDim }} />
                </TouchableAnim>
            </View>
        );
        const right = collection === FIREBASE_GROUPS_DB_NAME && sender !== me.sender ? leaderBoardIcon : <View />;
        const left  = collection === FIREBASE_GROUPS_DB_NAME && sender === me.sender ? leaderBoardIcon : <View />;

        cnsole.log('loggggg: ', { message, idx, me, groupId, collection, sender, duration, watched, completePercent });
        return (
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: sender === me.sender ? 'flex-end' : 'flex-start' }}>
                {left}
                <MessageShell key={idx} {...this.props}>
                    <View style={{ width: 200, marginLeft: 10, marginRight: 10, marginTop: 5 }}>
                        <TouchableAnim onPress={this.openProgressiveModule}>
                            <Image src={imageUrl} style={customStyle.imageMessage} />
                        </TouchableAnim>

                        <View style={{ }}>
                            <Text style={{ marginTop: 2, marginBottom: 0, fontSize: 14, textAlign: 'center' }}>{text}</Text>
                            <View style={{ height: 15, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ width: 25, marginRight: 5 }}>
                                    <TouchableAnim onPress={this.openProgressiveModule} style={{}}>
                                        <Image src={PLAY_ARROW_ICON} style={{ height: 25, width: 25 }} />
                                    </TouchableAnim>
                                </View>
                                <View style={{ width: '70%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ height: 5, width: 100*completePercent + '%', backgroundColor: '#000000' }} />
                                    <View style={{ height: 5, width: 100*(1-completePercent) + '%', backgroundColor: '#c0c0c0' }} />
                                </View>
                            </View>
                        </View>
                        <Text style={{ marginTop: 10, fontSize: 12, textAlign: 'center', color: '#505050' }}>{whoAllCompletedText}</Text>
                    </View>
                </MessageShell>
                {right}
            </View>
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
        cnsole.log('[analytics] openPic: ', collection, groupId, idx, me.sender);
    };

    render () {
        const { message, idx, me, otherGuy, onNewMsgFn } = this.props;
        const { askInput, imageUrl } = message;
        const { enabled } = this.state;
        const disableFn = () => this.setState({ enabled: false });

        if (askInput) {
            return renderAttachIcon({ message, idx, type: OUTPUT_IMAGE, enabled, disableFn, onNewMsgFn, me, otherGuy });
        }

        return (
            <MessageShell key={idx} {...this.props}>
                <ImagePreviewWidget imageUrl={imageUrl} onOpenFn={this.openPic} />
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

    onTimeUpdate = ({ currentTime, duration, ...extra }) => {
        const { collection, groupId, idx, me } = this.props;
        cnsole.log('[analytics] onTimeUpdate audio: ', collection, groupId, idx, me.sender, currentTime, duration, extra);
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

    onTimeUpdate = ({ currentTime, duration, ...extra }) => {
        const { collection, groupId, idx, me } = this.props;
        cnsole.log('[analytics] onTimeUpdate video: ', collection, groupId, idx, me.sender, currentTime, duration, extra);
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
                    <VideoElem src={videoUrl} onTimeUpdate={this.onTimeUpdate} useWebviewInstead={true} />
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
        cnsole.log('[analytics] openPdf: ', collection, groupId, idx, me.sender);
        openUrlOrRoute({ url: fileUrl });
    };
    render () {
        const { message, idx } = this.props;
        const { fileUrl } = message;

        return (
            <MessageShell key={idx} {...this.props}>
                <PdfFilePreview fileUrl={fileUrl} onOpenFile={this.openFile} />
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
        cnsole.log('[analytics] openFile: ', collection, groupId, idx, me.sender);
        openUrlOrRoute({ url: fileUrl });
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
                <View style={{ borderRadius: 16, padding: 10, paddingBottom: 0 }}>
                    <TouchableAnim onPress={this.openFile} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Image src={DOWNLOAD_FILE_BUTTON} style={{ height: 25, width: 25 }} />
                        <Text style={{ marginLeft: 5 }}>{name}</Text>
                    </TouchableAnim>
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
            cnsole.log('Exception in getting GSP location: ', e);
            const location = {lat: -1, lng: -1};
            await this.props.onNewMsgFn({ answer: 'GPS failed', type: OUTPUT_LOCATION, latitude: -1, longitude: -1, location, geocodeResult: null });
        }
    };
    onOpenLocation = (location) => {
        const { collection, groupId, idx, me } = this.props;
        cnsole.log('[analytics] onOpenLocation: ', collection, groupId, idx, me.sender, location);
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
                                   style={customStyle.locationImg} />
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
                {icon}
                <Text style={customStyle.missedCall}>&nbsp;{whoToWho}: call missed - {timeDisplay}&nbsp;</Text>
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
        cnsole.log('Selected locality: ', obj);
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
        cnsole.log('Selected: ', x);
        this.setState({ selectedOptions: [x], enabled: false });
        await this.props.onNewMsgFn({ answer: x });
    };
    toggleMultipleFn = (x) => {
        cnsole.log('Selected: ', x);
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
        cnsole.log('enabled, theme, initialSelected, selectedOptions: ', enabled, theme, initialSelected, this.state.selectedOptions);
        cnsole.log('initialSelected: ', initialSelected);


        const selections = getKeysWhereValueIs(this.state.selections, true);
        const doneBtn = selections.length > 0 ?
            actionButton('DONE', this.doneFn, {minWidth: 100, width: 100, height: 40}) :
            actionButton('DONE', () => {}, {minWidth: 100, width: 100, height: 40, style: {backgroundColor: '#c1c1c1', color: '#717171'}});

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
        cnsole.log('Applied to job: ', job);
        const jobId = getJobId(job);
        this.setState({ enabled: false });
        await this.props.onNewMsgFn({ answer: OPTION_YES, type: OUTPUT_TEXT, jobId });
    };
    rejectJobFn = async (job) => {
        cnsole.log('Rejected job: ', job);
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
        cnsole.log('renderJob: ', message, job, idx, enabled, isTest, key);

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
        cnsole.log('brief job label: ', label);
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
        cnsole.log('renderJob: ', message, job, idx, enabled, key);

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
        const { modalOpen } = this.state;
        const { idx, me, message, idToDetails, ipLocation, groupInfo } = this.props;
        const { showMemberAddNotifications } = groupInfo;
        const { sender, loc } = message;
        const senderName = (idToDetails && sender in idToDetails) ? idToDetails[sender].person.name : sender;

        const modal = <MessageAPersonModal key={'modal-' + idx} sender={sender} {...this.props}
                                           modalOpen={modalOpen} closeFn={() => this.setState({ modalOpen: false })} />;

        const distKms = ipLocation && loc ? haversineDistanceKms(ipLocation, loc) : 1000;
        // cnsole.log('ipLocation, loc, dist: ', ipLocation, loc, distKms);
        const text = distKms < SHOW_NEW_JOINEE_DISTANCE_THRESHOLD_KM ? <Text>{senderName} joined - {distKms.toFixed(1)} km near you</Text> : <Text>{senderName} joined</Text>;

        if (!showMemberAddNotifications) {
            return (<View key={idx + ''} />);
        }

        return (
            <View style={customStyle.missedCallCtr} key={idx + ''}>
                <TouchableAnim onPress={() => this.setState({ modalOpen: true })}>
                    <Text style={customStyle.newJoinee}>{text}</Text>
                </TouchableAnim>
                {modalOpen && modal}
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
            <View style={customStyle.missedCallCtr} key={idx + ''}>
                <TouchableAnim onPress={() => {}}>
                    <Text style={customStyle.newJoinee}>{text}</Text>
                </TouchableAnim>
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
        cnsole.log('DEBUG likes widget: ', key, value);
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
            openUrlOrRoute({ url });
            this.props.closeFn();
        };
        const onPressView = () => {
            const url = format('{}?roleId={}', GROUP_URLS.viewPerson, sender);
            window.open(url);
            this.props.closeFn();
        };

        return (
            <Modal isOpen={modalOpen} visible={modalOpen} isVisible={modalOpen}
                   backdropOpacity={0.5} style={modalStyle}
                   onRequestClose={this.props.closeFn} onBackdropPress={this.props.closeFn}
                   onAfterOpen={() => {}} contentLabel="Example Modal">
                <View style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ borderRadius: 10, backgroundColor: '#ffffff', padding: 20,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                        <TouchableAnim onPress={onPressMessage} style={{ }}>
                            <Text style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: 17 }}>Message {senderName}</Text>
                        </TouchableAnim>

                        {spacer(25)}
                        <TouchableAnim onPress={onPressView} style={{ }}>
                            <Text style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: 17 }}>View {senderName}</Text>
                        </TouchableAnim>
                    </View>
                </View>
            </Modal>
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
        const files = fileInputRef.current.refElem().files;
        cnsole.log('files: ', files);
        const blobUrl = await uploadBlob(files[0]);
        disableFn();
        if (blobUrl) {
            await onNewMsgFn({ answer: blobUrl, type });
        }
    };
    const onAudioDoneFn = async (audioFile) => {
        const blobUrl = await uploadBlob(audioFile);
        disableFn();
        if (blobUrl) {
            await onNewMsgFn({ answer: blobUrl, type });
        }
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
    cnsole.log('calling phone: ', { phone, me, messageSender });
    GA.event({category: 'phone-click', action: 'click', label: [phone, me, messageSender].join(',')});
};

const addPhoneTracking = (text, me, messageSender) => {
    return text.replace(/(?:\b|^)(\+91[1-9][0-9]{9}|0[0-9]{10}|[1-9][0-9]{9})\b/g, `<a href="tel:$1" onclick="window.trackPhone(\'$1\', \'${me}\', \'${messageSender}\')">$1</a>`);
};


const SHOW_NEW_JOINEE_DISTANCE_THRESHOLD_KM = 10;
const MIN_SPEECH_RECOGNITION_MS = 3 * 1000;
const MAX_SPEECH_RECOGNITION_MS = 8 * 1000;
const INNER_WIDTH_MAX = Math.min(WINDOW_INNER_WIDTH, 450);
const MESSAGE_SHELL_MAX_WIDTH = INNER_WIDTH_MAX - 100;
const SCR_WIDTH = Math.min(WINDOW_INNER_WIDTH - 2, INNER_WIDTH_MAX);
const SEND_ICON = 'https://images-lb.heloprotocol.in/sendButton.png-6412-355572-1556567055483.png';
const MIC_ICON = 'https://images-lb.heloprotocol.in/micTransparent.png-14784-992191-1562241230129.png';
const MIC_ICON_DISABLED = 'https://images-lb.heloprotocol.in/micDisabled.png-10163-675042-1564599701870.png';
const STATIC_MAPS_IMG_HEIGHT = 200;
const STATIC_MAPS_IMG_WIDTH = 200;
const ID_CARD_WIDTH = 390;
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
    },
    missedCall: {
        color: '#ff0000',
        fontSize: 13,
        padding: 5,
        backgroundColor: '#efefef',
        borderRadius: 10,
    },

    newJoinee: {
        color: 'rgba(0, 0, 0, 0.7)',
        fontSize: 13,
        padding: 10,
        backgroundColor: 'rgba(0, 0, 255, 0.12)',
        borderRadius: 10,
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
        padding: 5,
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

export {
    TextMessage,
    ProgressiveModule,
    ImageMessage,
    AudioMessage,
    VideoMessage,
    PdfMessage,
    FileMessage,
    LocationMessage,
    MissedCallMessage,
    PlacesAutocompleteMessage,
    OptionsMessage,
    JobMessage,
    BriefJobMessage,
    IDCardMessage,
    NewJoinee,
    SystemMessage,
};
