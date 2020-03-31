import React from "react";
import {Image, InputElem, ScrollView, Text, TextareaElemHackForPaste, View, WINDOW_INNER_HEIGHT} from "./Util";
import xrange from "xrange";
import cnsole from "loglevel";
import {actionButton} from "../util/Util";
import {A_TO_Z, CHAT_FONT_FAMILY} from "../constants/Constants";
import TouchableAnim from "./TouchableAnim";


export class Spreadsheet extends React.PureComponent {
    static MODE_EDITING = 'editing';
    static MODE_VIEW_FULLSCREEN = 'view-fs';
    static MODE_VIEW_SUMMARY = 'view-summary';
    static DEFAULT_CELL_CREATOR = { rowId: 12, colId: 6 };       // 6 x 6 grid
    static getRowColCount = (values, mode) => {
        const cellIndices = Object.values(values).map(x => [x.colId, x.rowId]);

        const r = Math.max(...cellIndices.map(x => x[1])) + 1;
        const c = Math.max(...cellIndices.map(x => x[0])) + 1;
        const numRows = mode === Spreadsheet.MODE_EDITING ? Math.max(Spreadsheet.DEFAULT_CELL_CREATOR.rowId, r) : r;
        const numCols = mode === Spreadsheet.MODE_EDITING ? Math.max(Spreadsheet.DEFAULT_CELL_CREATOR.colId, c) : c;
        return { numRows, numCols };
    };

    constructor(props) {
        super(props);

        const title = this.props.title || '';
        const cells = this.props.cells || [{ ...Spreadsheet.DEFAULT_CELL_CREATOR }];

        const { numRows, numCols } = Spreadsheet.getRowColCount(cells, this.props.mode);
        const values = {};

        xrange(0, numRows).toArray().map(rowId => {
            xrange(0, numCols).toArray().map(colId => {
                values[this.keyFn(colId, rowId)] = { rowId, colId, val: '' };
            });
        });
        cells.forEach(cell => {
            const { rowId, colId } = cell;
            values[this.keyFn(colId, rowId)] = cell;
        });

        this.state = {
            title,
            cells,
            values,
        };
    }

    keyFn = (x, y) => x + ',' + y;
    onChangeText = (x, y, text) => {
        const key = this.keyFn(x, y);
        const curr = { ...this.state.values[key], val: text };
        const values = { ...this.state.values, [key]: curr };
        this.setState({ values });
    };


    cell = (x, y) => {
        const { mode } = this.props;
        const key = this.keyFn(x, y);
        const cell = this.state.values[key] || {};
        const { numRows, numCols } = Spreadsheet.getRowColCount(this.state.values, mode);

        if (x === numCols) {
            return mode !== Spreadsheet.MODE_EDITING ? <View /> : (
                <TouchableAnim onPress={this.addColFn}>
                    <Image src={PLUS_BTN_IMG} style={{ height: 20, width: 20, marginLeft: 5, marginTop: 0 }} />
                </TouchableAnim>
            );
        }

        const a = x === numCols - 1 ? { borderRightWidth: 1 } : {};
        const b = y === numRows - 1 ? { borderBottomWidth: 1 } : {};

        const rowHeaderStyle = this.state.values[this.keyFn(0, Math.max(0, y))].style || {};
        const colHeaderStyle = this.state.values[this.keyFn(Math.max(0, x), 0)].style || {};
        const cellStyle = cell.style || {};
        const styleOverride = { ...rowHeaderStyle, ...colHeaderStyle, ...cellStyle };

        if (x < 0 && y < 0) {
            return (
                <View style={{ ...custom.cellCtr, ...custom.cellHeader, ...a, ...b, ...styleOverride, width: 20, height: 20 }} key={key} />
            );
        }
        if (x < 0) {
            return (
                <View style={{ ...custom.cellCtr, ...custom.cellHeader, ...a, ...b, ...styleOverride, width: 20 }} key={key}>
                    <Text style={{ ...styleOverride }}>{y + 1}</Text>
                </View>
            );
        }
        if (y < 0) {
            return (
                <View style={{...custom.cellCtr, ...custom.cellHeader, ...a, ...b, ...styleOverride, height: 20 }} key={key}>
                    <Text style={{...styleOverride}}>{A_TO_Z[x]}</Text>
                </View>
            );
        }

        const elem = mode === Spreadsheet.MODE_VIEW_FULLSCREEN ?
            <Text style={{ ...custom.cellTextPreview, ...styleOverride }}>{cell.val}</Text> :
            <TextareaElemHackForPaste style={{...custom.cell, ...styleOverride}} type="text"
                                      editable={true} disabled={false}
                                      value={cell.val} onChangeText={text => this.onChangeText(x, y, text)} />;
        return (
            <View style={{ ...custom.cellCtr, ...a, ...b, ...styleOverride, }} key={key}>
                {elem}
            </View>
        );
    };
    row = (y) => {
        const { numRows, numCols } = Spreadsheet.getRowColCount(this.state.values, this.props.mode);
        const c = y < 0 ? numCols + 1 : numCols;
        const cells = xrange(-1, c).toArray().map(x => this.cell(x, y));
        const lastRowStyle = {};
        return (
            <View style={{ ...custom.row, ...lastRowStyle }} key={y}>
                {cells}
            </View>
        );
    };

    submitFn = () => {
        const { submitFn } = this.props;
        const { title, values } = this.state;

        const cells = Object.values(values).flatMap(x => x).filter(x => x.val);
        submitFn({ title, cells });
    };

    onChangeTitleText = (title) => {
        this.setState({ title });
    };

    onLayout = (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        cnsole.log('Spreadsheet: onLayout: ', x, y, width, height);
        this.setState({ layout: { x, y, width, height } });
    };

    addRowFn = () => {
        const values = { ...this.state.values };
        const { numRows, numCols } = Spreadsheet.getRowColCount(values, this.props.mode);
        values[this.keyFn(0, numRows)] = { rowId: numRows, colId: 0, val: '' };
        cnsole.info('this.state.values, values: ', this.state.values, values);
        this.setState({ values });
    };
    addColFn = () => {
        const values = { ...this.state.values };
        const { numRows, numCols } = Spreadsheet.getRowColCount(values, this.props.mode);
        values[this.keyFn(numCols, 0)] = { rowId: 0, colId: numCols, val: '' };
        this.setState({ values });
    };

    renderFull = () => {
        const { layout, title, values } = this.state;
        const { numRows, numCols } = Spreadsheet.getRowColCount(values, this.props.mode);
        const isEditable = this.props.mode === Spreadsheet.MODE_EDITING;
        const rows = xrange(-1, numRows).toArray().map(y => this.row(y));
        const viewportHeight = layout ? layout.height : WINDOW_INNER_HEIGHT * 0.8;
        const viewportWidth  = layout ? layout.width : MAX_WIDTH * 0.8;

        const addRowBtn = this.props.mode !== Spreadsheet.MODE_EDITING ? <View /> : (
            <TouchableAnim onPress={this.addRowFn}>
                <Image src={PLUS_BTN_IMG} style={{ height: 20, width: 20, marginTop: 5, marginLeft: 5 }} />
            </TouchableAnim>
        );

        // NOTE: This bug might be causing app crashes when a TextInput is rendered inside a FlatList
        // https://github.com/facebook/react-native/issues/17530
        return (
            <View style={{ ...custom.root, height: '100%', width: '100%', backgroundColor: 'white',
                           display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                <View style={{ height: '100%', width: '100%', maxWidth: MAX_WIDTH,
                               borderWidth: 0, borderStyle: 'solid', borderColor: '#a0a0a0',
                               display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>

                    <InputElem type="text" style={custom.titleTextInput} placeholder={'  Title'}
                               value={title} editable={isEditable}
                               onChange={elem => this.onChangeTitleText(elem.target.value)} onChangeText={text => this.onChangeTitleText(text)} />

                    <ScrollView horizontal={true} persistentScrollbar={true}
                                style={{ maxWidth: viewportWidth, height: '100%', maxHeight: viewportHeight, marginBottom: 5, borderWidth: 0 }}
                                contentContainerStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <ScrollView horizontal={false} persistentScrollbar={true}
                                    style={{ height: '100%', maxHeight: viewportHeight, borderWidth: 0 }}>
                            <View style={{ margin: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                {rows}
                            </View>
                            {addRowBtn}
                        </ScrollView>
                    </ScrollView>
                    {isEditable && actionButton('SAVE', this.submitFn)}
                </View>
            </View>
        );
    };

    renderSummary = () => {
        const { values } = this.state;
        const { numRows, numCols } = Spreadsheet.getRowColCount(this.state.values, this.props.mode);

        const numValid = Object.values(values).map(x => x.val).filter(x => x && x.trim() !== '').length;

        // TODO: Show completion percentage
        const lines = [];
        xrange(0, numRows).toArray().map(y => {
            const line = xrange(0, numCols).toArray().map(x => values[this.keyFn(x, y)].val || '');
            const str = line.join(', ');
            const shortened = (y + 1) + '. ' + str.slice(0, 80) + (str.length <= 80 ? '' : ' ...');
            lines.push(
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%', height: 30 }}>
                    <Text style={{ maxHeight: 30, marginBottom: 5, fontSize: 14, color: '#414141' }}>{shortened}</Text>
                </View>
            );
        });

        return (
            <View style={custom.root}>
                <View style={{ height: '100%', width: '100%', borderWidth: 0, paddingLeft: 10,
                               display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>EXCEL</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, letterSpacing: 0.5, marginLeft: 0, color: 'rgb(35, 122, 61)' }}>
                        {numValid} / {numRows * numCols} filled
                    </Text>

                    <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: 10 }}>
                        {lines.slice(0, 7)}
                    </View>
                </View>

            </View>
        );
    };

    render() {
        const { mode } = this.props;
        return mode === Spreadsheet.MODE_VIEW_SUMMARY ? this.renderSummary() : this.renderFull();
    }
}

const PLUS_BTN_IMG = 'data:image/png;base64,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';
const MAX_WIDTH = 450;
const FONT_COLOR = '#333333';
const BORDER_COLOR = '#b8b8b8';
const custom = {
    root: {
        fontFamily: CHAT_FONT_FAMILY,
        fontSize: 14,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        height: '100%',
    },
    cellCtr: {
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderStyle: 'solid',
        borderColor: BORDER_COLOR,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,

        // Defaults
        height: 30,
        width: 90,
    },
    cellHeader: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#5d5d5d',
        backgroundColor: '#e1e1e1',
    },
    titleTextPreview: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        color: FONT_COLOR,
        fontFamily: CHAT_FONT_FAMILY,
        marginTop: 5,
    },
    titleTextInput: {
        height: 40,
        width: '60%',
        padding: 0,
        paddingLeft: 2,
        margin: 0,
        marginTop: 5,
        marginBottom: 10,
        borderWidth: 0,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: '#a0a0a0',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 0.5,
        color: FONT_COLOR,
        fontFamily: CHAT_FONT_FAMILY,
        outline: 'none',
    },
    cellTextPreview: {
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        fontSize: 12,
        wordBreak: 'break-all',
        letterSpacing: 0.5,
        color: FONT_COLOR,
        fontFamily: CHAT_FONT_FAMILY,
        textAlign: 'center',
    },
    cell: {
        height: '100%',
        width: '100%',
        padding: 0,
        paddingLeft: 2,
        margin: 0,
        borderWidth: 0,
        fontSize: 13,
        letterSpacing: 0.5,
        color: FONT_COLOR,
        fontFamily: CHAT_FONT_FAMILY,
        textAlign: 'center',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
    },
};
