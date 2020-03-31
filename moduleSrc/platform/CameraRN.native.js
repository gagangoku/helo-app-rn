import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import cnsole from 'loglevel';
import {RNCamera} from 'react-native-camera';
import rnfs from 'react-native-fs';
import {checkFileType, getCircularImage} from "../util/Util";
import {FLASH_AUTO_ICON, FLASH_OFF_ICON, FLASH_ON_ICON, FLIP_CAMERA_ICON} from "../constants/Constants";


export class CameraRN extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            type: RNCamera.Constants.Type.back,
            flashMode: FLASH_MODES[0],
        };
    }
    takePicture = async () => {
        if (this.camera) {
            const options = { quality: 0.5, base64: true };
            const data = await this.camera.takePictureAsync(options);
            cnsole.info(data.uri);

            const filePath = data.uri;
            const file = await rnfs.stat(filePath);
            if (!file.name) {
                const splits = filePath.split('/');
                file.name = splits[splits.length - 1];
            }
            file.type = checkFileType(file.name, '').fileType;
            if (!file.uri) {
                file.uri = filePath.startsWith('file:') ? filePath : 'file://' + filePath;
            }
            cnsole.info('file stat: ', file);

            const onFileFn = this.props.onFileFn || (() => {});
            onFileFn(file);
        }
    };

    toggleFlash = () => {
        const { flashMode } = this.state;
        const idx = FLASH_MODES.indexOf(flashMode);
        const newMode = FLASH_MODES[(idx+1) % FLASH_MODES.length];
        this.setState({ flashMode: newMode });
    };
    toggleFrontBack = () => {
        const { type } = this.state;
        const idx = FRONT_BACK_MODES.indexOf(type);
        const newMode = FRONT_BACK_MODES[(idx+1) % FRONT_BACK_MODES.length];
        this.setState({ type: newMode });
    };

    render() {
        const { type, flashMode } = this.state;
        const flashImg = FLASH_IMAGES[FLASH_MODES.indexOf(flashMode)];
        return (
            <View style={{ height: '100%', width: '100%' }}>
                <View style={styles.container}>
                    <RNCamera ref={ref => this.camera = ref}
                              style={styles.preview}
                              type={type}
                              flashMode={flashMode}
                              androidCameraPermissionOptions={{
                                  title: 'Permission to use camera',
                                  message: 'We need your permission to use your camera',
                                  buttonPositive: 'Ok',
                                  buttonNegative: 'Cancel',
                              }}
                              androidRecordAudioPermissionOptions={{
                                  title: 'Permission to use audio recording',
                                  message: 'We need your permission to use your audio',
                                  buttonPositive: 'Ok',
                                  buttonNegative: 'Cancel',
                              }}
                              onGoogleVisionBarcodesDetected={({ barcodes }) => {
                                  cnsole.info(barcodes);
                              }}
                    />
                    <View style={{ flex: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        {getCircularImage({ src: flashImg, dim: 30, cbFn: this.toggleFlash, border: 0 })}
                        <TouchableOpacity onPress={this.takePicture} style={styles.capture}>
                            <Text style={{ fontSize: 14 }}>SNAP</Text>
                        </TouchableOpacity>
                        {getCircularImage({ src: FLIP_CAMERA_ICON, dim: 50, cbFn: this.toggleFrontBack, border: 0 })}
                    </View>
                </View>
            </View>
        );
    }
}

const FLASH_MODES = [
    RNCamera.Constants.FlashMode.auto,
    RNCamera.Constants.FlashMode.on,
    RNCamera.Constants.FlashMode.off,
];
const FLASH_IMAGES = [
    FLASH_AUTO_ICON,
    FLASH_ON_ICON,
    FLASH_OFF_ICON,
];

const FRONT_BACK_MODES = [
    RNCamera.Constants.Type.back,
    RNCamera.Constants.Type.front,
];

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
};
