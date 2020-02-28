import React from 'react';
import {View} from 'react-native';
import {Spreadsheet} from './moduleSrc/platform/Spreadsheet.native';
import cnsole from 'loglevel';
import {ExcelDemo} from './src/demos/ExcelDemo';


cnsole.setLevel('info');
cnsole.info('****** Test app ********', new Date().getTime());

export class Application1 extends React.PureComponent {
    submitFn = (x) => {
        console.log('spreadsheet: ', x);
    };
    render() {
        return (
            <View style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
                <View style={{ height: '80%', width: '80%' }}>
                    <Spreadsheet submitFn={this.submitFn} isEditable={true} initialRows={[[], [1, 2, 3], ['', 5, 6]]}
                                 numRows={7} numCols={8} rowHeader={['r1', 'r2', 'r3', 'r4', 'r5', 'r6']} />
                </View>
            </View>
        );
    }
}
export class Application extends React.PureComponent {
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
