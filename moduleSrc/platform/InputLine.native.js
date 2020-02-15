import React from "react";
import {Keyboard} from 'react-native';
import {InputTextBarWithAttachIcons} from "../widgets/InputTextBarWithAttachIcons";


export class InputLine extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    static HEIGHT = InputTextBarWithAttachIcons.HEIGHT;

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    keyboardDidShow = (e) => {
        console.log('keyboardDidShow: ', e.endCoordinates.height);
        this.props.setKeyboardHeightFn(e.endCoordinates.height);
    };
    keyboardDidHide = () => {
        console.log('keyboardDidHide');
        this.props.setKeyboardHeightFn(0);
    };

    render() {
        return (
            <InputTextBarWithAttachIcons {...this.props} lineHeight={InputTextBarWithAttachIcons.HEIGHT} />
        );
    }
}
