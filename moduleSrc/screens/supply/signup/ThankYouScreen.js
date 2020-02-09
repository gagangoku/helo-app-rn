import React from 'react'
import {withStyles} from '@material-ui/core/styles'
import SuperRoot from "../../../widgets/SuperRoot";
import {COLOR_WHITE_GRAY, TEAL_COLOR_THEME} from "../../../styles/common";
import Header from "../../../widgets/Header";
import {getCtx} from "../../../util/Util";
import Footer from "../../../widgets/Footer";


class ThankYouScreen extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        const {classes} = this.props;

        return (
            <SuperRoot>
                <Header />

                <div className={classes.root}>
                    <div className={classes.title}>Thank you for signing up !</div>
                    <br/>
                    <div className={classes.content}>
                        We have taken your details. Once jobs open up, our team will call you.
                    </div>
                </div>

                <Footer />
            </SuperRoot>
        );
    }
}
const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        verticalAlign: 'middle',
        alignItems: 'center',
    },
    title: {
        marginTop: 30,
        marginBottom: 30,
        fontSize: 36,
        color: TEAL_COLOR_THEME,
    },
    content: {
        marginLeft: 50,
        marginRight: 50,
        lineHeight: 1.5,
        textAlign: 'left',
        marginBottom: 30,
    },

    bannerAppDownloadContainer: {
        marginTop: 20,
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 40,
    },
    bannerGooglePlayContainer: {
        marginRight: 10,
    },
    bannerGooglePlayImg: {
        height: 40,
    },
    bannerAppleStoreContainer: {},
    bannerAppleStoreImg: {
        height: 40,
    },
    bannerComingSoon: {
        textAlign: 'center',
        color: COLOR_WHITE_GRAY,
    },

});
export default withStyles(styles)(ThankYouScreen);
