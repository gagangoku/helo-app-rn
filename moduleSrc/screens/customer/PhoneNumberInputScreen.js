import React from 'react';
import {withStyles} from '../../platform/Util';
import {actionButton, getCtx} from "../../util/Util";
import {getOtp} from "../../util/Api";
import {TEAL_COLOR_THEME} from "../../styles/common";
import {IS_MOBILE_SCREEN} from "../../constants/Constants";
import SuperRoot from "../../widgets/SuperRoot";
import cnsole from 'loglevel';


class PhoneNumberInputScreen extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.state = {
            phoneNumber: '',
            isError: false,
        };
    }

    onSubmit = () => {
        if (this.state.phoneNumber.length !== 10) {
            window.alert('Please enter a 10 digit phone number');
            return;
        }

        // Make the api call
        const obj = this;
        getOtp(this.state.phoneNumber, this.props.role, (r) => {
            cnsole.log('Got otp:', r);
            this.props.submitFn(this.state.phoneNumber);
        }, (ex) => {
            cnsole.log('Error in generating otp:', ex);
            obj.setState({isError: true});
        });
    };

    onChange = (elem) => {
        const val = elem.target.value;
        if (val.length <= 10) {
            this.setState({phoneNumber: val, isError: false});
        }
    };

    render() {
        const {classes} = this.props;
        const errorMsg = (<span className={classes.errorMessage}>{this.state.isError ? 'Request failed, try again' : ''}</span>);
        return (
            <SuperRoot>
                <div className={classes.root}>
                    <div className={classes.heading}>Enter your phone number</div>
                    <div className={classes.subText}>We'll be sending an OTP to this number for verification</div>
                    <input className={classes.textField} type="number" value={this.state.phoneNumber} onChange={this.onChange} />
                    {errorMsg}

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

        marginLeft: IS_MOBILE_SCREEN ? 15 : '20%',
        marginRight: IS_MOBILE_SCREEN ? 15 : '20%',
    },
    heading: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 30,
        fontSize: 36,
        color: TEAL_COLOR_THEME,
    },
    subText: {
        fontSize: 14,
        marginTop: 10,
    },
    textField: {
        marginTop: '20%',

        // width: '50%',
        width: 180,
        fontSize: 20,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 3,
        paddingLeft: 10,
        paddingRight: 10,

        fontWeight: 500,
        outlineWidth: 0,
        textAlign: 'left',
        verticalAlign: 'middle',
        letterSpacing: '4px',
    },
    errorMessage: {
        color: 'red',
        fontSize: 15,
        marginTop: 10,
        marginBottom: 10,
        height: 10,
    },
});
export default withStyles(styles)(PhoneNumberInputScreen);
