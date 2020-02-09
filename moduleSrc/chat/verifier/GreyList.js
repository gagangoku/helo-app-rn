import React, {Fragment} from "react";
import {getCtx, setupDeviceId} from "../../util/Util";
import MessagingUI from "../messaging/MessagingUI";
import {MODE_BOT, TOP_BAR_COLOR} from "../Constants";
import {OUTPUT_IMAGE, OUTPUT_PDF, OUTPUT_TEXT, SENDER_HELO, SENDER_VISITOR} from "../Questions";
import {COOK_ONBOARDING_FLOW, getChatContext} from "../bot/ChatUtil";
import uuidv1 from "uuid/v1";
import {detectTextInImage, detectTextInPdf} from "../../util/Api";
import {ConfigurableTopBar} from "../messaging/TopBar";


export default class GreyList extends React.Component {
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
        console.log('GreyList componentDidMount: ', this.deviceID, this.uuid);
    }

    componentWillUnmount() {
    }

    onUserMsg = async ({ text, type, ...extra }) => {
        console.log('onUserMsg: ', text, type, extra);
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
            console.log('detectedTextObj: ', detectedTextObj);
            const desc = detectedTextObj.responses[0].textAnnotations[0].description;
            const words = desc.split('\n').map(x => x.trim());
            if (words.includes('INCOME TAX DEPARTMENT') || words.includes('Permanent Account Number Card')) {
                const [panNumber] = words.flatMap(x => {
                    const m = x.match(/[A-Z]{5}[0-9]{4}[A-Z]/);
                    return m ? [m[0]] : [];
                });
                console.log('panNumber: ', panNumber);
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
                console.log('freq: ', freq);
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
            console.log('detectedTextObj: ', detectedTextObj);
        }
    };

    topBar = () => {
        const sections = [
            { float: 'left', name: ConfigurableTopBar.SECTION_BACK, displayProps: {}, data: {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_AVATAR, displayProps: {}, data: { avatar: VERIFIER_LOGO }, onClickFn: () => {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_NAME, displayProps: {}, data: { name: 'Helo Feedback', subheading: 'Report experiences with people' }, onClickFn: () => {} },
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
            name: 'Helo Feedback',
            subheading: 'Report experiences with people',
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
const SAMPLE_MESSAGES = [{
    sender: SENDER_HELO,
    timestamp: new Date().getTime(),
    type: OUTPUT_TEXT,
    text: 'HELO. I will help you report good / bad experiences with workforce.<br>Let others know before they hire someone.<br>Stay safe !',
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
    sender: SENDER_ME,
    timestamp: new Date().getTime(),
    type: OUTPUT_TEXT,
    text: 'Had a great experience with Gagan. He works hard and does a good job',
}, {
    sender: SENDER_ME,
    timestamp: new Date().getTime(),
    type: OUTPUT_TEXT,
    text: 'Submit',
}, {
    sender: SENDER_HELO,
    timestamp: new Date().getTime(),
    type: OUTPUT_TEXT,
    text: `<b>✔</b> Submitted !<br><br>Your exact feedback will never be shown to anybody else. An employer looking to hire this person might request your feedback which you can choose to provide`,
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
