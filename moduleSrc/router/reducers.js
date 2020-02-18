import {ACTION_SET} from "./actions";
import cnsole from 'loglevel';


export const reducerFn = (prevState, action) => {
    const { type, ts, state } = action || {};
    cnsole.info('reducerFn: ', type, ts);
    cnsole.log('DEBUG reducerFn: ', prevState, action);

    if (typeof prevState === 'undefined') {
        return {};
    }
    switch (type) {
        case ACTION_SET:
            return state;
    }
    return prevState;
};
