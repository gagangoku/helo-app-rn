import * as React from 'react';
import cnsole from 'loglevel';


export const navigationRef = React.createRef();
export const getNavigationObject = () => {
    const current = navigationRef?.current;
    if (!current) {
        cnsole.warn('navigationRef not setup');
    }
    return current;
};
