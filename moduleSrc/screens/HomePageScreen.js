import React, {Fragment} from 'react';
import {actionButton, getCtx, Image, spacer, View} from "../util/Util";
import {Helmet} from "../platform/Util";
import Header from "../widgets/Header";
import Footer from "../widgets/Footer";
import {IS_MOBILE_SCREEN} from "../constants/Constants";
import window from "global";
import {CUSTOMER_SIGNUP_ENTRY_URL} from "../controller/CustomerSignupFlow";
import {COLOR_WHITE_GRAY} from "../styles/common";
import AppDownloadContainer from "../widgets/AppDownloadContainer";


export default class HomePageScreen extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
    }

    signupForMonthlyFn = () => {
        window.location.href = CUSTOMER_SIGNUP_ENTRY_URL;
    };

    render() {
        const {classes} = this.props;

        const imgConsumer = 'https://images-lb.heloprotocol.in/9.png-215971-78156-1552576429338.png?name=consumer';
        const imgAgency = 'https://images-lb.heloprotocol.in/6.png-16629-829039-1552576397408.png?name=agency';
        const imgWorkforce = 'https://images-lb.heloprotocol.in/Housekeeping-cliparts-and-others-art-inspiration-2.png-204268-960379-1558514965231.png';

        // TODO: Figure out the right way of using og tags
        const ogMetas = (
            <Fragment>
                <meta property="og:description"
                      content="Find and connect with the best personally vetted & background-checked blue collar workforce - be it cooks, maids, attendants, nurses etc."/>
                <meta property="og:keywords"
                      content="blue collar employees, linkedin, cooks in Bangalore, maids in Bangalore, nurses in Bangalore"/>
            </Fragment>
        );
        return (
            <View style={custom.topLevelRoot}>
                <Helmet>
                    <title>Helo Protocol Initiative | Professional networking for Blue collared Workforce in India - maids, cooks, nannies, car washers, newspaper delivery guys etc.</title>
                    <link rel="canonical" href="https://www.heloprotocol.in/" />

                    <meta name="description"
                          content="Find and connect with the best personally vetted & background-checked blue collar workforce - be it cooks, maids, attendants, nurses etc. Areas (Indiranagar / BTM Layout / Koramangala / Marathahalli / HSR Layout / Hebbal / Cox Town / Austin town / Frazer Town / Jayanagar / JP Nagar / Bellandur / HRBR Layout / OMBR Layout …)"/>
                    <meta name="keywords"
                          content="blue collar employees, linkedin, cooks in Bangalore, maids in Bangalore, nurses in Bangalore"/>
                </Helmet>

                <Header />

                <View style={custom.root}>
                    <View style={[custom.sectionRoot, custom.headingSectionRoot]}>
                        <View style={custom.sectionHeading}>Helo Protocol Initiative</View>

                        <AppDownloadContainer />
                        {spacer(20)}

                        <View style={custom.sectionContent}>
                            Helo Protocol is a LinkedIn like professional networking platform for the blue collar workforce in India,
                            to bring together maids, cooks, nannies, security guards, car washers, valets and servers -
                            people who run our homes, buildings and offices daily.
                            <br/>
                            <br/>
                            We are currently listing <b>home cooks and staff in the F&amp;B industry</b>.
                            <br/>
                            <br/>

                            More than 350 Million people in India have smartphones and this number is increasing thanks to Jio.
                            And yet, most of the blue collar workforce is not yet online. We don't know much about them, other than the agencies that employ them.
                            Wouldn’t it be great if you had LinkedIn style profiles of the workforce you employ, or are looking to employ ?
                            If we could share our experiences about the worker.
                            If we could view their past work history, what their employers have said about them, how proficient they are.
                            <br/>
                            <br/>

                            There are three sides to every story - yours, mine and the truth. Similarly, there are three sides to this ecosystem : consumers, agencies and the workforce.
                            <br/>
                            <br/>
                            <br/>

                            <View style={custom.wrapItems}>
                                <View style={custom.itemCtr}>
                                    <View style={custom.itemImgCtr}>
                                        <Image source={imgConsumer} style={[custom.itemImg, { height: 220 }]} />
                                    </View>
                                    <View style={custom.itemHeader}>Consumer</View>
                                    <View style={custom.itemContent}>
                                        As consumers, we want professionalism. We pay agencies and expect services from them.
                                    </View>
                                </View>

                                <View style={custom.itemCtr}>
                                    <View style={custom.itemImgCtr}>
                                        <Image source={imgAgency} style={[custom.itemImg, { height: 150 }]} />
                                    </View>
                                    <View style={custom.itemHeader}>Agencies</View>
                                    <View style={custom.itemContent}>
                                        Agencies are running a business out of the services provided by workforce.
                                    </View>
                                </View>

                                <View style={custom.itemCtr}>
                                    <View style={custom.itemImgCtr}>
                                        <Image source={imgWorkforce} style={[custom.itemImg, { height: 220 }]} />
                                    </View>
                                    <View style={custom.itemHeader}>Workforce</View>
                                    <View style={custom.itemContent}>
                                        Workforce is working to earn capital.
                                    </View>
                                </View>
                            </View>
                            <br/>
                            <br/>

                            While we all understand the perspectives of Consumers, we don’t yet fully understand the workforce.
                            <ul>
                                <li>Who are these people ?</li>
                                <li>What are their challenges ?</li>
                                <li>What makes us believe they are unprofessional ?</li>
                                <li>Why do they behave unprofessionally ?</li>
                                <li>How (and how much) do they earn ?</li>
                                <li>Where does that money go ?</li>
                            </ul>
                            <br/>

                            Join the platform to see this workforce first hand, and employ them.
                            <br/>
                            <br/>

                            <View style={custom.signupCtr}>
                                {actionButton('Signup', this.signupForMonthlyFn)}
                            </View>
                        </View>
                    </View>
                </View>

                <Footer />
            </View>
        );
    }
}

const custom = {
    topLevelRoot: {
    },
    root: {
        fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
    sectionRoot: {
        paddingTop: 30,
        paddingBottom: 30,
    },
    sectionHeading: {
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 20,
        fontSize: 26,
        // fontWeight: 'bold',
    },
    sectionContent: {
        marginLeft: IS_MOBILE_SCREEN ? 15 : '20%',
        marginRight: IS_MOBILE_SCREEN ? 15 : '20%',

        fontSize: 16,
        lineHeight: 1.5,
        fontWeight: '300',
    },
    headingSectionRoot: {
    },


    wrapItems: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
    },


    itemCtr: {
        width: 400,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,

        padding: 20,
        backgroundColor: '#fafafa',
    },
    itemImgCtr: {
        height: 200,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    itemImg: {
        height: 200,
    },
    itemHeader: {
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    itemContent: {
    },

    signupCtr: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
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
};
