import React from "react";
import WebView from 'react-native-webview';
import {StatusBar, View} from 'react-native';
import cnsole from 'loglevel';


export class FullscreenVideoWidget extends React.Component {
    async componentDidMount() {
        StatusBar.setHidden(true);
    }
    componentWillUnmount() {
        StatusBar.setHidden(false);
    }

    onNavigationStateChange = ({ url }) => {
        cnsole.info('Webview url: ', url);
    };

    render() {
        const { src } = this.props;
        return (
            <View style={{ height: '100%', width: '100%' }}>
                <WebView source={{ uri: src }} style={{ height: '100%', width: '100%' }}
                         userAgent={USER_AGENT} allowsInlineMediaPlayback={true}
                         mediaPlaybackRequiresUserAction={false} onNavigationStateChange={this.onNavigationStateChange} />
            </View>
        );
    }
}

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36";
