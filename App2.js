import React from 'react';
import {Text, View} from 'react-native';
import cnsole from 'loglevel';
import {ExcelDemo} from './src/demos/ExcelDemo';
import ChatDemo from './moduleSrc/demos/ChatDemo';
// import Promise from 'promise';
import EditableTextBox from './moduleSrc/widgets/EditableTextBox';
import {FlatbufferDemo} from './moduleSrc/demos/FlatbufferDemo';
import {Modal, WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH} from './moduleSrc/platform/Util';
import {TaskList} from './moduleSrc/platform/TaskList';
import {noOpFn} from './moduleSrc/util/Util';
import TouchableAnim from './moduleSrc/platform/TouchableAnim';


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

export {
    ApplicationFSModal as Application,
}
