import React from 'react';
import {View} from 'react-native';
import cnsole from 'loglevel';
import {ExcelDemo} from './src/demos/ExcelDemo';
import ChatDemo from './moduleSrc/demos/ChatDemo';
import {CameraRN} from './moduleSrc/platform/CameraRN.native';


cnsole.setLevel('info');
cnsole.info('****** Test app ********', new Date().getTime());
// setupInternalStateFromLocal(store);

export class Application extends React.PureComponent {
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
export class Application1 extends React.PureComponent {
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
export class Application2 extends React.PureComponent {
    render() {
        return (
            <CameraRN />
        );
    }
}
