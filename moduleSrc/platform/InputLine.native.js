import React from "react";
import {Keyboard} from 'react-native';
import {InputTextBarWithAttachIcons} from "../widgets/InputTextBarWithAttachIcons";
import cnsole from 'loglevel';


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
        cnsole.log('keyboardDidShow: ', e.endCoordinates.height);
        this.props.setKeyboardHeightFn(e.endCoordinates.height);
    };
    keyboardDidHide = () => {
        cnsole.log('keyboardDidHide');
        this.props.setKeyboardHeightFn(0);
    };

    render() {
        return (
            <InputTextBarWithAttachIcons {...this.props} lineHeight={InputTextBarWithAttachIcons.HEIGHT} />
        );
    }
}
