import React from 'react';
import AttachIcon from "./AttachIcon";


export default class BlinkingAttachIcon extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opacity: 1,
        };
        this.intervalId = null;
    }

    async componentDidMount() {
        const startTimeMs = new Date().getTime();
        this.intervalId = setInterval(() => {
            const x = new Date().getTime() - startTimeMs;
            const opacity = MIN_OPACITY + Math.abs(Math.sin(x / 400)) * (1 - MIN_OPACITY);
            this.setState({ opacity });
        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    render() {
        return (
            <AttachIcon onClickFn={this.props.onClickFn} color={this.props.color}
                        opacity={this.state.opacity} size={this.props.size} />
        );
    }
}

const MIN_OPACITY = 0;
const H = 792;
const custom = {
    root: {
    },
};
