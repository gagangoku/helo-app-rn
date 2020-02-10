import React from 'react'
import {Helmet, withStyles} from '../../platform/Util';
import SuperRoot from "../../widgets/SuperRoot";
import {COLOR_WHITE_GRAY, TEAL_COLOR_THEME} from "../../styles/common";
import Header from "../../widgets/Header";
import {getCtx, spacer} from "../../util/Util";
import Footer from "../../widgets/Footer";
import MobileDetect from "mobile-detect";
import {
    APP_STORE_DOWNLOAD_ICON,
    GOOGLE_PLAY_ICON,
    GOOGLE_PLAYSTORE_CUSTOMER_APP,
    IOS_APPSTORE_CUSTOMER_APP
} from "../../constants/Constants";
import window from 'global/window';


class ThankYouOrderScreen extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    componentDidMount() {
        const gtag_report_conversion = window.gtag_report_conversion || (() => { console.log('adwords conv tracking function not found'); });
        gtag_report_conversion();
    }
    render() {
        const {classes} = this.props;

        const md = new MobileDetect(navigator.userAgent);
        const mdMobile = md.mobile();
        const os = md.os() || '';
        const isAndroid = os.toLowerCase().includes('android');
        const isIphone = md.is('iPhone');
        const takeToApp = isAndroid;
        console.log('md: ', md, mdMobile, os, takeToApp);

        if (takeToApp) {
            // const link = isAndroid ? GOOGLE_PLAYSTORE_CUSTOMER_APP : IOS_APPSTORE_CUSTOMER_APP;
            const link = 'https://heloprotocol.app.link/KdSBTEWBTU';
            const f = () => window.location.href = link;        // Goto playstore / appstore / open app
            setTimeout(f, 4000);
        }

        return (
            <SuperRoot>
                <Header />

                <Helmet>
                    <title>Thank you for signing up</title>
                </Helmet>

                <div className={classes.root}>
                    <div className={classes.title}>Thank you for signing up !</div>
                    <br/>
                    <div className={classes.content}>
                        We have taken your requirements. Please install the app to browse the maids and cooks nearby and call them.
                        <br/>
                        As a bootstrapped startup, we try to cater to all our customers, but we are limited by supply.
                        In case we are not able to find you the right maid in your area / time preference, please don't worry.
                        We onboard hundreds of maids each week, we should have someone for you.
                    </div>

                    {spacer(20)}
                    <div className={classes.bannerAppDownloadContainer}>
                        <div className={classes.bannerGooglePlayContainer}>
                            <a href={GOOGLE_PLAYSTORE_CUSTOMER_APP} target="_blank">
                                <img src={GOOGLE_PLAY_ICON} className={classes.bannerGooglePlayImg} />
                            </a>
                        </div>
                        <div className={classes.bannerAppleStoreContainer}>
                            <a href={IOS_APPSTORE_CUSTOMER_APP} target="_blank">
                                <img src={APP_STORE_DOWNLOAD_ICON} className={classes.bannerAppleStoreImg} />
                            </a>
                        </div>
                    </div>
                </div>

                <Footer />
            </SuperRoot>
        );
    }
}
const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        verticalAlign: 'middle',
        alignItems: 'center',
    },
    title: {
        marginTop: 30,
        marginBottom: 30,
        fontSize: 36,
        color: TEAL_COLOR_THEME,
    },
    content: {
        marginLeft: 50,
        marginRight: 50,
        lineHeight: 1.5,
        textAlign: 'left',
        marginBottom: 30,
    },


    bannerAppDownloadContainer: {
        marginTop: 20,
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 40,
        justifyContent: 'center',
    },
    bannerGooglePlayContainer: {
        marginRight: 10,
    },
    bannerGooglePlayImg: {
        height: 40,
    },
    bannerAppleStoreContainer: {
    },
    bannerAppleStoreImg: {
        height: 40,
    },
    comingSoonText: {
        textAlign: 'center',
        color: COLOR_WHITE_GRAY,
    },
});
export default withStyles(styles)(ThankYouOrderScreen);
