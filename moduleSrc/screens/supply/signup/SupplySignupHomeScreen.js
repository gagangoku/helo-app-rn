import React from 'react';
import {withStyles} from '../../../platform/Util';
import Header from "../../../widgets/Header";
import SuperRoot from "../../../widgets/SuperRoot";
import {actionButton, spacer} from "../../../util/Util";
import {COLOR_WHITE_GRAY, TEAL_COLOR_THEME} from "../../../styles/common";
import {PARTNER_CARE_HELPLINE} from "../../../constants/Constants";


class SupplySignupHomeScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    banner() {
        const {classes} = this.props;
        return (
            <div className={classes.bannerRoot}>
                <div className={classes.bannerHeadline}>Are you looking for job ?</div>
                <div className={classes.bannerSubHeadline}>Cleaning / cooking / Car wash / Nanny / Care taker / Security guard</div>
                <div className={classes.bannerDesc}>Join us. We connect with customers nearby.</div>

                <div className={classes.hireScheduleContainer}>
                    {actionButton('SIGNUP', () => this.signup())}
                </div>
            </div>
        );
    }

    benefits() {
        const {classes} = this.props;
        const array = [
            [MONEY_IMG, 'Earn more', 'With us cooks have made more than 35,000 rupees a month. If you are a continental chef, you can easily make more than Rs. 40,000 a month.'],
            [CONVENIENCE_IMG, 'Convenient timings', 'Accept jobs near your home, at your preferred time. We understand that your family, kids are important as well. Make time for family'],
            [INSURANCE_IMG, 'Accidental Insurance', 'Work with us for 3 months and you\'ll get accidental insurance, Bank account opening and easier access to loans'],
        ];
        const f = (x) => {
            return (
                <div className={classes.sectionContainer} key={x[0]}>
                    <div className={classes.sectionImgContainer}>
                        <img src={x[0]} className={classes.sectionImg}/>
                    </div>
                    <div className={classes.sectionHeading}>{x[1]}</div>
                    <div className={classes.sectionDesc}>{x[2]}</div>
                </div>
            );
        };
        return (
            <div className={classes.benefitsRoot}>
                <div className={classes.benefitsHeading}>Benefits</div>
                <div className={classes.benefitsContent}>
                    {array.map(x => f(x))}
                </div>
            </div>
        );
    }

    howItWorks() {
        const {classes} = this.props;
        const array = [
            ['1', 'Signup Online', <span>Fill out <span onClick={() => this.signup()}><u>this</u></span> form or call us at {PARTNER_CARE_HELPLINE}.</span>, SIGNUP_IMG],
            ['2', 'Visit our office', 'We will verify your documents and onboard you. Bring your ID & Residence proofs (Aadhar / PAN card / Voter card).', COME_TO_OFFICE_IMG],
            ['3', 'Browse jobs', 'See all jobs near your home and accept the ones you like.', BROWSE_IMG],
            ['4', 'Work', 'Start working from next day itself', WORK_IMG],
        ];
        const f = (x) => {
            return (
                <div className={classes.sectionContainer} key={x[0]} >
                    <div className={classes.sectionIndex}>{x[0]}</div>
                    <div className={classes.sectionImgContainer}>
                        <img src={x[3]} className={classes.sectionImg} />
                    </div>

                    <div className={classes.sectionHeading}>{x[1]}</div>
                    <div className={classes.sectionDesc}>{x[2]}</div>
                </div>
            );
        };
        return (
            <div className={classes.howItWorksRoot}>
                <div className={classes.benefitsHeading}>How it works</div>
                <div className={classes.howItWorksContent}>
                    {array.map(x => f(x))}
                </div>
            </div>
        );
    }

    successStories() {
        const {classes} = this.props;
        const array = [
            ['SALOMI', 'Salomi is a single mother of 2. She was in dire need of work when she joined us. Now she\'s earning more than 32,000 rupees a month.', SALOMI_THUMB],
            ['DIPANKAR MONDAL', 'Dipankar has been with us for more than 2 years now. He is a big name in his Bengali gang, and he got more than 20 people to work with us.', DIPANKAR_THUMB],
        ];
        const f = (x) => {
            return (
                <div className={classes.sectionContainer} style={{ height: 300 }} key={x[0]} >
                    <div className={classes.sectionImgContainer}>
                        <img src={x[2]} className={classes.bigSectionImg} />
                    </div>

                    <div className={classes.sectionHeading}>{x[0]}</div>
                    <div className={classes.sectionDesc}>{x[1]}</div>
                </div>
            );
        };
        return (
            <div className={classes.successStoriesRoot}>
                <div className={classes.benefitsHeading}>Succeed</div>
                <div className={classes.howItWorksContent}>
                    {array.map(x => f(x))}
                </div>
            </div>
        );
    }

    signup() {
        this.props.onSubmitFn();
    }

    render() {
        const {classes} = this.props;
        return (
            <SuperRoot>
                <Header helplineNumber={PARTNER_CARE_HELPLINE} />

                <div className={classes.root1}>
                    {this.banner()}

                    <div className={classes.root2}>
                        {this.benefits()}
                        {this.howItWorks()}
                        {this.successStories()}

                        <div className={classes.signupCtr}>
                            {actionButton('SIGNUP NOW', () => this.signup())}
                        </div>
                        {spacer(40)}
                    </div>
                </div>
            </SuperRoot>
        );
    }
}

const MONEY_IMG = 'https://images-lb.heloprotocol.in/87.png-50162-934444-1552576427776.png?name=money.png';
const INSURANCE_IMG = 'https://cdn0.iconfinder.com/data/icons/insurance-4/500/family-512.png';
const CONVENIENCE_IMG = 'https://cdn0.iconfinder.com/data/icons/feather/96/clock-512.png';

const SIGNUP_IMG = 'https://png.pngtree.com/svg/20160720/signing_signing_signing_signing_electronically_73117.png';
const COME_TO_OFFICE_IMG = 'https://image.flaticon.com/icons/svg/31/31575.svg';
const BROWSE_IMG = 'https://img.icons8.com/metro/200/search.png';
const WORK_IMG = 'https://images-lb.heloprotocol.in/88.png-16608-196124-1552576428097.png?name=work.png';

const SALOMI_THUMB = 'https://images-lb.heloprotocol.in/89.jpg-96485-276971-1552576428654.jpeg?name=salomi.jpeg';
const DIPANKAR_THUMB = 'https://images-lb.heloprotocol.in/90.jpg-84828-198141-1552576430029.jpeg?name=dipankar.jpeg';

const COLOR_1 = '#fafafaa0';
const styles = theme => ({
    root1: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',

        fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
    root2: {
    },

    // Banner
    bannerRoot: {
        width: '100%',

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerHeadline: {
        marginTop: 40,
        // color: 'white',
        fontSize: 44,
        width: '80%',
        textAlign: 'center',
    },
    bannerSubHeadline: {
        marginTop: 10,
        // color: 'white',
        fontSize: 26,
        width: '80%',
        textAlign: 'center',
    },
    bannerDesc: {
        marginTop: 40,
        // color: 'white',
        fontSize: 20,
        width: '80%',
        textAlign: 'center',
    },
    hireScheduleContainer: {
        marginTop: 30,
        marginBottom: 20,
    },
    bannerWhatIsThis: {
        marginTop: 5,
        color: COLOR_WHITE_GRAY,
        fontSize: 14,
    },
    bannerAppDownloadContainer: {
        marginTop: 40,
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 40,
    },
    bannerGooglePlayContainer: {
        marginRight: 10,
    },
    bannerGooglePlayImg: {
        height: 40,
    },
    bannerAppleStoreContainer: {},
    bannerAppleStoreImg: {
        height: 40,
    },
    bannerComingSoon: {
        textAlign: 'center',
        color: COLOR_WHITE_GRAY,
    },



    // Benefits section
    benefitsRoot: {
        backgroundColor: 'white',
    },
    benefitsHeading: {
        color: TEAL_COLOR_THEME,
        fontSize: 30,
        textAlign: 'center',
        paddingBottom: 20,
        paddingTop: 30,
    },
    benefitsContent: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
    },

    sectionContainer: {
        width: 400,
        height: 250,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 40,
        paddingTop: 20,
        backgroundColor: COLOR_1,
    },
    sectionIndex: {
        height: 40,
        width: 40,
        borderRadius: 20,
        border: '1px solid',
        // borderColor: TEAL_COLOR,
        fontSize: 20,
        // color: TEAL_COLOR,
        marginBottom: 10,

        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeading: {
        marginTop: 10,
        fontSize: 20,
        marginBottom: 5,
    },
    sectionImgContainer: {
        marginBottom: 10,
    },
    sectionImg: {
        height: 100,
    },
    bigSectionImg: {
        height: 200,
    },
    sectionDesc: {
        fontSize: 14,
        maxWidth: 300,
        fontWeight: 200,
    },


    // How it works
    howItWorksRoot: {
        backgroundColor: '#0daa9a0a',
    },
    howItWorksContent: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
    },


    // Success stories
    successStoriesRoot: {
        marginBottom: 40,
    },
    signupCtr: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
});
export default withStyles(styles)(SupplySignupHomeScreen);
