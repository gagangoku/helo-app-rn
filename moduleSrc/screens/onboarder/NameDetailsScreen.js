import React from 'react';
import {withStyles} from '../../platform/Util';
import {actionButton, capitalizeEachWord, getCtx, getKeysWhereValueIs, spacer} from "../../util/Util";
import {commonStyle, TEAL_COLOR_THEME} from "../../styles/common";
import SuperRoot from "../../widgets/SuperRoot";
import window from 'global/window';
import classnames from 'classnames';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import OptionPickerWidget from "../../widgets/OptionPickerWidget";
import {
    ALL_JOB_CATEGORIES,
    DESCRIPTOR_SUPPLY,
    LANGUAGES,
    STATES,
    TRANSPORT_MODES,
    WORK_OPTIONS
} from "../../constants/Constants";
import xrange from "xrange";
import {crudsSearch} from "../../util/Api";


class NameDetailsScreen extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.state = {
            name: '',
            phoneNumber: '',
            whatsappNumber: '',
            age: '',
            experience: '',
            gender: '',

            nativeCity: '',
            nativeState: '',
        };
        this.workTypes = {};
        this.lookingForCategories = {};
        this.languages = {};
        this.freeTimes = {};
        this.transportMode = {};
    }

    onSubmit = async () => {
        const workTypes = getKeysWhereValueIs(this.workTypes, true);
        const lookingForCategories = getKeysWhereValueIs(this.lookingForCategories, true);
        const languages = getKeysWhereValueIs(this.languages, true);
        const freeTimes = getKeysWhereValueIs(this.freeTimes, true);
        const transportMode = getKeysWhereValueIs(this.transportMode, true);
        const { age, experience, ...x } = this.state;

        // Checks
        if (!this.state.name) {
            window.alert('Name is mandatory');
            return;
        }
        if (!this.state.phoneNumber || this.state.phoneNumber.length !== 10) {
            window.alert('10 digit phone number is mandatory');
            return;
        }
        if (!this.state.age) {
            window.alert('Age is mandatory');
            return;
        }
        if (!this.state.experience) {
            window.alert('Enter experience');
            return;
        }
        if (!this.state.nativeCity) {
            window.alert('Native city is mandatory');
            return;
        }
        if (!this.state.nativeState) {
            window.alert('nativeState is mandatory');
            return;
        }
        if (!this.state.gender) {
            window.alert('Gender is mandatory');
            return;
        }

        if (workTypes.length === 0) {
            window.alert('Choose atleast one work option');
            return;
        }
        if (lookingForCategories.length === 0) {
            window.alert('Choose atleast one job category');
            return;
        }
        if (languages.length === 0) {
            window.alert('Choose atleast 1 language');
            return;
        }
        if (freeTimes.length === 0) {
            window.alert('Select atleast one free slot');
            return;
        }
        if (transportMode.length === 0) {
            window.alert('Select atleast one transport mode');
            return;
        }

        // Check if phone number exists already
        const supplySearch = await crudsSearch(DESCRIPTOR_SUPPLY, { phoneNumber: this.state.phoneNumber });
        if (supplySearch && supplySearch.length > 0) {
            window.alert('Phone number already exists');
            return;
        }

        const obj = {...x, age: parseInt(age), experience: parseInt(experience),
                     workTypes, lookingForCategories, languages, workingHours: freeTimes, transportMode};
        obj.dateOfBirth = (new Date().getFullYear() - parseInt(this.state.age)) + '-01-01';

        await this.props.submitFn(obj);
    };

    onChange = (field) => (elem) => {
        const val = elem.target.value;
        if ((field === 'phoneNumber') && val.length > 10) {
        } else {
            this.setState({ [field]: val });
        }
    };

    setFn = (x) => (key, val) => {
        this[x][key] = val;
    };

    displayHr = (hour) => {
        if (hour <= 12) {
            return hour + ' AM';
        } else {
            return (hour - 12) + ' PM';
        }
    };

    render() {
        const {classes} = this.props;
        const letterSpacingClass = (val) => {
            const a = [classes.formInput];
            if (val) {
                a.push(classes.letterSpacing);
            }
            return classnames(a);
        };

        return (
            <SuperRoot>
                <div className={classes.root}>
                    <div className={classes.title}>Person Details</div>
                    <div className={classes.desc}>
                    </div>

                    <form autoComplete="off">
                        <input style={{ display: 'none'}} type="text" name="fakeusernameremembered"/>
                        <input style={{ display: 'none'}} type="password" name="fakepasswordremembered"/>

                        <div className={classes.formContainer}>
                            <div className={classes.formInputContainer}>
                                <input placeholder=" Person name" className={classes.formInput} type={'string'}
                                       value={this.state.name} onChange={this.onChange('name')} autoComplete="off" />
                            </div>

                            <div className={classes.formInputContainer}>
                                <input placeholder=" Phone number" className={letterSpacingClass(this.state.phoneNumber)} type={'number'}
                                       value={this.state.phoneNumber} onChange={this.onChange('phoneNumber')} autoComplete="false" />
                            </div>

                            <div className={classes.formInputContainer}>
                                <input placeholder=" Whatsapp number (leave blank if same or NA)" className={letterSpacingClass(this.state.whatsappNumber)} type={'number'}
                                       value={this.state.whatsappNumber} onChange={this.onChange('whatsappNumber')} autoComplete="false" />
                            </div>

                            <div className={classes.formInputContainer}>
                                <input placeholder=" Age" className={letterSpacingClass(this.state.age)} type={'number'}
                                       value={this.state.age} onChange={this.onChange('age')} autoComplete="off" />
                            </div>

                            <div className={classes.formInputContainer}>
                                <input placeholder=" Experience" className={letterSpacingClass(this.state.experience)} type={'number'}
                                       value={this.state.experience} onChange={this.onChange('experience')} autoComplete="off" />
                            </div>


                            <div className={classes.formInputContainer}>
                                <input placeholder=" Native city" className={classes.formInput} type={'string'}
                                       value={this.state.nativeCity} onChange={this.onChange('nativeCity')} autoComplete="off" />
                            </div>

                            <div className={classes.formInputContainer2}>
                                <FormControl className={classes.formControl} style={{ marginRight: 20 }}>
                                    <InputLabel>Native state</InputLabel>
                                    <Select value={this.state.nativeState} onChange={this.onChange('nativeState')}>
                                        {STATES.sort().map(x => <MenuItem value={x} key={x}>{x}</MenuItem>)}
                                    </Select>
                                </FormControl>

                                <FormControl className={classes.formControl} style={{ marginRight: 20 }}>
                                    <InputLabel>Gender</InputLabel>
                                    <Select value={this.state.gender} onChange={this.onChange('gender')}>
                                        <MenuItem value="MALE" key="MALE">MALE</MenuItem>
                                        <MenuItem value="FEMALE" key="FEMALE">FEMALE</MenuItem>
                                        <MenuItem value="OTHER" key="OTHER">OTHER</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            {spacer(10)}


                            <div className={classes.ctr}>
                                <OptionPickerWidget heading={'Work options - choose multiple'} optionList={WORK_OPTIONS}
                                                    toggleFn={this.setFn('workTypes')} displayFn={(x) => capitalizeEachWord(x)} />
                            </div>

                            <div className={classes.ctr}>
                                <OptionPickerWidget heading={'What languages does person know ?'} optionList={LANGUAGES}
                                                    toggleFn={this.setFn('languages')} displayFn={(x) => capitalizeEachWord(x)} />
                            </div>

                            <div className={classes.ctr}>
                                <OptionPickerWidget heading={'What all can she do ?'} optionList={ALL_JOB_CATEGORIES}
                                                    toggleFn={this.setFn('lookingForCategories')} displayFn={(x) => capitalizeEachWord(x)} />
                            </div>

                            <div className={classes.ctr}>
                                <OptionPickerWidget heading={'Free times'} optionList={FREE_TIMES}
                                                    toggleFn={this.setFn('freeTimes')} displayFn={this.displayHr} />
                            </div>

                            <div className={classes.ctr}>
                                <OptionPickerWidget heading={'Transport modes'} optionList={TRANSPORT_MODES}
                                                    toggleFn={this.setFn('transportMode')} displayFn={(x) => capitalizeEachWord(x)} />
                            </div>
                        </div>
                    </form>

                    {spacer(30)}
                    <div style={commonStyle.actionBtnContainerForCenter}>
                        {actionButton('DONE', this.onSubmit)}
                    </div>
                    {spacer(30)}
                </div>
            </SuperRoot>
        );
    }
}

const FREE_TIMES = xrange(5, 24).toArray();
const styles = theme => ({
    root: {
        textAlign: 'center',
        verticalAlign: 'middle',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
        textAlign: 'center',
        lineHeight: 1.5,
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    formInputContainer: {
        marginBottom: 10,
    },
    formInputContainer2: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        flexWrap: 'wrap',
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
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
    letterSpacing: {
        letterSpacing: 2,
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

    formControl: {
        width: 150,
    },
    ctr: {
        marginTop: 20,
    },

});
export default withStyles(styles)(NameDetailsScreen);
