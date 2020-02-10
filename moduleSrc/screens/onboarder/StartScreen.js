import React from 'react';
import {withStyles} from '../../platform/Util';
import {actionButton} from "../../util/Util";
import {commonStyle} from "../../styles/common";
import SuperRoot from "../../widgets/SuperRoot";


class StartScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {classes} = this.props;
        return (
            <SuperRoot>
                <div style={{ width: '100%', height: '100%', marginTop: '20%' }}>
                    <div style={commonStyle.actionBtnContainerForCenter}>
                        {actionButton('START ONBOARDING', this.props.onStartFn)}
                        <div style={{ width: 10 }} />
                        {actionButton('UPLOAD PHOTO', this.props.onUploadPicFn)}
                    </div>
                </div>
            </SuperRoot>
        );
    }
}

const styles = theme => ({
});
export default withStyles(styles)(StartScreen);
