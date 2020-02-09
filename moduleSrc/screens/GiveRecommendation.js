import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {actionButton, getCtx, getKeysWhereValueIs, getUrlParam, removeNullUndefined, spacer} from "../util/Util";
import {TEAL_COLOR_THEME} from "../styles/common";
import classnames from 'classnames';
import FormControl from "@material-ui/core/FormControl/FormControl";
import Select from "@material-ui/core/Select/Select";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import xrange from 'xrange';
import {giveMaidRecommendation} from "../util/Api";
import StarRatingComponent from 'react-star-rating-component';
import {Helmet} from "react-helmet";
import window from 'global/window';
import OptionPickerWidget from "../widgets/OptionPickerWidget";
import {BAD_ATTRIBUTES, GOOD_ATTRIBUTES} from "../constants/Constants";


class GiveRecommendation extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.state = {
            supplyName: getUrlParam('supplyName') || '',
            supplyPhone: getUrlParam('supplyPhone') || '',
            customerName: getUrlParam('customerName') || '',
            customerPhone: getUrlParam('customerPhone') || '',
            customerAddress: '',
            startHour: '',
            durationHours: '',
            recommendation: '',
            rating: 4,
            loading: false,
        };
        this.goodQualities = {};
        this.badHabits = {};
    }

    setFn = (x) => (key, val) => {
        this[x][key] = val;
    };

    onSubmitFn = async () => {
        if (!this.state.supplyName) {
            window.alert('Worker\'s name is mandatory');
            return;
        }
        if (!this.state.supplyPhone) {
            window.alert('Please enter a 10 digit worker\'s phone number');
            return;
        }
        if (this.state.supplyPhone.length !== 10) {
            window.alert('Incorrect phone number');
            return;
        }

        if (!this.state.customerName) {
            window.alert('Your name is mandatory');
            return;
        }
        if (!this.state.customerPhone) {
            window.alert('Your phone number is mandatory');
            return;
        }
        if (this.state.customerPhone.length !== 10) {
            window.alert('Please enter a 10 digit phone number');
            return;
        }

        if (!this.state.recommendation || this.state.recommendation.length < MIN_RECOMMENDATION_CHARS) {
            window.alert('Please enter atleast ' + MIN_RECOMMENDATION_CHARS + ' characters recommendation');
            return;
        }

        const goodQualities = getKeysWhereValueIs(this.goodQualities, true);
        const badHabits = getKeysWhereValueIs(this.badHabits, true);
        if (goodQualities.length + badHabits.length === 0) {
            window.alert('Please choose atleast 1 good or bad habits');
            return;
        }

        const obj = removeNullUndefined({...this.state, goodQualities, badHabits, address: {fullAddress: this.state.customerAddress}});
        console.log('Submitting: ', obj);

        this.setState({ loading: true });
        giveMaidRecommendation(obj, () => {
            window.alert('Thank you for submitting your recommendation');
            this.setState({ loading: false });
        }, (ex) => {
            console.log('Call failed: ', ex);
            window.alert('It seems something went wrong. Kindly try again after some time');
            this.setState({ loading: false });
        });
    };

    onChange = (field) => (elem) => {
        const val = elem.target.value;
        if ((field === 'customerPhone' || field === 'supplyPhone') && val.length > 10) {
        } else {
            this.setState({ [field]: val });
        }
    };

    render() {
        // Ask basic details like name, gender, date of birth, started working since, Hometown, Languages ...
        const {classes} = this.props;
        const array = [
            // message, field name, isNumber, isRequired
            ['Your name', 'customerName', false, true],
            ['Your number', 'customerPhone', true, true],
            ['Maid / Cook\'s name', 'supplyName', false, true],
            ['Maid / Cook\'s number', 'supplyPhone', true, true],
        ];
        const display = (o) => {
            const suffix = o < 12 ? 'AM' : 'PM';
            const hrDisplay = o < 13 ? o : o - 12;
            return hrDisplay + ' ' + suffix;
        };

        const guideline = [
            'Write a recommendation',
            '',
            'Guidelines for writing recommendations:',
            '- Cleanliness',
            '- Punctuality',
            '- Attitude',
            '- Committment to work',
            '',
            'The more details you can share the better !',
        ];

        const loadingImg = !this.state.loading ? '' : (
            <div className={classes.loadingImgCtr}>
                <img src="https://loading.io/spinners/microsoft/index.svg" className={classes.loadingImg} />
            </div>
        );
        return (
            <div className={classes.root}>
                <Helmet>
                    <title>Recommend your maid | Helo Protocol | Professional network for Blue collared Workforce in India - maids, cooks, nannies, car washers, newspaper delivery guys etc.</title>
                    <link rel="canonical" href="https://www.heloprotocol.in/supply/write-recommendation" />

                    <meta name="description"
                          content="Find and connect with the best personally vetted & background-checked blue collar workforce - be it cooks, maids, attendants, nurses etc. Areas (Indiranagar / BTM Layout / Koramangala / Marathahalli / HSR Layout / Hebbal / Cox Town / Austin town / Frazer Town / Jayanagar / JP Nagar / Bellandur / HRBR Layout / OMBR Layout …)"/>
                    <meta name="keywords"
                          content="blue collar employees, linkedin, cooks in Bangalore, maids in Bangalore, nurses in Bangalore"/>
                    <meta property="og:description"
                          content="Find and connect with the best personally vetted & background-checked blue collar workforce - be it cooks, maids, attendants, nurses etc. Areas (Indiranagar / BTM Layout / Koramangala / Marathahalli / HSR Layout / Hebbal / Cox Town / Austin town / Frazer Town / Jayanagar / JP Nagar / Bellandur / HRBR Layout / OMBR Layout …)"/>
                    <meta property="og:keywords"
                          content="blue collar employees, linkedin, cooks in Bangalore, maids in Bangalore, nurses in Bangalore"/>
                </Helmet>

                {loadingImg}
                <div className={classes.title}>Writing a recommendation</div>
                <div className={classes.desc}>
                    Thank you for taking the time out to write a recommendation for your maid / cook. We'll keep it short and simple.
                    Think of it as Zomato rating for the person.
                </div>
                <div className={classes.desc}>
                    Please know that honest recommendations go a long way in helping both your helper and you.
                    Recommendations (both good and bad) are visible on their profile after review.
                    This helps them get better jobs, and helps other know about the person before hiring them.
                </div>

                <div className={classes.formContainer}>
                    <div>
                        <StarRatingComponent
                            name="rate1"
                            starCount={5}
                            renderStarIcon={() => <span style={{ fontSize: 30, marginRight: 10 }}>★</span>}
                            value={this.state.rating}
                            onStarClick={(nextValue, prevValue, name) => this.setState({ rating: nextValue })}
                        />
                    </div>
                    {spacer()}

                    {array.map(x => {
                        const clazzes = [classes.formInput];
                        const variableName = x[1];
                        const val = this.state[variableName];
                        const isNumber = x[2];
                        const isMandatory = x[3];
                        if (isNumber) {
                            clazzes.push(val ? classes.formInputNumber : classes.formInputNumberPlaceholder);
                        }
                        if (isMandatory && (!val || (isNumber && val.length !== 10))) {
                            clazzes.push(classes.formInputError);
                        }

                        return (
                            <div className={classes.formInputContainer}>
                                <input placeholder={x[0]} className={classnames(clazzes)} type={isNumber ? 'number' : 'string'}
                                       value={val} onChange={this.onChange(variableName)} />
                            </div>
                        );
                    })}

                    <div className={classes.formInputContainer}>
                        <textarea rows={3} placeholder="Your address" className={classes.formTextarea}
                                  value={this.state.customerAddress} onChange={this.onChange('customerAddress')} />
                    </div>


                    <div style={{ display: 'flex', flexDirection: 'row', width: '80%', marginLeft: '10%', marginRight: '10%' }}>
                        <div className={classes.formInputContainer} style={{ flex: 1, marginRight: 20 }}>
                            <div>
                                <div>What time does she come at ?</div>
                                <FormControl className={classes.formControl}>
                                    <Select value={this.state.startHour} onChange={this.onChange('startHour')}>
                                        {xrange(5, 23).toArray().map(o => <MenuItem value={o} key={o}>{display(o)}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </div>
                        </div>

                        <div className={classes.formInputContainer} style={{ flex: 1 }}>
                            <div>
                                <div>How many hours does she work ?</div>
                                <FormControl className={classes.formControl}>
                                    <Select value={this.state.durationHours} onChange={this.onChange('durationHours')}>
                                        {xrange(1, 9).toArray().map(o => <MenuItem value={o} key={o}>{o + ' hours'}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.formInputContainer}>
                        <OptionPickerWidget optionList={GOOD_ATTRIBUTES} toggleFn={this.setFn('goodQualities')} heading={'What does she do well?'} />
                    </div>

                    <div className={classes.formInputContainer}>
                        <OptionPickerWidget optionList={BAD_ATTRIBUTES} toggleFn={this.setFn('badHabits')} heading={'What can she improve on?'} />
                    </div>

                    <div className={classes.formInputContainer}>
                        <textarea rows={10} placeholder={guideline.join('\n')} className={classes.formTextarea}
                                  value={this.state.recommendation} onChange={this.onChange('recommendation')} />
                    </div>
                </div>

                {spacer(30)}
                {actionButton('SUBMIT RECOMMENDATION', this.onSubmitFn, {width: 300, maxWidth: 300})}
                {spacer(30)}
            </div>
        );
    }
}

const LOADER_DIM = 50;
const MIN_RECOMMENDATION_CHARS = 20;
const styles = theme => ({
    root: {
        textAlign: 'center',
        verticalAlign: 'middle',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',

        fontFamily: '"Nunito", Arial, "Helvetica Neue", Helvetica, sans-serif',
        fontWeight: 300,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
    title: {
        fontSize: 36,
        color: TEAL_COLOR_THEME,
        marginTop: 30,
        marginBottom: 30,
    },
    desc: {
        marginBottom: 30,
        width: '80%',
        textAlign: 'left',
        lineHeight: 1.5,
    },
    descHindi: {
        fontSize: 18,
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    formInputContainer: {
        marginBottom: 20,
    },
    formInput: {
        width: '80%',
        fontSize: 17,
        height: 40,
        paddingLeft: 10,
        paddingTop: 5,
        paddingBottom: 5,
        outlineWidth: 0,
    },
    formInputError: {
        border: '1px solid #FF0000',
    },
    formInputNumber: {
        letterSpacing: '3px',
    },
    formInputNumberPlaceholder: {
        // letterSpacing: '2px',
    },
    formTextarea: {
        width: '80%',
        fontSize: 17,
        paddingLeft: 10,
        paddingTop: 5,
        paddingBottom: 5,
        outlineWidth: 0,
    },

    formControl: {
        width: 150,
    },
    noop: {
    },

    loadingImgCtr: {
        position: 'fixed',
        top: window.innerHeight / 2 - LOADER_DIM/2,
        left: window.innerWidth / 2 - LOADER_DIM/2,
    },
    loadingImg: {
        height: LOADER_DIM,
        width: LOADER_DIM,
    },
});
export default withStyles(styles)(GiveRecommendation);
