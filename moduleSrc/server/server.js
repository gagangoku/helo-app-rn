import Express from 'express';
import React from 'react';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {reducerFn} from '../reducers';
import {renderToString} from 'react-dom/server';
import {routes} from '../app';
import {StaticRouter} from "react-router-dom";
import {Helmet} from "../platform/Util";
import compression from 'compression';
import * as URI from "uri-js";
import {
    BROWSE_PAGE_URL,
    COOKS_PAGE_URL,
    HOME_PAGE_URL,
    MAIDS_PAGE_URL,
    NANNY_PAGE_URL,
    SEE_JOB_PAGE_URL
} from "../controller/HomePageFlows";
import {
    crudsCreate,
    crudsSearch,
    getJobAttributes,
    getKeysFromKVStore,
    getSetMembersFromKVStore,
    updateDeviceIDMapping
} from "../util/Api";
import lodash from "lodash";
import {
    DESCRIPTOR_GOLD_CODE,
    GOLD_CODE_LENGTH,
    NODE_CACHE_SET_TTL_SECONDS,
    VAPID_PRIVATE_KEY,
    VAPID_PUBLIC_KEY
} from "../constants/Constants";
import webpush from 'web-push';
import bodyParser from 'body-parser';
import {setupWebsocket} from "./websocket";
import {getRandomCode, getUrlParam} from "../util/Util";
import {sendWebPushNotification} from "../util/ServerUtil";
import {HELO_LOGO} from "../chat/Constants";
import NodeCache from 'node-cache';
import {redeemOffer, validateCode, validateOfferForUser} from "../loyalty/LoyaltyUtil";
import cnsole from 'loglevel';


const app = Express();
const port = 8092;
const nodeCache = new NodeCache();

// Gzip
app.use(compression());

// Serve static files
app.use("/assets", Express.static('assets'));
app.use("/static", Express.static('static', {
    setHeaders: function(res, path) {
        res.set('Service-Worker-Allowed', '/');
    }
}));


// Web notifications push setup
webpush.setVapidDetails('mailto:contact@heloprotocol.in', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
app.use(bodyParser.json());
app.post('/subscribe', async (req, res) => {
    const subscription = req.body;
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const deviceID = getUrlParam('deviceID', fullUrl);
    const phone = getUrlParam('phone', fullUrl);
    const isAlreadySubscribed = getUrlParam('isAlreadySubscribed', fullUrl);
    cnsole.log('Saving push subscription: ', deviceID, phone, subscription, isAlreadySubscribed);

    const resp = await updateDeviceIDMapping(deviceID, phone, subscription);
    res.status(201).json({});

    // Test notification
    if (isAlreadySubscribed === 'false') {
        await sendWebPushNotification(nodeCache, subscription, null, 'Helo', '', {});
    }
});

app.get('/push-notify', async (req, res) => {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const deviceID = getUrlParam('deviceID', fullUrl);
    cnsole.log('Got deviceID: ', deviceID);

    await sendWebPushNotification(nodeCache, null, deviceID, 'Helo', 'test');
    res.status(201).json({});
});

app.post('/sendNotificationToMembers', async (req, res) => {
    const { memberRoleIds, sender, message, iconUrl, clickUrl } = req.body;
    cnsole.log('Got memberRoleIds, sender, message, iconUrl, clickUrl: ', memberRoleIds, sender, message, iconUrl, clickUrl);

    const xx = memberRoleIds.filter(x => x !== sender.sender).map(x => '/roleId/' + x + '/phones');
    const phoneNumbersRsp = await makeBatchRequests(xx, true, 1000000, getKeysFromKVStore);
    cnsole.log('Got phoneNumbersRsp # keys: ', Object.keys(phoneNumbersRsp).length);
    const phoneNumbers = lodash.uniq(Object.values(phoneNumbersRsp).flatMap(x => x.split(',')));
    cnsole.log('computed phoneNumbers #: ', phoneNumbers.length);
    const deviceIDsMap = await makeBatchRequests(phoneNumbers.map(x => '/phone/' + x + '/deviceIDs'), true, 1000000, getSetMembersFromKVStore);
    const deviceIDs = Object.values(deviceIDsMap);
    cnsole.log('Got deviceIDs #: ', deviceIDs.length);

    const devicesFlattened = deviceIDs.flatMap(x => x);
    cnsole.log('devicesFlattened #: ', devicesFlattened.length);
    devicesFlattened.forEach(deviceID => {
        sendWebPushNotification(nodeCache, null, deviceID, sender.name, message, {
            badge: HELO_LOGO,
            requireInteraction: true,
            renotify: true,
            tag: 'notif-1',
            data: {
                actionFns: {
                    '': 'clients.openWindow("' + clickUrl + '"); notification.close();',
                }
            },
        });
    });
    res.status(201).json({});
});

// Gold codes
app.post('/goldCode/generate', async (req, res) => {
    const { userDetails, establishmentId, branchId, offerId } = req.body;
    cnsole.log('/goldCode/generate: ', {userDetails, establishmentId, branchId, offerId});
    const userId = userDetails.id;

    const r = await validateOfferForUser(userId, offerId);
    cnsole.log('DEBUG: validateOfferForUser resp: ', r);
    if (!r.success) {
        res.status(200).json(r);
        return;
    }

    try {
        let code;
        while (true) {
            code = getRandomCode(GOLD_CODE_LENGTH);
            const values = await crudsSearch(DESCRIPTOR_GOLD_CODE, { code });
            cnsole.log('DEBUG: values: ', code, values);
            // TODO: Delete very old codes at server
            if (!values || values.length === 0) {
                break;
            }
        }

        const rsp = await crudsCreate(DESCRIPTOR_GOLD_CODE, { code, userId, establishmentId, branchId, offerId, timestamp: new Date().getTime() });
        cnsole.log('DEBUG: crudsCreate resp: ', rsp);
        if (!rsp.startsWith("created ")) {
            res.status(500).json({ success: false, reason: 'Couldnt create code' });
            return;
        }

        cnsole.log('Successfully created gold code: ', code);
        res.status(201).json({ success: true, code });
    } catch (e) {
        cnsole.log('Exception in generating gold code: ', e);
        res.status(500).json({ success: false });
    }
});

app.post('/goldCode/verifyAndRedeem', async (req, res) => {
    const { code, tableId, establishmentId, branchId, force } = req.body;
    cnsole.log('/goldCode/verifyAndRedeem: ', {code, tableId, establishmentId, branchId, force});

    let r = await validateCode(code, establishmentId, branchId);
    if (!r.success) {
        res.status(200).json(r);
        return;
    }

    const codeObj = r.code;
    const { userId, offerId } = codeObj;
    r = await validateOfferForUser(userId, offerId);
    if (!r.success) {
        res.status(200).json(r);
        return;
    }

    // Redeem the offer
    r = await redeemOffer({ code, codeObj, userId, offerId, tableId, establishmentId, branchId, force });
    if (!r.success) {
        res.status(200).json(r);
        return;
    }

    res.status(201).json({ success: true });
});


const makeBatchRequests = async (keys, useCache, batchSize, promiseFn) => {
    const obj = {};
    const cached = useCache ? nodeCache.mget(keys) : {};
    cnsole.log('Found cached keys #: ', Object.keys(cached).length);
    const uncached = [];
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k in cached) {
            obj[k] = cached[k];
        } else {
            uncached.push(k);
        }
    }

    const promises = [];
    const splits = [];
    for (let i = 0; i < uncached.length; i += batchSize) {
        const arr = uncached.slice(i, Math.min(uncached.length, i + batchSize));
        splits.push(arr);
        promises.push(promiseFn(arr));
    }

    for (let i = 0; i < promises.length; i++) {
        try {
            const res = await promises[i];
            Object.keys(res).forEach(k => {
                obj[k] = res[k];
                nodeCache.set(k, res[k], NODE_CACHE_SET_TTL_SECONDS);
            });
        } catch (e) {
            cnsole.log('Error in getting results for keys: ', splits[i]);
        }
    }

    return obj;
};


// For testing web push notification
// setTimeout(() => sendWebPushNotification(null, '5a604ae0-d7c5-11e9-8060-5d58b4714c51', 'cook koramangala', 'commi 1, etc'), 100);


// This is fired every time the server side receives a request
app.use(handleRender);


// We are going to fill these out in the sections to follow
async function handleRender(req, res) {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const path = URI.parse(fullUrl).path;
    cnsole.log('fullUrl: ', fullUrl);
    cnsole.log('req.url: ', req.url);
    cnsole.log('path: ', path);

    // Create a new Redux store instance
    const store = createStore(reducerFn);

    // Render / instead of req.url since I want to render other urls in JS via bundle.js
    const urlToRender = (URLS_TO_RENDER.includes(path) || path.startsWith('/person/')) ? req.url : '/';
    cnsole.log('urlToRender: ', urlToRender);

    // Render the component to a string
    let renderedHtml;
    try {
        const context = {data: {}, promises: {}, req};
        const html = renderToString(
            <Provider store={store}>
                <StaticRouter location={urlToRender} context={context}>
                    {routes}
                </StaticRouter>
            </Provider>
        );
        const helmet = Helmet.renderStatic();

        // Wait for all promises to finish
        cnsole.log('context data, promises: ', context.data, context.promises);
        const keys = Object.keys(context.promises);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const p = context.promises[k];
            if (p && !(k in context.data)) {
                context.data[k] = await p;
            }
        }
        cnsole.log('All promises returned data: ', context.data);

        let html2 = html;
        let helmet2 = helmet;
        if (keys.length > 0) {
            html2 = renderToString(
                <Provider store={store}>
                    <StaticRouter location={urlToRender} context={context}>
                        {routes}
                    </StaticRouter>
                </Provider>
            );
            helmet2 = Helmet.renderStatic();
            cnsole.log('Rendered again with data');
        }

        // Grab the initial state from our Redux store
        const preloadedState = store.getState();

        // Send the rendered page back to the client
        renderedHtml = renderFullPage(context.data, helmet2, html2, preloadedState);
    } catch (e) {
        cnsole.log('Exception in rendering page: ', e);
        renderedHtml = '<html><body>Oops, something went wrong. Please try again</body></html>';
    }

    // Send the rendered page back to the client
    res.send(renderedHtml);
}

const URLS_TO_RENDER = [
    HOME_PAGE_URL,
    MAIDS_PAGE_URL,
    NANNY_PAGE_URL,
    COOKS_PAGE_URL,
    BROWSE_PAGE_URL,
    SEE_JOB_PAGE_URL,
];

function renderFullPage(data, helmet, html, preloadedState) {
    return `
    <!doctype html>
    <html>
      <head>
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
        ${helmet.style.toString()}
        ${helmet.script.toString()}
        
        <meta id="Viewport" name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
        <link rel="icon" href="${HELO_LOGO}" type="image/png" />

        <!-- For Material UI icons -->
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        
        <meta name="google" value="notranslate" content="notranslate" />

        <!-- Global site tag (gtag.js) - Google Ads: 762858763 -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-762858763"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'AW-762858763');
            console.log('gtag initialized');
        </script>
        <!-- Event snippet for Signup conversion page In your html page, add the snippet and call gtag_report_conversion when someone clicks on the chosen link or button. -->
        <script>
            function gtag_report_conversion(url) {
                var callback = function () { if (typeof(url) != 'undefined') { window.location = url; } };
                gtag('event', 'conversion', { 'send_to': 'AW-762858763/Hg_TCL2tr5cBEIua4esC', 'event_callback': callback });
                console.log('adwords conversion reported');
                return false;
            }
        </script>
        
        <script type="text/javascript" src="https://code.responsivevoice.org/responsivevoice.js?key=Ckjzbum5" async></script>

        <script type="text/javascript"
                src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBIjIiAjO4XV3P3LqEO2AFYKyTLc_42HkE&libraries=places"></script>
    
        <meta name="google-site-verification" content="PaAqFvma_uzXYJFJ0AWv_upAcyMGjz5e9GNzh629Cdk" />
        <style>
            body.react-confirm-alert-body-element {
                overflow: hidden;
            }
    
            .react-confirm-alert-blur {
                filter: url(#gaussian-blur);
                filter: blur(2px);
                -webkit-filter: blur(2px);
            }
    
            .react-confirm-alert-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 99;
                background: rgba(255, 255, 255, 0.9);
                display: -webkit-flex;
                display: -moz-flex;
                display: -ms-flex;
                display: -o-flex;
                display: flex;
                justify-content: center;
                -ms-align-items: center;
                align-items: center;
                opacity: 0;
                -webkit-animation: react-confirm-alert-fadeIn 0.5s 0.2s forwards;
                -moz-animation: react-confirm-alert-fadeIn 0.5s 0.2s forwards;
                -o-animation: react-confirm-alert-fadeIn 0.5s 0.2s forwards;
                animation: react-confirm-alert-fadeIn 0.5s 0.2s forwards;
            }
    
            .react-confirm-alert-body {
                font-family: Arial, Helvetica, sans-serif;
                width: 70%;
                padding: 30px;
                text-align: left;
                background: #fff;
                border-radius: 10px;
                box-shadow: 0 20px 75px rgba(0, 0, 0, 0.13);
                color: #666;
            }
    
            .react-confirm-alert-svg {
                position: absolute;
                top: 0;
                left: 0;
            }
    
            .react-confirm-alert-body > h1 {
                margin-top: 0;
            }
    
            .react-confirm-alert-body > h3 {
                margin: 0;
                font-size: 16px;
            }
    
            .react-confirm-alert-button-group {
                display: -webkit-flex;
                display: -moz-flex;
                display: -ms-flex;
                display: -o-flex;
                display: flex;
                justify-content: flex-start;
                margin-top: 20px;
            }
    
            .react-confirm-alert-button-group > button {
                outline: none;
                background: #333;
                border: none;
                display: inline-block;
                padding: 6px 18px;
                color: #eee;
                margin-right: 10px;
                border-radius: 5px;
                font-size: 12px;
                cursor: pointer;
            }
    
            @-webkit-keyframes react-confirm-alert-fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
    
            @-moz-keyframes react-confirm-alert-fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
    
            @-o-keyframes react-confirm-alert-fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
    
            @keyframes react-confirm-alert-fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
        </style>
        
        <script type="module">
            import QrScanner from 'https://nimiq.github.io/qr-scanner/qr-scanner.min.js';
            QrScanner.WORKER_PATH = '/static/qr-scanner-worker.min.js';
            window.QrScanner = QrScanner;
            console.log('Got window.QrScanner: ', window.QrScanner);
        </script>

      </head>
      <body style="margin: 0">
        <div id="root">${html}</div>\n
        <script>
          // WARNING: See the following for security issues around embedding JSON in HTML:
          // http://redux.js.org/recipes/ServerRendering.html#security-considerations
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')};
          window.__DATA__ = ${JSON.stringify(data)};
          window.__HYDRATE_OR_RENDER__ = 'render';
        </script>

        <script>
            if (!window.MediaRecorder) {
                console.log('Loading media recorder polyfill');
                document.write(
                    decodeURI('%3Cscript src="/assets/media-recorder-polyfill.js">%3C/script>')
                );
            }
        </script>
        <script src="/assets/client.js"></script>
        
        <script src="${process.env.BROWSER_REFRESH_URL}"></script>
      </body>
    </html>
    `;
}


app.listen(port, () => process.send && process.send("online"));


// Get attributes
let JOB_ATTRIBUTES = null;
const refreshAttributes = async () => {
    const response = await getJobAttributes();
    // cnsole.log('getJobAttributes response: ', response);

    const allAttributes = {};
    lodash.uniq(response.attributes.map(x => x.category)).forEach(x => {
        allAttributes[x] = [];
    });
    response.attributes.forEach(x => {
        allAttributes[x.category].push(x.id);
    });
    // cnsole.log('this.allAttributes: ', allAttributes);
    JOB_ATTRIBUTES = allAttributes;
};
const refreshInterval = setInterval(refreshAttributes, 10 * 60 * 1000);     // Every 10 minutes
refreshAttributes();

const jobAttributesFn = () => JOB_ATTRIBUTES;

// Setup chat bot websocket server
setupWebsocket(jobAttributesFn);
