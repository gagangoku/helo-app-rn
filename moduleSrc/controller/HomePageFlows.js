import React from 'react';
import {Route} from "react-router-dom";
import {
    awaitPromises,
    fireApiCalls,
    getAllInfoRelatedToGroup,
    getCtx,
    getDetailsFromPhone,
    getImageUrl,
    getPersonDetails,
    getUrlParam,
    isDebugMode,
    navigateTo,
    setupDeviceId,
    View
} from "../util/Util";
import {Helmet} from "react-helmet";
import GiveRecommendation from "../screens/GiveRecommendation";
import HomePageScreen from "../screens/HomePageScreen";
import SupplyProfileScreen from "../screens/supply/SupplyProfileScreen";
import FullPhotoScreen from "../screens/FullPhotoScreen";
import document from "global/document";
import window from "global/window";
import SearchProfilesWidget from "../screens/supply/SearchProfilesWidget";
import BrowseWidget from "../widgets/BrowseWidget";
import CategoryHomeScreen from "../screens/landing-page/CategoryHomeScreen";
import {
    CATEGORY_COOK,
    CATEGORY_MAID,
    CATEGORY_NANNY,
    DESCRIPTOR_CUSTOMER,
    DESCRIPTOR_SUPPLY,
    DESCRIPTOR_VISITOR,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME
} from "../constants/Constants";
import {CUSTOMER_SIGNUP_ENTRY_URL} from "./CustomerSignupFlow";
import SeeJobs from "../screens/supply/SeeJobs";
import JobDetailsWidget from "../widgets/JobDetailsWidget";
import {crudsRead, getJobDetails, getLocationFromIPAddress, getPersonNamesByRoleId} from "../util/Api";
import format from 'string-format';
import GroupListController from "../chat/groups/GroupListController";
import GroupMessages from "../chat/groups/GroupMessages";
import {GroupJoinPage} from "../chat/groups/GroupJoinPage";
import GroupDetailsPage from "../chat/groups/GroupDetailsPage";
import VideoWithAnalytics from "../screens/VideoWithAnalytics";
import {GroupCreatePage} from "../chat/groups/GroupCreatePage";
import {StepViewMyProfile} from "./SupplyPageFlows";


export const HOME_PAGE_URL = '/';
export const MAIDS_PAGE_URL = '/maids';
export const NANNY_PAGE_URL = '/nanny';
export const COOKS_PAGE_URL = '/cooks';
export const WRITE_SUPPLY_RECOMMENDATION = '/supply/write-recommendation';
export const BROWSE_PAGE_URL = '/see-all-maids';
export const SEE_JOBS_PAGE_URL = '/supply/see-jobs';
export const SEE_JOB_PAGE_URL = '/jobs/see-job';
class StepHome extends React.Component {
    static URL = HOME_PAGE_URL;
    static URL1 = '//';
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
    static URL = VideoWithAnalytics.URL;
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }
    render() {
        return <VideoWithAnalytics location={this.props.location} />;
    }
}

class SupplyProfileScr extends React.Component {
    static URL1 = '/person/:id';
    static URL2 = '/person/:id/:name';
    static URL3 = '/person/:id/:area/:name';
    static URL4 = '/person/:id/:city/:area/:name';
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
        console.log('document.location: ', staticContext.req.url);
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
            <div style={{ height: window.innerHeight, width: '100%', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                <JobDetailsWidget supplyId={-1} jobDetails={this.state.job}
                                     actionPanel={{labels: [], actions: []}} staticContext={staticContext} />
            </div>
        );
    }
}

export class StepGroupList extends React.Component {
    static URL = '/group-list';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            id: null,
            name: null,
            role: null,
            errorMsg: '',
        };
        this.idToDetails = {};
    }

    async componentDidMount() {
        const deviceID = await setupDeviceId();
        const ipLocation = await getLocationFromIPAddress(deviceID);
        this.setState({ ipLocation });

        try {
            const me = getUrlParam('me') || '';
            console.log('StepGroupList me: ', me);
            if (me) {
                const [role, id] = me.split(':');
                switch (role) {
                    case 'supply':
                        const supply = await crudsRead(DESCRIPTOR_SUPPLY, id);
                        this.setState({ id, name: supply.person.name, role });
                        return;
                    case 'cust':
                        const cust = await crudsRead(DESCRIPTOR_CUSTOMER, id);
                        this.setState({ id, name: cust.person.name, role });
                        return;
                    case 'visitor':
                        const visitor = await crudsRead(DESCRIPTOR_VISITOR, id);
                        this.setState({ id, name: visitor.name, role });
                        return;
                    default:
                        console.log('Unknown role: ', me, role);
                }
            }
        } catch (e) {
            console.log('Error in parsing me param: ', e);
        }

        const { phone, id, name, role } = await getDetailsFromPhone();
        if (!phone || (!id && !name && !role)) {
            this.setState({ errorMsg: 'Login is required' });
        } else {
            this.setState({ id, name, role });
        }
    }

    goToChatFn = async ({ collection, groupId, avatar }) => {
        console.log('goToChatFn: ', groupId);
        const { id, name, role, ipLocation } = this.state;

        if (collection === FIREBASE_GROUPS_DB_NAME) {
            const groupUrl = format('{}?collection={}&group={}', StepGroupJoin.URL, collection, groupId);
            navigateTo(this, groupUrl, this.contextObj, {});
            return;
        }

        // 1 on 1 chat
        const me = {
            id, name, role,
            sender: role + ':' + id,
        };

        const otherRoleId = groupId.split(',').filter(x => x !== me.sender)[0];
        console.log('me, otherRoleId; ', me, otherRoleId);
        await getPersonDetails(this.idToDetails, [otherRoleId], []);
        const other = {
            id: otherRoleId.split(':')[1],
            name: this.idToDetails[otherRoleId].person.name,
            role: otherRoleId.split(':')[0],
            sender: otherRoleId,
            avatar,
        };

        const messagingUrl = format('{}?collection={}&me={}&other={}&ipLocation={}',
            StepPersonalMessaging.URL, collection,
            encodeURIComponent(JSON.stringify(me)),
            encodeURIComponent(JSON.stringify(other)),
            encodeURIComponent(JSON.stringify(ipLocation)));
        navigateTo(this, messagingUrl, this.contextObj, {});
    };

    render() {
        if (!this.state.role) {
            return <div>{this.state.errorMsg}</div>;
        }

        const me = {
            role: this.state.role,
            id: this.state.id,
            sender: this.state.role + ':' + this.state.id,
            avatar: '',
            name: this.state.name,
        };
        return (<GroupListController location={this.props.location} history={this.props.history}
                                     me={me} goToChatFn={this.goToChatFn} />);
    }
}

export class StepPersonalMessaging extends React.Component {
    static URL = '/personal-message';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {};
        console.log('StepPersonalMessaging props: ', props);
    }

    async componentDidMount() {
        console.log('StepPersonalMessaging componentDidMount: ');
        const collection = FIREBASE_CHAT_MESSAGES_DB_NAME;
        const meParam = getUrlParam('me');
        const otherParam = getUrlParam('other');
        const ipLocationParam = getUrlParam('ipLocation');

        let me, other, ipLocation;
        if (!meParam) {
            const { id, name, role, image } = await getDetailsFromPhone();
            me = {
                role,
                id,
                sender: role + ':' + id,
                name,
                avatar: image,
            };
        } else {
            me = JSON.parse(meParam);
        }
        if (!otherParam) {
            const otherPersonParam = getUrlParam('otherPerson');
            const [role, id] = otherPersonParam.split(':');
            const map = await getPersonNamesByRoleId([otherPersonParam]);
            const { name, image } = map[otherPersonParam].person;
            other = { role, id, name, sender: otherPersonParam, avatar: image };
        } else {
            other = JSON.parse(otherParam);
        }

        if (me.sender === other.sender) {
            // Trying to chat with yourself eh
            window.location.href = StepViewMyProfile.URL;
            return;
        }
        if (!ipLocationParam) {
            ipLocation = await getLocationFromIPAddress();
        } else {
            ipLocation = JSON.parse(ipLocationParam);
        }

        const groupId = [me.sender, other.sender].sort().join(',');
        this.detailsObj = { collection, me, other, ipLocation, groupId };
        console.log('detailsObj: ', this.detailsObj);

        const isDebug = isDebugMode();
        const cbFn = ({ groupInfo }) => {
            this.setState({ groupInfo });
        };

        const obj = await getAllInfoRelatedToGroup({ collection, groupId, cbFn, isDebug, ipLocationPromise: Promise.resolve(ipLocation), createDocIfDoesntExist: true });
        console.log('Got getAllInfoRelatedToGroup: ', obj);
        this.setState(obj);

        const idToDetails = {};
        await getPersonDetails(idToDetails, obj.groupInfo.members, []);
        this.setState({ idToDetails });
    }
    componentWillUnmount() {
        this.state.observer && this.state.observer();           // Unsubscribe
    }

    goBackFn = () => window.open(StepGroupList.URL);

    render() {
        const { groupInfo, docRef, idToDetails } = this.state;
        if (!docRef) {
            return <View />;
        }

        const { collection, me, other, ipLocation, groupId } = this.detailsObj;
        const groupInfoCopy = {...groupInfo, photo: getImageUrl(other.avatar), name: other.name};
        return (<GroupMessages location={this.props.location} history={this.props.history}
                               goBackFn={this.goBackFn}
                               me={me} otherPerson={other} collection={collection} groupId={groupId} ipLocation={ipLocation}
                               groupInfo={groupInfoCopy} docRef={docRef} idToDetails={idToDetails} />);
    }
}

export class StepCreateGroup extends React.Component {
    static URL = '/group/create';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        return (<GroupCreatePage location={this.props.location} history={this.props.history} />);
    }
}

export class StepGroupJoin extends React.Component {
    static URL = '/group/join';
    static URL2 = '/group';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        const collection = getUrlParam('collection');
        const groupId = getUrlParam('group');
        return (<GroupJoinPage location={this.props.location} history={this.props.history}
                               collection={collection} groupId={groupId} />);
    }
}

export class StepGroupDetailsPage extends React.Component {
    static URL = '/group/details';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        const groupId = getUrlParam('group');
        return (<GroupDetailsPage location={this.props.location} history={this.props.history}
                                  collection={FIREBASE_GROUPS_DB_NAME} groupId={groupId} />);
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

    SearchSupplyScreen,
    BrowseScreen,
    SupplyJobsScreen,
    SingleJobScreen,

    StepGroupList,
    StepCreateGroup,
    StepGroupJoin,
    StepGroupDetailsPage,
    StepPersonalMessaging,
];
const routes = (steps.map(x => <Route exact path={x.URL} component={x} key={x.URL} />));
routes.push(<Route exact path={StepHome.URL1} component={StepHome} key={StepHome.URL1} />);
routes.push(<Route exact path={SupplyProfileScr.URL1} component={SupplyProfileScr} key={SupplyProfileScr.URL1} />);
routes.push(<Route exact path={SupplyProfileScr.URL2} component={SupplyProfileScr} key={SupplyProfileScr.URL2} />);
routes.push(<Route exact path={SupplyProfileScr.URL3} component={SupplyProfileScr} key={SupplyProfileScr.URL3} />);
routes.push(<Route exact path={SupplyProfileScr.URL4} component={SupplyProfileScr} key={SupplyProfileScr.URL4} />);
routes.push(<Route exact path={StepGroupJoin.URL2} component={StepGroupJoin} key={StepGroupJoin.URL2} />);

export {
    routes
};
