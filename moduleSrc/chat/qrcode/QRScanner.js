import React from "react";
import {getCtx, setupDeviceId} from "../../util/Util";
import {TOP_BAR_COLOR} from "../Constants";
import uuidv1 from "uuid/v1";
import TouchableAnim from "../../platform/TouchableAnim";
import {WINDOW_INNER_HEIGHT} from "../../platform/Util";


export default class QRScanner extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);

        this.state = {
            result: null,
        };
        this.deviceID = null;
        this.uuid = null;
    }

    async componentDidMount() {
        this.deviceID = await setupDeviceId();
        this.uuid = uuidv1();
        console.log('QRScanner componentDidMount: ', this.deviceID, this.uuid);
        this.start();
    }

    async start() {
        this.setState({ result: '' });
        while (!window.QrScanner) {
            console.log('Sleeping waiting for window.QrScanner');
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        const QrScanner = window.QrScanner;
        const video = document.getElementById('qr-video');
        const hasCamera = await QrScanner.hasCamera();
        console.log('hasCamera: ', hasCamera);

        const scanner = new QrScanner(video, result => {
            console.log('QR code scan result: ', result);
            this.setState({ result });
            scanner.destroy();
            video.pause();
        });
        await scanner.start();
    }

    componentWillUnmount() {
    }

    render() {
        const result = this.state.result || '';
        const H = WINDOW_INNER_HEIGHT;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{}}>QR Code scanner</h1>
                <TouchableAnim onPress={() => this.start()}>
                    <video muted playsInline id="qr-video" height={H * 0.60} width={'auto'} style={{ marginTop: 10, marginBottom: 10, border: '1px solid' }} />
                </TouchableAnim>
                <div style={{ margin: 5, overflowWrap: 'break-word' }}>Result:  {result}</div>
            </div>
        );
    }
}

const custom = {
    topBarText: {
        backgroundColor: TOP_BAR_COLOR,
        color: '#ffffff',
        height: '100%',
        width: '100%',
        lineHeight: '56px',
        fontSize: 18,

        display: 'flex',
        flexDirection: 'row',
        userSelect: 'none', MozUserSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none',
    },
    chatUnreadCount: {
        fontSize: 10,
        marginLeft: 10,
        height: 18,
        width: 18,
        borderRadius: 9,
        backgroundColor: '#ffffff',
        color: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
};
