import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import {
    actionButton,
    capitalizeEachWord,
    getKeysWhereValueIs,
    getUrlParam,
    isDebugMode,
    navigateToLatLon,
    spacer,
    staticMapsImg
} from "../util/Util";
import {GENDER_FEMALE} from "../constants/Constants";
import classnames from "classnames";
import Modal from "react-modal";
import AudioAnalyser from "../audio/AudioAnalyser";
import window from 'global/window';


class JobDetailsWidget extends React.Component {
    constructor(props) {
        super(props);

        console.log('JobDetailsWidget props:', props);
        this.contextObj = {};
        this.supplyId = this.props.supplyId || this.contextObj.supplyId || getUrlParam('supplyId');
        this.jobDetails = this.props.jobDetails || this.contextObj.jobDetails || JSON.parse(getUrlParam('jobDetails'));
        this.highlightJob = this.props.highlightJob || this.contextObj.highlightJob || getUrlParam('highlightJob');

        this.state = {
            isRecording: false,
            audio: null
        };
    }

    getMicrophone = async () => {
        const audio = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        });
        this.setState({ isRecording: true, audio });
    };

    stopMicrophone = () => {
        this.state.audio.getTracks().forEach(track => track.stop());
        this.setState({ isRecording: false, audio: null });
        document.body.style.overflow = 'auto';
    };

    disableScroll = () => {
        document.body.style.overflow = 'hidden';
    };

    modalContent = () => {
        return (
            <Modal isOpen={this.state.isRecording} onRequestClose={this.stopMicrophone}
                   style={modalStyle} onAfterOpen={this.disableScroll} contentLabel="Example Modal">
                <AudioAnalyser audio={this.state.audio} />
            </Modal>
        );
    };

    inquireJob = async (customer) => {
        this.getMicrophone();
    };

    renderJob = (jobDetails) => {
        const { classes, applyJobFn, disableNav, disableEnquiry } = this.props;
        const styleOverrides = this.props.styleOverrides || { root: {} };
        const platform = navigator.platform;

        const { customer, timeFrom, hoursWork, area, distanceMeters } = jobDetails;
        const jobOpening = jobDetails.jobRequirement;
        const customerName = customer.person.name.split(' ')[0];
        const location = jobOpening.location.location || {};
        const languages = jobOpening.languages || [];

        const { numResidents, cookingRequirements } = jobOpening;
        const breakfastLunchDinner = getKeysWhereValueIs(cookingRequirements || {}, true);

        const vegOnly = jobOpening.veg === 'VEG_ONLY' || false;
        const femaleOnly = jobOpening.gender === GENDER_FEMALE;
        const femaleOnlySection = femaleOnly ? <div className={classes.lineAttrib}>Female only</div> : '';
        const vegOnlySection = !vegOnly ? '' : <div className={classes.lineAttrib}>Veg only</div>;

        const skills = {};
        jobOpening.attributes.forEach(x => {
            const cat = capitalizeEachWord(x.category);
            if (!(cat in skills)) {
                skills[cat] = [];
            }
            skills[cat].push(x.displayName || capitalizeEachWord(x.id));
        });

        const skillSummary = [];
        Object.keys(skills).forEach(x => {
            skillSummary.push(x + ' (' + skills[x].join(', ') + ' )');
        });

        const categories = Object.keys(skills).map(x => x.toUpperCase());
        console.log('categories: ', categories);
        const numResidentsSection = categories.includes('COOK') ? <div className={classes.lineAttrib}>Residents: {numResidents}</div> : '';
        const mealsSection = categories.includes('COOK') ? <div className={classes.lineAttrib}>Meals: {capitalizeEachWord(breakfastLunchDinner.join(', '))}</div> : '';

        const workLocType = (jobOpening.workLocType || ['HOME'])[0].toLowerCase();
        const workTypes = jobOpening.workTypes || [];
        const budget = jobOpening.budget || 0;
        const fromPrice = Math.max(0, budget - 500);
        const toPrice = Math.max(0, budget + 500);

        const isDebug = isDebugMode();
        const debugInfo = isDebug ? '(cust:' + customer.person.id + ', job:' + jobOpening.id + ')' : '';

        const navigateToLocFn = () => {
            if (disableNav !== true) {
                navigateToLatLon(platform, location.lat, location.lng);
            }
        };

        const buttons = [];
        const { labels, actions } = this.props.actionPanel;
        for (let i = 0; i < labels.length; i++) {
            buttons.push(actionButton(labels[i], () => actions[i](customer), {minWidth: 100, width: 100, height: 40}));
            buttons.push(<div key={customer.person.id + '-spacer-' + i}>{spacer(0, 10)}</div>);
        }

        const clazz = classnames(classes.jobCtr, this.highlightJob ? classes.highlightJob : classes.noop);
        return (
            <Paper className={clazz} key={customer.person.id + ''} style={styleOverrides.root}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <div className={classes.lineAttrib}>Rs. {fromPrice} - {toPrice} per month</div>
                    <div className={classes.lineAttrib}>{timeFrom}, {hoursWork || '-'} hrs work</div>
                </div>

                <div className={classes.jobMapImgCtr}>
                    <a onClick={navigateToLocFn} target="_blank">
                        <img src={staticMapsImg(location.lat, location.lng, MAP_W, MAP_W)} className={classes.jobMapImg} />
                    </a>
                </div>
                <div className={classes.lineAttrib} style={{ width: '100%', textAlign: 'center' }}><b>{customerName}'s {workLocType} {debugInfo}</b></div>
                {spacer(5)}

                {numResidentsSection}
                {mealsSection}
                <div className={classes.lineAttrib}>Area: {area}</div>
                <div className={classes.lineAttrib}>Languages: {this.normalizeArray(languages).join(', ')}</div>
                <div className={classes.lineAttrib}>Work types: {this.normalizeArray(workTypes).join(', ')}</div>
                {femaleOnlySection}
                {vegOnlySection}
                <div className={classes.lineAttrib}>Skills needed: {this.normalizeArray(skillSummary).join(', ')}</div>
                <div className={classes.lineAttrib}>Distance: {distanceMeters / 1000.0} kms</div>

                {spacer(15)}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    {buttons}
                </div>
                {this.modalContent()}
            </Paper>
        );
    };

    normalizeArray = (array) => array.map(x => capitalizeEachWord(x));

    render() {
        return this.renderJob(this.jobDetails);
    }
}

const WINDOW_INNER_WIDTH = window.innerWidth || 400;
const W = Math.min(350, WINDOW_INNER_WIDTH - 20);
const MAP_W = Math.ceil(W * 0.85);
const styles = theme => ({
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
        // border: '1px solid',
        // borderRadius: 5,
        fontFamily: 'Lato, Helvetica, sans-serif',
        padding: 20,
        margin: 5,
    },
    jobMapImgCtr: {
        width: '100%',
        justifyContent: 'center',
        display: 'flex',
        marginBottom: 10,
        marginTop: 10,
    },
    jobMapImg: {
        height: MAP_W,
        width: MAP_W,
    },
    lineAttrib: {
        fontSize: 15,
        marginBottom: 5,
    },

    noop: {},
});
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

export default withStyles(styles)(JobDetailsWidget);
