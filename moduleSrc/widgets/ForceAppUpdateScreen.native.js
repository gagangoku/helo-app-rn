import * as React from "react";
import {Alert, Linking} from 'react-native';
import cnsole from "loglevel";
import {Text, View} from "../platform/Util";
import LottieView from "lottie-react-native";
import animation from "../assets/splash-animation";
import {APP_UPDATE_URL, APP_VERSION} from "../constants/Constants";


export class ForceAppUpdateScreen extends React.PureComponent {
    async componentDidMount() {
        cnsole.info('ForceAppUpdateScreenNative componentDidMount: ');
        this.alert();
    }

    alert = () => {
        Alert.alert('Update your app', 'Your app is very old',
            [{ text: 'OK', onPress: this.updateFn }],
            { cancelable: false },
        );
    };
    updateFn = () => {
        this.alert();
        Linking.openURL(APP_UPDATE_URL);
    };

    render() {
        return (
            <View style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', letterSpacing: 2 }}>HELO</Text>

                <View style={{ marginTop: 50, height: 200, width: 200 }}>
                    <LottieView autoPlay={true} loop={true} ref={animation => this.animation = animation} source={animation} />
                </View>

                <Text style={{ fontSize: 12, marginTop: 50, color: '#969696' }}>Version: {APP_VERSION}</Text>
            </View>
        );
    }
}
