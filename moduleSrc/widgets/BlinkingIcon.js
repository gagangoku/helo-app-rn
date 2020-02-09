import React from 'react';


export default class BlinkingIcon extends React.Component {
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
        const { opacity } = this.state;
        return (
            <div style={{ ...this.props.style, opacity }}>
                {this.props.children}
            </div>
        );
    }
}

const MIN_OPACITY = 0;
const custom = {
    root: {
    },
};
