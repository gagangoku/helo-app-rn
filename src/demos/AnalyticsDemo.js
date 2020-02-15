import React from 'react';
import GroupAnalytics from '../../moduleSrc/chat/analytics/GroupAnalytics';
import {FIREBASE_GROUPS_DB_NAME} from '../../moduleSrc/constants/Constants';
import LeaderBoard from '../../moduleSrc/chat/analytics/LeaderBoard';
import {ReactMinimalPieChart} from '../../moduleSrc/platform/Util.native';


export default class AnalyticsDemo extends React.Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        title: null,
        headerShown: false,
    });
    static URL = '/demos/analytics';
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const members = [
            'supply:352', 'supply:583', 'supply:1021',
        ];
        const a = <GroupAnalytics collection={FIREBASE_GROUPS_DB_NAME} groupId='helo-kitchen-indiranagar' me='supply:352' />;
        const b = <LeaderBoard collection={FIREBASE_GROUPS_DB_NAME} groupId='helo-kitchen-indiranagar' user='supply:352'
                               idx={-1} groupName={'Helo group'} groupPhoto={'https://images-lb.heloprotocol.in/1.png-112605-800422-1581199156976.png'}
                               moduleName={'M1'} members={members.join(',')} />;
        const c = <ReactMinimalPieChart height={300} data={[{
            color: '#5aaa00',
            value: 40,
        }, {
            color: '#ff5050',
            value: 60,
        }]} />;
        return a;
    }
}
