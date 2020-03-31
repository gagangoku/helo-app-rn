import React from 'react';
import {FlatList, View} from 'react-native';
import cnsole from 'loglevel';


export default class ScrollableList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    refElem = () => this.ref.current;

    keyExtractor = ({ item, index }) => index;
    renderItem = ({ item, index }) => {
        const { itemRenderFn } = this.props;
        return itemRenderFn(item, index);
    };
    onEndReached = () => {
        cnsole.info('onEndReached');
    };

    render() {
        const { style, flatListProps, inverted, data } = this.props;
        const dataProp = inverted ? data.slice().reverse() : data;
        const contentContainerStyle = inverted ? { flexGrow: 1, justifyContent: 'flex-end' } : {};
        return (
            <View style={{ ...style, display: 'flex', flexDirection: 'column' }} ref={this.ref}>
                <FlatList
                    inverted={inverted} contentContainerStyle={contentContainerStyle}
                    legacyImplementation={true}
                    nestedScrollEnabled={true}
                    data={dataProp}
                    renderItem={this.renderItem}
                    keyExtractor={this.keyExtractor}
                    extraData={{}}
                    onEndReached={this.onEndReached}
                    {...flatListProps}
                />
            </View>
        );
    }
}
