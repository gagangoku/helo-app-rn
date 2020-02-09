import React from "react";

export const BLUE_COLOR_THEME = '#276EF1';
export const TEAL_COLOR_THEME = '#000000';
export const BUTTON_TEAL_COLOR = '#2cc0b3';

export const TEXT_COLOR = '#404040';
export const TEXT_COLOR_LIGHT = '#606060';

export const BUTTON_BACKGROUND_COLOR = '#4d4d4d';
export const INFO_BORDER_COLOR = '#888888';

export const commonStyle = {
    fabButtonContainer: {
        height: 50,
        position: 'fixed',
        bottom: '5%',
        zIndex: 1,

        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
    },

    actionButtonContainer: {
        fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
        height: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        backgroundColor: '#000000',
        color: 'white',
        pointerEvents: 'auto',

        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
    },
    actionButton: {
        fontSize: 16,
        fontWeight: '400',
    },

    notSelectableText: {
        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
    },

    toastContainer: {
        position: 'fixed',
        bottom: 40,
        zIndex: 5,

        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toastButton: {
        margin: 10,
        padding: 10,
        zIndex: 5,

        color: 'white',
        backgroundColor: '#4d4d4d',
        borderRadius: 5,

    },

    justifyAlignCenter: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    noop: {},

    actionBtnContainerForCenter: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
    },
};

export const COLOR_WHITE_GRAY = '#c8c8c8';
