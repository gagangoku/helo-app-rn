import React, {Fragment} from 'react';
import {
    actionButton,
    ageFn,
    amPm,
    capitalizeEachWord,
    capitalizeFirstLetter,
    differenceFn,
    getCtx,
    getImageUrl,
    Image,
    navigateTo,
    spacer,
    View,
} from "../../util/Util";
import xrange from 'xrange';
import {TEXT_COLOR_LIGHT} from "../../styles/common";
import {
    CATEGORY_COOK,
    cookingCharges,
    FACEBOOK_APP_ID,
    GOOGLE_MAPS_API_KEY,
    INNER_HEIGHT,
    IS_MOBILE_SCREEN
} from "../../constants/Constants";
import Slider from "react-slick/lib";
import {Helmet, WINDOW_INNER_WIDTH} from "../../platform/Util";
import StarRatingComponent from 'react-star-rating-component';
import Header from "../../widgets/Header";
import SimilarProfilesWidget from "./SimilarProfilesWidget";
import format from "string-format";
import lodash from 'lodash';
import {Comments, FacebookProvider} from "react-facebook";
import window from 'global/window';
import MobileDetect from "mobile-detect";
import Footer from "../../widgets/Footer";
import {HOME_PAGE_URLS} from "../../controller/Urls";
import TouchableAnim from "../../platform/TouchableAnim";
import cnsole from 'loglevel';


export default class SupplyProfileWidget extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.supplyProfile = this.props.supplyProfile;
        this.recommendations = this.props.recommendations;
        this.similarProfiles = this.props.similarProfiles;
        this.state = {
            activeRecommendationSlide: 0,
            activeVideoSlide: 0,
        };
    }

    normalizeEnumForDisplay = (str) => {
        return capitalizeFirstLetter(str.toLowerCase().trim().replace(/_/g, " "));
    };

    recommendationSection() {
        const settings = {
            dots: true,
            infinite: false,
            speed: 100,
            slidesToShow: IS_MOBILE_SCREEN ? 1 : 2,
            slidesToScroll: 1,
            afterChange: current => this.setState({ activeRecommendationSlide: current }),
        };

        // TODO: Move styles to custom
        const items = this.recommendations.map(x => {
            const goodQualities = x.goodQualities || [];
            return (
                <View key={x.customerName}>
                    <View style={custom.recoCtr}>
                        <View style={{ marginBottom: 10, display: 'flex', flexDirection: 'row' }}>
                            <View style={{ fontSize: 20, fontWeight: 'bold', paddingTop: 5, marginRight: 20 }}>{x.customerName}</View>
                            <StarRatingComponent
                                name="rate1" editing={false}
                                starCount={x.rating}
                                renderStarIcon={() => <span style={{ fontSize: 20, marginRight: 3, color: '#D4AF37' }}>★</span>}
                                value={x.rating}
                            />
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', marginBottom: 10, fontSize: 15 }}>
                            <View>
                                Known for {x.numYearsWorked} years,
                            </View>
                            <View style={{ marginLeft: 5 }}>
                                {x.durationHours} hour work
                            </View>
                        </View>
                        <View style={{ fontSize: 15, marginBottom: 10, color: TEXT_COLOR_LIGHT }}>
                            {goodQualities.map(x => this.normalizeEnumForDisplay(x)).join(', ')}
                        </View>
                        <View style={{ fontSize: 16, fontWeight: '200' }}>{x.recommendation}</View>
                    </View>
                </View>
            );
        });

        return (
            <View style={{ width: '90%', paddingLeft: '5%', paddingRight: '5%' }}>
                <View style={{ marginTop: 0 }}>
                    <Slider {...settings}>
                        {items}
                    </Slider>
                </View>
            </View>
        );
    }

    audioElem = (audioUrl) => {
        return (
            <View key={audioUrl}>
                <audio controls autoPlay="true">
                    <source src={audioUrl} />
                    Your browser does not support the audio tag.
                </audio>
            </View>
        );
    };
    videoElem = (width, videoUrl) => {
        return (
            <View key={videoUrl}>
                <View style={{ marginRight: 20 }}>
                    <iframe width={width + 'px'} height={0.75 * width + 'px'} src={videoUrl} />
                </View>
            </View>
        );
    };

    videosSection() {
        const settings = {
            dots: true,
            infinite: false,
            speed: 100,
            slidesToShow: IS_MOBILE_SCREEN ? 1 : 2,
            slidesToScroll: 1,
            afterChange: current => this.setState({ activeVideoSlide: current }),
        };

        const w = 0.7 * INNER_WIDTH / settings.slidesToShow;
        const videos = (this.supplyProfile.social && this.supplyProfile.social.youtubeLinks) || [];
        const items = videos.map(x => this.videoElem(w, x));

        return (
            <View style={{ width: '90%', paddingLeft: '5%', paddingRight: '5%' }}>
                <View style={{ marginTop: 0 }}>
                    <Slider {...settings}>
                        {items}
                    </Slider>
                </View>
            </View>
        );
    }

    photosSection() {
        const settings = {
            dots: true,
            infinite: false,
            speed: 100,
            slidesToShow: IS_MOBILE_SCREEN ? 1 : 4,
            slidesToScroll: 1,
            afterChange: current => this.setState({ activeVideoSlide: current }),
        };

        const w = 0.7 * INNER_WIDTH / settings.slidesToShow;
        const photos = (this.supplyProfile.social && this.supplyProfile.social.images) || [];
        const items = photos.map(x => (
            <View key={x}>
                <View style={{ marginRight: 20 }}>
                    <TouchableAnim onPress={() => navigateTo(this, HOME_PAGE_URLS.fullImage.replace(':id', x), this.contextObj, {})}>
                        <Image source={getImageUrl(x)} style={{ width: w, height: w }} />
                    </TouchableAnim>
                </View>
            </View>
        ));

        return (
            <View style={{ width: '90%', paddingLeft: '5%', paddingRight: '5%' }}>
                <View style={{ marginTop: 0 }}>
                    <Slider {...settings}>
                        {items}
                    </Slider>
                </View>
            </View>
        );
    }

    freeTimes = (hours) => {
        if (hours.length === 0) {
            return '';
        }
        hours = lodash.uniq(hours).sort(differenceFn);
        cnsole.log('hours: ', hours);

        const array = [];
        let prev = -1;
        let start = -1;
        for (let i = 0; i < hours.length; i++) {
            const h = parseInt(hours[i]);
            if (i === 0) {
                start = h;
            } else if (h === (prev + 1)) {
                // Continuation. Nothing to do
            } else {
                // Break
                array.push(amPm(start) + ' - ' + amPm(prev + 1));
                start = h;
            }
            prev = h;
        }
        array.push(amPm(start) + ' - ' + amPm(prev + 1));
        return array;
    };

    callSupply = (supply) => {
        if (this.props.inAppCallBtn === 'true') {
            cnsole.log('postMessage CALL');
            window.postMessage("CALL");
            return;
        }

        const md = new MobileDetect(navigator.userAgent);
        const mdMobile = md.mobile();
        const os = md.os() || '';
        const isAndroid = os.toLowerCase().includes('android');
        const isIphone = md.is('iPhone');
        const takeToApp = isAndroid || isIphone;
        cnsole.log('md: ', md, mdMobile, os, takeToApp);

        if (takeToApp) {
            window.location.href = 'https://heloprotocol.app.link/KdSBTEWBTU?supplyId=' + supply.person.id;   // Goto playstore / appstore / open app
        } else {
            window.alert('Please install the Helo app on your phone to call people');
        }
    };

    cleaningEtcCharges = () => {
        const chargesVector = [
            ['1', 2000, 3000, '-'],
            ['2', 4000, 5000, 6000],
            ['3', 6000, 7000, 8000],
            ['4 - 6', 10000, 12000, '13000+'],
            ['6+', '14000+', '15000+', '16000+'],
        ];
        const charges = (idx) => {
            const r = chargesVector[idx];
            return (
                <tr key={idx} style={custom.tr}>
                    {xrange(0, 4).toArray().map(x => (<td key={x} style={custom.td}>{r[x]}</td>))}
                </tr>
            );
        };

        return (
            <table style={custom.table}>
                <thead style={custom.thead}>
                <tr style={custom.tr}>
                    <th style={custom.th}>No. of hours</th>
                    <th style={custom.th}>Cleaning</th>
                    <th style={custom.th}>Cleaning, Cooking</th>
                    <th style={custom.th}>Cleaning, Cooking, Nanny</th>
                </tr>
                </thead>
                <tbody style={custom.tbody}>
                {xrange(0, 5).toArray().map(x => charges(x))}
                </tbody>
            </table>
        );
    };

    cookingCharges = (supply) => {
        const rating = supply.rating || 3;
        const multFactor = 1 + (rating - 3) / 6;
        const minCharges = Math.round(1600 * multFactor);
        const cx = (breakfast, lunch, dinner, numResidents) => Math.max(minCharges, Math.round(cookingCharges(breakfast, lunch, dinner, numResidents) * multFactor));
        const charges = (numResidents) => {
            return (
                <tr key={'' + numResidents} style={custom.tr}>
                    <td style={custom.td}><b>{numResidents}</b></td>
                    <td style={custom.td}>{cx(1, 0, 0, numResidents)}</td>
                    <td style={custom.td}>{cx(0, 1, 0, numResidents)}</td>
                    <td style={custom.td}>{cx(1, 1, 0, numResidents)}</td>
                    <td style={custom.td}>{cx(1, 1, 1, numResidents)}</td>
                </tr>
            );
        };

        return (
            <Fragment>
                <table style={custom.table}>
                    <thead style={custom.thead}>
                    <tr style={custom.tr}>
                        <th style={custom.th}># residents</th>
                        <th style={custom.th}>Breakfast</th>
                        <th style={custom.th}>Lunch / Dinner</th>
                        <th style={custom.th}>Breakfast, Lunch / Dinner</th>
                        <th style={custom.th}>Breakfast, Lunch, Dinner</th>
                    </tr>
                    </thead>
                    <tbody style={custom.tbody}>
                        {xrange(1, 5).toArray().map(numResidents => charges(numResidents))}
                        <tr key={'5+'} style={custom.tr}>
                            <td style={custom.td}><b>5+</b></td>
                            <td style={custom.td}>Check with cook</td>
                            <td style={custom.td}>Check with cook</td>
                            <td style={custom.td}>Check with cook</td>
                            <td style={custom.td}>Check with cook</td>
                        </tr>
                    </tbody>
                </table>

                <View style={{ ...custom.tableEntryRow2, fontSize: 13, color: '#000000' }}>
                    <p>The charges mentioned above are indicative and are calculated assuming that you're calling the cook <u><b>once</b></u>.</p>
                    <p>The final estimate can only be given by the cook taking into account other factors such as
                        number of visits / distance / experience / skills of the cook / time slot chosen (6 - 9 am is premium) etc.</p>
                </View>
            </Fragment>
        );
    };

    chargesSection = (supply) => {
        const categories = lodash.uniq(supply.jobAttributes.attributes.map(x => x.category));
        if (categories.length > 0 && categories[0] === CATEGORY_COOK) {
            return this.cookingCharges(supply);
        }
        return this.cleaningEtcCharges();
    };

    render() {
        const heading = (text) => {
            return (
                <View style={custom.heading}>{text}</View>
            );
        };
        const description = (text) => {
            return (
                <View style={custom.description}>{text}</View>
            );
        };

        const tableEntry = (row1, row2) => {
            if (!row1 && !row2) {
                return (<View style={custom.tableEntry}/>);
            }
            return (
                <View style={custom.tableEntry} key={row1}>
                    <View style={custom.tableEntryRow1}>{row1}</View>
                    <View style={custom.tableEntryRow2}>{row2}</View>
                </View>
            );
        };

        const thumbImageUrl = getImageUrl(this.supplyProfile['person']['thumbImage']);
        cnsole.log('thumbImageUrl:', thumbImageUrl);
        const imageId = this.supplyProfile['person']['image'];
        cnsole.log('fullImageUrl:', imageId);


        const personName = this.supplyProfile['person']['name'];
        const personId = this.supplyProfile['person']['id'];
        const cookDisplayId = this.supplyProfile['person']['presentAddress']['city'];
        const rating = parseInt(this.supplyProfile['rating'] || DEFAULT_RATING);
        const gender = this.supplyProfile['person']['gender'];

        const dateOfBirth = this.supplyProfile['person']['dateOfBirth'] || '1988-01-01';
        const ageYears = Math.round(ageFn(dateOfBirth));
        const workingSinceDate = this.supplyProfile['startedWorkingSinceDate'] || '2008-01-01';
        const experience = Math.round(ageFn(workingSinceDate));

        const aboutMeText = (this.supplyProfile.aboutMeSection && this.supplyProfile.aboutMeSection.aboutMe) || this.supplyProfile.person.metadata.notes;
        const aboutMeVideo = this.supplyProfile.aboutMeSection && this.supplyProfile.aboutMeSection.video;
        const aboutMeAudio = this.supplyProfile.aboutMeSection && this.supplyProfile.aboutMeSection.audio;

        const originCity = capitalizeEachWord(this.supplyProfile['person']['hometownAddress']['city'] || '');
        const originState = capitalizeEachWord(this.supplyProfile['person']['hometownAddress']['state'] || 'Karnataka');
        const origin = originCity + ', ' + originState;

        const jobAttributes = this.supplyProfile.jobAttributes;
        const skills = {};
        jobAttributes.attributes.forEach(x => {
            const cat = capitalizeEachWord(x.category);
            if (!(cat in skills)) {
                skills[cat] = [];
            }
            skills[cat].push(x.displayName || capitalizeEachWord(x.id));
        });
        const canWorkAs = Object.keys(skills).sort();
        const skillDivs = canWorkAs.map(x => tableEntry(x, lodash.uniq(skills[x]).join(', ')));

        const restauratSkills = (jobAttributes.cookingRequirements && jobAttributes.cookingRequirements.skills) || [];
        const restaurantSkillDivs = restauratSkills.length === 0 ? '' : tableEntry('Restaurant Positions', restauratSkills.map(x => capitalizeEachWord(x)).join(', '));

        const languagesKnown = (this.supplyProfile['person']['languages'] || ['KANNADA']).map((x) => capitalizeEachWord(x));

        let personAddress = this.supplyProfile['person']['presentAddress']['area'] + ', ' + this.supplyProfile['person']['presentAddress']['city'];

        let documentsSection = (<div/>);
        if (this.supplyProfile['person']['documents']) {
            const verifiedDocuments = this.supplyProfile['person']['documents'].map(x => {
                const type = x.type || '';
                const a = capitalizeEachWord(type);
                const b = x.metadata || '';
                const c = x.documentId;
                return this.props.hidePII ? [a + ' - ' + b, 'Will be available when you employ'] : [a + ' - ' + b, c];
            });

            documentsSection = (
                <Fragment>
                    {heading('Documents')}
                    {verifiedDocuments.map(x => tableEntry(x[0], x[1]))}
                    {tableEntry(null, null)}
                </Fragment>
            );
        }

        const starColor = rating <= 2 ? RED_START_COLOR : GOLD_STAR_COLOR;
        const freeSlots = this.supplyProfile.freeSlots && this.supplyProfile.freeSlots.hours ? this.freeTimes(this.supplyProfile.freeSlots.hours) : ['-'];

        cnsole.log('Supply location: ', this.supplyProfile.person.presentAddress.location);
        const { lat, lng } = this.supplyProfile.person.presentAddress.location;
        let latLonImg = (<div/>);
        if (lat && lng) {
            const imgUrl = format('https://maps.googleapis.com/maps/api/staticmap?center={},{}&zoom=14&size=300x300&maptype=roadmap&key={}',
                                  lat, lng, GOOGLE_MAPS_API_KEY);
            latLonImg = (
                <View style={{ display: 'flex', justifyContent: 'center'}}>
                    <View style={{ width: 300, height: 300, position: 'relative' }}>
                        <Image source={imgUrl} style={{ zIndex: 10, position: 'absolute' }} />
                        <View style={custom.mapLocationCircle} />
                    </View>
                </View>
            );
        }

        const education = ((this.supplyProfile.education && this.supplyProfile.education.notes) || '').trim();
        const family = ((this.supplyProfile.family && this.supplyProfile.family.notes) || '').trim();
        const healthDetails = ((this.supplyProfile.healthDetails && this.supplyProfile.healthDetails.notes) || '').trim();

        const educationSection = !education ? '' : (
            <Fragment>
                {heading('Education')}
                {tableEntry('Details', education)}
                {tableEntry(null, null)}
                {spacer(40)}
            </Fragment>
        );
        const familySection = !family ? '' : (
            <Fragment>
                {heading('Family')}
                {tableEntry('Details', family)}
                {tableEntry(null, null)}
                {spacer(40)}
            </Fragment>
        );
        const healthSection = !healthDetails ? '' : (
            <Fragment>
                {heading('Health')}
                {tableEntry('Details', healthDetails)}
                {tableEntry(null, null)}
                {spacer(40)}
            </Fragment>
        );
        const chargesSection = this.props.hideCharges === 'true' ? '' : (
            <Fragment>
                {heading('Charges for Home cooking - per month (approx)')}
                {this.chargesSection(this.supplyProfile)}
                {spacer(40)}
            </Fragment>
        );
        const ratingSection = rating === DEFAULT_RATING ? '' : (
            <View style={{ marginBottom: 5, display: 'flex', flexDirection: 'row' }}>
                <View style={{ fontSize: 16, paddingTop: 5, marginRight: 5 }}>Rating - {rating}</View>
                <StarRatingComponent
                    name="rate1"
                    starCount={5}
                    renderStarIcon={() => <span style={{ fontSize: 20, marginRight: 5 }}>★</span>}
                    value={rating} starColor={starColor} emptyStarColor={EMPTY_STAR_COLOR}
                    editing={false}
                />
            </View>
        );

        const callButton = this.props.disableCallBtn === 'true' ? <View/> : <View>{actionButton('CALL', () => this.callSupply(this.supplyProfile), { width: 150, height: 40 })}</View>;
        const header = this.props.showHeader === 'false' ? <View/> : <Header addedStyles={{width: '100%'}} loginFn={this.props.loginFn} logoutFn={this.props.logoutFn} />;
        const footer = this.props.showFooter === 'false' ? <View/> : <Footer />;
        const relCanonical = format('https://www.heloprotocol.in/person/{}/{}/{}', personId, encodeURIComponent(personName), encodeURIComponent(personAddress));
        const shortCanonicalUrl = format('https://www.heloprotocol.in/person/{}', personId);
        const favicon = thumbImageUrl || 'https://images-lb.heloprotocol.in/logo-focussed.png-47937-236622-1555160118812.png?name=header.png';

        return (
            <View style={custom.root}>
                <Helmet>
                    <title>{this.supplyProfile.person.name} | {canWorkAs.join(', ')} | {personAddress}</title>
                    <meta property="og:title" content={'Say Helo to ' + this.supplyProfile.person.name + ' | ' + canWorkAs.join(', ') + ' | ' + personAddress} />
                    <meta property="og:image" content={thumbImageUrl} />
                    <meta property="og:url" content={relCanonical} />
                    <meta property="og:description" content={aboutMeText + '. Install the Helo Protocol to hire.'} />


                    <link rel="stylesheet" type="text/css" charset="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
                    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
                    <link rel="canonical" href={relCanonical} />
                    <link rel="icon" href={favicon} />
                    <link rel="shortcut icon" href={favicon} />
                </Helmet>

                {header}
                <View style={custom.imgStrip}>
                    <View style={custom.imgContainer}>
                        <TouchableAnim onPress={() => navigateTo(this, HOME_PAGE_URLS.fullImage.replace(':id', imageId), this.contextObj, {})}>
                            <Image source={thumbImageUrl} style={custom.cookThumbImg} />
                        </TouchableAnim>
                    </View>
                    <View style={custom.cookNameContainer}>
                        {spacer(0.05 * INNER_HEIGHT)}
                        <View style={custom.cookNameContainer2}>
                            <View style={custom.cookName}>{personName}</View>
                            {spacer(4)}
                            <View>{capitalizeFirstLetter(gender)}, {ageYears} years old</View>
                            {spacer(4)}
                            <View>{cookDisplayId}</View>
                            {spacer(4)}

                            {ratingSection}
                            {spacer(4)}
                            {callButton}
                            {spacer(10)}
                        </View>
                    </View>

                    <View style={custom.verifiedBadgeContainer}>
                    </View>
                </View>
                {spacer(20)}

                <View style={custom.contentContainer}>
                    {heading('About ' + this.supplyProfile.person.name)}
                    {aboutMeVideo ? this.videoElem(IS_MOBILE_SCREEN ? 0.7 * INNER_WIDTH : 0.50 * INNER_WIDTH, aboutMeVideo) : ''}
                    {aboutMeAudio ? this.audioElem(aboutMeAudio) : ''}
                    {description(aboutMeText)}
                    {spacer(20)}

                    {heading('Personal Details')}
                    {tableEntry('Total Experience', experience + ' years')}
                    {tableEntry('Origin', origin)}
                    {tableEntry('Languages known', lodash.uniq(languagesKnown).join(', '))}
                    {tableEntry('Residence', personAddress)}
                    {tableEntry(null, null)}
                    {spacer(40)}

                    {heading('Skill set')}
                    {skillDivs}
                    {restaurantSkillDivs}
                    {tableEntry('Free time', freeSlots.join(', '))}
                    {tableEntry(null, null)}
                    {spacer(40)}

                    {educationSection}
                    {familySection}
                    {healthSection}

                    {heading('Recommendations')}
                    {this.recommendationSection()}
                    {spacer(50)}

                    {heading('Videos')}
                    {this.videosSection()}
                    {spacer(50)}

                    {heading('Photos')}
                    {this.photosSection()}
                    {spacer(50)}

                    {chargesSection}
                    {documentsSection}
                    {spacer(20)}

                    {heading('Location')}
                    {tableEntry('Map', latLonImg)}
                    {tableEntry(null, null)}
                </View>

                <SimilarProfilesWidget similarProfiles={this.similarProfiles} />

                <FacebookProvider appId={FACEBOOK_APP_ID}>
                    <Comments href={shortCanonicalUrl} width={parseInt(0.86 * INNER_WIDTH) + ''} />
                </FacebookProvider>

                {footer}
            </View>
        );
    }
}

const DEFAULT_RATING = 3;
const GOLD_STAR_COLOR = '#ffea0a';
const RED_START_COLOR = '#ff3500';
const EMPTY_STAR_COLOR = '#969696';

const BORDER_COLOR = '#dddddd';
const HEADING_COLOR = '#404040';
const VALUE_COLOR = '#606060';
const IMG_STRIP_COLOR = '#d2d2d2';

const INNER_WIDTH = IS_MOBILE_SCREEN ? WINDOW_INNER_WIDTH : 0.8 * WINDOW_INNER_WIDTH;
cnsole.log('INNER_WIDTH: ', INNER_WIDTH);

const custom = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        verticalAlign: 'middle',
        alignItems: 'center',

        fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },

    contentContainer: {
        width: 0.86 * INNER_WIDTH,
    },

    cookName: {
        fontSize: 25,
        marginTop: 10,
        marginBottom: 10,
    },
    heading: {
        // color: BUTTON_TEAL_COLOR,
        fontSize: 25,
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        marginBottom: 20,
    },

    tableEntry: {
        borderColor: BORDER_COLOR,
        borderStyle: 'solid',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 0,
    },
    tableEntryRow1: {
        // fontSize: 20,
        fontSize: 15,
        fontWeight: '700',
        color: HEADING_COLOR,
        paddingTop: 10,
        paddingLeft: 10,
    },
    tableEntryRow2: {
        fontSize: 15,
        fontWeight: '350',
        color: VALUE_COLOR,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
    },

    table: {
        borderCollapse: 'collapse',
        border: '1px solid',
        borderColor: BORDER_COLOR,
    },
    thead: {
        fontSize: 13,
        borderColor: BORDER_COLOR,
    },
    tbody: {
        fontSize: 15,
        borderColor: BORDER_COLOR,
    },
    th: {
        border: '1px solid',
        color: HEADING_COLOR,
        borderColor: BORDER_COLOR,
        textAlign: 'left',
        padding: 10,
    },
    tr: {
        height: 50,
    },
    td: {
        border: '1px solid',
        borderColor: BORDER_COLOR,
        color: VALUE_COLOR,
        paddingLeft: 10,
        fontWeight: '400',
        paddingRight: 5,
    },

    imgStrip: {
        display: 'flex',
        flexDirection: 'row',

        height: (IS_MOBILE_SCREEN ? 0.35 : 0.30) * INNER_HEIGHT,
        width: '100%',
        backgroundColor: IMG_STRIP_COLOR,
    },
    imgContainer: {
        width: '40%',

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cookThumbImg: {
        height: 0.2 * INNER_HEIGHT,
        width: 0.2 * INNER_HEIGHT,
    },

    cookNameContainer: {
        width: '60%',
    },
    cookNameContainer2: {
        marginTop: 10,
        marginBottom: 20,
        marginLeft: 10,
        fontSize: 16,
    },
    verifiedBadgeContainer: {},

    mapLocationStaticImg: {
        height: 300,
        width: 300,
    },
    mapLocationCircle: {
        top: 120,
        left: 120,
        height: 60,
        width: 60,
        zIndex: 20,
        position: 'absolute',
        border: '1px solid',
        // borderWidth: 1,
        borderRadius: 30,
        backgroundColor: '#0000ff61',
    },
    recoCtr: {
        marginRight: 20,
    },
};
