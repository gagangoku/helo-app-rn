import React from 'react';
import {Text, View} from 'react-native';
import cnsole from 'loglevel';
import {ExcelDemo} from './src/demos/ExcelDemo';
import ChatDemo from './moduleSrc/demos/ChatDemo';
import EditableTextBox from './moduleSrc/widgets/EditableTextBox';
import {FlatbufferDemo} from './moduleSrc/demos/FlatbufferDemo';
import {Modal, WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH} from './moduleSrc/platform/Util';
import {TaskList} from './moduleSrc/platform/TaskList';
import {noOpFn} from './moduleSrc/util/Util';
import TouchableAnim from './moduleSrc/platform/TouchableAnim';
import {TextMessage} from './moduleSrc/chat/messaging/MessageTypes';
import {INNER_HEIGHT} from './moduleSrc/constants/Constants';
import ScrollableList from './moduleSrc/platform/ScrollableList';
import xrange from 'xrange';
import allMessages from './src/demos/1.json';
import assert from "assert";
import MessagingUI from './moduleSrc/chat/messaging/MessagingUI';
import {MODE_GROUP_CHAT} from './moduleSrc/chat/Constants';


cnsole.setLevel('info');
cnsole.info('****** Test app ********', new Date().getTime());
// setupInternalStateFromLocal(store);

class Application0 extends React.PureComponent {
    submitFn = (x) => {
        console.log('spreadsheet: ', x);
    };
    render() {
        return (
            <View style={{ height: '100%', width: '100%' }}>
                <ChatDemo />
            </View>
        );
    }
}
class Application1 extends React.PureComponent {
    submitFn = (x) => {
        console.log('spreadsheet: ', x);
    };
    onNewMsgFn = (obj) => {
        console.log('onNewMsgFn: ', obj);
    };

    render() {
        return (
            <View style={{ height: '100%', width: '100%' }}>
                <ExcelDemo />
            </View>
        );
    }
}
class Application2 extends React.PureComponent {
    onUpdateFn = async (x) => {
        console.log('onUpdateFn: ', x);
    };
    render() {
        return (
            <View style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: '80%' }}>
                    <EditableTextBox name={'hi'} isEditable={true} onUpdateFn={this.onUpdateFn} label={'Designation'} />
                </View>
            </View>
        );
    }
}
class ApplicationFbs extends React.PureComponent {
    onUpdateFn = async (x) => {
        console.log('onUpdateFn: ', x);
    };
    render() {
        return (
            <View style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <FlatbufferDemo />
            </View>
        );
    }
}

class ApplicationFSModal extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
        };
    }
    render () {
        const { modalOpen } = this.state;
        const modalStyle = {};
        const me = {};
        const sender = {};
        const payload = {
            tasks: [],
            title: 'Hello',
        };

        const closeFn = () => this.setState({ modalOpen: false });
        const submitFn = noOpFn;

        return (
            <View>
                <TouchableAnim onPress={() => this.setState({ modalOpen: true })}>
                    <Text>Hi</Text>
                </TouchableAnim>
                {modalOpen && <Modal isOpen={modalOpen} visible={modalOpen} isVisible={modalOpen}
                                     backdropOpacity={0.5} style={modalStyle}
                                     onRequestClose={closeFn} onBackdropPress={closeFn}
                                     onAfterOpen={() => {}} contentLabel="Example Modal">
                    <View style={{ height: '100%', width: '100%', backgroundColor: 'white',
                                   display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ height: WINDOW_INNER_HEIGHT, width: WINDOW_INNER_WIDTH,
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <TaskList me={me} sender={sender} payload={payload} isPreview={false} closeFn={closeFn} submitFn={submitFn} />
                        </View>
                    </View>
                </Modal>}
            </View>
        );
    }
}

class TextMessage1 extends React.Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (this.props !== nextProps) {
            cnsole.info('this.props, nextProps: ', this.props, nextProps);
            return true;
        }
        return false;
    }
    render() {
        const { idx, message } = this.props;
        cnsole.info('TextMessage1 render: ', idx);
        return <Text style={{ margin: 10 }}>{message.text}</Text>;
    }
}

class ApplicationFlatList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.me = { id: 0, name: 'Me', avatar: 'xx', role: 'visit', sender: 'visit:0' };
        this.otherGuy = { id: 1, name: 'other', avatar: 'xx', role: 'visit', sender: 'visit:1' };
        this.groupInfo = {
            isAdminPosting: false,
            admins: [],
        };
        this.messages = allMessages;
        // this.messages = allMessages.slice(0, 77);
        // this.messages = allMessages.filter(x => x.type === 'text');
    }

    render () {
        return (
            <View style={{ height: '100%', width: '100%' }}>
                <MessagingUI me={this.me} messages={this.messages} mode={MODE_GROUP_CHAT}
                             groupInfo={this.groupInfo} otherGuy={this.otherGuy} />
            </View>
        );
    }
}

export {
    ApplicationFlatList as Application,
}
