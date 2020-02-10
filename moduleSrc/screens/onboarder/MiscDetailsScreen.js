import React from 'react';
import {withStyles} from '../../platform/Util';
import {actionButton, getCtx, spacer} from "../../util/Util";
import {commonStyle, TEAL_COLOR_THEME} from "../../styles/common";
import SuperRoot from "../../widgets/SuperRoot";


class MiscDetailsScreen extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.state = {
            publicNotes: '',
            privateNotes: '',
            educationDetails: '',
            familyDetails: '',
            healthDetails: '',
        };
    }

    onSubmit = () => {
        this.props.submitFn({ ...this.state });
    };

    onChange = (field) => (elem) => {
        const val = elem.target.value;
        this.setState({ [field]: val });
    };

    render() {
        const {classes} = this.props;
        return (
            <SuperRoot>
                <div className={classes.root}>
                    <div className={classes.title}>Misc details</div>
                    <div className={classes.desc}>
                    </div>

                    <div className={classes.formContainer}>
                        <div className={classes.formInputContainer}>
                            <textarea rows={4} value={this.state.publicNotes} placeholder=" In his own words"
                                      className={classes.formTextarea} onChange={this.onChange('publicNotes')} autoComplete="off" />
                        </div>
                    </div>

                    <div className={classes.formContainer}>
                        <div className={classes.formInputContainer}>
                            <textarea rows={4} value={this.state.privateNotes} placeholder=" Private notes"
                                      className={classes.formTextarea} onChange={this.onChange('privateNotes')} autoComplete="off" />
                        </div>
                    </div>

                    <div className={classes.formContainer}>
                        <div className={classes.formInputContainer}>
                            <textarea rows={4} value={this.state.educationDetails} placeholder=" Education details"
                                      className={classes.formTextarea} onChange={this.onChange('educationDetails')} autoComplete="off" />
                        </div>
                    </div>

                    <div className={classes.formContainer}>
                        <div className={classes.formInputContainer}>
                            <textarea rows={4} value={this.state.familyDetails} placeholder=" Family details"
                                      className={classes.formTextarea} onChange={this.onChange('familyDetails')} autoComplete="off" />
                        </div>
                    </div>

                    <div className={classes.formContainer}>
                        <div className={classes.formInputContainer}>
                            <textarea rows={4} value={this.state.healthDetails} placeholder=" Health details"
                                      className={classes.formTextarea} onChange={this.onChange('healthDetails')} autoComplete="off" />
                        </div>
                    </div>


                    {spacer(20)}
                    <div style={commonStyle.actionBtnContainerForCenter}>
                        {actionButton('DONE', this.onSubmit)}
                    </div>
                    {spacer(30)}
                </div>
            </SuperRoot>
        );
    }
}

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
export default withStyles(styles)(MiscDetailsScreen);
