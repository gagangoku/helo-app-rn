export const ACTION_SET = 'set';

export const setInternalState = content => ({
    type: ACTION_SET,
    payload: {
        content,
    }
});
