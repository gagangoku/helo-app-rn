import React from 'react';
import {FlatList, ScrollView, View} from 'react-native';


export default class ScrollableList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    refElem = () => this.ref.current;

    render() {
        const { list, height } = this.props;
        return (
            <View style={{ height, display: 'flex', flexDirection: 'column' }} ref={this.ref}>
                <FlatList
                    inverted={true}
                    data={list.slice().reverse()}
                    renderItem={({ item, index }) => item}
                    keyExtractor={({ item, index }) => index}
                    extraData={{}}
                    removeClippedSubviews={false}
                    maxToRenderPerBatch={10}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', }}
                />
            </View>
        );
    }
}

const custom = {
    chatRootCtr: {
        paddingLeft: 1,
        paddingRight: 1,
        overflowY: 'scroll',
    },
};
