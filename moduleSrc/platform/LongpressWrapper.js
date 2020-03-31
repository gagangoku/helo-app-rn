import React from "react";
import cnsole from "loglevel";


export class LongpressWrapper extends React.PureComponent {
    onLongPress = () => {
        const { idx } = this.props;
        cnsole.info('onLongPress: ', idx);
    };

    render() {
        const props = {...this.props};
        const { idx, children } = props;
        delete props.children;
        return (
            <div {...props}>
                {children}
            </div>
        );
    }
}
