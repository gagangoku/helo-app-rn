import React, {Fragment} from 'react';
import {actionButton, getCtx, Image, spacer, View} from "../../util/Util";
import {Helmet} from "react-helmet";
import Header from "../../widgets/Header";
import Footer from "../../widgets/Footer";
import xrange from "xrange";
import {IS_MOBILE_SCREEN} from "../../constants/Constants";
import Slider from "react-slick/lib";
import AppDownloadContainer from "../../widgets/AppDownloadContainer";


export default class CategoryHomeScreen extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.category = (this.contextObj.category || this.props.category).toUpperCase();
        this.categoryPlural = (this.contextObj.categoryPlural || this.props.categoryPlural).toLowerCase();
        this.bannerImg = this.props.bannerImg;
        this.signupForMonthlyFn = this.props.signupForMonthlyFn;
        this.minPricePerMonth = this.props.minPricePerMonth;

        this.state = {
        };
    }

    hireForADayFn = () => {};

    getBanner = () => {
        return (
            <View style={custom.bannerRoot}>
                <Image source={this.bannerImg} style={{ width: '100%' }} />
            </View>
        );
    };
    getHeadingSection = () => {
        const signupForSubscription = (
            <View style={{ marginBottom: 10 }}>
                {actionButton('Signup for subscription', this.signupForMonthlyFn)}
            </View>
        );
        const hireForADay = (
            <View style={{ marginBottom: 10 }}>
                {actionButton('Hire for a day', this.hireForADayFn)}
            </View>
        );
        return (
            <View style={[custom.sectionRoot, custom.headingSectionRoot]}>
                <View style={custom.sectionHeading}>{this.props.sections.heading.heading}</View>

                <View style={custom.sectionContent}>
                    <View style={custom.wrapItems}>
                        {signupForSubscription}
                    </View>
                </View>
                <AppDownloadContainer />
            </View>
        );
    };
    workerQualitiesSection = () => {
        return (
            <View style={[custom.sectionRoot, custom.workerQualitiesSectionRoot]}>
                <View style={custom.sectionHeading}>{this.props.sections.qualities.heading}</View>
                <View style={custom.sectionContent}>
                    {this.props.sections.qualities.desc}
                    <br/>
                    All {this.categoryPlural} at Helo Protocol are personally interviewed, verified and vetted.
                    Your feedback is tracked and taken seriously.
                    Our approach is to show people they can earn more if they are professional and get good ratings from customers.
                </View>
            </View>
        );
    };
    whyHeloProtocol = () => {
        return (
            <View style={[custom.sectionRoot, custom.whyHeloProtocolSectionRoot]}>
                <View style={custom.sectionHeading}>Why Helo Protocol ?</View>
                <View style={custom.sectionContent}>
                    Our mission is to make access to blue collar workforce seamless. See the person's profile before trying them out.
                    <br/>
                    Our goal is to enable you homemakers to find the best help for your home.
                    Rate them regularly so that their shortcomings can be improved over time.
                </View>
            </View>
        );
    };
    testimonials = () => {
        const array = [
            ['Good staff. It\'s a boon the day my maid doesn\'t show up.', 'NIKITA', 'Working at AQ'],
            ['Getting a maid was never this easy. I have moved 3 cities in past 2 years. I wish this service existed sooner.', 'NIMISHA', 'Working at SalesForce'],
            ['I have said it once, I\'ll say it again. Very professional service. Would have no hesitation in recommending this company.', 'AKASH', 'Working at Exxon Mobil'],
        ];
        const f = (x) => {
            return (
                <View style={custom.customerFeedback1FeedbackContainer} key={x[1]}>
                    <View style={custom.customerFeedback1FeedbackBox}>
                        <View style={custom.customerFeedback1Comment}>
                            {x[0]}
                        </View>
                        <View style={custom.customerFeedbackStartQuoteContainer}>
                            <img src={START_QUOTE} width={30} style={custom.customerFeedbackStartQuoteImg} />
                        </View>
                        <View style={custom.customerFeedbackEndQuoteContainer}>
                            <img src={END_QUOTE} width={30} style={custom.customerFeedbackEndQuoteImg} />
                        </View>
                    </View>
                    <View style={custom.customerFeedback1PersonBox}>
                        <View style={custom.customerFeedback1PersonName}>{x[1]}</View>
                        <View style={custom.customerFeedback1PersonCompany}>{x[2]}</View>
                    </View>
                </View>
            );
        };

        const sliderSettings = {
            dots: true,
            infinite: false,
            speed: 100,
            slidesToShow: 1,
            slidesToScroll: 1,
        };
        const sec = !IS_MOBILE_SCREEN ? (
            <View style={custom.customerFeedback3FeedbackContainer}>
                {array.map(x => f(x))}
            </View>
        ) : (
            <Fragment>
                <Slider {...sliderSettings}>
                    {array.map(x => <div style={{ width: '100%'}} key={x[0]}>{f(x)}</div>)}
                </Slider>
                {spacer(30)}
            </Fragment>
        );

        return (
            <View style={[custom.customerFeedbackContainer, custom.sectionRoot, custom.testimonialsSectionRoot]}>
                <View style={custom.sectionHeading}>Testimonials</View>
                <View style={custom.sectionContent}>Don't just take our word for it, hear from people who have tried.</View>

                <View style={{ width: '100%', marginTop: 10, }}>
                    {sec}
                </View>
            </View>
        );
    };
    faq = () => {
        const keyFn = (idx) => 'faq-' + idx;
        const toggle = (idx) => {
            this.setState({ [keyFn(idx)]: !this.state[keyFn(idx)] });
        };

        const array = [
            ['What are your prices ?', <div>
                We do not charge any commission / upfront fee,
                the prices are decided by mutual agreement between you and the {this.category.toLowerCase()}, and you pay them directly.
                We can only give a rough estimate - <b>Rs. {this.minPricePerMonth} - {this.minPricePerMonth + 500}</b> per hour per month.
                The price chart is also mentioned on each worker's profile. Feel free to negotiate with them.
            </div>],
            ['How does it work?', <div>
                Upon placing your request, you'll be taken to the app download page.
                Once you install the app and sign in using the same phone number you registered with, you'll be able to see the nannies near your area.
                You can view their profiles and call the ones you like for a demo.
            </div>],
            ['I need a ' + this.category.toLowerCase() + ' for just one day', <div>
                We will be launching the hourly services in April. Signup now to get preference.
                We staff up areas with more requests first.
            </div>],
            ['How do I give my feedback?', <div>
                We take feedback very seriously. You can leave feedback for a worker on their profile page on the website / app.
                Feedback is moderated for abuse.
            </div>],
            ['Why should I signup ?', <div>
                It's completely free. We are onboarding 100+ people every week.
                People who signup get preference when new workers join.
            </div>],
        ];
        const f = (x, idx) => {
            const val = this.state[keyFn(idx)];
            const sign = val ? '-' : '+';
            return (
                <View style={custom.faq1Container} key={idx}>
                    <View style={val ? custom.faq1TitleContainerHighlighted : custom.faq1TitleContainer} onClick={() => toggle(idx)} key={idx}>
                        <View style={custom.faq1TitleSign}>{sign}</View>
                        <View style={custom.faq1TitleText}>{x[0]}</View>
                    </View>
                    <View style={[custom.faq1Desc, { display: val ? 'block' : 'none' }]}>{x[1]}</View>
                </View>
            );
        };

        return (
            <View style={[custom.sectionRoot, custom.testimonialsSectionRoot, custom.faqContainer1]}>
                <View style={[custom.sectionHeading, custom.faqTitle]}>FAQ</View>
                <View style={custom.sectionContent}>
                    {xrange(0, array.length).toArray().map(x => f(array[x], x))}
                </View>
            </View>
        );
    };

    render() {
        return (
            <View>
                <Helmet>
                    <title>{this.props.title}</title>
                    <link rel="canonical" href={this.props.relCanonical} />

                    <meta name="description"
                          content="Find and connect with the best personally vetted & background-checked blue collar workforce - be it cooks, maids, attendants, nurses etc. Areas (Indiranagar / BTM Layout / Koramangala / Marathahalli / HSR Layout / Hebbal / Cox Town / Austin town / Frazer Town / Jayanagar / JP Nagar / Bellandur / HRBR Layout / OMBR Layout …)"/>
                    <meta name="keywords"
                          content="blue collar employees, linkedin, cooks in Bangalore, maids in Bangalore, nurses in Bangalore"/>
                    <meta property="og:description"
                          content="Find and connect with the best personally vetted & background-checked blue collar workforce - be it cooks, maids, attendants, nurses etc."/>
                    <meta property="og:keywords"
                          content="blue collar employees, linkedin, cooks in Bangalore, maids in Bangalore, nurses in Bangalore"/>

                    <link rel="stylesheet" type="text/css" charset="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
                    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
                </Helmet>

                <Header />

                <View style={custom.root}>
                    {this.getBanner()}
                    {this.getHeadingSection()}
                    {this.workerQualitiesSection()}
                    {this.whyHeloProtocol()}
                    {this.testimonials()}
                    {this.faq()}
                </View>

                <Footer />
                <View style={custom.imageCredit}>
                    Image credits:
                </View>
            </View>
        );
    }
}

export const TEAL_COLOR_THEME = '#c5a5c5';
const BORDER_COLOR = '#dcdcdc';
const START_QUOTE = 'https://images-lb.heloprotocol.in/85.png-1682-985449-1552576426750.png?name=quotes-a.png';
const END_QUOTE = 'https://images-lb.heloprotocol.in/86.png-1685-573087-1552576427256.png?name=quotes-b.png';

const custom = {
    root: {
        fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
    bannerRoot: {
    },

    sectionRoot: {
        paddingTop: 30,
        paddingBottom: 30,
    },
    sectionHeading: {
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 20,
        marginLeft: 5,
        fontSize: 26,
        // fontWeight: 'bold',
    },
    sectionContent: {
        marginLeft: IS_MOBILE_SCREEN ? 15 : '20%',
        marginRight: IS_MOBILE_SCREEN ? 15 : '20%',

        fontSize: 15,
        lineHeight: 1.5,
        fontWeight: '300',
    },
    headingSectionRoot: {
    },
    workerQualitiesSectionRoot: {
        backgroundColor: '#fafafa',
    },
    whyHeloProtocolSectionRoot: {
    },
    testimonialsSectionRoot: {
    },
    faqSectionRoot: {},

    wrapItems: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
    },



    // FAQ
    faqContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',

        width: '90%',
        paddingLeft: '5%',
        paddingRight: '5%',
    },
    faqTitle: {
        marginTop: 20,
    },
    faqContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',

        width: '95%',
        marginBottom: 20,
    },
    faq1Container: {
        width: '100%',
        marginBottom: 15,
        border: '1px solid',
        borderColor: BORDER_COLOR,
    },
    faq1TitleContainerHighlighted: {
        backgroundColor: '#000000',
        height: 60,
        color: 'white',

        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        fontSize: 18,
    },
    faq1TitleContainer: {
        backgroundColor: BORDER_COLOR,
        height: 60,

        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        fontSize: 18,
    },
    faq1TitleSign: {
        marginLeft: 10,
    },
    faq1TitleText: {
        marginLeft: 10,
        textAlign: 'left',
    },
    faq1Desc: {
        backgroundColor: 'white',
        margin: 20,
        lineHeight: 1.5,
        textAlign: 'left',
        fontSize: 15,
        fontWeight: '300',
    },



    // Customer feedback section
    customerFeedbackContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',

        width: '90%',
        paddingLeft: '5%',
        paddingRight: '5%',
        backgroundColor: '#fafafa',
    },
    customerFeedbackHeader: {
        fontSize: 30,
        marginTop: 30,
        marginBottom: 30,
    },
    customerFeedbackDesc: {
        fontSize: 15,
        marginBottom: 30,
        lineHeight: 2,
    },
    customerFeedback3FeedbackContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    customerFeedback1FeedbackContainer: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: 20,
    },
    customerFeedback1FeedbackBox: {
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        width: '90%',
        height: 200,
    },
    customerFeedback1Comment: {
        width: '70%',
        marginTop: 20,
        marginBottom: 20,
    },
    customerFeedbackStartQuoteContainer: {},
    customerFeedbackStartQuoteImg: {
        position: 'absolute',
        top: '10%',
        left: '5%',
    },
    customerFeedbackEndQuoteContainer: {},
    customerFeedbackEndQuoteImg: {
        position: 'absolute',
        bottom: '10%',
        right: '5%',
    },
    customerFeedback1PersonBox: {
    },
    customerFeedback1PersonName: {
        fontSize: 15,
        margin: 10,
    },
    customerFeedback1PersonCompany: {
        fontSize: 15,
        margin: 10,
    },

    imageCredit: {
        fontSize: 10,
    },
};
