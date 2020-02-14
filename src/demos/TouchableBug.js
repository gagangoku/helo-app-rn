import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';


export default class TouchableBug extends React.Component {
    static URL = '/demos/touchable-bugs';

    constructor(props) {
        super(props);
        this.state = {
        };
    }
    onPress = () => {
        console.log('Touchable pressed');
    };

    render() {
        return (
            <View style={{ width: 200, height: 200, borderWidth: 1, position: 'relative' }}>
                <TouchableOpacity onPress={this.onPress}>
                    <View style={{ height: 40, width: 50, borderWidth: 1 }}>
                        <Text>Hi - clickable</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={this.onPress}>
                    <View style={{ height: 40, width: 50, borderWidth: 1, marginLeft: 300 }}>
                        <Text>Hi - unclickable</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={this.onPress}>
                    <View style={{ height: 40, width: 50, borderWidth: 1, top: 100 }}>
                        <Text>Hi - unclickable</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={this.onPress}>
                    <View style={{ height: 40, width: 50, borderWidth: 1, position: 'absolute', right: 30 }}>
                        <Text>Hi - unclickable</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}
