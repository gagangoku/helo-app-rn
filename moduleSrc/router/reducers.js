import {ACTION_SET} from "./actions";
import cnsole from 'loglevel';


export const reducerFn = (prevState, action) => {
    const { type, ts, state } = action || {};
    cnsole.info('reducerFn: ', type, ts);
    cnsole.log('DEBUG reducerFn: ', prevState, action);

    if (typeof prevState === 'undefined') {
        return {...initialState};
    }
    switch (type) {
        case ACTION_SET:
            return state;
    }
    return prevState;
};

export const GROUP_DOCS_1 = 'groupDocs1';
export const GROUP_DOCS_2 = 'groupDocs2';
export const CHAT_DOCS_1  = 'chatDocs1';
export const CHAT_DOCS_2  = 'chatDocs2';

const initialState = {
    userDetails: null,
    documentsCache: {},
    idToDocMap: {},
    idToDetails: {},
    disposedKeys: [],
    ipLocation: null,
    contacts: [],
    numUpdates: {
        [GROUP_DOCS_1]: 0,
        [GROUP_DOCS_2]: 0,
        [CHAT_DOCS_1]: 0,
        [CHAT_DOCS_2]: 0,
    },

    ssid: null,
    isWifiEnabled: null,

    branchActions: [],
    splashLoaded: false,
};
