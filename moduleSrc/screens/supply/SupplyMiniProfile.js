import React from 'react';
import {withStyles} from '../../platform/Util';
import {getCtx, View} from "../../util/Util";
import SupplyProfileWidget from "./SupplyProfileWidget";
import {getRecommendationsOfSupply, getSupplyProfileById} from "../../util/Api";
import SuperRoot from "../../widgets/SuperRoot";
import Header from "../../widgets/Header";
import Footer from "../../widgets/Footer";
import cnsole from 'loglevel';


class SupplyMiniProfile extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);

        // Fire promises for the API's which don't yet have data
        this.vals = {};
        const { supplyId, staticContext } = props;
        KEYS.forEach(key => {
            const d = staticContext.data[key];
            const p = staticContext.promises[key];

            if (d) {
                this.vals[key] = d;
            } else if (!p) {
                staticContext.promises[key] = promiseFn(key, supplyId);
            }
        });

        this.state = {
            supplyProfile: this.vals[KEY_SUPPLY_PROFILE],
            recommendations: this.vals[KEY_RECOMMENDATIONS],
            fetchError: false,
        };
    }

    // Wait for the promises to return and set data
    async componentDidMount() {
        const { supplyId, staticContext } = this.props;

        KEYS.forEach(async (key) => {
            const d = staticContext.data[key];
            const p = staticContext.promises[key];

            if (!d && p) {
                try {
                    staticContext.data[key] = await p;
                    this.setState({ [key]: staticContext.data[key] });
                } catch (e) {
                    cnsole.log('Exception in getting api: ', key, supplyId, e);
                    this.setState({ fetchError: true });
                }
            }
        });
    }

    render() {
        const { classes } = this.props;
        if (!this.state.supplyProfile || !this.state.recommendations) {
            return (<View>Loading...</View>);
        }

        return (
            <SuperRoot>
                <Header />

                <div className={classes.root}>
                    <SupplyProfileWidget location={this.props.location}
                                         supplyProfile={this.state.supplyProfile} recommendations={this.state.recommendations}
                                         hidePII={true}
                                         disableCallBtn={this.props.disableCallBtn} showHeader={this.props.showHeader}
                                         onHireFn={null} onBookDemoFn={null} loginFn={null} logoutFn={null} />
                </div>

                <Footer />
            </SuperRoot>
        );
    }
}

const KEY_SUPPLY_PROFILE = 'supplyProfile';
const KEY_RECOMMENDATIONS = 'recommendations';
const KEYS = [KEY_SUPPLY_PROFILE, KEY_RECOMMENDATIONS];
const promiseFn = (key, supplyId) => {
    if (key === KEY_SUPPLY_PROFILE) {
        return getSupplyProfileById(supplyId);
    }
    if (key === KEY_RECOMMENDATIONS) {
        return getRecommendationsOfSupply(supplyId);
    }
    return null;
};

const styles = theme => ({
    root: {},
});
export default withStyles(styles)(SupplyMiniProfile);
