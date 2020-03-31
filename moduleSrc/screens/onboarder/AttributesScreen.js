import React, {Fragment} from 'react';
import {withStyles} from '../../platform/Util';
import {actionButton, capitalizeEachWord, getCtx, getKeysWhereValueIs, spacer} from "../../util/Util";
import {commonStyle, TEAL_COLOR_THEME} from "../../styles/common";
import SuperRoot from "../../widgets/SuperRoot";
import window from 'global/window';
import OptionPickerWidget from "../../widgets/OptionPickerWidget";
import {getJobAttributes} from "../../util/Api";
import {IS_MOBILE_SCREEN, PARTNER_CARE_HELPLINE, VEG_NON_VEG, VEG_ONLY} from "../../constants/Constants";
import cnsole from 'loglevel';


class AttributesScreen extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.state = {
            allAttribs: null,
            displayFns: null,
        };
        this.attributes = {};
        this.numResidents = {};
        this.meals = {};
        this.veg = {};
    }

    async componentDidMount() {
        try {
            const response = await getJobAttributes();
            cnsole.log('getJobAttributes response: ', response);

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

            this.setState({ allAttribs, displayFns });
        } catch (e) {
            cnsole.log('Exception in getting job attributes: ', e);
            window.alert('Something went wrong. Please try again after some time or call our customer care: ' + PARTNER_CARE_HELPLINE);
        }
    }

    onSubmit = async () => {
        const jobCategories = this.props.jobCategories;
        const isCook = jobCategories.includes('COOK');

        const veg = getKeysWhereValueIs(this.veg, true);

        if (isCook && veg.length === 0) {
            window.alert('Please select your vegetarian / non-vegetarian preference');
            return;
        }

        const attributes = [];
        for (let i = 0; i < jobCategories.length; i++) {
            const category = jobCategories[i];
            const catAttribs = getKeysWhereValueIs(this.attributes[category], true);

            if (catAttribs.length === 0) {
                window.alert('Choose atleast one quality for ' + category);
                return;
            }

            const c = catAttribs.map(x => ({
                'category': category,
                'id': x,
            }));
            c.forEach(y => {
                attributes.push(y);
            })
        }

        const obj = { attributes };
        if (isCook) {
            obj.veg = veg[0];
        }
        await this.props.submitFn(obj);
    };

    setAttributesFn = (x) => (key, val) => {
        this.attributes[x][key] = val;
    };
    setFn = (x) => (key, val) => {
        this[x][key] = val;
    };


    render() {
        const {classes} = this.props;
        if (!this.state.allAttribs) {
            return (<div>Loading ...</div>);
        }

        const jobCategories = this.props.jobCategories;
        const cookOptions = !jobCategories.includes('COOK') ? <div/> : (
            <Fragment>
                <div className={classes.ctr}>
                    <OptionPickerWidget heading={'Vegetarian / Non vegetarian ?'} optionList={VEG_OPTIONS} singleSelection={true}
                                        toggleFn={this.setFn('veg')} displayFn={(x) => capitalizeEachWord(x)} />
                </div>
            </Fragment>
        );

        return (
            <SuperRoot>
                <div className={classes.root}>
                    <div className={classes.title}>Job attributes</div>
                    <div className={classes.desc}>
                    </div>

                    {cookOptions}
                    {spacer(10)}

                    <div className={classes.formContainer}>
                        {jobCategories.map(x => {
                            return (
                                <div className={classes.ctr} key={'' + x}>
                                    <OptionPickerWidget heading={this.props.headingFn(x)} optionList={this.state.allAttribs[x]}
                                                        toggleFn={this.setAttributesFn(x)} displayFn={(y) => this.state.displayFns[x][y]} />
                                </div>
                            );
                        })}
                    </div>
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

const VEG_OPTIONS = [VEG_ONLY, VEG_NON_VEG];
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
        width: IS_MOBILE_SCREEN ? '90%' : '60%',
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
        width: IS_MOBILE_SCREEN ? '90%' : '60%',
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
export default withStyles(styles)(AttributesScreen);
