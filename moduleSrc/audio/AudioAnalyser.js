import React, {Component} from 'react';
import AudioVisualiser from './AudioVisualiser';
import IconButton from "@material-ui/core/IconButton/IconButton";
import Stop from '@material-ui/icons/Stop';


export default class AudioAnalyser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            audioData: new Uint8Array(0),
        };
        this.fullAudio = [];
        this.arrays = [];
        this.audioContext = null;
    }

    componentDidMount() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.source = this.audioContext.createMediaStreamSource(this.props.audio);

        this.scriptNode = this.audioContext.createScriptProcessor();
        this.scriptNode.onaudioprocess = (audioProcessingEvent) => {
            console.log('audioProcessingEvent: ', audioProcessingEvent);
            this.arrays.push(audioProcessingEvent.inputBuffer);
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

            // console.log('inputData: ', inputData.length);
            this.fullAudio = this.fullAudio.concat(Array.from(new Uint8Array(inputData.buffer)));
        };
        this.scriptNode.connect(this.audioContext.destination);

        this.source.connect(this.analyser);
        this.source.connect(this.scriptNode);
        this.rafId = requestAnimationFrame(this.tick);
    }

    stopFn = () => {
        cancelAnimationFrame(this.rafId);
        this.scriptNode.disconnect();
        this.analyser.disconnect();
        this.source.disconnect();
    };

    async componentWillUnmount() {
        this.stopFn();
    }

    tick = () => {
        this.analyser.getByteTimeDomainData(this.dataArray);
        this.setState({ audioData: this.dataArray });
        this.rafId = requestAnimationFrame(this.tick);
    };

    render() {
        const height = this.props.height || 100;
        const width  = this.props.width || 200;
        return (
            <div style={custom.root}>
                <AudioVisualiser audioData={this.state.audioData} height={height} width={width} />
                <IconButton><Stop onClick={this.stopFn} /></IconButton>
            </div>
        );
    }
}

const custom = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    stop: {
        height: 40,
        width: 40,
        marginTop: 5,
    },
};