import React from "react";
import {getCtx, getUrlParam, navigateTo, redirectIfNotFlow} from "../util/Util";
import {Route} from "react-router-dom";
import SupplySignupHomeScreen from "../screens/supply/signup/SupplySignupHomeScreen";
import PhoneNumberInputScreen from "../screens/customer/PhoneNumberInputScreen";
import AsyncStorage from "@callstack/async-storage";
import {API_URL, CATEGORY_COOK, PARTNER_CARE_HELPLINE, PHONE_NUMBER_KEY} from "../constants/Constants";
import OtpInputScreen from "../screens/customer/OtpInputScreen";
import LocationInputScreen from "../screens/customer/LocationInputScreen";
import RequirementsScreen from "../screens/supply/signup/RequirementsScreen";
import {getSupplyProfileById, newSupplySignup} from "../util/Api";
import ConfirmOrderScreen from "../screens/supply/signup/ConfirmOrderScreen";
import ThankYouScreen from "../screens/supply/signup/ThankYouScreen";
import IDCard from "../chat/IDCard";
import {QUESTION_WORK_CATEGORIES} from "../chat/Questions";
import ChatBotClient from "../chat/bot/ChatBotClient";
import ViewPersonProfile from "../chat/profile/ViewPersonProfile";
import IDVerifier from "../chat/verifier/IDVerifier";
import QRScanner from "../chat/qrcode/QRScanner";
import LeaderBoard from "../chat/analytics/LeaderBoard";
import GreyList from "../chat/verifier/GreyList";
import GroupAnalytics from "../chat/analytics/GroupAnalytics";
import MyProfile from "../chat/profile/MyProfile";


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

export class StepCookChatBot extends React.Component {
    static URL = '/supply/chat';
    static URL1 = '/supply/cook/chat';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        console.log('rendering SupplyOnboardingChatBot');
        const params = {};
        (new URL(document.location || API_URL)).searchParams.forEach((v, k) => params[k] = v);
        params[QUESTION_WORK_CATEGORIES] = CATEGORY_COOK;     // For cooks
        return (<ChatBotClient location={this.props.location} history={this.props.history} params={params} />);
    }
}

export class StepIDVerifier extends React.Component {
    static URL = '/verifier';
    static URL1 = '/verify';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<IDVerifier location={this.props.location} history={this.props.history} />);
    }
}

export class StepGreyList extends React.Component {
    static URL = '/greylist';
    static URL1 = '/graylist';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<GreyList location={this.props.location} history={this.props.history} />);
    }
}

export class StepQRCodeScanner extends React.Component {
    static URL = '/qr';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<QRScanner location={this.props.location} history={this.props.history} />);
    }
}

export class StepLeaderBoard extends React.Component {
    static URL = '/leader';
    static URL1 = '/leaderboard';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<LeaderBoard location={this.props.location} history={this.props.history} />);
    }
}

export class StepGroupAnalytics extends React.Component {
    static URL = '/group/analytics';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<GroupAnalytics location={this.props.location} history={this.props.history} />);
    }
}

export class StepViewPerson extends React.Component {
    static URL = '/view/person';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<ViewPersonProfile location={this.props.location} history={this.props.history} />);
    }
}

export class StepViewMyProfile extends React.Component {
    static URL = '/view/me';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<MyProfile location={this.props.location} history={this.props.history} />);
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

    StepViewPerson,
    StepViewMyProfile,
    StepCookChatBot,
    StepIDVerifier,
    StepGreyList,
    StepQRCodeScanner,
    StepLeaderBoard,
    StepGroupAnalytics,
    SupplyIDCard,
];
export const routes = (steps.map(x => <Route exact path={x.URL} component={x} key={x.URL} />));
routes.push(<Route exact path={StepCookChatBot.URL1} component={StepCookChatBot} key={StepCookChatBot.URL1} />);
routes.push(<Route exact path={StepGreyList.URL1} component={StepGreyList} key={StepGreyList.URL1} />);
routes.push(<Route exact path={StepIDVerifier.URL1} component={StepIDVerifier} key={StepIDVerifier.URL1} />);
routes.push(<Route exact path={StepLeaderBoard.URL1} component={StepLeaderBoard} key={StepLeaderBoard.URL1} />);
