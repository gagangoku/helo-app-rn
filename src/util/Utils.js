import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {IMAGES_URL, MAX_AUDIO_SIZE_BYTES, MAX_IMAGE_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES} from '../constants/Constants';


const BROKEN_IMAGE = 'http://image.shutterstock.com/z/stock-vector-broken-robot-a-hand-drawn-vector-doodle-cartoon-illustration-of-a-broken-robot-trying-to-fix-478917859.jpg';
export const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return BROKEN_IMAGE;
    }
    if (imageUrl.startsWith('id=')) {
        return IMAGES_URL + '/' + imageUrl.split('id=')[1];
    }
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }
    return IMAGES_URL + '/' + imageUrl;
};

export const actionButton = (text, onSubmitFn, overrides={}) => {
    overrides.minWidth = overrides.minWidth || 150;
    return (
        <View style={common.buttonContainer} pointerEvents="box-none">
            <TouchableOpacity onPress={ onSubmitFn }>
                <View style={[common.button]}>
                    <Text style={[common.buttonText, overrides]}>{text}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export const assert = (condition, errorMsg) => {
    if (!condition) {
        console.error('assert failed: ', errorMsg);
        throw new Error(errorMsg);
    }
};

export const checkFileType = (fileName) => {
    fileName = fileName.toLowerCase();
    const splits = fileName.split('.');
    switch (splits[splits.length - 1]) {
        case 'jpg':
        case 'jpeg':
            return { maxFileSize: MAX_IMAGE_SIZE_BYTES, serverUrl: IMAGES_URL, type: 'image/jpg' };
        case 'png':
            return { maxFileSize: MAX_IMAGE_SIZE_BYTES, serverUrl: IMAGES_URL, type: 'image/png' };
        case 'gif':
            return { maxFileSize: MAX_IMAGE_SIZE_BYTES, serverUrl: IMAGES_URL, type: 'image/gif' };
        case 'mp4':
            return { maxFileSize: MAX_VIDEO_SIZE_BYTES, serverUrl: VIDEOS_URL, type: 'video/mp4' };
        case 'mp3':
            return { maxFileSize: MAX_AUDIO_SIZE_BYTES, serverUrl: AUDIOS_URL, type: 'audio/mp3' };
        case 'webm':
            return { maxFileSize: MAX_AUDIO_SIZE_BYTES, serverUrl: AUDIOS_URL, type: 'audio/webm' };
        case 'aac':
            return { maxFileSize: MAX_AUDIO_SIZE_BYTES, serverUrl: AUDIOS_URL, type: 'audio/aac' };
        default:
            return null;
    }
};

export const geocodeByAddress = async () => {};
export const getCtx = async () => {};
export const getFieldNameFromType = async () => {};
export const getGpsLocation = async () => {};
export const getKeysWhereValueIs = async () => {};
export const getUrlParam = async () => {};
export const haversineDistanceKms = async () => {};
export const navigateToLatLon = async () => {};
export const recognizeSpeechMinMaxDuration = async () => {};
export const recordAudio = async () => {};
export const spacer = (height=10, width=10) => {
    return <View style={{ height, width }} />
};
export const staticMapsImg = async () => {};
export const uploadBlob = async () => {};


const common = {
    button: {},
    buttonText: {},
    buttonContainer: {},
};
