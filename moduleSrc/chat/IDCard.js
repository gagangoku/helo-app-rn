import React from 'react';
import {capitalizeEachWord, getCtx, getImageUrl, removeNullUndefined, spacer, View} from "../util/Util";
import {GENDER_FEMALE, GENDER_MALE} from "../constants/Constants";
import {
    OPTION_YES,
    QUESTION_AADHAR,
    QUESTION_AGE,
    QUESTION_AREA,
    QUESTION_CITY,
    QUESTION_CUISINES,
    QUESTION_CURRENT_ADDRESS,
    QUESTION_EDUCATION,
    QUESTION_EXPERIENCE,
    QUESTION_GENDER,
    QUESTION_HOMETOWN,
    QUESTION_LANGUAGES,
    QUESTION_NAME,
    QUESTION_PHONE,
    QUESTION_PROFILE_PHOTO,
    QUESTION_RESTAURANT_SKILLS,
    QUESTION_RESTAURANT_SKILLS_CONFIRM,
    QUESTION_THUMBIMAGE
} from "./Questions";
import QRCode from 'qrcode';
import {flattenSupply} from "./Logic";


export default class IDCard extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        const supply = this.props.supply || {};
        const supplyDetails = this.props.supplyDetails || {};
        this.supplyObj = {
            ...flattenSupply(supply),
            ...supplyDetails,
        };

        this.state = {
            qrCode: 'https://images-lb.heloprotocol.in/qrcode.png-500-399964-1557834059712.png',
        };
    }

    async componentDidMount() {
        if (this.supplyObj.id) {
            try {
                const opts = {
                    errorCorrectionLevel: 'H',
                    margin: 0,
                    color: {
                        light: '#B6D7ED',
                    }
                };
                const qrCode = await QRCode.toDataURL('https://www.heloprotocol.in/person/' + this.supplyObj.id + "/?source=id-card", opts);
                this.setState({ qrCode });
            } catch (e) {
                console.log('Exception in QR code: ', e);
            }
        }
    }

    display = (obj, cutoff) => {
        const str = Array.isArray(obj) ? obj.join(', ') : obj;
        const cap = capitalizeEachWord(str.toLowerCase().trim().replace(/_/g, ' '));
        return this.chop(cap, cutoff);
    };

    chop = (str, len) => {
        if (str.length > len) {
            return str.substr(0, len) + ' ...';
        }
        return str;
    };

    isRedStyleOverride = (key) => {
        const keys = Object.keys(removeNullUndefined(this.supplyObj)).map(x => x.toLowerCase());
        const k = DISPLAY_TO_KEY_OVERRIDE[key.toLowerCase()] || key;
        return keys.includes(k.toLowerCase()) ? {} : { color: 'red' };
    };

    render() {
        const FONT_SIZE_1 = 14;
        const FONT_SIZE_2 = 13;
        const func = (value, attr, valueStyle={}, attrStyle={}, divStyle={}) => (
            <View style={{ marginBottom: 6, minWidth: 100, maxWidth: 150, ...this.isRedStyleOverride(attr), ...divStyle }}>
                <View style={{ fontSize: FONT_SIZE_1, fontWeight: 300, ...valueStyle }}>{value}</View>
                <View style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, ...attrStyle }}>{attr}</View>
            </View>
        );

        const cp = { ...this.supplyObj };
        KEYS_TO_FILL_DEFAULTS.forEach(k => {
            const defValue = [QUESTION_RESTAURANT_SKILLS, QUESTION_LANGUAGES, QUESTION_CUISINES].includes(k) ? ['??????'] : '??????';
            cp[k] = cp[k] || defValue;
        });
        console.log('ID details: ', cp);

        let image = DEFAULT_IMAGE;
        if (cp[QUESTION_THUMBIMAGE] || cp[QUESTION_PROFILE_PHOTO]) {
            image = cp[QUESTION_THUMBIMAGE] ? getImageUrl(cp[QUESTION_THUMBIMAGE]) : getImageUrl(cp[QUESTION_PROFILE_PHOTO]);
        }
        const willWorkInRestaurant = cp[QUESTION_RESTAURANT_SKILLS_CONFIRM] === OPTION_YES;
        const restaurentSection = !willWorkInRestaurant ? '' : func(this.display(cp[QUESTION_RESTAURANT_SKILLS], 50), 'restaurant');

        return (
            <View style={custom.root}>
                <View style={{ display: 'flex', flexDirection: 'column', width: this.props.width || 400, border: '1px solid' }}>
                    <View style={{ height: 80, display: 'flex', flexDirection: 'row', width: '100%', borderBottom: '1px solid black', backgroundColor: '#B6D7ED' }}>
                        <View style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                            <img src="https://images-lb.heloprotocol.in/logo-Alpha.png-16578-458942-1557833871881.png"  style={{ height: 55, width: 50 }} />
                        </View>
                        <View style={{ flex: 6, display: 'flex', justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
                            <View style={{ fontSize: 16 }}>ID CARD</View>
                            <View style={{ fontSize: FONT_SIZE_2, ...this.isRedStyleOverride('area') }}>{cp[QUESTION_AREA]}, {cp[QUESTION_CITY]}</View>
                            <View style={{ fontSize: FONT_SIZE_2, ...this.isRedStyleOverride('phoneNumber') }}>Phone: {cp[QUESTION_PHONE]}</View>
                        </View>
                        <View style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                            <img src={this.state.qrCode} style={{ height: 50, width: 50 }} />
                        </View>
                    </View>

                    <View style={{ height: 270, display: 'flex', flexDirection: 'row' }}>
                        <View style={{ flex: 3, border: '0px solid', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <img src={image} style={{ height: 130, width: 130, marginTop: 10, marginBottom: 10, border: '1px solid black' }} />

                            {func(cp[QUESTION_NAME], QUESTION_NAME, { textAlign: 'center', fontSize: FONT_SIZE_2+3 }, { display: 'none' }, { marginBottom: 1 })}
                            {func('', cp[QUESTION_GENDER], { display: 'none' }, { textAlign: 'center', marginBottom: 1 })}
                            {func(cp[QUESTION_AADHAR], 'aadhar', { textAlign: 'center', fontSize: FONT_SIZE_1 }, { textAlign: 'center' })}
                        </View>
                        <View style={{ flex: 5, border: '0px solid', flexDirection: 'column' }}>
                            <View style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', height: 140, paddingTop: 20 }}>
                                {func(cp[QUESTION_AGE], 'AGE')}
                                {func(cp[QUESTION_EXPERIENCE], 'experience')}
                                {restaurentSection}
                                {func(cp[QUESTION_HOMETOWN], 'hometown')}
                                {func(this.display(cp[QUESTION_EDUCATION], 50), 'education')}
                            </View>
                            <View>
                                {func(this.display(cp[QUESTION_LANGUAGES], 50), 'languages', { fontSize: FONT_SIZE_2 })}
                                {spacer(4)}
                                {func(this.display(cp[QUESTION_CUISINES], 50), 'cuisines', { fontSize: FONT_SIZE_2 })}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

const KEYS_TO_FILL_DEFAULTS = [
    QUESTION_GENDER, QUESTION_AGE, QUESTION_EXPERIENCE, QUESTION_RESTAURANT_SKILLS,
    QUESTION_HOMETOWN, QUESTION_EDUCATION, QUESTION_CURRENT_ADDRESS,
    QUESTION_PHONE, QUESTION_NAME, QUESTION_AADHAR, QUESTION_LANGUAGES,
    QUESTION_CUISINES,
    QUESTION_AREA, QUESTION_CITY,
];

const DISPLAY_TO_KEY_OVERRIDE = {
    [GENDER_MALE.toLowerCase()]: QUESTION_GENDER,
    [GENDER_FEMALE.toLowerCase()]: QUESTION_GENDER,
    'restaurant': QUESTION_RESTAURANT_SKILLS,
    'education': QUESTION_EDUCATION,
};

const DEFAULT_IMAGE = 'https://images-lb.heloprotocol.in/questionMark.png-15650-84264-1557844970651.png';
const custom = {
    root: {
        fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",

        paddingLeft: 5,
    },
};
