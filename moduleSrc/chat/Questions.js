import {GENDER_FEMALE, GENDER_MALE, LANGUAGES, RESTAURANT_SKILLS} from "../constants/Constants";
import xrange from 'xrange';
import React from 'react';


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
export const OUTPUT_SYSTEM_MESSAGE = 'system-message';
export const OUTPUT_TEXT = 'text';
export const OUTPUT_HTML = 'html';
export const OUTPUT_SINGLE_CHOICE = 'single-choice';
export const OUTPUT_MULTIPLE_CHOICE = 'multiple-choice';
export const OUTPUT_FILE = 'file';
export const OUTPUT_IMAGE = 'image';
export const OUTPUT_VIDEO = 'video';
export const OUTPUT_AUDIO = 'audio';
export const OUTPUT_PDF = 'pdf';
export const OUTPUT_PROGRESSIVE_MODULE = 'progressive-module';
export const OUTPUT_LOCATION = 'location';
export const OUTPUT_MISSED_CALL = 'missed-call';
export const OUTPUT_JOB_REFERENCE = 'job-reference';
export const OUTPUT_JOB_ACTIONABLE = 'job-actionable';
export const OUTPUT_JOB_BRIEF = 'job-brief';
export const OUTPUT_PLACES_AUTOCOMPLETE = 'places-autocomplete';
export const OUTPUT_EXCEL = 'excel';
export const OUTPUT_TASK_LIST = 'task-list';
export const OPTIONS = 'options';
export const OPTION_DISPLAYS = 'optionDisplays';

export const TASK_LIST_IMAGE_TYPE_OPTIONAL = 'optional';
export const TASK_LIST_IMAGE_TYPE_REQUIRED = 'required';
export const TASK_LIST_IMAGE_TYPE_NONE = 'none';

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
    distanceMeters: 3952,
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
    distanceMeters: 3952,
};
export const SAMPLE_JOB_ENGLISH = {
    hoursWork: 1,
    timeFrom: "9 am",
    area: 'HSR layout',
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
    distanceMeters: 3952,
};

export const SAMPLE_JOBS = {
    [LANG_ENGLISH]: SAMPLE_JOB_ENGLISH,
    [LANG_HINDI]: SAMPLE_JOB_HINDI,
    [LANG_HINGLISH]: SAMPLE_JOB_HINGLISH,
};

export const NUM_JOBS_PER_SESSION = 3;
export const QUESTIONS = {
    [QUESTION_CONT_SESSION_OR_NEW_1]: {
        text: {
            [LANG_ENGLISH]: 'These are your details so far. Are they correct ?',
            [LANG_HINGLISH]: 'Ye aapki abhi tak ki details hain. Kya ye sahi hai ?',
            [LANG_HINDI]: 'ये आपकी अभी तक की डिटेल्स हैं. क्या ये सही है ?',
            [LANG_THAI]: 'นี่คือรายละเอียดของคุณจนถึงตอนนี้ ถูกต้องหรือไม่ ?',
        },
        speak: {
            [LANG_ENGLISH]: 'These are your details so far. Are they correct ?',
            [LANG_HINGLISH]: 'ये आपकी अभी तक की डिटेल्स हैं. क्या ये सही है ?',
            [LANG_HINDI]: 'ये आपकी अभी तक की डिटेल्स हैं. क्या ये सही है ?',
            [LANG_THAI]: 'นี่คือรายละเอียดของคุณจนถึงตอนนี้ ถูกต้องหรือไม่ ?',
        },
        [OUTPUT]: OUTPUT_SINGLE_CHOICE,
        [OPTIONS]: [OPTION_YES, OPTION_NO],
        [OPTION_DISPLAYS]: (x) => CORRECT_WRONG_DISPLAY_FN[x],
        [ASK_INPUT]: true,
    },

    [QUESTION_GENDER]: {
        text: {
            [LANG_ENGLISH]: '<div>Are you <b>MALE</b> or <b>FEMALE</b> ?</div>',
            [LANG_HINGLISH]: '<div>Aap <b>MALE</b> hain ya <b>FEMALE</b> ?</div>',
            [LANG_HINDI]: '<div>आप <b>पुरुष</b> हैं या <b>औरत</b> ?</div>',
            [LANG_THAI]: 'คุณเป็นผู้ชายหรือผู้หญิง ?',
        },
        speak: {
            [LANG_ENGLISH]: 'Are you MALE or FEMALE ?',
            [LANG_HINGLISH]: 'आप पुरुष हैं या औरत ?',
            [LANG_HINDI]: 'आप पुरुष हैं या औरत ?',
            [LANG_THAI]: 'คุณเป็นผู้ชายหรือผู้หญิง ?',
        },
        [OUTPUT]: OUTPUT_SINGLE_CHOICE,
        [OPTIONS]: [GENDER_MALE, GENDER_FEMALE],
        [OPTION_DISPLAYS]: (x) => GENDER_DISPLAY_FN[x],
        [ASK_INPUT]: true,
    },
    [QUESTION_NAME]: {
        text: {
            [LANG_ENGLISH]: '<div>What is your <b>name</b> ?</div>',
            [LANG_HINGLISH]: '<div>Aapka <b>naam</b> kya hai ?</div>',
            [LANG_HINDI]: '<div>आपका <b>नाम</b> क्या है ?</div>',
            [LANG_THAI]: 'คุณชื่ออะไร',
        },
        speak: {
            [LANG_ENGLISH]: 'What is your name ?',
            [LANG_HINGLISH]: 'आपका नाम. क्या है ?',
            [LANG_HINDI]: 'आपका नाम. क्या है ?',
            [LANG_THAI]: 'คุณชื่ออะไร',
        },
        [OUTPUT]: OUTPUT_TEXT,
        [ASK_INPUT]: true,
    },
    [QUESTION_WHATSAPP_NUMBER]: {
        text: {
            [LANG_ENGLISH]: 'What is your whatsapp number',
            [LANG_HINGLISH]: 'Aapka whatsapp number bataaiye',
            [LANG_HINDI]: 'आपका वाट्सएप नंबर बताइये',
            [LANG_THAI]: 'หมายเลข whatsapp ของคุณคืออะไร',
        },
        speak: {
            [LANG_ENGLISH]: 'What is your whatsapp number',
            [LANG_HINGLISH]: 'आपका whatsapp नंबर बताइये.',
            [LANG_HINDI]: 'आपका whatsapp नंबर बताइये.',
            [LANG_THAI]: 'หมายเลข whatsapp ของคุณคืออะไร',
        },
        [OUTPUT]: OUTPUT_TEXT,
        [ASK_INPUT]: true,
    },

    [QUESTION_PHONE]: {
        text: {
            [LANG_ENGLISH]: '<div>What is your <b>phone number</b></div>',
            [LANG_HINGLISH]: '<div>Aapka <b>phone number</b> bataaiye</div>',
            [LANG_HINDI]: '<div>आपका <b>फ़ोन नंबर</b> बताइये</div>',
            [LANG_THAI]: 'หมายเลขโทรศัพท์ของคุณคืออะไร',
        },
        speak: {
            [LANG_ENGLISH]: 'What is your phone number',
            [LANG_HINGLISH]: 'आपका फ़ोन नंबर बताइये',
            [LANG_HINDI]: 'आपका फ़ोन नंबर बताइये',
            [LANG_THAI]: 'หมายเลขโทรศัพท์ของคุณคืออะไร',
        },
        [OUTPUT]: OUTPUT_TEXT,
        [ASK_INPUT]: true,
        [ENABLE_SPEECH_RECOGNITION]: false,
        [SPEECH_GRAMMAR]: {
            [LANG_HINGLISH]: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            [LANG_HINDI]: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        },
    },
    [QUESTION_PHONE_CONFIRM]: {
        text: {
            [LANG_ENGLISH]: 'Is your phone number {{phone-space}} correct ?',
            [LANG_HINGLISH]: 'Kya aapka phone number {{phone-space}} sahi hai ?',
            [LANG_HINDI]: 'क्या आपका फ़ोन नंबर {{phone-space}} सही है ?',
            [LANG_THAI]: 'หมายเลข {{phone-space}} ของคุณถูกต้องหรือไม่',
        },
        speak: {
            [LANG_ENGLISH]: 'Is your phone number {{phone-space}} correct ?',
            [LANG_HINGLISH]: 'क्या आपका फ़ोन नंबर {{phone-space}} सही है ?',
            [LANG_HINDI]: 'क्या आपका फ़ोन नंबर {{phone-space}} सही है ?',
            [LANG_THAI]: 'หมายเลข {{phone-space}} ของคุณถูกต้องหรือไม่',
        },
        [OUTPUT]: OUTPUT_SINGLE_CHOICE,
        [OPTIONS]: [OPTION_YES, OPTION_NO],
        [OPTION_DISPLAYS]: (x) => CORRECT_WRONG_DISPLAY_FN[x],
        [ASK_INPUT]: true,
    },

    [QUESTION_GPS_ASK]: {
        text: {
            [LANG_ENGLISH]: '<div>Please turn on <b>location</b> and press OK so we can show you nearby jobs</div>',
            [LANG_HINGLISH]: '<div>Aapki <b>location</b> on kar ke OK dabao taki aapko pass ka kaam dikhe</div>',
            [LANG_HINDI]: '<div>आपका <b>लोकेशन</b> चालू कर के ओके दबाओ ताकि आपको पास का काम दिखे</div>',
            [LANG_THAI]: 'เปิดตำแหน่งและกด OK เพื่อดูงานที่อยู่ใกล้คุณ',
        },
        speak: {
            [LANG_ENGLISH]: 'Please turn on location and press OK so we can show you nearby jobs',
            [LANG_HINGLISH]: 'आपका लोकेशन चालू कर के ओके दबाओ ताकि पास का काम दिखे',
            [LANG_HINDI]: 'आपका लोकेशन चालू कर के ओके दबाओ ताकि पास का काम दिखे',
            [LANG_THAI]: 'เปิดตำแหน่งและกด OK เพื่อดูงานที่อยู่ใกล้คุณ',
        },
        [OUTPUT]: OUTPUT_LOCATION,
        [OPTIONS]: [OPTION_YES],
        [OPTION_DISPLAYS]: {[OPTION_YES]: 'OK'},
        [ASK_INPUT]: true,
    },
    [QUESTION_AREA_TYPE]: {
        text: {
            [LANG_ENGLISH]: '<div>Please tell me your <b>location</b> so I can show you nearby jobs</div>',
            [LANG_HINGLISH]: '<div>Aapki <b>location</b> batao taki pass ka kaam dikhe</div>',
            [LANG_HINDI]: '<div>आपकी <b>लोकेशन</b> बताओ ताकि पास का काम दिखे</div>',
            [LANG_THAI]: 'บอกตำแหน่งของคุณให้ฉันเพื่อดูงานที่อยู่ใกล้คุณ',
        },
        speak: {
            [LANG_ENGLISH]: 'Please tell me your location so I can show you nearby jobs',
            [LANG_HINGLISH]: 'आपकी लोकेशन बताओ ताकि पास का काम दिखे',
            [LANG_HINDI]: 'आपकी लोकेशन बताओ ताकि पास का काम दिखे',
            [LANG_THAI]: 'บอกตำแหน่งของคุณให้ฉันเพื่อดูงานที่อยู่ใกล้คุณ',
        },
        [OUTPUT]: OUTPUT_TEXT,
        [ASK_INPUT]: true,
    },

    [QUESTION_AREA]: {
        text: {
            [LANG_ENGLISH]: '<div>Which locality do you stay in ? Tell me the area like <b>BTM</b> or <b>Koramangala</b></div>',
            [LANG_HINGLISH]: '<div>Aap Bangalore mein kahan rehte ho ? Area likho jaise <b>BTM</b> ya <b>Koramangala</b></div>',
            [LANG_HINDI]: '<div>आप बैंगलोर में कहाँ रहते हो ? जगह लिखो जैसे <b>कोरमंगला</b> या <b>बी टी एम्</b></div>',
            [LANG_THAI]: 'คุณพักอยู่ที่ไหน ? ประเภทพื้นที่เช่นกรุงเทพ',
        },
        speak: {
            [LANG_ENGLISH]: 'Which locality do you stay in ? Tell me the area like Koramangala',
            [LANG_HINGLISH]: 'आप बैंगलोर में कहाँ रहते हो ? जगह लिखो जैसे कोरमंगला',
            [LANG_HINDI]: 'आप बैंगलोर में कहाँ रहते हो ? जगह लिखो जैसे कोरमंगला',
            [LANG_THAI]: 'คุณพักอยู่ที่ไหน ? ประเภทพื้นที่เช่นกรุงเทพ',
        },
        [OUTPUT]: OUTPUT_PLACES_AUTOCOMPLETE,
        [ASK_INPUT]: true,
    },
    [QUESTION_AGE]: {
        text: {
            [LANG_ENGLISH]: '<div>What is your <b>age</b> ?</div>',
            [LANG_HINGLISH]: '<div>Aapki <b>umar</b> kitne saal hai ?</div>',
            [LANG_HINDI]: '<div>आपकी <b>उम्र</b> कितने साल है ?</div>',
            [LANG_THAI]: 'คุณอายุเท่าไหร่ ?'
        },
        speak: {
            [LANG_ENGLISH]: 'What is your age ?',
            [LANG_HINGLISH]: 'आपकी उम्र कितने साल है ?',
            [LANG_HINDI]: 'आपकी उम्र कितने साल है ?',
            [LANG_THAI]: 'คุณอายุเท่าไหร่ ?'
        },
        [OUTPUT]: OUTPUT_TEXT,
        [ASK_INPUT]: true,
    },
    [QUESTION_AGE_CONFIRM]: {
        text: {
            [LANG_ENGLISH]: 'Is your age {{age}} correct ?',
            [LANG_HINGLISH]: 'aapki umar {{age}} saal sahi hai ?',
            [LANG_HINDI]: 'आपकी उम्र {{age}} साल सही है ?',
            [LANG_THAI]: 'อายุ {{age}} ของคุณถูกต้องไหม',
        },
        speak: {
            [LANG_ENGLISH]: 'Is your age {{age}} correct ?',
            [LANG_HINGLISH]: 'आपकी उम्र {{age}} साल सही है ?',
            [LANG_HINDI]: 'आपकी उम्र {{age}} साल सही है ?',
            [LANG_THAI]: 'อายุ {{age}} ของคุณถูกต้องไหม',
        },
        [OUTPUT]: OUTPUT_SINGLE_CHOICE,
        [OPTIONS]: [OPTION_YES, OPTION_NO],
        [OPTION_DISPLAYS]: (x) => CORRECT_WRONG_DISPLAY_FN[x],
        [ASK_INPUT]: true,
    },

    [QUESTION_EXPERIENCE]: {
        text: {
            [LANG_ENGLISH]: '<div>Since how many <b>years</b> have you been working ?</div>',
            [LANG_HINGLISH]: 'Aap kitne saal se kaam kar rahe ko ?',
            [LANG_HINDI]: 'आप कितने साल से काम कर रहे हो ?',
            [LANG_THAI]: 'คุณทำงานมากี่ปีแล้ว',
        },
        speak: {
            [LANG_ENGLISH]: 'Since how many years have you been working ?',
            [LANG_HINGLISH]: 'आप कितने साल से काम कर रहे हो ?',
            [LANG_HINDI]: 'आप कितने साल से काम कर रहे हो ?',
            [LANG_THAI]: 'คุณทำงานมากี่ปีแล้ว',
        },
        [OUTPUT]: OUTPUT_TEXT,
        [ASK_INPUT]: true,
    },
    [QUESTION_JOB_REFERENCE]: {
        text: {
            [LANG_ENGLISH]: 'Do you want to do this job ?',
            [LANG_HINGLISH]: 'Kya aap ye kaam karna chahate ho ?',
            [LANG_HINDI]: 'क्या आप ये काम करना चाहते हो ?',
            [LANG_THAI]: 'คุณต้องการทำงานที่นี่หรือไม่',
        },
        speak: {
            [LANG_ENGLISH]: 'Do you want to do this job ?',
            [LANG_HINGLISH]: 'क्या आप ये काम करना चाहते हो ?',
            [LANG_HINDI]: 'क्या आप ये काम करना चाहते हो ?',
            [LANG_THAI]: 'คุณต้องการทำงานที่นี่หรือไม่',
        },
        [OUTPUT]: OUTPUT_JOB_REFERENCE,
    },
    [WELCOME_JOB_REFERENCE_NO_MESSAGE]: {
        text: {
            [LANG_ENGLISH]: '',
            [LANG_HINGLISH]: '',
            [LANG_HINDI]: '',
        },
        speak: {
            [LANG_ENGLISH]: '',
            [LANG_HINGLISH]: '',
            [LANG_HINDI]: '',
        },
        [OUTPUT]: OUTPUT_JOB_REFERENCE,
    },
    [QUESTION_WHY_MORE_ATTRIBUTES]: {
        text: {
            [LANG_ENGLISH]: 'Lets complete your profile before applying for jobs. This will help you get better jobs.',
            [LANG_HINGLISH]: 'Job apply karne se pehle apki profile poori kar lo. Isse apko kaam milne ka chance badh jayega. ',
            [LANG_HINDI]: 'जौब अप्लाई करने से पहले आपकी प्रोफाइल पूरी कर लो. इस्से आपको काम मिलने का चांस बढ़ जायेगा.',
            [LANG_THAI]: 'กรอกข้อมูลส่วนตัวของคุณก่อนสมัครงาน สิ่งนี้จะทำให้งานของคุณดีขึ้น',
        },
        speak: {
            [LANG_ENGLISH]: 'Lets complete your profile before applying for jobs. This will help you get better jobs.',
            [LANG_HINGLISH]: 'जौब अप्लाई करने से पहले आपकी प्रोफाइल पूरी कर लो. इस्से आपको काम मिलने का चांस बढ़ जायेगा.',
            [LANG_HINDI]: 'जौब अप्लाई करने से पहले आपकी प्रोफाइल पूरी कर लो. इस्से आपको काम मिलने का चांस बढ़ जायेगा.',
            [LANG_THAI]: 'กรอกข้อมูลส่วนตัวของคุณก่อนสมัครงาน สิ่งนี้จะทำให้งานของคุณดีขึ้น',
        },
        [OUTPUT]: OUTPUT_SINGLE_CHOICE,
        [OPTIONS]: [OPTION_YES],
        [OPTION_DISPLAYS]: () => 'OK',
        [ASK_INPUT]: true,
    },

    [QUESTION_VEG]: {
        text: {
            [LANG_ENGLISH]: '<div>Do you make <b>non-veg</b> ?</div>',
            [LANG_HINGLISH]: '<div>Kya aap <b>non-veg</b> banate ho ?</div>',
            [LANG_HINDI]: '<div>क्या आप <b>नौन वेज</b> बनाते हो ?</div>',
            [LANG_THAI]: 'คุณทำอาหารมังสวิรัติหรือไม่ ?',
        },
        speak: {
            [LANG_ENGLISH]: 'Do you make non-veg ?',
            [LANG_HINGLISH]: 'क्या आप नौन वेज बनाते हो ?',
            [LANG_HINDI]: 'क्या आप नौन वेज बनाते हो ?',
            [LANG_THAI]: 'คุณทำอาหารมังสวิรัติหรือไม่ ?',
        },
        [OUTPUT]: OUTPUT_SINGLE_CHOICE,
        [OPTIONS]: [OPTION_VEG_ONLY, OPTION_VEG_NON_VEG],
        [OPTION_DISPLAYS]: (x) => VEG_NONVEG_DISPLAY_FN[x],
        [ASK_INPUT]: true,
    },
    [QUESTION_CUISINES]: {
        text: {
            [LANG_ENGLISH]: '<div>What <b>cuisines</b> do you make ?</div>',
            [LANG_HINGLISH]: '<div>Aap kya kya <b>cuisine</b> banate ho ?</div>',
            [LANG_HINDI]: '<div>आप क्या क्या <b>कुज़ीन</b> बनाते हो ?</div>',
            [LANG_THAI]: 'คุณทำอาหารอะไร',
        },
        speak: {
            [LANG_ENGLISH]: 'What cuisines do you make ?',
            [LANG_HINGLISH]: 'आप क्या क्या कुज़ीन बनाते हो ?',
            [LANG_HINDI]: 'आप क्या क्या कुज़ीन बनाते हो ?',
            [LANG_THAI]: 'คุณทำอาหารอะไร',
        },
        [OUTPUT]: OUTPUT_MULTIPLE_CHOICE,
        [OPTIONS]: [],
        [ASK_INPUT]: true,
    },
    [QUESTION_RESTAURANT_SKILLS_CONFIRM]: {
        text: {
            [LANG_ENGLISH]: '<div>Can you work in a <b>restaurant</b> ?</div>',
            [LANG_HINGLISH]: '<div>Kya aap <b>restaurant</b> me kaam kar sakte ho ?</div>',
            [LANG_HINDI]: '<div>क्या आप <b>होटल</b> में काम कर सकते हो ?</div>',
            [LANG_THAI]: 'คุณทำงานร้านอาหารได้ไหม',
        },
        speak: {
            [LANG_ENGLISH]: 'Can you work in a restaurant ?',
            [LANG_HINGLISH]: 'क्या आप होटल में काम कर सकते हो ?',
            [LANG_HINDI]: 'क्या आप होटल में काम कर सकते हो ?',
            [LANG_THAI]: 'คุณทำงานร้านอาหารได้ไหม',
        },
        [OUTPUT]: OUTPUT_SINGLE_CHOICE,
        [OPTIONS]: [OPTION_YES, OPTION_NO],
        [OPTION_DISPLAYS]: (x) => YES_NO_DISPLAY_FN[x],
        [ASK_INPUT]: true,
    },
    [QUESTION_RESTAURANT_SKILLS]: {
        text: {
            [LANG_ENGLISH]: 'What position do you want to work in a hotel as ?',
            [LANG_HINGLISH]: 'Hotel ka kya kya kaam aata hai ?',
            [LANG_HINDI]: 'होटल का क्या क्या काम आता है ?',
            [LANG_THAI]: 'คุณทำอะไรได้บ้างในโรงแรม',
        },
        speak: {
            [LANG_ENGLISH]: 'What position do you want to work in a hotel as ?',
            [LANG_HINGLISH]: 'होटल का क्या क्या काम आता है ?',
            [LANG_HINDI]: 'होटल का क्या क्या काम आता है ?',
            [LANG_THAI]: 'คุณทำอะไรได้บ้างในโรงแรม',
        },
        [OUTPUT]: OUTPUT_MULTIPLE_CHOICE,
        [OPTIONS]: RESTAURANT_SKILLS,
        [ASK_INPUT]: true,
    },
    [QUESTION_CREATE_ID]: {
        text: {
            [LANG_ENGLISH]: 'Now I will create your profile.',
            [LANG_HINGLISH]: 'Ab aapki profile ban jayegi.',
            [LANG_HINDI]: 'अब आपकी प्रोफाइल बन जाएगी.',
            [LANG_THAI]: 'ตอนนี้ฉันจะสร้างโปรไฟล์ของคุณ',
        },
        speak: {
            [LANG_ENGLISH]: 'Now I will create your profile.',
            [LANG_HINGLISH]: 'अब आपकी प्रोफाइल बन जाएगी.',
            [LANG_HINDI]: 'अब आपकी प्रोफाइल बन जाएगी.',
            [LANG_THAI]: 'ตอนนี้ฉันจะสร้างโปรไฟล์ของคุณ',
        },
        [OUTPUT]: OUTPUT_SINGLE_CHOICE,
        [OPTIONS]: [OPTION_YES],
        [OPTION_DISPLAYS]: () => 'OK',
        [ASK_INPUT]: true,
    },
    [QUESTION_SHOW_ID_CARD_NO_MESSAGE]: {
        text: {
            [LANG_ENGLISH]: '',
            [LANG_HINGLISH]: '',
            [LANG_HINDI]: '',
        },
        speak: {
            [LANG_ENGLISH]: '',
            [LANG_HINGLISH]: '',
            [LANG_HINDI]: '',
        },
        [OUTPUT]: OUTPUT_ID_CARD,
        [TIME_DELAY]: 500,
        [ASK_INPUT]: false,
    },
    [WELCOME_SHOW_ID_CARD_NO_MESSAGE]: {
        text: {
            [LANG_ENGLISH]: '',
            [LANG_HINGLISH]: '',
            [LANG_HINDI]: '',
        },
        speak: {
            [LANG_ENGLISH]: '',
            [LANG_HINGLISH]: '',
            [LANG_HINDI]: '',
        },
        [OUTPUT]: OUTPUT_ID_CARD,
        [TIME_DELAY]: 2500,
        [ASK_INPUT]: false,
    },
    [QUESTION_SHOW_ID_CARD]: {
        text: {
            [LANG_ENGLISH]: '<div>This is your <b>ID card</b>. Show this to the employer, it will make a good impression</div>',
            [LANG_HINGLISH]: '<div>Ye aapka <b>ID card</b> hai. Customer ke ghar pe dikha dena, apka impression acha padega</div>',
            [LANG_HINDI]: '<div>ये आपका आई <b>डी कार्ड</b> है. कस्टमर के घर पे दिखा देना. आपका इम्प्रैशन अच्छा पड़ेगा.</div>',
            [LANG_THAI]: 'นี่คือบัตรประจำตัวประชาชนของคุณ แสดงต่อนายจ้างเพื่อความประทับใจที่ดีขึ้น',
        },
        speak: {
            [LANG_ENGLISH]: 'This is your ID card. Show this to the employer, it will make a good impression',
            [LANG_HINGLISH]: 'ये आपका आई डी कार्ड है. कस्टमर के घर पे दिखा देना. आपका इम्प्रैशन अच्छा पड़ेगा.',
            [LANG_HINDI]: 'ये आपका आई डी कार्ड है. कस्टमर के घर पे दिखा देना. आपका इम्प्रैशन अच्छा पड़ेगा.',
            [LANG_THAI]: 'นี่คือบัตรประจำตัวประชาชนของคุณ แสดงต่อนายจ้างเพื่อความประทับใจที่ดีขึ้น',
        },
        [OUTPUT]: OUTPUT_ID_CARD,
        [TIME_DELAY]: 2500,
        [ASK_INPUT]: false,
    },
    [QUESTION_SHOW_ID_CARD_2]: {
        text: {
            [LANG_ENGLISH]: 'This is your ID card. Show it to the customer',
            [LANG_HINGLISH]: 'Ye aapka ID card update ho gaya hai. Customer ke ghar jaake ye dikha dena',
            [LANG_HINDI]: 'ये आपका आई डी कार्ड अपडेट हो गया है. कस्टमर के घर पे दिखा देना. आपका इम्प्रैशन अच्छा पड़ेगा.',
            [LANG_THAI]: 'นี่คือบัตรประจำตัวประชาชนของคุณ แสดงต่อนายจ้างเพื่อความประทับใจที่ดีขึ้น',
        },
        speak: {
            [LANG_ENGLISH]: 'This is your ID card. Show it to the customer',
            [LANG_HINGLISH]: 'ये आपका आई डी कार्ड अपडेट हो गया है. कस्टमर के घर पे दिखा देना. आपका इम्प्रैशन अच्छा पड़ेगा.',
            [LANG_HINDI]: 'ये आपका आई डी कार्ड अपडेट हो गया है. कस्टमर के घर पे दिखा देना. आपका इम्प्रैशन अच्छा पड़ेगा.',
            [LANG_THAI]: 'นี่คือบัตรประจำตัวประชาชนของคุณ แสดงต่อนายจ้างเพื่อความประทับใจที่ดีขึ้น',
        },
        [OUTPUT]: OUTPUT_ID_CARD,
        [TIME_DELAY]: 2500,
        [ASK_INPUT]: false,
    },
    [QUESTION_WORK_CATEGORIES]: {
        text: {
            [LANG_ENGLISH]: 'What all work can you do ?',
            [LANG_HINGLISH]: '{{gender_prefix}} aapko kya kya kaam aata hai ?',
            [LANG_HINDI]: 'आपको क्या क्या काम आता है ?',
            [LANG_THAI]: 'คุณทำงานอะไรได้บ้าง',
        },
        speak: {
            [LANG_ENGLISH]: 'What all work can you do ?',
            [LANG_HINGLISH]: 'आपको क्या क्या काम आता है ?',
            [LANG_HINDI]: 'आपको क्या क्या काम आता है ?',
            [LANG_THAI]: 'คุณทำงานอะไรได้บ้าง',
        },
        [OUTPUT]: OUTPUT_SINGLE_CHOICE,
        [OPTIONS]: [WORK_COOKING, WORK_CLEANING],
        [OPTION_DISPLAYS]: (x) => WORK_COOKING_DISPLAY_FN[x],
        [ASK_INPUT]: true,
    },

    [QUESTION_SEE_TODAYS_WORK]: {
        text: {
            [LANG_ENGLISH]: '<div>Now I will show you 3 jobs. <b>Apply only if you want to work there</b></div>',
            [LANG_HINGLISH]: '<div>Ab ham apko 3 kaam dikhayenge. <b>Wahi kaam chuniye jo ap karna chahate hain.</b></div>',
            [LANG_HINDI]: '<div>अब हम आपको तीन काम दिखाएंगे । <b>वही काम चुनिए जो आप करना चाहते हैं</b></div>',
            [LANG_THAI]: 'ตอนนี้ฉันจะแสดงให้คุณ 3 งาน สมัครเฉพาะคนที่คุณต้องการทำงาน',
        },
        speak: {
            [LANG_ENGLISH]: 'Now I will show you 3 jobs. Apply only if you want to work there',
            [LANG_HINGLISH]: 'अब हम आपको तीन काम दिखाएंगे. वही काम चुनिए जो आप करना चाहते हैं',
            [LANG_HINDI]: 'अब हम आपको तीन काम दिखाएंगे. वही काम चुनिए जो आप करना चाहते हैं',
            [LANG_THAI]: 'ตอนนี้ฉันจะแสดงให้คุณ 3 งาน สมัครเฉพาะคนที่คุณต้องการทำงาน',
        },
        [OUTPUT]: OUTPUT_NONE,
    },
    [QUESTION_MORE_CONTEXT]: {
        text: {
            [LANG_ENGLISH]: 'Now I will ask you some more details to show you better jobs',
            [LANG_HINGLISH]: 'Ab aapse kuch aur details poochenge, taki apko acha kaam mile.',
            [LANG_HINDI]: 'अब आपसे कुछ और डिटेल्स पूछेंगे ताकी आपको अच्छा काम मिले.',
            [LANG_THAI]: 'ตอนนี้ฉันจะถามคำถามคุณเพื่อแสดงให้คุณเห็นงานที่ดี',
        },
        speak: {
            [LANG_ENGLISH]: 'Now I will ask you some more details to show you better jobs',
            [LANG_HINGLISH]: 'अब आपसे कुछ और डिटेल्स पूछेंगे ताकी आपको अच्छा काम मिले.',
            [LANG_HINDI]: 'अब आपसे कुछ और डिटेल्स पूछेंगे ताकी आपको अच्छा काम मिले.',
            [LANG_THAI]: 'ตอนนี้ฉันจะถามคำถามคุณเพื่อแสดงให้คุณเห็นงานที่ดี',
        },
        [OUTPUT]: OUTPUT_NONE,
        [TIME_DELAY]: 2500,
        [ASK_INPUT]: false,
    },
    [QUESTION_AADHAR_PHOTO]: {
        text: {
            [LANG_ENGLISH]: '<div>Upload your <b>aadhar card</b> photo.</div>',
            [LANG_HINGLISH]: '<div>Aapke <b>aadhar card</b> ki photo daal do.</div>',
            [LANG_HINDI]: '<div>आपके <b>आधार कार्ड</b> की फोटो दाल दो.</div>',
            [LANG_THAI]: 'อัปโหลดบัตรประจำตัวของคุณ',
        },
        speak: {
            [LANG_ENGLISH]: 'Upload your aadhar card photo.',
            [LANG_HINGLISH]: 'आपके आधार कार्ड की फोटो दाल दो.',
            [LANG_HINDI]: 'आपके आधार कार्ड की फोटो दाल दो.',
            [LANG_THAI]: 'อัปโหลดบัตรประจำตัวของคุณ',
        },
        [OUTPUT]: OUTPUT_IMAGE,
        [OPTIONS]: ['OK'],
        [ASK_INPUT]: true,
    },
    [QUESTION_PROFILE_PHOTO]: {
        text: {
            [LANG_ENGLISH]: '<div>Click a nice <b>selfie</b>, this will go on your ID card</div>',
            [LANG_HINGLISH]: '<div>Aapki ek achi si <b>selfie</b> ya passport photo daal do, ye apke ID card pe lagegi</div>',
            [LANG_HINDI]: '<div>आपकी एक अच्छी सी <b>सेल्फी</b> या पासपोर्ट फोटो दाल दो । ये आपके आई डी कार्ड पे लगेगी</div>',
            [LANG_THAI]: 'คลิกรูปภาพที่ดีของคุณเพื่อใส่ในโปรไฟล์ของคุณ',
        },
        speak: {
            [LANG_ENGLISH]: 'Click a nice selfie, this will go on your ID card',
            [LANG_HINGLISH]: 'आपकी एक अच्छी सी सेल्फी या पासपोर्ट फोटो दाल दो. ये आपके आई डी कार्ड पे लगेगी.',
            [LANG_HINDI]: 'आपकी एक अच्छी सी सेल्फी या पासपोर्ट फोटो दाल दो. ये आपके आई डी कार्ड पे लगेगी.',
            [LANG_THAI]: 'คลิกรูปภาพที่ดีของคุณเพื่อใส่ในโปรไฟล์ของคุณ',
        },
        [OUTPUT]: OUTPUT_IMAGE,
        [OPTIONS]: ['OK'],
        [ASK_INPUT]: true,
    },
    [QUESTION_HOMETOWN]: {
        text: {
            [LANG_ENGLISH]: '<div>Where is your hometown ? Write the <b>district</b></div>',
            [LANG_HINGLISH]: '<div>Aapka gaon kahan hai ? <b>Zila</b> bataiye</div>',
            [LANG_HINDI]: '<div>आपका गांव कहाँ है. <b>ज़िला</b> बताइएं.</div>',
            [LANG_THAI]: 'บ้านเกิดของคุณอยู่ที่ไหน',
        },
        speak: {
            [LANG_ENGLISH]: 'Where is your hometown ? Write the district',
            [LANG_HINGLISH]: 'आपका गांव कहाँ है. ज़िला बताइएं.',
            [LANG_HINDI]: 'आपका गांव कहाँ है. ज़िला बताइएं.',
            [LANG_THAI]: 'บ้านเกิดของคุณอยู่ที่ไหน',
        },
        [OUTPUT]: OUTPUT_PLACES_AUTOCOMPLETE,
        [ASK_INPUT]: true,
    },
    [QUESTION_LANGUAGES]: {
        text: {
            [LANG_ENGLISH]: '<div>What <b>languages</b> can you speak ?</div>',
            [LANG_HINGLISH]: '<div>Aap kaun kaunsi <b>bhashayein</b> bol lete hain ?</div>',
            [LANG_HINDI]: '<div>आप कौन कौनसी <b>भाषाएं</b> बोल लेते हैं.</div>',
            [LANG_THAI]: 'ภาษาอะไรที่คุณพูด ?',
        },
        speak: {
            [LANG_ENGLISH]: 'What languages can you speak ?',
            [LANG_HINGLISH]: 'आप कौनसी भाषाएं बोल लेते हैं.',
            [LANG_HINDI]: 'आप कौनसी भाषाएं बोल लेते हैं.',
            [LANG_THAI]: 'ภาษาอะไรที่คุณพูด ?',
        },
        [OUTPUT]: OUTPUT_MULTIPLE_CHOICE,
        [OPTIONS]: LANGUAGES,
        [ASK_INPUT]: true,
    },
    [QUESTION_EDUCATION]: {
        text: {
            [LANG_ENGLISH]: 'Whats your education qualification ?',
            [LANG_HINGLISH]: 'Aap kitna padhe ho ?',
            [LANG_HINDI]: 'आप कितना पढ़े हैं.',
            [LANG_THAI]: 'การศึกษาของคุณคืออะไร?',
        },
        speak: {
            [LANG_ENGLISH]: 'Whats your education qualification ?',
            [LANG_HINGLISH]: 'आप कितना पढ़े हैं.',
            [LANG_HINDI]: 'आप कितना पढ़े हैं.',
            [LANG_THAI]: 'การศึกษาของคุณคืออะไร?',
        },
        [OUTPUT]: OUTPUT_TEXT,
        [ASK_INPUT]: true,
    },

    [QUESTION_CHECK_BACK_TOMORROW]: {
        text: {
            [LANG_ENGLISH]: 'I will show you 3 jobs daily. Please come back tomorrow for more jobs.',
            [LANG_HINGLISH]: 'Ham apko roz 3 kaam dikhayenge. Aur kaam dekhne ke liye kal fir aaiye.',
            [LANG_HINDI]: 'आपको रोज़ तीन काम दिखाए जायेंगे । और काम देखने के लिए कल फिर आइये',
            [LANG_THAI]: 'ฉันจะแสดงสามงานให้คุณทุกวัน กลับมาอีกในวันพรุ่งนี้',
        },
        speak: {
            [LANG_ENGLISH]: 'I will show you 3 jobs daily. Please come back tomorrow for more jobs.',
            [LANG_HINGLISH]: 'आपको रोज़ तीन काम दिखाए जायेंगे. और काम देखने के लिए कल फिर आइये',
            [LANG_HINDI]: 'आपको रोज़ तीन काम दिखाए जायेंगे. और काम देखने के लिए कल फिर आइये',
            [LANG_THAI]: 'ฉันจะแสดงสามงานให้คุณทุกวัน กลับมาอีกในวันพรุ่งนี้',
        },
        [OUTPUT]: OUTPUT_SINGLE_CHOICE,
        [OPTIONS]: ['Bye'],
        [ASK_INPUT]: true,
    },

    [WELCOME_MSG_2]: {
        text: {
            [LANG_ENGLISH]: 'Some of your details are pending. Please tell me so your ID card is complete, and you get better salary.',
            [LANG_HINGLISH]: 'Aapki kuch details baki hain, bata do, taki apka ID card complete ho jaye, aur apko achi salary mile.',
            [LANG_HINDI]: 'आपकी कुछ डिटेल्स अभी बाकी हैं, बता दो, ताकी आपका आई डी कार्ड पूरा हो जाये, और आपको अच्छी सैलरी मिले. ',
            [LANG_THAI]: 'รายละเอียดบางอย่างขาดหายไป ทำให้สำเร็จเพื่อให้ได้งานและเงินเดือนที่ดีขึ้น',
        },
        speak: {
            [LANG_ENGLISH]: 'Some of your details are pending. Please tell me so your ID card is complete, and you get better salary.',
            [LANG_HINGLISH]: 'आपकी कुछ डिटेल्स अभी बाकी हैं, बता दो, ताकी आपका आई डी कार्ड पूरा हो जाये, और आपको अच्छी सैलरी मिले. ',
            [LANG_HINDI]: 'आपकी कुछ डिटेल्स अभी बाकी हैं, बता दो, ताकी आपका आई डी कार्ड पूरा हो जाये, और आपको अच्छी सैलरी मिले. ',
            [LANG_THAI]: 'รายละเอียดบางอย่างขาดหายไป ทำให้สำเร็จเพื่อให้ได้งานและเงินเดือนที่ดีขึ้น',
        },
        [OUTPUT]: OUTPUT_NONE,
        [ASK_INPUT]: false,
    },
    [WELCOME_MSG_4]: {
        text: {
            [LANG_ENGLISH]: 'Now I will ask your details to show you better jobs. People who complete their profile are able to get better jobs',
            [LANG_HINGLISH]: 'Ab ham aapki details poochenge taaki apko acha kaam mile. Jin logon ne apni profile poori ki hai, wo achi salary kama lete hain.',
            [LANG_HINDI]: 'अब हम आपकी डिटेल्स पूछेंगे ताकी आपको अच्छा काम मिले. जिन लोगों ने अपनी प्रोफाइल पूरी की है, वो अच्छे पैसे कमा लेते हैं',
            [LANG_THAI]: 'ตอนนี้ฉันจะถามรายละเอียดของคุณ ผู้ที่กรอกรายละเอียดจะได้รับงานและเงินเดือนที่ดีขึ้น',
        },
        speak: {
            [LANG_ENGLISH]: 'Now I will ask your details to show you better jobs. People who complete their profile are able to get better jobs',
            [LANG_HINGLISH]: 'अब हम आपकी डिटेल्स पूछेंगे ताकी आपको अच्छा काम मिले. जिन लोगों ने अपनी प्रोफाइल पूरी की है, वो अच्छे पैसे कमा लेते हैं',
            [LANG_HINDI]: 'अब हम आपकी डिटेल्स पूछेंगे ताकी आपको अच्छा काम मिले. जिन लोगों ने अपनी प्रोफाइल पूरी की है, वो अच्छे पैसे कमा लेते हैं',
            [LANG_THAI]: 'ตอนนี้ฉันจะถามรายละเอียดของคุณ ผู้ที่กรอกรายละเอียดจะได้รับงานและเงินเดือนที่ดีขึ้น',
        },
        [OUTPUT]: OUTPUT_NONE,
        [ASK_INPUT]: false,
    },
    [WELCOME_MSG_3_JOBS_DAILY]: {
        text: {
            [LANG_ENGLISH]: 'Bangalore has lots of jobs. I will show you 3 jobs everyday',
            [LANG_HINGLISH]: 'Bangalore me dher saare kaam hain. Roz apko 3 kaam dikhayenge',
            [LANG_HINDI]: 'बैंगलोर में ढेर सारे काम हैं. रोज़ आपको तीन काम दिखाएंगे.',
            [LANG_THAI]: 'ฉันมีงานเยอะ ฉันจะแสดงสามงานให้คุณทุกวัน',
        },
        speak: {
            [LANG_ENGLISH]: 'Bangalore has lots of jobs. I will show you 3 jobs everyday',
            [LANG_HINGLISH]: 'बैंगलोर में ढेर सारे काम हैं. रोज़ आपको तीन काम दिखाएंगे.',
            [LANG_HINDI]: 'बैंगलोर में ढेर सारे काम हैं. रोज़ आपको तीन काम दिखाएंगे.',
            [LANG_THAI]: 'ฉันมีงานเยอะ ฉันจะแสดงสามงานให้คุณทุกวัน',
        },
        [OUTPUT]: OUTPUT_NONE,
        [ASK_INPUT]: false,
    },
    [WELCOME_MSG_3_JOBS_DAILY_WITH_EXAMPLE]: {
        text: {
            [LANG_ENGLISH]: 'Bangalore has lots of jobs. I will show you 3 jobs everyday, like this',
            [LANG_HINGLISH]: 'Bangalore me dher saare kaam hain. Roz apko 3 kaam dikhayenge, jaise ki ye',
            [LANG_HINDI]: 'बैंगलोर में ढेर सारे काम हैं. रोज़ आपको तीन काम दिखाएंगे जैसे की ये.',
            [LANG_THAI]: 'ฉันมีงานเยอะ ฉันจะแสดงให้คุณเห็นสามงานทุกวันเช่นนี้',
        },
        speak: {
            [LANG_ENGLISH]: 'Bangalore has lots of jobs. I will show you 3 jobs everyday, like this',
            [LANG_HINGLISH]: 'बैंगलोर में ढेर सारे काम हैं. रोज़ आपको तीन काम दिखाएंगे जैसे की ये.',
            [LANG_HINDI]: 'बैंगलोर में ढेर सारे काम हैं. रोज़ आपको तीन काम दिखाएंगे जैसे की ये.',
            [LANG_THAI]: 'ฉันมีงานเยอะ ฉันจะแสดงให้คุณเห็นสามงานทุกวันเช่นนี้',
        },
        [OUTPUT]: OUTPUT_NONE,
        [ASK_INPUT]: false,
    },


    [WELCOME_AUTO_START_AFTER]: {
        text: {
            [LANG_ENGLISH]: '',
            [LANG_HINGLISH]: '',
            [LANG_HINDI]: '',
        },
        speak: {
            [LANG_ENGLISH]: '',
            [LANG_HINGLISH]: '',
            [LANG_HINDI]: '',
        },
        [OUTPUT]: OUTPUT_NONE,
        [TIME_DELAY]: 2500,
        [ASK_INPUT]: false,
    },

    [QUESTION_VIDEO_INTRO]: {
        text: {
            [LANG_ENGLISH]: 'Lets record a video introduction of you',
            [LANG_HINGLISH]: 'Apka video record kar lo',
            [LANG_HINDI]: 'आपका वीडियो बना लो',
            [LANG_THAI]: 'บันทึกวิดีโอของคุณ',
        },
        speak: {
            [LANG_ENGLISH]: 'Lets record a video introduction of you',
            [LANG_HINGLISH]: 'Apka video record kar lo',
            [LANG_HINDI]: 'आपका वीडियो बना लो',
            [LANG_THAI]: 'บันทึกวิดีโอของคุณ',
        },
        [OUTPUT]: OUTPUT_VIDEO,
        [ASK_INPUT]: true,
    },
    [QUESTION_AUDIO_ENQUIRY]: {
        text: {
            [LANG_ENGLISH]: 'Lets record an audio introduction of you',
            [LANG_HINGLISH]: 'Apka audio record kar lo',
            [LANG_HINDI]: 'बोल के मैसेज रिकॉर्ड कर लो',
            [LANG_THAI]: 'บันทึกเสียงของคุณ',
        },
        speak: {
            [LANG_ENGLISH]: 'Lets record an audio introduction of you',
            [LANG_HINGLISH]: 'Apka audio record kar lo',
            [LANG_HINDI]: 'बोल के मैसेज रिकॉर्ड कर लो',
            [LANG_THAI]: 'บันทึกเสียงของคุณ',
        },
        [OUTPUT]: OUTPUT_AUDIO,
        [ASK_INPUT]: true,
    },

    [WELCOME_MSG_1]: {
        text: {
            [LANG_ENGLISH]: '<div><b>HELO</b> ! I will help you find good jobs.</div>',
            [LANG_HINGLISH]: '<div><b>HELO</b> ! Main apko kaam khojne me help karoongi.</div>',
            [LANG_HINDI]: "<div><b>HELO</b> ! मैं आपको काम खोजने में हेल्प करूंगी</div>",
            [LANG_THAI]: '<div><b>HELO</b> ! ฉันจะช่วยคุณหางานที่ดี</div>',
        },
        speak: {
            [LANG_ENGLISH]: 'HELO ! I will help you find good jobs.',
            [LANG_HINGLISH]: 'HELO ! मैं आपको काम खोजने में हेल्प करूंगी.',
            [LANG_HINDI]: 'HELO ! मैं आपको काम खोजने में हेल्प करूंगी.',
            [LANG_THAI]: 'HELO ! ฉันจะช่วยคุณหางานที่ดี',
        },
        [OUTPUT]: OUTPUT_NONE,
        [ASK_INPUT]: false,
    },

    [BLANK_MSG]: {
        text: {
            [LANG_ENGLISH]: '',
            [LANG_HINGLISH]: '',
            [LANG_HINDI]: '',
            [LANG_THAI]: '',
        },
        speak: {
            [LANG_ENGLISH]: '',
            [LANG_HINGLISH]: '',
            [LANG_HINDI]: '',
            [LANG_THAI]: '',
        },
        [OUTPUT]: OUTPUT_NONE,
        [ASK_INPUT]: false,
    },
};

ACTIONABLE_JOB_QUESTIONS.forEach(x => QUESTIONS[x] = {
    text: {
        [LANG_ENGLISH]: 'Do you want this job ?',
        [LANG_HINGLISH]: 'Kya aap ye kaam karna chahate ho ?',
        [LANG_HINDI]: 'क्या आप ये काम करना चाहते हो ?',
        [LANG_THAI]: 'คุณจะทำงานนี้ไหม',
    },
    speak: {
        [LANG_ENGLISH]: 'Do you want this job ?',
        [LANG_HINGLISH]: 'क्या आप ये काम करना चाहते हो ?',
        [LANG_HINDI]: 'क्या आप ये काम करना चाहते हो ?',
        [LANG_THAI]: 'คุณจะทำงานนี้ไหม',
    },
    [OUTPUT]: OUTPUT_JOB_ACTIONABLE,
    [ASK_INPUT]: true,
});

export const GENDER_PREFIX = {
    'MALE': {
        [LANG_ENGLISH]: 'Sir',
        [LANG_HINGLISH]: 'Bhaiya',
        [LANG_HINDI]: 'भइया',
        [LANG_THAI]: 'ท่าน',
    },
    'FEMALE': {
        [LANG_ENGLISH]: 'Madam',
        [LANG_HINGLISH]: 'Didi',
        [LANG_HINDI]: 'दीदी',
        [LANG_THAI]: 'แหม่ม',
    },
};


export const INCORRECT_PHONE_NUMBER = {
    [LANG_ENGLISH]: '<div>This number is wrong. Phone number has <b>10 digits</b></div>',
    [LANG_HINGLISH]: '<div>Ye number galat hai. Phone number <b>10 digit</b> ka hota hai</div>',
    [LANG_HINDI]: '<div>ये नंबर गलत है । फ़ोन नंबर <b>10 अक्षर</b> का होता है</div>',
    [LANG_THAI]: 'หมายเลขนี้ผิด หมายเลขโทรศัพท์คือ 10 หลัก',
};
export const IS_NAN_AGE = {
    [LANG_ENGLISH]: 'Age is required to find the right job. Please tell me your age in years',
    [LANG_HINGLISH]: 'Kaam karne ke liye sahi umar bataani zaroori hai. Apni umar saalon me batayen',
    [LANG_HINDI]: 'काम करने के लिए सही उम्र बतानी ज़रूरी है । अपनी उम्र सालों में बताएं',
    [LANG_THAI]: 'อายุเป็นสิ่งสำคัญ คุณอายุเท่าไหร่ ?',
};
export const AGE_OUT_OF_RANGE = {
    [LANG_ENGLISH]: '<div>Age should be between <b>14</b> and <b>80</b> years</div>',
    [LANG_HINGLISH]: '<div>Umar <b>14</b> aur <b>80</b> saal ke beech me honi chahiye</div>',
    [LANG_HINDI]: '<div>उम्र <b>14</b> और <b>80</b> साल के बीच मे होनी चाहिए</div>',
    [LANG_THAI]: 'อายุควรอยู่ระหว่าง 14 ถึง 80 ปี',
};
export const INCORRECT_EXPERIENCE = {
    [LANG_ENGLISH]: 'Correct experience will get you better salary. Tell me your experience in years',
    [LANG_HINGLISH]: 'Sahi experience bataane se apko behtar salary milega. Apna experience saalon me batayen',
    [LANG_HINDI]: 'सही अनुभव बताने से आपको बेहतर पगार मिलेगी । अपना अनुभव सालों में बताएं',
    [LANG_THAI]: 'คุณทำงานมากี่ปีแล้ว',
};
export const DIDNT_UNDERSTAND = {
    [LANG_ENGLISH]: 'Sorry I didnt understand. Please say that again',
    [LANG_HINGLISH]: 'Samajh nahi aaya {{gender_prefix}}, dobara bataiye',
    [LANG_HINDI]: 'समझ नहीं आया {{gender_prefix}} दोबारा बताइये',
    [LANG_THAI]: 'ฉันไม่เข้าใจ. บอกอีกที',
};

export const GLOBAL_CONTEXT = {
    partner_care_number: '080-4710-3360',
};
