import React from 'react';
import {Text, View} from "../platform/Util";


export default class SplashPage extends React.Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        const { onDoneFn, onDoneTimeoutMs } = this.props;
        setTimeout(onDoneFn, onDoneTimeoutMs);
    }

    render() {
        return (
            <View>
                <Text>Splash</Text>
            </View>
        );
    }
}

