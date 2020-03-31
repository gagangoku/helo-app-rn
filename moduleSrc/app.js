import React from 'react';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faEnvelope, faHeadset, faMapMarkerAlt, faPhone} from '@fortawesome/free-solid-svg-icons';
import {faFacebookF, faInstagram, faTwitter, faWhatsapp} from '@fortawesome/free-brands-svg-icons';
import {routes as homeRoutes} from './controller/HomePageFlows';
import {routes as customerRoutes} from './controller/CustomerSignupFlow';
import {routes as supplyRoutes} from './controller/SupplyPageFlows';
import {routes as onboardRoutes} from './controller/OnboardFlows';
import {routes as demoRoutes} from './controller/DemoRoutes';
import {routes as groupRoutes} from './controller/GroupsFlows';
import {routes as loyaltyPageRoutes} from './controller/LoyaltyPageFlows';
import {routes as loyaltyDashboardRoutes} from './controller/LoyaltyDashboardFlows';
import {Route, Switch} from "react-router-dom";
import {commonStyle} from "./styles/common";
import {ToastContainer} from "react-toastify";
import GA from './util/GoogleAnalytics';
import {initFirebase} from "./util/Util";
import cnsole from 'loglevel';


cnsole.setLevel('info');
cnsole.info('****** App starting ********', new Date().getTime());

// Font awesome fonts - only include the ones needed
library.add(faFacebookF, faInstagram, faTwitter, faWhatsapp, faPhone, faHeadset, faEnvelope, faMapMarkerAlt);

initFirebase();

export const routes = (
    <div>
        { GA.init() && <Route component={GA.GoogleAnalytics} /> }

        <Switch>
            {homeRoutes}
            {customerRoutes}
            {supplyRoutes}
            {onboardRoutes}
            {demoRoutes}
            {groupRoutes}
            {loyaltyPageRoutes}
            {loyaltyDashboardRoutes}
        </Switch>

        <div style={commonStyle.toastContainer}>
            <ToastContainer closeButton={false} />
        </div>
    </div>
);
