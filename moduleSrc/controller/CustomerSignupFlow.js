import React from 'react';
import PhoneNumberInputScreen from "../screens/customer/PhoneNumberInputScreen";
import OtpInputScreen from "../screens/customer/OtpInputScreen";
import RequirementsScreen from "../screens/customer/RequirementsScreen";
import ConfirmOrderScreen from "../screens/customer/ConfirmOrderScreen";
import {Route} from "react-router-dom";
import {getCtx, getUrlParam, navigateTo, redirectIfNotFlow} from "../util/Util";
import AsyncStorage from "@callstack/async-storage";
import {
    CUSTOMER_CARE_HELPLINE,
    DESCRIPTOR_CUSTOMER,
    DESCRIPTOR_JOB_REQUIREMENT,
    FACEBOOK_COMPLETE_REGISTRATION,
    FACEBOOK_LEAD,
    JOB_OPENING_STATUS_OPEN,
    JOB_OPENING_STATUS_PAUSED,
    PHONE_NUMBER_KEY
} from "../constants/Constants";
import LocationInputScreen from "../screens/customer/LocationInputScreen";
import {
    addJobReqId,
    crudsRead,
    crudsSearch,
    crudsUpdate,
    deleteJobReqId,
    editJobReqId,
    newCustomerSignup
} from "../util/Api";
import ThankYouOrderScreen from "../screens/customer/ThankYouOrderScreen";
import window from 'global/window';
import ExpectationsScreen from "../screens/customer/ExpectationsScreen";
import ReactPixel from 'react-facebook-pixel';
import {initFbPixel} from "../util/GoogleAnalytics";
import CustomerDashboardScreen from "../screens/customer/CustomerDashboardScreen";


export const CUSTOMER_SIGNUP_ENTRY_URL = '/customer/entry';
export class StepEntry extends React.Component {
    static URL = CUSTOMER_SIGNUP_ENTRY_URL;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.contextObj.flowName = CUSTOMER_SIGNUP_FLOW;
    }
    async componentDidMount() {
        const gpsLatitude = getUrlParam('gpsLatitude') ? parseFloat(getUrlParam('gpsLatitude')) : null;
        const gpsLongitude = getUrlParam('gpsLongitude') ? parseFloat(getUrlParam('gpsLongitude')) : null;
        const category = getUrlParam('category') || null;
        const hideCategorySelection = getUrlParam('hideCategorySelection') === 'true';
        const hideGenderPref = getUrlParam('hideGenderPref') === 'true';

        // TODO: This is a security hole. Fix it
        const phoneNumber = await AsyncStorage.getItem(PHONE_NUMBER_KEY) || getUrlParam('phoneNumber');
        if (phoneNumber) {
            navigateTo(this, StepDashboard.URL, this.contextObj, { phoneNumber, gpsLatitude, gpsLongitude, category, hideCategorySelection, hideGenderPref });
        } else {
            navigateTo(this, StepEnterPhone.URL, this.contextObj, { gpsLatitude, gpsLongitude, category, hideCategorySelection, hideGenderPref });
        }
    }

    render() {
        return (<div />);
    }
}

class StepEnterPhone extends React.Component {
    static URL = '/customer/enter-phone';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, CUSTOMER_SIGNUP_FLOW, StepEntry.URL);
    }
    componentDidMount() {
        initFbPixel() && ReactPixel.track(FACEBOOK_LEAD, {});
    }

    submitFn = (phoneNumber) => {
        navigateTo(this, StepEnterOtp.URL, this.contextObj, { phoneNumber });
    };
    render() {
        return (<PhoneNumberInputScreen location={this.props.location} role="customer" submitFn={this.submitFn} />);
    }
}

class StepEnterOtp extends React.Component {
    static URL = '/customer/enter-otp';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, CUSTOMER_SIGNUP_FLOW, StepEntry.URL);
    }
    otpSuccessFn = async (otp) => {
        await AsyncStorage.setItem(PHONE_NUMBER_KEY, this.contextObj.phoneNumber);
        console.log('Phone number saved');
        navigateTo(this, StepDashboard.URL, this.contextObj, {});
    };
    render() {
        return (<OtpInputScreen location={this.props.location} role="customer" otpSuccessFn={this.otpSuccessFn} />);
    }
}

class StepDashboard extends React.Component {
    static URL = '/customer/dashboard';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, CUSTOMER_SIGNUP_FLOW, StepEntry.URL);
        this.state = {
            initialized: false,
        };
    }
    async componentDidMount() {
        initFbPixel() && ReactPixel.track('customer-dashboard', {});

        const phoneNumber = this.contextObj.phoneNumber;
        this.contextObj.customerProfile = await this.getCustomer(phoneNumber);
        this.setState({ initialized: true });
    }

    createCustFn = async (customerName, email) => {
        const phoneNumber = this.contextObj.phoneNumber;
        const customerId = await newCustomerSignup({ phoneNumber, customerName, email, gender: 'OTHER' });
        this.contextObj.customerName = customerName;
        this.contextObj.email = email;

        this.contextObj.customerProfile = await this.getCustomer(phoneNumber);
        return customerId;
    };
    onAddJobReqFn = () => {
        navigateTo(this, StepLocation.URL, this.contextObj, { op: OP_ADD_JOB_REQ });
    };
    onEditJobReqFn = (jobReqId) => {
        navigateTo(this, StepLocation.URL, this.contextObj, { jobReqId, op: OP_EDIT_JOB_REQ });
    };
    onDeleteJobReqFn = async (jobReqId) => {
        return await deleteJobReqId(this.contextObj.customerProfile.person.id, jobReqId);
    };
    onPauseJobReqFn = async (jobReq) => {
        jobReq.status = JOB_OPENING_STATUS_PAUSED;
        console.log('About to pause jobReq: ', jobReq);
        return await crudsUpdate(DESCRIPTOR_JOB_REQUIREMENT, jobReq.id, jobReq);
    };
    onReopenJobReqFn = async (jobReq) => {
        jobReq.status = JOB_OPENING_STATUS_OPEN;
        console.log('About to open jobReq: ', jobReq);
        return await crudsUpdate(DESCRIPTOR_JOB_REQUIREMENT, jobReq.id, jobReq);
    };

    getCustomer = async (phoneNumber) => {
        const customerList = await crudsSearch(DESCRIPTOR_CUSTOMER, { phoneNumber });
        if (!customerList || customerList.length === 0) {
            return null;
        }

        const customerProfile = customerList[0];
        customerProfile.jobOpenings = [];
        for (let i = 0; i < (customerProfile.jobOpeningIds || []).length; i++) {
            const jobReq = await crudsRead(DESCRIPTOR_JOB_REQUIREMENT, customerProfile.jobOpeningIds[i]);
            customerProfile.jobOpenings.push(jobReq);
        }
        return customerProfile;
    };

    render() {
        if (!this.state.initialized) {
            return (<div>Loading ...</div>);
        }
        return (<CustomerDashboardScreen location={this.props.location}
                                         createCustFn={this.createCustFn} onAddJobReqFn={this.onAddJobReqFn} onReopenJobReqFn={this.onReopenJobReqFn}
                                         onPauseJobReqFn={this.onPauseJobReqFn}
                                         onEditJobReqFn={this.onEditJobReqFn} onDeleteJobReqFn={this.onDeleteJobReqFn} />);
    }
}

class StepLocation extends React.Component {
    static URL = '/customer/location';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, CUSTOMER_SIGNUP_FLOW, StepEntry.URL);
    }
    onSubmitFn = (location) => {
        const { area, city, latitude, longitude, addressEntered, landmarkLat, landmarkLon } = location;
        navigateTo(this, StepRequirements.URL, this.contextObj, { area, city, latitude, longitude, addressEntered, landmarkLat, landmarkLon });
    };
    render() {
        return (<LocationInputScreen location={this.props.location} onSubmitFn={this.onSubmitFn} />);
    }
}

class StepRequirements extends React.Component {
    static URL = '/customer/requirements/hours';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, CUSTOMER_SIGNUP_FLOW, StepEntry.URL);
    }
    onSubmitFn = (obj) => {
        navigateTo(this, StepCustomerExpectations.URL, this.contextObj, obj);
    };
    render() {
        return (<RequirementsScreen location={this.props.location} onSubmitFn={this.onSubmitFn} />);
    }
}

class StepCustomerExpectations extends React.Component {
    static URL = '/customer/expectations';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, CUSTOMER_SIGNUP_FLOW, StepEntry.URL);
    }

    onSubmitFn = async (obj) => {
        navigateTo(this, StepConfirm.URL, this.contextObj, obj);
    };
    render() {
        return (<ExpectationsScreen location={this.props.location} onSubmitFn={this.onSubmitFn} />);
    }
}

class StepConfirm extends React.Component {
    static URL = '/customer/confirm';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, CUSTOMER_SIGNUP_FLOW, StepEntry.URL);
    }
    onSubmitFn = async (obj) => {
        const req = {...this.contextObj, ...obj, gender: 'OTHER'};
        const { op } = this.contextObj;

        try {
            if (op === OP_EDIT_JOB_REQ) {
                await editJobReqId(this.contextObj.customerProfile.person.id, this.contextObj.jobReqId, req);
            } else {
                await addJobReqId(this.contextObj.customerProfile.person.id, req);
            }
        } catch (e) {
            console.log('Error in new job requirement add / edit: ', e);
            window.alert('Something went wrong. Please try again after some time or call our customer care: ' + CUSTOMER_CARE_HELPLINE);
            return;
        }

        navigateTo(this, StepThankYou.URL, req, {});
    };
    render() {
        return (<ConfirmOrderScreen location={this.props.location} onSubmitFn={this.onSubmitFn} />);
    }
}

class StepThankYou extends React.Component {
    static URL = '/customer/thank-you';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, CUSTOMER_SIGNUP_FLOW, StepEntry.URL);
    }
    componentDidMount() {
        window.postMessage("code 2|customer created");      // Customer created message
        window.postMessage("success");
        initFbPixel() && ReactPixel.track(FACEBOOK_COMPLETE_REGISTRATION, {});
    }
    render() {
        return (<ThankYouOrderScreen location={this.props.location} />);
    }
}

const OP_EDIT_JOB_REQ = 'edit-job-req';
const OP_ADD_JOB_REQ = 'add-job-req';
const CUSTOMER_SIGNUP_FLOW = 'customer-signup';
const steps = [
    StepEntry,
    StepEnterPhone,
    StepEnterOtp,
    StepDashboard,
    StepLocation,
    StepRequirements,
    StepCustomerExpectations,
    StepConfirm,
    StepThankYou,
];
export const routes = (steps.map(x => <Route exact path={x.URL} component={x} key={x.URL} />));
