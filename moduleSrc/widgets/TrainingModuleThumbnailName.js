import React from "react";
import {Image, InputElem, Text, uploadBlob, VideoElem, View} from "../platform/Util";
import window from "global";
import {USER_BACKGROUND_COLOR_DARK} from "../chat/Constants";
import {CHAT_FONT_FAMILY} from "../constants/Constants";
import {actionButton, spacer} from "../util/Util";
import TouchableAnim from "../platform/TouchableAnim";
import cnsole from 'loglevel';


export class TrainingModuleThumbnailName extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            moduleName: '',
            imageUrl: '',
        };
        this.imageRef = React.createRef();
        this.videoRef = React.createRef();
    }

    onSelectFile = async (files) => {
        cnsole.log('Files: ', files);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const blobUrl = await uploadBlob(file);
            if (blobUrl) {
                this.setState({ imageUrl: blobUrl });
            }
        }
    };
    submitFn = () => {
        const { moduleName, imageUrl } = this.state;
        const { videoUrl } = this.props;
        if (!moduleName || moduleName.length <= 3) {
            return;
        }
        if (!imageUrl) {
            window.alert('Choose thumbnail');
            return;
        }

        const duration = this.videoRef.current.refElem().duration;
        this.props.onSubmitFn({ moduleName, imageUrl, videoUrl, duration });
    };

    render() {
        const { videoUrl } = this.props;
        const { moduleName, imageUrl } = this.state;
        const accept = 'image/*';

        const btnStyle = moduleName.length <= 3 ? { backgroundColor: '#b9b9b9' } : { backgroundColor: USER_BACKGROUND_COLOR_DARK };
        const img = !imageUrl ? <View /> : <Image src={imageUrl} style={{ maxHeight: 100, maxWidth: 100 }} />;
        return (
            <View style={{ width: 250, height: 400, fontFamily: CHAT_FONT_FAMILY, backgroundColor: '#ffffff',
                           display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
                <VideoElem src={videoUrl} width={150} height={150} ref={this.videoRef} />
                <InputElem placeholder='  Module name' type="text" style={{fontSize: 14, width: '80%', height: 40, letterSpacing: 1, textAlign: 'center'}}
                           value={moduleName}
                           onChange={(elem) => this.setState({ moduleName: elem.target.value })}
                           onChangeText={(moduleName) => this.setState({ moduleName })} />
                {spacer(10)}

                <InputElem type="file" accept={accept} ref={this.imageRef} style={{ display: 'none' }}
                           onChange={() => this.onSelectFile(this.imageRef.current.refElem().files)} />
                <TouchableAnim style={{ }} onPress={() => this.imageRef.current.refElem().click()}>
                    <Text>Choose thumbnail</Text>
                </TouchableAnim>
                {spacer(10)}

                {img}

                {spacer(10)}
                {actionButton('Upload', this.submitFn, { width: 100, height: 50, style: btnStyle})}
            </View>
        );
    }
}
