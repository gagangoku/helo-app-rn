import React from "react";
import {
    computeLeaderBoardPoints,
    getCircularImage,
    getCtx,
    getGroupInfo,
    getImageUrl,
    getUrlParam,
    Image,
    spacer,
    sumFn,
    Text,
    View
} from "../../util/Util";
import {CHAT_FONT_FAMILY, MONTHS, VIDEO_ANALYTICS_INTERVAL_SECONDS} from "../../constants/Constants";
import {ConfigurableTopBar} from "../messaging/TopBar";
import {ReactMinimalPieChart, ScrollView, WINDOW_INNER_HEIGHT} from '../../platform/Util';
import {firebase} from '../../platform/firebase';
import {getPersonNamesByRoleId, hgetAllFromKVStore} from "../../util/Api";
import format from "string-format";
import {OUTPUT_PROGRESSIVE_MODULE} from "../Questions";
import lodash from 'lodash';
import TouchableAnim from "../../platform/TouchableAnim";


export default class GroupAnalytics extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);

        this.state = {
            analytics: null,
            groupPhoto: null,
            groupName: null,
        };
        this.deviceID = null;
        this.uuid = null;
    }

    async componentDidMount() {
        const startTimeMs = new Date().getTime();
        this.detailsObj = {};
        'collection,groupId,user'.split(',').forEach(x => this.detailsObj[x] = this.props[x] || getUrlParam(x));
        const { collection, groupId, user } = this.detailsObj;

        console.log('firebase: ', firebase);
        console.log('firebase.firestore: ', firebase.firestore);

        this.db = firebase.firestore();
        this.doc = this.db.collection(collection).doc(groupId);

        const doc = await this.doc.get();
        console.log('Firebase took: ', new Date().getTime() - startTimeMs);
        console.log('doc: ', doc);

        const { messages, members, photo, name } = getGroupInfo(doc.data(), doc);
        const roleIdToName = await getPersonNamesByRoleId(members);
        const analytics = await this.computeAnalytics(messages, members, roleIdToName);
        this.setState({ analytics, groupPhoto: photo, groupName: name });
    }

    componentWillUnmount() {
    }

    computeAnalytics = async (messages, members, roleIdToName) => {
        const { groupId } = this.detailsObj;
        const hash = format('/analytics/group/{}', groupId);
        //const key = format('/idx/{}/user/{}', idx, user);

        const rsp = await hgetAllFromKVStore(hash);
        console.log('GroupAnalytics hgetAllFromKVStore rsp: ', rsp);

        const keys = Object.keys(rsp);
        keys.forEach(k => rsp[k] = JSON.parse(rsp[k]));

        const _a = keys.map(k => rsp[k].lastUpdatedAtMs);
        const minLastUpdatedAtMs = Math.min(..._a);
        const maxLastUpdatedAtMs = Math.max(..._a);

        const moduleNames = lodash.uniq(messages.filter(m => m.type === OUTPUT_PROGRESSIVE_MODULE).map(m => m.text));
        const perModule = {};
        moduleNames.forEach(m => perModule[m] = { module: m, completed: 0, pending: 0, yetToBegin: 0 });
        const pointsPerUser = {};
        members.forEach(m => pointsPerUser[m] = 0);

        for (let i = 0; i < messages.length; i++) {
            const idx = i;
            const m = messages[i];
            if (m.type === OUTPUT_PROGRESSIVE_MODULE) {
                const { text } = m;

                members.forEach(roleId => {
                    const k = format('/idx/{}/user/{}', idx, roleId);
                    if (!rsp[k]) {
                        perModule[text].yetToBegin += 1;
                        return;
                    }

                    const { compressed, lastUpdatedAtMs, duration } = rsp[k];
                    const watched = compressed.map(([a, b]) => b + 1 - a).reduce(sumFn, 0) * VIDEO_ANALYTICS_INTERVAL_SECONDS;

                    const completePercentage = watched / duration;
                    if (completePercentage >= COMPLETED_THRESHOLD) {
                        perModule[text].completed += 1;
                    } else if (completePercentage < YET_TO_BEGIN_THRESHOLD) {
                        perModule[text].yetToBegin += 1;
                    } else {
                        perModule[text].pending += 1;
                    }

                    const points = computeLeaderBoardPoints({ key: k, roleId, watched, duration, lastUpdatedAtMs, minLastUpdatedAtMs, maxLastUpdatedAtMs });
                    pointsPerUser[roleId] += points;
                });
            }
        }
        console.log('perModule: ', perModule);
        console.log('pointsPerUser: ', pointsPerUser);

        const sortedUsers = members.slice().sort((a, b) => pointsPerUser[b] - pointsPerUser[a]);
        console.log('sortedUsers: ', sortedUsers);
        console.log('roleIdToName: ', roleIdToName);

        const topUsers = sortedUsers.slice(0, NUM_TOP_BOTTOM_USERS).map(u => {
            const x = roleIdToName[u];
            return {
                photo: getImageUrl(x.person.image),
                name: x.person.name,
                points: pointsPerUser[u],
            };
        });
        const bottomUsers = sortedUsers.slice().reverse().slice(0, NUM_TOP_BOTTOM_USERS).reverse().map(u => {
            const x = roleIdToName[u];
            return {
                photo: getImageUrl(x.person.image),
                name: x.person.name,
                points: pointsPerUser[u],
            };
        });

        return {
            overall: {
                completed: moduleNames.map(m => perModule[m].completed).reduce(sumFn, 0),
                pending: moduleNames.map(m => perModule[m].pending).reduce(sumFn, 0),
                yetToBegin: moduleNames.map(m => perModule[m].yetToBegin).reduce(sumFn, 0),
            },
            modules: Object.values(perModule),
            topUsers,
            bottomUsers,
        };
    };

    graph = (size, red, green, showPercentage) => {
        const absLabelFn = ({ data, dataIndex }) => {
            const v = data[dataIndex].value;
            return v > 0 ? v : '';
        };
        const percentLabelFn = ({ data, dataIndex }) => {
            const v = Math.round(data[dataIndex].percentage);
            return v > 0 ? v + '%' : '';
        };
        return (
            <View style={{ height: size, width: size }}>
                <ReactMinimalPieChart
                    height={size}
                    animate={true} animationDuration={500} animationEasing="ease-out"
                    cx={50} cy={50}
                    data={[{
                        color: '#5aaa00',
                        value: green,
                    }, {
                        color: '#ff5050',
                        value: red,
                    }]}
                    label={showPercentage ? percentLabelFn : absLabelFn}
                    labelPosition={60}
                    labelStyle={{ fill: '#ffffff', fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 'bold' }}
                    lengthAngle={360} lineWidth={100}
                    paddingAngle={0} radius={50} rounded={false} startAngle={0} viewBoxSize={[ 100, 100 ]}
                />
            </View>
        );
    };

    moduleDisplay = ({ module, pending, yetToBegin, completed }) => {
        const ff = (color, num, text) => {
            return (
                <View style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: '10%',
                                   flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ backgroundColor: color, height: 10, width: 10, borderRadius: 5, marginRight: 3 }} />
                    </View>
                    <Text style={{ width: '20%', fontSize: 11, textAlign: 'right', paddingRight: 5 }}>{num}</Text>
                    <Text style={{ width: '60%', fontSize: 11, textAlign: 'left' }}>{text}</Text>
                </View>
            );
        };

        return (
            <View style={{ marginRight: 30, minWidth: 100, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }} key={module + pending + completed}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLOR, height: 40, textAlign: 'center' }}>{module.toUpperCase()}</Text>
                {spacer(5)}
                {this.graph(90, pending + yetToBegin, completed, true)}
                {spacer(20)}
                <View style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {ff('#ff0000', pending + yetToBegin, 'Pending')}
                    {spacer(4)}
                    {ff('#00ff00', completed, 'Complete')}
                </View>
            </View>
        );
    };
    userSection = (heading, users) => {
        return (
            <View style={{ border: '1px solid #AEAEAE', backgroundColor: '#ffffff', width: '47%' }}>
                <View style={{ padding: 10 }}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{heading}</Text>
                    {spacer(20)}
                    {users.map(u => this.item(u))}
                </View>
            </View>
        );
    };
    item = ({ photo, name, points }) => {
        const w = 26;
        return (
            <TouchableAnim onPress={() => {}} style={{}}>
                <View style={{ width: '100%', height: 50, fontSize: 15, fontWeight: 400,
                               display: 'flex', flexDirection: 'row', alignItems: 'center' }} key={photo + name + points}>
                    <View style={{ width: '20%' }}>
                        {getCircularImage({ src: photo, dim: w })}
                    </View>
                    <View style={{ width: '50%' }}>
                        <Text style={{ marginLeft: 5 }}>{name}</Text>
                    </View>
                    <View style={{ width: '10%' }}>
                        <Image src={POINTS_IMG} style={{ width: 10, height: 10 }} />
                    </View>
                    <View style={{ width: '20%' }}>
                        <Text style={{ fontSize: 14 }}>{points}</Text>
                    </View>
                </View>
            </TouchableAnim>
        );
    };

    render() {
        const { analytics, groupName, groupPhoto } = this.state;
        if (!analytics) {
            return <View />;
        }
        const DATA = analytics;

        const date = new Date();
        const twoWeeksBack = new Date(date.getTime() - 14*24*60*60*1000);
        const todayDisplay = date.getDate() + ' ' + MONTHS[date.getMonth()].slice(0, 3);
        const twoWeeksBackDisplay = twoWeeksBack.getDate() + ' ' + MONTHS[twoWeeksBack.getMonth()].slice(0, 3);

        const overallCompleted = Math.floor(100 * DATA.overall.completed / (DATA.overall.completed + DATA.overall.pending + DATA.overall.yetToBegin));
        const ytb = Math.ceil(100 * DATA.overall.yetToBegin / (DATA.overall.completed + DATA.overall.pending + DATA.overall.yetToBegin));

        const sections = [
            { float: 'left', name: ConfigurableTopBar.SECTION_BACK, displayProps: {}, data: {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_AVATAR, displayProps: {}, data: { avatar: groupPhoto }, onClickFn: () => {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_NAME, displayProps: {}, data: { name: 'Analytics', subheading: groupName }, onClickFn: () => {} },
        ];
        return (
            <ScrollView horizontal={false}>
                <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                    <View style={{ ...custom.root, color: COLOR, letterSpacing: 0.2 }}>
                        <ConfigurableTopBar collection={null} sections={sections}
                                            location={this.props.location} history={this.props.history} />

                        <View style={{ backgroundColor: '#f5f5f5' }}>
                            <View style={{ width: '90%', marginLeft: '5%', marginRight: '5%' }}>
                                {spacer(20)}
                                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Last 14 days</Text>
                                    <Text style={{ fontSize: 13, opacity: 0.8, marginTop: 4, marginLeft: 4 }}>({twoWeeksBackDisplay} - {todayDisplay})</Text>
                                </View>

                                {spacer(20)}
                                <View style={{ border: '1px solid #AEAEAE', backgroundColor: '#ffffff', padding: 10 }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLOR }}>OVERALL</Text>
                                    {spacer(20)}
                                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', color: '#4d4d4d' }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '35%' }}>
                                            {this.graph(120, DATA.overall.pending + DATA.overall.yetToBegin, DATA.overall.completed, false)}
                                        </View>
                                        <View style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={{ color: '#000000', fontSize: 26, fontWeight: 'bold' }}>{overallCompleted}</Text>
                                                <Text style={{ color: '#000000', fontSize: 16, fontWeight: 'bold' }}>%</Text>
                                            </View>
                                            <Text style={{ fontSize: 13 }}>Completed</Text>
                                        </View>
                                        <View style={{ display: 'flex', flexDirection: 'column' }}>
                                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{100 - overallCompleted}%</Text>
                                                <Text style={{ fontSize: 13, marginTop: 2, marginLeft: 5 }}>Pending</Text>
                                            </View>
                                            {spacer(10)}
                                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{ytb}%</Text>
                                                <Text style={{ fontSize: 13, marginTop: 2, marginLeft: 5 }}>Yet to Begin</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {spacer(20)}
                                <View style={{ border: '1px solid #AEAEAE', backgroundColor: '#ffffff', padding: 10 }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>MODULES</Text>
                                    {spacer(20)}
                                    <ScrollView horizontal={true}>
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center',
                                                       width: '100%', paddingLeft: 5 }}>
                                            {DATA.modules.map(x => this.moduleDisplay(x))}
                                        </View>
                                    </ScrollView>
                                </View>

                                {spacer(20)}
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                    {this.userSection('TOP USERS', DATA.topUsers)}
                                    {this.userSection('BOTTOM USERS', DATA.bottomUsers)}
                                </View>
                                {spacer(20)}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    }
}

const NUM_TOP_BOTTOM_USERS = 3;
const DUMMY = {
    photo: 'https://images-lb.heloprotocol.in/1.jpg-384570-314653-1577546473920.jpeg',
    name: '',
    points: 0,
};

const YET_TO_BEGIN_THRESHOLD = 0.05;
const COMPLETED_THRESHOLD = 0.9;
const POINTS_IMG = 'https://images-lb.heloprotocol.in/coins.png-16640-358390-1579973346245.png';
const COLOR = '#4d4d4d';

const INNER_HEIGHT = WINDOW_INNER_HEIGHT - 10;
const MAX_WIDTH = 450;
const custom = {
    root: {
        // height: INNER_HEIGHT,
        // overflow: 'none',
        width: '100%',
        maxWidth: MAX_WIDTH,

        fontFamily: CHAT_FONT_FAMILY,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
};
