import React from "react";
import {getCtx, getDetailsFromPhone, isDebugMode, spacer, Text, View} from "../../util/Util";
import {CHAT_FONT_FAMILY, DESCRIPTOR_CUSTOMER, DESCRIPTOR_VISITOR} from "../../constants/Constants";
import {crudsRead, crudsUpdate} from "../../util/Api";
import window from "global";
import EditableTopNameBar from "../../widgets/EditableTopNameBar";
import EditableImageWidget from "../../widgets/EditableImageWidget";
import cnsole from 'loglevel';
import EditableTextBox from "../../widgets/EditableTextBox";
import {refetchDetails} from "../../platform/Util";


export default class MyProfile extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            visitor: null,
            customer: null,
            supply: null,
            detailsFromPhone: null,
        };
    }

    async componentDidMount() {
        const detailsFromPhone = await getDetailsFromPhone();
        this.setState({ detailsFromPhone });

        const { role, id } = detailsFromPhone;
        cnsole.log('role, id: ', role, id);
        switch (role) {
            case 'supply':
                window.location.href = '/person/' + id;
                break;
            case 'visitor':
                const visitor = await crudsRead(DESCRIPTOR_VISITOR, id);
                this.setState({ visitor });
                break;
            case 'cust':
                const customer = await crudsRead(DESCRIPTOR_CUSTOMER, id);
                this.setState({ customer });
                break;
            default:
        }
    }

    render() {
        const { visitor, customer, supply, detailsFromPhone } = this.state;
        if (!visitor && !customer) {
            return <View />;
        }
        return <MyProfileUI visitor={visitor} customer={customer} supply={supply} phone={detailsFromPhone.phone} />
    }
}

export class MyProfileUI extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            visitor: this.props.visitor,
            customer: this.props.customer,
            supply: this.props.supply,
            editing: false,
        };
    }

    onUpdateNameFn = async (name) => await this.onUpdateFn({ name });
    onUpdateImageFn = async (photo) => await this.onUpdateFn({ photo });
    onUpdateDesignationFn = async (designation) => await this.onUpdateFn({ designation });
    onUpdateFn = async (obj) => {
        cnsole.info('onUpdateFn: ', obj);
        const { visitor } = this.state;
        if (visitor) {
            const v = await crudsRead(DESCRIPTOR_VISITOR, visitor.id);
            const newVisitor = { ...v, ...obj };
            await crudsUpdate(DESCRIPTOR_VISITOR, visitor.id, newVisitor);
            this.setState({ visitor: newVisitor });
            refetchDetails(['visitor:' + visitor.id]);
        }
    };

    renderCustomer = (customer, phone) => {
        cnsole.info('renderCustomer: ', customer);
        const { id, name, image, thumbImage } = customer.person;
        const v = { role: 'cust', id, name, image, phone };
        return this.renderRole(v, phone);
    };
    renderSupply = (supply, phone) => {
        cnsole.info('renderSupply: ', supply);
        const { id, name, image, thumbImage } = supply.person;
        const v = { role: 'supply', id, name, image, phone };
        return this.renderRole(v, phone);
    };
    renderVisitor = (visitor, phone) => {
        cnsole.info('renderVisitor: ', visitor);
        const v = { ...visitor, image: visitor.photo, role: 'visitor' };
        return this.renderRole(v, phone);
    };

    renderRole = (person, phone) => {
        cnsole.info('renderRole: ', person);
        const { id, name, image, designation } = person;
        const { detailsFromPhone } = this.state;
        const isDebug = isDebugMode();
        const isEditable = isDebug || (detailsFromPhone && parseInt(detailsFromPhone.id) === parseInt(id) && detailsFromPhone.role === 'visitor');

        return (
            <View style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', ...custom.root }}>
                <View style={{ width: '100%', maxWidth: MAX_WIDTH }}>
                    <EditableTopNameBar name={name} isEditable={true} onUpdateFn={this.onUpdateNameFn} />
                    <EditableImageWidget photo={image} isEditable={true} onUpdateFn={this.onUpdateImageFn} />

                    <View style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <View style={{ width: '80%' }}>
                            <EditableTextBox name={designation} isEditable={true} onUpdateFn={this.onUpdateDesignationFn} label={'Designation'} />
                            {spacer(20)}
                            <Text style={{ marginLeft: 20 }}>Phone: {phone}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    render() {
        const { visitor, customer, supply } = this.state;
        const { phone } = this.props;
        if (!visitor && !customer && !supply) {
            return <View />;
        }

        if (visitor) {
            return this.renderVisitor(visitor, phone);
        }
        if (customer) {
            return this.renderCustomer(customer, phone);
        }
        if (supply) {
            return this.renderSupply(supply, phone);
        }
        return null;
    }
}


const MAX_WIDTH = 450;
const custom = {
    root: {
        width: '100%',
        fontSize: 18,
        fontFamily: CHAT_FONT_FAMILY,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
};
