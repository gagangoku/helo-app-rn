import React from 'react';
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
import AudioAnalyser from "../audio/AudioAnalyser";
import {Image, Modal, Text, View} from "../platform/Util";
import TouchableAnim from "../platform/TouchableAnim";


export default class JobDetailsWidget extends React.Component {
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
        const { disableNav } = this.props;
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
        const femaleOnlySection = femaleOnly ? <Text style={custom.lineAttrib}>Female only</Text> : <View />;
        const vegOnlySection = !vegOnly ? <View /> : <Text style={custom.lineAttrib}>Veg only</Text>;

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
        const numResidentsSection = categories.includes('COOK') ? <Text style={custom.lineAttrib}>Residents: {numResidents}</Text> : <View />;
        const mealsSection = categories.includes('COOK') ? <Text style={custom.lineAttrib}>Meals: {capitalizeEachWord(breakfastLunchDinner.join(', '))}</Text> : <View />;

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
            buttons.push(<View key={customer.person.id + '-spacer-' + i}>{spacer(0, 10)}</View>);
        }

        return (
            <View style={{...custom.jobCtr, ...(this.highlightJob ? custom.highlightJob : custom.noop), ...styleOverrides.root}} key={customer.person.id + ''}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={custom.lineAttrib}>Rs. {fromPrice} - {toPrice} per month</Text>
                    <Text style={custom.lineAttrib}>{timeFrom}, {hoursWork || '-'} hrs work</Text>
                </View>

                <TouchableAnim style={custom.jobMapImgCtr} onPress={navigateToLocFn}>
                    <Image src={staticMapsImg(location.lat, location.lng, MAP_W, MAP_W)} style={custom.jobMapImg} />
                </TouchableAnim>
                <Text style={{...custom.lineAttrib, width: '100%', textAlign: 'center', fontWeight: 'bold'}}>{customerName}'s {workLocType} {debugInfo}</Text>
                {spacer(5)}

                {numResidentsSection}
                {mealsSection}
                <Text style={custom.lineAttrib}>Area: {area}</Text>
                <Text style={custom.lineAttrib}>Languages: {this.normalizeArray(languages).join(', ')}</Text>
                <Text style={custom.lineAttrib}>Work types: {this.normalizeArray(workTypes).join(', ')}</Text>
                {femaleOnlySection}
                {vegOnlySection}
                <Text style={custom.lineAttrib}>Skills needed: {this.normalizeArray(skillSummary).join(', ')}</Text>
                <Text style={custom.lineAttrib}>Distance: {distanceMeters / 1000.0} kms</Text>

                {spacer(15)}
                <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    {buttons}
                </View>
                {this.modalContent()}
            </View>
        );
    };

    normalizeArray = (array) => array.map(x => capitalizeEachWord(x));

    render() {
        return this.renderJob(this.jobDetails);
    }
}

const WINDOW_INNER_WIDTH = WINDOW_INNER_WIDTH || 400;
const W = Math.min(350, WINDOW_INNER_WIDTH - 20);
const MAP_W = Math.ceil(W * 0.85);
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
        // border: '1px solid',
        // borderRadius: 5,
        fontFamily: 'Lato, Helvetica, sans-serif',
        padding: 20,
        margin: 5,

        boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12)',
        borderRadius: 4,
        background: '#ffffff',
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
};

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
