import React from "react";
import {TouchableOpacity, View} from 'react-native';
import {flattenStyleArray} from "../util/Util";


export default class TouchableAnim extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : ({...this.props.style} || {});
        return (
            <View style={style}>
                <TouchableOpacity {...this.props} onPress={this.props.onPress} style={style}>
                    {this.props.children}
                </TouchableOpacity>
            </View>
        );
    }
}
