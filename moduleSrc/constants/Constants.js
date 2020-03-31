import {WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH} from "../platform/Util";


export const APP_VERSION = '2.0.0';
export const FORCE_UPDATE_AFTER_APP_VERSION = '2.0.0';
export const APP_UPDATE_URL = 'https://heloprotocol.app.link/fkJpfhd2T4';

export const WEBSOCKET_PORT = 8093;

export const API_URL = 'https://api.heloprotocol.in';
// export const API_URL = 'http://localhost:7071';
// export const API_URL = 'http://192.168.0.106:7071';

export const WEBSOCKET_URL = 'wss://api.heloprotocol.in';
// export const WEBSOCKET_URL = 'ws://localhost:' + WEBSOCKET_PORT;
// export const WEBSOCKET_URL = 'ws://192.168.0.100:' + WEBSOCKET_PORT;
// export const WEBSOCKET_URL = 'ws://192.168.3.181:' + WEBSOCKET_PORT;

export const IMAGES_URL = 'https://images-lb.heloprotocol.in';
// export const IMAGES_URL = 'https://images-lb-staging.heloprotocol.in';
// export const IMAGES_URL = 'http://localhost:7071';

export const MWEB_URL = 'https://www.heloprotocol.in';
// export const MWEB_URL = 'http://192.168.0.100:8092';
// export const MWEB_URL = '';

export const VIDEOS_URL = 'https://videos-lb.heloprotocol.in';
export const AUDIOS_URL = 'https://audios-lb.heloprotocol.in';
export const FILES_URL = 'https://files-lb.heloprotocol.in';

export const COLLECTION_BOTS = 'bot';
export const FIREBASE_CHAT_MESSAGES_DB_NAME = 'chat-messages';
export const FIREBASE_GROUPS_DB_NAME = 'groups';
export const CHAT_MESSAGES_DOC_NAME_PREFIX = '';            // For testing
export const GROUPS_DOC_NAME_PREFIX = '';                   // For testing

export const INNER_HEIGHT = WINDOW_INNER_HEIGHT;
export const INNER_WIDTH = WINDOW_INNER_WIDTH;
export const IS_MOBILE_SCREEN = WINDOW_INNER_WIDTH < 600;

export const CUSTOMER_CARE_HELPLINE = '080-4568-3501';
export const PARTNER_CARE_HELPLINE = '080-4710-3360';

export const EMAIL_ID = 'contact@heloprotocol.in';
export const OFFICE_LOCATION = 'MG Road, Bangalore';

export const MAP_CENTER_PIN_IMG = 'https://images-lb.heloprotocol.in/map-pin-filled.png-17231-86697-1553957693482.png';
export const BANGALORE_LAT = 12.967972;
export const BANGALORE_LNG = 77.641199;
export const GOOGLE_MAPS_API_KEY = '';

// API's
export const SEND_OTP_TO_PHONE_API = '/v1/otp/sendToPhone';
export const VERIFY_OTP_API = '/v1/otp/verify';
export const NEW_CUSTOMER_SIGNUP_API = '/v2/crm/newCustomer';
export const NEW_SUPPLY_SIGNUP_API = '/v2/srm/newRequest';
export const SUPPLY_SEARCH_API = '/v2/srm/supply/search';
export const CUSTOMER_SEARCH_API = '/v2/crm/customer/search';
export const GET_SUPPLY_DETAILS_API = '/v2/srm/supply/view';
export const GET_JOB_ATTRIBUTES_API = '/v2/srm/allJobAttributes';
export const ALL_SUPPLY_NAMES_API = '/v2/srm/supply/get-all-names';
export const ALL_CUSTOMER_NAMES_API = '/v2/crm/customer/get-all-names';
export const ALL_VISITOR_NAMES_API = '/v2/vrm/visitor/get-all-names';
export const GET_SIMILAR_PROFILES_API = '/v2/srm/supply/similar';
export const ADD_JOB_REQUIREMENT_API = '/v2/crm/addJobRequirement';
export const UPDATE_JOB_REQUIREMENT_API = '/v2/crm/updateJobRequirement';
export const DELETE_JOB_REQUIREMENT_API = '/v2/crm/deleteJobRequirement';
export const EXOTEL_CONNECT_API = '/v1/exotel/conference_cust_supply';
export const FIRESTORE_INIT_CHANNEL_API = '/v1/firestore/initChannel';
export const LOG_DATA_API = '/debug/log-data/log';
export const SEND_SMS_API = '/v1/sms/send';
export const DETECT_TEXT_IN_IMAGE_API = '/v1/text-detection/image';
export const DETECT_TEXT_IN_PDF_API = '/v1/text-detection/pdf';
export const WHAT_TO_DO_WITH_APP_API = '/v1/app/what-to-do';

export const GET_NEW_JOBS_API = '/v1/new-jobs/getJobs';
export const APPLY_FOR_NEW_JOB_API = '/v1/new-jobs/applyForJob';
export const REJECT_JOB_API = '/v1/new-jobs/rejectJob';

export const CRUDS_CREATE_API = '/v1/cruds/create';
export const CRUDS_READ_API = '/v1/cruds/read';
export const CRUDS_UPDATE_API = '/v1/cruds/update';
export const CRUDS_SEARCH_API = '/v1/cruds/search';
export const UPDATE_DEVICE_ID_MAPPING_API = '/deviceid/updateMapping';

export const KV_STORE_GET_API = '/key-value-store/get';
export const KV_STORE_SET_API = '/key-value-store/set';
export const KV_STORE_MGET_API = '/key-value-store/mget';
export const KV_STORE_HGETALL_API = '/key-value-store/hgetall';
export const KV_STORE_HMGET_API = '/key-value-store/hmget';
export const KV_STORE_HSET_API = '/key-value-store/hset';
export const KV_STORE_GET_SETMEMBERS_API = '/key-value-store/get-setMembers';

export const MAID_RECOMMENDATION_API = '/v2/ratings/cook_recommendation';
export const TRUECALLER_STATUS_API = '/v1/truecaller/status';


export const DESCRIPTOR_CUSTOMER = 'customer';
export const DESCRIPTOR_SUPPLY = 'supply';
export const DESCRIPTOR_VISITOR = 'visitor';
export const DESCRIPTOR_GOLD_USER = 'gold-user';
export const DESCRIPTOR_GOLD_CODE = 'gold-code';
export const DESCRIPTOR_USER_CHECKIN = 'user-checkin';
export const DESCRIPTOR_GOLD_GUEST_LIST = 'gold-guest-list';
export const DESCRIPTOR_ESTABLISHMENT = 'establishment';

export const DESCRIPTOR_JOB_REQUIREMENT = 'job-requirement';
export const DESCRIPTOR_CHAT_SESSION = 'chat-session';
export const DESCRIPTOR_CHAT_DEVICES = 'chat-devices';

export const DESCRIPTOR_HELO_CHAT_MESSAGE = "helo-chat-message";
export const DESCRIPTOR_HELO_GROUP = "helo-group";

export const PHONE_NUMBER_KEY = 'phone-number-1';
export const CONTACTS_STORED_KEY = 'contacts-stored';
export const AUTH_TOKEN_KEY = 'auth-token-key';
export const X_AUTH_HEADER = 'X-Authorization-Token';
export const X_AUTH_TOKEN = '';

export const INFO_IMG_URL = 'https://images-lb.heloprotocol.in/81.png-1560-652566-1552576424939.png?name=signs.png';
export const TOAST_DURATION_MS = 3000;

export const HEADER_ICON = 'https://images-lb.heloprotocol.in/logo-focussed.png-47937-236622-1555160118812.png?name=header.png';
export const FACEBOOK_APP_ID = 637381620020868;

export const FACEBOOK_PAGE = 'https://fb.me/heloProtocol';
export const TWITTER_PAGE = 'https://twitter.com/HeloProtocol';

export const CATEGORY_MAID = 'MAID';
export const CATEGORY_NANNY = 'NANNY';
export const CATEGORY_ATTENDANT = 'ATTENDANT';
export const CATEGORY_COOK = 'COOK';
export const CATEGORY_SECURITY = 'SECURITY';
export const CATEGORY_OFFICE_BOY = 'OFFICE_BOY';
export const CATEGORY_STEWARD = 'STEWARD';
export const CATEGORY_VALET = 'VALET';
export const CATEGORY_BARTENDER = 'BARTENDER';
export const MAID_JOB_CATEGORIES = [
    CATEGORY_MAID, CATEGORY_NANNY, CATEGORY_ATTENDANT, CATEGORY_COOK,
];
export const RESTAURANT_JOB_CATEGORIES = [
    CATEGORY_COOK, CATEGORY_BARTENDER, CATEGORY_STEWARD, CATEGORY_VALET,
];
export const ALL_JOB_CATEGORIES = [
    CATEGORY_MAID, CATEGORY_NANNY, CATEGORY_ATTENDANT, CATEGORY_COOK, CATEGORY_SECURITY, CATEGORY_OFFICE_BOY,
    CATEGORY_STEWARD, CATEGORY_VALET,
    'DATA_ENTRY_OPERATOR', 'RECEPTIONIST', 'PANTRY_BOY', 'CAR_WASHER', 'DELIVERY_BOY',
    'BINNING_PACKING', 'GARDNER', 'DRIVER', 'TANK_CLEANER', 'ELECTRICIAN', 'PLUMBER',
    'KALYAN_MANTAP_CLEANER', 'TAILOR',
    'CLEANER',
    'OTHER',
];
export const RESTAURANT_SKILLS = [
    'EXECUTIVE_CHEF',
    'SOUS_CHEF',
    'CHEF_DE_PARTIE',
    'COMMI_1',
    'COMMI_2',
    'COMMI_3',
    'PASTRY_CHEF',
    'BAKER',
    'CLEANER',
];

export const BREAKFAST = 'BREAKFAST';
export const LUNCH = 'LUNCH';
export const DINNER = 'DINNER';

export const WORK_OPTION_PART_TIME = 'PART_TIME';
export const WORK_OPTION_FULL_TIME = 'FULL_TIME';
export const WORK_OPTION_LIVE_IN = 'LIVE_IN';
export const WORK_OPTIONS = [
    WORK_OPTION_PART_TIME, WORK_OPTION_FULL_TIME, WORK_OPTION_LIVE_IN,
];

export const WORK_LOC_TYPE_HOME = 'HOME';
export const WORK_LOC_TYPE_RESTAURANT = 'RESTAURANT';
export const WORK_LOC_TYPE_PG = 'PG';
export const WORK_LOC_TYPE_OFFICE = 'OFFICE';
export const WORK_LOC_TYPES = [
    WORK_LOC_TYPE_HOME,
    WORK_LOC_TYPE_RESTAURANT,
    WORK_LOC_TYPE_PG,
    WORK_LOC_TYPE_OFFICE,
];

export const LANGUAGES = [
    'HINDI', 'ENGLISH', 'KANNADA',
    'PUNJABI', 'BENGALI', 'ORIYA', 'TAMIL',
    'MALAYALAM', 'GUJARATI', 'TELUGU', 'ARABIC',
    'BHOJPURI', 'MARATHI', 'NEPALI', 'ASSAMESE',
];
export const STATES = [
    'KARNATAKA',
    'ANDHRA_PRADESH',
    'ARUNACHAL_PRADESH',
    'ASSAM',
    'BIHAR',
    'CHHATTISGARH',
    'GOA',
    'GUJARAT',
    'HARYANA',
    'HIMACHAL_PRADESH',
    'JAMMU_AND_KASHMIR',
    'JHARKHAND',
    'KERALA',
    'MADHYA_PRADESH',
    'MAHARASHTRA',
    'MANIPUR',
    'MEGHALAYA',
    'MIZORAM',
    'NAGALAND',
    'ODISHA',
    'PUNJAB',
    'RAJASTHAN',
    'SIKKIM',
    'TAMIL_NADU',
    'TELANGANA',
    'TRIPURA',
    'UTTAR_PRADESH',
    'UTTARAKHAND',
    'WEST_BENGAL',
    'ANDAMAN_AND_NICOBAR_ISLANDS',
    'CHANDIGARH',
    'DADAR_AND_NAGAR_HAVELI',
    'DAMAN_AND_DIU',
    'DELHI',
    'LAKSHADWEEP',
    'PUDUCHERRY',

    // Because a lot of people do come from there
    'NEPAL',
    'BANGLADESH',
];


export const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TRANSPORT_MODES = [
    'CYCLE',
    'MOTOR_BIKE',
    'WALKING',
    'PUBLIC_TRANSPORT',
];

export const GENDER_MALE = 'MALE';
export const GENDER_FEMALE = 'FEMALE';
export const GENDER_EITHER = 'EITHER';
export const GENDER_OTHER = 'OTHER';

export const VEG_ONLY = 'VEG_ONLY';
export const VEG_NON_VEG = 'VEG_NON_VEG';

export const SORT_ICON = 'https://png.pngtree.com/svg/20170320/filter_sort_788151.png';
export const FILTER_ICON = 'https://cdn2.iconfinder.com/data/icons/font-awesome/1792/filter-512.png';
export const SORT_BY_PRICE = 'priceFn';
export const SORT_BY_RELEVANCE = 'relevanceFn';
export const SORT_FILTER_COLOR = '#f0f0f0';
export const NUM_FILTERS_BACKGROUND_COLOR = '#606060';


export const GOOGLE_PLAYSTORE_CUSTOMER_APP = 'https://play.google.com/store/apps/details?id=com.heloprotocol.customer.app.rn.notificationtester';
export const IOS_APPSTORE_CUSTOMER_APP = 'https://itunes.apple.com/gb/app/heloprotocol/id1455721517';
export const GOOGLE_PLAY_ICON = 'https://images-lb.heloprotocol.in/397.png-19682-720791-1552576471793.png?name=googlePlayIcon.png';
export const APP_STORE_DOWNLOAD_ICON = 'https://images-lb.heloprotocol.in/398.png-25388-821352-1552576472034.png?name=appStoreIcon.png';

export const FACEBOOK_PIXEL_ID = '1126029814188620';
export const FACEBOOK_LEAD = 'Lead';
export const FACEBOOK_COMPLETE_REGISTRATION = 'CompleteRegistration';

export const MAX_IMAGE_SIZE_BYTES = 16 * 1024 * 1024;       // 16 MB
export const MAX_VIDEO_SIZE_BYTES = 300 * 1024 * 1024;      // 300 MB
export const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024;       // 10 MB
export const MAX_FILE_SIZE_BYTES  = 50 * 1024 * 1024;       // 50 MB


export const GOOD_ATTRIBUTES = [
    'PRESENTABLE',
    'MAKES_TIMELY_FOOD',
    'USES_LESS_OIL',
    'PUNCTUAL',
    'RESPONSIBLE',
    'DOES_NOT_TAKE_SUDDEN_LEAVES',
    'JUST_PERFECT',
];
export const BAD_ATTRIBUTES = [
    'NOT_PRESENTABLE',
    'COMES_LATE',
    'SPICY_FOOD',
    'OILY_FOOD',
    'BLAND',
    'USES_TOO_MUCH_TOO_LITTLE_SALT',
    'NOT_TASTY',
];

export const BUDGET_MIN_PER_HOUR = {
    [CATEGORY_COOK]: 1750,
    [CATEGORY_NANNY]: 1500,
    [CATEGORY_MAID]: 1300,
};
export const COOKING_TIME_1_PERSON = {
    0.5: 45,
    1: 60,
    1.5: 105,
    2: 75,
    2.5: 120,
};
export const cookingMins = (breakfast, lunch, dinner, numResidents) => {
    const b = breakfast ? 1 : 0;
    const l = lunch ? 1 : 0;
    const d = dinner ? 1 : 0;
    const c = b*0.5 + l + d;
    return COOKING_TIME_1_PERSON[c] + (numResidents - 1) * 15;
};

export const cookingCharges = (breakfast, lunch, dinner, numResidents) => {
    const t = cookingMins(breakfast, lunch, dinner, numResidents);
    const price = BUDGET_MIN_PER_HOUR[CATEGORY_COOK] * t / 60;
    return Math.floor(price);
};

export const JOB_OPENING_STATUS_OPEN = 'OPEN';
export const JOB_OPENING_STATUS_PAUSED = 'PAUSED';
export const JOB_OPENING_STATUS_CLOSED = 'CLOSED';

export const CHAT_FONT_FAMILY = '"Helvetica Neue","Segoe UI",Helvetica,Arial';

export const VAPID_PUBLIC_KEY = '';
export const VAPID_PRIVATE_KEY = '';
export const PREVIOUS_SESSION_KEY = 'previous-session';
export const RESPONSIVE_VOICE_KEY = '';
export const SPEECH_RECOGNITION_TERMINATOR = 'SP-null-term';
export const SPEECH_RECOGNITION_SAMPLE_MS = 100;
export const TRUECALLER_KEY = '';

export const NODE_CACHE_SET_TTL_SECONDS = 2 * 60 * 60;              // 2 hours

export const GOLD_CODE_LENGTH = 8;
export const GOLD_CODE_VALIDITY_MS = 3 * 60 * 60 * 1000;            // 3 hours
export const GOLD_USER_CHECKIN_VALIDITY_MS = 5 * 60 * 60 * 1000;    // 5 hours
export const GOLD_TABLE_CHECKIN_EXPIRY_SEC = 10 * 60 * 60;          // 10 hours

export const MILLIS_IN_DAY = 24 * 60 * 60 * 1000;                   // Milliseconds in a day

export const GROUPS_SUPER_ADMINS = ['supply:352', 'supply:583', 'visitor:1105', 'supply:1021'];
export const VIDEO_ANALYTICS_INTERVAL_SECONDS = 0.2;
export const LOOKUP_PERSON_DETAILS_BATCH_SIZE = 100;

export const PERSON_ICON = 'https://images-lb.heloprotocol.in/person-male-whitebg.png-10263-636806-1581230431867.png';
export const PERSON_BORDER_COLOR = '#e0e0e0';
export const RESTAURANT_JOBS_INDIA_GROUP_ADDITION = 1500;

// Icons converted from Material UI
export const CALL_MISSED_ICON = 'https://images-lb.heloprotocol.in/call_missed.png-5902-764982-1581272084696.png';
export const PLAY_ARROW_ICON = 'https://images-lb.heloprotocol.in/play_arrow.png-319-610383-1581271337759.png';
export const IMAGE_ICON_IMG = 'https://images-lb.heloprotocol.in/fileIcon.png-11315-1065-1580242213512.png';
export const CAMERA_ICON_IMG = 'https://images-lb.heloprotocol.in/camera.png-18997-895898-1583096637528.png';
export const FILE_ICON_IMG = 'https://images-lb.heloprotocol.in/document-file-icon.png-5897-532477-1580243169705.png';
export const TROPHY_IMG = 'https://images-lb.heloprotocol.in/2020-01-22.png-9570-413415-1581238435122.png';
export const SPREADSHEET_IMG = 'https://images-lb.heloprotocol.in/excel.png-30324-53712-1582881514502.png';
export const CHAT_ICON = 'https://images-lb.heloprotocol.in/chat.png-3954-44037-1581272636940.png';
export const PHONE_BLACK_ICON = 'https://images-lb.heloprotocol.in/phone_black.png-1478-458813-1581272887095.png';
export const PHONE_WHITE_ICON = 'https://images-lb.heloprotocol.in/phone_white.png-4512-613467-1581273262536.png';
export const MORE_VERT_ICON = 'https://images-lb.heloprotocol.in/more_vert.png-1817-9340-1581273757286.png';
export const CHEVRON_LEFT_ICON = 'https://images-lb.heloprotocol.in/chevron_left.png-2375-978033-1581274155326.png';
export const NOTIFICATIONS_ICON = 'https://images-lb.heloprotocol.in/notifications.png-3382-391451-1581274409034.png';
export const ADD_PHOTO_ICON = 'https://images-lb.heloprotocol.in/add_a_photo.png-1659-803694-1581279113594.png';
export const EDIT_ICON = 'https://images-lb.heloprotocol.in/edit.png-3103-930245-1581279436470.png';
export const EDIT_ICON_BLACK = 'https://images-lb.heloprotocol.in/edit_black.png-1562-306283-1582875939385.png';
export const CHECK_TICK_ICON = 'https://images-lb.heloprotocol.in/check.png-3382-657889-1581279536007.png';
export const CHECK_TICK_ICON_BLACK = 'https://images-lb.heloprotocol.in/check.png-1471-883976-1583179256655.png';
export const MIC_BLACK_ICON = 'https://images-lb.heloprotocol.in/mic.png-1823-698503-1581282792227.png';
export const MIC_RED_ICON = 'https://images-lb.heloprotocol.in/mic_red.png-4345-15722-1581282815406.png';
export const STOP_ICON = 'https://images-lb.heloprotocol.in/stop.png-125-754019-1581287299173.png';
export const ITALICIZED_ATTACH_ICON = 'https://images-lb.heloprotocol.in/attach_file_icon.png-3670-987466-1581361704180.png';
export const PLAY_VIDEO_OVERLAY_ICON = 'https://images-lb.heloprotocol.in/playVideo2.png-10524-642760-1581589414170.png';
export const RED_RECORDING_ICON = 'https://images-lb.heloprotocol.in/redCircleIcon.png-15103-844445-1581723368137.png';
export const TRASH_ICON = 'https://images-lb.heloprotocol.in/trash.png-9619-572422-1583078670156.png';
export const COPY_CLIPBOARD_ICON = 'https://images-lb.heloprotocol.in/copy.png-12019-159958-1583086471917.png';
export const FORWARD_ICON = 'https://images-lb.heloprotocol.in/forward.png-9170-556233-1583078646759.png';
export const CROSS_ICON_BLACK = 'https://images-lb.heloprotocol.in/cross.png-14044-514146-1583829831542.png';

export const VIDEO_BACK_15_SECS = 'https://images-lb.heloprotocol.in/video-backward.png-3372-382572-1581592203963.png';
export const VIDEO_FORWARD_15_SECS = 'https://images-lb.heloprotocol.in/video-forward.png-3523-471032-1581592233062.png';
export const VIDEO_PAUSE = 'https://images-lb.heloprotocol.in/pause.png-9481-645513-1581619895681.png';
export const VIDEO_PLAY = 'https://images-lb.heloprotocol.in/pause.png-9481-456010-1581619835619.png';

export const FLASH_ON_ICON = 'https://images-lb.heloprotocol.in/flashOn.png-11616-751915-1583094919843.png';
export const FLASH_OFF_ICON = 'https://images-lb.heloprotocol.in/flashOff.png-14781-33311-1583094905865.png';
export const FLASH_AUTO_ICON = 'https://images-lb.heloprotocol.in/flashAuto.png-14689-470635-1583094859010.png';
export const FLIP_CAMERA_ICON = 'https://images-lb.heloprotocol.in/flipCamera.png-14173-911809-1583095480958.png';

export const PUSHY_API_KEY = '';
export const APP_DEBUG_MODE = false;
export const GROUP_INVITE_LINK_BASE = 'https://helochat.app.link/gtSFI7l4n4';

export const GREEN_TICK_IMG = 'https://images-lb.heloprotocol.in/greenTick.png-24338-487972-1583840352170.png';
export const EXCLAIM_IMG = 'https://images-lb.heloprotocol.in/exclaim.png-21252-833127-1583842197185.png';
export const EXCLAIM_DARKER_IMG = 'https://images-lb.heloprotocol.in/exclaim.png-21227-149344-1583856935372.png';
export const EXPAND_LESS_IMG = 'https://images-lb.heloprotocol.in/expandLess.png-11958-144472-1583843017109.png';
export const EXPAND_MORE_IMG = 'https://images-lb.heloprotocol.in/expandMore.png-11977-136754-1583843048458.png';
export const GREEN_TICK_ICON = 'https://images-lb.heloprotocol.in/greenTick2.png-12101-251674-1583854827630.png';
export const CROSS_RED_ICON = 'https://images-lb.heloprotocol.in/cross-red2.png-15045-675787-1583854858975.png';
export const TASK_LIST_ICON = 'https://images-lb.heloprotocol.in/todolist.png-14152-652766-1583897480436.png';

export const A_TO_Z = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
