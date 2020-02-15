import React from "react";
import {getImageUrl, Image, uploadBlob, View} from "../util/Util";
import TouchableAnim from "../platform/TouchableAnim";
import {ADD_PHOTO_ICON} from "../constants/Constants";
import cnsole from 'loglevel';


export default class EditableImageWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photo: this.props.photo,
        };
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
            this.setState({ photo: blobUrl });
        }
    };


    render() {
        const { isEditable, imgStyle } = this.props;
        const { photo } = this.state;

        const editPhotoFn = (() => isEditable ? this.imageRef.current.click() : '');
        const editPhotoIcon = (
            <View style={{ position: 'absolute', top: 20, right: 20 }}>
                <TouchableAnim onPress={editPhotoFn} style={{ lineHeight: 'normal' }}>
                    <Image src={ADD_PHOTO_ICON} style={{ height: 20, width: 20 }} />
                </TouchableAnim>
            </View>
        );

        return (
            <View style={{ width: '100%', position: 'relative' }}>
                <Image style={{ width: '100%', ...imgStyle }} src={getImageUrl(photo)} onClick={editPhotoFn} />
                <input type="file" accept={'image/*'} ref={this.imageRef}
                       style={{ display: 'none' }} onChange={() => this.onSelectFile(this.imageRef.current.files)} />
                {isEditable ? editPhotoIcon : <View />}
            </View>
        );
    }
}

const custom = {
};
