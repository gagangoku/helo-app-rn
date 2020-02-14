import React from "react";


export default class TouchableAnim extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            touched: false,
        };
    }

    handleMouseUp = () => {
        // Handle smooth animation when clicking without holding
        const cbFn = this.props.onPress || (() => {});
        setTimeout(() => { this.setState({ touched: false }); cbFn(); }, 150);
    };

    toggleTouched = () => {
        this.setState(prevState => ({ touched: !prevState.touched }));
    };

    render() {
        const propStyle = this.props.style || {};
        const style = {...custom.btn};
        if (this.state.touched) {
            style.opacity = 0.5;
        }

        const addedParams = {};
        if (this.props.id) {
            addedParams.key = this.props.id;
        }
        return (
            <div {...this.props} style={{...propStyle, ...style}} {...addedParams} onMouseUp={this.handleMouseUp} onMouseDown={this.toggleTouched}>
                {this.props.children}
            </div>
        );
    }
}

const custom = {
    btn: {
        cursor: 'pointer',
        opacity: 1,
        transition: 'opacity 300ms ease',
        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
    },
};
