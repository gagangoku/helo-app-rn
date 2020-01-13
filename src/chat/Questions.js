import React from 'react';

import {GENDER_FEMALE, GENDER_MALE} from "../constants/Constants";
import xrange from 'xrange';


export const QUESTION_NAME = 'name';
export const QUESTION_CONT_SESSION_OR_NEW_1 = 'question-cont-or-new-1';
export const QUESTION_GENDER = 'gender';
export const QUESTION_WHATSAPP_NUMBER = 'whatsappNumber';
export const QUESTION_PHONE = 'phoneNumber';
export const QUESTION_PHONE_SPACE_SEPARATED = 'phone-space';
export const QUESTION_PHONE_CONFIRM = 'phone-confirm';
export const QUESTION_AREA = 'area';
export const QUESTION_AREA_TYPE = 'area-type';
export const QUESTION_GPS_ASK = 'ask-gps';
export const QUESTION_CITY = 'city';
export const QUESTION_ADDRESS_ENTERED = 'addressEntered';
export const QUESTION_LATITUDE = 'latitude';
export const QUESTION_LONGITUDE = 'longitude';

export const QUESTION_LANGUAGES = 'languages';
export const QUESTION_AGE = 'age';
export const QUESTION_AGE_CONFIRM = 'age-confirm';
export const QUESTION_EXPERIENCE = 'experience';
export const QUESTION_WORK_CATEGORIES = 'work-categories';
export const QUESTION_EDUCATION = 'educationDetails';

export const QUESTION_SEE_TODAYS_WORK = 'question-see-todays-work';
export const QUESTION_CHECK_BACK_TOMORROW = 'question-check-back-tomorrow-2';
export const QUESTION_JOB_ACTIONABLE_PREFIX = 'question-job-actionable-';
export const ACTIONABLE_JOB_QUESTIONS = xrange(0, 10).toArray().map(x => QUESTION_JOB_ACTIONABLE_PREFIX + x);
export const QUESTION_JOB_REFERENCE = 'question-job-reference';
export const WELCOME_JOB_REFERENCE_NO_MESSAGE = 'question-job-reference-no-msg';
export const QUESTION_WHY_MORE_ATTRIBUTES = 'why-more-attributes';
export const QUESTION_CREATE_ID = 'question-create-id';
export const QUESTION_SHOW_ID_CARD_NO_MESSAGE = 'q-id-card-only';
export const QUESTION_SHOW_ID_CARD = 'question-show-id-1';
export const QUESTION_SHOW_ID_CARD_2 = 'question-show-id-2';
export const QUESTION_RESTAURANT_SKILLS_CONFIRM = 'restaurant-skills-confirm';
export const QUESTION_RESTAURANT_SKILLS = 'restaurantSkills';
export const QUESTION_THUMBIMAGE = 'thumbImage';
export const QUESTION_CUISINES = 'cuisines';
export const QUESTION_VEG = 'veg';
export const QUESTION_HOMETOWN = 'hometown';
export const QUESTION_NATIVE_CITY = 'nativeCity';
export const QUESTION_NATIVE_STATE = 'nativeState';
export const QUESTION_CURRENT_ADDRESS = 'currentAddress';

export const QUESTION_MORE_CONTEXT = 'more-context';
export const QUESTION_AADHAR = 'aadhar';
export const QUESTION_AADHAR_PHOTO = 'aadharPhoto';
export const QUESTION_PROFILE_PHOTO = 'image';
export const QUESTION_VIDEO_INTRO = 'video-intro';
export const QUESTION_AUDIO_ENQUIRY = 'audio-enquiry';


export const LANG_HINGLISH = 'Hindi English mix';
export const LANG_ENGLISH = 'English';
export const LANG_HINDI = 'हिंदी';
export const LANG_THAI = 'ภาษาไทย';

const GENDER_MALE_DISPLAY = 'Male / Mard / पुरुष';
const GENDER_FEMALE_DISPLAY = 'Female / Stri / औरत';
const GENDER_DISPLAY_FN = {
    [GENDER_MALE]: GENDER_MALE_DISPLAY,
    [GENDER_FEMALE]: GENDER_FEMALE_DISPLAY,
};

export const TIME_DELAY = 'timeDelay';
export const ASK_INPUT = 'askInput';
export const ENABLE_SPEECH_RECOGNITION = 'enableSpeechRecognition';
export const SPEECH_GRAMMAR = 'speechGrammar';
export const OUTPUT = 'output';
export const OUTPUT_NONE = 'none';
export const OUTPUT_ID_CARD = 'id-card';
export const OUTPUT_NEW_JOINEE = 'new-joinee';
export const OUTPUT_TEXT = 'text';
export const OUTPUT_HTML = 'html';
export const OUTPUT_SINGLE_CHOICE = 'single-choice';
export const OUTPUT_MULTIPLE_CHOICE = 'multiple-choice';
export const OUTPUT_FILE = 'file';
export const OUTPUT_IMAGE = 'image';
export const OUTPUT_VIDEO = 'video';
export const OUTPUT_AUDIO = 'audio';
export const OUTPUT_PDF = 'pdf';
export const OUTPUT_LOCATION = 'location';
export const OUTPUT_MISSED_CALL = 'missed-call';
export const OUTPUT_JOB_REFERENCE = 'job-reference';
export const OUTPUT_JOB_ACTIONABLE = 'job-actionable';
export const OUTPUT_JOB_BRIEF = 'job-brief';
export const OUTPUT_PLACES_AUTOCOMPLETE = 'places-autocomplete';
export const OPTIONS = 'options';
export const OPTION_DISPLAYS = 'optionDisplays';

export const OPTION_YES = 'YES';
export const OPTION_NO = 'NO';
const OPTION_CORRECT_DISPLAY = 'Sahi / सही';
const OPTION_WRONG_DISPLAY = 'Galat / गलत';
const OPTION_YES_DISPLAY = 'Haan / हाँ';
const OPTION_NO_DISPLAY = 'Nahi / नहीं';
const CORRECT_WRONG_DISPLAY_FN = {
    [OPTION_YES]: OPTION_CORRECT_DISPLAY,
    [OPTION_NO]: OPTION_WRONG_DISPLAY,
};
const YES_NO_DISPLAY_FN = {
    [OPTION_YES]: OPTION_YES_DISPLAY,
    [OPTION_NO]: OPTION_NO_DISPLAY,
};

export const OPTION_VEG_ONLY = 'VEG_ONLY';
export const OPTION_VEG_NON_VEG = 'VEG_NON_VEG';
const VEG_NONVEG_DISPLAY_FN = {
    [OPTION_VEG_ONLY]: 'Pure veg / शुद्ध वैष्णो',
    [OPTION_VEG_NON_VEG]: 'Veg & Non-veg / मांस मछली इत्यादि',
};

const WORK_COOKING = 'COOK';
const WORK_CLEANING = 'MAID';
const WORK_COOKING_DISPLAY = 'Cooking / खाना बनाना';
const WORK_CLEANING_DISPLAY = 'Cleaning / झाड़ू पोछा';
const WORK_COOKING_DISPLAY_FN = {
    [WORK_COOKING]: WORK_COOKING_DISPLAY,
    [WORK_CLEANING]: WORK_CLEANING_DISPLAY,
};

export const BLANK_MSG = 'q-blank-msg';
export const WELCOME_MSG_1 = 'q-welcome-1';
export const WELCOME_MSG_2 = 'q-welcome-2';
export const WELCOME_MSG_3_JOBS_DAILY_WITH_EXAMPLE = 'q-welcome-3';
export const WELCOME_MSG_4 = 'q-welcome-4';
export const WELCOME_MSG_3_JOBS_DAILY = 'q-welcome-5';
export const WELCOME_SHOW_ID_CARD_NO_MESSAGE = 'q-welcome-id';
export const WELCOME_AUTO_START_AFTER = 'q-welcome-auto-start-after';
export const QUESTION_ONLY_OK = 'q-ok';

export const SENDER_USER = 'USER';
export const SENDER_HELO = 'HELO';
export const SENDER_VISITOR = 'VISITOR';

export const SAMPLE_JOB_HINGLISH = {
    hoursWork: 1,
    timeFrom: "9 AM",
    area: 'HSR Layout',
    customer: {
        person: {
            id: "-1",
            name: "Akhil",
        },
        jobOpenings: [{
            attributes: [{
                category: "COOK",
                id: "NORTH_INDIAN"
            }, {
                category: "COOK",
                id: "SOUTH_INDIAN"
            }],
            veg: "VEG_ONLY",
            gender: "EITHER",
            budget: 7000,
            cookingRequirements: {
                lunch: true,
                dinner: true
            },
            workTypes: [ "PART_TIME" ],
            numResidents: 2,
            languages: [ "HINDI", "ENGLISH" ],
            location: {
                location: {
                    lat: 12.915045279455697,
                    lng: 77.64396566585555
                },
            },
        }],
    },
    distanceMeters: 4952,
};
export const SAMPLE_JOB_HINDI = {
    hoursWork: 1,
    timeFrom: "सुबह 9 बजे",
    area: 'एच स आर लेआउट',
    customer: {
        person: {
            id: "-1",
            name: "अखिल",
        },
        jobOpenings: [{
            attributes: [{
                category: "COOK",
                id: "नार्थ इंडियन"
            }, {
                category: "COOK",
                id: "साउथ इंडियन"
            }],
            veg: "VEG_ONLY",
            gender: "EITHER",
            budget: 7000,
            cookingRequirements: {
                lunch: true,
                dinner: true
            },
            workTypes: [ "PART_TIME" ],
            numResidents: 2,
            languages: [ "HINDI", "ENGLISH" ],
            location: {
                location: {
                    lat: 12.915045279455697,
                    lng: 77.64396566585555
                },
            },
        }],
    },
    distanceMeters: 4952,
};
export const SAMPLE_JOBS = {
    [LANG_HINDI]: SAMPLE_JOB_HINDI,
    [LANG_HINGLISH]: SAMPLE_JOB_HINGLISH,
};

