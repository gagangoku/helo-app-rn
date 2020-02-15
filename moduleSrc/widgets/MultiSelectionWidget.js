import React from "react";
import {capitalizeFirstLetter, getKeysWhereValueIs, Text, View} from '../util/Util';
import PropTypes from 'prop-types';
import TouchableAnim from "../platform/TouchableAnim";
import cnsole from 'loglevel';


export default class MultiSelectionWidget extends React.Component {
    constructor(props) {
        super(props);

        let clicked = {};
        this.props.optionList.forEach(y => {clicked[PREFIX + y] = false});
        (this.props.initialSelected || []).forEach(y => {
            clicked[PREFIX + y] = true;
            this.props.toggleFn(y, true);
        });

        this.state = {
            ...clicked,
        };
        this.displayFn = this.props.displayFn || this.normalizeEnumForDisplay;
        this.singleSelection = this.props.singleSelection || false;
        this.theme = this.props.theme || DEFAULT_THEME;
    }

    normalizeEnumForDisplay = (str) => {
        return capitalizeFirstLetter(str.toLowerCase().trim().replace(/_/g, " "));
    };

    render() {
        const rootContainerStyle = this.props.rootContainerStyle || {
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
        };
        const s = this.props.itemsContainerStyleOverride || {
            flexDirection: 'row',
            justifyContent: 'center',
        };
        const itemsContainerStyle = {
            display: 'flex',
            flexWrap: 'wrap',
            ...s,
        };

        const optionRenderFn = (this.props.optionRenderFn || this.box);
        const items = this.props.optionList.map(key => {
            const text = this.displayFn(key);
            const isSelected = !(!(this.state[PREFIX + key]));
            return optionRenderFn(text, isSelected, () => this.toggle(key));
        });
        const heading = this.props.heading ? <Text style={custom.heading}>{this.props.heading}</Text> : <View />;
        const subheading = this.props.subHeading ? <Text style={custom.subHeading}>{this.props.subHeading}</Text> : <View />;

        return (
            <View style={rootContainerStyle}>
                {heading}
                {subheading}
                <View style={itemsContainerStyle}>
                    {items}
                </View>
            </View>
        );
    }

    toggle = (key) => {
        if (this.props.disabled === 'true') {
            return;
        }

        const k = PREFIX + key;
        const newVal = !this.state[k];
        if (this.singleSelection) {
            const selected = getKeysWhereValueIs(this.state, true);
            if (selected.length > 0) {
                this.setState({ [selected[0]]: false });
                this.props.toggleFn(selected[0].split(PREFIX)[1], false);
            }
        }

        this.setState({ [k]: newVal });
        this.props.toggleFn(key, newVal);
        cnsole.log('toggle: ', k, key);
    };

    box = (text, isSelected, cb) => {
        const boxStyle = {
            backgroundColor: isSelected ? this.theme.selectedBackgroundColor : this.theme.backgroundColor,
            border: '1px solid',
            borderColor: isSelected ? this.theme.selectedBorderColor : this.theme.borderColor,
        };
        const textStyle = {
            color: isSelected ? this.theme.selectedTextColor : this.theme.textColor,
        };

        return (
            <View style={[custom.boxContainer, boxStyle]} key={text}>
                <TouchableAnim onPress={cb} style={custom.justifyAlignCenter}>
                    <Text style={[custom.boxText, textStyle]}>{text}</Text>
                </TouchableAnim>
            </View>
        );
    };
}
MultiSelectionWidget.propTypes = {
    optionList: PropTypes.array,
    initialSelected: PropTypes.array,
    toggleFn: PropTypes.func,
    displayFn: PropTypes.func,
    singleSelection: PropTypes.bool,
    heading: PropTypes.string,
    subHeading: PropTypes.string,
    optionRenderFn: PropTypes.func,

    rootContainerStyle: PropTypes.object,
    itemsContainerStyleOverride: PropTypes.object,
};


const PREFIX = 'cui-';
export const BUTTON_BACKGROUND_COLOR = '#4d4d4d';
export const TEXT_COLOR = '#404040';
const DEFAULT_THEME = {
    textColor: TEXT_COLOR,
    selectedTextColor: 'white',

    backgroundColor: 'white',
    selectedBackgroundColor: BUTTON_BACKGROUND_COLOR,

    borderColor: 'black',
    selectedBorderColor: BUTTON_BACKGROUND_COLOR,
};
const custom = {
    boxContainer: {
        marginLeft: 5,
        marginRight: 5,
        marginTop: 10,
        marginBottom: 10,

        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        borderWidth: 1,

        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
    },
    boxText: {
        padding: 10,
        textAlign: 'center',
        fontSize: 16,
    },

    heading: {
        fontSize: 18,
        fontWeight: '600',
        color: TEXT_COLOR,
        width: '100%',
        textAlign: 'center',
    },
    subHeading: {
        fontSize: 15,
        fontWeight: '400',
        color: TEXT_COLOR,
        width: '100%',
        textAlign: 'center',
    },
    itemsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },

    justifyAlignCenter: {
        justifyContent: 'center',
        alignItems: 'center'
    },
};
