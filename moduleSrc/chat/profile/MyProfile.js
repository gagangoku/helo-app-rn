import React from "react";
import {getCtx, getDetailsFromPhone, isDebugMode, spacer, Text, View} from "../../util/Util";
import {CHAT_FONT_FAMILY, DESCRIPTOR_CUSTOMER, DESCRIPTOR_VISITOR} from "../../constants/Constants";
import {crudsRead, crudsUpdate} from "../../util/Api";
import window from "global";
import EditableTopNameBar from "../../widgets/EditableTopNameBar";
import EditableImageWidget from "../../widgets/EditableImageWidget";


export default class MyProfile extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            visitor: null,
            customer: null,
            detailsFromPhone: null,
        };
    }

    async componentDidMount() {
        const detailsFromPhone = await getDetailsFromPhone();
        this.setState({ detailsFromPhone });

        const { role, id } = detailsFromPhone;
        console.log('role, id: ', role, id);
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

    onUpdateNameFn = async (name) => {
        console.log('onUpdateNameFn: ', name);
        const { visitor } = this.state;
        if (name.length >= 3 && visitor) {
            const v = await crudsRead(DESCRIPTOR_VISITOR, visitor.id);
            const newVisitor = { ...v, name };
            await crudsUpdate(DESCRIPTOR_VISITOR, visitor.id, newVisitor);
            this.setState({ visitor: newVisitor, editing: false });
        }
    };
    onUpdateImageFn = async (photo) => {
        console.log('onUpdateImageFn: ', photo);
        const { visitor } = this.state;
        if (visitor) {
            const v = await crudsRead(DESCRIPTOR_VISITOR, visitor.id);
            const newVisitor = { ...v, photo };
            await crudsUpdate(DESCRIPTOR_VISITOR, visitor.id, newVisitor);
            this.setState({ visitor: newVisitor });
        }
    };

    renderVisitor = (visitor) => {
        console.log('renderVisitor: ', visitor);
        const { id, name, photo } = visitor;
        const { detailsFromPhone } = this.state;
        const isDebug = isDebugMode();
        const isEditable = isDebug || (detailsFromPhone && parseInt(detailsFromPhone.id) === parseInt(id) && detailsFromPhone.role === 'visitor');

        return (
            <View style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', ...custom.root }}>
                <View style={{ width: '100%', maxWidth: MAX_WIDTH }}>
                    <EditableTopNameBar name={name} isEditable={isEditable} onUpdateFn={this.onUpdateNameFn} />
                    <EditableImageWidget photo={photo} isEditable={isEditable} onUpdateFn={this.onUpdateImageFn} />

                    {spacer(20)}
                    <Text style={{ marginLeft: 20 }}>Phone: {detailsFromPhone.phone}</Text>
                </View>
            </View>
        );
    };

    render() {
        const { visitor, customer } = this.state;
        if (!visitor && !customer) {
            return <View />;
        }

        if (visitor) {
            return this.renderVisitor(visitor);
        }
        if (customer) {
            return (
                <View>
                    <Text>{customer.person.name}</Text>
                    <Text>{customer.person.email}</Text>
                </View>
            );
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
