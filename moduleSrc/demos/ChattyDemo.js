import React from 'react';
import {TextareaElemHackForPaste, View} from "../platform/Util";
import {HeloChatClient} from "../helochat/HeloChatClient";
import {CHAT_FONT_FAMILY} from "../constants/Constants";
import {actionButton, spacer} from "../util/Util";
import {OUTPUT_TEXT} from "../chat/Questions";


export class ChattyDemo extends React.Component {
    static URL = '/demos/chatty';
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            typed: '',
        };
    }

    async componentDidMount() {
        this.client = await HeloChatClient({ userId: USER_ID, receiver: this });
    }

    onView = (view) => {
        this.setState({ messages: [...this.state.messages, view] });
    };
    onUpdate = ({ updatedGroups, newMessages, queueDelayMs }) => {
        this.setState({ messages: [...this.state.messages, { updatedGroups, newMessages }] });
    };
    send = () => {
        const { typed } = this.state;
        this.client.sendMessage({ groupId: GROUP_ID, type: OUTPUT_TEXT, text: typed });
        this.setState({ typed: '' });
    };

    render() {
        const { typed, messages } = this.state;
        return (
            <View style={{ display: 'flex', flexDirection: 'column' }}>
                <TextareaElemHackForPaste style={custom.inputMessage} placeholder="  Type here ..." type="text"
                                          value={typed} onChangeText={(typed) => this.setState({ typed })} />
                {spacer(10)}
                {actionButton('Send', this.send)}
                {spacer(20)}

                <View style={{ display: 'flex', flexDirection: 'column' }}>
                    {messages.map((x, index) => <View key={index}>{JSON.stringify(x)}</View>)}
                </View>
            </View>
        );
    }
}

const USER_ID = 593;
const GROUP_ID = 1;
const custom = {
    grid: {
        width: '60%',
    },
    inputMessage: {
        width: '90%',
        height: 50,
        marginLeft: 10,
        borderWidth: 0,
        outline: 'none',
        fontSize: 16,
        fontFamily: CHAT_FONT_FAMILY,
    },
};
