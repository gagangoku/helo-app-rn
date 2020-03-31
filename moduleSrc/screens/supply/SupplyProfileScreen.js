import React from 'react';
import {withStyles} from '../../platform/Util';
import {awaitPromises, fireApiCalls, getCtx, View} from "../../util/Util";
import SupplyProfileWidget from "./SupplyProfileWidget";
import {getRecommendationsOfSupply, getSimilarSupply, getSupplyProfileById} from "../../util/Api";
import SuperRoot from "../../widgets/SuperRoot";


class SupplyProfileScreen extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);

        // Fire promises for the API's which don't yet have data
        const { supplyId, staticContext } = props;
        this.vals = fireApiCalls(staticContext, KEYS, (k) => promiseFn(k, supplyId));

        this.state = {
            supplyProfile: this.vals[KEY_SUPPLY_PROFILE],
            recommendations: this.vals[KEY_RECOMMENDATIONS],
            similarProfiles: this.vals[KEY_SIMILAR_PROFILES],
            fetchError: false,
        };
    }

    // Wait for the promises to return and set data
    async componentDidMount() {
        const { staticContext } = this.props;
        await awaitPromises(staticContext, KEYS, (k, v) => this.setState({ [k]: v }), () => this.setState({ fetchError: true }));
    }

    render() {
        const { classes } = this.props;
        if (!this.state.supplyProfile || !this.state.recommendations || !this.state.similarProfiles) {
            return (<View>Loading...</View>);
        }

        return (
            <SuperRoot>
                <div className={classes.root}>
                    <SupplyProfileWidget location={this.props.location} history={this.props.history}
                                         supplyProfile={this.state.supplyProfile} recommendations={this.state.recommendations}
                                         similarProfiles={this.state.similarProfiles}
                                         hidePII={true} hideCharges={this.props.hideCharges}
                                         disableCallBtn={this.props.disableCallBtn} inAppCallBtn={this.props.inAppCallBtn}
                                         showHeader={this.props.showHeader} showFooter={this.props.showFooter}
                                         onHireFn={null} onBookDemoFn={null} loginFn={null} logoutFn={null} />
                </div>
            </SuperRoot>
        );
    }
}

const KEY_SUPPLY_PROFILE = 'supplyProfile';
const KEY_RECOMMENDATIONS = 'recommendations';
const KEY_SIMILAR_PROFILES = 'similarProfiles';
const KEYS = [KEY_SUPPLY_PROFILE, KEY_RECOMMENDATIONS, KEY_SIMILAR_PROFILES];
const promiseFn = (key, supplyId) => {
    switch (key) {
        case KEY_SUPPLY_PROFILE:
            return getSupplyProfileById(supplyId);
        case KEY_RECOMMENDATIONS:
            return getRecommendationsOfSupply(supplyId);
        case KEY_SIMILAR_PROFILES:
            return getSimilarSupply(supplyId);
        default:
            return null;
    }
};

const styles = theme => ({
    root: {},
});
export default withStyles(styles)(SupplyProfileScreen);
