import React from "react";
import {store} from '../../router/store';
import {InputElem, ScrollView, Text, View, WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH} from "../../platform/Util";
import cnsole from "loglevel";
import {getCircularImage, getImageUrl, spacer} from "../../util/Util";
import {CHAT_FONT_FAMILY, FIREBASE_GROUPS_DB_NAME} from "../../constants/Constants";
import TouchableAnim from "../../platform/TouchableAnim";


export class ContactsPage extends React.Component {
    constructor(props) {
        super(props);
        const contacts = this.getContactList();
        this.state = {
            contacts,
            name: '',
        };
    }

    getContactList = () => {
        const { idToDocMap, idToDetails } = store.getState();
        const processed = [];
        idToDocMap && Object.values(idToDocMap).forEach(doc => {
            const { collection, groupId, title, avatar } = doc;
            if (collection === FIREBASE_GROUPS_DB_NAME) {
                processed.push({ searchT: title.toLowerCase(), avatar: avatar, displayName: title, groupId });
            }
        });
        idToDetails && Object.keys(idToDetails).forEach(roleId => {
            const details = idToDetails[roleId];
            const { name, image, thumbImage } = details.person;
            processed.push({ searchT: (name || '').toLowerCase(), avatar: getImageUrl(image), displayName: name, roleId });
        });

        return processed;
    };

    changed = () => {
        const contacts = this.getContactList();
        this.setState({ contacts });
    };

    async componentDidMount() {
        this.unsubFn = store.subscribe(this.changed);
    }
    componentWillUnmount() {
        this.unsubFn && this.unsubFn();
    }

    onChangeTextNameFn = (name) => this.setState({ name });
    onSelect = (contact) => {
        const { roleId, groupId } = contact;
        cnsole.info('onSelect: ', contact);
        this.props.forwardToFn({ roleId, groupId });
    };

    render() {
        const { name, contacts } = this.state;
        const filteredContacts = (name.length > 0 ? contacts.filter(c => c.searchT.includes(name.toLowerCase())) : contacts).slice(0, 20);

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
                        {filteredContacts.map((item, index) => <Item contact={item} name={name} key={index} onPress={this.onSelect} />)}
                    </ScrollView>
                </View>
            </View>
        );
    }
}

class Item extends React.PureComponent {
    render() {
        const { contact, name, onPress } = this.props;
        const { avatar, displayName, phone, searchT, roleId, groupId } = contact;

        const height = 50;
        const imgDim = 0.6 * height;

        const idx = searchT.indexOf(name.toLowerCase());
        const N = 15;
        const left = searchT.slice(Math.max(idx - N, 0), idx);
        const match = searchT.slice(idx, idx + name.length);
        const right = searchT.slice(idx + name.length, idx + name.length + N);

        const phoneDisplay = phone ? `(${phone})` : '';
        return (
            <View style={{ width: '100%' }}>
                <TouchableAnim onPress={() => onPress({ roleId, groupId })} style={{ width: '100%' }}>
                    <View style={{ width: '100%',
                        display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: '80%', height, borderBottomColor: '#000000', borderBottomStyle: 'solid', borderBottomWidth: 1,
                            display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            {spacer(10, 10)}
                            {getCircularImage({ src: avatar, dim: imgDim })}

                            <View style={{ marginLeft: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                                <Text style={custom.title}>{displayName} {phoneDisplay}</Text>
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
        marginLeft: 2,
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
