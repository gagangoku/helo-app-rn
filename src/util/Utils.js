import {IMAGES_URL} from '../constants/Constants';


const BROKEN_IMAGE = 'http://image.shutterstock.com/z/stock-vector-broken-robot-a-hand-drawn-vector-doodle-cartoon-illustration-of-a-broken-robot-trying-to-fix-478917859.jpg';
export function getImageUrl(imageUrl) {
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
}
