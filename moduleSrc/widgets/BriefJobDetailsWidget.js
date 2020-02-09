import React from 'react';
import Paper from '@material-ui/core/Paper';
import {actionButton, spacer} from "../util/Util";
import {WINDOW_INNER_WIDTH} from "../platform/Util";


export default class BriefJobDetailsWidget extends React.Component {
    constructor(props) {
        super(props);

        console.log('BriefJobDetailsWidget props:', props);
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
            buttons.push(<div key={'x-spacer-' + i}>{spacer(0, 10)}</div>);
        }

        const likes = job.likes || Math.ceil(5 + Math.random()*20);
        const descItems = desc.map(x => <div style={custom.lineAttrib} key={x}>&bull; {x}</div>);

        return (
            <Paper style={{...custom.jobCtr, ...styleOverrides.root}}>
                <div style={custom.jobMapImgCtr}>
                    <div style={{ fontSize: 19, marginBottom: 10 }}>JOB / काम</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ marginBottom: 10 }}>
                        <img src={pic} style={custom.jobMapImg} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, marginLeft: 20 }}>
                            <div style={{...custom.lineAttrib }}>
                                <div style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 5 }}>{position}</div>
                                <div style={{ fontSize: 16, textDecoration: 'none', color: '#000000ad', fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif' }}>{company}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={custom.lineAttrib}>
                    &bull; Location: {location}
                </div>
                {descItems}

                {spacer(15)}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {buttons}
                </div>
                <div style={custom.likes}>
                    <div style={{ fontSize: 18}}>🎉</div>
                    <div style={{ fontSize: 14, color: 'rgb(3, 102, 214)', letterSpacing: 1 }}>{likes}</div>
                </div>
            </Paper>
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
