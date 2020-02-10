import React, {Fragment} from 'react';
import {withStyles} from '../../platform/Util';
import {actionButton, getCtx, getKeysWhereValueIs, spacer} from "../../util/Util";
import {commonStyle, TEAL_COLOR_THEME} from "../../styles/common";
import SuperRoot from "../../widgets/SuperRoot";
import OptionPickerWidget from "../../widgets/OptionPickerWidget";
import window from "global/window";
import {CATEGORY_COOK, IS_MOBILE_SCREEN, WORK_LOC_TYPE_HOME} from "../../constants/Constants";


class ExpectationsScreen extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.qualities = {};
        this.state = {
            numMaids2Years: '',
            numStaff: '',
            numOpenings: '',
        };
    }

    onSubmit = () => {
        const qualities = getKeysWhereValueIs(this.qualities, true);
        const { numMaids2Years } = this.state;
        const numOpenings = parseInt(this.state.numOpenings);
        const numStaff = parseInt(this.state.numStaff);
        const { workLocType, lookingForCategories } = this.contextObj;

        const req = { qualities, numMaids2Years };
        if (qualities.length === 0) {
            window.alert('Select what matters most to you');
            return;
        }
        if (qualities.length > MAX_QUALITIES) {
            window.alert('Select at most ' + MAX_QUALITIES + ' qualities only');
            return;
        }
        if (workLocType !== WORK_LOC_TYPE_HOME) {
            if (isNaN(numOpenings) || numOpenings <= 0) {
                window.alert('Please specify the number of openings');
                return;
            }
            if (numOpenings > 1000) {
                window.alert('Thats a lot of openings. Please enter less than 1000');
                return;
            }

            if (isNaN(numStaff) || numStaff <= 0) {
                window.alert('Please specify how much staff you employ at your place. This helps us understand the churn');
                return;
            }

            req.numOpenings = numOpenings;
            req.numStaff = numStaff;
        }

        console.log('ExpectationsScreen req: ', req);
        this.props.onSubmitFn(req);
    };

    onChange = (field) => (elem) => {
        const val = elem.target.value;
        this.setState({ [field]: val });
    };

    setFn = (x) => (key, val) => {
        this[x][key] = val;
    };


    render() {
        const {classes} = this.props;
        const { workLocType, lookingForCategories } = this.contextObj;

        const numOpeningsSection = workLocType === WORK_LOC_TYPE_HOME ? '' : (
            <div className={classes.formInputContainer}>
                <div className={classes.formInputHeader}>How many people are you looking to hire ?</div>
                <input placeholder=" Your answer" className={classes.formInput} type={'number'}
                       value={this.state.numOpenings} onChange={this.onChange('numOpenings')} />
            </div>
        );
        const numStaffSection = workLocType === WORK_LOC_TYPE_HOME ? '' : (
            <div className={classes.formInputContainer}>
                <div className={classes.formInputHeader}>How much staff do you employ at your place ?</div>
                <input placeholder=" Your answer" className={classes.formInput} type={'number'}
                       value={this.state.numStaff} onChange={this.onChange('numStaff')} />
            </div>
        );
        const maidsSection = workLocType === WORK_LOC_TYPE_HOME && lookingForCategories[0] !== CATEGORY_COOK ? (
            <div className={classes.formInputContainer}>
                <div className={classes.formInputHeader}>How many maids / nannies have you changed in the last 2 years ?</div>
                <div className={classes.formInputSubHeader}>
                    This is optional. We ask only to get a better sense of maids in your area.
                    <br/>
                    Sometimes workers coming from far off are better suited because they won't indulge in gossip.
                </div>
                <input placeholder=" Your answer" className={classes.formInput}
                       value={this.state.numMaids2Years} onChange={this.onChange('numMaids2Years')} />
            </div>
        ) : '';

        return (
            <Fragment>
                <SuperRoot>
                    <div className={classes.root}>
                        <span className={classes.title}>Tell us your preferences</span>

                        <div className={classes.ctr}>
                            <OptionPickerWidget heading={'What are the ' + MAX_QUALITIES + ' most important things you look for in a worker'}
                                                subHeading={'(Select at most ' + MAX_QUALITIES + ')'}
                                                optionList={Object.keys(IMPORTANT_QUALITIES).sort()} initialSelected={[]}
                                                toggleFn={this.setFn('qualities')} displayFn={(x) => IMPORTANT_QUALITIES[x]} />
                        </div>

                        {maidsSection}
                        {numOpeningsSection}
                        {numStaffSection}
                    </div>

                    {spacer(20)}
                    <div style={commonStyle.actionBtnContainerForCenter}>
                        {actionButton('DONE', this.onSubmit)}
                    </div>
                    {spacer(20)}
                </SuperRoot>
            </Fragment>
        );
    }
}

// Key -> display
const IMPORTANT_QUALITIES = {
    'PRESENTABLE': 'Is presentable',
    'WORK_QUALITY': 'Good quality work',
    'PUNCTUALITY': 'Punctuality',
    'LEARNS_OVER_TIME': 'Learns the work over time',
    'WELL_BEHAVED': 'Behaves well',
    'DOESNT_REFUSE_EXTRA_WORK': 'Doesn\'t refuse occasional extra work',
    'REGULAR': 'Doesn\'t take unannounced leaves',
    'RESPONSIBLE': 'Takes responsibility',
    'INFORMS_BEFORE_TAKING_LEAVE': 'Informs before taking leave',
    'TRUSTWORTHY': 'Trustworthy / Honest',
    'BUDGET_FRIENDLY': 'Budget friendly',
};
const MAX_QUALITIES = 3;
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
        marginBottom: 20,
        width: IS_MOBILE_SCREEN ? '90%' : '80%',
    },
    formInputContainer: {
        marginBottom: 30,
        width: IS_MOBILE_SCREEN ? '90%' : '80%',
    },
    formInput: {
        width: '90%',
        fontSize: 17,
        height: 40,
        paddingLeft: 10,
        paddingTop: 5,
        paddingBottom: 5,
        outlineWidth: 0,
    },
    formInputHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        color: 'rgb(64, 64, 64)',
    },
    formInputSubHeader: {
        fontSize: 15,
        textAlign: 'center',
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        color: 'rgb(64, 64, 64)',
    },
});
export default withStyles(styles)(ExpectationsScreen);
