import React from "react";
import window from "global";
import {InputTextBarWithAttachIcons} from "../widgets/InputTextBarWithAttachIcons";


export class InputLine extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    static HEIGHT = InputTextBarWithAttachIcons.HEIGHT;

    componentDidMount() {
        this.origHeight = window.innerHeight;
        window.addEventListener('resize', this.resizeEventListener, true);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeEventListener);
    }

    resizeEventListener = () => {
        if (window.innerHeight !== this.origHeight) {
            console.log('keyboard open');
            this.props.setKeyboardHeightFn(this.origHeight - window.innerHeight);
        } else {
            console.log('keyboard closed');
            this.props.setKeyboardHeightFn(0);
        }
    };

    render() {
        return (
            <InputTextBarWithAttachIcons {...this.props} lineHeight={InputTextBarWithAttachIcons.HEIGHT} />
        );
    }
}
