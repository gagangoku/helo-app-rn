import React from "react";
import {
    computeLeaderBoardPoints,
    getCircularImage,
    getCtx,
    getImageUrl,
    getUrlParam,
    Image,
    setupDeviceId,
    spacer,
    sumFn,
    Text,
    View
} from "../../util/Util";
import uuidv1 from "uuid/v1";
import TouchableAnim from "../../platform/TouchableAnim";
import {CHAT_FONT_FAMILY, VIDEO_ANALYTICS_INTERVAL_SECONDS} from "../../constants/Constants";
import xrange from 'xrange';
import {ConfigurableTopBar} from "../messaging/TopBar";
import format from "string-format";
import {getPersonNamesByRoleId, hgetAllFromKVStore} from "../../util/Api";
import lodash from "lodash";
import {ExpandingImage, ScrollView} from "../../platform/Util";


export default class LeaderBoard extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);

        this.state = {
            leaderBoard: null,
        };
        this.deviceID = null;
        this.uuid = null;
    }

    async componentDidMount() {
        this.deviceID = await setupDeviceId();
        this.uuid = uuidv1();
        console.log('LeaderBoard componentDidMount: ', this.deviceID, this.uuid);

        this.detailsObj = {};
        'collection,groupId,user,idx,groupName,groupPhoto,moduleName,members'.split(',').forEach(x => this.detailsObj[x] = this.props[x] || getUrlParam(x));

        const leaderBoard = await this.computeLeaderboard();
        this.setState({ leaderBoard });
    }

    componentWillUnmount() {
    }

    computeLeaderboard = async () => {
        const { collection, groupId, user, idx, members } = this.detailsObj;

        const hash = format('/analytics/group/{}', groupId);
        const key = format('/idx/{}/user/{}', idx, user);

        const rsp = await hgetAllFromKVStore(hash);
        console.log('computeLeaderboard hgetAllFromKVStore rsp: ', rsp);

        const keys = (!idx || idx < 0) ? Object.keys(rsp) : Object.keys(rsp).filter(x => x.startsWith("/idx/" + idx));
        console.log('computeLeaderboard keys: ', keys);
        keys.forEach(k => rsp[k] = JSON.parse(rsp[k]));

        const users = lodash.uniq(members.split(',').concat(keys.map(x => x.split('/')[4])));
        const roleIdToName = await getPersonNamesByRoleId(users);
        console.log('computeLeaderboard users, roleIdToName: ', users, roleIdToName);

        const scores = this.getScoresForIdx(keys, rsp);
        console.log('scores: ', scores);
        const sample = [];
        Object.keys(scores).forEach(roleId => {
            const person = roleIdToName[roleId].person;
            console.log('computeLeaderboard person: ', person);
            sample.push({
                userId: roleId,
                name: person.name,
                subtitle: 'abra',
                points: scores[roleId],
                photo: person.image,
                visibility: 'visible',
            });
        });

        if (sample.length < 3) {
            xrange(0, 3 - sample.length).forEach(x => sample.push({ visibility: 'hidden' }));
        }
        return sample;
    };

    getScoresForIdx = (keys, rsp) => {
        const { members } = this.detailsObj;
        const _a = keys.map(k => rsp[k].lastUpdatedAtMs);
        const minLastUpdatedAtMs = Math.min(..._a);
        const maxLastUpdatedAtMs = Math.max(..._a);

        const scores = {};
        members.split(',').forEach(roleId => scores[roleId] = 0);

        // TODO: Only show current active members, skip the old ones
        keys.forEach(k => {
            const roleId = k.split('/')[4];
            const { compressed, lastUpdatedAtMs, duration } = rsp[k];
            const watched = compressed.map(([a, b]) => b + 1 - a).reduce(sumFn, 0) * VIDEO_ANALYTICS_INTERVAL_SECONDS;

            const points = computeLeaderBoardPoints({ key: k, roleId, watched, duration, lastUpdatedAtMs, minLastUpdatedAtMs, maxLastUpdatedAtMs });
            if (!(roleId in scores)) {
                scores[roleId] = 0;
            }
            scores[roleId] += points;
        });

        return scores;
    };

    leader = (pos, { userId, photo, name, points, visibility }) => {
        const s = 80 + 10*(3 - pos);
        const marginTop = pos === 1 ? 0 : 60;

        return (
            <TouchableAnim onPress={() => {}} style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', marginTop, visibility }}>
                {getCircularImage({ src: getImageUrl(photo), dim: s, border: 0 })}

                <View style={{ marginTop: 5 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5, textAlign: 'center' }}>{name}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
                    <Image style={{ height: 10, width: 10 }} src={POINTS_IMG} />
                    <Text style={{ marginLeft: 4, fontSize: 16, letterSpacing: 0.5 }}>{points}</Text>
                </View>
            </TouchableAnim>
        );
    };

    render() {
        const { leaderBoard } = this.state;
        if (!leaderBoard) {
            return <View />;
        }

        const sample = leaderBoard.sort((a, b) => b.points - a.points);
        const items = xrange(3, sample.length).toArray().map(i => {
            const { name, photo, subtitle, points } = sample[i];
            return <ListItem idx={i} key={i} title={name} avatar={photo} subHeading={subtitle} points={points} />;
        });

        const { groupName, groupPhoto, moduleName } = this.detailsObj;
        const moduleText = moduleName ? moduleName + ' module' : 'All modules';

        const sections = [
            { float: 'left', name: ConfigurableTopBar.SECTION_BACK, displayProps: {}, data: {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_AVATAR, displayProps: {}, data: { avatar: groupPhoto }, onClickFn: () => {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_NAME, displayProps: {}, data: { name: 'LeaderBoard', subheading: groupName }, onClickFn: () => {} },
        ];

        return (
            <ScrollView style={{ width: '100%', height: '100%' }}>
                <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                    <View style={custom.root}>
                        <ConfigurableTopBar collection={null} sections={sections}
                                            location={this.props.location} history={this.props.history} />
                        {spacer(20)}

                        <View style={{ width: '90%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#5e5e5e' }}>{moduleText.toUpperCase()}</Text>
                            {spacer(20)}
                            <View style={{ display: 'flex', flexDirection: 'row', width: '90%', justifyContent: 'space-between', marginBottom: -30 }}>
                                {this.leader(2, sample[1])}
                                {this.leader(1, sample[0])}
                                {this.leader(3, sample[2])}
                            </View>
                            <ExpandingImage src={PODIUM} style={{ width: '100%' }} />
                        </View>
                        {spacer(10)}

                        <View style={{ width: '98%', borderRadius: 10, backgroundColor: '#3c50c8', color: '#ffffff',
                                       display: 'flex', flexDirection: 'column' }}>
                            {items}
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    }
}

class ListItem extends React.PureComponent {
    render() {
        const { idx, title, avatar, subHeading, points } = this.props;
        const imgH = 65;

        const textStyle = { color: '#ffffff' };
        return (
            <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <View style={{ width: '90%' }}>
                    <TouchableAnim key={idx} onPress={() => {}}>
                        <View style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center',
                                       borderBottomWidth: 1, borderBottom: '1px solid', borderBottomColor: LIGHTER_COLOR, height: 1.5*imgH }}>
                            <View style={{ width: '10%', height: '100%',
                                           display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, ...textStyle }}>{idx+1}</Text>
                            </View>
                            <View style={{ width: '20%', height: '100%',
                                           display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {getCircularImage({ src: getImageUrl(avatar), dim: imgH, border: 0 })}
                            </View>
                            <View style={{ width: '70%', height: '100%',
                                           display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: '70%', paddingLeft: 10 }}>
                                    <Text style={{ fontSize: 18, letterSpacing: 0.5, ...textStyle }}>{title}</Text>
                                </View>
                                <View style={{ width: '30%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingRight: 5 }}>
                                    <Image src={POINTS_IMG} style={{ height: 14, width: 15, marginRight: 5, marginTop: 2 }} />
                                    <Text style={{ fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5, ...textStyle }}>{points}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableAnim>
                </View>
            </View>
        );
    }
}

const LIGHTER_COLOR = '#cfcfcf';
const PODIUM = 'https://images-lb.heloprotocol.in/leaderboard-1.png-54671-29631-1579971457788.png';
const PODIUM_W = 597;
const PODIUM_H = 206;
const POINTS_IMG = 'https://images-lb.heloprotocol.in/coins.png-16640-358390-1579973346245.png';

const MAX_WIDTH = 450;
const custom = {
    root: {
        height: '100%',
        width: '100%',
        maxWidth: MAX_WIDTH,

        fontFamily: CHAT_FONT_FAMILY,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",

        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    },

    title: {
        fontSize: 20,
        letterSpacing: 0.5,
    },
    subheading: {
        fontSize: 16,
        letterSpacing: 0.5,
        marginTop: 5,
    },
};
