import React from "react";
import IconButton from "@material-ui/core/IconButton";
import LeftIcon from '@material-ui/icons/ChevronLeft';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import {Text, View} from "../util/Util";
import {TOP_BAR_COLOR} from "../chat/Constants";
import {historyBack} from "../platform/Util";


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
            <IconButton style={{ height: 25, width: 25 }}>
                <EditIcon onClick={() => this.setState({ editing: true })} style={{ height: 25, width: 25, color: '#ffffff' }} />
            </IconButton>
        );
        const tickIcon = (
            <IconButton style={{ height: 25, width: 25 }}>
                <CheckIcon onClick={this.onUpdateFn} style={{ height: 25, width: 25, color: '#ffffff' }} />
            </IconButton>
        );

        return (
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: 50, ...custom.topBar}}>
                <View style={{ width: '10%' }}>
                    <IconButton style={{ height: 35, width: 35 }}>
                        <LeftIcon onClick={this.goBackFn} style={{ height: 35, width: 35, color: '#ffffff' }} />
                    </IconButton>
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
