import React from "react";
import {getImageUrl, Image, uploadBlob, View} from "../util/Util";
import TouchableAnim from "../platform/TouchableAnim";
import {ADD_PHOTO_ICON} from "../constants/Constants";
import cnsole from 'loglevel';
import {ExpandingImage, InputElem} from "../platform/Util";


export default class EditableImageWidget extends React.Component {
    constructor(props) {
        super(props);
        this.imageRef = React.createRef();
    }

    onSelectFile = async (files) => {
        cnsole.log('Files: ', files);
        if (files.length === 0) {
            return;
        }
        const file = files[0];
        const blobUrl = await uploadBlob(file);
        if (blobUrl) {
            await this.props.onUpdateFn(blobUrl);
        }
    };
    onChangeFn = () => {
        this.onSelectFile(this.imageRef.current.refElem().files);
    };
    editPhotoFn = () => {
        const { isEditable } = this.props;
        if (isEditable) {
            this.imageRef.current.refElem().click();
        }
    };

    render() {
        const { isEditable, imgStyle, photo } = this.props;

        const imgDim = 22;
        const editPhotoIcon = (
            <View style={{ marginLeft: -2*imgDim, marginTop: imgDim }}>
                <TouchableAnim onPress={this.editPhotoFn} style={{ lineHeight: 'normal' }}>
                    <Image src={ADD_PHOTO_ICON} style={{ height: imgDim, width: imgDim }} />
                </TouchableAnim>
            </View>
        );

        return (
            <View style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                <ExpandingImage style={{ width: '100%', ...imgStyle }} src={getImageUrl(photo)} />
                {isEditable ? editPhotoIcon : <View />}

                <InputElem type="file" accept={'image/*'} ref={this.imageRef} style={{ display: 'none' }}
                           onChange={this.onChangeFn} />
            </View>
        );
    }
}

const custom = {
};
