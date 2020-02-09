import React from "react";
import {Image, Text, View} from "../util/Util";
import {TOP_BAR_COLOR} from "../chat/Constants";
import {historyBack} from "../platform/Util";
import TouchableAnim from "./TouchableAnim";
import {CHEVRON_LEFT_ICON, EDIT_ICON, CHECK_TICK_ICON} from "../constants/Constants";


export default class EditableTopNameBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.name,
            editing: false,
        };
    }

    goBackFn = () => {
        console.log('goBackFn: ', this.props);
        historyBack();
    };
    onChangeTextFn = (elem) => {
        if (elem.target.value.length <= 50) {
            this.setState({ name: elem.target.value });
        }
    };
    onUpdateFn = async () => {
        const ret = await this.props.onUpdateFn(this.state.name);
        this.setState({ editing: false });
    };

    render() {
        const { name, editing } = this.state;
        const { isEditable } = this.props;

        const editNameIcon = (
            <TouchableAnim onPress={() => this.setState({ editing: true })} style={{ height: 25, width: 25, lineHeight: 'normal' }}>
                <Image src={EDIT_ICON} style={{ height: 25, width: 25 }} />
            </TouchableAnim>
        );
        const tickIcon = (
            <TouchableAnim onPress={this.onUpdateFn} style={{ height: 25, width: 25, lineHeight: 'normal' }}>
                <Image src={CHECK_TICK_ICON} style={{ height: 25, width: 25 }} />
            </TouchableAnim>
        );

        return (
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: 50, ...custom.topBar}}>
                <View style={{ width: '10%' }}>
                    <TouchableAnim onPress={this.goBackFn} style={{ height: 35, width: 35, lineHeight: 'normal' }}>
                        <Image src={CHEVRON_LEFT_ICON} style={{ height: 35, width: 35, }} />
                    </TouchableAnim>
                </View>
                <View style={{ width: '80%' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', display: editing ? 'none' : 'block' }}>{name}</Text>
                    <input type="text" style={{ ...custom.nameInput, display: editing ? 'block' : 'none' }} value={name} onChange={this.onChangeTextFn} />
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
        height: 30,
        border: '1px solid #ffffff',
        color: '#ffffff',
        fontSize: 16,
        letterSpacing: 0.5,
        paddingLeft: 5,
    },
};
