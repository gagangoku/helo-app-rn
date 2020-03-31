import React from 'react';
import {actionButton, spacer} from "../util/Util";
import {Image, Text, View, WINDOW_INNER_WIDTH} from "../platform/Util";
import cnsole from 'loglevel';


export default class BriefJobDetailsWidget extends React.Component {
    constructor(props) {
        super(props);

        cnsole.log('BriefJobDetailsWidget props:', props);
        this.contextObj = {};
    }

    render() {
        const { job, actionPanel } = this.props;
        const { position, company, location, desc, pic } = job;
        const styleOverrides = this.props.styleOverrides || { root: {} };

        const buttons = [];
        const { labels, actions } = actionPanel;
        for (let i = 0; i < labels.length; i++) {
            buttons.push(actionButton(labels[i], actions[i], {minWidth: 100, width: 100, height: 40}));
            buttons.push(<View key={'x-spacer-' + i}>{spacer(0, 10)}</View>);
        }

        const likes = job.likes || Math.ceil(5 + Math.random()*20);
        const descItems = desc.map(x => <Text style={custom.lineAttrib} key={x}>&bull; {x}</Text>);

        return (
            <View style={{...custom.jobCtr, ...styleOverrides.root}}>
                <View style={custom.jobMapImgCtr}>
                    <Text style={{ fontSize: 19, marginBottom: 10 }}>JOB / काम</Text>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ marginBottom: 10 }}>
                        <Image src={pic} style={custom.jobMapImg} />
                    </View>
                    <View>
                        <View style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, marginLeft: 20 }}>
                            <View style={{...custom.lineAttrib }}>
                                <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 5 }}>{position}</Text>
                                <Text style={{ fontSize: 16, textDecoration: 'none', color: '#000000ad', fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif' }}>{company}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={custom.lineAttrib}>
                    &bull; Location: {location}
                </Text>
                {descItems}

                {spacer(15)}
                <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {buttons}
                </View>
                <View style={custom.likes}>
                    <Text style={{ fontSize: 18}}>🎉</Text>
                    <Text style={{ fontSize: 14, color: 'rgb(3, 102, 214)', letterSpacing: 1 }}>{likes}</Text>
                </View>
            </View>
        );
    }
}

const W = Math.min(300, Math.min(WINDOW_INNER_WIDTH, 450) - 150);
const IMG_WIDTH = 90;
const custom = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },

    highlightJob: {
        backgroundColor: '#e6e6e6',
    },
    jobCtr: {
        width: W,
        position: 'relative',
        fontFamily: 'Lato, Helvetica, sans-serif',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 15,
        margin: 5,

        boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12)',
        borderRadius: 4,
        background: '#ffffff',
    },
    jobMapImgCtr: {
        width: '100%',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        // marginBottom: 10,
        // marginTop: 10,
    },
    jobMapImg: {
        width: IMG_WIDTH,
    },
    lineAttrib: {
        fontSize: 14,
        marginBottom: 5,
        marginLeft: 8,
    },

    noop: {},
    likes: {
        fontFamily: 'Lato, Helvetica, sans-serif',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'absolute',
        bottom: 5,
        right: 10,
    },
};
