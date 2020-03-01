import React, {Fragment} from 'react';
import {OUTPUT_EXCEL, OUTPUT_TEXT, SENDER_VISITOR} from '../../moduleSrc/chat/Questions';
import {COOK_ONBOARDING_FLOW, getChatContext} from '../../moduleSrc/chat/bot/ChatUtil';
import {HELO_LOGO, MODE_GROUP_CHAT} from '../../moduleSrc/chat/Constants';
import MessagingUI from '../../moduleSrc/chat/messaging/MessagingUI';
import {firebase} from '../../moduleSrc/platform/firebase';
import {FIREBASE_GROUPS_DB_NAME} from '../../moduleSrc/constants/Constants';


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

        const newMsgPayload = {
            timestamp: new Date().getTime(),
            text,
            type,
            sender: SENDER_ME,
            ...extra,
        };
        messages.push(newMsgPayload);
        this.setState({ messages });

        // console.log('Saving to firebase');
        // const db = firebase.firestore();
        // const docRef = db.collection(FIREBASE_GROUPS_DB_NAME).doc('helo-kitchen-indiranagar');
        //
        // await docRef.update({
        //     messages: firebase.firestore.FieldValue.arrayUnion(newMsgPayload),
        // });
        // console.log('Saved');
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

const items =
`Butter
Cheesy Crispy Chicken Fries
Chicken Pop Corn
Chicken Wings
Cooking Cream
French Fries Sure Crisp
Garlic pops
Jalapeno Popper
Potato Wedges
Ripple Icecream-2 Bulk
Whipped Cream
Basa Fish
Chicken Breast
Mutton Boneless
Salami Chicken
BATATA VADA
BHUNA CHICKEN
CHICKEN SHAMI KEBAB
CHICKEN TIKKA
CHILLY PANEER
FALAFEL
Green Peas in
LACCHA PARATHA  ORG
MINI PARATHA
MIXED VEG FILLING
PANEER TIKKA
SZECHUAN CHICKEN
VEG FINGER
WHOLE WHEAT PARATHA
BACON SLICE
Cheddar Cheese
Paneer
Sweet Corn
Amul mozrella diced
Cheese Slice
Green Peace`.split('\n');

const initialRows = {
    0: { 0: '', 1: '', 2: '' },
};
items.forEach((item, idx) => {
    initialRows[idx+1] = {
        0: (idx+1) + '.',
        1: item,
    };
});
const excel = {
    title: 'Inventory',
    isEditable: true,
    initialRows,
    rowHeader: ['No.', 'Item', 'Current stock', 'Notes'],
    rowStyles: [{}, { width: 150 }, { width: 80 }, { width: 80 }],
    cellHeight: 60,
    cellWidth: 50,
    numRows: items.length+3, numCols: 4,
};

const SENDER_ME = 'supply:352';
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
    excel,
}];
