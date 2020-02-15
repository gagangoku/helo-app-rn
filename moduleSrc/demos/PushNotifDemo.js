import React from 'react';
import {withStyles} from '../platform/Util';
import {getCtx, getUrlParam, initWebPush, setupDeviceId} from "../util/Util";
import cnsole from 'loglevel';


class PushNotifDemo extends React.Component {
    static URL = '/demos/push-notif';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    async componentDidMount() {
        cnsole.log('PushNotifDemo componentDidMount');
        // For web push notifications

        const forceUpdate = getUrlParam('forceUpdate');
        await initWebPush(forceUpdate === 'true' || forceUpdate === 'yes');

        const deviceID = await setupDeviceId();
        await fetch('/push-notify?deviceID=' + deviceID, { method: 'GET' });
    }

    render() {
        return <div />;
    }
}

const custom = {
    grid: {
        width: '60%',
    },
};

const styles = theme => ({
});
export default withStyles(styles)(PushNotifDemo);
