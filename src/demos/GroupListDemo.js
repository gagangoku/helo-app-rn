import React from 'react';
import {FIREBASE_GROUPS_DB_NAME} from '../../moduleSrc/constants/Constants';
import {GroupListUI} from '../../moduleSrc/chat/groups/GroupListController';
import {View} from '../../moduleSrc/platform/Util';
import {sumFn} from '../../moduleSrc/util/Util';
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
        console.log('GroupListDemo componentDidMount: ', this.props, this.state);
        store.subscribe(() => {
            const state = store.getState();
            console.log('store.subscribe: ', state);
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
        console.log('Documents matching after sorting: ', docs);

        const numUnreadChats = docs.map(x => x.numUnreads && x.numUnreads > 0 ? 1 : 0).reduce(sumFn, 0);
        return (<GroupListUI location={this.props.location} history={this.props.history}
                             me={me} docs={docs} numUnreadChats={numUnreadChats}
                             goToChatFn={this.goToChatFn}
        />);
    }
}
