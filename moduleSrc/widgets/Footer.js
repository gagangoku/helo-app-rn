import {CUSTOMER_CARE_HELPLINE, EMAIL_ID, FACEBOOK_PAGE, OFFICE_LOCATION, TWITTER_PAGE} from "../constants/Constants";
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import window from "global/window";
import {BROWSE_PAGE_URL} from "../controller/HomePageFlows";
import {View} from '../util/Util';


export default class Footer extends React.Component {
    static URL = '/';
    constructor(props) {
        super(props);
    }

    render() {
        const {classes} = this.props;

        const x = { color: 'white', textDecoration: 'none', cursor: 'pointer' };
        const officeLocation = 'https://www.google.co.in/maps/place/Square+One+Co-Working+Spaces/@12.9720454,77.6504348,17z/data=!3m1!4b1!4m5!3m4!1s0x3bae17852883b797:0x605a359bbdbf390b!8m2!3d12.9720402!4d77.6526235';
        const emailLink = <a href={'mailto:' + EMAIL_ID} style={x} target="_blank">{EMAIL_ID}</a>;
        const officeMapLink = <a style={x} target="_blank" onClick={() => window.alert('Coming soon')}>{OFFICE_LOCATION}</a>;
        const callLink = <a href={'tel:' + CUSTOMER_CARE_HELPLINE} style={x} target="_blank">{CUSTOMER_CARE_HELPLINE}</a>;
        const whatsappLink = 'https://api.whatsapp.com/send?text=Hi&phone=91' + CUSTOMER_CARE_HELPLINE.substr(1);
        const whatsappBtn = <a href={whatsappLink} style={x} target="_blank">Whatsapp</a>;

        const array = [
            [<FontAwesomeIcon icon={'envelope'} size="1x" color={TEAL_COLOR_THEME} />, emailLink, 1],
            [<FontAwesomeIcon icon={['fas', 'map-marker-alt']} size="1x" color={TEAL_COLOR_THEME} />, officeMapLink, 2],
            [<FontAwesomeIcon icon={['fab', 'whatsapp']} size="1x" color={TEAL_COLOR_THEME} />, whatsappBtn, 4],
        ];
        const f = (x) => {
            return (
                <div style={custom.contactsDiv} key={x[2]}>
                    <div style={custom.contactsImgContainer}>{x[0]}</div>
                    <div style={custom.contactsValue}>{x[1]}</div>
                </div>
            );
        };

        return (
            <View style={custom.root}>
                <View style={custom.container}>
                    <View style={custom.aboutContainer}>
                        <View style={custom.aboutTitle}>ABOUT US</View>
                        <View style={custom.aboutDesc}>
                            Helo Protocol helps you view and hire pre-screened & background checked blue collar workforce
                            (maids, nannies, cooks, car washers, etc.). See them online before hiring them.
                            <br/>
                            <a href={BROWSE_PAGE_URL} target="_blank">See all supply by area</a>
                        </View>
                    </View>
                    <View style={custom.socialContainer}>
                        <View style={custom.socialTitle}>SOCIAL NETWORKS</View>
                        <View style={custom.socialItems}>
                            <View style={custom.socialItem1}>
                                <a target="_blank" href={FACEBOOK_PAGE}>
                                    <FontAwesomeIcon icon={['fab', 'facebook-f']} size="2x" color={TEAL_COLOR_THEME} />
                                </a>
                            </View>
                            <View style={custom.socialItem1}>
                                <a target="_blank" onClick={() => window.alert('Coming soon')}>
                                    <FontAwesomeIcon icon={['fab', 'instagram']} size="2x" color={TEAL_COLOR_THEME} />
                                </a>
                            </View>
                            <View style={custom.socialItem1}>
                                <a target="_blank" href={TWITTER_PAGE}>
                                    <FontAwesomeIcon icon={['fab', 'twitter']} size="2x" color={TEAL_COLOR_THEME} />
                                </a>
                            </View>
                            <View style={custom.socialItem1}>
                                <a href={whatsappLink} target="_blank">
                                    <FontAwesomeIcon icon={['fab', 'whatsapp']} size="2x" color={TEAL_COLOR_THEME} />
                                </a>
                            </View>
                        </View>
                    </View>
                    <View style={custom.contactsContainer}>
                        <View style={custom.contactsTitle}>OUR CONTACTS</View>
                        {array.map(x => f(x))}
                    </View>
                </View>

                <View style={custom.copyRight}>&copy; Helo Protocol 2019. All rights reserved.</View>
            </View>
        );
    }
}

const TEAL_COLOR_THEME = '#93afff';
const custom = {
    root: {
        backgroundColor: '#323334',
        color: 'white',
        fontSize: 14,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',

        lineHeight: 1.5,
        fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
        fontWeight: '300',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
    container: {
        width: '80%',
        textAlign: 'left',
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    aboutContainer: {
        flex: 2,
        minWidth: 250,
        marginTop: 20,
    },
    aboutTitle: {
        fontSize: 15,
        marginBottom: 20,
        maxWidth: 350,
    },
    aboutDesc: {
        maxWidth: 350,
    },
    socialContainer: {
        flex: 1,
        minWidth: 250,
        marginTop: 20,
    },
    socialTitle: {
        marginBottom: 10,
    },
    socialItems: {
        display: 'flex',
        flexDirection: 'row',
    },
    socialItem1: {
        marginRight: 20,
    },
    contactsContainer: {
        flex: 1,
        minWidth: 250,
        marginTop: 20,
    },
    contactsTitle: {
        marginBottom: 10,
    },
    contactsDiv: {
        display: 'flex',
        flexDirection: 'row',
    },
    contactsImgContainer: {
        marginRight: 10,
        marginBottom: 10,
    },
    contactsImg: {},
    contactsValue: {},
    copyRight: {
        borderTop: '1px solid rgba(249, 249, 249, 0.2)',
        paddingTop: 30,
        paddingBottom: 30,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 10,
    },
};
