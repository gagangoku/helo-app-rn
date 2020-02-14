import React from 'react';
import DocumentPicker from 'react-native-document-picker';
import {Text, TouchableOpacity, View} from 'react-native';


export default class DocumentPickerDemo extends React.Component {
    static URL = '/demos/document-picker';
    constructor(props) {
        super(props);
        this.state = {};
    }

    async componentDidMount() {
        console.log('document picker: ', DocumentPicker);
    }

    showPicker = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.images],
            });
            console.log('document picker result: ', res);
            this.setState({ res });
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            }
        }
    };

    render() {
        const { res } = this.state;
        return (
            <View style={{ width: 200, height: 200, borderWidth: 1, position: 'relative' }}>
                <TouchableOpacity onPress={this.showPicker}>
                    <Text>Select</Text>
                </TouchableOpacity>

                <Text>{res ? JSON.stringify(res) : ''}</Text>
            </View>
        );
    }
}
