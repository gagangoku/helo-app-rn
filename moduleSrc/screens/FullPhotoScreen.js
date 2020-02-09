import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {getImageUrl} from "../util/Util";
import SuperRoot from "../widgets/SuperRoot";
import window from "global/window";


class FullPhotoScreen extends React.Component {
    static URL = '/full-image/:id';
    constructor(props) {
        super(props);
    }

    render() {
        const {classes} = this.props;
        let thumbImageUrl = getImageUrl(this.props.match.params.id);
        console.log('fullImageUrl: ', thumbImageUrl, this.props);

        return (
            <SuperRoot>
                <div className={classes.root}>
                    <img src={thumbImageUrl} className={classes.cookThumbImg} />
                </div>
            </SuperRoot>
        );
    }
}

const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        verticalAlign: 'middle',
        alignItems: 'center',
    },
    cookThumbImg: {
        maxWidth: window.innerWidth,
    },
});
export default withStyles(styles)(FullPhotoScreen);
