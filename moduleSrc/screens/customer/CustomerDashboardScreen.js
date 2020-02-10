import React from "react";
import {actionButton, capitalizeEachWord, findJobReq, getCtx, View} from "../../util/Util";
import {TEAL_COLOR_THEME} from "../../styles/common";
import lodash from 'lodash';
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Add from '@material-ui/icons/Add';
import PlayCircleOutline from '@material-ui/icons/PlayCircleOutline';
import Edit from '@material-ui/icons/Edit';
import Pause from '@material-ui/icons/Pause';
import Delete from '@material-ui/icons/Delete';
import {withStyles} from '../../platform/Util';
import {
    IS_MOBILE_SCREEN,
    JOB_OPENING_STATUS_CLOSED,
    JOB_OPENING_STATUS_OPEN,
    JOB_OPENING_STATUS_PAUSED
} from "../../constants/Constants";


class CustomerDashboardScreen extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            customerName: '',
            email: '',
            created: !!this.contextObj.customerProfile,

            renderCount: 0,
        };
    }

    onChange = (field) => (elem) => {
        this.setState({ [field]: elem.target.value });
    };

    summary = (jobOpening) => {
        let requirementSummary = jobOpening.attributes.map(x => x.id).join(', ');
        if (jobOpening.cookingRequirements && jobOpening.cookingRequirements.skills) {
            requirementSummary += ' ' + jobOpening.cookingRequirements.skills.join(', ');
        }
        requirementSummary = capitalizeEachWord(requirementSummary);

        return {
            workLocType: jobOpening.workLocType,
            jobReqId: jobOpening.id,
            category: lodash.uniq(jobOpening.attributes.map(x => x.category))[0],
            budget: jobOpening.budget,
            fullAddress: jobOpening.location.fullAddress,
            status: jobOpening.status,
            requirementSummary,         // TODO:
        };
    };

    onDeleteJobReqFn = async (jobReqId) => {
        await this.props.onDeleteJobReqFn(jobReqId);
        const opening = findJobReq(this.contextObj.customerProfile, jobReqId);
        if (opening) {
            opening.status = JOB_OPENING_STATUS_CLOSED;
            this.setState({ renderCount: this.state.renderCount + 1 });
        }
    };
    onPauseJobReqFn = async (jobReqId) => {
        const opening = findJobReq(this.contextObj.customerProfile, jobReqId);
        if (opening) {
            opening.status = JOB_OPENING_STATUS_PAUSED;
            await this.props.onPauseJobReqFn(opening);
            this.setState({ renderCount: this.state.renderCount + 1 });
        }
    };
    onReopenJobReqFn = async (jobReqId) => {
        const opening = findJobReq(this.contextObj.customerProfile, jobReqId);
        if (opening) {
            opening.status = JOB_OPENING_STATUS_OPEN;
            await this.props.onReopenJobReqFn(opening);
            this.setState({ renderCount: this.state.renderCount + 1 });
        }
    };

    renderDash = () => {
        const { classes } = this.props;
        const { onAddJobReqFn, onEditJobReqFn } = this.props;
        const { person, jobOpenings } = this.contextObj.customerProfile;

        return (
            <View style={custom.root}>
            <div>
                <div>
                    <View style={custom.title}>{person.name}'s Dashboard</View>
                    <View>
                        <View style={custom.dear}>{jobOpenings.length === 0 ? `Dear ${person.name}` : ''}</View>
                        <div style={custom.subtext}>{jobOpenings.length === 0 ? 'Press the + button & tell us what kind of staff you need' : ''}</div>
                    </View>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
                        <View style={custom.heading}>Job openings - {jobOpenings.length}</View>
                        <div>
                            <Tooltip title="Add a new requirement">
                                <IconButton><Add onClick={onAddJobReqFn} /></IconButton>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginLeft: '1%', marginRight: '1%' }}>
                    <table style={custom.table}>
                        <thead style={custom.thead}>
                            <tr style={custom.tr}>
                                <th style={custom.thWide}>Opening</th>
                                <th style={custom.th}>Location</th>
                                <th style={custom.th}>Status</th>
                                <th style={custom.th}>Edit</th>
                                <th style={custom.th} />
                                <th style={custom.th} />
                                <th style={custom.th} />
                            </tr>
                        </thead>

                        <tbody style={custom.tbody}>
                            {jobOpenings.map(x => {
                                const { jobReqId, workLocType, category, budget, fullAddress, status, requirementSummary } = this.summary(x);

                                const editBtn = (
                                    <Tooltip title="Edit requirement">
                                        <IconButton><Edit onClick={() => onEditJobReqFn(jobReqId)} fontSize="small" /></IconButton>
                                    </Tooltip>
                                );
                                const trashBtn = status !== JOB_OPENING_STATUS_CLOSED ? (
                                    <Tooltip title="Delete">
                                        <IconButton><Delete onClick={() => this.onDeleteJobReqFn(jobReqId)} /></IconButton>
                                    </Tooltip>
                                ) : '';
                                const pauseBtn = status === JOB_OPENING_STATUS_OPEN ? (
                                    <Tooltip title="Pause">
                                        <IconButton><Pause onClick={() => this.onPauseJobReqFn(jobReqId)} /></IconButton>
                                    </Tooltip>
                                ) : '';
                                const startBtn = status === JOB_OPENING_STATUS_PAUSED ? (
                                    <Tooltip title="Resume">
                                        <IconButton><PlayCircleOutline onClick={() => this.onReopenJobReqFn(jobReqId)} /></IconButton>
                                    </Tooltip>
                                ) : '';

                                return (
                                    <tr style={custom.tr} key={'' + jobReqId + '-' + this.state.renderCount}>
                                        <td style={custom.tdWide}>
                                            <div style={{ fontSize: 14 }}>{capitalizeEachWord(workLocType[0] + ' - ' + category)}</div>
                                            <div style={{ fontSize: 12 }}>{requirementSummary}</div>
                                            <div style={{ fontSize: 12 }}>Budget: {budget}</div>
                                        </td>
                                        <td style={custom.td}>{fullAddress}</td>
                                        <td style={custom.td}>{status}</td>
                                        <td style={custom.tdNone}>{editBtn}</td>
                                        <td style={custom.tdNone}>{startBtn}</td>
                                        <td style={custom.tdNone}>{pauseBtn}</td>
                                        <td style={custom.tdNone}>{trashBtn}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            </View>
        );
    };

    createCustFn = async () => {
        const { customerName, email } = this.state;
        if (!customerName) {
            window.alert('Please enter a valid name');
            return;
        }
        if (!email) {
            window.alert('Please enter a valid email');
            return;
        }

        await this.props.createCustFn(customerName, email);
        this.setState({ created: true });
    };

    render() {
        const { classes } = this.props;

        if (this.state.created) {
            return this.renderDash();
        }

        return (
            <View style={custom.root}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={custom.title}>Signup</div>
                    <div className={classes.formInputContainer}>
                        <input placeholder=" Your name" className={classes.formInput} type={'string'}
                               value={this.state.customerName} onChange={this.onChange('customerName')} />
                    </div>

                    <div className={classes.formInputContainer}>
                        <input placeholder=" Your email id" className={classes.formInput} type={'string'}
                               value={this.state.email} onChange={this.onChange('email')} />
                    </div>

                    {actionButton('SUBMIT', this.createCustFn, { backgroundColor: TEAL_COLOR_THEME })}
                </div>
            </View>
        );
    }
}

const styles = theme => ({
    root: {
    },
    formInputContainer: {
        marginBottom: 30,
        width: IS_MOBILE_SCREEN ? '90%' : '80%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
});
const custom = {
    root: {
        fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
    title: {
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 5,
        fontSize: 26,
    },

    heading: {
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 10,
        marginLeft: 5,
        fontSize: 22,
    },
    dear: {
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 10,
        marginLeft: 5,
        fontSize: 18,
    },
    subtext: {
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 20,
        marginLeft: 5,
        fontSize: 16,
    },


    table: {},
    thead: {},
    tbody: {},
    th: {
        fontSize: 14,
        width: '10%',
    },
    thWide: {
        fontSize: 14,
        width: '40%',
    },
    tr: {},
    td: {
        fontSize: 14,
        paddingLeft: 2,
        paddingRight: 2,
        width: '10%'
    },
    tdWide: {
        fontSize: 14,
        paddingLeft: 2,
        paddingRight: 2,
        width: '40%'
    },
    tdNone: {
    },
};
export default withStyles(styles)(CustomerDashboardScreen);
