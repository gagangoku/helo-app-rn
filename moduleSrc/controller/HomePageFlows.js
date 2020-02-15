import React from 'react';
import {Helmet, Route, WINDOW_INNER_HEIGHT} from '../platform/Util';
import {awaitPromises, fireApiCalls, getCtx, getUrlParam} from "../util/Util";
import GiveRecommendation from "../screens/GiveRecommendation";
import HomePageScreen from "../screens/HomePageScreen";
import SupplyProfileScreen from "../screens/supply/SupplyProfileScreen";
import FullPhotoScreen from "../screens/FullPhotoScreen";
import document from "global/document";
import window from "global/window";
import SearchProfilesWidget from "../screens/supply/SearchProfilesWidget";
import BrowseWidget from "../widgets/BrowseWidget";
import CategoryHomeScreen from "../screens/landing-page/CategoryHomeScreen";
import {CATEGORY_COOK, CATEGORY_MAID, CATEGORY_NANNY} from "../constants/Constants";
import {CUSTOMER_SIGNUP_ENTRY_URL} from "./CustomerSignupFlow";
import SeeJobs from "../screens/supply/SeeJobs";
import JobDetailsWidget from "../widgets/JobDetailsWidget";
import {getJobDetails} from "../util/Api";
import VideoWithAnalytics from "../screens/VideoWithAnalytics";
import {HOME_PAGE_URLS} from "./Urls";
import cnsole from 'loglevel';


export const HOME_PAGE_URL = '/';
export const MAIDS_PAGE_URL = '/maids';
export const NANNY_PAGE_URL = '/nanny';
export const COOKS_PAGE_URL = '/cooks';
export const WRITE_SUPPLY_RECOMMENDATION = '/supply/write-recommendation';
export const BROWSE_PAGE_URL = '/see-all-maids';
export const SEE_JOBS_PAGE_URL = '/supply/see-jobs';
export const SEE_JOB_PAGE_URL = '/jobs/see-job';
class StepHome extends React.Component {
    static URLS = [HOME_PAGE_URL, '//'];
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        return (<HomePageScreen location={this.props.location} />);
    }
}

export class StepMaids extends React.Component {
    static URL = MAIDS_PAGE_URL;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    signupForMonthlyFn = () => {
        window.location.href = CUSTOMER_SIGNUP_ENTRY_URL + '?category=' + CATEGORY_MAID;
    };
    render() {
        const sections = {
            heading: {
                heading: 'Looking for a trustworthy Maid ?',
            },
            qualities: {
                heading: 'Maid for you',
                desc: 'Maids are so essential to the functioning of our households that the day they don\'t show up, the whole house is in disarray.',
            },
        };
        const bannerImg = 'https://images-lb.heloprotocol.in/84.png-164926-868826-1552576426263.png?name=maid-banner.png';
        const title = 'Maids | Helo Protocol | Professional network for Blue collared Workforce in India - maids, cooks, nannies, car washers, newspaper delivery guys etc.';
        const relCanonical = 'https://www.heloprotocol.in' + NANNY_PAGE_URL;
        return (<CategoryHomeScreen location={this.props.location} category={CATEGORY_MAID} categoryPlural="maids"
                                    bannerImg={bannerImg}
                                    minPricePerMonth={1500}
                                    signupForMonthlyFn={this.signupForMonthlyFn}
                                    sections={sections} title={title} relCanonical={relCanonical} />);
    }
}


export class StepNanny extends React.Component {
    static URL = NANNY_PAGE_URL;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    signupForMonthlyFn = () => {
        window.location.href = CUSTOMER_SIGNUP_ENTRY_URL + '?category=' + CATEGORY_NANNY;
    };
    render() {
        const sections = {
            heading: {
                heading: 'Looking for an experienced Nanny ?',
            },
            qualities: {
                heading: 'Nanny for you',
                desc: 'Nannies help take care of our young ones when they are super active and at a very tender age. Its important to have an experienced Nanny to watch over the kids and assist you !',
            },
        };
        const bannerImg = 'https://images-lb.heloprotocol.in/Helo-flyer-nanny-wide.png-190662-535980-1553323484460.png?name=nanny-banner.png';
        const title = 'Nannies | Helo Protocol | Professional network for Blue collared Workforce in India - maids, cooks, nannies, car washers, newspaper delivery guys etc.';
        const relCanonical = 'https://www.heloprotocol.in' + NANNY_PAGE_URL;
        return (<CategoryHomeScreen location={this.props.location} category={CATEGORY_NANNY} categoryPlural="nannies"
                                    bannerImg={bannerImg}
                                    minPricePerMonth={1500}
                                    signupForMonthlyFn={this.signupForMonthlyFn}
                                    sections={sections} title={title} relCanonical={relCanonical} />);
    }
}

export class StepCooks extends React.Component {
    static URL = COOKS_PAGE_URL;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    signupForMonthlyFn = () => {
        window.location.href = CUSTOMER_SIGNUP_ENTRY_URL + '?category=' + CATEGORY_COOK + '&hideCategorySelection=true&hideGenderPref=true';
    };
    render() {
        const sections = {
            heading: {
                heading: 'Missing your mom\'s cooking ?',
            },
            qualities: {
                heading: 'Find your local trusted cook',
                desc: 'Find your mom\'s taste no matter where you go. We all have our preferences be it taste, cuisine, less oil / salt. We\'ll help you find the right chef for your kitchen.',
            },
        };
        const bannerImg = 'https://images-lb.heloprotocol.in/Cooking%2001.jpg-1804722-163097-1553360136945.jpeg?name=cook-banner.png';
        const title = 'Cooks | Helo Protocol | Professional network for Blue collared Workforce in India - maids, cooks, nannies, car washers, newspaper delivery guys etc.';
        const relCanonical = 'https://www.heloprotocol.in' + COOKS_PAGE_URL;
        return (<CategoryHomeScreen location={this.props.location} category={CATEGORY_COOK} categoryPlural="cooks"
                                    bannerImg={bannerImg}
                                    minPricePerMonth={2000}
                                    signupForMonthlyFn={this.signupForMonthlyFn}
                                    sections={sections} title={title} relCanonical={relCanonical} />);
    }
}


class StepLogo extends React.Component {
    static URL = '/logo';
    constructor(props) {
        super(props);
    }

    render() {
        const ctrStyle = {
            margin: 10,
            width: 50, height: 50, backgroundColor: '#000000', borderRadius: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        };
        const textStyle = {
            color: 'white',
            textAlign: 'center',
            fontSize: 30,
            fontWeight: 'bold',
            fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
        };
        return (
            <div>
                <Helmet>
                    <title>Hello</title>
                </Helmet>

                <div style={ctrStyle}>
                    <div style={textStyle}>
                        Helo
                    </div>
                </div>
            </div>
        );
    }
}

export class GiveRecoScreen extends React.Component {
    static URL = WRITE_SUPPLY_RECOMMENDATION;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return <GiveRecommendation location={this.props.location} />;
    }
}

export class VideoWithAnalyticsScreen extends React.Component {
    static URL = HOME_PAGE_URLS.videoAnalytics;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return <VideoWithAnalytics location={this.props.location} />;
    }
}

class SupplyProfileScr extends React.Component {
    static URLS = ['/person/:id', '/person/:id/:name', '/person/:id/:area/:name', '/person/:id/:city/:area/:name'];
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        const staticContext = this.props.staticContext || {data: window.__DATA__, promises: {}, req: {url: document.location.pathname}};
        const supplyId = staticContext.req.url.split('/')[2];

        const disableCallBtn = getUrlParam('disableCallBtn') || 'false';
        const inAppCallBtn = getUrlParam('inAppCallBtn') || 'false';
        const showHeader = getUrlParam('showHeader') || 'true';
        const showFooter = getUrlParam('showFooter') || 'true';
        const hideCharges = getUrlParam('hideCharges') || 'false';
        return <SupplyProfileScreen location={this.props.location} history={this.props.history}
                                    disableCallBtn={disableCallBtn} inAppCallBtn={inAppCallBtn} showHeader={showHeader} showFooter={showFooter}
                                    hideCharges={hideCharges}
                                    supplyId={supplyId} staticContext={staticContext} />;
    }
}

class SearchSupplyScreen extends React.Component {
    static URL = '/search-supply';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    cookFullProfileScreenFn = (cook) => {
        window.open('/person/' + cook.person.id + '/' + encodeURIComponent(cook.person.name) + '?disableCallBtn=true', '_blank');
    };
    render() {
        return (<SearchProfilesWidget location={this.props.location} cookFullProfileScreenFn={this.cookFullProfileScreenFn} />);
    }
}

class BrowseScreen extends React.Component {
    static URL = BROWSE_PAGE_URL;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        const staticContext = this.props.staticContext || {data: window.__DATA__, promises: {}, req: {url: document.location.pathname}};
        return (<BrowseWidget location={this.props.location} staticContext={staticContext} />);
    }
}

class SupplyJobsScreen extends React.Component {
    static URL = SEE_JOBS_PAGE_URL;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return (<SeeJobs location={this.props.location} />);
    }
}

class SingleJobScreen extends React.Component {
    static URL = SEE_JOB_PAGE_URL;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            job: null,
            fetchError: false,
        };
        const staticContext = this.props.staticContext || {data: window.__DATA__, promises: {}, req: {url: document.location.pathname}};
        cnsole.log('document.location: ', staticContext.req.url);
    }

    // Wait for the promises to return and set data
    async componentDidMount() {
        const staticContext = this.props.staticContext || {data: window.__DATA__, promises: {}, req: {url: document.location.pathname}};
        const jobId = getUrlParam('jobId');
        this.vals = fireApiCalls(staticContext, ['k1'], (k) => getJobDetails(jobId));
        await awaitPromises(staticContext, ['k1'], (k, v) => this.setState({ job: v }), () => this.setState({ fetchError: true }));
    }

    render() {
        if (!this.state.job) {
            return (<div>Loading ...</div>);
        }
        const staticContext = this.props.staticContext || {data: window.__DATA__, promises: {}, req: {url: document.location.pathname}};
        return (
            <div style={{ height: WINDOW_INNER_HEIGHT, width: '100%', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                <JobDetailsWidget supplyId={-1} jobDetails={this.state.job}
                                     actionPanel={{labels: [], actions: []}} staticContext={staticContext} />
            </div>
        );
    }
}


const steps = [
    StepHome,
    StepMaids,
    StepNanny,
    StepCooks,
    StepLogo,

    GiveRecoScreen,
    FullPhotoScreen,
    VideoWithAnalyticsScreen,

    SupplyProfileScr,
    SearchSupplyScreen,
    BrowseScreen,
    SupplyJobsScreen,
    SingleJobScreen,
];
export const routes = steps.flatMap(x => {
    const urls = x.URLS ? x.URLS : [x.URL];
    return urls.map(y => <Route exact path={y} component={x} key={y} />);
});
