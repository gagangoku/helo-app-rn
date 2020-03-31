import React from 'react';
import {ScrollView, Text, View} from '../platform/Util';
import cnsole from 'loglevel';
import queue from 'queue';
import {sumFn} from '../util/Util';


export class QueueLoadTest extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            map: {},
        };
        this.evalTimes = [];
        this.diffs = [];
        this.renders = {};
    }

    func = (resolve, i) => {
        const startTimeMs = new Date().getTime();
        const wait = Math.ceil(Math.random() * 20);
        this.evalTimes.push(wait);

        setTimeout(() => {
            const endTimeMs = new Date().getTime();
            const diff = endTimeMs - startTimeMs - wait;
            this.diffs.push(diff);

            this.renders[i] = { idx: i, startTimeMs, endTimeMs };
            // this.setState({ map: {...this.state.map, [i]: { idx: i, startTimeMs, endTimeMs } } });
            resolve();
        }, wait);
    };
    componentDidMount() {
        this.startTime = new Date().getTime();
        const q = queue({ concurrency: 1 });
        for (let i = 0; i < NUM_ITERATIONS; i++) {
            // NOTE: Callback is a lot faster than promise here !
            q.push((resolve) => this.func(resolve, i));
            // q.push(() => new Promise(resolve => this.func(resolve, i)));
        }

        const cbFn = (qName, queueObj) => {
            return (e) => {
                if (e) {
                    cnsole.error('Error in ', qName, e);
                } else {
                    cnsole.info('queue ended: ', qName);
                    this.setState({ map: this.renders });
                }
            };
        };
        q.start(cbFn('q', q));
    }

    render() {
        const { map } = this.state;
        const sorted = Object.values(map).sort((a, b) => {
            if (a.startTimeMs < b.startTimeMs) {
                return -1;
            }
            if (a.startTimeMs > b.startTimeMs) {
                return 1;
            }
            return b.endTimeMs - a.endTimeMs;
        });

        const diffs = this.diffs.reduce(sumFn, 0);
        const supposedEvalTime = this.evalTimes.map(x => x).reduce(sumFn, 0);
        const actualEvalTime = sorted.length === 0 ? 0 : sorted[sorted.length - 1].endTimeMs - sorted[0].startTimeMs;
        let overlap = 'false';
        for (let i = 0; i < sorted.length - 1; i++) {
            const a = sorted[i];
            const b = sorted[i+1];
            if (a.endTimeMs > b.startTimeMs) {
                overlap = 'true';
            }
        }
        return (
            <View>
                <Text>Overlap: {overlap}</Text>
                <Text>sorted.length: {sorted.length}</Text>
                <Text>supposedEvalTime: {supposedEvalTime}</Text>
                <Text>actualEvalTime: {actualEvalTime}</Text>
                <Text>diffs: {diffs}</Text>
                <Text>Gap: {actualEvalTime - supposedEvalTime - diffs}</Text>

                <ScrollView>
                    <View style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                        {sorted.map(x => <Text key={x.idx}>{x.idx} {x.startTimeMs - this.startTime} {x.endTimeMs - this.startTime}</Text>)}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const NUM_ITERATIONS = 200;
