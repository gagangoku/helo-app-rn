import React from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import window from "global/window";
import ReactPixel from 'react-facebook-pixel';
import {FACEBOOK_PIXEL_ID} from "../constants/Constants";
import cnsole from 'loglevel';


class GoogleAnalytics extends React.Component {
    componentDidMount() {
        this.logPageChange(
            this.props.location.pathname,
            this.props.location.search
        );
    }

    componentDidUpdate({location: prevLocation}) {
        const {location: {pathname, search}} = this.props;
        const isDifferentPathname = pathname !== prevLocation.pathname;
        const isDifferentSearch = search !== prevLocation.search;

        if (isDifferentPathname || isDifferentSearch) {
            this.logPageChange(pathname, search);
        }
    }

    logPageChange(pathname, search = '') {
        const page = pathname + search;
        const {location} = window;
        ReactGA.set({
            page,
            location: `${location.origin}${page}`,
            ...this.props.options,
        });
        ReactGA.pageview(page);
        initFbPixel() && ReactPixel.pageView();
        if (!REACT_APP_GA_DEBUG) {
            cnsole.log('react-ga logging page: ', page);
        }
    }

    render() {
        return null;
    }
}

GoogleAnalytics.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string,
        search: PropTypes.string
    }).isRequired,
    options: PropTypes.object,
};

const init = (options = {}) => {
    ReactGA.initialize(
        REACT_APP_GA_TRACKING_ID, {
            debug: REACT_APP_GA_DEBUG,
            ...options
        }
    );

    return true;
};

const event = (obj={}) => {
    ReactGA.event(obj);
};


export const initFbPixel = () => {
    const advancedMatching = {}; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching/
    const fbOptions = {
        autoConfig: true, 	// set pixel's autoConfig
        debug: false, 		// enable logs
    };
    ReactPixel.init(FACEBOOK_PIXEL_ID, advancedMatching, fbOptions);
    return true;
};

const REACT_APP_GA_TRACKING_ID = 'UA-134217906-1';
const REACT_APP_GA_DEBUG = window.location ? !window.location.origin.includes('heloprotocol.in') : false;
// const REACT_APP_GA_DEBUG = false;

export default {
    GoogleAnalytics,
    init,
    event,
}
