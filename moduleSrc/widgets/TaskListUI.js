import React, {Fragment} from "react";
import cnsole from "loglevel";
import xrange from "xrange";
import {
    Image,
    mobileDetect,
    ScrollView,
    Text,
    TextareaElemHackForPaste,
    View,
    WINDOW_INNER_HEIGHT,
    WINDOW_INNER_WIDTH
} from "../platform/Util";
import TouchableAnim from "../platform/TouchableAnim";
import {
    CHAT_FONT_FAMILY,
    CROSS_RED_ICON,
    EXCLAIM_DARKER_IMG,
    EXCLAIM_IMG,
    EXPAND_LESS_IMG,
    EXPAND_MORE_IMG,
    GREEN_TICK_ICON,
    GREEN_TICK_IMG,
    IMAGE_ICON_IMG
} from "../constants/Constants";
import {actionButton, getKeysWhereValueIs, noOpFn, spacer} from "../util/Util";
import OptionPickerWidget from "./OptionPickerWidget";
import {BUTTON_BACKGROUND_COLOR, TEXT_COLOR} from "./MultiSelectionWidget";


export class TaskListUI extends React.PureComponent {
    constructor(props) {
        super(props);

        const idx = props.payload.tasks.findIndex((task, idx) => !task.isFinalized);
        cnsole.info('idx: ', idx);

        const toggled = {};
        xrange(0, props.payload.tasks.length).map(x => toggled[x] = x === idx);

        const isFinalized = {};
        xrange(0, props.payload.tasks.length).map(x => isFinalized[x] = props.payload.tasks[x].isFinalized);

        const typed = {};
        xrange(0, props.payload.tasks.length).map(x => typed[x] = props.payload.tasks[x].comments || '');

        this.state = {
            toggled,
            renderCount: 0,
            typed,
            isFinalized,
        };

        this.options = {};
        xrange(0, props.payload.tasks.length).map(x => this.options[x] = {});
    }

    toggleTask = (idx, forceValue) => {
        const toggled = { ...this.state.toggled };
        toggled[idx] = forceValue === undefined ? !toggled[idx] : forceValue;
        this.setState({ toggled });
    };
    setFn = (idx) => (key, val) => {
        this.options[idx][key] = val;
        this.setState({ renderCount: this.state.renderCount + 1 });
        cnsole.info('toggle: ', idx, key, val);
    };

    attachImg = (idx) => {};

    task = (task, idx) => {
        const { payload, isPreview } = this.props;
        if (isPreview) {
            return this.taskPreview(task, idx);
        }
        return this.taskEditable(task, idx);
    };
    onChangeText = (text, idx) => {
        const typed = {...this.state.typed, [idx]: text};
        this.setState({ typed });
    };
    doneFn = (idx) => {
        const isFinalized = { ...this.state.isFinalized };
        isFinalized[idx] = true;

        const toggled = { ...this.state.toggled };
        toggled[idx] = !toggled[idx];

        const index = this.props.payload.tasks.findIndex((task, index) => index > idx && !isFinalized[index]);
        cnsole.info('Force toggle: ', index, isFinalized);
        toggled[index] = true;

        // BUG: Calling this.toggleTask isn't working here for some reason
        this.setState({ isFinalized, toggled });
    };

    optionRenderFn = (text, isSelected, cb) => {
        const boxStyle = {
            backgroundColor: isSelected ? THEME.selectedBackgroundColor : THEME.backgroundColor,
            border: '1px solid',
            borderColor: isSelected ? THEME.selectedBorderColor : THEME.borderColor,
        };
        const textStyle = {
            color: isSelected ? THEME.selectedTextColor : THEME.textColor,
        };

        return (
            <View style={[custom.options.boxContainer, boxStyle]} key={text}>
                <TouchableAnim onPress={cb} style={{}}>
                    <View style={custom.options.justifyAlignCenter}>
                        <Text style={[custom.options.boxText, textStyle]}>{text}</Text>
                    </View>
                </TouchableAnim>
            </View>
        );
    };

    taskEditable = (task, idx) => {
        const { typed, toggled, isFinalized } = this.state;
        const { title, desc, options, imageReq, image, comments } = task;
        const singleSelection = task.singleSelection || true;
        const optionSelected = task.optionSelected || [];

        const imgSrc = isFinalized[idx] ? <Image src={GREEN_TICK_IMG} style={custom.task.ctrImg} /> : <View style={custom.blankCircle} />;

        const isExpanded = toggled[idx];
        const expandedStyle = isExpanded ? {} : { height: 0, width: 0, display: 'none' };
        const uponToggleImg = isExpanded ? EXPAND_LESS_IMG : EXPAND_MORE_IMG;

        const doneBtnEnabled  = actionButton('DONE', () => this.doneFn(idx), { width: 60, height: 30, style: { fontSize: 12, letterSpacing: 0.5 } });
        const doneBtnDisabled = actionButton('DONE', noOpFn, { width: 60, height: 30, style: { fontSize: 12, letterSpacing: 0.5, backgroundColor: 'gray', color: 'black' } });
        const doneBtn = options.length === 0 || Object.values(this.options[idx]).filter(x => x === true).length > 0 ? doneBtnEnabled : doneBtnDisabled;

        const isViewOnly = isFinalized[idx];
        const commentsOnChangeFn = isViewOnly ? noOpFn : text => this.onChangeText(text, idx);
        const attachImgFn = isViewOnly ? noOpFn : () => this.attachImg(idx);
        return (
            <Fragment key={idx}>
                <View style={custom.task.ctr}>
                    <View style={custom.task.header}>
                        <TouchableAnim onPress={() => this.toggleTask(idx)} style={{ width: '100%' }}>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                                <View style={{ width: 20, marginLeft: 10 }}>
                                    {imgSrc}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={custom.task.title}>{title}</Text>
                                </View>
                                <View style={{ width: 20, marginRight: 10 }}>
                                    <Image src={uponToggleImg} style={custom.task.expandImg} />
                                </View>
                            </View>
                        </TouchableAnim>
                    </View>

                    <View style={{...custom.task.body, ...expandedStyle}}>
                        <Text style={custom.task.desc}>{desc}</Text>

                        <OptionPickerWidget optionList={options.map(x => x.text)}
                                            initialSelected={optionSelected} toggleFn={this.setFn(idx)} disabled={isViewOnly ? 'true' : 'false'}
                                            singleSelection={singleSelection} displayFn={(x) => x}
                                            optionRenderFn={this.optionRenderFn}
                                            rootContainerStyle={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}
                                            itemsContainerStyleOverride={{ flexDirection: 'row', justifyContent: 'flex-start' }} />
                        {options.length === 0 && spacer(10)}

                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                            <View style={custom.inputMessageCtr}>
                                <TextareaElemHackForPaste style={custom.inputMessage} placeholder="  Comments ..." type="text"
                                                          editable={!isViewOnly} disabled={isViewOnly}
                                                          value={typed[idx]} onChangeText={commentsOnChangeFn} />
                            </View>
                            <TouchableAnim onPress={attachImgFn}>
                                <Image src={IMAGE_ICON_IMG} style={{ height: 40, width: 40 }} />
                            </TouchableAnim>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', marginTop: 10 }}>
                            {doneBtn}
                        </View>
                    </View>
                </View>
                <View style={custom.task.line} />
            </Fragment>
        );
    };

    taskPreview = (task, idx) => {
        const { title, isFinalized } = task;
        const imgSrc = isFinalized ? GREEN_TICK_ICON : this.getExclaimImg();
        return (
            <Fragment key={idx}>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: 30 }}>
                    <Image src={imgSrc} style={custom.task.preview.ctrImg} />
                    <Text style={custom.task.preview.title}>{title}</Text>
                </View>
            </Fragment>
        );
    };

    submitFn = () => {
        const { submitFn, payload } = this.props;
        const { typed, isFinalized } = this.state;

        const payloadCopy = JSON.parse(JSON.stringify(payload));

        cnsole.info('submitFn: ', { typed, isFinalized, options: this.options });
        getKeysWhereValueIs(isFinalized, true).forEach(idx => {
            const comments = typed[idx] || '';
            const optionSelected = getKeysWhereValueIs(this.options[idx], true);
            payloadCopy.tasks[idx] = { ...payloadCopy.tasks[idx], comments, optionSelected, isFinalized: isFinalized[idx] };
        });

        const { title } = payload;
        submitFn({ title, taskList: payloadCopy });
    };

    getExclaimImg = () => {
        const { me, sender } = this.props;
        const isOwn = sender === me.sender;
        return isOwn ? EXCLAIM_DARKER_IMG : EXCLAIM_IMG;
    };

    render() {
        const { payload, isPreview, closeFn, me, sender } = this.props;
        const { title, tasks } = payload;

        if (isPreview) {
            const allTasks = tasks.map((task, idx) => this.taskPreview(task, idx));
            const doneTasks = xrange(0, tasks.length).toArray().filter(x => tasks[x].isFinalized).map(x => allTasks[x]);
            const pendingTasks = xrange(0, tasks.length).toArray().filter(x => !tasks[x].isFinalized).map(x => allTasks[x]);
            const numDone = doneTasks.length;
            const numPending = pendingTasks.length;

            const x = Math.max(2, NUM_LINES - numPending);
            const taskElements = [...doneTasks.slice(0, x), ...pendingTasks];

            return (
                <View style={custom.root}>
                    <View style={custom.preview.ctr}>
                        <Text style={custom.preview.title}>{title.toUpperCase()}</Text>
                        <Text style={custom.preview.finishedTitle}>{numDone} / {numDone + numPending} finished</Text>
                        <View style={{ marginLeft: 15 }}>
                            {taskElements}
                        </View>
                    </View>
                </View>
            );
        }

        const taskElements = tasks.map((task, idx) => this.taskEditable(task, idx));
        return (
            <View style={{...custom.root, backgroundColor: 'white'}}>
                <View style={custom.full}>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableAnim onPress={this.submitFn}>
                            <Image src={GREEN_TICK_ICON} style={{ height: 30, width: 30 }} />
                        </TouchableAnim>
                        <Text style={custom.title}>{title.toUpperCase()}</Text>
                        <TouchableAnim onPress={closeFn}>
                            <Image src={CROSS_RED_ICON} style={{ height: 30, width: 30 }} />
                        </TouchableAnim>
                    </View>
                    {spacer(15)}

                    <View style={custom.task.line} />
                    <View style={custom.full}>
                        <ScrollView style={{ height: '100%', width: '100%' }}>
                            {taskElements}
                            {spacer(50)}
                        </ScrollView>
                    </View>
                    {spacer(10)}
                </View>
            </View>
        );
    }
}

const NUM_LINES = 5;
const THEME = {
    textColor: TEXT_COLOR,
    selectedTextColor: 'white',

    backgroundColor: 'white',
    selectedBackgroundColor: BUTTON_BACKGROUND_COLOR,

    borderColor: 'black',
    selectedBorderColor: BUTTON_BACKGROUND_COLOR,
};

const custom = {
    root: {
        fontFamily: CHAT_FONT_FAMILY,
        fontSize: 14,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
    preview: {
        ctr: {
            height: 200,
            width: 200,
            overflow: 'hidden',
        },
        finishedTitle: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#237a3d',
            marginBottom: 5,
            marginLeft: 7,
        },
        title: {
            fontSize: 14,
            marginBottom: 10,
            fontWeight: 'bold',
            marginLeft: 5,
        },
    },

    full: {
        height: WINDOW_INNER_HEIGHT,
        width: WINDOW_INNER_WIDTH,
        maxWidth: 350,
        maxHeight: 500,
    },
    title: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    task: {
        preview: {
            title: {
                marginLeft: 10,
                fontSize: 14,
                maxHeight: mobileDetect().isWeb ? 30 : 35,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                wordWrap: 'break-word',
                wordBreak: 'break-all',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
            ctrImg: {
                height: 20, width: 20,
                marginLeft: 0,
                borderRadius: 15,
            },
        },
        header: {
            minHeight: 40,
            maxHeight: 60,
            paddingTop: 5, paddingBottom: 5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: '100%',
            // backgroundColor: '#f0f0f0',
        },
        line: {
            width: '100%',
            height: 2,
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: '#a0a0a0',
        },
        ctr: {
            paddingLeft: 4,
            paddingRight: 4,
            width: '100%',
        },
        ctrImg: {
            height: 24, width: 24,
            marginLeft: 0,
            borderRadius: 15,
        },
        expandImg: {
            height: 20, width: 20,
            marginLeft: 0,
            borderRadius: 15,
        },
        title: {
            marginLeft: 10,
            fontSize: 15,
            fontStyle: 'bold',
            // width: '100%',
        },
        body: {
            marginBottom: 10,
            marginLeft: 40,
            width: '100%',
        },
        desc: {
            fontSize: 12,
            color: '#6c6c6c',
        },
    },
    inputMessageCtr: {
        width: '70%',
    },
    inputMessage: {
        width: '100%',
        height: 60,
        fontSize: 14,
        padding: 0,
        margin: 0,
        marginRight: 10,
        outline: 'none',
        borderWidth: 0,
        borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#a0a0a0',
    },

    options: {
        boxContainer: {
            marginLeft: 5,
            marginRight: 5,
            marginTop: 10,
            marginBottom: 10,

            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5,
            borderWidth: 1,

            userSelect: 'none',
            MozUserSelect: 'none',
            WebkitUserSelect: 'none',
            msUserSelect: 'none',
        },
        boxText: {
            padding: 5,
            textAlign: 'center',
            fontSize: 14,
        },
        justifyAlignCenter: {
            height: 30,
            minWidth: 40,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
    },

    blankCircle: {
        height: 18, width: 18,
        borderRadius: 10,
        borderWidth: 1, borderStyle: 'solid', borderColor: '#a0a0a0',
    },
};
