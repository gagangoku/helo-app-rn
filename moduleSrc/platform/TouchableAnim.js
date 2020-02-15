import React from "react";


export default class TouchableAnim extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            touched: false,
        };
    }

    onMouseUp = () => {
        // Handle smooth animation when clicking without holding
        setTimeout(() => {
            this.setState({ touched: false });
            (this.props.onPressOut || (() => {}))();
            (this.props.onPress || (() => {}))();
        }, 150);
    };

    onMouseDown = () => {
        (this.props.onPressIn || (() => {}))();
        this.setState(prevState => ({ touched: !prevState.touched }));
    };

    render() {
        const props = {...this.props};
        delete props.onPressOut;
        delete props.onPressIn;
        delete props.onPress;

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
            <div {...props} style={{...propStyle, ...style}} {...addedParams}
                 onMouseUp={this.onMouseUp} onMouseDown={this.onMouseDown}>
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
