import React from 'react';
import {Text, View} from "../platform/Util";
import {HeloChatClient} from "../helochat/HeloChatClient";
import {CHAT_FONT_FAMILY} from "../constants/Constants";
import {OUTPUT_TEXT} from "../chat/Questions";
import {spacer, sumFn} from "../util/Util";
import cnsole from 'loglevel';


export class ChattyLoadtest extends React.Component {
    static URL = '/loadtest/chatty';
    constructor(props) {
        super(props);
        this.state = {
            queueDelayMs: [],
            iter: 0,
        };
    }

    async componentDidMount() {
        // Kick off actual clients
        this.responseTimesMs = [];
        const receiver = {
            onView: () => {},
            onUpdate: ({ queueDelayMs }) => {
                this.responseTimesMs.push(queueDelayMs);
            },
        };

        this.clients = [];
        for  (let i = 0; i < NUM_CLIENTS; i++) {
            const idx = Math.ceil(USERS.length * Math.random());
            const userId = USERS[idx];
            this.clients.push(await HeloChatClient({ userId, receiver }));
        }

        setTimeout(this.sendLoad, 5000);
    }

    sendLoad = async () => {
        for (let i = 0; i < NUM_ITERATIONS; i++) {
            const text = '' + Math.random();
            this.clients.forEach(client => client.sendMessage({ groupId: GROUP_ID, type: OUTPUT_TEXT, text }));

            this.setState({ iter: this.state.iter + 1 });
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        await new Promise(resolve => setTimeout(resolve, 10000));
        this.setState({ queueDelayMs: this.responseTimesMs });
        cnsole.info('this.responseTimesMs: ', this.responseTimesMs);
    };

    render() {
        const { queueDelayMs, iter } = this.state;
        const lines = [];
        for (let i = 0; i < queueDelayMs.length; i++) {
            const j = i % NUM_CLIENTS;
            if (j === 0) {
                lines.push([]);
            }
            lines[lines.length - 1][j] = queueDelayMs[i];
        }
        cnsole.info('lines: ', lines);

        const copy = queueDelayMs.slice().sort();
        const average = copy.reduce(sumFn, 0) / Math.max(1, copy.length);
        const median  = copy.length > 0 ? copy[copy.length / 2] : 0;
        const stddev  = copy.map(x => (x - average) ** 2).reduce(sumFn, 0) / Math.max(1, copy.length);
        const variance = stddev ** 0.5;


        return (
            <View style={{ display: 'flex', flexDirection: 'column' }}>
                <Text>Iter: {iter}</Text>
                {spacer(10)}

                <Text>average: {average}</Text>
                {spacer(10)}
                <Text>median: {median}</Text>
                {spacer(10)}
                <Text>stddev: {stddev}</Text>
                {spacer(10)}
                <Text>variance: {variance}</Text>
                {spacer(30)}

                <View style={{ display: 'flex', flexDirection: 'column' }}>
                    {lines.map((line, index) => <Text key={index} style={custom.line}>{line.join(', ')}</Text>)}
                </View>
            </View>
        );
    }
}

const NUM_ITERATIONS = 40;
const NUM_CLIENTS = 20;
const GROUP_ID = 1;
const USERS = '593,962,584,939,621,155,694,143,884,522,730,271,921,638,302,942,619,307,293,675,134,975,781,89,984,979,94,836,139,958,472,909,455,14,993,451,838,560,646,690,265,376,196,395,940,665,239,562,248,925,90,355,805,427,674,285,963,20,772,705,858,422,425,20,716,223,452,690,853,548,262,701,969,206,98,317,484,569,298,592,701,653,621,226,798,981,410,753,153,310,511,783,605,869,658,431,821,157,361,503'.split(',');
const custom = {
    grid: {
        width: '60%',
    },
    line: {
        marginLeft: 5,
        marginBottom: 5,
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
