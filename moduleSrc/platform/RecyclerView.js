import React from "react";
import {recyclerListView} from '../platform/Util';
import {View, WINDOW_INNER_WIDTH} from "./Util";


export class RecyclerView extends React.PureComponent {
    constructor(props) {
        super(props);

        const { data, inverted } = this.props;
        const array = inverted ? data.slice().reverse() : data;
        const dataProvider = new recyclerListView.DataProvider((r1, r2) => {
            return r1 !== r2;
        }).cloneWithRows(array);

        this.state = {
            dataProvider,
        };

        this.layoutProvider = new recyclerListView.LayoutProvider((i) => {
            return this.state.dataProvider.getDataForIndex(i).type;
        }, (type, dim) => {
            dim.width = WINDOW_INNER_WIDTH;
            dim.height = 100;           // TODO: Try to get this more accurate
        });
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldData = prevProps.data;
        const newData = this.props.data;
        const isMessageAdded = newData.length > oldData.length;
        const isLongpress = prevProps.longpressedIdxMap !== this.props.longpressedIdxMap;

        // TODO: Handle message deletes as well
        if (isMessageAdded || isLongpress) {
            const array = this.props.inverted ? newData.slice().reverse() : newData;
            this.setState(prevState => ({
                dataProvider: prevState.dataProvider.cloneWithRows(array, 0)
            }));
        }
    }

    renderRow = (type, data) => {
        const { renderItem, inverted } = this.props;
        const elem = renderItem(data, data.idx);
        const transform = inverted ? [{ scaleY: -1 }] : [];
        return <View style={{ width: '100%', transform }}>{elem}</View>;
    };

    render() {
        const { inverted } = this.props;
        const { dataProvider } = this.state;
        const transform = inverted ? [{ scaleY: -1 }] : [];
        return (
            <View style={{ height: '100%', width: '100%', transform, paddingTop: 5 }}>
                <recyclerListView.RecyclerListView rowRenderer={this.renderRow}
                                                   forceNonDeterministicRendering={true}
                                                   dataProvider={dataProvider}
                                                   layoutProvider={this.layoutProvider}/>
            </View>
        );
    }
}
