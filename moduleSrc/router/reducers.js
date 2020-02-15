import {ACTION_SET} from "./actions";

export const reducerFn = (prevState, action) => {
    const { type, ts, state } = action || {};
    console.log('[', new Date().getTime(), '] reducerFn: ', type, ts);
    // console.log('DEBUG reducerFn: ', prevState, action);

    if (typeof prevState === 'undefined') {
        return {};
    }
    switch (type) {
        case ACTION_SET:
            return state;
    }
    return prevState;
};
