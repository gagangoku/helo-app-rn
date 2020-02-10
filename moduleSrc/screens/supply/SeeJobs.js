import React from 'react';
import {withStyles} from '../../platform/Util';
import {TEAL_COLOR_THEME} from "../../styles/common";
import {getCtx, getUrlParam, spacer} from "../../util/Util";
import SuperRoot from "../../widgets/SuperRoot";
import classnames from "classnames";
import {applyForJob, getApplicableJobs} from "../../util/Api";
import JobDetailsWidget from "../../widgets/JobDetailsWidget";


class SeeJobs extends React.Component {
    constructor(props) {
        super(props);

        console.log('props:', props);
        this.contextObj = getCtx(this);
        this.state = {
            jobs: null,
            fetched: false,
            supplyId: getUrlParam('supplyId') || this.contextObj.phoneNumber,
            jobId: getUrlParam('jobId') || '',
            showOnlyJob: getUrlParam('showOnlyJob') || '',

            jobsAlreadyApplied: {},
        };
        console.log('supplyId: ', this.state.supplyId);
    }

    async componentDidMount() {
        const jobs = await getApplicableJobs(this.state.supplyId);
        console.log('Lots of jobs: ', jobs);

        let orderedJobs = [];
        for (let i = 0; i < jobs.length; i++) {
            if (this.state.jobId === jobs[i].customer.person.id) {
                orderedJobs.push(jobs[i]);
                jobs.splice(i, 1);
                break;
            }
        }
        if (this.state.showOnlyJob !== 'true') {
            orderedJobs = orderedJobs.concat(jobs);
        }

        console.log('orderedJobs: ', orderedJobs);
        this.setState({ jobs: orderedJobs, fetched: true });
    }

    applyJob = async (customer, jobRequirement) => {
        const jobId = jobRequirement.id;
        await applyForJob(this.state.supplyId, jobId);
        window.alert('Applied for job: ' + jobId + " -> " + customer.person.name);

        const copy = {...this.state.jobsAlreadyApplied, [jobId]: 1};
        this.setState({ jobsAlreadyApplied: copy });
    };

    renderJob = (jobDetails) => {
        const { customer, jobRequirement } = jobDetails;
        const jobId = jobRequirement.id;
        if (!customer || this.state.jobsAlreadyApplied[jobId]) {
            return '';
        }

        const actionPanel = {
            labels: ['APPLY'],
            actions: [(customer) => this.applyJob(customer, jobRequirement)],
        };
        return <JobDetailsWidget supplyId={this.state.supplyId} jobDetails={jobDetails} key={'job-' + customer.person.id}
                                 highlightJob={customer.person.id === this.state.jobId}
                                 actionPanel={actionPanel} />;
    };

    render() {
        const {classes} = this.props;
        if (!this.state.fetched) {
            return (
                <div>
                    <div>Getting jobs ...</div>
                </div>
            );
        }

        const numJobs = this.state.jobs.length - Object.keys(this.state.jobsAlreadyApplied).length;
        return (
            <SuperRoot>
                <div className={classes.root}>
                    <div className={classes.title}>Jobs in Bangalore</div>
                    <div className={classes.desc}>
                        We have customers all across Bangalore. You'll be able to see more jobs once your profile is complete and documents are verified.
                        <br/>
                        Visit our office for more details.
                    </div>
                    <div className={classnames(classes.desc, classes.descHindi)}>
                        हमें पूरे बैंगलोर से फ़ोन आते हैं कुक लगवाने के लिए
                        <br/>
                        आपके डाक्यूमेंट्स वेरीफाई होते ही आप सभी काम देख पाओगे
                        <br/>
                        ऑफिस आके रजिस्ट्रेशन पूरी कीजिये - रजिस्ट्रेशन के कोई पैसे नहीं हैं
                    </div>

                    <div className={classes.numJobs}>{numJobs} Jobs</div>

                    <div className={classes.ctr1}>
                        {this.state.jobs.map(x => this.renderJob(x))}
                    </div>
                    {spacer(50)}
                </div>
            </SuperRoot>
        );
    }
}

const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctr1: {
        width: '80%',
        justifyContent: 'space-between',
        // alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
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
        lineHeight: 1.5,
    },

    numJobs: {
        width: '80%',
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 10,
    },
});
export default withStyles(styles)(SeeJobs);
