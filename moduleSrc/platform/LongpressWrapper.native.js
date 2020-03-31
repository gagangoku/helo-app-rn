import React from "react";
import cnsole from "loglevel";
import {flattenStyleArray} from "../util/Util";
import {View} from "./Util.native";
import {TouchableWithoutFeedback} from "./Util";


export class LongpressWrapper extends React.PureComponent {
    constructor(props) {
        super(props);
        const { idx, longpressedIdxMap } = props;
    }

    onPress = () => {
        const { idx, longpressedIdxMap, onMessageLongPressed } = this.props;
        if (Object.keys(longpressedIdxMap).length > 0) {
            cnsole.info('onLongPress: ', idx);
            onMessageLongPressed(idx);
        }
    };
    onLongPress = () => {
        const { idx, onMessageLongPressed } = this.props;
        cnsole.info('onLongPress: ', idx);
        onMessageLongPressed(idx);
    };

    render() {
        const props = {...this.props};
        const { idx, longpressedIdxMap, children } = props;
        const longPressed = !!longpressedIdxMap[idx];
        delete props.children;
        delete props.style;
        cnsole.info('LongpressWrapper render: ', idx, longPressed, longpressedIdxMap);

        const pressedStyle = longPressed ? { backgroundColor: '#a0a0a0' } : {};
        const style = Array.isArray(this.props.style) ? flattenStyleArray(this.props.style) : ({...this.props.style} || {});
        return (
            <TouchableWithoutFeedback {...props} style={style} onPress={this.onPress} onLongPress={this.onLongPress}>
                <View style={pressedStyle}>
                    {children}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
