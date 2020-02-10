import React, {Fragment} from 'react';
import {differenceFn, hashCode, spacer, View} from '../util/Util';
import window from 'global';
import TouchableAnim from "../platform/TouchableAnim";
import Slider from "react-slick/lib";
import {Helmet, Modal, WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH} from '../platform/Util';
import xrange from 'xrange';
import {
    GUEST_LIST_STATUS_CLOSED,
    GUEST_LIST_STATUS_CONFIRMED,
    GUEST_LIST_STATUS_FAILURE,
    GUEST_LIST_STATUS_FULL,
    GUEST_LIST_STATUS_WAITLIST
} from "./Constants";


export class SilverGoldPlatinumMemberPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalOpen: false,
            offerId: null,
            codeObj: null,
        };
    }
    componentDidMount() {
    }

    offerModal = () => {
        const { offers } = this.props.loyaltyConfigs;
        return  (
            <Modal isOpen={this.state.isModalOpen} onRequestClose={() => {}}
                   style={modalStyle} onAfterOpen={() => {}} contentLabel="Example Modal">
                <div style={{ height: 0.75*H, width: 0.75*W }}>
                    <OfferModal offerId={this.state.offerId} userDetails={this.props.userDetails}
                                codeObj={this.state.codeObj} offers={offers}
                                closeFn={() => this.setState({ isModalOpen: false })} />
                </div>
            </Modal>
        );
    };
    availOfferFn = async (offerId) => {
        const { success, code, reason, details } = await this.props.availOfferFn(this.props.userDetails, offerId);
        console.log('availOfferFn success, code: ', success, code);
        this.setState({ isModalOpen: true, offerId, codeObj: {success, code , reason, details} });
    };
    guestListFn = () => this.props.guestListFn(this.props.userDetails);

    render() {
        return (
            <Fragment>
                <MemberPage name={this.props.userDetails.name} points={this.props.points}
                            availOfferFn={this.availOfferFn} guestListFn={this.guestListFn}
                            loyaltyConfigs={this.props.loyaltyConfigs} />
                {this.offerModal()}
            </Fragment>
        );
    }
}

class OfferModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    codeSection = () => {
        const { success, code , reason, details } = this.props.codeObj;
        if (success) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ height: 40, width: 150, border: '2px solid #FEBD01', borderRadius: 5, background: '#FEBD0120',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ color: BG_COLOR, fontSize: 20, letterSpacing: 3 }}>{code}</div>
                    </div>
                    <div style={{ fontSize: 13, marginTop: 20 }}>Please share the code with your server to avail this offer.</div>
                </div>
            );
        }

        const s = { marginLeft: 5, marginBottom: 5 };
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: '#FF0000', fontSize: 20, letterSpacing: 0.5, marginBottom: 10 }}>{reason}</div>
                <div style={{ height: 100, width: 250, border: '2px solid #FEBD01', borderRadius: 5, background: '#FEBD0120',
                              wordWrap: 'break-word', fontSize: 14,
                              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}}>
                    <span style={s}><b>Code:</b> {details.code}</span>
                    <span style={s}><b>Offer:</b> {details.offerId}</span>
                    <span style={s}><b>When:</b> {new Date(parseInt(details.timestamp)).toString()}</span>
                </div>
            </div>
        );
    };

    render () {
        const { offerId, offers } = this.props;
        const { success } = this.props.codeObj;
        const imgUrl = success ? '/static/byg/specialOffer.jpg' : '/static/byg/sorry.png';

        return (
            <div style={custom.offerModal.root}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', top: 20, right: 20 }}>
                        <TouchableAnim onPress={this.props.closeFn}>
                            <div style={{ fontSize: 20 }}>X</div>
                        </TouchableAnim>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: BG_COLOR, marginTop: 20 }}>SELECTED OFFER</div>
                    <div style={{ marginTop: 20, marginBottom: 20 }}>
                        <img src={imgUrl} style={{ height: 250, width: 250 }} />
                    </div>
                    <div style={{ fontSize: 16, marginTop: 20, marginBottom: 20 }}>{offers[offerId]}</div>

                    {this.codeSection()}
                </div>
            </div>
        );
    }
}

export class MemberPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        console.log('MemberPage props: ', props);
    }
    componentDidMount() {
    }

    clickableBoxWithText = (theme, offerId) => {
        const { offers } = this.props.loyaltyConfigs;
        const line = offers[offerId];
        const boxStyle = theme === 'gold' ? custom.gold.box : custom.silver.box;
        return (
            <TouchableAnim key={offerId} style={{ width: '70%', maxWidth: 400 }} onPress={() => this.props.availOfferFn(offerId)}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <div style={{...custom.memberPage.box, ...boxStyle}}>
                        <div>{line}</div>
                    </div>
                </div>
            </TouchableAnim>
        );
    };
    guestList = (theme) => {
        const boxStyle = theme === 'gold' ? custom.gold.box : custom.silver.box;
        return (
            <TouchableAnim key={'guest-list'} style={{ width: '70%', maxWidth: 400 }} onPress={this.props.guestListFn}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <div style={{...custom.memberPage.box, ...boxStyle}}>
                        <div>GUEST LIST</div>
                    </div>
                </div>
            </TouchableAnim>
        );
    };

    disabledBoxWithTextAndLockedLine = (theme, offerId, line2) => {
        const { offers } = this.props.loyaltyConfigs;
        const line = offers[offerId];
        const stripedBoxOverride = theme === 'gold' ? custom.gold.stripedBoxOverride : custom.silver.stripedBoxOverride;
        return (
            <div key={offerId} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '70%', maxWidth: 400 }}>
                <div style={{...custom.memberPage.box, ...stripedBoxOverride}}>
                    <div style={{...custom.memberPage.platinumMembersOnly, fontSize: 14}}>{line}</div>
                    <div style={{ marginTop: 5, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <img src='/static/byg/lock.png' style={{ height: 10, width: 10, marginRight: 5 }} />
                        <div style={custom.memberPage.platinumMembersOnly}>{line2}</div>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        const { name, points } = this.props;
        const { loyaltyConfig, offers, themeConfig } = this.props.loyaltyConfigs;
        const LOYALTY_LADDER = Object.values(loyaltyConfig).sort((a, b) => differenceFn(a, b));

        const A = LOYALTY_LADDER.filter(x => x.minPointsRequired <= points);
        const theme = A[A.length - 1].name;
        console.log('theme, name, points: ', theme, name, points);

        const { benefits, gradientColors, textColor, backgroundColor, guestListEnabled } = loyaltyConfig[theme];
        const textWithGradientFn = (text, fontWeight, letterSpacing) => textWithGradient(text, fontWeight, letterSpacing, gradientColors);

        const idx = LOYALTY_LADDER.map(x => x.name).indexOf(theme);
        const nextUpgrade = LOYALTY_LADDER[idx + 1];
        const pointsForNextUpgrade = nextUpgrade.minPointsRequired - points;
        const bigVirImg = loyaltyConfig[theme].logo;

        console.log('idx, nextUpgrade, pointsForNextUpgrade, bigVirImg, textWithGradientFn: ', idx, nextUpgrade, pointsForNextUpgrade, bigVirImg, textWithGradientFn);

        return (
            <View style={{...custom.root, backgroundColor }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: textColor }}>
                    <div style={{ height: 0.05*H, width: '100%' }}>
                    </div>
                    <div style={{ height: 0.1*H, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ marginBottom: 10, transform: 'scale(1.2)' }}>{textWithGradientFn('WELCOME')}</div>
                        <div style={{...custom.memberPage.welcome, ...custom.memberPage.name}}>{name.toUpperCase()}</div>
                    </div>
                    <div style={{ }}>
                        <img src={bigVirImg} style={{ maxHeight: 0.2*H, maxWidth: 0.2*H }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ marginTop: 20, transform: 'scale(1.2)' }}>{textWithGradientFn((theme + ' MEMBER').toUpperCase(), 'bold')}</div>
                        <div style={custom.memberPage.points}>{points} POINTS</div>
                        <div style={custom.memberPage.pointsNeeded}>You need {pointsForNextUpgrade} more points to become a {nextUpgrade.name} member</div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <img src='/static/byg/line.png' style={{ width: 100 }} />
                    </div>
                    <div style={{ }}>
                        <div style={{ marginTop: 40, marginBottom: 40, transform: 'scale(1.5) translate(20px)' }}>{textWithGradientFn('BENEFITS FOR YOU', 'bold')}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        {guestListEnabled ? this.guestList(theme) : ''}
                        {benefits.map(x => this.clickableBoxWithText(theme, x))}
                        {nextUpgrade.benefits.map(x => this.disabledBoxWithTextAndLockedLine(theme, x, `${nextUpgrade.name.toUpperCase()} MEMBERS ONLY`))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                  width: '100%', marginTop: 40 }}>
                        <div style={{ fontSize: 16, textDecoration: 'underline' }}>Conditions apply</div>
                        <ul style={{ textAlign: 'start', fontSize: 13 }}>
                            <li>Benefits only valid on in-person visits upon QR code scan</li>
                            <li>Only one person per table can avail the offers</li>
                            <li>Only visits through scan will be counted towards your points</li>
                        </ul>
                    </div>
                </div>
            </View>
        );
    }
}

export class Benefits extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeSlide: 0,
            labelIdx: new Date().getDay(),
        };
    }
    componentDidMount() {
    }

    renderDots() {
        const { loyaltyConfig, offers, themeConfig } = this.props.loyaltyConfigs;

        const backgroundColor = themeConfig.benefitsConfig.backgroundColor;
        const gradientBackground = themeConfig.benefitsConfig.imInterested.background;
        const { selectedBackground, background, borderColor } = themeConfig.benefitsConfig.dot;
        const [ topImgHeight, itemsHeight, actionBtnHeight ] = themeConfig.benefitsConfig.sectionHeights || [0.3, 0.61, 0.09];
        const slickDotsHeight = 35;
        const dotH = 12;
        const settings = {
            dots: true,
            infinite: false,
            speed: 100,
            slidesToShow: 1,
            slidesToScroll: 1,
            afterChange: current => this.setState({ activeSlide: current }),
            dotsClass: 'dotsClass-xxx',
            appendDots: dots => {
                const st = { marginRight: 5, backgroundColor, height: dotH, width: dotH, borderRadius: '50%', borderWidth: 1, borderColor, borderStyle: 'solid', background };
                const st2 = {...st, borderWidth: 0, height: dotH+2, width: dotH+2, background: selectedBackground};

                return (
                    <div style={{ height: slickDotsHeight, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
                        {dots.map((item, index) => <div key={index} style={index === this.state.activeSlide ? st2 : st}>&nbsp;</div>)}
                    </div>
                )
            },
        };

        const images = themeConfig.benefitsConfig.images;
        const items = images.map(x => (
            <div>
                <div key={x} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: itemsHeight*H - slickDotsHeight }}>
                    <img src={x} style={{ maxHeight: itemsHeight*H - slickDotsHeight, maxWidth: Math.min(W - 50, itemsHeight*H - slickDotsHeight) }} />
                </div>
            </div>
        ));

        return (
            <View style={{...custom.root, backgroundColor }}>
                <Helmet>
                    <link rel="stylesheet" type="text/css" charset="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
                    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
                </Helmet>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ height: topImgHeight*H, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={themeConfig.benefitsConfig.topImg} style={{ margin: 0, objectFit: 'cover', maxHeight: '100%', maxWidth: '80%' }} />
                    </div>
                    <div style={{ height: itemsHeight*H, width: '100%' }}>
                        <Slider {...settings}>
                            {items}
                        </Slider>
                    </div>
                    <TouchableAnim onPress={this.props.imInterestedFn}
                                   style={{ height: actionBtnHeight*H, width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                            background: gradientBackground }}>
                        <div style={custom.imInterested}>{themeConfig.benefitsConfig.imInterested.text}</div>
                    </TouchableAnim>
                </div>
            </View>
        );
    }

    renderLabels() {
        const { imInterestedTextFn, loyaltyConfigs } = this.props;
        const { loyaltyConfig, offers, themeConfig } = loyaltyConfigs;

        const [ topImgHeight, itemsHeight, actionBtnHeight ] = themeConfig.benefitsConfig.sectionHeights || [0.3, 0.61, 0.09];
        const backgroundColor = themeConfig.benefitsConfig.backgroundColor;
        const btnColor = themeConfig.benefitsConfig.imInterested.background || themeConfig.benefitsConfig.images[this.state.labelIdx].btnColor;

        const labels = themeConfig.benefitsConfig.images.map(x => x.label);
        const images = themeConfig.benefitsConfig.images.map(x => x.img);

        const imInterestedText = imInterestedTextFn ? imInterestedTextFn(this.state.labelIdx) : themeConfig.benefitsConfig.imInterested.text;
        const padTop = 15;
        const padBottom = 20;

        return (
            <View style={{...custom.root, backgroundColor }}>
                <Helmet>
                </Helmet>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ height: topImgHeight*H - padTop - padBottom, display: 'flex', flexDirection: 'column', alignItems: 'center',
                                  paddingTop: padTop, paddingBottom: padBottom }}>
                        <img src={themeConfig.benefitsConfig.topImg} style={{ objectFit: 'cover', maxHeight: '100%', maxWidth: '100%' }} />
                    </div>
                    <div style={{ width: '100%' }}>
                        <LabelsImagesWidget labels={labels} images={images} onLabelSelectFn={(labelIdx) => this.setState({ labelIdx })}
                                            height={itemsHeight*H}
                                            labelConfig={themeConfig.benefitsConfig.labels} />
                    </div>
                    <TouchableAnim onPress={() => this.props.imInterestedFn(this.state.labelIdx)}
                                   style={{ height: actionBtnHeight*H, width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                            background: btnColor }}>
                        <div style={custom.imInterested}>{imInterestedText}</div>
                    </TouchableAnim>
                </div>
            </View>
        );
    }

    render() {
        if (this.props.loyaltyConfigs.themeConfig.benefitsConfig.dot) {
            return this.renderDots();
        }
        return this.renderLabels();
    }
}

export class GuestListScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { imInterestedFn, imInterestedTextFn, loyaltyConfigs } = this.props;
        return (<Benefits imInterestedFn={imInterestedFn} imInterestedTextFn={imInterestedTextFn} loyaltyConfigs={loyaltyConfigs} />)
    }
}

class LabelsImagesWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idx: new Date().getDay(),
        };
    }

    componentDidMount() {
        this.props.onLabelSelectFn(this.state.idx);
    }

    label = (label, idx) => {
        const { labels, onLabelSelectFn } = this.props;
        const { selectedBackgroundColor, backgroundColor } = this.props.labelConfig;
        const isSelected = idx === this.state.idx;
        const bgColor = isSelected ? selectedBackgroundColor : backgroundColor;
        const fn = () => {
            this.setState({ idx });
            onLabelSelectFn(idx);
        };

        const w = (Math.min(W, 500) - 30) / labels.length;
        return (
            <TouchableAnim onPress={fn} key={idx} style={{ height: 0.8 * w, width: 0.8 * w, borderRadius: 10, background: bgColor, marginRight: 0.2 * w,
                                                           display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ fontWeight: 500 }}>{label}</div>
            </TouchableAnim>
        )
    };

    render() {
        const { labels, images, height } = this.props;
        const labelHeight = 50;
        const topPad = 5;
        const w = (W - height + labelHeight + topPad) / 2;
        const h = height - labelHeight - topPad;
        const blurTop = 30;
        const blurLR = 40;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width: '100%' }}>
                <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {xrange(0, labels.length).map(x => this.label(labels[x], x))}
                </div>
                <div style={{ position: 'relative', width: '100%' }}>
                    <div style={{ position: 'absolute', top: topPad, left: w, height: h, width: blurLR, color: 'white',  background: 'linear-gradient(to right, #000000FF, #00000000)' }} />
                    <div style={{ position: 'absolute', top: topPad, right: w, height: h, width: blurLR, color: 'white', background: 'linear-gradient(to right, #00000000, #000000FF)' }} />
                    <div style={{ position: 'absolute', top: topPad, height: blurTop, width: '100%', color: 'white',  background: 'linear-gradient(to bottom, #000000FF, #00000000)' }} />
                    <img src={images[this.state.idx]} style={{ width: h, marginTop: topPad, height: h, marginLeft: w }} />
                </div>
            </div>
        );
    }
}

export class NamePhoneDetailsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            phone: '',
        };
    }

    componentDidMount() {
    }

    handleChange = (field, ev) => {
        if (field === 'phone' && ev.target.value.length > 10) {
            return;
        }
        this.setState({ [field]: ev.target.value });
    };
    submitFn = (name, phone) => {
        if (name && name.length > 3 && phone && phone.length === 10) {
            this.props.submitFn(name, phone);
        }
    };

    render() {
        const { name, phone } = this.state;
        const nameStyle = {...custom.namePhoneDetails.input};
        if (name && name.length >= 1 && name.length <= 3) {
            nameStyle.border = '2px solid #FF0000';
        }

        const phoneStyle = {...custom.namePhoneDetails.input, letterSpacing: 2};
        if (phone && phone.length >= 1 && phone.length !== 10) {
            phoneStyle.border = '2px solid #FF0000';
        }

        const { loyaltyConfig, offers, themeConfig } = this.props.loyaltyConfigs;
        const backgroundColor = themeConfig.benefitsConfig.backgroundColor;
        const [ topImgHeight, membershipHeight, inputsHeight, btnHeight ] = themeConfig.signupConfig.signupSectionHeights || [0.25, 0.2, 0.4, 0.08];

        return (
            <View style={{...custom.root, backgroundColor }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ height: topImgHeight*H, paddingTop: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={themeConfig.signupConfig.topImg} style={{ marginTop: 0, objectFit: 'cover', maxHeight: '100%', maxWidth: '100%' }} />
                    </div>

                    <div style={{ height: membershipHeight*H, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ marginBottom: 10, transform: 'scale(2)' }}>{textWithGoldGradient('GOLD')}</div>
                        {spacer(10)}
                        <div style={{ marginBottom: 10, marginLeft: 20, transform: 'scale(2)' }}>{textWithGoldGradient('MEMBERSHIP')}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                  width: '100%', height: inputsHeight*H, color: themeConfig.signupConfig.textColor }}>
                        <div style={custom.namePhoneDetails.nameBox}>Your Name</div>
                        <input style={nameStyle} type="text" value={name} maxLength="10" onChange={(ev) => this.handleChange('name', ev)} />
                        <div style={custom.namePhoneDetails.nameBox}>Mobile #</div>
                        <input style={phoneStyle} type="number" value={phone} onChange={(ev) => this.handleChange('phone', ev)} />
                        <div style={custom.namePhoneDetails.subtext}>You will receive an OTP, enter it on the next page</div>
                    </div>

                    <TouchableAnim onPress={() => this.submitFn(name, phone)}
                                   style={{ height: btnHeight*H, width: '60%', maxWidth: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                            background: gradientBackground, color: themeConfig.signupConfig.textColor }}>
                        <div style={custom.imInterested}>SUBMIT</div>
                    </TouchableAnim>
                </div>
            </View>
        );
    }
}

export class OtpVerificationScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            otp: '',
        };
    }
    componentDidMount() {
    }

    handleChange = (ev) => {
        if (ev.target.value.length > 6) {
            return;
        }
        this.setState({ otp: ev.target.value });
    };
    submitFn = (otp) => {
        if (otp && otp.length === 6) {
            this.props.submitFn(otp);
        }
    };

    render() {
        const { name, phone } = this.props;
        const { otp } = this.state;

        const otpStyle = {...custom.namePhoneDetails.input, letterSpacing: 2};
        if (otp && otp.length >= 1 && otp.length !== 6) {
            otpStyle.border = '2px solid #FF0000';
        }

        const { loyaltyConfig, offers, themeConfig } = this.props.loyaltyConfigs;
        const backgroundColor = themeConfig.benefitsConfig.backgroundColor;
        const [ topImgHeight, membershipHeight, inputsHeight, btnHeight, requestAgainHeight ] = themeConfig.signupConfig.otpSectionHeights || [0.25, 0.2, 0.3, 0.08, 0.1];
        return (
            <View style={{...custom.root, backgroundColor }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ height: topImgHeight*H, paddingTop: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={themeConfig.signupConfig.topImg} style={{ marginTop: 0, objectFit: 'cover', maxHeight: '100%', maxWidth: '100%' }} />
                    </div>

                    <div style={{ height: membershipHeight*H, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ marginBottom: 10, transform: 'scale(2)' }}>{textWithGoldGradient('GOLD')}</div>
                        {spacer(10)}
                        <div style={{ marginBottom: 10, marginLeft: 20, transform: 'scale(2)' }}>{textWithGoldGradient('MEMBERSHIP')}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                  width: '100%', height: inputsHeight*H, color: themeConfig.signupConfig.textColor }}>
                        <div style={custom.namePhoneDetails.nameBox}>Hi {name}</div>
                        <div style={custom.namePhoneDetails.nameBox}>Enter the OTP received on {phone}</div>
                        <input style={otpStyle} type="number" value={otp} onChange={(ev) => this.handleChange(ev)} />
                    </div>

                    <TouchableAnim onPress={() => this.submitFn(otp)}
                                   style={{ height: btnHeight*H, width: '60%', maxWidth: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                            background: gradientBackground }}>
                        <div style={custom.imInterested}>SUBMIT</div>
                    </TouchableAnim>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                  width: '100%', height: requestAgainHeight*H, color: themeConfig.signupConfig.textColor }}>
                        <div style={custom.otpDetails.subtext}>Didn't receive OTP</div>
                        <div style={{...custom.otpDetails.subtext, marginTop: 5, fontSize: 15, textDecoration: 'underline'}}>
                            <TouchableAnim onPress={this.props.requestAgainFn}>
                                REQUEST AGAIN
                            </TouchableAnim>
                        </div>
                    </div>
                </div>
            </View>
        );
    }
}

export class NotificationScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { yesFn, noFn } = this.props;
        const { loyaltyConfig, offers, themeConfig } = this.props.configs;
        return (
            <div style={{ ...custom.confirmDialog.div, background: themeConfig.notificationConfig.backgroundColor }}>
                <h1 style={{ ...custom.confirmDialog.h1, color: themeConfig.notificationConfig.textColor }}>
                    {textWithGoldGradient('KEEP UPGRADING')}
                </h1>
                <p style={custom.confirmDialog.p}>Allow notifications to know when you're ready for the next milestone and latest offers.</p>
                <button style={custom.confirmDialog.button} onClick={yesFn}>ALLOW</button>
                <button style={custom.confirmDialog.button} onClick={noFn}>BLOCK</button>
            </div>
        );
    }
}

export class GuestListStatusPopup extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { text, okFn, status, configs } = this.props;
        const { loyaltyConfig, offers, themeConfig } = configs;

        let tnc = [];
        switch (status) {
            case GUEST_LIST_STATUS_CONFIRMED:
                tnc = themeConfig.guestListConfig.free.tnc;
                break;
            case GUEST_LIST_STATUS_WAITLIST:
                tnc = themeConfig.guestListConfig.waitlist.tnc;
                break;
            case GUEST_LIST_STATUS_FULL:
            case GUEST_LIST_STATUS_CLOSED:
            case GUEST_LIST_STATUS_FAILURE:
            default:
                break;
        }

        return (
            <div style={{ ...custom.guestListPopup.div, background: themeConfig.notificationConfig.backgroundColor }}>
                <h1 style={{ ...custom.guestListPopup.h1, color: themeConfig.notificationConfig.textColor }}>
                    {text}
                </h1>

                <p style={{ ...custom.guestListPopup.p, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    Terms and conditions:
                    <ul style={{ textAlign: 'start' }}>
                        {tnc.map(x => <li>{x}</li>)}
                    </ul>
                </p>
                <button style={custom.guestListPopup.button} onClick={okFn}>OK</button>
            </div>
        );
    }
}


const BG_COLOR = "#0A2040";
const COLOR_1 = "#C08A32";
const COLOR_2 = "#F2ECA0";
const COLOR_3 = "#C08A32";
const gradientBackground = `linear-gradient(to right, ${COLOR_1}, ${COLOR_2}, ${COLOR_3})`;

// const IMG = 'https://images-lb.heloprotocol.in/byg.png-56694-572721-1570178484728.png';
const IMG = 'https://images-lb.heloprotocol.in/bygGold.png-263793-860239-1570179823980.png';
const custom = {
    root: {
        height: WINDOW_INNER_HEIGHT,
        overflowY: 'scroll',
        overflowX: 'hidden',
        width: '100%',
        fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
        fontWeight: '300',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
    imInterested: {
        fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
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

    memberPage: {
        welcome: {
            fontFamily: 'Georgia',
            fontSize: 16,
            letterSpacing: '0.64px',
            textAlign: 'center',
        },
        name: {
            fontFamily: 'Georgia-Bold',
        },
        points: {
            marginTop: 5,
            marginBottom: 5,
            fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
            fontSize: 14,
            letterSpacing: '0.56px',
            textAlign: 'center',
        },
        pointsNeeded: {
            opacity: 0.8,
            fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
            fontSize: 12,
            letterSpacing: '0.48px',
            textAlign: 'center',
            marginBottom: 5,
            width: '80%',
        },
        box: {
            fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
            fontSize: 14,
            fontWeight: '400',
            color: '#001E42',
            letterSpacing: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            height: 60,
            width: '100%',
            marginBottom: 10,
            border: '0.3px solid',
            borderColor: '#bebebe',
            userSelect: 'none', MozUserSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none',
        },
        platinumMembersOnly: {
            opacity: 0.7,
            fontFamily: 'Helvetica',
            fontSize: 10,
            color: '#001E42',
            letterSpacing: 0,
            textAlign: 'center',
        },
    },
    gold: {
        box: {
            background: 'linear-gradient(270deg, #C08A32 0%, #F2ECA0 48%, #C08A32 100%)',
        },
        stripedBoxOverride: {
            background: 'repeating-linear-gradient(315deg, #C08A3220, #C08A3220 2px, #F2ECA020 4px, #F2ECA020 6px), #F2ECA0',
        },
    },
    silver: {
        box: {
            background: 'linear-gradient(270deg, #B5B5B5 0%, #F9F9F9 48%, #B5B5B5 100%)',
        },
        stripedBoxOverride: {
            background: 'repeating-linear-gradient(315deg, #B5B5B520, #B5B5B520 2px, #F9F9F920 4px, #F9F9F920 6px), #F9F9F9',
        },
    },

    offerModal: {
        root: {
            fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
            fontWeight: '300',
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
        },
    },

    namePhoneDetails: {
        nameBox: {
            fontFamily: 'Georgia-Bold',
            fontSize: 16,
            letterSpacing: 0.64,
            textAlign: 'center',
            marginTop: 10,
            marginBottom: 10,
        },
        input: {
            fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
            paddingLeft: 2,
            letterSpacing: 1,
            fontSize: 18,
            width: '60%',
            maxWidth: 400,
            height: 40,
            marginBottom: 20,
            outline: 'none',
            border: `2px solid ${COLOR_1}`,
            textAlign: 'center',
        },
        subtext: {
            fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
            fontSize: 13,
            opacity: 0.62,
            letterSpacing: 0.64,
            textAlign: 'center',
        },
    },
    otpDetails: {
        subtext: {
            fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
            fontSize: 13,
            opacity: 0.62,
            letterSpacing: 0.64,
            textAlign: 'center',
        },
    },
    confirmDialog: {
        div: {
            fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
            textAlign: 'center',
            width: 450,
            maxWidth: WINDOW_INNER_WIDTH * 0.8,
            padding: 40,
            background: BG_COLOR,
            boxShadow: '0 20px 75px rgba(0, 0, 0, 0.23)',
            color: '#fff',
        },
        h1: {
            marginTop: 0,
            color: COLOR_2,
            marginLeft: 70,
            transform: 'scale(2)',
        },
        p: {
            opacity: 0.8,
            fontSize: 14,
            color: '#FFFFFF',
            letterSpacing: '0.48px',
            textAlign: 'center',
            marginBottom: 20,
        },
        button: {
            width: 140,
            height: 40,
            padding: 10,
            border: `0.3px solid rgb(190, 190, 190)`,
            margin: 10,
            cursor: 'pointer',
            background: gradientBackground,
            color: '#001e42',
            fontSize: 14,
        },
    },

    guestListPopup: {
        div: {
            fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
            textAlign: 'center',
            width: 450,
            maxWidth: WINDOW_INNER_WIDTH * 0.8,
            padding: 40,
            background: BG_COLOR,
            boxShadow: '0 20px 75px rgba(0, 0, 0, 0.23)',
            color: '#fff',
        },
        h1: {
            marginTop: 0,
            fontSize: 24,
            color: COLOR_2,
        },
        p: {
            opacity: 0.8,
            fontSize: 14,
            color: '#FFFFFF',
            letterSpacing: '0.48px',
            textAlign: 'center',
            marginBottom: 20,
        },
        button: {
            width: 140,
            height: 40,
            padding: 10,
            border: `0.3px solid rgb(190, 190, 190)`,
            margin: 10,
            cursor: 'pointer',
            background: gradientBackground,
            color: '#001e42',
            fontSize: 14,
        },
    },
};

const textWithGradient = (text, fontWeight, letterSpacing, gradientColors) => {
    fontWeight = fontWeight || 'normal';
    letterSpacing = letterSpacing || 0.64;
    const width = text.length * 13;

    const key = 'linearGradient' + hashCode(text + fontWeight + letterSpacing + gradientColors);
    console.log('key === ', key);
    return (
        <svg key={key} width={`${width}px`} height="13px" style={{ border: '0px solid #FFF' }} viewBox={`0 0 ${width} 13`} version="1.1" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient x1="100%" y1="52.3308368%" x2="-8.56341019%" y2="47.6691632%" id={key}>
                    <stop stopColor={gradientColors[0]} offset="0%" />
                    <stop stopColor={gradientColors[1]} offset="48.4955659%" />
                    <stop stopColor={gradientColors[2]} offset="100%" />
                </linearGradient>
            </defs>
            <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" fontFamily="Georgia" fontSize="16" fontWeight={fontWeight} letterSpacing={letterSpacing}>
                <g id="user-landing-gold" transform="translate(-136.000000, -51.000000)" fill={`url(#${key})`}>
                    <text>
                        <tspan x="136.16625" y="63">{text}</tspan>
                    </text>
                </g>
            </g>
        </svg>
    );
};
const textWithGoldGradient = (text, fontWeight, letterSpacing) => {
    return textWithGradient(text, fontWeight, letterSpacing, ["#F2ECA0", "#C08A32", "#F2ECA0"]);
};

const modalStyle = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
    }
};


const H = WINDOW_INNER_HEIGHT;
const W = WINDOW_INNER_WIDTH;
console.log('window_innerHeight, window_innerWidth: ', H, W);
