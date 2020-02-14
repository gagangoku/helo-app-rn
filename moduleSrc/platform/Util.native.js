import {
    AsyncStorage,
    Dimensions,
    Image as ImageOrig,
    ImageBackground,
    NativeModules,
    PermissionsAndroid,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text as TextOrig,
    TextInput,
    ToastAndroid as Toast,
    TouchableHighlight,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View as ViewOrig,
} from 'react-native';
import ModalOrig from 'react-native-modal';
import React from "react";
import {checkFileType, flattenStyleArray} from "../util/Util";
import {Popover} from 'react-native-modal-popover';
import {
    API_URL,
    MWEB_URL,
    PLAY_ARROW_ICON,
    PLAY_VIDEO_OVERLAY_ICON,
    VIDEO_BACK_15_SECS,
    VIDEO_FORWARD_15_SECS,
    VIDEO_PAUSE,
    VIDEO_PLAY
} from "../constants/Constants";
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import WebView from 'react-native-webview';
import format from 'string-format';
import {HOME_PAGE_URLS} from "../controller/Urls";
import HTML from 'react-native-render-html';
import {Player, Recorder} from '@react-native-community/audio-toolkit';
import rnfs from 'react-native-fs';
import window from "global";
import ImagePicker from 'react-native-image-picker';
import {TouchableOpacity as TouchableOpacityRNGH} from 'react-native-gesture-handler';


export const HEIGHT_BUFFER = 30;

// TODO: Implement
export const stopBodyOverflow = () => {};
export const bodyOverflowAuto = () => {};
export const historyBack = () => {};


export class Modal extends React.Component {
    render() {
        // React Native expects fontWeight to be string
        const props = {...this.props};
        delete props.children;
        delete props.style;
        return (
            <ModalOrig {...props}>
                {this.props.children}
            </ModalOrig>
        );
    }
}

export class View extends React.Component {
    refElem = () => null;
    render() {
        // React Native expects fontWeight to be string
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : ({...this.props.style} || {});
        const { fontWeight } = style;
        if (Number.isInteger(fontWeight)) {
            style.fontWeight = '' + fontWeight;
        }

        if (style.display === 'flex') {
            delete style.display;
        }
        const props = {...this.props, style};
        return (
            <ViewOrig {...props}>
                {this.props.children}
            </ViewOrig>
        );
    }
}
export class Text extends React.Component {
    render() {
        // React Native expects fontWeight to be string
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : ({...this.props.style} || {});
        if (Number.isInteger(style.fontWeight)) {
            style.fontWeight = '' + style.fontWeight;
        }

        const props = {...this.props, style: {...style}};
        return (
            <TextOrig {...props}>
                {this.props.children}
            </TextOrig>
        );
    }
}
export class Image extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    async componentDidMount() {
        const { src, style } = this.props;
        if (!style.height && !style.width) {
            ImageOrig.getSize(src, (width, height) => {
                console.log('Got image width, height: ', width, height, src);
                this.setState({ width, height });
            }, () => {
                console.log('Failed to load image width, height: ', src);
            });
        }
    }

    render() {
        let props = {...this.props};
        const { src } = props;
        if (src) {
            delete props.src;
        }

        // TODO: Fix these properties properly
        const extra = {};
        const style = props.style ? {...props.style} : {};
        props.style && delete props.style;
        if (style.cursor) {
            delete style.cursor;
        }
        if (style.objectFit) {
            delete style.objectFit;
        }
        if (style.border) {
            delete style.border;
        }
        if (!style.width && !style.height) {
            const M = 100;
            style.width = Math.min(this.state.width || M, style.maxWidth || M);
            style.aspectRatio = this.state.width ? this.state.width / this.state.height : 1;

            style.maxWidth = style.width;
            style.maxHeight = style.width / style.aspectRatio;
        }
        return <ImageOrig source={{ uri: src }} {...props} style={style} {...extra} />;
    }
}

export class Dummy extends React.Component {
    render() {
        return <Text>dummy</Text>;
    }
}
export class AudioElem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            currentTime: 0,
            playing: false,

            seeking: false,
        };
    }
    async componentDidMount() {
        this.player = new Player(this.props.src, { autoDestroy: false, continuesToPlayInBackground: true });
        await new Promise(resolve => this.player.prepare(resolve));
        const duration = this.player.duration;
        console.log('player ready: ', duration);
        this.setState({ ready: true, duration });

        this.player.on('ended', async (data) => {
            console.log('player Ended');
            this.setState({ playing: false, seeking: true });
            await new Promise(resolve => this.player.seek(0, resolve));
            this.setState({ seeking: false });

            this.intervalID !== null && clearInterval(this.intervalID);
        });
    }
    componentWillUnmount() {
        this.intervalID !== null && clearInterval(this.intervalID);
        this.player && this.player.destroy();
    }

    intervalFn = () => {
        const { seeking } = this.state;
        if (!seeking) {
            const currentTime = this.player.currentTime;
            this.setState({ currentTime });
            console.log('Player currentTime: ', currentTime);
        }
    };

    handlePlayPause = async () => {
        const { playing, seeking } = this.state;
        console.log('handlePlayPause playing, seeking: ', playing, seeking);
        if (seeking) {
            return;
        }

        if (playing) {
            this.intervalID !== null && clearInterval(this.intervalID);
            this.intervalID = null;
            await new Promise(resolve => this.player.pause(resolve));
        } else {
            this.intervalID = setInterval(this.intervalFn, 200);
            await new Promise(resolve => this.player.play(resolve));
        }
        this.setState({ playing: !playing });
        console.log('Player new state: ', playing);
    };
    onSeek = async (data) => {
        console.log('onSeek: ', data);
        const { seekTime } = data;
        this.setState({ currentTime: seekTime, seeking: true });
        await new Promise(resolve => this.player.seek(seekTime, resolve));
        this.setState({ seeking: false });
    };

    render() {
        const { currentTime, ready, playing, duration, seeking } = this.state;
        if (!ready) {
            return <ViewOrig />;
        }

        const pauseImg = <ImageOrig source={{ uri: VIDEO_PAUSE }} style={{ height: 40, width: 40, opacity: 0.5 }} />;
        const playImg = <ImageOrig source={{ uri: PLAY_ARROW_ICON }} style={{ height: 30, width: 30, marginLeft: 10 }} />;
        const minimumTrackTintColor='#F44336', maximumTrackTintColor='#747474', thumbTintColor='#F44336';
        return (
            <ViewOrig style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: 250 }}>
                <TouchableWithoutFeedback onPress={this.handlePlayPause}>
                    {playing ? pauseImg : playImg}
                </TouchableWithoutFeedback>
                <ViewOrig style={{ marginLeft: -5, marginTop: 10, width: '100%', maxWidth: 220 }}>
                    <ProgressBar currentTime={currentTime} duration={duration} toSecScaleFactor={1000}
                                 onSlideStart={() => {}} onSlideComplete={() => {}} onSlideValueChange={this.onSeek}
                                 textStyle={{ color: '#727272', fontSize: 13 }}
                                 {...{ minimumTrackTintColor, maximumTrackTintColor, thumbTintColor }}
                    />
                </ViewOrig>
            </ViewOrig>
        );
    }
}
export class VideoElem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            base64: null,
            playing: false,
        };
    }
    async componentDidMount() {
        const { src, width=250, height=250 } = this.props;
        try {
            const obj = await NativeModules.ThumbnailModule.createVideoThumbnail(src, width, height, 50);
            const {encoded, time} = obj;
            this.setState({ base64: encoded, duration: parseInt(time) / 1000 });
        } catch (e) {
            console.log('Exception in getting thumbnail: ', src, e);
        }
    }
    refElem = () => ({ duration: this.state.duration });

    startPlaying = () => {
        StatusBar.setHidden(true);
        this.setState({ playing: true });
    };
    stopPlaying = () => {
        this.setState({ playing: false });
        StatusBar.setHidden(false);
    };

    render() {
        const { src, width=200, height=200, controlsAutohideInMs=3000, useWebviewInstead } = this.props;
        const { base64, playing } = this.state;
        if (!base64) {
            return <ViewOrig style={{ height, width }} />;
        }

        if (!playing) {
            const base64Icon = 'data:image/jpg;base64,' + base64;
            return (
                <TouchableHighlight onPress={this.startPlaying}>
                    <ViewOrig style={{ height, width, position: 'relative' }}>
                        <ViewOrig style={{ height, width, opacity: 0.8 }}>
                            <ImageOrig source={{ uri: base64Icon }} style={{ height, width }} />
                        </ViewOrig>
                        <ViewOrig style={{ position: 'absolute', top: 0, left: 0, height, width,
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <ImageOrig source={{ uri: PLAY_VIDEO_OVERLAY_ICON }} style={{ height: 80, width: 80 }} />
                        </ViewOrig>
                    </ViewOrig>
                </TouchableHighlight>
            );
        }

        if (useWebviewInstead) {
            const [collection, groupId, idx, user] = ['tmp', 'tmp', 0, 'tmp'];      // TODO: Get from props
            const analyticsUrl = format('{}{}?collection={}&groupId={}&idx={}&user={}&videoUrl={}',
                MWEB_URL, HOME_PAGE_URLS.videoAnalytics, collection, groupId, idx, user, encodeURIComponent(src));
            return (
                <ModalOrig isVisible={playing}
                           backdropOpacity={0.5} style={{ margin: 0, padding: 0 }}
                           onRequestClose={this.stopPlaying} onBackdropPress={this.stopPlaying}
                           contentLabel="Example Modal">
                    <WebView source={{ uri: analyticsUrl }} style={{ height: '100%', width: '100%' }} />
                </ModalOrig>
            );
        }

        return (
            <ModalOrig isVisible={playing}
                       backdropOpacity={0.5} style={{ margin: 0, padding: 0 }}
                       onRequestClose={this.stopPlaying} onBackdropPress={this.stopPlaying}
                       contentLabel="Example Modal">
                <VideoWithControls src={src} onTimeUpdate={this.props.onTimeUpdate} controlsAutohideInMs={controlsAutohideInMs} />
            </ModalOrig>
        );
    }
}

class VideoWithControls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showControls: false,
            play: true,
            currentTime: 0,
        };
        this.videoRef = React.createRef();
    }

    onProgress = ({ currentTime, seekableDuration, ...extra }) => {
        this.setState({ currentTime });
        const onTimeUpdateFn = this.props.onTimeUpdate || (() => {});
        onTimeUpdateFn({ currentTime, duration: seekableDuration, ...extra });
    };
    onBuffer = (elem) => console.log('VideoElem onBuffer: ', elem);
    onError = (err) => console.log('VideoElem onError: ', err);

    showControls = () => {
        this.setState({ showControls: true });
        setTimeout(() => this.setState({ showControls: false }), this.props.controlsAutohideInMs);
    };
    handlePlayPause = () => {
        const { play } = this.state;
        this.setState({ play: !play, showControls: true });
        setTimeout(() => this.setState({ showControls: false }), this.props.controlsAutohideInMs);
    };
    onSeek = (data) => {
        const { seekTime } = data;
        this.setState({ currentTime: seekTime });
        this.videoRef.current.seek(seekTime);
    };
    skipBackward = () => {
        this.videoRef.current.seek(this.state.currentTime - 15);
        this.setState({ currentTime: this.state.currentTime - 15 });
    };
    skipForward = () => {
        this.videoRef.current.seek(this.state.currentTime + 15);
        this.setState({ currentTime: this.state.currentTime + 15 });
    };
    onLoadEnd = (data) => {
        const { duration, currentTime } = data;
        this.setState({ duration, currentTime });
    };
    onEnd = () => {
        this.videoRef.current.seek(0);
        this.setState({ play: false });
    };

    render() {
        const { src } = this.props;
        const { play, showControls, currentTime, duration } = this.state;

        const controls = (
            <ViewOrig style={customStyle.controlOverlay}>
                <PlayerControls
                    onPlay={this.handlePlayPause}
                    onPause={this.handlePlayPause}
                    playing={play}
                    showSkip={true}
                    skipBackwards={this.skipBackward}
                    skipForwards={this.skipForward}
                />
                <ProgressBar currentTime={currentTime} duration={duration > 0 ? duration : 0}
                             onSlideStart={() => {}} onSlideComplete={() => {}} onSlideValueChange={this.onSeek}
                />
            </ViewOrig>
        );
        return (
            <ViewOrig style={customStyle.container}>
                <TouchableWithoutFeedback onPress={this.showControls}>
                    <ViewOrig>
                        <Video source={{ uri: src }}                    // Can be a URL or a local file.
                               controls={false} resizeMode="cover" fullScreen={true}
                               ref={this.videoRef} paused={!play}
                               onLoad={this.onLoadEnd} onEnd={this.onEnd}
                               onProgress={this.onProgress} onBuffer={this.onBuffer} onError={this.onError}
                               style={{ height: '100%', width: '100%', backgroundColor: 'black' }} />

                        {showControls && controls}
                    </ViewOrig>
                </TouchableWithoutFeedback>
            </ViewOrig>
        );
    }
}

class PlayerControls extends React.PureComponent {
    render() {
        const { skipBackwards, skipForwards, onPause, onPlay, playing } = this.props;
        const videoPause = <ImageOrig source={{ uri: VIDEO_PAUSE }} style={{ height: 80, width: 80 }} />;
        const videoPlay = <ImageOrig source={{ uri: VIDEO_PLAY }} style={{ height: 80, width: 80 }} />;
        const videoSkipBack = <ImageOrig source={{ uri: VIDEO_BACK_15_SECS }} style={{ height: 50, width: 50 }} />;
        const videoSkipForward = <ImageOrig source={{ uri: VIDEO_FORWARD_15_SECS }} style={{ height: 50, width: 50 }} />;
        return (
            <ViewOrig style={customStyle.player.wrapper}>
                <TouchableOpacity style={customStyle.player.touchable} onPress={skipBackwards}>
                    {videoSkipBack}
                </TouchableOpacity>

                <TouchableOpacity style={customStyle.player.touchable} onPress={playing ? onPause : onPlay}>
                    {playing ? videoPause : videoPlay}
                </TouchableOpacity>

                <TouchableOpacity style={customStyle.player.touchable} onPress={skipForwards}>
                    {videoSkipForward}
                </TouchableOpacity>
            </ViewOrig>
        );
    }
}

class ProgressBar extends React.PureComponent {
    getMinutesFromSeconds = (time) => {
        const { toSecScaleFactor = 1} = this.props;
        time /= toSecScaleFactor;
        const minutes = time >= 60 ? Math.floor(time / 60) : 0;
        const seconds = Math.floor(time - minutes * 60);
        return `${minutes >= 10 ? minutes : '0' + minutes}:${seconds >= 10 ? seconds : '0' + seconds}`;
    };

    handleOnSlide = (time) => {
        const { duration } = this.props;
        this.props.onSlideValueChange({ seekTime: time });
    };

    render() {
        const { currentTime, duration, onSlideStart, onSlideComplete, textStyle={} } = this.props;
        const { minimumTrackTintColor='#F44336', maximumTrackTintColor='#FFFFFF', thumbTintColor='#F44336' } = this.props;
        const position = this.getMinutesFromSeconds(currentTime);
        const fullDuration = this.getMinutesFromSeconds(duration);

        return (
            <ViewOrig style={customStyle.progressBar.wrapper}>
                <Slider
                    value={currentTime}
                    minimumValue={0}
                    maximumValue={duration}
                    step={0.0001}
                    onValueChange={this.handleOnSlide}
                    onSlidingStart={onSlideStart}
                    onSlidingComplete={onSlideComplete}
                    minimumTrackTintColor={minimumTrackTintColor}
                    maximumTrackTintColor={maximumTrackTintColor}
                    thumbTintColor={thumbTintColor}
                />
                <ViewOrig style={customStyle.progressBar.timeWrapper}>
                    <Text style={{...customStyle.progressBar.timeLeft, ...textStyle}}>{position}</Text>
                    <Text style={{...customStyle.progressBar.timeRight, ...textStyle}}>{fullDuration}</Text>
                </ViewOrig>
            </ViewOrig>
        );
    }
}

class InputTypeFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
        };
    }
    refElem = () => {
        const { files } = this.state;
        const { type, accept, onChange } = this.props;
        if (type === 'file') {
            const acceptImg = accept.includes('image/');
            const acceptVideo = accept.includes('video/');
            const acceptAudio = accept.includes('audio/');
            const acceptFiles = accept.includes('application/');
            let mediaType;
            if (acceptImg && !acceptVideo && !acceptAudio && !acceptFiles) {
                mediaType = 'photo';
            } else if (!acceptImg && acceptVideo && !acceptAudio && !acceptFiles) {
                mediaType = 'video';
            } else {
                mediaType = 'mixed';
            }

            return {
                files,
                click: () => ImagePicker.showImagePicker({ mediaType }, async (response) => {
                    const file = {...response};

                    // Weird file, nothing to go on
                    if (!file.uri && !file.path) {
                        console.log('ERROR: File doesnt have uri or path, skipping: ', response);
                        return;
                    }

                    // Get file name
                    if (!file.name) {
                        if (file.fileName) {
                            file.name = file.fileName;
                        } else if (file.path) {
                            const splits = file.path.split('/');
                            file.name = splits[splits.length - 1];
                        } else if (file.uri) {
                            const splits = file.uri.split('/');
                            file.name = splits[splits.length - 1];
                        } else {
                            console.log('ERROR: Could not get filename, skipping: ', response);
                            return;
                        }
                    }

                    if (!file.uri) {
                        file.uri = file.path.startsWith('file:') ? file.path : 'file://' + file.path;
                    }

                    if (!file.size) {
                        const stat = await rnfs.stat(file.path);
                        file.size = stat.size;
                    }

                    if (!file.type) {
                        file.type = checkFileType(file.name, '').fileType;
                    }
                    delete file.data;
                    console.log('image picker response: ', file);

                    if (file.uri) {
                        await new Promise(resolve => this.setState({ files: [file] }, resolve));
                        onChange(this);
                    }
                })
            };
        }
        return { click: () => {}, files };
    };
    render() {
        return <ViewOrig style={{ height: 0, width: 0 }} />;
    }
}

class InputTypeText extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }
    refElem = () => this.ref.current;

    render() {
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : ({...this.props.style} || {});
        style.height = style.height || 50;
        const props = {...this.props, style};
        return (
            <TextInput {...props} />
        );
    }
}

export class InputElem extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }
    refElem = () => this.ref.current.refElem();
    render() {
        const props = {...this.props};
        const { type } = props;
        if (type === 'file') {
            return <InputTypeFile {...props} ref={this.ref} />;
        }
        if (type === 'text') {
            delete props.onChange;
            return <InputTypeText {...props} ref={this.ref} />;
        }
        return <TextOrig>Unknown input tag</TextOrig>;
    }
}
export class TextareaElem extends React.Component {
    render() {
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : ({...this.props.style} || {});
        style.height = style.height || 50;
        const props = {...this.props, style, multiline: true};
        return (
            <TextInput {...props} />
        );
    }
}

export const Switch = Dummy;
export const PlacesAutocomplete = Dummy;
export const Route = Dummy;
export const Helmet = Dummy;
export const ReactMinimalPieChart = Dummy;
export const GoogleMapReact = Dummy;

export const withStyles = (styles) => {
    return (component) => component;
};


export const confirmAlert = () => {};
export const geocodeByAddress = () => {};
export const getLatLng = () => {};

export const mobileDetect = () => {
    return { isAndroid: true, isIphone: false };
};

export const getUrlParam = (param, loc) => {
    return '';
};
export const getUrlPath = (url) => {
    return '';
};
export const getUrlSearchParams = (url) => {
    return {};
};
export const isDebugMode = () => {
    return false;
};
export const renderHtmlText = (html, styleObj) => {
    return (
        <HTML html={'<div>' + html + '</div>'} tagsStyles={{ div: styleObj }} imagesMaxWidth={Dimensions.get('window').width} />
    );
};

export const recordAudio = async (timeslice, dataAvailableCbFn) => {
    await requestMicPermission();
    const name = 'recorder-' + (new Date().getTime()) + '.aac';
    const recorder = new Recorder(name, { format: 'aac' });

    const [res, path] = await new Promise(resolve => recorder.prepare((a, b) => {
        resolve([a, b]);
    }));
    console.log('recordAudio prepare result: ', res, path);

    const start = () => {
        console.log('starting recorder.record');
        recorder.record();
    };
    const stop = async () => {
        await new Promise(resolve => recorder.stop(resolve));

        const stat = await rnfs.stat(path);
        console.log('file stat: ', stat, path);
        await new Promise(resolve => recorder.destroy(resolve));

        const audioBlob = {
            uri: path.startsWith('file:') ? path : 'file://' + path,         // NOTE: file:// prefix is required in Android
            type: 'audio/aac',
            name,
            size: stat.size,
        };
        const audioUrl = audioBlob;
        const play = () => {};
        return { audioBlob, audioUrl, play };
    };
    return {start, stop};
};

export const getGpsLocation = async () => {};

export const fileFromBlob = (blob, filePrefix) => {
    return blob;
};

export const uploadBlob = async (file) => {
    console.log('uploadBlob file: ', file);
    if (!file) {
        return null;
    }

    const fileName = file.name.toLowerCase();
    const { maxFileSize, serverUrl } = checkFileType(fileName, file.type);
    if (file.size > maxFileSize) {
        window.alert('Too big');
        return null;
    }

    const data = new FormData();
    data.append('file', file);
    console.log('FormData: ', data);

    try {
        const url = format(API_URL + '/v1/blob/uploadBlob?fileType={}&fileName={}', encodeURIComponent(file.type), encodeURIComponent(file.name));
        const response = await fetch(url, {
            method: 'POST',
            body: data,
        });
        console.log('Blob upload response: ', response);
        const text = await response.text();
        console.log('Blob upload output: ', text);
        return serverUrl + '/' + text.split('id=')[1];
    } catch (ex) {
        console.log('Upload failed: ', ex);
        window.alert('Failed: ' + ex + '. Make sure image size is within limits');
        return null;
    }
};

export const initWebPush = async (forceUpdate) => {};

export const showToast = (text) => {
    Toast.show(text, Toast.LONG);
};

export const reverseGeocode = async ({ latitude, longitude }) => {};
export const playBeepSound = () => {};
export const scrollToBottomFn = () => {};
export const scrollToElemFn = (ref) => {};
export const resizeForKeyboard = ({ mode, msgToScrollTo, cbFn }) => {};


export const requestMicPermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
                title: 'Microphone permission',
                message:
                    'Cool Photo App needs access to your camera ' +
                    'so you can take awesome pictures.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('requestMicPermission: You can use the mic');
            return true;
        } else {
            console.log('requestMicPermission: Mic permission denied');
            return false;
        }
    } catch (err) {
        console.warn(err);
        return false;
    }
};



export const WINDOW_INNER_WIDTH = Dimensions.get('window').width;
export const WINDOW_INNER_HEIGHT = Dimensions.get('window').height;

console.log('WINDOW_INNER_WIDTH: ', WINDOW_INNER_WIDTH);
console.log('WINDOW_INNER_HEIGHT: ', WINDOW_INNER_HEIGHT);


const customStyle = {
    container: {
        flex: 1,
        backgroundColor: '#ebebeb',
    },
    controlOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#00000040',
        justifyContent: 'space-between',
    },
    showControls: {
        visibility: 'visible',
    },
    hideControls: {
        visibility: 'hidden',
    },
    player: {
        wrapper: {
            paddingHorizontal: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            flex: 3,
        },
        touchable: {
            padding: 5,
        },
        touchableDisabled: {
            opacity: 0.3,
        },
    },
    progressBar: {
        wrapper: {
            flex: 1,
        },
        timeWrapper: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 5,
        },
        timeLeft: {
            flex: 1,
            fontSize: 16,
            color: '#FFFFFF',
            paddingLeft: 10,
        },
        timeRight: {
            flex: 1,
            fontSize: 16,
            color: '#FFFFFF',
            textAlign: 'right',
            paddingRight: 10,
        },
    },
};

export {
    AsyncStorage, StyleSheet, Toast, ScrollView, ImageBackground,
    ViewOrig,
    Popover,
    TouchableOpacityRNGH,
}
