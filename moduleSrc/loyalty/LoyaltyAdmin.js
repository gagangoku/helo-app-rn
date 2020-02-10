import React, {Fragment} from "react";
import {AsyncStorage, WINDOW_INNER_HEIGHT} from "../platform/Util";
import {PHONE_NUMBER_KEY} from "../constants/Constants";
import {setupDeviceId} from "../util/Util";
import TouchableAnim from "../platform/TouchableAnim";
import {REASON_ALREADY_REDEEMED_AT_TABLE} from "./LoyaltyUtil";


export default class LoyaltyAdmin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            code: null,
            tableId: null,
            H: 1000,
        };
    }

    async componentDidMount() {
        const deviceID = await setupDeviceId();
        const phone = await AsyncStorage.getItem(PHONE_NUMBER_KEY);
        this.setState({ H: WINDOW_INNER_HEIGHT });
    }
    handleChange = (ev, field) => {
        const val = ev.target.value;
        if (field === 'code' && val.length > 8) {
            return;
        }
        if (field === 'tableId' && val.length > 4) {
            return;
        }
        this.setState({ [field]: val });
    };

    render() {
        const { code, tableId, H } = this.state;

        return (
            <Fragment>
                <div style={custom.root}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: 0.30 * H, width: '100%', display: 'flex', flexDirection: 'column',
                                      backgroundColor: BG_COLOR, justifyContent: 'center', alignItems: 'center' }}>
                            <div style={custom.loggedInAs}>Logged in as</div>
                            <div>
                                <img style={{ height: 100, width: 100 }} src={USER_IMG_ICON} />
                            </div>
                            <div style={custom.waiterName}>WAITER NAME</div>
                            <div style={custom.waiterId}>BYGID0001</div>
                        </div>

                        <div style={{ height: 0.30 * H, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={custom.tableHeading}>TABLE #</div>
                            <input style={{...custom.inputStyle, ...custom.tableStyle}} type="string" value={tableId} onChange={(ev) => this.handleChange(ev, 'tableId')} />
                            <div style={custom.offerCodeHeading}>OFFER CODE</div>
                            <input style={{...custom.inputStyle, ...custom.codeStyle}} type="number" value={code} onChange={(ev) => this.handleChange(ev, 'code')} />
                        </div>

                        <div style={{ height: 0.35 * H, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
                            <VerifySection code={code} tableId={tableId} {...this.props} />
                        </div>

                        <div style={{ height: 0.05 * H, width: '100%', backgroundColor: BG_COLOR,
                                      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableAnim onPress={this.props.logoutFn}>
                                <div style={custom.logout}>LOGOUT</div>
                            </TouchableAnim>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }
}

class VerifySection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clicked: false,
        };
    }

    verifyFn = async () => {
        const { code, tableId } = this.props;
        const rsp = await this.props.verifyFn(code, tableId, false);
        this.setState({ clicked: true, rsp });
    };
    forceApplyFn = async () => {
        const { code, tableId } = this.props;
        const rsp = await this.props.verifyFn(code, tableId, true);
        this.setState({ clicked: true, rsp });
    };

    render() {
        const { rsp, clicked } = this.state;
        if (!clicked) {
            return (
                <TouchableAnim onPress={this.verifyFn}
                               style={{ height: 60, width: '60%', maxWidth: 400, borderRadius: 30,
                                   display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                   background: gradientBackground }}>
                    <div style={custom.imInterested}>VERIFY</div>
                </TouchableAnim>
            );
        }

        if (rsp.success) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <img src={TICK_IMG} style={{ height: 100, width: 100 }} />
                    <div style={custom.offerSuccess}>Valid code. Offer applied</div>
                </div>
            );
        }

        const s = { marginLeft: 10, marginBottom: 10 };
        const details = rsp.details || {};
        const ts = <span style={s}><b>When:</b> {new Date(parseInt(details.timestamp || 0)).toString()}</span>;
        const forceApplyBtn = (
            <TouchableAnim onPress={this.forceApplyFn}
                           style={{ height: 60, width: '60%', maxWidth: 500, borderRadius: 30, marginTop: 20,
                               display: 'flex', flexDirection: 'column', justifyContent: 'center',
                               background: gradientBackground }}>
                <div style={custom.imInterested}>FORCE APPLY</div>
            </TouchableAnim>
        );

        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={custom.offerNotApplied}>Offer NOT applied</div>
                <div style={{ height: 150, width: 250, border: '2px solid #FEBD01', borderRadius: 5, background: '#FEBD0120',
                              wordWrap: 'break-word', fontSize: 14,
                              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}}>
                    <span style={s}><b>Reason:</b> {rsp.reason}</span>
                    <span style={s}><b>Code:</b> {details.code}</span>
                    <span style={s}><b>Offer:</b> {details.offerId}</span>
                    {details.timestamp && ts}
                </div>
                {rsp.reason === REASON_ALREADY_REDEEMED_AT_TABLE && forceApplyBtn}
            </div>
        );
    }
}

const BG_COLOR = "#0A2040";
const COLOR_1 = "#C08A32";
const COLOR_2 = "#F2ECA0";
const COLOR_3 = "#C08A32";
const gradientBackground = `linear-gradient(to right, ${COLOR_1}, ${COLOR_2}, ${COLOR_3})`;
const USER_IMG_ICON = 'https://images-lb.heloprotocol.in/20910842.png-118572-760368-1572265561487.png';
const TICK_IMG = 'https://previews.123rf.com/images/alonastep/alonastep1608/alonastep160800258/61775461-tick-sign-element-green-checkmark-icon-isolated-on-white-background-simple-mark-graphic-design-circl.jpg';

const custom = {
    root: {
        fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
    },

    loggedInAs: {
        color: 'white',
    },
    waiterName: {
        color: 'white',
    },
    waiterId: {
        color: 'white',
    },

    imInterested: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#001E42',
        letterSpacing: '0.64px',
        height: '100%',

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },

    offerNotApplied: {
        fontSize: 18,
        textAlign: 'center',
        color: '#FF0000',
        marginBottom: 10,
    },

    tableHeading: {
        marginTop: 20,
        marginBottom: 10,
    },
    inputStyle: {
        paddingLeft: 2,
        letterSpacing: 1,
        fontSize: 18,
        width: '60%',
        maxWidth: 400,
        height: 60,
        outline: 'none',
        border: `1px solid ${COLOR_1}`,
        textAlign: 'center',
    },
    tableStyle: {
        marginBottom: 20,
    },
    offerCodeHeading: {
        marginTop: 10,
        marginBottom: 10,
    },
    codeStyle: {
        marginBottom: 20,
        letterSpacing: 3,
    },

    offerSuccess: {
        color: '#3b8e3b',
        fontSize: 22,
    },
    logout: {
        color: 'white',
    },
};
