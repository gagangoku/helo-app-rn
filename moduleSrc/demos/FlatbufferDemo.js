import React from 'react';
import {flatbuffers, Text, View} from '../platform/Util';
import {helo} from '../schema/flatbuffers/gen/message_generated';
import cnsole from 'loglevel';
import xrange from 'xrange';
import {sumFn} from "../util/Util";
import * as heloProto from '../schema/protobuf/gen/message';
import {Reader} from 'protobufjs/minimal';


export class FlatbufferDemo extends React.Component {
    static URL = '/demos/flatc';
    constructor(props) {
        super(props);
        this.state = {
            times: [],
        };
    }

    async componentDidMount() {
        cnsole.info('flatbuffers: ', flatbuffers);
        cnsole.info('heloProto: ', heloProto);
        const serialized = this.createMessage(1, 'Hello my name is Gagan');
        const { index, text } = this.parseMessage(serialized);
        cnsole.info('parsed: ', { index, text });

        setTimeout(() => this.runLoad(), 2000);
    }

    runLoad = () => {
        this.runOneIter();
        setTimeout(() => this.runLoad(), 2000);
    };
    runOneIter = () => {
        const times = [...this.state.times];
        const time = {};
        const N = 10000;
        time['flatbuffer'] = this.loadTestFb(N);
        time['json'] = this.loadTestJson(N);
        time['protobuf'] = this.loadTestProtobuf(N);
        times.push(time);

        this.setState({ times });
    };

    loadTestFb = (N) => {
        let array;
        let serializationTime, parsingTime, size;
        {
            const startTime = new Date().getTime();
            array = xrange(0, N).toArray().map(x => this.createMessage(x, this.getStr()));
            serializationTime = new Date().getTime() - startTime;
            size = array.map(x => x.position()).reduce(sumFn, 0);
        }

        {
            const startTime = new Date().getTime();
            const parsed = array.map(a => this.parseMessage(a));
            parsingTime = new Date().getTime() - startTime;
            cnsole.info(array.length, array[10], array[10].position());
            cnsole.info(parsed.length, parsed[10]);
        }

        return [serializationTime, parsingTime, size];
    };

    loadTestJson = (N) => {
        let array;
        let serializationTime, parsingTime, size;
        {
            const startTime = new Date().getTime();
            array = xrange(0, N).toArray().map(x => JSON.stringify({ index: x, str: this.getStr() }));
            serializationTime = new Date().getTime() - startTime;
            size = array.map(x => x.length).reduce(sumFn, 0);
        }

        {
            const startTime = new Date().getTime();
            const parsed = array.map(a => JSON.parse(a));
            parsingTime = new Date().getTime() - startTime;
            cnsole.info(array.length, array[10]);
            cnsole.info(parsed.length, parsed[10]);
        }
        return [serializationTime, parsingTime, size];
    };

    loadTestProtobuf = (N) => {
        let array;
        let serializationTime, parsingTime, size;
        {
            const startTime = new Date().getTime();
            array = xrange(0, N).toArray().map(x => {
                const obj = heloProto.Message.fromJSON({ index: x, text: this.getStr() });
                return heloProto.Message.encode(obj).finish();
            });
            serializationTime = new Date().getTime() - startTime;
            size = array.map(x => x.length).reduce(sumFn, 0);
        }

        {
            const startTime = new Date().getTime();
            const parsed = array.map(a => {
                return heloProto.Message.decode(new Reader(a));
            });
            parsingTime = new Date().getTime() - startTime;
            cnsole.info(array.length, array[10]);
            cnsole.info(parsed.length, parsed[10]);
        }
        return [serializationTime, parsingTime, size];
    };

    getStr = () => {
        return 'Hello ' + Math.ceil(1000 * Math.random()) + ' world ' + Math.random();
    };
    createMessage = (index, str) => {
        const builder = new flatbuffers.Builder(100);
        const s = builder.createString(str);

        helo.Message.startMessage(builder);
        helo.Message.addIndex(builder, new flatbuffers.Long(index, index));
        helo.Message.addText(builder, s);
        const orc = helo.Message.endMessage(builder);
        builder.finish(orc);

        return builder.dataBuffer();
    };
    parseMessage = (serialized) => {
        const parsed = helo.Message.getRootAsMessage(serialized);
        const index = parsed.index().high;
        const text = parsed.text();
        return { index, text };
    };

    row = (key, sTime, pTime, size, isBold) => {
        const fontWeight = isBold ? 'bold' : 'normal';
        const s = { fontWeight, border: '1px solid', minHeight: 30 };
        return (
            <View style={{ display: 'flex', flexDirection: 'row', maxWidth: 300 }}>
                <Text style={{ flex: 3, ...s }}>{key}</Text>
                <Text style={{ flex: 2, ...s }}>{sTime}</Text>
                <Text style={{ flex: 2, ...s }}>{pTime}</Text>
                <Text style={{ flex: 3, ...s }}>{size}</Text>
            </View>
        );
    };

    render() {
        const { times } = this.state;
        return (
            <View style={{ display: 'flex', flexDirection: 'column', margin: 10 }}>
                <View style={{ marginBottom: 10 }}>
                    {this.row('Type', 'ser time', 'parse time', '# bytes', true)}
                </View>
                {times.map(x => <View style={{ marginBottom: 10 }}>{
                    Object.keys(x).map(k => {
                        const [sTime, pTime, size] = x[k];
                        return this.row(k, sTime, pTime, size, false);
                    })
                }</View>)}
            </View>
        );
    }
}

const custom = {};
