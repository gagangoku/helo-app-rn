import uuidv1 from "uuid/v1";


export const getJobId = (job) => {
    return '' + job.jobRequirement.id;
};

export const getChatContext = (flow) => {
    const window = {};
    const { appCodeName, appName, appVersion, deviceMemory, language, platform, product, productSub, userAgent, vendor, vendorSub } = (window.navigator || {});
    const { innerHeight, innerWidth, screen } = window;
    return {
        sessionInfo: {
            language: null,
            uuid: uuidv1(),
            deviceID: null,
            sessionStartTime: new Date().getTime(),
            navigatorProps: { appCodeName, appName, appVersion, deviceMemory, language, platform, product, productSub, userAgent, vendor, vendorSub },
            windowProps: { innerHeight, innerWidth, screen },
            welcomeMessagesDisplayed: false,

            numJobsShown: 0,
            lastJobsShownTs: -1,
            showJobsThisSession: false,
            numTimesSessionIdx: 0,

            appliedJobs: {},
            rejectedJobs: {},
        },
        messages: [],
        structure: {},
        flow,

        forceReset: false,
        supply: null,
    };
};
