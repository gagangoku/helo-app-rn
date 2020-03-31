import React from 'react'
import {withStyles} from '../../platform/Util';
import {actionButton, getCtx} from "../../util/Util";
import {getOtp, verifyOtp} from "../../util/Api";
import {CUSTOMER_CARE_HELPLINE} from "../../constants/Constants";
import {TEAL_COLOR_THEME} from "../../styles/common";
import SuperRoot from "../../widgets/SuperRoot";
import cnsole from 'loglevel';


class OtpInputScreen extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.state = {
            otp: '',
            mismatch: false,
            isError: false,
        };
    }

    onSubmit = () => {
        if (this.state.otp.length !== 6) {
            window.alert('Please enter 6 digit otp');
            return;
        }

        // Make the api call
        const obj = this;
        verifyOtp(this.contextObj.phoneNumber, this.state.otp, (otpResponse) => {
            cnsole.log('otpResponse:', otpResponse);
            if (otpResponse === 'ok') {
                cnsole.log('Otp verified');

                this.props.otpSuccessFn(this.state.otp);
            } else {
                cnsole.log('Otp mismatch');
                obj.setState({ mismatch: true });
            }
        }, (ex) => {
            cnsole.log('Error in getting otp:', ex);
            obj.setState({isError: true});
        });
    };
    resendOtp = () => {
        getOtp(this.contextObj.phoneNumber, this.props.role, (r) => {
            cnsole.log('Got otp:', r);
        }, (ex) => {
            window.alert('Seems like a problem with our servers right now. Try calling ' + CUSTOMER_CARE_HELPLINE);
            cnsole.log('Error in generating otp:', ex);
        });
    };

    onChange = (elem) => {
        const val = elem.target.value;
        if (val.length <= 6) {
            this.setState({otp: val, mismatch: false, isError: false});
        }
    };
    render() {
        const {classes} = this.props;
        const errorMsg = (<span className={classes.errorMessage}>{this.state.mismatch ? 'Bad otp, try again' : (this.state.isError ? 'Request failed, try again' : '')}</span>);
        return (
            <SuperRoot>
                <div className={classes.root}>
                    <div className={classes.heading}>Enter the OTP</div>
                    <input className={classes.textField} type="number" value={this.state.otp} onChange={this.onChange} />
                    {errorMsg}
                    <div className={classes.resendOtpHeading}>Failed to receive 6 digit OTP, try again !</div>
                    <div className={classes.resendOtpText} onClick={() => this.resendOtp()}>RESEND OTP</div>

                    <div style={{ paddingTop: 10 }}>
                        {actionButton('SUBMIT', this.onSubmit)}
                    </div>
                </div>
            </SuperRoot>
        );
    }
}

const styles = theme => ({
    root: {
        textAlign: 'center',
        verticalAlign: 'middle',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    heading: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 30,
        fontSize: 36,
        color: TEAL_COLOR_THEME,
    },
    textField: {
        marginTop: '20%',

        width: 120,
        fontSize: 20,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 3,
        paddingLeft: 10,
        paddingRight: 10,

        fontWeight: 600,
        outlineWidth: 0,
        textAlign: 'left',
        verticalAlign: 'middle',
        letterSpacing: '5px',
    },
    resendOtpHeading: {
        fontSize: 14,
        fontWeight: 300,
        marginBottom: 10,
    },
    resendOtpText: {
        fontSize: 16,
        fontWeight: 600,
        textDecoration: 'underline',
        marginBottom: 10,
        cursor: 'pointer',
    },
    errorMessage: {
        color: 'red',
        fontSize: 15,
        marginTop: 10,
        marginBottom: 10,
        height: 10,
    },
});

export default withStyles(styles)(OtpInputScreen);
