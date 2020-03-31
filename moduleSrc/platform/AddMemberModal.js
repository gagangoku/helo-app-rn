import React from "react";
import {InputElem, View} from "./Util";
import {actionButton, spacer} from "../util/Util";
import {USER_BACKGROUND_COLOR_DARK} from "../chat/Constants";
import {CHAT_FONT_FAMILY} from "../constants/Constants";


export class AddMemberModal extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
        this.state = {
            phone: '',
            name: '',
        };
    }

    onChangeNameFn = (elem) => this.setState({ name: elem.target.value });
    onChangeTextNameFn = (name) => this.setState({ name });
    onChangePhoneFn = (elem) => {
        if (elem.target.value.length <= 10) {
            this.setState({ phone: elem.target.value });
        }
    };
    onChangeTextPhoneFn = (phone) => {
        if (phone.length <= 10) {
            this.setState({ phone });
        }
    };

    render() {
        const { name, phone } = this.state;
        const nameBorderColor = name.length < 3 ? BORDER_COLOR_RED : BORDER_COLOR_GRAY;
        const phoneBorderColor = phone.length !== 10 ? BORDER_COLOR_RED : BORDER_COLOR_GRAY;
        const nameDisabled = this.props.name ? { 'disabled': true } : {};
        const phoneDisabled = this.props.phone ? { 'disabled': true } : {};
        const btnStyle = name.length < 3 || phone.length !== 10 ? { backgroundColor: BORDER_COLOR_GRAY } : { backgroundColor: COLOR_BLUE };

        return (
            <View style={{ height: '100%', width: '100%', ...custom.root,
                           display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                               padding: 20, width: MAX_WIDTH/1.7, backgroundColor: '#ffffff' }}>
                    {spacer(20)}
                    <View style={custom.formInputContainer}>
                        <InputElem placeholder='  Name' type="text" style={{...custom.textInput, letterSpacing: 1, borderBottomColor: nameBorderColor}}
                                   value={name} {...nameDisabled}
                                   onChange={this.onChangeNameFn} onChangeText={this.onChangeTextNameFn} />

                    </View>
                    {spacer(20)}
                    <View style={custom.formInputContainer}>
                        <InputElem placeholder='  Phone' type="number" keyboardType='numeric' style={{...custom.textInput, letterSpacing: 2, borderBottomColor: phoneBorderColor}}
                                   value={phone} {...phoneDisabled}
                                   onChange={this.onChangePhoneFn} onChangeText={this.onChangeTextPhoneFn} />
                    </View>

                    {spacer(20)}
                    {actionButton('ADD', () => this.props.addMemberFn({ name, phone }), { width: 100, height: 50, style: btnStyle})}
                </View>
            </View>
        );
    }
}

const BORDER_COLOR_RED = '#ff8b4a';
const BORDER_COLOR_GRAY = '#b9b9b9';
const COLOR_BLUE = USER_BACKGROUND_COLOR_DARK;
const custom = {
    root: {
        fontFamily: CHAT_FONT_FAMILY,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        backgroundColor: '#ffffff',
    },
    formInputContainer: {
        width: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    },
    textInput: {
        padding: 0,
        margin: 0,
        height: 40,
        fontSize: 20,
        paddingLeft: 2,
        width: '80%',
        border: '0px',
        outline: 'none',
        borderBottom: '1px solid #000000',
        borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#000000',
    },
};
