import React, {Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {actionButton, getCtx, getKeysWhereValueIs, spacer} from "../../../util/Util";
import {TEAL_COLOR_THEME} from "../../../styles/common";
import SuperRoot from "../../../widgets/SuperRoot";
import OptionPickerWidget from "../../../widgets/OptionPickerWidget";
import xrange from "xrange";
import window from "global/window";
import {ALL_JOB_CATEGORIES} from "../../../constants/Constants";


class RequirementsScreen extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.jobs = {};
        this.fromHr = {};
    }

    onSubmit = () => {
        const jobs = getKeysWhereValueIs(this.jobs, true);
        const fromHr = getKeysWhereValueIs(this.fromHr, true);
        if (jobs.length === 0) {
            window.alert('Select atleast 1 job you can do');
            return;
        }
        if (fromHr.length === 0) {
            window.alert('Choose the time you can work');
            return;
        }

        const workingHours = fromHr.map(x => parseInt(x)).map(x => ({ fromHr: x }));
        this.props.onSubmitFn({ jobs, workingHours });
    };

    setFn = (x) => (key, val) => {
        this[x][key] = val;
    };


    render() {
        const {classes} = this.props;

        const HOURS = xrange(5, 22).toArray();
        const hourDisplayFn = (x) => {
            if (x >= 13) {
                return (x-12) + ' PM';
            }
            return x + ' AM';
        };

        return (
            <Fragment>
                <SuperRoot>
                    <div className={classes.root}>
                        <span className={classes.title}>Register with us</span>

                        <div className={classes.ctr}>
                            <OptionPickerWidget heading={'What all can you do ?'} optionList={ALL_JOB_CATEGORIES} initialSelected={[]}
                                                toggleFn={this.setFn('jobs')} displayFn={(x) => x} />
                        </div>

                        <div className={classes.ctr}>
                            <OptionPickerWidget heading={'What time can you work ?'} optionList={HOURS}
                                                initialSelected={[]} toggleFn={this.setFn('fromHr')} displayFn={hourDisplayFn} />
                        </div>
                    </div>

                    <div className={classes.signupCtr}>
                        {actionButton('DONE', this.onSubmit)}
                    </div>
                    {spacer(20)}
                </SuperRoot>
            </Fragment>
        );
    }
}

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
        width: '80%',
    },
    signupCtr: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
});
export default withStyles(styles)(RequirementsScreen);
