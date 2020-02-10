import React from 'react';
import {getCtx, Image, View} from "../util/Util";
import Drawer from '@material-ui/core/Drawer';
import {CUSTOMER_CARE_HELPLINE, HEADER_ICON, IS_MOBILE_SCREEN} from "../constants/Constants";
import {COOKS_PAGE_URL, WRITE_SUPPLY_RECOMMENDATION} from "../controller/HomePageFlows";
import {GROUP_URLS} from "../controller/Urls";


export default class Header extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.state = {
            drawerOpen: false,
        };
    }

    toggleDrawer = () => {
        this.setState({ drawerOpen: !this.state.drawerOpen });
    };
    scrollFn = (cbFn) => {
        this.toggleDrawer();
        cbFn();
    };

    item = (title, onclickFn) => {
        const {classes} = this.props;
        return (
            <View style={custom.headerDrawerItem}>
                <a onClick={onclickFn} style={custom.headerDrawerLink}>{title}</a>
            </View>
        );
    };

    render() {
        const {classes} = this.props;
        const helplineNumber = this.props.helplineNumber || CUSTOMER_CARE_HELPLINE;
        const homeUrl = this.props.homeUrl || '/';

        const signupToCookSection = !this.props.signupToCookFn ? '' : this.item('SIGNUP AS A MAID', () => this.props.signupToCookFn());
        const loginSection = !this.props.loginFn ? '' : this.item('LOGIN', () => this.props.loginFn());
        const logoutSection = !this.props.logoutFn ? '' : this.item('LOGOUT', () => this.props.logoutFn());
        const editRequirementsSection = !this.props.editRequirementsFn ? '' : this.item('POST / EDIT REQUIREMENTS', () => this.props.editRequirementsFn());

        const addedStyles = this.props.addedStyles || {};
        return (
            <View style={[custom.headerRoot, addedStyles]}>
                <View style={custom.headerBar}>
                    <View style={custom.headerIconContainer}>
                        <a href={homeUrl}><Image source={HEADER_ICON} style={custom.headerIconImg} /></a>
                    </View>
                    <View style={custom.headerPhoneAndDescContainer}>
                        <div style={custom.headerTitle}>Helo Protocol</div>
                        <div style={custom.headerSubTitle}>Hire Blue collar workforce easier</div>
                    </View>
                    <View style={custom.headerDrawerContainer}>
                        <Image source={DRAWER_ICON} onClick={this.toggleDrawer} style={custom.headerDrawerImg} />
                    </View>
                </View>

                <Drawer anchor="right" open={this.state.drawerOpen} onClose={this.toggleDrawer}>
                    <View style={custom.headerDrawerRoot}>
                        {loginSection}
                        {editRequirementsSection}

                        <View style={custom.headerDrawerItem}>
                            <a href={GROUP_URLS.chatBot} style={custom.headerDrawerLink} target="_blank">SIGNUP FOR WORK</a>
                        </View>

                        <View style={custom.headerDrawerItem}>
                            <a href={COOKS_PAGE_URL} style={custom.headerDrawerLink}>COOKS</a>
                        </View>

                        <View style={custom.headerDrawerItem}>
                            <a href={WRITE_SUPPLY_RECOMMENDATION} style={custom.headerDrawerLink}>RECOMMEND YOUR MAID</a>
                        </View>

                        <View style={custom.headerDrawerItem}>
                            <a href="https://heloprotocol.breezy.hr/" style={custom.headerDrawerLink} target="_blank">CAREERS</a>
                        </View>

                        <View style={custom.headerDrawerItem}>
                            <a href="https://medium.com/helo-protocol" style={custom.headerDrawerLink} target="_blank">BLOG</a>
                        </View>
                        {logoutSection}
                    </View>
                </Drawer>
            </View>
        );
    }
}

const DRAWER_ICON = 'https://i.stack.imgur.com/Fw96Z.png';
const TEAL_COLOR_THEME = '#000000';
const custom = {
    // Header
    headerRoot: {
        // width: '100%',
        fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        fontWeight: '400',

        marginLeft: IS_MOBILE_SCREEN ? 15 : '10%',
        marginRight: IS_MOBILE_SCREEN ? 15 : '10%',
    },
    headerBar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        paddingBottom: 10,
        borderBottom: '2px solid',
        borderBottomColor: '#f5f5f5',
    },
    headerIconContainer: {},
    headerIconImg: {
        height: 50,
    },
    headerPhoneAndDescContainer: {
        textAlign: 'center',
    },
    headerSubTitle: {
        fontSize: 15,
    },
    headerTitle: {
        fontSize: 20,
    },
    headerDrawerContainer: {
        width: 30,
    },
    headerDrawerImg: {
        height: 30,
        width: 30,
    },

    headerDrawerRoot: {
        height: '100%',
        width: 300,
        color: 'white',
        backgroundColor: '#323334',
        fontSize: 14,
    },
    headerDrawerItem: {
        marginLeft: 30,
        marginTop: 30,
        marginBottom: 30,
    },
    headerDrawerLink: {
        color: 'white',
        textDecoration: 'none',
        cursor: 'pointer',
    },
};
