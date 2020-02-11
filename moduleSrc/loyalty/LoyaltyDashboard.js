import React from "react";
import {View} from "../util/Util";
import {Helmet, WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH} from "../platform/Util";


export class LoyaltyDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeSlide: 0,
        };
    }

    render() {
        const H = WINDOW_INNER_HEIGHT;
        const W = WINDOW_INNER_WIDTH;

        return (
            <View style={custom.root}>
                <title>Dashboard</title>
                <Helmet>
                    <link rel="stylesheet" type="text/css" charset="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
                    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
                </Helmet>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    Hi
                </div>
            </View>
        );
    }
}

const custom = {
    root: {
        backgroundColor: '#FFFFFF',
        height: WINDOW_INNER_HEIGHT,
        width: '100%',
        fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
        fontWeight: '300',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
};
