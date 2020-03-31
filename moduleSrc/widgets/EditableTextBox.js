import React from "react";
import {Image, Text, View} from "../util/Util";
import TouchableAnim from "../platform/TouchableAnim";
import {CHAT_FONT_FAMILY, CHECK_TICK_ICON_BLACK, EDIT_ICON_BLACK} from "../constants/Constants";
import {InputElem} from "../platform/Util";
import cnsole from 'loglevel';


export default class EditableTextBox extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            nameEdit: '',
            editing: false,
        };
    }

    onChangeFn = (elem) => {
        if (elem.target.value.length <= 50) {
            this.setState({ nameEdit: elem.target.value });
        }
    };
    onChangeTextFn = (nameEdit) => {
        if (nameEdit.length <= 50) {
            this.setState({ nameEdit });
        }
    };
    onUpdateFn = async () => {
        const { nameEdit } = this.state;
        cnsole.info('onUpdateFn: ', nameEdit);
        const { onUpdateFn } = this.props;
        const ret = await onUpdateFn(nameEdit);
        this.setState({ nameEdit: '', editing: false });
    };

    render() {
        const { nameEdit, editing } = this.state;
        const { name, isEditable, label } = this.props;
        cnsole.info('EditableTextBox render: ', name, nameEdit);

        const imgDim = 25;
        const editNameIcon = (
            <TouchableAnim onPress={() => this.setState({ nameEdit: name, editing: true })} style={{ height: imgDim, width: imgDim, lineHeight: 'normal' }}>
                <Image src={EDIT_ICON_BLACK} style={{ height: imgDim, width: imgDim, opacity: 0.6 }} />
            </TouchableAnim>
        );
        const tickIcon = (
            <TouchableAnim onPress={this.onUpdateFn} style={{ height: imgDim, width: imgDim, lineHeight: 'normal' }}>
                <Image src={CHECK_TICK_ICON_BLACK} style={{ height: imgDim, width: imgDim, opacity: 0.6 }} />
            </TouchableAnim>
        );

        const labelAndText = (
            <View style={custom.textLabelCtr}>
                <Text style={custom.labelDisplay}>{label}</Text>
                <Text style={custom.textDisplay}>{name}</Text>
            </View>
        );
        const inputOrDisplay = editing ?
            <InputElem type="text" style={custom.nameInput} label={label}
                       value={nameEdit} onChange={this.onChangeFn} onChangeText={this.onChangeTextFn} /> :
            labelAndText;
        return (
            <View style={custom.topBar}>
                <View style={{ width: '90%' }}>
                    {inputOrDisplay}
                </View>
                <View style={{ width: '10%' }}>
                    {editing ? tickIcon : (isEditable ? editNameIcon : <View />)}
                </View>
            </View>
        );
    }
}

const custom = {
    topBar: {
        width: '100%',
        height: 40,
        display: 'flex', flexDirection: 'row', alignItems: 'center',
    },
    nameInput: {
        height: 60,
        color: '#000000',
        fontSize: 16,
        letterSpacing: 0.5,
        margin: 0,
        padding: 0,
        paddingLeft: 5,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: '#636363',
        fontFamily: CHAT_FONT_FAMILY,
    },
    textLabelCtr: {
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: '#636363',
        height: 60,
        marginRight: 5,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
    },
    textDisplay: {
        fontSize: 16,
        color: '#000000',
        marginLeft: 5,
        fontFamily: CHAT_FONT_FAMILY,
    },
    labelDisplay: {
        fontSize: 14,
        color: '#636363',
        marginLeft: 5,
        fontFamily: CHAT_FONT_FAMILY,
        letterSpacing: 0.5,
    },
};
