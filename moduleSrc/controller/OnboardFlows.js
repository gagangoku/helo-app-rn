import React from "react";
import {getCtx, getUrlParam, navigateTo, redirectIfNotFlow} from "../util/Util";
import {Route} from "react-router-dom";
import LocationInputScreen from "../screens/customer/LocationInputScreen";
import NameDetailsScreen from "../screens/onboarder/NameDetailsScreen";
import PhotoScreen from "../screens/onboarder/PhotoScreen";
import {newSupplySignup} from "../util/Api";
import AttributesScreen from "../screens/onboarder/AttributesScreen";
import StartScreen from "../screens/onboarder/StartScreen";
import MiscDetailsScreen from "../screens/onboarder/MiscDetailsScreen";
import SupplyChooserScreen from "../screens/onboarder/SupplyChooserScreen";
import window from "global";
import format from 'string-format';


export const ONBOARD_HOME_PAGE_URL = '/onboarder/home';
export class StepEntry extends React.Component {
    static URL = ONBOARD_HOME_PAGE_URL;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.contextObj.flowName = ONBOARD_FLOW;
    }
    componentDidMount() {
        const start = getUrlParam('start');
        if (start === 'true') {
            this.onStartFn();
        }
    }

    onStartFn = () => {
        const gpsLatitude = getUrlParam('gpsLatitude') ? parseFloat(getUrlParam('gpsLatitude')) : null;
        const gpsLongitude = getUrlParam('gpsLongitude') ? parseFloat(getUrlParam('gpsLongitude')) : null;

        navigateTo(this, StepLocation.URL, { flowName: ONBOARD_FLOW, gpsLatitude, gpsLongitude }, {});
    };
    onUploadPicFn = () => {
        navigateTo(this, StepSupplyChooser.URL, { flowName: ONBOARD_FLOW }, {});
    };
    render() {
        return (
            <StartScreen location={this.props.location} onStartFn={this.onStartFn} onUploadPicFn={this.onUploadPicFn} />
        );
    }
}

class StepLocation extends React.Component {
    static URL = '/onboarder/location';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, ONBOARD_FLOW, StepEntry.URL);
    }
    onSubmitFn = (obj) => {
        console.log('Got location obj: ', obj);
        navigateTo(this, StepNameDetails.URL, this.contextObj, obj);
    };
    render() {
        return (<LocationInputScreen location={this.props.location} onSubmitFn={this.onSubmitFn} />);
    }
}

class StepNameDetails extends React.Component {
    static URL = '/onboarder/name-details';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, ONBOARD_FLOW, StepEntry.URL);
    }

    submitFn = async (obj) => {
        navigateTo(this, StepAttributes.URL, this.contextObj, obj);
    };
    render() {
        return (<NameDetailsScreen location={this.props.location} submitFn={this.submitFn} />);
    }
}

class StepAttributes extends React.Component {
    static URL = '/onboarder/attributes';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, ONBOARD_FLOW, StepEntry.URL);
    }

    submitFn = async (obj) => {
        navigateTo(this, StepMiscDetails.URL, this.contextObj, obj);
    };
    render() {
        return (<AttributesScreen location={this.props.location} jobCategories={this.contextObj.lookingForCategories}
                                  headingFn={(x) => "Job attributes of " + x} submitFn={this.submitFn} />);
    }
}

class StepMiscDetails extends React.Component {
    static URL = '/onboarder/misc';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, ONBOARD_FLOW, StepEntry.URL);
    }

    submitFn = async (obj) => {
        const req = {...this.contextObj, ...obj, onboardedByEnum: 'EXECUTIVE'};
        const supplyId = await createNewSupplyEntryFn(this, req);
        console.log('supplyId: ', supplyId);
        if (supplyId > 0) {
            const supplyName = req.name;
            window.postMessage(format("code 1|supply created|{}|{}", supplyId, supplyName));

            // Goto photo screen after 1 second
            setTimeout(navigateTo(this, StepPhoto.URL, req, { supplyId, supplyName }), 1000);
        }
    };
    render() {
        return (<MiscDetailsScreen location={this.props.location} submitFn={this.submitFn} />);
    }
}

class StepSupplyChooser extends React.Component {
    static URL = '/onboarder/supply-choose';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, ONBOARD_FLOW, StepEntry.URL);
    }

    submitFn = ({ supplyId, supplyName }) => {
        navigateTo(this, StepPhoto.URL, this.contextObj, { supplyId, supplyName });
    };
    render() {
        return (<SupplyChooserScreen location={this.props.location} submitFn={this.submitFn} />);
    }
}

class StepPhoto extends React.Component {
    static URL = '/onboarder/photo';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, ONBOARD_FLOW, StepEntry.URL);
    }
    onSubmitFn = () => {
        setTimeout(() => navigateTo(this, StepEntry.URL, {}, {}), 3000);
    };
    onSkipFn = () => {
        navigateTo(this, StepEntry.URL, {}, {});
    };
    render() {
        return (<PhotoScreen location={this.props.location} onSubmitFn={this.onSubmitFn} onSkipFn={this.onSkipFn} />);
    }
}


class StepDone extends React.Component {
    static URL = '/onboarder/done';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        redirectIfNotFlow(this.contextObj, ONBOARD_FLOW, StepEntry.URL);
    }

    render() {
        setTimeout(() => navigateTo(this, StepEntry.URL, {}, {}), 2000);
        return (
            <div>
                <h1>DONE</h1>
            </div>
        );
    }
}

const createNewSupplyEntryFn = async (obj, req) => {
    console.log('Creating new supply: ', req);

    try {
        const response = await newSupplySignup(req);
        console.log('new supply response: ', response);
        const textLower = response.toLowerCase();

        if (textLower.startsWith('created') || textLower.startsWith('updated')) {
            return parseInt(textLower.split(' ')[1]);
        }
    } catch (e) {
        console.log('Error in new supply signup: ', e);
        window.alert('Something went wrong. Make a note in your notebook');
    }
    return -1;
};

const ONBOARD_FLOW = 'onboard-flow';
const steps = [
    StepEntry,
    StepLocation,
    StepNameDetails,
    StepAttributes,
    StepMiscDetails,
    StepSupplyChooser,
    StepPhoto,
    StepDone,
];
export const routes = steps.flatMap(x => {
    const urls = x.URLS ? x.URLS : [x.URL];
    return urls.map(y => <Route exact path={y} component={x} key={y} />);
});
