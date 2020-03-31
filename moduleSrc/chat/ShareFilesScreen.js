import React from 'react';
import {Text, View} from "../platform/Util";
import {CHAT_FONT_FAMILY} from "../constants/Constants";


export class ShareFilesScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
    }

    render() {
        return (
            <View style={{ height: '100%', width: '100%',
                           display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={custom.text}>Coming soon !</Text>
            </View>
        );
    }
}

const custom = {
    root: {
        fontFamily: CHAT_FONT_FAMILY,
    },
    text: {
        fontFamily: CHAT_FONT_FAMILY,
        fontSize: 16,
    },
};
