import React, {Fragment} from "react";
import {historyBack, Popover, WINDOW_INNER_WIDTH} from '../../platform/Util';
import {getCircularImage, getImageUrl, Image, Text, View} from "../../util/Util";
import {
    CHAT_FONT_FAMILY,
    CHEVRON_LEFT_ICON,
    FIREBASE_CHAT_MESSAGES_DB_NAME,
    FIREBASE_GROUPS_DB_NAME,
    MORE_VERT_ICON,
    NOTIFICATIONS_ICON,
    PHONE_WHITE_ICON
} from "../../constants/Constants";
import TouchableAnim from "../../platform/TouchableAnim";
import {TOP_BAR_COLOR} from "../Constants";
import format from "string-format";
import window from 'global';
import {GROUP_URLS} from "../../controller/Urls";


export class GroupTopBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { otherGuy, groupId, me, leaderboardFn, hasAnalytics, goBackFn } = this.props;
        const collection = FIREBASE_GROUPS_DB_NAME;

        const options = !hasAnalytics ? [
            { title: 'About', type: ConfigurableTopBar.SECTION_DOTDOTDOT_ABOUT },
        ] : [
            { title: 'Analytics', type: ConfigurableTopBar.SECTION_DOTDOTDOT_ANALYTICS },
            { title: 'Leaderboard', type: ConfigurableTopBar.SECTION_DOTDOTDOT_LEADERBOARD },
            { title: 'About', type: ConfigurableTopBar.SECTION_DOTDOTDOT_ABOUT },
        ];
        const data = { leaderboardFn, options, avatar: getImageUrl(otherGuy.avatar), name: otherGuy.name, subheading: otherGuy.subheading, groupId, me, collection };
        const sections = [
            { float: 'left', name: ConfigurableTopBar.SECTION_BACK, displayProps: {}, data, ...(goBackFn ? { onClickFn: goBackFn } : {}) },
            { float: 'left', name: ConfigurableTopBar.SECTION_AVATAR, displayProps: {}, data },
            { float: 'left', name: ConfigurableTopBar.SECTION_NAME, displayProps: {}, data },
        ];
        if (hasAnalytics) {
            sections.push({ float: 'right', name: ConfigurableTopBar.SECTION_NOTIFICATIONS, displayProps: {}, data });
        }
        sections.push({ float: 'right', name: ConfigurableTopBar.SECTION_DOTDOTDOT, displayProps: {}, data });

        return <ConfigurableTopBar collection={collection} sections={sections}
                                   location={this.props.location} history={this.props.history} />;
    };
}

export class PersonalMessagingTopBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { otherGuy, groupId, me, goBackFn } = this.props;
        const collection = FIREBASE_CHAT_MESSAGES_DB_NAME;
        const options = [
            { title: 'About', type: ConfigurableTopBar.SECTION_DOTDOTDOT_ABOUT },
        ];
        const data = { options, avatar: getImageUrl(otherGuy.avatar), name: otherGuy.name, groupId, me, collection };
        const sections = [
            { float: 'left', name: ConfigurableTopBar.SECTION_BACK, displayProps: {}, data, ...(goBackFn ? { onClickFn: goBackFn } : {}) },
            { float: 'left', name: ConfigurableTopBar.SECTION_AVATAR, displayProps: {}, data },
            { float: 'left', name: ConfigurableTopBar.SECTION_NAME, displayProps: {}, data },
            { float: 'right', name: ConfigurableTopBar.SECTION_PHONE, displayProps: {}, data },
            { float: 'right', name: ConfigurableTopBar.SECTION_DOTDOTDOT, displayProps: {}, data },
        ];

        return <ConfigurableTopBar collection={collection} sections={sections}
                                   location={this.props.location} history={this.props.history} />;
    };
}

export class ConfigurableTopBar extends React.Component {
    constructor(props) {
        super(props);
    }
    static HEIGHT = 60;
    static SECTION_BACK = 'back';
    static SECTION_AVATAR = 'avatar';
    static SECTION_NAME = 'name';
    static SECTION_NOTIFICATIONS = 'notifications';
    static SECTION_PHONE = 'phoneIcon';
    static SECTION_DOTDOTDOT = 'dotdotdot';
    static SECTION_UNREADS = 'unreads';

    static SECTION_DOTDOTDOT_ANALYTICS = 'analytics';
    static SECTION_DOTDOTDOT_LEADERBOARD = 'leaderboard';
    static SECTION_DOTDOTDOT_SETTINGS = 'settings';
    static SECTION_DOTDOTDOT_NEW_GROUP = 'new-group';
    static SECTION_DOTDOTDOT_NEW_SUPERGROUP = 'new-supergroup';
    static SECTION_DOTDOTDOT_ABOUT = 'about';

    // Onclick functions
    backOnclickFn = ({ data }) => {
        console.log('backOnclickFn: ', this.props);
        historyBack();
    };
    showPersonDetailsPageOnclickFn = ({ data }) => {
        const { groupId, me } = data;
        const roleId = groupId.split(',').filter(x => x !== me.sender)[0];
        const url = format('{}?roleId={}', GROUP_URLS.viewPerson, roleId);
        window.open(url);
    };
    showGroupDetailsPageOnclickFn = ({ data }) => {
        const { groupId } = data;
        const url = format('{}?group={}', GROUP_URLS.groupDetails, groupId);
        window.open(url);
    };
    phoneIconOnclickFn = ({ data }) => {};

    // Functions for more options
    analyticsOnclickFn = ({ data }) => {
        const { me, groupId, collection } = data;
        console.log('Group level analytics: ', me, groupId, collection);
        const url = format('{}/?me={}&groupId={}&collection={}', GROUP_URLS.groupAnalytics, me.sender, groupId, collection);
        window.open(url, '_blank');
    };
    leaderboardOnclickFn = ({ data }) => {
        const { me, groupId, collection, leaderboardFn } = data;
        console.log('Group level leaderboard: ', me, groupId, collection);
        leaderboardFn({ idx: -1, me, groupId, collection });
    };
    settingsOnclickFn = ({ data }) => {};
    newGroupOnclickFn = ({ data }) => {
        window.open(GROUP_URLS.createGroup, '_blank');
    };
    newSuperGroupOnclickFn = ({ data }) => {};

    // Display functions
    backDisplayFn = ({ displayProps, data, cbFn }) => {
        return (
            <TouchableAnim onPress={cbFn} style={{ height: 35, width: 35, marginLeft: 2, marginRight: 2, lineHeight: 'normal' }}>
                <Image src={CHEVRON_LEFT_ICON} style={{ height: 35, width: 35, marginLeft: 2, marginRight: 2 }} />
            </TouchableAnim>
        );
    };
    avatarDisplayFn = ({ displayProps, data, cbFn }) => {
        const { avatar } = data;
        return getCircularImage({ src: getImageUrl(avatar), dim: 36, cbFn, border: 0 });
    };
    nameDisplayFn = ({ displayProps, data, cbFn }) => {
        const { name, subheading } = data;
        const maxWidth = displayProps.maxWidth || '70%';
        const nameProps = displayProps.name || {};
        const subheadingProps = displayProps.subheading || {};

        if (!subheading) {
            return (
                <View style={{ maxWidth, textAlign: 'left', paddingLeft: 15, paddingRight: 15, fontWeight: 500,
                               flexDirection: 'column', display: 'flex' }}
                      onClick={cbFn}>
                    <Text style={{ ...custom.text, fontSize: 18, ...nameProps }}>{name}</Text>
                </View>
            );
        } else {
            return (
                <View style={{ maxWidth, lineHeight: 'normal', textAlign: 'left', paddingLeft: 15, paddingRight: 15, fontWeight: 500,
                               flexDirection: 'column', display: 'flex' }}
                      onClick={cbFn}>
                    <Text style={{ ...custom.text, marginTop: 0, fontSize: 18, ...nameProps }}>{name}</Text>
                    <Text style={{ ...custom.text, marginTop: 2, fontSize: 12, opacity: 0.7, ...subheadingProps }}>{subheading}</Text>
                </View>
            );
        }
    };
    notificationsDisplayFn = ({ displayProps, data, cbFn }) => {
        const numNotif = data.numNotif || 2;
        return (
            <TouchableAnim onPress={cbFn} style={{ height: 25, width: 25, lineHeight: 'normal', position: 'relative', marginLeft: 4, marginRight: 5 }}>
                <Image src={NOTIFICATIONS_ICON} style={{ height: 25, width: 25 }} />
                <View style={{ position: 'absolute', left: 15, top: 13, backgroundColor: '#ff0000',
                               height: 15, width: 15, borderRadius: 8, color: '#ffffff', fontSize: 10,
                               display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#ffffff' }}>{numNotif}</Text>
                </View>
            </TouchableAnim>
        );
    };
    phoneIconDisplayFn = ({ displayProps, data, cbFn }) => {
        return (
            <TouchableAnim onPress={cbFn} style={{ height: 25, width: 25, marginTop: 2, marginLeft: 2, marginRight: 1, lineHeight: 'normal' }}>
                <Image src={PHONE_WHITE_ICON} style={{ height: 25, width: 25 }} />
            </TouchableAnim>
        );
    };
    dotdotdotDisplayFn = ({ displayProps, data, cbFn }) => {
        const { collection } = this.props;
        const { options } = data;
        const opts = options.map(obj => {
            const { type, onClickFn } = obj;
            if (onClickFn) {
                return obj;
            }
            switch (type) {
                case ConfigurableTopBar.SECTION_DOTDOTDOT_ANALYTICS:
                    return {...obj, onClickFn: () => this.analyticsOnclickFn({ displayProps, data, cbFn })};
                case ConfigurableTopBar.SECTION_DOTDOTDOT_LEADERBOARD:
                    return {...obj, onClickFn: () => this.leaderboardOnclickFn({ displayProps, data, cbFn })};
                case ConfigurableTopBar.SECTION_DOTDOTDOT_SETTINGS:
                    return {...obj, onClickFn: () => this.settingsOnclickFn({ displayProps, data, cbFn })};
                case ConfigurableTopBar.SECTION_DOTDOTDOT_NEW_GROUP:
                    return {...obj, onClickFn: () => this.newGroupOnclickFn({ displayProps, data, cbFn })};
                case ConfigurableTopBar.SECTION_DOTDOTDOT_NEW_SUPERGROUP:
                    return {...obj, onClickFn: () => this.newSuperGroupOnclickFn({ displayProps, data, cbFn })};
                case ConfigurableTopBar.SECTION_DOTDOTDOT_ABOUT:
                    const fn = collection === FIREBASE_CHAT_MESSAGES_DB_NAME ? this.showPersonDetailsPageOnclickFn : this.showGroupDetailsPageOnclickFn;
                    return {...obj, onClickFn: () => (fn)({ data })};

                default:
                    return obj;
            }
        });
        return <DotDotDot dotDotDotOptions={opts} />;
    };
    unreadsDisplayFn = ({ displayProps, data, cbFn }) => {
        const { unreads } = data;
        return (
            <TouchableAnim onPress={cbFn}
                           style={{ height: 20, width: 20, borderRadius: 10, backgroundColor: '#ffffff',
                                    marginLeft: 3, marginRight: 3, marginTop: 2,
                                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: TOP_BAR_COLOR, fontSize: 12, marginTop: 1 }}>{unreads}</Text>
            </TouchableAnim>
        );
    };

    onClickFn = (name) => {
        const { collection } = this.props;
        const nameClickFn = collection === FIREBASE_CHAT_MESSAGES_DB_NAME ? this.showPersonDetailsPageOnclickFn : this.showGroupDetailsPageOnclickFn;
        switch (name) {
            case ConfigurableTopBar.SECTION_BACK:
                return this.backOnclickFn;
            case ConfigurableTopBar.SECTION_AVATAR:
                return nameClickFn;
            case ConfigurableTopBar.SECTION_NAME:
                return nameClickFn;
            case ConfigurableTopBar.SECTION_NOTIFICATIONS:
                return () => {};
            case ConfigurableTopBar.SECTION_PHONE:
                return this.phoneIconOnclickFn;
            case ConfigurableTopBar.SECTION_DOTDOTDOT:
                return () => {};
            case ConfigurableTopBar.SECTION_UNREADS:
                return () => {};

            default:
                throw 'onClickFn: Bad section name: ' + name;
        }
    };
    sectionDisplayFn = (name) => {
        switch (name) {
            case ConfigurableTopBar.SECTION_BACK:
                return this.backDisplayFn;
            case ConfigurableTopBar.SECTION_AVATAR:
                return this.avatarDisplayFn;
            case ConfigurableTopBar.SECTION_NAME:
                return this.nameDisplayFn;
            case ConfigurableTopBar.SECTION_NOTIFICATIONS:
                return this.notificationsDisplayFn;
            case ConfigurableTopBar.SECTION_PHONE:
                return this.phoneIconDisplayFn;
            case ConfigurableTopBar.SECTION_DOTDOTDOT:
                return this.dotdotdotDisplayFn;
            case ConfigurableTopBar.SECTION_UNREADS:
                return this.unreadsDisplayFn;

            default:
                throw 'sectionDisplayFn: Bad section name: ' + name;
        }
    };

    render() {
        const { sections } = this.props;

        const fn = (s) => {
            const { name, displayProps, data, onClickFn } = s;
            const cbFn = () => (onClickFn || this.onClickFn(name))({ data });
            const fnToCall = this.sectionDisplayFn(name);
            const disp = (fnToCall)({ displayProps, data, cbFn });
            return <Fragment key={name}>{disp}</Fragment>;
        };
        const left = sections.filter(s => s.float === 'left').map(fn);
        const right = sections.filter(s => s.float === 'right').map(fn);

        return (
            <View style={{ ...custom.root, height: ConfigurableTopBar.HEIGHT, width: '100%' }}>
                <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>{left}</View>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingRight: 5 }}>{right}</View>
                </View>
            </View>
        );
    };
}

class DotDotDot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isPopoverOpen: false,
        };
        this.dotDotDotIconRef = React.createRef();
    }

    cbAndCloseFn = (cbFn) => {
        this.setState({ isPopoverOpen: false });
        cbFn();
    };
    render() {
        const { dotDotDotOptions } = this.props;
        if (!dotDotDotOptions || dotDotDotOptions.length === 0) {
            return <View />;
        }

        const popoverY = ConfigurableTopBar.HEIGHT / 2;
        const popoverX = WINDOW_INNER_WIDTH - 10;
        return (
            <View style={{}}>
                <View ref={this.dotDotDotIconRef}>
                    <TouchableAnim onPress={() => this.setState({ isPopoverOpen: true })} style={{ height: 25, width: 25, marginTop: 0, marginLeft: 0, marginRight: 0, lineHeight: 'normal' }}>
                        <Image src={MORE_VERT_ICON} style={{ height: 25, width: 25 }} />
                    </TouchableAnim>

                    <Popover visible={this.state.isPopoverOpen}
                             contentStyle={{ padding: 0 }} arrowStyle={{ padding: 0 }} backgroundStyle={{ padding: 0 }}
                             fromRect={{ x: popoverX, y: popoverY, width: 0, height: 0 }} placement="auto"
                             onRequestClose={() => this.setState({ isPopoverOpen: false })}
                             style={{ }}

                             open={this.state.isPopoverOpen}
                             anchorEl={this.dotDotDotIconRef && this.dotDotDotIconRef.current ? this.dotDotDotIconRef.current.refElem() : null}
                             onClose={() => this.setState({ isPopoverOpen: false })}
                             anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                             transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontFamily: CHAT_FONT_FAMILY, padding: 5 }}>
                            {dotDotDotOptions.map(({ title, onClickFn }) => (
                                <TouchableAnim onPress={() => this.cbAndCloseFn(onClickFn)} style={{ padding: 10, marginBottom: 5 }} key={title}>
                                    <Text style={{ fontFamily: CHAT_FONT_FAMILY, fontSize: 17 }}>{title}</Text>
                                </TouchableAnim>
                            ))}
                        </View>
                    </Popover>
                </View>
            </View>
        );
    }
}

const custom = {
    root: {
        backgroundColor: TOP_BAR_COLOR,
        color: '#ffffff',
        width: '100%',
        lineHeight: '60px',
        fontSize: 18,

        display: 'flex',
        flexDirection: 'row',

        fontFamily: CHAT_FONT_FAMILY,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",

        userSelect: 'none', MozUserSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none',
    },
    text: {
        color: '#ffffff',
        fontSize: 18,
    },
};
