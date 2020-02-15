import React from "react";
import {ConfigurableTopBar} from "../chat/messaging/TopBar";
import {View} from "../util/Util";
import {CHAT_FONT_FAMILY, FIREBASE_GROUPS_DB_NAME, RED_RECORDING_ICON} from "../constants/Constants";


export class TopBarDemo extends React.Component {
    constructor(props) {
        super(props);
    }
    static URL = '/demos/topbar';

    render() {
        const groupId = 'helo-kitchen-indiranagar';
        const collection = FIREBASE_GROUPS_DB_NAME;
        const me = {
            role: 'visitor', id: 1, sender: 'visitor:1',
        };

        const options = [
            { title: 'Analytics', type: ConfigurableTopBar.SECTION_DOTDOTDOT_ANALYTICS },
            { title: 'Leaderboard', type: ConfigurableTopBar.SECTION_DOTDOTDOT_LEADERBOARD },
            { title: 'Settings', type: ConfigurableTopBar.SECTION_DOTDOTDOT_SETTINGS },
        ];
        const sections = [
            { float: 'left', name: ConfigurableTopBar.SECTION_BACK, displayProps: {}, data: {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_AVATAR, displayProps: {}, data: { avatar: RED_RECORDING_ICON }, onClickFn: () => {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_NAME, displayProps: {}, data: { name: 'Create Group' }, onClickFn: () => {} },
            { float: 'right', name: ConfigurableTopBar.SECTION_PHONE, displayProps: {}, data: { } },
            { float: 'right', name: ConfigurableTopBar.SECTION_NOTIFICATIONS, displayProps: {}, data: { numNotif: 5 } },
            { float: 'right', name: ConfigurableTopBar.SECTION_UNREADS, displayProps: {}, data: { unreads: 3 } },
            { float: 'right', name: ConfigurableTopBar.SECTION_DOTDOTDOT, displayProps: {}, data: { options, me, groupId, collection } },
        ];

        return (
            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <View style={custom.root}>
                    <ConfigurableTopBar collection={null} sections={sections}
                                        location={this.props.location} history={this.props.history} />

                    <View style={{}}>
                        Hi. Hello
                    </View>
                </View>
            </View>
        );
    }
}

const MAX_WIDTH = 450;
const custom = {
    root: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        lineHeight: '60px',
        fontSize: 18,

        display: 'flex',
        flexDirection: 'column',

        fontFamily: CHAT_FONT_FAMILY,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
};
