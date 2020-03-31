import uuidv1 from "uuid/v1";
import window from "global";
import format from "string-format";
import {TRUECALLER_KEY} from "../constants/Constants";
import React from "react";
import {actionButton, getCtx, getUrlParam} from "../util/Util";
import {getKeyFromKVStore} from "../util/Api";
import cnsole from 'loglevel';


export default class TruecallerDemo extends React.Component {
    static URL = '/demos/truecaller';
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            init: false,
            success: null,
            phone: null,
            showRoller: false,
        };
    }

    cbFn = async () => {
        this.setState({ showRoller: true });
        const { success, phone } = await getTruecallerDetails();
        cnsole.log('Got truecaller details: success, phone: ', success, phone);
        this.setState({ success, phone, showRoller: false, init: true });
    };

    render () {
        const { success, phone } = this.state;
        const rollerImg = <img src='https://media.giphy.com/media/xTk9ZvMnbIiIew7IpW/giphy.gif' style={{ height: 40, width: 40 }} />;
        const phoneSection = <div>Phone: {JSON.stringify({ success, phone })}</div>;

        return (
            <div>
                {actionButton('SIGNUP', this.cbFn)}
                {this.state.showRoller ? rollerImg : ''}
                {this.state.init && !this.state.showRoller ? phoneSection : ''}
            </div>
        );
    }
}

export const getTruecallerDetails = async () => {
    // TODO: Check if mobile and the right browser
    const truecallerParam = getUrlParam('truecaller');
    if (truecallerParam === 'disabled' || truecallerParam === 'no') {
        return { success: false };
    }

    const requestId = uuidv1();
    const url = format("truecallersdk://truesdk/web_verify?requestNonce={}&partnerKey={}&partnerName={}&lang={}&title={}",
        requestId, TRUECALLER_KEY, 'Helo', 'en', 'title');
    cnsole.log('url: ', url);
    window.location = url;


    // Wait for some time. If document has focus, Truecaller app is not installed
    await sleep(600);
    if (document.hasFocus()) {
        return { success: false, requestId };
    }

    await sleep(1000);

    const obj = getTruecallerDetailsForRequest(requestId);
    cnsole.log('Truecaller details: ', obj);
    return obj;
};

export const getTruecallerDetailsForRequest = async (requestId) => {
    let count = 0;
    while (count < NUM_ATTEMPTS) {
        if (document.hasFocus()) {
            // Done with Truecaller
            count++;
            const rsp = await getKeyFromKVStore('/truecaller-rsp-' + requestId);
            cnsole.log('rsp: ', rsp);

            if (rsp === '') {
                // Maybe not yet saved on server side
                await sleep(1000);
                continue;
            } else if (rsp === 'failed' || rsp === 'user_rejected') {
                return { success: false };
            } else {
                const obj = JSON.parse(rsp);
                const phone = obj.phoneNumbers[0] + '';
                cnsole.log('Got phone: ', phone);

                const name = obj.name.first + ' ' + obj.name.last;
                let normalizedPhone = '';
                if (phone.startsWith('+91')) {
                    normalizedPhone = phone.slice(3);
                } else if (phone.length >= 12 && phone.startsWith('91')) {
                    normalizedPhone = phone.slice(2);
                } else {
                    normalizedPhone = phone;
                }
                return { success: true, name, phone: normalizedPhone };
            }
        } else {
            // Truecaller window still open
            await sleep(1000);
            continue;
        }
    }
};

const sleep = async (ms) => {
    await new Promise(resolve => setTimeout(resolve, ms));
};

const NUM_ATTEMPTS = 20;
