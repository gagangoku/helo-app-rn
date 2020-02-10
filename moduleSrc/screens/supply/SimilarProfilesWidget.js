import React from 'react';
import {withStyles} from '../../platform/Util';
import {capitalizeFirstLetter, View} from "../../util/Util";
import {TEXT_COLOR_LIGHT} from "../../styles/common";
import {IS_MOBILE_SCREEN} from "../../constants/Constants";
import Slider from "react-slick/lib";
import StarRatingComponent from 'react-star-rating-component';


class SimilarProfilesWidget extends React.Component {
    constructor(props) {
        super(props);

        this.similarProfiles = this.props.similarProfiles;
        this.state = {
            activeSlide: 0,
        };
    }

    normalizeEnumForDisplay = (str) => {
        return capitalizeFirstLetter(str.toLowerCase().trim().replace(/_/g, " "));
    };

    recommendationSection() {
        const settings = {
            dots: true,
            infinite: false,
            speed: 100,
            slidesToShow: IS_MOBILE_SCREEN ? 1 : 2,
            slidesToScroll: 1,
            afterChange: current => this.setState({ activeSlide: current }),
        };

        // TODO: Move styles to custom
        const items = this.recommendations.map(x => {
            const goodQualities = x.goodQualities || [];
            return (
                <View>
                    <View style={custom.recoCtr}>
                        <View style={{ marginBottom: 10, display: 'flex', flexDirection: 'row' }}>
                            <View style={{ fontSize: 20, fontWeight: 'bold', paddingTop: 5, marginRight: 20 }}>{x.customerName}</View>
                            <StarRatingComponent
                                name="rate1" editing={false}
                                starCount={x.rating}
                                renderStarIcon={() => <span style={{ fontSize: 20, marginRight: 3 }}>★</span>}
                                value={x.rating}
                            />
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', marginBottom: 10, fontSize: 15 }}>
                            <View>
                                Known for {x.numYearsWorked} years,
                            </View>
                            <View style={{ marginLeft: 5 }}>
                                {x.durationHours} hour work
                            </View>
                        </View>
                        <View style={{ fontSize: 15, marginBottom: 10, color: TEXT_COLOR_LIGHT }}>
                            {goodQualities.map(x => this.normalizeEnumForDisplay(x)).join(', ')}
                        </View>
                        <View style={{ fontSize: 16, fontWeight: '200' }}>{x.recommendation}</View>
                    </View>
                </View>
            );
        });

        return (
            <View style={{ width: '90%', paddingLeft: '5%', paddingRight: '5%' }}>
                <View style={{ marginTop: 0 }}>
                    <Slider {...settings}>
                        {items}
                    </Slider>
                </View>
            </View>
        );
    }

    render() {
        const {classes} = this.props;

        return (
            <div className={classes.root}>
            </div>
        );
    }
}

const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        verticalAlign: 'middle',
        alignItems: 'center',

        fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
});
export default withStyles(styles)(SimilarProfilesWidget);
