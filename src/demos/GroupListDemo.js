import React from 'react';
import {FIREBASE_GROUPS_DB_NAME, VIDEO_PAUSE} from '../../moduleSrc/constants/Constants';
import {GroupListUI} from '../../moduleSrc/chat/groups/GroupListController';
import {View} from '../../moduleSrc/platform/Util';
import {getImageUrl, sumFn} from '../../moduleSrc/util/Util';
import {store} from '../../App';


export default class GroupListDemo extends React.Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        title: null,
        headerShown: false,
    });
    static URL = '/demos/group-list';
    constructor(props) {
        super(props);
        this.state = {
            state: store.getState(),
        };
    }

    async componentDidMount() {
        store.subscribe(() => {
            const state = store.getState();
            console.log('store.subscribe at ', new Date().getTime());
            this.setState({ state });
        });
    }

    goToChatFn = ({ ...args }) => {
        console.log('Goto chat: ', args);
    };

    render() {
        const { state } = this.state;
        const { documentsCache, userDetails } = state;
        if (!documentsCache || !userDetails) {
            return <View />;
        }

        const { role, id } = userDetails;
        const me = {...userDetails, sender: role + ':' + id };

        const allDocs = {};
        Object.values(documentsCache).flatMap(x => x).forEach(x => allDocs[x.groupId] = x);

        const docs = Object.values(allDocs).filter(x => x.messages.length > 0 || x.collection === FIREBASE_GROUPS_DB_NAME);
        docs.sort((d1, d2) => d2.timestamp - d1.timestamp);
        console.log('Documents matching after sorting at: ', new Date().getTime(), docs.length);
        // console.log('DEBUG: Documents matching after sorting: ', docs);

        const numUnreadChats = docs.map(x => x.numUnreads && x.numUnreads > 0 ? 1 : 0).reduce(sumFn, 0);
        return (<GroupListUI location={this.props.location} history={this.props.history}
                             me={me} docs={docs} numUnreadChats={numUnreadChats}
                             goToChatFn={this.goToChatFn}
        />);
    }

    render2() {
        const me = { role: 'supply', id: 352, name: 'Gagan' };
        const docs = [
            { collection: FIREBASE_GROUPS_DB_NAME, groupId: 'helo-kitchen', title: 'Helo kitchen indiranagar', avatar: VIDEO_PAUSE,
              numUnreads: 1, timestamp: new Date().getTime(), subHeading: 'blah', messages: [], members: [] },
            { collection: FIREBASE_GROUPS_DB_NAME, groupId: 'helo-kk', title: 'Helo xxx', avatar: VIDEO_PAUSE,
                numUnreads: 0, timestamp: new Date().getTime(), subHeading: 'bluuh', messages: [], members: [] },
        ];
        const numUnreadChats = 2;

        return (<GroupListUI location={this.props.location} history={this.props.history}
                             me={me} docs={docs} numUnreadChats={numUnreadChats}
                             goToChatFn={this.goToChatFn}
        />);
    }
}
