import React from "react";
import PropTypes from "prop-types";
import {getJobsForDetails} from "../util/Api";
import {CATEGORY_COOK, WORK_LOC_TYPE_HOME, WORK_LOC_TYPE_RESTAURANT} from "../constants/Constants";
import lodash from 'lodash';
import {
    GENDER_PREFIX,
    LANG_HINGLISH,
    OPTION_NO,
    OPTION_YES,
    OPTIONS,
    OUTPUT,
    OUTPUT_AUDIO,
    OUTPUT_ID_CARD,
    OUTPUT_IMAGE,
    OUTPUT_JOB_ACTIONABLE,
    OUTPUT_JOB_REFERENCE,
    OUTPUT_MULTIPLE_CHOICE,
    OUTPUT_NONE,
    OUTPUT_SINGLE_CHOICE,
    OUTPUT_TEXT,
    OUTPUT_VIDEO,
    QUESTION_AADHAR,
    QUESTION_AADHAR_PHOTO,
    QUESTION_AGE,
    QUESTION_AREA,
    QUESTION_AREA_TYPE,
    QUESTION_CITY,
    QUESTION_CREATE_ID,
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
    QUESTION_PROFILE_PHOTO,
    QUESTION_RESTAURANT_SKILLS,
    QUESTION_RESTAURANT_SKILLS_CONFIRM,
    QUESTION_THUMBIMAGE,
    QUESTION_VEG,
    QUESTION_WHATSAPP_NUMBER,
    QUESTION_WORK_CATEGORIES,
    SENDER_HELO,
    SENDER_VISITOR
} from "./Questions";
import {ageFn, getImageUrl, getUrlPath, removeNullUndefined, sumFn} from "../util/Util";
import assert from 'assert';


export const WHEN_NOT_TO_WAIT = [OUTPUT_NONE, OUTPUT_JOB_REFERENCE, OUTPUT_ID_CARD];

export const templateToQuestion = (tmpl, questionKey, ctx) => {
    return {
        ...JSON.parse(JSON.stringify(tmpl)),
        type: tmpl[OUTPUT],
        questionKey,
    };
};

export const getLastMessage = (messages, sender) => {
    for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg.sender === sender) {
            return msg;
        }
    }
    return null;
};

export const genderPrefix = (gender, language=LANG_HINGLISH) => {
    const prefix = GENDER_PREFIX[gender.toUpperCase()][language];
    console.log('gender prefix: ', prefix);
    return prefix;
};

export const isValidPhoneNumber = (phone) => {
    const p = (phone + '').trim();
    if (p.length === 10 && parseInt(p) + '' === p) {
        return true;
    }
    return (p.length === 11 && p.charAt(0) === '0' && p.charAt(1) !== '0' && isValidPhoneNumber(p.substr(1, p.length)));
};

export const questionsNotAnswered = (array, chatContext) => {
    return array.map(x => chatContext.structure[x] ? 0 : 1).reduce(sumFn, 0);
};
export const questionsAnswered = (array, chatContext) => {
    return array.map(x => chatContext.structure[x] ? 1 : 0).reduce(sumFn, 0);
};

export const getJobs = async (ctx) => {
    const { structure } = ctx;

    const distanceThresholdMeters = 6000;
    const req = { ...structure, distanceThresholdMeters };
    if (req[QUESTION_CUISINES]) {
        req.attributes = req[QUESTION_CUISINES].map(id => ({category: CATEGORY_COOK, id}));
    } else {
        // By default look for north indian cooking jobs
        req.attributes = [{category: CATEGORY_COOK, id: 'NORTH_INDIAN'}];
    }

    console.log('Sending jobs request: ', req);
    const jobs = await getJobsForDetails(req);
    console.log('Got jobs: ', jobs);
    return jobs;
};

// To be called only at the end of the flow, when all the main questions have been answered
export const getSupplyCreationObj = (chatContext) => {
    const details = {...chatContext.structure};
    const numQuestionsNotAnswered = chatContext.flow.mainQuestions.map(x => details[x] ? 0 : 1).reduce(sumFn);
    assert(numQuestionsNotAnswered === 0, 'All questions need to be answered');

    const birthYear = new Date().getFullYear() - Math.floor(parseInt(details[QUESTION_AGE]));
    const restaurantSkills = details[QUESTION_RESTAURANT_SKILLS] || [];

    if (details[QUESTION_PROFILE_PHOTO]) {
        let image = getUrlPath(getImageUrl(details[QUESTION_PROFILE_PHOTO]));
        while (image.startsWith('/')) {
            image = image.substr(1);
        }
        details[QUESTION_PROFILE_PHOTO] = image;
    }

    if (details[QUESTION_AADHAR_PHOTO]) {
        let aadharPhoto = getUrlPath(getImageUrl(details[QUESTION_AADHAR_PHOTO]));
        while (aadharPhoto.startsWith('/')) {
            aadharPhoto = aadharPhoto.substr(1);
        }
        details[QUESTION_AADHAR_PHOTO] = aadharPhoto;
    }

    details.dateOfBirth = birthYear + '-01-01';
    details.attributes = details[QUESTION_CUISINES].map(id => ({ category: CATEGORY_COOK, id }));
    details.workLocType = restaurantSkills.length > 0 ? [WORK_LOC_TYPE_HOME, WORK_LOC_TYPE_RESTAURANT] : [WORK_LOC_TYPE_HOME];
    details.distanceThresholdMeters = 6000;
    return details;
};

export const flattenSupply = (supply) => {
    if (!supply || Object.keys(supply).length === 0) {
        return {};
    }
    let obj = {
        id: supply.person.id,
        [QUESTION_PHONE]: supply.person.phone && supply.person.phone.phoneNumber,
        [QUESTION_NAME]: supply.person.name,
        [QUESTION_GENDER]: supply.person.gender,
        [QUESTION_WORK_CATEGORIES]: supply.jobAttributes && supply.jobAttributes.attributes && lodash.uniq(supply.jobAttributes.attributes.map(x => x.category)),
        [QUESTION_CITY]: supply.person.presentAddress && supply.person.presentAddress.city,
        [QUESTION_AREA]: supply.person.presentAddress && supply.person.presentAddress.area,
        [QUESTION_GPS_ASK]: 'skipped1',
        [QUESTION_AREA_TYPE]: supply.person.presentAddress && supply.person.presentAddress.area,

        [QUESTION_LATITUDE]: supply.person.presentAddress && supply.person.presentAddress.location.lat,
        [QUESTION_LONGITUDE]: supply.person.presentAddress && supply.person.presentAddress.location.lng,
        [QUESTION_AGE]: supply.person.dateOfBirth && Math.round(ageFn(supply.person.dateOfBirth)),
        [QUESTION_EXPERIENCE]: supply.startedWorkingSinceDate && Math.round(ageFn(supply.startedWorkingSinceDate)),

        [QUESTION_VEG]: supply.jobAttributes && supply.jobAttributes.veg,
        [QUESTION_CUISINES]: supply.jobAttributes && supply.jobAttributes.attributes && supply.jobAttributes.attributes.filter(x => x.category === CATEGORY_COOK).map(x => x.id),
        [QUESTION_PROFILE_PHOTO]: supply.person.image,
        [QUESTION_THUMBIMAGE]: supply.person.thumbImage,
        [QUESTION_CREATE_ID]: supply.person.id,

        [QUESTION_HOMETOWN]: supply.person.hometownAddress && (supply.person.hometownAddress.city || supply.person.hometownAddress.state),
        [QUESTION_LANGUAGES]: supply.person.languages,
        [QUESTION_EDUCATION]: supply.education && supply.education.notes,
        [QUESTION_WHATSAPP_NUMBER]: supply.person.phone && supply.person.phone.whatsappNumber,
    };

    const workLocType = supply.jobAttributes && supply.jobAttributes.workLocType;
    const skills = supply.jobAttributes && supply.jobAttributes.cookingRequirements ? supply.jobAttributes.cookingRequirements.skills : null;
    if (skills && skills.length > 0) {
        obj[QUESTION_RESTAURANT_SKILLS_CONFIRM] = OPTION_YES;
        obj[QUESTION_RESTAURANT_SKILLS] = skills;
    } else if (workLocType && workLocType.includes(WORK_LOC_TYPE_RESTAURANT)) {
        obj[QUESTION_RESTAURANT_SKILLS_CONFIRM] = OPTION_YES;
        delete obj[QUESTION_RESTAURANT_SKILLS];
    } else if (workLocType && !workLocType.includes(WORK_LOC_TYPE_RESTAURANT)) {
        obj[QUESTION_RESTAURANT_SKILLS_CONFIRM] = OPTION_NO;
        obj[QUESTION_RESTAURANT_SKILLS] = [];
    } else {
        delete obj[QUESTION_RESTAURANT_SKILLS];
        delete obj[QUESTION_RESTAURANT_SKILLS_CONFIRM];
    }
    obj.workLocType = workLocType;

    const aadharObj = supply.person.documents && supply.person.documents.find(x => x.type === 'AADHAR_CARD');
    if (aadharObj) {
        obj[QUESTION_AADHAR_PHOTO] = aadharObj.uri;
        obj[QUESTION_AADHAR] = aadharObj.documentId;
    }

    obj = removeNullUndefined(obj);
    console.log('Flattened supply: ', obj, supply);
    return obj;
};

export const adjucateStructureWithSupply = (supply, chatContext) => {
    const obj = flattenSupply(supply);
    chatContext.structure = {
        ...chatContext.structure,
        ...obj,
    };
};

class Supply {}
Supply.propTypes = {
    person: PropTypes.shape({
        image: PropTypes.string,
        thumbImage: PropTypes.string,
        presentAddress: PropTypes.object,
        hometownAddress: PropTypes.object,
        documents: PropTypes.shape({
            documentId: PropTypes.string,
        }),
    }),
    jobAttributes: PropTypes.object,
    startedWorkingSinceDate: PropTypes.string,
    education: PropTypes.shape({
        notes: PropTypes.string,
    }),
};

class Message {}
Message.propTypes = {
    timestamp: PropTypes.number,
    type: OUTPUT_NONE | OUTPUT_TEXT | OUTPUT_VIDEO | OUTPUT_AUDIO | OUTPUT_IMAGE | OUTPUT_SINGLE_CHOICE | OUTPUT_MULTIPLE_CHOICE | OUTPUT_JOB_ACTIONABLE | OUTPUT_JOB_REFERENCE | OUTPUT_ID_CARD,
    text: PropTypes.object,
    speak: PropTypes.object,
    message: PropTypes.string,
    speakMessage: PropTypes.string,
    sender: SENDER_HELO | SENDER_VISITOR,
    idx: PropTypes.number,
    structure: PropTypes.object,
    questionKey: PropTypes.string,
    [OPTIONS]: PropTypes.array,
    optionDisplays: PropTypes.object,
    errors: PropTypes.array,
    job: PropTypes.object,
};

class Context {}
Context.propTypes = {
    sessionInfo: PropTypes.object,
    messages: PropTypes.arrayOf(Message),
    structure: PropTypes.object,
};
