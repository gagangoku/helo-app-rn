import React from 'react';
import {ScrollView} from './Util';


export default class ScrollableList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    refElem = () => this.ref.current;

    render() {
        const { list, height } = this.props;
        return (
            <ScrollView style={{...custom.chatRootCtr, height}} ref={this.ref}>
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
