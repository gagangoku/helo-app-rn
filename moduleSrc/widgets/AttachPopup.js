import React from "react";
import {FILE_ICON_IMG, IMAGE_ICON_IMG, TROPHY_IMG} from "../constants/Constants";
import {Image, InputElem, Text, uploadBlob, View} from "../platform/Util";
import {checkFileType, getFieldNameFromType} from "../util/Util";
import TouchableAnim from "../platform/TouchableAnim";


export class AttachPopup extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            videoUrl: '',
        };

        this.INPUT_TYPES = [{
            text: 'Media',
            image: IMAGE_ICON_IMG,
            accept: 'audio/*,video/*,image/*',
            ref: React.createRef(),
            isTraining: false,
        }, {
            text: 'File',
            image: FILE_ICON_IMG,
            accept: 'application/pdf,application/msword',
            ref: React.createRef(),
            isTraining: false,
        }, {
            text: 'Training',
            image: TROPHY_IMG,
            accept: 'video/*',
            ref: React.createRef(),
            isTraining: true,
        }];
        this.INPUT_TYPES.forEach(x => {
            x.onClickFn = () => {
                x.ref.current.refElem().click();
            };
        });
    }

    onSelectFile = async (files, isTraining) => {
        console.log('Files: ', files, isTraining);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const blobUrl = await uploadBlob(file);

            const { type } = checkFileType(file.name, file.type);
            const key = getFieldNameFromType(type);
            if (isTraining) {
                this.setState({ videoUrl: blobUrl });
                this.props.onChooseTrainingVideo(blobUrl);
            } else {
                this.props.onCompleteFn({ answer: '', type, [key]: blobUrl });
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
        const { videoUrl } = this.state;
        const inputTypes = this.INPUT_TYPES;
        const inputTypeTraining = inputTypes.filter(x => x.isTraining === true)[0];
        const inputTypeOthers = inputTypes.filter(x => x.isTraining !== true);
        return (
            <View key="hidden-forms" style={{ width: 200, height: 80, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                {this.INPUT_TYPES.map(x => <InputElem type="file" accept={x.accept} ref={x.ref} style={{ display: 'none' }} key={x.text}
                                                      onChange={() => this.onSelectFile(x.ref.current.refElem().files, x.isTraining)} />)}

                {inputTypeOthers.map(x => this.imageTextFn(x))}
                {this.imageTextFn(inputTypeTraining)}
            </View>
        );
    }
}
