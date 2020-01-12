import React from 'react';
import {StyleSheet, Text, View} from 'react-native';


export default class HomeScreen extends React.Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        title: null,
        headerShown: false,
    });
    static URL = '/home';

    render() {
        const { navigation } = this.props;
        return (
            <View>
                <Text>Hi</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    scrollView: {},
});
