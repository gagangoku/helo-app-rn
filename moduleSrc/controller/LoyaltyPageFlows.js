import React, {Fragment} from "react";
import {getCtx, getDateStr, getUrlParam, initWebPush, navigateTo, setupDeviceId, showToast} from "../util/Util";
import {
    Benefits,
    GuestListScreen,
    GuestListStatusPopup,
    NamePhoneDetailsScreen,
    NotificationScreen,
    OtpVerificationScreen,
    SilverGoldPlatinumMemberPage
} from "../loyalty/LoyaltyPage";
import {getTruecallerDetails, getTruecallerDetailsForRequest} from "../demos/TruecallerDemo";
import {
    crudsCreate,
    crudsRead,
    crudsSearch,
    getGoldCode,
    getOtp,
    sendSms,
    verifyAndRedeemGoldCode,
    verifyOtp
} from "../util/Api";
import {
    DESCRIPTOR_GOLD_GUEST_LIST,
    DESCRIPTOR_GOLD_USER,
    DESCRIPTOR_USER_CHECKIN,
    GOLD_USER_CHECKIN_VALIDITY_MS,
    MILLIS_IN_DAY,
    PHONE_NUMBER_KEY
} from "../constants/Constants";
import {AsyncStorage, confirmAlert, Route} from "../platform/Util";
import {calculatePoints, getGoldUserDetailsFromPhone, getUserCheckins} from "../loyalty/LoyaltyUtil";
import LoyaltyAdmin from "../loyalty/LoyaltyAdmin";
import window from "global";
import GA from "../util/GoogleAnalytics";
import {
    allEstablishmentIds,
    getLoyaltyConfigs,
    GUEST_LIST_STATUS_CLOSED,
    GUEST_LIST_STATUS_CONFIRMED,
    GUEST_LIST_STATUS_FAILURE,
    GUEST_LIST_STATUS_FULL,
    GUEST_LIST_STATUS_WAITLIST
} from "../loyalty/Constants";
import format from 'string-format';
import lodash from 'lodash';
import xrange from 'xrange';


class LoyaltyHomeStep extends React.Component {
    static URL = '/loyalty/home';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {};
    }

    async componentDidMount() {
        const establishmentId = getUrlParam('establishment') || this.contextObj.establishmentId;
        if (!establishmentId) {
            return;
        }
        const branchId = getUrlParam('branch') || this.contextObj.branchId || '1';
        this.contextObj.establishmentId = establishmentId;
        this.contextObj.branchId = branchId;
        console.log('this.contextObj.establishmentId: ', this.contextObj.establishmentId);
        console.log('this.contextObj.branchId: ', this.contextObj.branchId);

        const configs = await getLoyaltyConfigs(establishmentId);

        const { phone, id, name, userCheckins, points } = await getGoldUserDetailsFromPhone(establishmentId, branchId);
        this.setState({ userDetails: { phone, id, name, userCheckins, points }, configs });

        if (phone && name && id) {
            await this.checkinFn(phone, id, name, points, configs);
            await initializeWebPush(establishmentId, configs);
            return;
        }
        if (phone && name) {
            const { phone, id, name, userCheckins, points } = await createGoldUserIfDoesntExist(name, phone, establishmentId);
            await this.checkinFn(phone, id, name, points, configs);
            await initializeWebPush(establishmentId, configs);
            this.setState({ userDetails: { phone, id, name, userCheckins, points } });
        }
    }

    checkinFn = async (phone, userId, name, points, configs) => {
        const { establishmentId, branchId } = this.contextObj;
        try {
            const timestampGT = new Date().getTime() - GOLD_USER_CHECKIN_VALIDITY_MS;
            const checkins = await crudsSearch(DESCRIPTOR_USER_CHECKIN, { userId, establishmentId, branchId, timestampGT });
            console.log('DEBUG checkins: ', checkins);
            if (!checkins || checkins.length === 0) {
                const rsp = await crudsCreate(DESCRIPTOR_USER_CHECKIN, { userId, establishmentId, branchId, timestamp: new Date().getTime() });
                if (!rsp.startsWith('created ')) {
                    window.alert('Failed to checkin, please try again or contact staff');
                    return;
                }

                // TODO: Send notification first before sending SMS regarding checkin
                const link = format('https://heloprotocol.app.link/5yd132u5K1?establishment={}', establishmentId);
                const message = format('Dear {}, you just checked in into {} with {} points. Visit {} to see your points', name, configs.themeConfig.brandConfig.name, points, link);
                const smsResponse = await sendSms(phone, message);
                console.log('smsResponse: ', smsResponse);
                if (smsResponse !== 'ok') {
                    window.alert('Failed to send sms, please contact our staff');
                }
            }
        } catch (e) {
            console.log('Exception in checkinFn: ', e);
        }
    };

    imInterestedFn = async () => {
        const deviceID = await setupDeviceId();
        const establishmentId = this.contextObj.establishmentId;
        console.log('Signing up for gold: ', deviceID);

        const configs = await getLoyaltyConfigs(establishmentId);
        const { success, name, phone, requestId } = await getTruecallerDetails();
        if (!success) {
            // Goto Signup page
            navigateTo(this, SignupNamePhoneStep.URL, this.contextObj, { requestId });
            return;
        }

        // Got user details from Truecaller. Update or create new Gold user
        await AsyncStorage.setItem(PHONE_NUMBER_KEY, phone);
        const { id, userCheckins, points } = await createGoldUserIfDoesntExist(name, phone, establishmentId);
        await this.checkinFn(phone, id, name, points, configs);
        this.setState({ userDetails: {phone, id, name, userCheckins, points} });
    };

    availOfferFn = (userDetails, offerId) => availOfferFn(userDetails, this.contextObj.establishmentId, this.contextObj.branchId, offerId);
    guestListFn = (userDetails) => {
        navigateTo(this, GuestListStep.URL, this.contextObj, {});
    };

    render() {
        const establishmentId = getUrlParam('establishment') || this.contextObj.establishmentId;
        if (!establishmentId) {
            return <div>HOME - Work in progress</div>;
        }

        const { userDetails } = this.state;
        const { phone, id, name, points } = userDetails || {};

        if (!userDetails || !this.state.configs) {
            return <div />;
        }

        if (phone && id && name) {
            return <SilverGoldPlatinumMemberPage userDetails={userDetails} points={points}
                                                 availOfferFn={this.availOfferFn} guestListFn={this.guestListFn}
                                                 loyaltyConfigs={this.state.configs} />;
        }

        return <Benefits imInterestedFn={this.imInterestedFn} loyaltyConfigs={this.state.configs} />;
    }
}

class SignupNamePhoneStep extends React.Component {
    static URL = '/loyalty/user-signup/name-phone';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {};
    }
    async componentDidMount() {
        const { establishmentId, requestId } = this.contextObj;
        const configs = await getLoyaltyConfigs(establishmentId);
        this.setState({ configs });

        if (requestId) {
            const { success, name, phone } = await getTruecallerDetailsForRequest(requestId);
            if (success && name && phone) {
                await AsyncStorage.setItem(PHONE_NUMBER_KEY, phone);
                const { id, userCheckins, points } = await createGoldUserIfDoesntExist(name, phone, establishmentId);
                // TODO: Reset navigation
                navigateTo(this, LoyaltyHomeStep.URL, this.contextObj, {});
            }
        }
    }
    submitFn = async (name, phone) => {
        console.log('Got name, phone: ', name, phone);

        try {
            await new Promise((resolve, reject) => getOtp(phone, 'walkin-customer', resolve, reject));
            navigateTo(this, SignupOtpStep.URL, this.contextObj, { name, phone });
        } catch (e) {
            console.log('Error in getting otp: ', e);
        }
    };
    render() {
        if (!this.state.configs) {
            return <div />;
        }
        return <NamePhoneDetailsScreen submitFn={this.submitFn} loyaltyConfigs={this.state.configs} />;
    }
}

class SignupOtpStep extends React.Component {
    static URL = '/loyalty/user-signup/otp';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {};
    }
    async componentDidMount() {
        const configs = await getLoyaltyConfigs(this.contextObj.establishmentId);
        this.setState({ configs });
    }
    submitFn = async (otp) => {
        const { name, phone } = this.contextObj;
        console.log('Got OTP: ', otp, phone, name);

        try {
            await new Promise((resolve, reject) => verifyOtp(phone, otp, resolve, reject));
            await AsyncStorage.setItem(PHONE_NUMBER_KEY, phone);
            await createGoldUserIfDoesntExist(name, phone, this.contextObj.establishmentId);
            // TODO: Reset navigation
            navigateTo(this, LoyaltyHomeStep.URL, this.contextObj, { name, phone });
        } catch (e) {
            console.log('Error in verifying otp: ', e);
            showToast('Incorrect OTP');
        }
    };
    requestOtpAgain = async () => {
        const { name, phone } = this.contextObj;
        await new Promise((resolve, reject) => getOtp(phone, 'walkin-customer', resolve, reject));
    };
    render() {
        if (!this.state.configs) {
            return <div />;
        }
        const { name, phone } = this.contextObj;
        return <OtpVerificationScreen name={name} phone={phone} submitFn={this.submitFn}
                                      requestAgainFn={this.requestOtpAgain} loyaltyConfigs={this.state.configs} />;
    }
}

class GuestListStep extends React.Component {
    static URL = '/loyalty/guest-list';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            guestListCached: {},
        };
    }
    async componentDidMount() {
        const establishmentId = getUrlParam('establishment') || this.contextObj.establishmentId;
        if (!establishmentId) {
            return;
        }
        const branchId = getUrlParam('branch') || this.contextObj.branchId || '1';
        const configs = await getLoyaltyConfigs(establishmentId);

        const { phone, id, name, userCheckins, points } = await getGoldUserDetailsFromPhone(establishmentId, branchId);
        this.setState({ userDetails: { phone, id, name, userCheckins, points }, configs });

        // Pre-populate the days user is on the guest list / wait list
        const dayToday = new Date().getDay();
        const { guestListConfig } = this.state.configs.themeConfig;
        const numConfirmed = guestListConfig.free.num;
        const numWaitList = guestListConfig.waitlist.num;

        const dayViseGuestList = await getGuestListForDays({ establishmentId, branchId, numDays: 7 });
        const guestListCached = {};
        dayViseGuestList.forEach(({ day, tentative }) => {
            const idx = tentative.findIndex(x => x.userId === id);

            if (idx === -1) {
            } else if (idx < numConfirmed) {
                guestListCached[day] = GUEST_LIST_STATUS_CONFIRMED;
            } else if (idx < numConfirmed + numWaitList) {
                guestListCached[day] = GUEST_LIST_STATUS_WAITLIST;
            } else {
                guestListCached[day] = GUEST_LIST_STATUS_FULL;
            }

        });

        this.setState({ guestListCached });
    }
    componentWillUnmount() {
    }

    checkGuestListFn = (day) => {
        return !!this.state.guestListCached[day];
    };
    tryGetOnGuestListFn = async (day) => {
        const establishmentId = getUrlParam('establishment') || this.contextObj.establishmentId;
        if (!establishmentId) {
            return GUEST_LIST_STATUS_FAILURE;
        }
        const branchId = getUrlParam('branch') || this.contextObj.branchId || '1';
        const userId = this.state.userDetails.id;

        const dayToday = new Date().getDay();
        const x = (day + 7 - dayToday) % 7;
        const y = new Date(new Date().getTime() + x*MILLIS_IN_DAY);
        const date = getDateStr(y);
        const { guestListConfig } = this.state.configs.themeConfig;

        if (day === dayToday) {
            // TODO: Maybe allow for next week ?
            const hr = new Date().getHours();
            const mins = new Date().getMinutes();
            if (guestListConfig.registerBeforeHr <= (hr * 60 + mins)) {
                // Guest list closed for today
                return GUEST_LIST_STATUS_CLOSED;
            }
        }

        const numConfirmed = guestListConfig.free.num;
        const numWaitList = guestListConfig.waitlist.num;
        const glList = await crudsSearch(DESCRIPTOR_GOLD_GUEST_LIST, { date, establishmentId, branchId }) || [];
        console.log('DEBUG: crudsSearch resp: ', DESCRIPTOR_GOLD_GUEST_LIST, glList);
        const tentative = glList.filter(x => !x.noOp);
        const idx = tentative.findIndex(x => x.userId === userId);
        if (idx >= 0 && idx < numConfirmed) {
            return GUEST_LIST_STATUS_CONFIRMED;
        } else if (idx >= 0 && idx < numConfirmed + numWaitList) {
            return GUEST_LIST_STATUS_WAITLIST;
        } else if (idx >= numConfirmed + numWaitList) {
            return GUEST_LIST_STATUS_FULL;
        } else if (tentative.length < numConfirmed + numWaitList) {
            const createRsp = await crudsCreate(DESCRIPTOR_GOLD_GUEST_LIST, { userId, date, establishmentId, branchId });
            console.log('DEBUG: crudsCreate resp: ', createRsp);
            if (!createRsp.startsWith("created ")) {
                return GUEST_LIST_STATUS_FAILURE;
            }

            return tentative.length < numConfirmed ? GUEST_LIST_STATUS_CONFIRMED : GUEST_LIST_STATUS_WAITLIST;
        } else {
            // Not even worth trying
            return GUEST_LIST_STATUS_FULL;
        }
    };

    getOnGuestListFn = async (day) => {
        if (this.state.guestListCached[day]) {
            return this.state.guestListCached[day];
        }

        const rsp = await this.tryGetOnGuestListFn(day);
        switch (rsp) {
            case GUEST_LIST_STATUS_FAILURE:
                await this.alert(rsp, 'Something went wrong, please try after some time');
                break;
            case GUEST_LIST_STATUS_CONFIRMED:
                await this.alert(rsp, 'Congrats: Guest list confirmed');
                break;
            case GUEST_LIST_STATUS_WAITLIST:
                await this.alert(rsp, 'Congrats: You are on the waitlist');
                break;
            case GUEST_LIST_STATUS_FULL:
                await this.alert(rsp, 'Sorry, guest list is full');
                break;
            case GUEST_LIST_STATUS_CLOSED:
                await this.alert(rsp, 'Sorry, guest list is closed for today');
                break;
            default:
                await this.alert(rsp, 'Something went wrong, please try after some time');
                break;
        }
        const guestListCached = {...this.state.guestListCached, [day]: rsp};
        this.setState({ guestListCached });
    };

    alert = async (rsp, text) => {
        await new Promise(resolve => {
            confirmAlert({
                closeOnEscape: false,
                closeOnClickOutside: false,
                customUI: ({ onClose }) => {
                    const okFn = async () => {
                        onClose();
                        resolve();
                    };

                    return <GuestListStatusPopup okFn={okFn} status={rsp} text={text} configs={this.state.configs} />
                }
            });
        });
    };

    imInterestedFn = async (day) => {
        await this.getOnGuestListFn(day);
    };
    imInterestedTextFn = (day) => {
        const st = this.state.guestListCached[day];
        switch (st) {
            case GUEST_LIST_STATUS_CONFIRMED:
                return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ fontSize: 24, marginRight: 5 }}>✓</div>
                    <div>you're on the guest list</div>
                </div>;
            case GUEST_LIST_STATUS_WAITLIST:
                return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ fontSize: 24, marginRight: 5 }}>✓</div>
                    <div>you're on the wait list</div>
                </div>;
            case GUEST_LIST_STATUS_FULL:
                return 'guest list is full';
            case GUEST_LIST_STATUS_CLOSED:
                return 'guest list is closed';

            case GUEST_LIST_STATUS_FAILURE:
            default:
                return 'get on the guest list';
        }
    };

    render() {
        const establishmentId = getUrlParam('establishment') || this.contextObj.establishmentId;
        if (!establishmentId) {
            return <div>Which establishment ?</div>;
        }
        if (!this.state.configs) {
            return <div />;
        }

        return (
            <GuestListScreen loyaltyConfigs={this.state.configs}
                             imInterestedFn={this.imInterestedFn} imInterestedTextFn={this.imInterestedTextFn} />
        );
    }
}

class LoyaltyDebugStep extends React.Component {
    static URL = '/loyalty/debug';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {};
    }
    async componentDidMount() {
        const configs = [];
        const ids = await allEstablishmentIds();
        for (let i = 0; i < ids.length; i++) {
            const c = await getLoyaltyConfigs(ids[i]);
            configs.push(c);
        }
        this.setState({ configs });
    }
    componentWillUnmount() {
    }

    availOfferFn = (userDetails, offerId) => availOfferFn(userDetails, this.establishmentId, 1, offerId);
    render() {
        if (!this.state.configs) {
            return <div />;
        }

        const userDetails = {
            name: 'Pravesh',
            id: 1,
        };

        const items = [];
        this.state.configs.forEach(c => {
            const benefits = <Benefits imInterestedFn={() => {}} loyaltyConfigs={c} />;
            const silver   = <SilverGoldPlatinumMemberPage userDetails={userDetails} points={50} availOfferFn={this.availOfferFn}
                                                           loyaltyConfigs={c} />;
            const gold     = <SilverGoldPlatinumMemberPage userDetails={userDetails} points={1200} availOfferFn={this.availOfferFn}
                                                           loyaltyConfigs={c} />;
            const platinum = <SilverGoldPlatinumMemberPage userDetails={userDetails} points={12500} availOfferFn={this.availOfferFn}
                                                           loyaltyConfigs={c} />;

            items.push(
                <Fragment>
                    {benefits}
                    {silver}
                    {gold}
                    {platinum}
                </Fragment>
            );
        });

        return (
            <div style={{ height: '100%' }}>
                {items}
            </div>
        );
    }
}

class LoyaltyAdminStep extends React.Component {
    static URL = '/loyalty/admin';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    verifyFn = async (code, tableId, force) => {
        const rsp = await verifyAndRedeemGoldCode({ code, tableId, establishmentId: 1, branchId: 1, force });
        console.log('DEBUG verifyAndRedeemGoldCode: ', rsp);
        return rsp;
    };
    logoutFn = () => {};

    render() {
        return <LoyaltyAdmin verifyFn={this.verifyFn} logoutFn={this.logoutFn} />
    }
}

// TODO: Move view code outside of the controller flow
class GuestListViewStep extends React.Component {
    static URL = '/loyalty/guest-list/view';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            dayViseGuestList: null,
            configs: null,
            userIdToDetails: null,
        };
    }

    async componentDidMount() {
        const establishmentId = getUrlParam('establishment') || this.contextObj.establishmentId;
        if (!establishmentId) {
            return;
        }
        const branchId = getUrlParam('branch') || this.contextObj.branchId || '1';
        const configs = await getLoyaltyConfigs(establishmentId);

        const dayViseGuestList = await getGuestListForDays({ establishmentId, branchId, numDays: 7 });
        console.log('dayViseGuestList: ', dayViseGuestList);
        const userIds = lodash.uniq(dayViseGuestList.flatMap(x => x.tentative).map(x => x.userId));
        console.log('userIds: ', userIds);
        const promises = [];
        userIds.forEach(u => {
            promises.push(crudsRead(DESCRIPTOR_GOLD_USER, u));
        });
        const userDetails = await Promise.all(promises);
        console.log('userDetails: ', userDetails);

        const userIdToDetails = {};
        for (let i = 0; i < userIds.length; i++) {
            userIdToDetails[userIds[i]] = userDetails[i];
        }
        console.log('userIdToDetails: ', userIdToDetails);

        this.setState({ configs, dayViseGuestList, userIdToDetails });
    }

    renderDay = (date) => {
        const { dayViseGuestList, configs, userIdToDetails } = this.state;

        const a = dayViseGuestList.filter(x => x.date === date)[0];
        const users = a.tentative.map(x => userIdToDetails[x.userId]);
        console.log('users: ', date, users);

        const thStyle = { border: '1px solid' };
        const tdStyle = { border: '1px solid' };
        const rows = xrange(0, users.length).map(i => {
            const u = users[i];
            return (
                <tr style={{ }} key={'tr-' + date + u.phone}>
                    <td style={tdStyle}>{i}</td>
                    <td style={tdStyle}>{u.name}</td>
                    <td style={tdStyle}>{u.phone}</td>
                    <td style={tdStyle}>-</td>
                </tr>
            );
        });
        return (
            <table style={{ width: '80%', maxWidth: 500 }} key={'table-' + date}>
                <thead style={{}}>
                    <tr style={{}}>
                        <th style={thStyle}>Sno.</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Phone</th>
                        <th style={thStyle}>Status</th>
                    </tr>
                </thead>
                <tbody style={{}}>
                    {rows}
                </tbody>
            </table>
        );
    };

    render() {
        const establishmentId = getUrlParam('establishment') || this.contextObj.establishmentId;
        if (!establishmentId) {
            return <div>Which establishment ?</div>;
        }

        const { dayViseGuestList } = this.state;
        if (!dayViseGuestList) {
            return <div />;
        }

        const items = [];
        dayViseGuestList.forEach(x => {
            const { date } = x;
            items.push(<h2 style={{ marginTop: 20, marginBottom: 20 }} key={'h2-' + date}>{date}</h2>);
            items.push(this.renderDay(date));
        });

        return (
            <div>
                <h1>Guest List</h1>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {items}
                </div>
            </div>
        );
    }
}

const getGuestListForDays = async ({ numDays, establishmentId, branchId }) => {
    const dayToday = new Date().getDay();
    const list = [];
    for (let day = 0; day < numDays; day++) {
        const y = new Date(new Date().getTime() + day*MILLIS_IN_DAY);
        const date = getDateStr(y);

        const glList = await crudsSearch(DESCRIPTOR_GOLD_GUEST_LIST, {date, establishmentId, branchId}) || [];
        console.log('DEBUG: crudsSearch resp: ', DESCRIPTOR_GOLD_GUEST_LIST, glList);
        const tentative = glList.filter(x => !x.noOp);
        list.push({ date, tentative, day: (dayToday + day) % 7 });
    }

    return list;
};

const initializeWebPush = async (establishmentId, configs) => {
    const perm = window.Notification && window.Notification.permission;
    console.log('Notification.permission: ', perm);
    const deviceID = await setupDeviceId();

    await new Promise(resolve => setTimeout(resolve, 1500));
    await new Promise(async resolve => {
        switch (perm) {
            case 'default':
                confirmAlert({
                    closeOnEscape: false,
                    closeOnClickOutside: false,
                    customUI: ({ onClose }) => {
                        const fn = async () => {
                            onClose();
                            resolve();
                        };
                        const yesFn = async () => {
                            GA.event({ category: 'restaurant-notification-' + establishmentId, action: 'allow', label: deviceID });
                            await initWebPush(true);       // Initiate web push notification request
                            await fn();
                        };
                        const noFn = async () => {
                            GA.event({ category: 'restaurant-notification-' + establishmentId, action: 'block', label: deviceID });
                            await fn();
                        };

                        return <NotificationScreen yesFn={yesFn} noFn={noFn} configs={configs} />
                    }
                });
                break;

            case 'denied':
                // TODO: Open chrome://settings/content/notifications and allow them to change
                await initWebPush(false);
                resolve();
                break;

            case 'granted':
            default:
                // TODO: Handle expiration properly. This is a hack for now - forcefully re-saving the subscription
                await initWebPush(true);
                resolve();
                break;
        }
    });
};
const createGoldUserIfDoesntExist = async (name, phone, establishmentId) => {
    const searchResponse = await crudsSearch(DESCRIPTOR_GOLD_USER, { phone });
    console.log('Gold user searchResponse: ', searchResponse);
    if (searchResponse && searchResponse.length > 0) {
        let { id, phone, name } = searchResponse[0];

        const userCheckins = await getUserCheckins(id, establishmentId);
        return { phone, id, name, userCheckins, points: calculatePoints(userCheckins) };
    }

    console.log('Creating new gold user: ', phone, name);
    const deviceID = await setupDeviceId();
    const createResponse = await crudsCreate(DESCRIPTOR_GOLD_USER, { phone, name, deviceID: [deviceID] });
    const id = parseInt(createResponse.split(' ')[1]);
    console.log('Created new gold user id: ', id);
    return { phone, id, name, userCheckins: [], points: 0 };
};

const availOfferFn = async (userDetails, establishmentId, branchId, offerId) => {
    console.log('Trying to avail offer: ', offerId);
    const { phone, id, name } = userDetails;

    try {
        return await getGoldCode({ userDetails: {phone, id, name}, establishmentId, branchId, offerId});
    } catch (e) {
        console.log('Exception in getting gold code: ', e);
        return {success: false};
    }
};



const steps = [
    LoyaltyHomeStep,
    SignupNamePhoneStep,
    SignupOtpStep,
    GuestListStep,
    LoyaltyDebugStep,
    LoyaltyAdminStep,
    GuestListViewStep,
];
export const routes = steps.flatMap(x => {
    const urls = x.URLS ? x.URLS : [x.URL];
    return urls.map(y => <Route exact path={y} component={x} key={y} />);
});
