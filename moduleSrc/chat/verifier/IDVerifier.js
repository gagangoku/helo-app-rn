import React, {Fragment} from "react";
import {getCtx, setupDeviceId} from "../../util/Util";
import MessagingUI from "../messaging/MessagingUI";
import {MODE_BOT, TOP_BAR_COLOR} from "../Constants";
import {OUTPUT_IMAGE, OUTPUT_PDF, OUTPUT_TEXT, SENDER_HELO, SENDER_VISITOR} from "../Questions";
import {COOK_ONBOARDING_FLOW, getChatContext} from "../bot/ChatUtil";
import uuidv1 from "uuid/v1";
import {detectTextInImage, detectTextInPdf} from "../../util/Api";
import {ConfigurableTopBar} from "../messaging/TopBar";
import cnsole from 'loglevel';


// TODO: Detect name and DOB
export default class IDVerifier extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);

        this.state = {
            messages: SAMPLE_MESSAGES,
        };
        this.deviceID = null;
        this.uuid = null;
    }

    async componentDidMount() {
        this.deviceID = await setupDeviceId();
        this.uuid = uuidv1();
        cnsole.log('IDVerifier componentDidMount: ', this.deviceID, this.uuid);
    }

    componentWillUnmount() {
    }

    onUserMsg = async ({ text, type, ...extra }) => {
        cnsole.log('onUserMsg: ', text, type, extra);
        const messages = this.state.messages.slice();
        messages.push({
            timestamp: new Date().getTime(),
            text,
            type,
            sender: SENDER_ME,
            ...extra,
        });
        await new Promise(resolve => this.setState({ messages }, resolve));

        if (type === OUTPUT_IMAGE) {
            const gsPath = 'gs://helo-images-2/' + extra.imageUrl.split('.heloprotocol.in/')[1];
            const detectedTextObj = await detectTextInImage(gsPath);
            cnsole.log('detectedTextObj: ', detectedTextObj);
            const desc = detectedTextObj.responses[0].textAnnotations[0].description;
            const words = desc.split('\n').map(x => x.trim());
            if (words.includes('INCOME TAX DEPARTMENT') || words.includes('Permanent Account Number Card')) {
                const [panNumber] = words.flatMap(x => {
                    const m = x.match(/[A-Z]{5}[0-9]{4}[A-Z]/);
                    return m ? [m[0]] : [];
                });
                cnsole.log('panNumber: ', panNumber);
                messages.push({
                    timestamp: new Date().getTime(),
                    text: 'PAN: ' + panNumber,
                    type: OUTPUT_TEXT,
                    sender: SENDER_HELO,
                });
                await new Promise(resolve => this.setState({ messages }, resolve));
            }
            if (words.includes('Unique Identification Authority of India') ||
                words.includes('UNIQUE IDENTIFICATION AUTHORITY OF INDIA') ||
                words.includes('AADHAAR') ||
                words.includes('E-Aadhaar Letter') ||
                words.includes('आधार-आम आदमी का अधिकार') || words.find(x => x.includes('आधार')) || words.find(x => x.includes('আধার'))) {
                const freq = {};
                words.map(x => {
                    const m = x.replace(/ /g, '').match(/[0-9]{12}/);
                    if (m) {
                        freq[m] = (m in freq ? freq[m] : 0) + 1;
                    }
                });
                cnsole.log('freq: ', freq);
                const aadharNumber = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0];

                messages.push({
                    timestamp: new Date().getTime(),
                    text: 'Aadhar: ' + aadharNumber,
                    type: OUTPUT_TEXT,
                    sender: SENDER_HELO,
                });
                await new Promise(resolve => this.setState({ messages }, resolve));
            }
        }
        if (type === OUTPUT_PDF) {
            const gsPath = 'gs://helo-files/' + extra.fileUrl.split('.heloprotocol.in/')[1];
            const detectedTextObj = await detectTextInPdf(gsPath);
            cnsole.log('detectedTextObj: ', detectedTextObj);
        }
    };

    topBar = () => {
        const sections = [
            { float: 'left', name: ConfigurableTopBar.SECTION_BACK, displayProps: {}, data: {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_AVATAR, displayProps: {}, data: { avatar: VERIFIER_LOGO }, onClickFn: () => {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_NAME, displayProps: {}, data: { name: 'Helo Verifier', subheading: 'Verify your staff in minutes', }, onClickFn: () => {} },
        ];
        return (
            <ConfigurableTopBar collection={null} sections={sections}
                                location={this.props.location} history={this.props.history} />
        );
    };

    render() {
        const customerId = 1;
        const supplyId = 1;

        const me = {
            role: 'cust',
            id: customerId,
            sender: SENDER_ME,
            avatar: '',
            name: 'Me',
        };
        const heloVerifier = {
            role: 'supply',
            id: supplyId,
            sender: SENDER_VISITOR,
            avatar: VERIFIER_LOGO,
            name: 'Helo Verifier',
            subheading: 'Verify your staff in minutes',
        };
        const groupInfo = { admins: [], isAdminPosting: false };

        const chatContext = getChatContext(COOK_ONBOARDING_FLOW);
        return (
            <Fragment>
                <MessagingUI location={this.props.location} history={this.props.history}
                             me={me} otherGuy={heloVerifier}
                             chatContext={chatContext} mode={MODE_BOT} language={this.language}
                             topBar={this.topBar()}
                             groupInfo={groupInfo} messages={this.state.messages} onUserMsg={this.onUserMsg}
                             onTriggerUpload={() => {}} callFn={null} goBackFn={() => {}}
                />
            </Fragment>
        );
    }
}

const SENDER_ME = 'me';
const VERIFIER_LOGO = 'https://images-lb.heloprotocol.in/verify.png-5815-880228-1577251599713.png';
const VERIFIED_IMG = 'https://images-lb.heloprotocol.in/verified.png-48178-805051-1577434193922.png';
const SAMPLE_MESSAGES = [{
    sender: SENDER_HELO,
    timestamp: new Date().getTime(),
    type: OUTPUT_TEXT,
    text: 'HELO. I will help you verify the candidate you are looking to hire<br>Stay safe !',
}, {
    sender: SENDER_ME,
    timestamp: new Date().getTime(),
    type: OUTPUT_IMAGE,
    imageUrl: 'https://images-lb.heloprotocol.in/gaganAadharCard.png-653717-597170-1577433550399.png',
}, {
    sender: SENDER_HELO,
    timestamp: new Date().getTime(),
    type: OUTPUT_TEXT,
    text: '<b>Aadhar:</b> 6881 6029 6860<br><b>Name:</b> Gagandeep Singh',
}, {
    sender: SENDER_HELO,
    timestamp: new Date().getTime(),
    type: OUTPUT_TEXT,
    text: `<b>✔</b> Verified`,
}, {
    sender: SENDER_ME,
    timestamp: new Date().getTime(),
    type: OUTPUT_IMAGE,
    imageUrl: 'https://images-lb.heloprotocol.in/gaganPanCard.png-789867-180501-1577433564742.png',
}, {
    sender: SENDER_HELO,
    timestamp: new Date().getTime(),
    type: OUTPUT_TEXT,
    text: '<b>PAN</b>: BNGPS1673D<br><b>Name:</b> Gagandeep Singh',
}, {
    sender: SENDER_HELO,
    timestamp: new Date().getTime(),
    type: OUTPUT_TEXT,
    text: `<b>✔</b> Verified`,
}];

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
