import React from "react";
import {InputElem, ScrollView, Text, View, WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH} from "./Util";
import {getCircularImage, spacer} from "../util/Util";
import {CHAT_FONT_FAMILY, PERSON_ICON} from "../constants/Constants";
import TouchableAnim from "./TouchableAnim";
import cnsole from 'loglevel';


export class AddMemberModal extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
        this.state = {
            name: '',
        };
        const { contacts } = this.props;

        this.processed = [];
        for (let i = 0; i < contacts.length; i++) {
            const c = contacts[i];
            const { displayName, phones, searchT } = this.searchText(c);
            if (!searchT || phones.length === 0) {
                continue;
            }

            phones.forEach(p => {
                this.processed.push({ origContact: c, displayName, phone: p, searchT });
            });
        }
    }

    onChangeNameFn = (elem) => this.setState({ name: elem.target.value });
    onChangeTextNameFn = (name) => this.setState({ name });
    onSelect = (name, phone) => {
        cnsole.info('onSelect: ', { name, phone });
        this.props.addMemberFn({ name, phone });
    };

    searchText = (contact) => {
        const { familyName, displayName, givenName, company, jobTitle, phoneNumbers, emailAddresses } = contact;
        const phones = [];
        (phoneNumbers || []).forEach(p => {
            const number = (p.number || '') + '';
            if (number.startsWith('+91') && number.length === 13) {
                phones.push(number.slice(3, 13));
            } else if (number.startsWith('91') && number.length === 12) {
                phones.push(number.slice(2, 12));
            } else if (number.length === 10) {
                phones.push(number);
            } else {
                cnsole.log('Bad phone number, ignoring: ', number);
            }
        });

        const texts = [];
        const n = displayName || [givenName || '', familyName || ''].join(' ');
        texts.push(n);
        texts.push(company || '');
        texts.push(jobTitle || '');

        phones.forEach(p => texts.push(p));
        emailAddresses.forEach(e => texts.push(e.email || ''));

        return { searchT: texts.join(' ').toLowerCase(), displayName: n, phones };
    };

    render() {
        const { name } = this.state;
        const filteredContacts = (name.length > 0 ? this.processed.filter(c => c.searchT.includes(name.toLowerCase())) : this.processed).slice(0, 10);

        return (
            <View style={{ height: '100%', width: '100%',
                           display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                <View style={{ padding: 15, width: 0.9*WINDOW_INNER_WIDTH, height: 0.5*WINDOW_INNER_HEIGHT, ...custom.root, borderRadius: 10,
                               display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                    {spacer(10)}
                    <View style={custom.formInputContainer}>
                        <InputElem placeholder='  Search person' type="text" style={{...custom.textInput, letterSpacing: 1}}
                                   value={name} onChangeText={this.onChangeTextNameFn} />
                    </View>
                    {spacer(20)}

                    <ScrollView style={{ width: '100%', height: '80%' }}>
                        {filteredContacts.map((item, index) => <Item processed={item} name={name} key={index} onPress={this.onSelect} />)}
                    </ScrollView>
                </View>
            </View>
        );
    }
}

class Item extends React.PureComponent {
    render() {
        const { processed, name, onPress } = this.props;
        const { displayName, phone, searchT } = processed;

        const height = 50;
        const imgDim = 0.6 * height;
        const avatar = PERSON_ICON;

        const idx = searchT.indexOf(name.toLowerCase());
        const N = 15;
        const left = searchT.slice(Math.max(idx - N, 0), idx);
        const match = searchT.slice(idx, idx + name.length);
        const right = searchT.slice(idx + name.length, idx + name.length + N);

        return (
            <View style={{ width: '100%' }}>
                <TouchableAnim onPress={() => onPress(displayName, phone)} style={{ width: '100%' }}>
                    <View style={{ width: '100%',
                                   display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: '80%', height, borderBottomColor: '#000000', borderBottomStyle: 'solid', borderBottomWidth: 1,
                                       display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            {spacer(10, 10)}
                            {getCircularImage({ src: avatar, dim: imgDim })}

                            <View style={{ marginLeft: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                                <Text style={custom.title}>{displayName} ({phone})</Text>
                                <Text style={custom.subheading}>
                                    <Text style={{}}>{left}</Text>
                                    <Text style={custom.subheadingBold}>{match}</Text>
                                    <Text style={{}}>{right}</Text>
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableAnim>
            </View>
        );
    }
}

const custom = {
    root: {
        fontFamily: CHAT_FONT_FAMILY,
        backgroundColor: '#ffffff',
    },
    formInputContainer: {
        width: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    },
    textInput: {
        padding: 0,
        margin: 0,
        height: 40,
        fontSize: 20,
        paddingLeft: 2,
        width: '80%',
        border: '0px',
        outline: 'none',
        borderWidth: 1, borderStyle: 'solid', borderColor: '#000000',
    },

    title: {
        fontSize: 16,
    },
    subheading: {
        fontSize: 12,
        color: '#a0a0a0',
    },
    subheadingBold: {
        fontWeight: 'bold',
    },
};
