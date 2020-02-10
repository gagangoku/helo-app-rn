import React from 'react'
import {withStyles} from '../platform/Util';
import {IS_MOBILE_SCREEN} from "../constants/Constants";


class SuperRoot extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.superRoot1}>
                <div className={classes.superRoot2}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

const styles = theme => ({
    superRoot1: {
        // backgroundColor: '#f5f5f5',
        background: 'linear-gradient(rgba(240,255,240,0.99), rgba(245,245,245,0.5))',
        // background: 'linear-gradient(.25turn, red, 10%, blue)',
        width: '100%',
        height: '100%',
    },
    superRoot2: {
        backgroundColor: 'white',
        fontFamily: '"Nunito", Arial, "Helvetica Neue", Helvetica, sans-serif',
        fontWeight: 300,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",

        marginLeft: IS_MOBILE_SCREEN ? 0 : '10%',
        marginRight: IS_MOBILE_SCREEN ? 0 : '10%',
    },
});

export default withStyles(styles)(SuperRoot);
