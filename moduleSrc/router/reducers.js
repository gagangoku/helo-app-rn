import {ACTION_SET} from "./actions";

export const reducerFn = (state, action) => {
    console.log('reducerFn: ', state, action);
    if (typeof state === 'undefined') {
        return {};
    }
    switch (action.type) {
        case ACTION_SET:
            return action.state;
    }
    return state;
};
