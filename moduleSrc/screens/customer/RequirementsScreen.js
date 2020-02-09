import React, {Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {actionButton, capitalizeEachWord, getCtx, getKeysWhereValueIs, spacer} from "../../util/Util";
import {commonStyle, TEAL_COLOR_THEME} from "../../styles/common";
import SuperRoot from "../../widgets/SuperRoot";
import OptionPickerWidget from "../../widgets/OptionPickerWidget";
import {TEXT_COLOR} from '../../widgets/MultiSelectionWidget';
import window from "global/window";
import {
    BREAKFAST,
    BUDGET_MIN_PER_HOUR,
    CATEGORY_COOK,
    CATEGORY_MAID,
    CATEGORY_NANNY,
    cookingMins,
    CUSTOMER_CARE_HELPLINE,
    DINNER,
    GENDER_EITHER,
    GENDER_FEMALE,
    GENDER_MALE,
    IS_MOBILE_SCREEN,
    LANGUAGES,
    LUNCH,
    RESTAURANT_JOB_CATEGORIES,
    RESTAURANT_SKILLS,
    VEG_NON_VEG,
    VEG_ONLY,
    WORK_LOC_TYPE_HOME,
    WORK_LOC_TYPE_OFFICE,
    WORK_LOC_TYPE_PG,
    WORK_LOC_TYPE_RESTAURANT,
    WORK_OPTION_FULL_TIME,
    WORK_OPTION_LIVE_IN,
    WORK_OPTION_PART_TIME,
    WORK_OPTIONS
} from "../../constants/Constants";
import {MuiPickersUtilsProvider, TimePicker} from 'material-ui-pickers';
import LuxonUtils from '@date-io/luxon';
import {DateTime} from 'luxon';
import assert from 'assert';
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Select from "@material-ui/core/Select/Select";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import {OPTION_NO, OPTION_YES} from "../../chat/Questions";
import {getJobAttributes} from "../../util/Api";


class RequirementsScreen extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);

        this.bhk = {};
        this.languages = {};
        this.workOptions = {};
        this.lookingForCategories = {};
        this.genderPreference = {};
        this.workLocType = {};
        this.accomodationProvided = {};
        this.numResidents = {};
        this.meals = {};
        this.veg = {};
        this.attributes = {};
        this.restaurantSkills = {};

        this.allAttribs = null;
        this.displayFns = null;
        this.state = {
            renderCount: 0,
            fetched: false,

            fromHr: 11,
            fromMins: 1,
            numHours: '',
            addedComments: '',
            budget: '',
            addedPerks: '',
        };
    }

    async componentDidMount() {
        if (this.contextObj.hideGenderPref) {
            (this.setFn('genderPreference'))(GENDER_EITHER, true);
        }
        if (this.contextObj.hideCategorySelection) {
            assert(this.contextObj.category, 'Atleast one category should be selected if hide category selection is true');
            (this.setFn('lookingForCategories'))(this.contextObj.category, true);
        }

        try {
            const response = await getJobAttributes();
            console.log('getJobAttributes response: ', response);

            const allAttribs = {};
            response.attributes.forEach(x => {
                allAttribs[x.category] = [];
                this.attributes[x.category] = {};
            });

            const displayFns = {};
            Object.keys(allAttribs).forEach(x => {
                displayFns[x] = {};
            });

            response.attributes.forEach(x => {
                allAttribs[x.category].push(x.id);
                displayFns[x.category][x.id] = x.displayName ||  capitalizeEachWord(x.id);
            });

            this.allAttribs = allAttribs;
            this.displayFns = displayFns;

            this.setState({ fetched: true });
        } catch (e) {
            console.log('Exception in getting job attributes: ', e);
            window.alert('Something went wrong. Please try again after some time or call our customer care: ' + CUSTOMER_CARE_HELPLINE);
        }
    }

    onSubmit = () => {
        const workLocType = getKeysWhereValueIs(this.workLocType, true);
        const bhk = getKeysWhereValueIs(this.bhk, true);
        const languages = getKeysWhereValueIs(this.languages, true);
        const workOptions = getKeysWhereValueIs(this.workOptions, true);
        const lookingForCategories = getKeysWhereValueIs(this.lookingForCategories, true);
        const genderPreference = getKeysWhereValueIs(this.genderPreference, true);
        const accomodationProvided = getKeysWhereValueIs(this.accomodationProvided, true);
        const numResidents = getKeysWhereValueIs(this.numResidents, true);
        const meals = getKeysWhereValueIs(this.meals, true);
        const veg = getKeysWhereValueIs(this.veg, true);
        const restaurantSkills = getKeysWhereValueIs(this.restaurantSkills, true);
        const addedPerks = this.state.addedPerks || '';
        const budget = this.state.budget || '';
        const addedComments = this.state.addedComments || '';

        const addedReq = {};
        if (workLocType.length === 0) {
            window.alert('Choose at least of Home / Restaurant / PG');
            return;
        }
        if (lookingForCategories.length === 0) {
            window.alert('Choose at least one job category');
            return;
        }
        const attributes = getKeysWhereValueIs(this.attributes[lookingForCategories[0]], true);
        if (attributes.length === 0) {
            window.alert('Choose at least one quality');
            return;
        }
        if (languages.length === 0) {
            window.alert('Choose atleast 1 language');
            return;
        }

        if (genderPreference.length === 0) {
            window.alert('Choose at least one option for gender preference');
            return;
        }
        if (!budget) {
            window.alert('Budget is mandatory');
            return;
        }
        if (isNaN(parseInt(budget))) {
            window.alert('Budget should be a meaningful number');
            return;
        }
        const { minBudget } = this.computeBudget();
        if (minBudget && parseInt(budget) < 0.5 * minBudget) {
            window.alert('Your budget is too low and unreasonable, please increase it to be meaningful');
            return;
        }

        const isHome = workLocType[0] === WORK_LOC_TYPE_HOME;
        const isRestaurant = workLocType[0] === WORK_LOC_TYPE_RESTAURANT;
        const isPg = workLocType[0] === WORK_LOC_TYPE_PG;
        const isCook = lookingForCategories.includes(CATEGORY_COOK);

        if (isRestaurant && isCook) {
            if (restaurantSkills.length === 0) {
                window.alert('Choose the role in restaurant');
                return;
            }
            addedReq.restaurantSkills = restaurantSkills;
        }
        if (isHome) {
            if (bhk.length === 0) {
                window.alert('Select your home size');
                return;
            }
            if (workOptions.length === 0) {
                window.alert('Choose the type of work');
                return;
            }
            addedReq.bhk = bhk[0];
            addedReq.workTypes = workOptions;
        }
        if (isHome && isCook) {
            if (numResidents.length === 0) {
                window.alert('Choose the number of residents');
                return;
            }
            if (meals.length === 0) {
                window.alert('Choose the number of meals');
                return;
            }
            if (veg.length === 0) {
                window.alert('Please select whether veg or not');
                return;
            }

            addedReq.numResidents = parseInt(numResidents[0]);
            addedReq.veg = veg[0];
            addedReq.breakfast = meals.includes(BREAKFAST);
            addedReq.lunch = meals.includes(LUNCH);
            addedReq.dinner = meals.includes(DINNER);
        }
        if (isRestaurant || isPg) {
            if (accomodationProvided.length === 0) {
                window.alert('Please select whether you provide accomodation or not');
                return;
            }
            addedReq.accomodationProvided = accomodationProvided[0] === OPTION_YES;
        }
        if (isPg || isRestaurant || (isHome && !isCook)) {
            if (isNaN(parseInt(this.state.numHours))) {
                window.alert('Please select how many hours you need them for');
                return;
            }
        }

        const { fromHr, fromMins } = this.state;
        const nH = parseInt(this.state.numHours);
        const mins = fromHr*60 + fromMins + (isNaN(nH) ? 0 : nH * 60);
        const toHr = Math.floor(mins / 60);
        const toMins = mins - toHr*60;
        const workingHours = isHome && isCook ? [{
            fromHr,
            fromMins,
        }] : [{
            fromHr,
            fromMins,
            toHr,
            toMins,
        }];

        const req = {
            languages, workingHours, lookingForCategories,
            genderPreference: genderPreference[0], workLocType: workLocType[0],
            attributes: attributes.map(id => ({ category: lookingForCategories[0], id })),
            addedPerks, budget, addedComments,
            ...addedReq,
        };
        console.log('RequirementsScreen req: ', req);
        this.props.onSubmitFn(req);
    };

    setFn = (x) => (key, val) => {
        this[x][key] = val;
        this.setState({ renderCount: this.state.renderCount + 1 });
    };
    setAttributesFn = (x) => (key, val) => {
        this.attributes[x][key] = val;
    };

    getWorkOptionsToolTip = () => {
        const workOptions = getKeysWhereValueIs(this.workOptions, true);
        if (workOptions.length === 0) {
            return '';
        }
        if (workOptions.includes(WORK_OPTION_PART_TIME)) {
            return '* couple of hours (2 - 5) hours';
        }
        if (workOptions.includes(WORK_OPTION_FULL_TIME)) {
            return '* 8 - 12 hours';
        }
        if (workOptions.includes(WORK_OPTION_LIVE_IN)) {
            return '* Living with you';
        }
        return 'BAD';
    };

    computeBudget = () => {
        const categoriesSelected = getKeysWhereValueIs(this.lookingForCategories, true);
        const workLocType = getKeysWhereValueIs(this.workLocType, true);
        const numResidents = getKeysWhereValueIs(this.numResidents, true);
        const meals = getKeysWhereValueIs(this.meals, true);
        const cat = categoriesSelected.length > 0 && categoriesSelected[0];

        if (workLocType.length === 0 || categoriesSelected.length === 0 || workLocType[0] !== WORK_LOC_TYPE_HOME) {
            return {};
        }
        if (cat !== CATEGORY_COOK && !this.state.numHours) {
            return {};
        }
        if (cat === CATEGORY_COOK && (meals.length === 0 || numResidents.length === 0)) {
            return {};
        }

        const breakfast = meals.includes(BREAKFAST);
        const lunch = meals.includes(LUNCH);
        const dinner = meals.includes(DINNER);
        const minutes = cat !== CATEGORY_COOK ? parseInt(this.state.numHours) * 60 : cookingMins(breakfast, lunch, dinner, parseInt(numResidents[0]));
        const hours = minutes / 60;
        const minRate = BUDGET_MIN_PER_HOUR[cat];
        const lambda = Math.max(1.1, 2 - (hours-1)/8);
        const minBudget = Math.round(minRate * hours);
        const maxBudget = Math.min(minBudget + minRate, Math.round(minBudget * lambda));
        return { minBudget, maxBudget, minutes };
    };

    roughChargesSection = () => {
        const { minBudget, maxBudget, minutes } = this.computeBudget();
        console.log('minBudget, maxBudget, minutes: ', minBudget, maxBudget, minutes);
        if (!minBudget || !maxBudget || !minutes) {
            return '';
        }

        return (
            <Fragment>
                Roughly <b>{minutes}</b> minutes of work.
                <br/>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <div>Approx Rs. <b>{minBudget}</b> to <b>{maxBudget}</b> *</div>
                    <div style={{ fontSize: 13 }}>(depends on your area / person's exp / skills etc., negotiable)</div>
                </div>
            </Fragment>
        );
    };

    shiftTimes = (numHoursArray) => {
        const {classes} = this.props;
        const workLocType = getKeysWhereValueIs(this.workLocType, true);
        const categoriesSelected = getKeysWhereValueIs(this.lookingForCategories, true);

        if (workLocType.length === 0) {
            return '';
        }

        const isHome = workLocType[0] === WORK_LOC_TYPE_HOME;
        const isCook = categoriesSelected.length > 0 && categoriesSelected[0] === CATEGORY_COOK;

        const numHoursSection = !isHome || !isCook ? (
            <FormControl className={classes.formControl} style={{ marginRight: 20 }}>
                <InputLabel>Num hours</InputLabel>
                <Select value={this.state.numHours} onChange={(elem) => this.setState({ numHours: elem.target.value })}>
                    {numHoursArray.map(x => <MenuItem value={x} key={x}>{x}</MenuItem>)}
                </Select>
            </FormControl>
        ) : '';

        return (
            <Fragment key="shiftTimes">
                <MuiPickersUtilsProvider utils={LuxonUtils} key={'picker-0'}>
                    <div className={classes.heading}>What times do you want them to come regularly ?</div>
                    <div className={classes.subheading} />
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <TimePicker margin="normal" label="From time"
                                    value={DateTime.local(2019, 4, 1, this.state.fromHr, this.state.fromMins)}
                                    onChange={(date) => this.setState({ fromHr: date.hour, fromMins: date.minute })} />

                        {spacer(0, 20)}
                        {numHoursSection}
                    </div>
                </MuiPickersUtilsProvider>

                <div style={{ fontSize: 16, marginTop: 5, marginBottom: 20 }}>
                    {this.roughChargesSection()}
                </div>
            </Fragment>
        );
    };

    getOptions = () => {
        const {classes} = this.props;
        const workLocType = getKeysWhereValueIs(this.workLocType, true);
        const workOptionsSelected = getKeysWhereValueIs(this.workOptions, true);
        const categoriesSelected = getKeysWhereValueIs(this.lookingForCategories, true);

        const lookingForCategories = this.contextObj.hideCategorySelection ? '' : (
            <div className={classes.ctr} key="lookingForCategories">
                <OptionPickerWidget heading={'What kind of person are you looking for ?'} optionList={CATEGORIES[workLocType[0]]} singleSelection={true}
                                    initialSelected={this.contextObj.category ? [this.contextObj.category] : []}
                                    toggleFn={this.setFn('lookingForCategories')} displayFn={(x) => capitalizeEachWord(x)} />
            </div>
        );
        const genderPreference = this.contextObj.hideGenderPref ? '' : (
            <div className={classes.ctr} key="genderPreference">
                <OptionPickerWidget heading={'Whats your gender preference ?'} optionList={GENDERS} singleSelection={true}
                                    toggleFn={this.setFn('genderPreference')} displayFn={(x) => GENDERS_DISPLAY[x]} />
            </div>
        );
        const bhk = (
            <div className={classes.ctr} key="bhk">
                <OptionPickerWidget heading={'Describe your house'} optionList={BHK} initialSelected={[]}
                                    toggleFn={this.setFn('bhk')} displayFn={bhkDisplayFn} singleSelection={true} />
            </div>
        );
        const languages = (
            <div className={classes.ctr} key="languages">
                <OptionPickerWidget heading={'What languages do you speak ?'}
                                    optionList={LANGUAGES}
                                    initialSelected={[]} toggleFn={this.setFn('languages')} displayFn={(x) => capitalizeEachWord(x)} />
            </div>
        );
        const workOptions = (
            <div className={classes.ctr} key="workOptions">
                <OptionPickerWidget heading={'What kind of work are you looking for ?'}
                                    optionList={WORK_OPTIONS}
                                    initialSelected={[WORK_OPTION_PART_TIME]} toggleFn={this.setFn('workOptions')} singleSelection={true}
                                    displayFn={(x) => capitalizeEachWord(x)} />
                <div style={{ fontSize: 15, color: '#585858' }}>
                    {this.getWorkOptionsToolTip()}
                </div>
            </div>
        );
        const accomodationProvided = (
            <div className={classes.ctr} key="accomodationProvided">
                <OptionPickerWidget heading={'Do you provide accomodation ?'}
                                    optionList={[OPTION_YES, OPTION_NO]}
                                    initialSelected={[]} toggleFn={this.setFn('accomodationProvided')} singleSelection={true}
                                    displayFn={(x) => capitalizeEachWord(x)} />
            </div>
        );
        const addedComments = (
            <div className={classes.ctr} key="addedComments">
                <textarea rows={4} value={this.state.addedComments} placeholder=" Additional requirements / comments"
                          className={classes.formTextarea} onChange={(addedComments) => this.setState({ addedComments: addedComments.target.value })} />
            </div>
        );
        const shiftTimes = workOptionsSelected.length > 0 && workOptionsSelected[0] === WORK_OPTION_LIVE_IN ? '' : this.shiftTimes(NUM_HOURS);
        const budget = (
            <div className={classes.ctr} key="budget">
                <div className={classes.heading}>What monthly salary are you offering ?</div>
                <div className={classes.subheading}>Be reasonable. Too less and no worker will agree (see the rough estimate above)</div>
                <input placeholder=" Your monthly budget" className={classes.formTextarea} style={{ width: 200 }} type={'number'}
                       value={this.state.budget} onChange={(budget) => this.setState({ budget: budget.target.value })} />
            </div>
        );
        const addedPerks = (
            <div className={classes.ctr} key="addedPerks">
                <textarea rows={4} value={this.state.addedPerks} placeholder=" What additional Perks do you offer"
                          className={classes.formTextarea} onChange={(addedPerks) => this.setState({ addedPerks: addedPerks.target.value })} />
            </div>
        );
        const numResidents = (
            <div className={classes.ctr} key="numResidents">
                <OptionPickerWidget heading={'How many residents are you ?'} optionList={NUM_RESIDENTS} singleSelection={true}
                                    toggleFn={this.setFn('numResidents')} displayFn={(x) => capitalizeEachWord(x)} />
            </div>
        );
        const meals = categoriesSelected.length > 0 && categoriesSelected[0] === CATEGORY_COOK ? (
            <div className={classes.ctr} key="meals">
                <OptionPickerWidget heading={'What meals do you want cooked ?'} optionList={MEALS}
                                    toggleFn={this.setFn('meals')} displayFn={(x) => capitalizeEachWord(x)} />
            </div>
        ) : '';
        const veg = categoriesSelected.length > 0 && categoriesSelected[0] === CATEGORY_COOK ? (
            <div className={classes.ctr} key="veg">
                <OptionPickerWidget heading={'Vegetarian / Non vegetarian ?'} optionList={VEG_OPTIONS} singleSelection={true}
                                    toggleFn={this.setFn('veg')} displayFn={(x) => capitalizeEachWord(x)} />
            </div>
        ) : '';
        const attributes = categoriesSelected.map(x => {
            return (
                <div className={classes.ctr} key={'' + x}>
                    <OptionPickerWidget heading={'What qualities are you looking for in ' + x} optionList={this.allAttribs[x]}
                                        toggleFn={this.setAttributesFn(x)} displayFn={(y) => this.displayFns[x][y]} />
                </div>
            );
        });
        const restaurantSkills = categoriesSelected.length > 0 && categoriesSelected[0] === CATEGORY_COOK ? (
            <div className={classes.ctr} key={'restaurantSkills'}>
                <OptionPickerWidget heading={'What kind of cook ?'} optionList={RESTAURANT_SKILLS}
                                    toggleFn={this.setFn('restaurantSkills')} displayFn={(x) => capitalizeEachWord(x)} />
            </div>
        ) : '';

        return {
            lookingForCategories,
            genderPreference,
            bhk,
            languages,
            workOptions,
            accomodationProvided,
            shiftTimes,
            budget,
            addedPerks,
            addedComments,
            numResidents,
            meals,
            veg,
            attributes,
            restaurantSkills,
        };
    };


    render() {
        const {classes} = this.props;
        if (!this.state.fetched) {
            return <div />;
        }

        const workLocType = getKeysWhereValueIs(this.workLocType, true);
        const optionsDict = this.getOptions();
        const questionsToAsk = workLocType.length > 0 ? QUESTIONS[workLocType[0]] : QUESTIONS[WORK_LOC_TYPE_RESTAURANT];

        return (
            <Fragment>
                <SuperRoot>
                    <div className={classes.root}>
                        <span className={classes.title}>Book A Maid / Cook / Nanny / Attendant</span>

                        <div className={classes.ctr}>
                            <OptionPickerWidget heading={'Is this for your home or an establishment ?'} optionList={WORK_LOC_TYPES} initialSelected={[]}
                                                toggleFn={this.setFn('workLocType')} displayFn={null} singleSelection={true} />
                        </div>

                        {workLocType.length > 0 ? questionsToAsk.map(x => optionsDict[x]) : ''}
                    </div>

                    <div style={commonStyle.actionBtnContainerForCenter}>
                        {actionButton('DONE', this.onSubmit)}
                    </div>
                    {spacer(20)}
                </SuperRoot>
            </Fragment>
        );
    }
}

const BHK = [1, 2, 3, 4, 6];
const bhkDisplayFn = (x) => {
    if (x >= 5) {
        return '5+ BHK';
    }
    return x + ' BHK';
};

const QUESTIONS = {
    [WORK_LOC_TYPE_HOME]: [
        'lookingForCategories',
        'attributes',
        'bhk',
        'numResidents',
        'languages',
        'genderPreference',
        'veg',
        'meals',
        'workOptions',
        'shiftTimes',
        'budget',
        'addedComments',
    ],
    [WORK_LOC_TYPE_RESTAURANT]: [
        'lookingForCategories',
        'attributes',
        'restaurantSkills',
        'languages',
        'accomodationProvided',
        'genderPreference',
        'shiftTimes',
        'budget',
        'addedPerks',
        'addedComments',
    ],
    [WORK_LOC_TYPE_PG]: [
        'lookingForCategories',
        'attributes',
        'languages',
        'accomodationProvided',
        'genderPreference',
        'shiftTimes',
        'budget',
        'addedComments',
    ],
    [WORK_LOC_TYPE_OFFICE]: [
        'lookingForCategories',
        'attributes',
        'languages',
        'genderPreference',
        'shiftTimes',
        'budget',
        'addedComments',
    ],
};
const CATEGORIES = {
    [WORK_LOC_TYPE_HOME]: [CATEGORY_COOK, CATEGORY_NANNY, CATEGORY_MAID],
    [WORK_LOC_TYPE_RESTAURANT]: RESTAURANT_JOB_CATEGORIES,
    [WORK_LOC_TYPE_PG]: [CATEGORY_COOK, CATEGORY_MAID],
    [WORK_LOC_TYPE_OFFICE]: [CATEGORY_COOK],
};

const NUM_HOURS = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
];
const WORK_LOC_TYPES = [
    WORK_LOC_TYPE_HOME,
    WORK_LOC_TYPE_RESTAURANT,
    WORK_LOC_TYPE_PG,
];
const VEG_OPTIONS = [VEG_ONLY, VEG_NON_VEG];
const NUM_RESIDENTS = ['1', '2', '3', '4', '5', '6', '7+'];
const MEALS = [BREAKFAST, LUNCH, DINNER];

const GENDERS = [GENDER_FEMALE, GENDER_MALE, GENDER_EITHER];
const GENDERS_DISPLAY = {
    [GENDER_MALE]: 'Male',
    [GENDER_FEMALE]: 'Female',
    [GENDER_EITHER]: 'Either is fine',
};
const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        verticalAlign: 'middle',
        alignItems: 'center',
    },
    title: {
        color: TEAL_COLOR_THEME,
        fontSize: 30,
        marginTop: 30,
        marginBottom: 30,
    },

    ctr: {
        marginBottom: 40,
        width: IS_MOBILE_SCREEN ? '90%' : '60%',
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        color: TEXT_COLOR,
        textAlign: 'center',
        marginBottom: 2,
    },
    subheading: {
        fontSize: 14,
        fontWeight: '600',
        color: TEXT_COLOR,
        textAlign: 'center',
        marginBottom: 10,
    },
    formControl: {
        width: 100,
        marginTop: 16,
        marginBottom: 8,
    },
    formTextarea: {
        width: '80%',
        fontSize: 17,
        paddingLeft: 10,
        paddingTop: 5,
        paddingBottom: 5,
        outlineWidth: 0,
        lineHeight: 1.5,
    },
});
export default withStyles(styles)(RequirementsScreen);
