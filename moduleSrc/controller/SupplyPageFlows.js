import React from "react";
import {getCtx, getUrlParam, navigateTo, redirectIfNotFlow} from "../util/Util";
import SupplySignupHomeScreen from "../screens/supply/signup/SupplySignupHomeScreen";
import PhoneNumberInputScreen from "../screens/customer/PhoneNumberInputScreen";
import {PARTNER_CARE_HELPLINE, PHONE_NUMBER_KEY} from "../constants/Constants";
import OtpInputScreen from "../screens/customer/OtpInputScreen";
import LocationInputScreen from "../screens/customer/LocationInputScreen";
import RequirementsScreen from "../screens/supply/signup/RequirementsScreen";
import {getSupplyProfileById, newSupplySignup} from "../util/Api";
import ConfirmOrderScreen from "../screens/supply/signup/ConfirmOrderScreen";
import ThankYouScreen from "../screens/supply/signup/ThankYouScreen";
import IDCard from "../chat/IDCard";
import {AsyncStorage, Route} from '../platform/Util';


export const SUPPLY_HOME_PAGE_URL = '/supply/home';
class StepSupplyHome extends React.Component {
    static URL = SUPPLY_HOME_PAGE_URL;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.contextObj.flowName = SUPPLY_SIGNUP_FLOW;
    }
    onSubmitFn = () => {
        navigateTo(this, StepEntry.URL, this.contextObj, {});
    };

    render() {
        return (<SupplySignupHomeScreen location={this.props.location} onSubmitFn={this.onSubmitFn} />);
    }
}

export class StepEntry extends React.Component {
    static URL = '/supply/entry';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.contextObj.flowName = SUPPLY_SIGNUP_FLOW;
    }
    async componentDidMount() {
        const phoneNumber = await AsyncStorage.getItem(PHONE_NUMBER_KEY);
        if (!phoneNumber) {
            navigateTo(this, StepEnterPhone.URL, this.contextObj, { phoneNumber });
        } else {
            navigateTo(this, StepLocation.URL, this.contextObj, { phoneNumber });
        }
    }

    render() {
        return (<div />);
    }
}


class StepEnterPhone extends React.Component {
    static URL = '/supply/enter-phone';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, SUPPLY_SIGNUP_FLOW, StepEntry.URL);
    }

    submitFn = (phoneNumber) => {
        navigateTo(this, StepEnterOtp.URL, this.contextObj, { phoneNumber });
    };
    render() {
        return (<PhoneNumberInputScreen location={this.props.location} role="supply" submitFn={this.submitFn} />);
    }
}

class StepEnterOtp extends React.Component {
    static URL = '/supply/enter-otp';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, SUPPLY_SIGNUP_FLOW, StepEntry.URL);
    }
    otpSuccessFn = async (otp) => {
        await AsyncStorage.setItem(PHONE_NUMBER_KEY, this.contextObj.phoneNumber);
        console.log('Phone number saved');
        navigateTo(this, StepLocation.URL, this.contextObj, {});
    };
    render() {
        return (<OtpInputScreen location={this.props.location} role="supply" otpSuccessFn={this.otpSuccessFn} />);
    }
}

class StepLocation extends React.Component {
    static URL = '/supply/location';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, SUPPLY_SIGNUP_FLOW, StepEntry.URL);
    }
    onSubmitFn = (location) => {
        const {area, city, latitude, longitude, addressEntered, landmarkLat, landmarkLon} = location;
        navigateTo(this, StepRequirements.URL, this.contextObj, {area, city, latitude, longitude, addressEntered, landmarkLat, landmarkLon});
    };
    render() {
        return (<LocationInputScreen location={this.props.location} onSubmitFn={this.onSubmitFn} />);
    }
}

class StepRequirements extends React.Component {
    static URL = '/supply/requirements';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, SUPPLY_SIGNUP_FLOW, StepEntry.URL);
    }
    onSubmitFn = ({jobs, workingHours}) => {
        navigateTo(this, StepConfirm.URL, this.contextObj, {jobs, workingHours});
    };
    render() {
        return (<RequirementsScreen location={this.props.location} onSubmitFn={this.onSubmitFn} />);
    }
}

class StepConfirm extends React.Component {
    static URL = '/supply/confirm';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, SUPPLY_SIGNUP_FLOW, StepEntry.URL);
    }
    onSubmitFn = async (obj) => {
        const req = {...this.contextObj, ...obj};
        console.log('Signing up new supply: ', req);
        try {
            await newSupplySignup(req);
        } catch (e) {
            console.log('Error in new supply signup: ', e);
            window.alert('Something went wrong. Please try again after some time or call our customer care: ' + PARTNER_CARE_HELPLINE);
            return;
        }
        navigateTo(this, StepThankYou.URL, req, {});
    };
    render() {
        return (<ConfirmOrderScreen location={this.props.location} onSubmitFn={this.onSubmitFn} />);
    }
}

class StepThankYou extends React.Component {
    static URL = '/supply/thank-you';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, SUPPLY_SIGNUP_FLOW, StepEntry.URL);
    }
    render() {
        return (<ThankYouScreen location={this.props.location} />);
    }
}


export class SupplyIDCard extends React.Component {
    static URL = '/supply/id-card';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            supply: null,
        };
    }
    async componentWillMount() {
        const supplyId = this.props.supplyId || getUrlParam('id');
        if (supplyId) {
            const supply = await getSupplyProfileById(supplyId, false);
            this.setState({ supply });
        }
    }
    render() {
        const supplyId = this.props.supplyId || getUrlParam('id');
        if (!supplyId) {
            return (<IDCard location={this.props.location} supplyDetails={{}} key="0" />);
        } else if (supplyId && !this.state.supply) {
            return (<div>Loading ...</div>);
        } else {
            return (<IDCard location={this.props.location} supply={this.state.supply} key="1" />);
        }
    }
}

const SUPPLY_SIGNUP_FLOW = 'supply-signup-flow';
const steps = [
    StepSupplyHome,
    StepEntry,
    StepEnterPhone,
    StepEnterOtp,
    StepLocation,
    StepRequirements,
    StepConfirm,
    StepThankYou,

    SupplyIDCard,
];
export const routes = steps.flatMap(x => {
    const urls = x.URLS ? x.URLS : [x.URL];
    return urls.map(y => <Route exact path={y} component={x} key={y} />);
});
