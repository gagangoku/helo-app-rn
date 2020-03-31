import React from 'react';
import {ScrollView} from './Util';


export default class ScrollableList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    refElem = () => this.ref.current;

    render() {
        const { list, style, flatListProps } = this.props;
        return (
            <ScrollView style={{ ...style, ...custom.chatRootCtr }} ref={this.ref}>
                {list}
            </ScrollView>
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
