import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {getCtx, getDetailsFromPhone} from "../util/Util";
import {StepGroupList} from "../controller/HomePageFlows";


class GroupListDemo extends React.Component {
    static URL = '/demos/group';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    async componentDidMount() {
        const { phone, id, name, role } = await getDetailsFromPhone();
        if (role && id) {
            window.location.href = StepGroupList.URL;
        } else {
            window.location.href = StepGroupList.URL + '?me=supply:352';
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
