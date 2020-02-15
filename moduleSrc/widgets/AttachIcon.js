import React from 'react';
import {ITALICIZED_ATTACH_ICON} from "../constants/Constants";
import TouchableAnim from "../platform/TouchableAnim";
import {Image} from '../util/Util';
import {commonStyle} from "../styles/common";


export default class AttachIcon extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const onClickFn = this.props.onClickFn || (() => {});
        const S = this.props.size || 100;
        const opacity = this.props.opacity || 1;
        return (
            <TouchableAnim onPress={onClickFn} style={{ ...custom.root, height: S, width: S }}>
                <Image src={ITALICIZED_ATTACH_ICON} style={{ opacity, height: S, width: S, ...commonStyle.noneSelect }} />
            </TouchableAnim>
        );
    }
}

const custom = {
    root: {
    },
};
