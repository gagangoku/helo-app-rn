import React from 'react';
import MessagingUI from "../chat/messaging/MessagingUI";
import {OUTPUT_TASK_LIST, OUTPUT_TEXT, SENDER_VISITOR, TASK_LIST_IMAGE_TYPE_OPTIONAL} from "../chat/Questions";
import {COOK_ONBOARDING_FLOW, getChatContext} from "../chat/bot/ChatUtil";
import {HELO_LOGO} from "../chat/Constants";
import cnsole from 'loglevel';
import {CHECK_TICK_ICON_BLACK, CROSS_ICON_BLACK, FIREBASE_GROUPS_DB_NAME} from "../constants/Constants";


export default class ChatDemo extends React.Component {
    static URL = '/demos/chat';
    constructor(props) {
        super(props);
        this.state = {
            messages: INITIAL_MESSAGES,
        };
    }

    async componentDidMount() {
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

        const groupInfo = {
            collection: FIREBASE_GROUPS_DB_NAME,
            groupId: 'helo-kitchen-indiranagar',
            name: 'Helo Kitchen - Indiranagar',
            isAdminPosting: false,
            admins: [],
            showMemberAddNotifications: false,
        };
        const chatContext = getChatContext(COOK_ONBOARDING_FLOW);
        return (
            <MessagingUI location={this.props.location} history={this.props.history}
                         topBar={null} me={me} otherGuy={heloBot}
                         chatContext={chatContext}
                         collection={'test'} groupId={'demo'}
                         groupInfo={groupInfo} messages={this.state.messages} onUserMsg={this.onUserMsg}
                         onTriggerUpload={null} callFn={null} />
        );
    }
}

const taskGen = (idx) => {
    return ({
        title: 'Task ' + idx,
        desc: 'This is a long descriptive text - ' + idx,
        options: [{
            text: 'Yes',
        }, {
            text: 'No',
        }],
        optionSelected: null,
        imageReq: TASK_LIST_IMAGE_TYPE_OPTIONAL,
        image: '',
        comments: '',
        isFinalized: false,
    });
};
const SENDER_ME = 'me';
const INITIAL_MESSAGES = [{
    type: OUTPUT_TEXT,
    text: 'Hello',
    timestamp: new Date().getTime(),
    sender: SENDER_VISITOR,
}, {
    type: OUTPUT_TASK_LIST,
    text: '',
    timestamp: new Date().getTime(),
    sender: SENDER_VISITOR,
    payload: {
        title: 'Kitchen tasks',
        tasks: [{
            title: 'Task 1',
            desc: 'Play holi',
            options: [{
                text: 'Yes',
                previewThumbnail: CHECK_TICK_ICON_BLACK,
            }, {
                text: 'No',
                previewThumbnail: CROSS_ICON_BLACK,
            }],
            optionSelected: null,
            imageReq: TASK_LIST_IMAGE_TYPE_OPTIONAL,
            image: '',
            comments: '',
            isFinalized: false,
        }, {
            title: 'Task 2',
            desc: 'Clean up',
            options: [{
                text: 'Yes',
                previewThumbnail: CHECK_TICK_ICON_BLACK,
            }, {
                text: 'No',
                previewThumbnail: CROSS_ICON_BLACK,
            }],
            optionSelected: null,
            imageReq: TASK_LIST_IMAGE_TYPE_OPTIONAL,
            image: '',
            comments: '',
            isFinalized: false,
        },
            taskGen(3),
            taskGen(4),
            taskGen(5),
            taskGen(6),
            taskGen(7),
            taskGen(8),
            taskGen(9),
            taskGen(10),
            taskGen(11),
            taskGen(12),
            taskGen(13),
        ],
    },
// }, {
//     type: OUTPUT_TEXT,
//     text: 'Hello <b>bold</b>',
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_TEXT,
//     text: 'call me on 9008781096 or email me: gagan.goku@gmail.com',
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_TEXT,
//     text: 'Hello asda sdasdad',
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }, {
//     type: OUTPUT_TEXT,
//     text: 'Hello asda sdasdad',
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }, {
//     type: OUTPUT_TEXT,
//     text: 'Hello asda sdasdad',
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }, {
//     type: OUTPUT_EXCEL,
//     sender: SENDER_VISITOR,
//     text: 'Diet chart',
//     timestamp: new Date().getTime(),
//     excel: {
//         title: 'Inventory',
//         isEditable: true,
//         initialRows: {
//             0: {},
//             1: { 0: 'Salt', 1: '100 gm' },
//             2: { 0: 'Sugar', 1: '200 gm' },
//             3: { 0: 'Protein', 1: '400 gm' },
//         },
//         rowHeader: ['Item', 'Quantity'],
//         rowStyles: [{}, { width: 150 }, { width: 80 }, { width: 80 }],
//         cellHeight: 60,
//         cellWidth: 50,
//         numRows: 4, numCols: 4,
//     },
// }, {
//     type: OUTPUT_PDF,
//     fileUrl: 'https://files-lb.heloprotocol.in/orgStructure.pdf-18145-946117-1581716224406.pdf',
//     sender: SENDER_VISITOR,
//     text: 'Bar training',
//     timestamp: new Date().getTime(),
// }, {
//     type: OUTPUT_FILE,
//     fileUrl: 'http://www.africau.edu/images/default/sample.pdf',
//     sender: SENDER_VISITOR,
//     text: 'Bar training',
//     timestamp: new Date().getTime(),
// }, {
//     type: OUTPUT_TEXT,
//     text: 'Hello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdad',
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_TEXT,
//     text: 'Hello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdad',
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }, {
//     type: OUTPUT_IMAGE,
//     text: 'Hi',
//     imageUrl: 'https://arbordayblog.org/wp-content/uploads/2018/06/oak-tree-sunset-iStock-477164218-1080x608.jpg',
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }];
// const INITIAL_MESSAGES2 = [{
//     type: OUTPUT_TEXT,
//     text: 'Hello',
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_TEXT,
//     text: 'Hello <b>bold</b>',
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_TEXT,
//     text: 'Hello asda sdasdad',
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_PDF,
//     fileUrl: 'https://files-lb.heloprotocol.in/orgStructure.pdf-18145-946117-1581716224406.pdf',
//     sender: SENDER_VISITOR,
//     text: 'Bar training',
//     timestamp: new Date().getTime(),
// }, {
//     type: OUTPUT_FILE,
//     fileUrl: 'http://www.africau.edu/images/default/sample.pdf',
//     sender: SENDER_VISITOR,
//     text: 'Bar training',
//     timestamp: new Date().getTime(),
// }, {
//     type: OUTPUT_TEXT,
//     text: 'Hello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdad',
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_TEXT,
//     text: 'Hello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdadHello asda sdasdad',
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }, {
//     type: OUTPUT_IMAGE,
//     text: 'Hi',
//     imageUrl: 'https://arbordayblog.org/wp-content/uploads/2018/06/oak-tree-sunset-iStock-477164218-1080x608.jpg',
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }, {
//     type: OUTPUT_VIDEO,
//     text: 'Hi',
//     videoUrl: 'https://videos-lb.heloprotocol.in/359-sita.mp4-33195818-945553-1558617313026.mp4',
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }, {
//     type: OUTPUT_AUDIO,
//     text: 'Hi',
//     audioUrl: 'https://audios-lb.heloprotocol.in/recording-1561355189619.aac-3987-690155-1561355196823.mp3',
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_LOCATION,
//     text: 'test loc',
//     location: {
//         lat: 12.1,
//         lng: 77.2,
//     },
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }, {
//     type: OUTPUT_MISSED_CALL,
//     text: 'test loc',
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }, {
//     type: OUTPUT_MISSED_CALL,
//     text: 'test loc',
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_SINGLE_CHOICE,
//     text: 'Choose one option',
//     options: ['YES', 'NO'],
//     optionDisplays: {'YES': 'YES', 'NO': 'NO'},
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_MULTIPLE_CHOICE,
//     text: 'Choose multiple options',
//     options: ['op 1', 'op 2', 'op 3'],
//     optionDisplays: {'op 1': 'YES', 'op 2': 'NO', 'op 3': 'maybe'},
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_ID_CARD,
//     text: 'blah blah blah',
//     structure: {
//         name: 'abc',
//     },
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_SINGLE_CHOICE,
//     text: '<div><span style="font-size: 25px">👆</span> ये आपकी अभी तक की डिटेल्स हैं. क्या ये सही है ?</div>',
//     options: ['YES', 'NO'],
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_JOB_REFERENCE,
//     text: '<div>Kya ap ye kaam karna chahate ho ?</div>',
//     job: {
//         customer: {
//             person: {
//                 id: 20,
//                 name: 'Cuss1'
//             },
//         },
//         timeFrom: 10,
//         hoursWork: 2,
//         area: 'koramangala',
//         distanceMeters: 1000,
//         jobRequirement: {
//             id: 20,
//             numResidents: 2,
//             cookingRequirements: {
//                 breakfast: true,
//             },
//             location: {
//                 location: {
//                     lat: 12.962314,
//                     lng: 77.609940,
//                 },
//             },
//             attributes: [{
//                 category: 'COOK',
//                 id: 'NORTH_INDIAN',
//             }],
//         },
//     },
//     language: LANG_HINGLISH,
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_JOB_ACTIONABLE,
//     text: '<div>Kya ap <b>ye kaam</b> karna chahate ho ?</div>',
//     job: {
//         customer: {
//             person: {
//                 id: 21,
//                 name: 'Cuss2'
//             },
//         },
//         timeFrom: 10,
//         hoursWork: 2,
//         area: 'koramangala',
//         distanceMeters: 1000,
//         jobRequirement: {
//             id: 21,
//             numResidents: 2,
//             cookingRequirements: {
//                 breakfast: true,
//             },
//             location: {
//                 location: {
//                     lat: 12.962314,
//                     lng: 77.609940,
//                 },
//             },
//             attributes: [{
//                 category: 'COOK',
//                 id: 'NORTH_INDIAN',
//             }],
//         },
//     },
//     language: LANG_HINGLISH,
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_TEXT,
//     text: 'Whats your name ?',
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
// }, {
//     type: OUTPUT_IMAGE,
//     text: 'Photo daal do',
//     askInput: true,
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }, {
//     type: OUTPUT_VIDEO,
//     text: 'Video daal do',
//     askInput: true,
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }, {
//     type: OUTPUT_AUDIO,
//     text: 'Audio daal do',
//     askInput: true,
//     timestamp: new Date().getTime(),
//     sender: SENDER_ME,
// }, {
//     type: OUTPUT_LOCATION,
//     text: 'Turn on your location',
//     askInput: true,
//     options: ['OK'],
//     timestamp: new Date().getTime(),
//     sender: SENDER_VISITOR,
}];
