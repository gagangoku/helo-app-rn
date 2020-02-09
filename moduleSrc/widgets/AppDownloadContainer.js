import React from 'react';
import {getCtx, View} from "../util/Util";
import {
    APP_STORE_DOWNLOAD_ICON,
    GOOGLE_PLAY_ICON,
    GOOGLE_PLAYSTORE_CUSTOMER_APP,
    IOS_APPSTORE_CUSTOMER_APP
} from "../constants/Constants";
import {COLOR_WHITE_GRAY} from "../styles/common";


export default class AppDownloadContainer extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        return (
            <View style={custom.bannerAppDownloadContainer}>
                <View style={custom.bannerGooglePlayContainer}>
                    <a href={GOOGLE_PLAYSTORE_CUSTOMER_APP} target="_blank">
                        <img src={GOOGLE_PLAY_ICON} style={custom.bannerGooglePlayImg} />
                    </a>
                </View>
                <View style={custom.bannerAppleStoreContainer}>
                    <a href={IOS_APPSTORE_CUSTOMER_APP} target="_blank">
                        <img src={APP_STORE_DOWNLOAD_ICON} style={custom.bannerAppleStoreImg} />
                    </a>
                </View>
            </View>
        );
    }
}

const custom = {
    root: {
        fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },


    bannerAppDownloadContainer: {
        marginTop: 20,
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 20,
        justifyContent: 'center',
    },
    bannerGooglePlayContainer: {
        marginRight: 10,
    },
    bannerGooglePlayImg: {
        height: 40,
    },
    bannerAppleStoreContainer: {
    },
    bannerAppleStoreImg: {
        height: 40,
    },
    comingSoonText: {
        textAlign: 'center',
        color: COLOR_WHITE_GRAY,
    },
};
