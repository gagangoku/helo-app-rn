import React from 'react';
import {InputElem, phoneNumberSelector, Text, View} from '../../platform/Util';
import {actionButton} from "../../util/Util";
import {getOtp, verifyOtp} from "../../util/Api";
import {CHAT_FONT_FAMILY} from "../../constants/Constants";
import cnsole from 'loglevel';
import TouchableAnim from "../../platform/TouchableAnim";


export default class LoginScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            phoneNumber: '',
            otpEntered: '',
            phoneFinalized: false,
            errorMessage: '',
        };
    }

    async componentDidMount() {
        const { phone } = await phoneNumberSelector();
        if (phone) {
            const phoneNumber = phone.startsWith('+91') ? phone.slice(3, phone.length) : phone;
            this.setState({ phoneNumber, phoneFinalized: false, errorMessage: '' });
        }
    }

    requestOtp = async () => {
        const { phoneNumber } = this.state;
        cnsole.info('Getting Otp for phone: ', phoneNumber);
        try {
            const rsp = await new Promise((resolve, reject) => getOtp(phoneNumber, 'chat', resolve, reject));
            cnsole.info('getOtp response: ', rsp);
            this.setState({ phoneFinalized: true });
        } catch (e) {
            cnsole.warn('Error in getting otp: ', e);
            this.setState({ errorMessage: 'Network issue, try again' });
        }
    };
    changePhone = () => {
        this.setState({ phoneFinalized: false })
    };

    onSubmit = async () => {
        const { onSuccessFn } = this.props;
        const { phoneNumber, otpEntered } = this.state;
        cnsole.info('Verifying phone & otp: ', phoneNumber, otpEntered);
        try {
            const rsp = await new Promise((resolve, reject) => verifyOtp(phoneNumber, otpEntered, resolve, reject));
            cnsole.info('verifyOtp response: ', rsp);
            if (rsp === 'ok') {
                // Verified
                onSuccessFn(phoneNumber);
            } else {
                // Incorrect OTP
                this.setState({ errorMessage: 'Wrong OTP, try again' });
            }
        } catch (e) {
            cnsole.warn('Error in verifying OTP: ', e);
            this.setState({ errorMessage: 'Network issue verifying OTP, try again' });
        }
    };

    onChangePhone = (phoneNumber) => {
        if (phoneNumber.length <= 10) {
            this.setState({ phoneNumber, errorMessage: '' });
        }
    };
    onChangeOtp = (otpEntered) => {
        if (otpEntered.length <= 6) {
            this.setState({ otpEntered, errorMessage: '' });
        }
    };

    render() {
        const { phoneNumber, otpEntered, errorMessage, phoneFinalized } = this.state;

        const light = '#9e9e9e';
        const dark = '#000000';
        const submitBtnStyle = { backgroundColor: otpEntered.length === 6 ? dark : light };
        const requestOtpBtnStyle = { backgroundColor: phoneNumber.length === 10 ? dark : light };
        const submitBtn = actionButton('VERIFY', this.onSubmit, { style: submitBtnStyle });
        const requestOtpBtn = actionButton('GET OTP', this.requestOtp, { style: requestOtpBtnStyle });

        return (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <View style={{ ...custom.root, width: '100%', maxWidth: 450,
                               display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <Text style={{ marginTop: 20, marginBottom: 30, fontSize: 20 }}>SIGNUP</Text>

                    <InputElem placeholder='  Your Phone number' type="number" keyboardType='numeric'
                               style={{ marginTop: 20, fontSize: 16, width: '60%', height: 60, letterSpacing: 2, textAlign: 'center',
                                        borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#a0a0a0',
                                        outline: 'none', border: '0px', borderBottom: '1px solid #a0a0a0' }}
                               value={phoneNumber} editable={!phoneFinalized}
                               onChange={(elem) => this.onChangePhone(elem.target.value)}
                               onChangeText={this.onChangePhone} />
                    <TouchableAnim onPress={this.changePhone} style={{}}>
                        <Text style={{ fontSize: 12, marginTop: 10, marginBottom: 10, color: '#627dff', textDecoration: 'underline' }}>Change phone number</Text>
                    </TouchableAnim>
                    <Text style={custom.errorMessage}>{errorMessage}</Text>

                    <InputElem placeholder='  Enter OTP' type="number" keyboardType='numeric'
                               style={{ marginTop: 20, fontSize: 16, width: '40%', height: 60, letterSpacing: 2, textAlign: 'center',
                                        borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#a0a0a0',
                                        outline: 'none', border: '0px', borderBottom: '1px solid #a0a0a0' }}
                               value={otpEntered} editable={phoneFinalized}
                               onChange={(elem) => this.onChangeOtp(elem.target.value)}
                               onChangeText={this.onChangeOtp} />

                    <View style={{ marginTop: 40 }}>
                        {phoneFinalized ? submitBtn : requestOtpBtn}
                    </View>
                </View>
            </View>
        );
    }
}

const custom = {
    root: {
        fontFamily: CHAT_FONT_FAMILY,
    },
    errorMessage: {
        color: 'red',
        fontSize: 15,
        marginTop: 10,
        marginBottom: 10,
    },
};
