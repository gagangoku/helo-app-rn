import React from 'react';
import {
    CAMERA_ICON_IMG,
    FILE_ICON_IMG,
    IMAGE_ICON_IMG,
    SPREADSHEET_IMG,
    TASK_LIST_ICON,
    TROPHY_IMG
} from '../constants/Constants';
import {Image, InputElem, Modal, Text, uploadBlob, View} from '../platform/Util';
import {checkFileType, getFieldNameFromType} from '../util/Util';
import TouchableAnim from '../platform/TouchableAnim';
import cnsole from 'loglevel';
import {OUTPUT_TASK_LIST} from "../chat/Questions";
import {CameraRN} from "../platform/CameraRN";
import {newSpreadsheet, newTaskList} from "../platform/Navigators";


export class AttachPopup extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            cameraModalOpen: false,
            videoUrl: '',
        };

        const mediaRef = React.createRef();
        const fileRef = React.createRef();
        const trainingRef = React.createRef();
        this.INPUT_TYPES = [{
            text: 'Excel',
            image: SPREADSHEET_IMG,
            accept: 'video/*',
            ref: React.createRef(),
            type: 'excel',
            onClickFn: this.openExcelModal,
            line: 1,
        }, {
            text: 'Tasks',
            image: TASK_LIST_ICON,
            accept: 'video/*',
            ref: React.createRef(),
            type: OUTPUT_TASK_LIST,
            onClickFn: this.openTaskListModal,
            line: 1,
        }, {
            text: 'File',
            image: FILE_ICON_IMG,
            accept: getMimesForFiles(),
            ref: fileRef,
            type: 'fileAttach',
            onClickFn: () => fileRef.current.refElem().click(),
            line: 1,
        }, {
            text: 'Camera',
            image: CAMERA_ICON_IMG,
            accept: 'audio/*,video/*,image/*',
            type: 'camera',
            onClickFn: this.openCamera,
            line: 2,
        }, {
            text: 'Gallery',
            image: IMAGE_ICON_IMG,
            accept: 'audio/*,video/*,image/*',
            ref: mediaRef,
            type: 'fileAttach',
            onClickFn: () => mediaRef.current.refElem().click(),
            line: 2,
        }, {
            text: 'Training',
            image: TROPHY_IMG,
            accept: 'video/*',
            ref: trainingRef,
            type: 'training',
            onClickFn: () => trainingRef.current.refElem().click(),
            line: 2,
        }];
    }

    openCamera = () => this.setState({ cameraModalOpen: true });
    closeCameraModal = () => this.setState({ cameraModalOpen: false });
    onCameraClickFn = async (filepath) => {
        await this.onSelectFile([filepath], 'pic');
        this.closeCameraModal();
    };

    openExcelModal = () => {
        const { me, groupInfo, closeFn } = this.props;
        closeFn();
        newSpreadsheet({ data: { groupId: groupInfo.groupId, me, groupName: groupInfo.name, collection: groupInfo.collection } });
    };

    openTaskListModal = () => {
        const { me, groupInfo, closeFn } = this.props;
        closeFn();
        newTaskList({ data: { groupId: groupInfo.groupId, me, groupName: groupInfo.name, collection: groupInfo.collection } });
    };

    onSelectFile = async (files, type) => {
        cnsole.log('Files: ', files, type);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const blobUrl = await uploadBlob(file);
            if (blobUrl) {
                const { type } = checkFileType(file.name, file.type);
                const key = getFieldNameFromType(type);
                if (type === 'training') {
                    this.setState({ videoUrl: blobUrl });
                    this.props.onChooseTrainingVideo(blobUrl);
                } else {
                    this.props.onCompleteFn({ answer: '', type, [key]: blobUrl });
                }
            }
        }
    };

    imageTextFn = ({ image, text, onClickFn }) => {
        return (
            <TouchableAnim style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                           onPress={onClickFn} key={image + '-' + text}>
                <Image src={image} style={{ height: 45, width: 45, marginBottom: 10 }} />
                <Text style={{ fontSize: 13 }}>{text}</Text>
            </TouchableAnim>
        );
    };

    render() {
        const { cameraModalOpen } = this.state;
        const inputTypes = this.INPUT_TYPES;
        const line1 = inputTypes.filter(x => x.line === 1);
        const line2 = inputTypes.filter(x => x.line === 2);

        const W = 220;
        const H = 80;
        return (
            <View>
                <View style={{ width: W, height: 2*H,
                               display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
                    <View style={{ width: W, height: H,
                        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        {line1.map(x => this.imageTextFn(x))}
                    </View>
                    <View style={{ width: W, height: H,
                        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        {line2.map(x => this.imageTextFn(x))}
                    </View>
                </View>

                {this.INPUT_TYPES.map(x => <InputElem type="file" accept={x.accept} ref={x.ref} style={{ display: 'none' }} key={x.text}
                                                      onChange={() => this.onSelectFile(x.ref.current.refElem().files, x.type)} />)}

                {cameraModalOpen && <Modal isOpen={cameraModalOpen} visible={cameraModalOpen} isVisible={cameraModalOpen}
                                           backdropOpacity={0.5} style={modalStyle}
                                           onRequestClose={this.closeCameraModal} onBackdropPress={this.closeCameraModal}
                                           onAfterOpen={() => {}} contentLabel="Example Modal">
                    <View style={{ height: '100%', width: '100%' }}>
                        <CameraRN onFileFn={this.onCameraClickFn} />
                    </View>
                </Modal>}
            </View>
        );
    }
}

const getMimesForFiles = () => {
    const mimes = [
        checkFileType('a.pdf').fileType,
        checkFileType('a.doc').fileType,
        checkFileType('a.docx').fileType,
        checkFileType('a.xls').fileType,
        checkFileType('a.xlsx').fileType,
        checkFileType('a.ppt').fileType,
        checkFileType('a.pptx').fileType,
    ];
    return mimes.join(',');
};
const modalStyle = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
    }
};
