import React from 'react';
import {View} from 'react-native';
import cnsole from 'loglevel';
import {ExcelDemo} from './src/demos/ExcelDemo';
import ChatDemo from './moduleSrc/demos/ChatDemo';
import {CameraRN} from './moduleSrc/platform/CameraRN.native';
// import Promise from 'promise';
import {QueueLoadTest} from './moduleSrc/demos/QueueLoadTest';
import EditableTextBox from './moduleSrc/widgets/EditableTextBox';
import {spacer} from './moduleSrc/util/Util';


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

export {
    Application2 as Application,
}
