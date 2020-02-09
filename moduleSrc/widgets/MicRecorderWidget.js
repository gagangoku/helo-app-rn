import React from 'react';
import IconButton from "@material-ui/core/IconButton";
import Stop from '@material-ui/icons/Stop';
import Mic from '@material-ui/icons/Mic';
import {recordAudio, spacer} from "../util/Util";


export default class MicRecorderWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRecording: false,
            recStartTimeMs: -1,
            recEndTimeMs: -1,
            opacity: 1,
        };
        this.rafId = requestAnimationFrame(this.tick);
        this.timeoutId = null;
    }

    async componentDidMount() {
    }

    toggleFn = async () => {
        if (this.state.isRecording) {
            await this.stopFn();
        } else {
            await this.startFn();
        }
    };

    startFn = async () => {
        const recorder = await recordAudio();
        this.setState({ recorder, recStartTimeMs: new Date().getTime(), isRecording: true });
        recorder.start();

        const autoCutOffSeconds = this.props.autoCutOffSeconds || 25;
        if (autoCutOffSeconds) {
            this.timeoutId = setTimeout(() => this.stopFn(), autoCutOffSeconds * 1000);
        }
    };

    stopFn = async () => {
        if (this.state.recorder) {
            const obj = await this.state.recorder.stop();
            obj.play();
            this.setState({ recorder: null, recEndTimeMs: new Date().getTime(), isRecording: false, opacity: 1 });

            const file = new File([obj.audioBlob], "audio.webm", { type: "audio/webm", lastModified: new Date().getTime() });
            console.log('Audio file: ', file);
            this.props.onDoneFn(file);
        }
        clearTimeout(this.timeoutId);
    };

    tick = () => {
        this.rafId = requestAnimationFrame(this.tick);
        if (this.state.isRecording) {
            const x = new Date().getTime() - this.state.recStartTimeMs;
            const opacity = 0.1 + Math.abs(Math.sin(x / 300)) * 0.9;
            this.setState({ opacity });
        }
    };

    render() {
        const durationMs = this.state.isRecording ? new Date().getTime() - this.state.recStartTimeMs : this.state.recEndTimeMs - this.state.recStartTimeMs;
        const duration = Math.round(durationMs / 1000);
        console.log('in render');
        const { opacity } = this.state;

        const mins = Math.floor(duration / 60);
        let secs = duration - 60*mins;
        secs = secs <= 9 ? '0' + secs : secs;

        const color = this.state.isRecording ? 'red' : 'rgba(0, 0, 0, 0.54)';
        const micIcon = (
            <IconButton style={{ opacity, height: 40, width: 40 }}><Mic onClick={this.toggleFn} style={{ height: 40, width: 40, color }} /></IconButton>
        );
        const stopIcon = (
            <IconButton style={{ opacity, height: 40, width: 40 }}><Stop onClick={this.toggleFn} style={{ height: 40, width: 40, color }} /></IconButton>
        );

        return (
            <div>
                <div style={custom.root}>
                    {micIcon}
                    {spacer(0, 10)}
                    <span style={custom.text}>{mins}:{secs}</span>
                </div>
            </div>
        );
    }
}
const custom = {
    grid: {
        width: '60%',
    },
    root: {
        marginTop: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',

        fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
    text: {
        fontSize: 20,
        color: 'rgba(0, 0, 0, 0.8)',
    },
};
