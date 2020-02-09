import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {actionButton, getCtx, spacer} from "../../../util/Util";
import {TEAL_COLOR_THEME, TEXT_COLOR_LIGHT} from "../../../styles/common";
import SuperRoot from "../../../widgets/SuperRoot";
import Modal from "react-modal";
import {IS_MOBILE_SCREEN, PARTNER_CARE_HELPLINE} from "../../../constants/Constants";
import window from 'global/window';


class ConfirmOrderScreen extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.state = {
            name: '',
            presentAddress: '',
            nativeAddress: '',

            gender: 'OTHER',

            termsAgreed: false,
            tncModalOpen: false,
            inflight: false,
        };
    }

    onSubmit = async (checkTerms) => {
        if (!this.state.name) {
            window.alert('Your name is mandatory');
            return;
        }
        if (!this.state.fullAddress) {
            window.alert('Your address is mandatory');
            return;
        }
        if (!this.state.nativeAddress) {
            window.alert('Your native address is mandatory');
            return;
        }

        if (checkTerms && !this.state.termsAgreed) {
            this.toggleModal();
            return;
        }

        this.setState({ inflight: true });
        await this.props.onSubmitFn({...this.state, termsAgreed: true});
        this.setState({ inflight: false });
    };

    onChange = (field) => (elem) => {
        const val = elem.target.value;
        if ((field === 'customerPhone' || field === 'supplyPhone') && val.length > 10) {
        } else {
            this.setState({ [field]: val });
        }
    };

    toggleModal = () => {
        this.setState({ tncModalOpen: !this.state.tncModalOpen });
    };
    closeModal = () => {
        this.setState({ tncModalOpen: false });
        document.body.style.overflow = 'auto';
    };
    disableScroll = () => {
        document.body.style.overflow = 'hidden';
    };

    tncAgree = () => {
        this.setState({ termsAgreed: true });
        this.closeModal();
        this.onSubmit(false);
    };
    tncDisagree = () => {
        this.setState({ termsAgreed: false });
        window.alert('I guess you found something unreasonable in our reasonable clauses, no worries. Appreciate your time. Feel free to discuss it with us on phone: ' + PARTNER_CARE_HELPLINE);
        this.closeModal();
    };
    modalContent = () => {
        const {classes} = this.props;
        const clauses = (
            <ol>
                <li className={classes.tncLiItem}>No abusing, shouting, physical violence etc.</li>
                <li className={classes.tncLiItem}>Don't ask customers for cash / advance</li>
            </ol>
        );

        return (
            <Modal isOpen={this.state.tncModalOpen} onRequestClose={this.closeModal}
                   style={tncModalStyles} onAfterOpen={this.disableScroll} contentLabel="Example Modal">
                <div className={classes.tncModalHeading}>TERMS AND CONDITIONS</div>
                <div className={classes.tncModalSubheading}>Our terms are pretty simple</div>
                <div className={classes.tncModalContent}>
                    {clauses}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', marginTop: 40, justifyContent: 'space-around' }}>
                    {actionButton('I AGREE', this.tncAgree, {width: 100, minWidth: 100, fontSize: 15})}
                    {actionButton('DISAGREE', this.tncDisagree, {width: 100, minWidth: 100, fontSize: 15})}
                </div>
            </Modal>
        );
    };

    render() {
        const {classes} = this.props;
        const backgroundColor = this.state.termsAgreed ? TEAL_COLOR_THEME : TEXT_COLOR_LIGHT;
        const submitFn = this.state.inflight ? () => console.log('inflight') : () => this.onSubmit(true);
        const submitBtn = this.state.tncModalOpen ? '' : actionButton('SUBMIT', submitFn, { backgroundColor });
        return (
            <SuperRoot>
                <div className={classes.root}>
                    <div className={classes.title}>Confirm</div>
                    <div className={classes.desc}>
                        Please confirm your details.
                    </div>
                    <div className={classes.formContainer}>
                        <div className={classes.formInputContainer}>
                            <input placeholder=" Your name" className={classes.formInput} type={'string'}
                                   value={this.state.customerName} onChange={this.onChange('name')} />
                        </div>

                        <div className={classes.formInputContainer}>
                            <textarea rows={3} value={this.state.fullAddress} placeholder=" Your present address"
                                      className={classes.formTextarea} onChange={this.onChange('fullAddress')} />
                        </div>

                        <div className={classes.formInputContainer}>
                            <textarea rows={3} value={this.state.fullAddress} placeholder=" Your native address"
                                      className={classes.formTextarea} onChange={this.onChange('nativeAddress')} />
                        </div>

                        <div className={classes.formInputContainer}>
                            <textarea rows={4} value={this.state.addedComments} placeholder=" Additional comments"
                                      className={classes.formTextarea} onChange={this.onChange('addedComments')} />
                        </div>

                        <div className={classes.formInputContainer}>
                            Please read the <span onClick={this.toggleModal} className={classes.tncText}>terms and conditions</span> and agree.
                        </div>
                        {spacer()}

                        {this.modalContent()}
                    </div>

                    {submitBtn}
                    {spacer(30)}
                </div>
            </SuperRoot>
        );
    }
}

const INNER_HEIGHT = 100;
const MIN_ADDRESS_LENGTH = 20;
const styles = theme => ({
    root: {
        textAlign: 'center',
        verticalAlign: 'middle',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        color: TEAL_COLOR_THEME,
        marginTop: 30,
        marginBottom: 30,
    },
    desc: {
        marginBottom: 30,
        width: '80%',
        textAlign: 'center',
        lineHeight: 1.5,
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    formInputContainer: {
        marginBottom: 10,
    },
    formInput: {
        width: '80%',
        fontSize: 17,
        height: 40,
        paddingLeft: 10,
        paddingTop: 5,
        paddingBottom: 5,
        outlineWidth: 0,
    },
    formTextarea: {
        width: '80%',
        fontSize: 17,
        paddingLeft: 10,
        paddingTop: 5,
        paddingBottom: 5,
        outlineWidth: 0,
        lineHeight: 1.5,
    },

    tncText: {
        textDecoration: 'underline',
        fontWeight: 'bold',
    },
    tncModalHeading: {
        fontSize: 20,
        fontWeight: '500',
        marginBottom: 20,
        textDecoration: 'underline',
        textAlign: 'center',
    },
    tncModalSubheading: {
        marginBottom: 10,
    },
    tncModalContent: {
        lineHeight: 1.2,
    },
    tncLiItem: {
        marginBottom: 10,
    },
});
const tncModalStyles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    content: {
        position: "absolute",
        top: (IS_MOBILE_SCREEN ? 0.05 : 0.2) * INNER_HEIGHT,
        bottom: (IS_MOBILE_SCREEN ? 0.05 : 0.2) * INNER_HEIGHT,
        left: IS_MOBILE_SCREEN ? 40 : window.innerWidth * 0.3,
        right: IS_MOBILE_SCREEN ? 40 : window.innerWidth * 0.3,
        border: "1px solid #ccc",
        background: "#fff",
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        borderRadius: "4px",
        outline: "none",
        padding: "20px"
    },


};
export default withStyles(styles)(ConfirmOrderScreen);
