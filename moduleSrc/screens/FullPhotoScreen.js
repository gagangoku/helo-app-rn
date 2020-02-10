import React from 'react';
import {Image, View, WINDOW_INNER_WIDTH} from '../platform/Util';
import {getImageUrl} from "../util/Util";
import SuperRoot from "../widgets/SuperRoot";
import {HOME_PAGE_URLS} from "../controller/Urls";


export default class FullPhotoScreen extends React.Component {
    static URL = HOME_PAGE_URLS.fullImage;
    constructor(props) {
        super(props);
    }

    render() {
        let thumbImageUrl = getImageUrl(this.props.match.params.id);
        console.log('fullImageUrl: ', thumbImageUrl, this.props);

        return (
            <SuperRoot>
                <View style={custom.root}>
                    <Image src={thumbImageUrl} style={custom.cookThumbImg} />
                </View>
            </SuperRoot>
        );
    }
}

const custom = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        verticalAlign: 'middle',
        alignItems: 'center',
    },
    cookThumbImg: {
        maxWidth: WINDOW_INNER_WIDTH,
    },
};
