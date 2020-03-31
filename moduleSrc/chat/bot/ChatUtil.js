import window from "global";
import uuidv1 from "uuid/v1";
import {
    ACTIONABLE_JOB_QUESTIONS,
    LANG_HINGLISH,
    QUESTION_AADHAR_PHOTO,
    QUESTION_AGE,
    QUESTION_AREA,
    QUESTION_AREA_TYPE,
    QUESTION_CHECK_BACK_TOMORROW,
    QUESTION_CONT_SESSION_OR_NEW_1,
    QUESTION_CUISINES,
    QUESTION_EDUCATION,
    QUESTION_EXPERIENCE,
    QUESTION_GENDER,
    QUESTION_GPS_ASK,
    QUESTION_HOMETOWN,
    QUESTION_LANGUAGES,
    QUESTION_LATITUDE,
    QUESTION_LONGITUDE,
    QUESTION_NAME,
    QUESTION_PHONE,
    QUESTION_PHONE_CONFIRM,
    QUESTION_PROFILE_PHOTO,
    QUESTION_RESTAURANT_SKILLS,
    QUESTION_RESTAURANT_SKILLS_CONFIRM,
    QUESTION_SEE_TODAYS_WORK,
    QUESTION_SHOW_ID_CARD_NO_MESSAGE,
    QUESTION_VEG,
    WELCOME_MSG_1
} from "../Questions";


export const getChatContext = (flow) => {
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

export const COOK_ONBOARDING_FLOW = {
    welcomeMessages: [WELCOME_MSG_1],
    defaultLanguage: LANG_HINGLISH,
    stack: [],
    initialQuestions: [
        QUESTION_PHONE, QUESTION_PHONE_CONFIRM,
        QUESTION_SHOW_ID_CARD_NO_MESSAGE,
        QUESTION_CONT_SESSION_OR_NEW_1,
    ],
    mainQuestions: [
        QUESTION_PHONE,
        QUESTION_NAME,
        QUESTION_GENDER,
        QUESTION_AGE,
        QUESTION_EXPERIENCE,
        QUESTION_VEG,
        QUESTION_CUISINES,
        QUESTION_RESTAURANT_SKILLS_CONFIRM,
        QUESTION_RESTAURANT_SKILLS,
        QUESTION_GPS_ASK,
        QUESTION_AREA_TYPE,
    ],
    optionalQuestions: [
        QUESTION_LANGUAGES,
        QUESTION_EDUCATION,
        QUESTION_PROFILE_PHOTO,

        QUESTION_HOMETOWN,
        QUESTION_AADHAR_PHOTO,
        QUESTION_AREA,
        QUESTION_LATITUDE,
        QUESTION_LONGITUDE,
    ],
    signoffQuestion: QUESTION_CHECK_BACK_TOMORROW,
    mandatoryQuestionsBeforeJobSearch: [
        QUESTION_NAME,
        QUESTION_GENDER,
        QUESTION_RESTAURANT_SKILLS,

        QUESTION_LATITUDE,
        QUESTION_LONGITUDE,
    ],
    sessionLocalQuestions: [
        ...ACTIONABLE_JOB_QUESTIONS,
        QUESTION_SEE_TODAYS_WORK,
        QUESTION_CHECK_BACK_TOMORROW,
        QUESTION_CONT_SESSION_OR_NEW_1,
        QUESTION_SHOW_ID_CARD_NO_MESSAGE,
    ],

    numQuestionsBeforeShowingJob: 5,
    numJobsPerSession: 3,
    timeBetweenJobsMs: 10 * 60 * 60 * 1000,         // 10 hours
};

export const getJobId = (job) => {
    return '' + job.jobRequirement.id;
};

export const COOK_ONBOARDING_FLOW_NAME = 'COOK_ONBOARDING_FLOW';
export const BOT_FLOWS = {
    [COOK_ONBOARDING_FLOW_NAME]: COOK_ONBOARDING_FLOW,
};