import React from "react";
import {TouchableOpacity} from 'react-native';


export default class TouchableAnim extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <TouchableOpacity onPress={this.props.onPress}>
                {this.props.children}
            </TouchableOpacity>
        );
    }
}
