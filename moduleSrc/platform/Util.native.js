import {
    AsyncStorage,
    Dimensions,
    Image as ImageOrig,
    ImageBackground,
    NativeModules,
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
import {flattenStyleArray} from "../util/Util";
import {Popover} from 'react-native-modal-popover';
import {MWEB_URL, PLAY_VIDEO_OVERLAY_ICON} from "../constants/Constants";
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import WebView from 'react-native-webview';
import format from 'string-format';
import {HOME_PAGE_URLS} from "../controller/Urls";


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
    render() {
        let props = {...this.props};
        const { src,  } = props;
        if (src) {
            delete props.src;
        }

        // TODO: Fix these properties properly
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
        return <ImageOrig source={{ uri: src }} style={style} {...props} />;
    }
}

export class Dummy extends React.Component {
    render() {
        return <Text>dummy</Text>;
    }
}
export class AudioElem extends React.Component {
    render() {
        return <Text>audio element</Text>;
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
        const { encoded } = await NativeModules.ThumbnailModule.createVideoThumbnail(src, width, height, 20);
        this.setState({ base64: encoded });
    }

    startPlaying = () => {
        StatusBar.setHidden(true);
        this.setState({ playing: true });
    };
    stopPlaying = () => {
        this.setState({ playing: false });
        StatusBar.setHidden(false);
    };

    render() {
        const { src, width=250, height=250 } = this.props;
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
                            <ImageOrig source={{ uri: PLAY_VIDEO_OVERLAY_ICON }} style={{ height: 50, width: 50 }} />
                        </ViewOrig>
                    </ViewOrig>
                </TouchableHighlight>
            );
        }

        if (USE_WEBVIEW_FOR_VIDEO) {
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
                <VideoWithControls src={src} onTimeUpdate={this.props.onTimeUpdate} />
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
        this.props.onTimeUpdate({ currentTime, duration: seekableDuration, ...extra });
    };
    onBuffer = (elem) => console.log('VideoElem onBuffer: ', elem);
    onError = (err) => console.log('VideoElem onError: ', err);

    showControls = () => {
        this.setState({ showControls: true });
        setTimeout(() => this.setState({ showControls: false }), 2000);
    };
    handlePlayPause = () => {
        const { play } = this.state;
        this.setState({ play: !play, showControls: true });
        setTimeout(() => this.setState({ showControls: false }), 2000);
    };
    onSeek = (data) => {
        const { seekTime } = data;
        this.videoRef.current.seek(seekTime);
        this.setState({ currentTime: seekTime });
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
                <ProgressBar
                    currentTime={currentTime}
                    duration={duration > 0 ? duration : 0}
                    onSlideStart={this.handlePlayPause}
                    onSlideComplete={this.handlePlayPause}
                    onSlideCapture={this.onSeek}
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
        const VIDEO_BACK_15_SECS = 'https://images-lb.heloprotocol.in/video-backward.png-3372-382572-1581592203963.png';
        const VIDEO_FORWARD_15_SECS = 'https://images-lb.heloprotocol.in/video-forward.png-3523-471032-1581592233062.png';
        const VIDEO_PAUSE = 'https://images-lb.heloprotocol.in/video-pause.png-2801-749113-1581592263724.png';
        const VIDEO_PLAY = 'https://images-lb.heloprotocol.in/video-play.png-2648-388659-1581592273087.png';

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
        const minutes = time >= 60 ? Math.floor(time / 60) : 0;
        const seconds = Math.floor(time - minutes * 60);

        return `${minutes >= 10 ? minutes : '0' + minutes}:${seconds >= 10 ? seconds : '0' + seconds}`;
    };

    handleOnSlide = (time) => {
        this.props.onSlideCapture({ seekTime: time });
    };

    render() {
        const { currentTime, duration, onSlideStart, onSlideComplete } = this.props;
        const position = this.getMinutesFromSeconds(currentTime);
        const fullDuration = this.getMinutesFromSeconds(duration);

        return (
            <ViewOrig style={customStyle.progressBar.wrapper}>
                <Slider
                    value={currentTime}
                    minimumValue={0}
                    maximumValue={duration}
                    step={1}
                    onValueChange={this.handleOnSlide}
                    onSlidingStart={onSlideStart}
                    onSlidingComplete={onSlideComplete}
                    minimumTrackTintColor={'#F44336'}
                    maximumTrackTintColor={'#FFFFFF'}
                    thumbTintColor={'#F44336'}
                />
                <ViewOrig style={customStyle.progressBar.timeWrapper}>
                    <Text style={customStyle.progressBar.timeLeft}>{position}</Text>
                    <Text style={customStyle.progressBar.timeRight}>{fullDuration}</Text>
                </ViewOrig>
            </ViewOrig>
        );
    }
}

export class InputElem extends React.Component {
    render() {
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : ({...this.props.style} || {});
        if (style.display === 'none') {
            return <View style={{ height: 0, width: 0 }} />;
        }
        return <Text>input elem</Text>;
    }
}
export class TextareaElem extends React.Component {
    render() {
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : ({...this.props.style} || {});
        style.height = 50;
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
// export const renderHtmlText = (html) => <WebView source={{ html }} />;
export const renderHtmlText = (html) => <Text>{html}</Text>;

export const recordAudio = (timeslice, dataAvailableCbFn) => new Promise(async resolve => {});

export const getGpsLocation = async () => {};

export const uploadBlob = async (file) => {};

export const initWebPush = async (forceUpdate) => {};

export const showToast = (text) => {
    Toast.show(text, Toast.LONG);
};

export const reverseGeocode = async ({ latitude, longitude }) => {};
export const playBeepSound = () => {};
export const scrollToBottomFn = () => {};
export const scrollToElemFn = (ref) => {};
export const resizeForKeyboard = ({ mode, msgToScrollTo, cbFn }) => {};

export const WINDOW_INNER_WIDTH = Dimensions.get('window').width;
export const WINDOW_INNER_HEIGHT = Dimensions.get('window').height;

console.log('WINDOW_INNER_WIDTH: ', WINDOW_INNER_WIDTH);
console.log('WINDOW_INNER_HEIGHT: ', WINDOW_INNER_HEIGHT);


const USE_WEBVIEW_FOR_VIDEO = false;
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
}
