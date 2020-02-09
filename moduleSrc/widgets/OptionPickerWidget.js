import React from "react";
import MultiSelectionWidget from "./MultiSelectionWidget";


export default class OptionPickerWidget extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <MultiSelectionWidget {...this.props} />
        );
    }
}

