// Constants
import {Dimensions, Platform} from "react-native";

// NOTE: Unable to get the correct appVersion from codepush update. Also, codepush only updates the JS bundle,
// so the installed appVersion won't change. Hence, the version number is set in JS here.
// NOTE: Do not forget to update this version everytime you release a codepush / playstore update.
export const APP_VERSION = '1.0.1';

export const HOST = 'https://api.heloprotocol.in';
// export const HOST = 'http://192.168.0.105:7071';
// export const HOST = 'http://192.168.0.104:7071';

export const MWEB_URL = 'https://www.heloprotocol.in';
// export const MWEB_URL = 'http://192.168.0.104:8092';

export const IMAGES_URL = 'https://images-lb.heloprotocol.in';
export const VIDEOS_URL = 'https://videos-lb.heloprotocol.in';
export const AUDIOS_URL = 'https://audios-lb.heloprotocol.in';
export const FILES_URL = 'https://files-lb.heloprotocol.in';

export const FIREBASE_CHAT_MESSAGES_DB_NAME = 'chat-messages';
export const FIREBASE_GROUPS_DB_NAME = 'groups';
export const CHAT_MESSAGES_DOC_NAME_PREFIX = '';            // For testing
export const GROUPS_DOC_NAME_PREFIX = '';                   // For testing

export const MAX_IMAGE_SIZE_BYTES = 16 * 1024 * 1024;       // 16 MB
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;       // 100 MB
export const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024;       // 10 MB

export const BANGALORE_LAT = 12.967972;
export const BANGALORE_LNG = 77.641199;
export const CHAT_FONT_FAMILY = '"Helvetica Neue","Segoe UI",Helvetica,Arial';

export const GENDER_MALE = 'MALE';
export const GENDER_FEMALE = 'FEMALE';
export const GENDER_EITHER = 'EITHER';
