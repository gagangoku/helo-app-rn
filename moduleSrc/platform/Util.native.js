import {
    AsyncStorage,
    Clipboard,
    Dimensions,
    Image as ImageOrig,
    ImageBackground,
    Linking,
    NativeModules,
    PermissionsAndroid,
    Platform,
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
import {checkFileType, flattenStyleArray, sumFn} from "../util/Util";
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
import DocumentPicker from 'react-native-document-picker';
import Pdf from 'react-native-pdf';
import TouchableAnim from "./TouchableAnim";
import {PieChart} from 'react-native-svg-charts';
import * as Svg from 'react-native-svg';
import cnsole from 'loglevel';
import ImageZoom from 'react-native-image-pan-zoom';
import * as rf from '../router/InternalState.native';
import 'flatbuffers';
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";


export const HEIGHT_BUFFER = 30;

// TODO: Implement
export const stopBodyOverflow = () => {};
export const bodyOverflowAuto = () => {};


export const phoneNumberSelector = async () => {
    try {
        const obj = await NativeModules.PhoneNumberHintModule.phoneNumberSelector();
        cnsole.info('PhoneNumberHintModule.phoneNumberSelector: ', obj);
        return obj;
    } catch (e) {
        cnsole.error('Exception in phoneNumberSelector: ', e);
    }
    return {};
};

export class Modal extends React.Component {
    render() {
        // React Native expects fontWeight to be string
        const props = {...this.props};
        delete props.children;
        delete props.style;
        cnsole.info('rendering modal 1');
        return (
            <ModalOrig {...props} style={{ margin: 0, padding: 0 }}>
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
    async componentDidMount() {
    }
    render() {
        // React Native expects fontWeight to be string
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : ({...this.props.style} || {});
        if (Number.isInteger(style.fontWeight)) {
            style.fontWeight = '' + style.fontWeight;
        }

        const stylesToDelete = ['WebkitFontSmoothing', 'MozOsxFontSmoothing', 'whiteSpace', 'textDecoration'];
        stylesToDelete.forEach(p => delete style[p]);

        const props = {...this.props, style: {...style}};
        return (
            <TextOrig {...props}>
                {this.props.children}
            </TextOrig>
        );
    }
}
export class Image extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    async componentDidMount() {
        const { src, onDimensionsLoadCbfn } = this.props;
        if (onDimensionsLoadCbfn) {
            ImageOrig.getSize(src, (width, height) => {
                cnsole.log('Image: Got image width, height: ', width, height, src);
                onDimensionsLoadCbfn({ width, height });
            }, () => {
                cnsole.warn('Image: Failed to load image width, height: ', src);
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
        const stylesToDelete = ['cursor', 'objectFit', 'border', 'borderStyle', 'userSelect', 'MozUserSelect', 'WebkitUserSelect', 'msUserSelect', 'pointerEvents'];
        stylesToDelete.forEach(p => delete style[p]);

        return <ImageOrig source={{ uri: src }} {...props} style={style} {...extra} />;
    }
}

export class ExpandingImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    async componentDidMount() {
        const { src, style } = this.props;
        const onDimensionsLoadCbfn = this.props.onDimensionsLoadCbfn || (() => {});
        ImageOrig.getSize(src, (imgWidth, imgHeight) => {
            cnsole.log('ExpandingImage: Got image width, height: ', imgWidth, imgHeight, src);
            this.setState({ imgWidth, imgHeight });
            onDimensionsLoadCbfn({ width: imgWidth, height: imgHeight });
        }, () => {
            cnsole.log('Failed to load image width, height: ', src);
        });
    }

    onLayout = (event) => {
        const { src } = this.props;
        const { x, y, width, height } = event.nativeEvent.layout;
        cnsole.log('ExpandingImage: onLayout: ', x, y, width, height, src);
        this.setState({ layout: { x, y, width, height, src } });
    };

    render() {
        const { src } = this.props;
        const props = {...this.props};
        const style = props.style ? {...props.style} : {};

        const { imgWidth, imgHeight, layout } = this.state;
        if (!layout || !imgWidth || !imgHeight) {
            return <ViewOrig onLayout={this.onLayout} style={style} />;
        }

        src && delete props.src;
        props.style && delete props.style;
        const stylesToDelete = ['cursor', 'objectFit', 'border', 'userSelect', 'MozUserSelect', 'WebkitUserSelect', 'msUserSelect', 'pointerEvents'];
        stylesToDelete.forEach(p => delete style[p]);

        const a = layout.height / imgHeight;
        const b = layout.width / imgWidth;
        const scale = layout.height === 0 || layout.width === 0 ? a + b : Math.min(a, b);
        return (
            <ViewOrig style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', ...style}}>
                <ImageOrig source={{ uri: src }} {...props} style={{ height: imgHeight * scale, width: imgWidth * scale }} />
            </ViewOrig>
        );
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
        cnsole.log('player ready: ', duration);
        this.setState({ ready: true, duration });

        this.player.on('ended', async (data) => {
            cnsole.log('player Ended');
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
            cnsole.log('Player currentTime: ', currentTime);
        }
    };

    handlePlayPause = async () => {
        const { playing, seeking } = this.state;
        cnsole.log('handlePlayPause playing, seeking: ', playing, seeking);
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
        cnsole.log('Player new state: ', playing);
    };
    onSeek = async (data) => {
        cnsole.log('onSeek: ', data);
        const { seekTime } = data;
        this.setState({ currentTime: seekTime, seeking: true });
        await new Promise(resolve => this.player.seek(seekTime, resolve));
        this.setState({ seeking: false });
    };

    render() {
        const { currentTime, ready, playing, duration, seeking } = this.state;
        if (!ready) {
            return <ViewOrig style={{ minHeight: 60 }} />;
        }

        const pauseImg = <ImageOrig source={{ uri: VIDEO_PAUSE }} style={{ height: 40, width: 40, opacity: 0.5 }} />;
        const playImg  = <ImageOrig source={{ uri: PLAY_ARROW_ICON }} style={{ height: 30, width: 30, marginLeft: 10 }} />;
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
        const { src, width=250, height=250, playing } = this.props;
        try {
            const obj = await NativeModules.ThumbnailModule.createVideoThumbnail(src, width, height, 50);
            const {encoded, time} = obj;
            this.setState({ base64: encoded, duration: parseInt(time) / 1000 });
        } catch (e) {
            cnsole.log('Exception in getting thumbnail: ', src, e);
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
    onBuffer = (elem) => cnsole.log('VideoElem onBuffer: ', elem);
    onError = (err) => cnsole.log('VideoElem onError: ', err);

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
        const { type, accept } = this.props;
        if (type === 'file') {
            const acceptImg = accept.includes('image/');
            const acceptVideo = accept.includes('video/');
            const acceptFiles = accept.includes('application/');

            let click = null;
            if (acceptFiles) {
                click = async () => {
                    try {
                        const res = await DocumentPicker.pick({});
                        this.processFile(res);
                    } catch (err) {
                        // Ignore errors, most likely due to user canceling
                    }
                };
            } else if (acceptImg && !acceptVideo) {
                click = () => this.launchImageLibrary('photo');
            } else if (!acceptImg && acceptVideo) {
                click = () => this.launchImageLibrary('video');
            } else {
                click = () => this.launchImageLibrary('mixed');
            }

            return { files, click };
        }
        return { click: () => {}, files };
    };

    launchImageLibrary = (mediaType) => {
        try {
            ImagePicker.launchImageLibrary({ mediaType }, this.processFile);
        } catch (e) {
            cnsole.error('Exception in launchImageLibrary: ', e);
        }
    };

    processFile = async (response) => {
        const { onChange } = this.props;
        const file = {...response};

        // Weird file, nothing to go on
        if (!file.uri && !file.path) {
            cnsole.log('ERROR: File doesnt have uri or path, skipping: ', response);
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
                cnsole.log('ERROR: Could not get filename, skipping: ', response);
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
        cnsole.log('Processed file: ', file);

        if (file.uri) {
            await new Promise(resolve => this.setState({ files: [file] }, resolve));
            onChange(this);
        }
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
        const stylesToDelete = ['outline', 'border', 'borderBottom', 'borderBottomStyle'];
        stylesToDelete.forEach(p => delete style[p]);

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
        if (type === 'text' || type === 'number') {
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
        const stylesToDelete = ['outline'];
        stylesToDelete.forEach(p => delete style[p]);
        const props = {...this.props, style, multiline: true};
        return (
            <TextInput {...props} />
        );
    }
}

// https://gist.github.com/ilya-uryupov/7bc9515c6d315d4919ff56ebf4e20411
export class TextareaElemHackForPaste extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: '99%',
        };
    }
    componentDidMount() {
        setTimeout(() => this.setState({ width: '100%' }), 100);
    }

    render () {
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : ({...this.props.style} || {});
        style.width = this.state.width;
        return <TextareaElem {...this.props} style={style} />
    }
}

export class PdfFilePreview extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isShowing: false,
        };
    }

    onLoadComplete = (numberOfPages, filePath) => {
        cnsole.log('pdf onLoadComplete: ', numberOfPages, filePath);
    };
    onPageChanged = (page, numberOfPages) => {
        cnsole.log('pdf onPageChanged: ', page, numberOfPages);
    };
    onError = (error) => {
        cnsole.log('pdf error: ', error);
    };
    onPressLink = (uri) => {
        cnsole.log('pdf onPressLink: ', uri);
    };

    showPdf = () => this.setState({ isShowing: true });
    hidePdf = () => this.setState({ isShowing: false });

    render () {
        const { fileUrl } = this.props;
        const { isShowing } = this.state;
        const dim = 180;
        const modal = (
            <ModalOrig isVisible={isShowing}
                       backdropOpacity={0.5} style={{ margin: 0, padding: 0 }}
                       onRequestClose={this.hidePdf} onBackdropPress={this.hidePdf}>
                <Pdf source={{ uri: fileUrl }}
                     onLoadComplete={this.onLoadComplete} onPageChanged={this.onPageChanged}
                     onError={this.onError} onPressLink={this.onPressLink}
                     style={{ height: '100%', width: '100%' }} />
            </ModalOrig>
        );
        return (
            <View style={{ height: dim, width: dim }}>
                <TouchableAnim onPress={this.showPdf}>
                    <Pdf source={{ uri: fileUrl }}
                         onLoadComplete={this.onLoadComplete} onPageChanged={this.onPageChanged}
                         onError={this.onError} onPressLink={this.onPressLink}
                         style={{ height: dim, width: dim }} />
                </TouchableAnim>

                {isShowing && modal}
            </View>
        );
    }
}

export class ImagePreviewWidget extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
            width: null,
            height: null,
        };
    }

    onDimensionsLoadCbfn = ({ width, height }) => {
        this.setState({ width, height });
    };
    openPic = () => {
        this.setState({ modalOpen: true });
        const onOpenFn = this.props.onOpenFn || (() => {});
        onOpenFn();
    };
    closeFn = () => this.setState({ modalOpen: false });

    render () {
        const { imageUrl } = this.props;
        cnsole.info('ImagePreviewWidget render: ', imageUrl);
        const { modalOpen, width, height } = this.state;
        const scale = width && height ? Math.min((WINDOW_INNER_HEIGHT / height), (WINDOW_INNER_WIDTH / width)) : 1;

        return (
            <ViewOrig>
                <TouchableAnim onPress={this.openPic}>
                    <Image src={imageUrl} style={{ width: 200, height: 200, borderRadius: 16 }} onDimensionsLoadCbfn={this.onDimensionsLoadCbfn} />
                </TouchableAnim>
                {modalOpen && <ModalOrig isVisible={modalOpen}
                                         backdropOpacity={1} style={{ margin: 0, padding: 0 }}
                                         onRequestClose={this.closeFn} onBackdropPress={this.closeFn}>
                    <ViewOrig style={{ height: '100%', width: '100%',
                                       display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <ImageZoom cropWidth={WINDOW_INNER_WIDTH}
                                   cropHeight={WINDOW_INNER_HEIGHT}
                                   imageWidth={width * scale}
                                   imageHeight={height * scale}>
                            <ImageOrig source={{ uri: imageUrl }} style={{ height: height * scale, width: width * scale }} />
                        </ImageZoom>
                    </ViewOrig>
                </ModalOrig>}
            </ViewOrig>
        );
    }
}

export class LongPressMicBtn extends React.PureComponent {
    render() {
        const { onPressIn, onPressOut, style, source } = this.props;
        return (
            <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut}>
                <Image style={style} source={source} />
            </TouchableOpacity>
        );
    }
}

export const openUrlOrRoute = ({ url }) => {
    Linking.openURL(url);
};

export class Switch extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
        const disabled = '' + (this.props.disabled || false);
        const value = '' + (this.props.value || false);
        const { onChange } = this.props;

        const disabledAndFalse = 'https://images-lb.heloprotocol.in/switch_disabled_false.png-1489-452967-1582614843471.png';
        const disabledAndTrue = 'https://images-lb.heloprotocol.in/switch_disabled_true.png-1661-642563-1582614886558.png';
        const enabledAndFalse = 'https://images-lb.heloprotocol.in/switch_enabled_false.png-1562-363846-1582614898028.png';
        const enabledAndTrue = 'https://images-lb.heloprotocol.in/switch_enabled_true.png-2197-934301-1582614910869.png';

        const imgs = {
            'true': { 'true': disabledAndTrue, 'false': disabledAndFalse },
            'false': { 'true': enabledAndTrue, 'false': enabledAndFalse },
        };

        const uri = imgs[disabled][value];
        this.obj = { uri, disabled, value };
    }

    onChange = () => {
        const { onChange } = this.props;
        const { value } = this.obj;
        const str = value === 'true' ? 'Disabling' : 'Enabling';
        Toast.show(str, Toast.LONG);
        onChange();
    };
    render() {
        const { uri, disabled, value } = this.obj;
        const height = 40;
        const width = 60;
        const elem = this.props.disabled ? (
            <ImageOrig source={{ uri }} style={{ height, width }} />
        ) : (
            <TouchableAnim onPress={this.onChange} style={{}}>
                <ImageOrig source={{ uri }} style={{ height, width }} />
            </TouchableAnim>
        );
        return (
            <ViewOrig style={{ height, width }}>
                {elem}
            </ViewOrig>
        );
    }
}

export const PlacesAutocomplete = Dummy;
export const Route = Dummy;
export const Helmet = Dummy;

export class ReactMinimalPieChart extends React.PureComponent {
    render() {
        const { height, data } = this.props;
        const labelFn = this.props.label;
        const fontsize = Math.round(13 + (height - 100)*3/100);
        const textOffset = 0;//Math.round(2 + (height - 100)*4 / 100);

        const total = data.map(x => x.value).reduce(sumFn, 0);
        const dataArray = data.map((x, index) => ({ index, cv: { value: x.value, percentage: 100*x.value / total }, key: index, amount: x.value, svg: { fill: x.color } }));
        cnsole.log('ReactMinimalPieChart total, data, dataArray: ', total, data, dataArray);
        const Labels = ({ slices, height, width }) => {
            return slices.map((slice, index) => {
                const { labelCentroid, pieCentroid, data } = slice;
                const text = labelFn({ data, dataIndex: 'cv' });
                // const text = data.amount === 0 ? '' : (height > 120 ? `${data.amount}%` : `${data.amount}`);
                return (
                    <Svg.Text key={index} x={pieCentroid[0] - textOffset} y={pieCentroid[1]}
                              fill={'white'} textAnchor={'middle'} alignmentBaseline={'middle'}
                              fontFamily='sans-serif' fontSize={fontsize} fontWeight={'bold'} letterSpacing={0.2} stroke={'black'} strokeWidth={0.2}>
                        {text}
                    </Svg.Text>
                )
            })
        };
        return (
            <PieChart style={{ height }}
                      valueAccessor={({ item }) => item.amount}
                      data={dataArray} spacing={0} outerRadius={'95%'} innerRadius={0} padAngle={0}>
                <Labels />
            </PieChart>
        );
    }
}
export class Pre extends React.PureComponent {
    render() {
        return <TextOrig {...this.props}>{this.props.children}</TextOrig>;
    }
}

export const GoogleMapReact = Dummy;

export const withStyles = (styles) => {
    return (component) => component;
};


export const confirmAlert = () => {};
export const geocodeByAddress = () => {};
export const getLatLng = () => {};

export const mobileDetect = () => {
    const isAndroid = Platform.OS === 'android';
    const isIphone  = Platform.OS === 'ios';
    return { isAndroid, isIphone, isWeb: false };
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
    const style = {...styleObj};
    delete style.whiteSpace;
    return (
        <HTML html={'<div>' + html + '</div>'} tagsStyles={{ div: style }}
              onLinkPress={onLinkPress} imagesMaxWidth={WINDOW_INNER_WIDTH} />
    );
};
const onLinkPress = (evt, href) => {
    cnsole.info('onLinkPress: ', href);
    Linking.openURL(href);
};

export const recordAudio = async (timeslice, dataAvailableCbFn) => {
    const granted = await requestMicPermission();
    if (!granted) {
        return null;
    }

    const name = 'recorder-' + (new Date().getTime()) + '.aac';
    const recorder = new Recorder(name, { format: 'aac' });

    const [res, path] = await new Promise(resolve => recorder.prepare((a, b) => {
        resolve([a, b]);
    }));
    cnsole.log('recordAudio prepare result: ', res, path);

    const start = () => {
        cnsole.log('starting recorder.record');
        recorder.record();
    };
    const stop = async () => {
        await new Promise(resolve => recorder.stop(resolve));

        const stat = await rnfs.stat(path);
        cnsole.log('file stat: ', stat, path);
        // await new Promise(resolve => recorder.destroy(resolve));

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
    cnsole.log('uploadBlob file: ', file);
    if (!file || file.size === 0) {
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
    cnsole.log('FormData: ', data);

    try {
        const url = format(API_URL + '/v1/blob/uploadBlob?fileType={}&fileName={}', encodeURIComponent(file.type), encodeURIComponent(file.name));
        const response = await fetch(url, {
            method: 'POST',
            body: data,
        });
        cnsole.log('Blob upload response: ', response);
        const text = await response.text();
        cnsole.log('Blob upload output: ', text);
        return serverUrl + '/' + text.split('id=')[1];
    } catch (ex) {
        cnsole.log('Upload failed: ', ex);
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
export const scrollToBottomFn = (element) => {
    element && element.scrollToEnd && element.scrollToEnd({ animated: false });
};
export const scrollToElemFn = (ref) => {};
export const resizeForKeyboard = ({ mode, msgToScrollTo, cbFn }) => {};


export const requestMicPermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
                title: 'Microphone permission',
                message:
                    'App needs access to your microphone to record audio',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            cnsole.log('requestMicPermission: You can use the mic');
            return true;
        } else {
            cnsole.log('requestMicPermission: Mic permission denied');
            return false;
        }
    } catch (err) {
        cnsole.warn(err);
        return false;
    }
};

export const copyToClipboard = (text) => {
    Clipboard.setString(text);
};

export const refetchDetails = (roleIds) => rf.refetchDetails(roleIds);
var flatbuffers = flatbuffers || {};    // eslint-disable


export const WINDOW_INNER_WIDTH = Dimensions.get('window').width;
export const WINDOW_INNER_HEIGHT = Dimensions.get('window').height;

cnsole.info('WINDOW_INNER_WIDTH: ', WINDOW_INNER_WIDTH);
cnsole.info('WINDOW_INNER_HEIGHT: ', WINDOW_INNER_HEIGHT);

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

    normalTextStyle: {
        whiteSpace: 'pre',
    },
    linkTextStyle: {
        color: 'blue',
        whiteSpace: 'pre',
    },
};

const recyclerListView = { DataProvider, LayoutProvider, RecyclerListView };

export {
    AsyncStorage, StyleSheet, Toast, ScrollView, ImageBackground,
    ViewOrig,
    Popover,
    Linking,
    TouchableWithoutFeedback,
    flatbuffers,
    recyclerListView,
}