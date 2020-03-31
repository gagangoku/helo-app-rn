import React from "react";
import {Image, Text, View} from "../util/Util";
import {TOP_BAR_COLOR} from "../chat/Constants";
import TouchableAnim from "../platform/TouchableAnim";
import {CHECK_TICK_ICON, CHEVRON_LEFT_ICON, EDIT_ICON} from "../constants/Constants";
import cnsole from 'loglevel';
import {backOnclickFn} from "../platform/Navigators";
import {InputElem} from "../platform/Util";
import {ConfigurableTopBar} from "../chat/messaging/TopBar";
import {getNavigationObject} from "../router/NavigationRef";


export default class EditableTopNameBar extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            nameEdit: '',
            editing: false,
        };
    }

    goBackFn = () => {
        cnsole.log('goBackFn: ', this.props);
        const navigation = getNavigationObject();
        backOnclickFn({ navigation });
    };
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
        const ret = await this.props.onUpdateFn(nameEdit);
        this.setState({ nameEdit: '', editing: false });
    };

    render() {
        const { nameEdit, editing } = this.state;
        const { name, isEditable } = this.props;

        const editNameIcon = (
            <TouchableAnim onPress={() => this.setState({ nameEdit: name, editing: true })} style={{ height: 25, width: 25, lineHeight: 'normal' }}>
                <Image src={EDIT_ICON} style={{ height: 25, width: 25 }} />
            </TouchableAnim>
        );
        const tickIcon = (
            <TouchableAnim onPress={this.onUpdateFn} style={{ height: 25, width: 25, lineHeight: 'normal' }}>
                <Image src={CHECK_TICK_ICON} style={{ height: 25, width: 25 }} />
            </TouchableAnim>
        );

        const inputOrDisplay = editing ?
            <InputElem type="text" style={custom.nameInput}
                       value={nameEdit} onChange={this.onChangeFn} onChangeText={this.onChangeTextFn} /> :
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff' }}>{name}</Text>;
        return (
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: ConfigurableTopBar.HEIGHT, ...custom.topBar}}>
                <View style={{ width: '10%' }}>
                    <TouchableAnim onPress={this.goBackFn} style={{ height: 35, width: 35, lineHeight: 'normal' }}>
                        <Image src={CHEVRON_LEFT_ICON} style={{ height: 35, width: 35, }} />
                    </TouchableAnim>
                </View>
                <View style={{ width: '80%' }}>
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
        backgroundColor: TOP_BAR_COLOR,
        color: '#ffffff',
        width: '100%',
        lineHeight: '60px',
    },
    nameInput: {
        width: '80%',
        backgroundColor: TOP_BAR_COLOR,
        height: 40,
        border: '1px solid #ffffff',
        color: '#ffffff',
        fontSize: 16,
        letterSpacing: 0.5,
        paddingLeft: 5,
    },
};
