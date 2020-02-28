import React, {Fragment} from 'react';
import {OUTPUT_EXCEL, OUTPUT_TEXT, SENDER_VISITOR} from '../../moduleSrc/chat/Questions';
import {COOK_ONBOARDING_FLOW, getChatContext} from '../../moduleSrc/chat/bot/ChatUtil';
import {HELO_LOGO, MODE_GROUP_CHAT} from '../../moduleSrc/chat/Constants';
import MessagingUI from '../../moduleSrc/chat/messaging/MessagingUI';


export class ExcelDemo extends React.Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        title: null,
        headerShown: false,
    });
    static URL = '/demos/excel';

    constructor(props) {
        super(props);
        this.state = {
            messages: INITIAL_MESSAGES2,
            isModalOpen: true,
        };
        this.idToDetails = {};
    }

    async componentDidMount() {
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
        this.setState({ messages });
    };

    render() {
        const me = {
            role: 'cust',
            id: 2796,
            sender: SENDER_ME,
            avatar: '',
            name: 'Me',
        };
        const heloBot = {
            role: 'supply',
            id: 352,
            sender: SENDER_VISITOR,
            avatar: HELO_LOGO,
            name: 'HELO',
        };

        this.idToDetails[SENDER_VISITOR] = { person: { name: 'vis vis', } };
        this.idToDetails[SENDER_ME] = { person: { name: 'me', } };

        const groupInfo = {
            isAdminPosting: false,
            admins: [],
            showMemberAddNotifications: false,
        };
        const chatContext = getChatContext(COOK_ONBOARDING_FLOW);

        const messagingUI = (
            <MessagingUI location={this.props.location} history={this.props.history}
                         me={me} otherGuy={heloBot}
                         chatContext={chatContext} idToDetails={this.idToDetails}
                         collection={'test'} groupId={'demo'} mode={MODE_GROUP_CHAT}
                         groupInfo={groupInfo} messages={this.state.messages} onUserMsg={this.onUserMsg}
                         onTriggerUpload={null} callFn={null} />
        );
        return (
            <Fragment>
                {messagingUI}
            </Fragment>
        );
    }
}

const SENDER_ME = 'me';
const INITIAL_MESSAGES2 = [{
    type: OUTPUT_TEXT,
    text: 'Hello',
    timestamp: new Date().getTime(),
    sender: SENDER_VISITOR,
}, {
    type: OUTPUT_EXCEL,
    sender: SENDER_VISITOR,
    text: 'Diet chart',
    timestamp: new Date().getTime(),
    excel: {
        title: 'diet chart',
        isEditable: true,
        initialRows: {
            0: {},
            1: { 0: 'Salt', 1: '100 gm' },
            2: { 0: 'Sugar', 1: '200 gm' },
            3: { 0: 'Protein', 1: '400 gm' },
        },
        rowHeader: ['Item', 'Quantity'],
        cellHeight: 40,
        cellWidth: 80,
        numCols: 4, numRows: 4,
    },
}];
