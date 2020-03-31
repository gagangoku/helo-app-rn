import React from 'react';
import {withStyles} from '../platform/Util';
import {getCtx, getDetailsFromPhone} from "../util/Util";
import {GROUP_URLS} from "../controller/Urls";


class GroupListDemo extends React.Component {
    static URL = '/demos/group';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    async componentDidMount() {
        const { phone, id, name, role } = await getDetailsFromPhone();
        if (role && id) {
            window.location.href = GROUP_URLS.groupList;
        } else {
            window.location.href = GROUP_URLS.groupList + '?me=supply:352';
        }
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
export default withStyles(styles)(GroupListDemo);
