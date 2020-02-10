import React from "react";
import {getCtx} from "../util/Util";
import {Route} from "react-router-dom";
import {
    BrandInputScreen,
    LoyaltyEntryScreen,
    MembershipsDisplayScreen,
    OutletInputScreen
} from '../loyalty/dashboard/LoyaltyDashboardScreens';


class StepEntry extends React.Component {
    static URL = '/loyalty/dashboard/entry';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        return <LoyaltyEntryScreen />
    }
}

class StepBrand extends React.Component {
    static URL = '/loyalty/dashboard/brand';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        return <BrandInputScreen />
    }
}

class StepOutlet extends React.Component {
    static URL = '/loyalty/dashboard/outlet';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        return <OutletInputScreen />
    }
}

class StepMembershipsDisplay extends React.Component {
    static URL = '/loyalty/dashboard/membership-display';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
    }

    render() {
        return <MembershipsDisplayScreen />
    }
}

const steps = [
    StepEntry,
    StepBrand,
    StepOutlet,
    StepMembershipsDisplay,
];
export const routes = steps.flatMap(x => {
    const urls = x.URLS ? x.URLS : [x.URL];
    return urls.map(y => <Route exact path={y} component={x} key={y} />);
});
