import React from 'react';
import {getCtx, recordAudio} from "../util/Util";
import {SPEECH_RECOGNITION_SAMPLE_MS, SPEECH_RECOGNITION_TERMINATOR, WEBSOCKET_URL} from "../constants/Constants";


export default class SpeechRecognitionDemo extends React.Component {
    static URL = '/demos/speech';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            state: STOPPED,
            transcripts: [],
        };
        this.recorder = null;
    }

    async componentDidMount() {
    }

    openWebsocket = (startTimeMs) => {
        this.websocket = new WebSocket(WEBSOCKET_URL + '/speech', 'chat-protocol');
        this.websocket.onopen = () => {
        };

        this.websocket.onmessage = (e) => {
            const msg = JSON.parse(e.data || '{}');
            console.log('Message received:', e.data, msg);

            const words = msg.results[0].alternatives[0].words || [];
            const lastWord = words.length > 0 ? words[words.length - 1] : {endTime: {seconds: 0, nanos: 0}};
            const latencyMs = (new Date().getTime() - startTimeMs) - (1000 * parseInt(lastWord.endTime.seconds) + Math.round(parseInt(lastWord.endTime.nanos) / 1000000));

            const transcripts = this.state.transcripts.slice();
            transcripts.push(new Date().getTime() + ' - ' + latencyMs + ' - ' + msg.results[0].alternatives[0].transcript);
            this.setState({ transcripts });
        };

        this.websocket.onclose = (e) => {
            console.log('Socket is closed :', e);
        };

        this.websocket.onerror = (e) => {
            console.error('Socket encountered error: ', e.message, 'Closing socket');
            this.websocket.close();
        };
    };

    start = async () => {
        const startTimeMs = new Date().getTime();
        this.openWebsocket(startTimeMs);
        this.recorder = await recordAudio(SPEECH_RECOGNITION_SAMPLE_MS, this.dataAvailableCbFn);
        this.recorder.start();
        this.setState({ state: STARTED, transcripts: [] });
    };
    stop = async () => {
        this.setState({ state: STOPPED });
        const { audioUrl } = await this.recorder.stop();
        document.getElementById('link').href = audioUrl;
        this.recorder = null;
    };

    dataAvailableCbFn = (arrayBuffer) => {
        console.log('arrayBuffer: ', arrayBuffer);
        this.websocket.send(arrayBuffer);

        if (!this.recorder) {
            // This is the last buffer of data received after stop is called
            this.websocket.send(SPEECH_RECOGNITION_TERMINATOR);
        }
    };

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div>{this.state.state}</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>{this.state.transcripts.map(x => <div>{x}</div>)}</div>

                <button onClick={this.start} style={{ width: 100 }}>START</button>
                <button onClick={this.stop} style={{ width: 100 }}>STOP</button>
                <a id="link" target="_blank" download="file.webm">Download</a>
            </div>
        );
    }
}

const STARTED = 'STARTED';
const STOPPED = 'STOPPED';

const custom = {
    grid: {
        width: '60%',
    },
};
