import React from 'react';


export default class AttachIcon extends React.Component {
    constructor(props) {
        super(props);
    }

    svg = (color, size) => {
        return (
            <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                 width="792px" height="792px" viewBox="0 0 792 792" style={{ fill: color, enableBackground: 'new 0 0 792 792'}}>
                <g>
                    <g id="_x33__30_">
                        <g>
                            <path d="M544.5,99v495c0,82.021-66.479,148.5-148.5,148.5S247.5,676.021,247.5,594V148.5c0-54.673,44.327-99,99-99
				s99,44.327,99,99V594c0,27.349-22.176,49.5-49.5,49.5c-27.349,0-49.5-22.151-49.5-49.5V198H297v396c0,54.673,44.327,99,99,99
				s99-44.327,99-99V148.5C495,66.479,428.521,0,346.5,0S198,66.479,198,148.5v470.25C210.202,716.389,295.045,792,396,792
				s185.798-75.611,198-173.25V99H544.5z"/>
                        </g>
                    </g>
                </g>
            </svg>
        );
    };

    render() {
        const onClickFn = this.props.onClickFn || (() => {});
        const color = this.props.color || IMG_COLOR;
        const S = this.props.size || 100;
        const opacity = this.props.opacity || 1;
        const scale = S / H;
        const transform = `scale(${scale}) rotate(40deg)`;
        return (
            <div style={{ ...custom.root, height: 2*S, width: 2*S, marginTop: -0.4*S }}>
                <div style={{ transform, opacity, height: S, width: S }} onClick={onClickFn}>
                    {this.svg(color)}
                </div>
            </div>
        );
    }
}

const IMG_COLOR = '#000000';
const H = 792;
const custom = {
    root: {
    },
};
