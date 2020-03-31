import {getKeyFromKVStore} from "./Api";
import webpush from "web-push";
import {HELO_LOGO} from "../chat/Constants";
import {NODE_CACHE_SET_TTL_SECONDS} from "../constants/Constants";
import cnsole from 'loglevel';


// To be included only in the server code
export const sendWebPushNotification = async (nodeCache, subscription, deviceID, title, body, notificationPayload) => {
    const key = '/push-subs/' + deviceID;
    if (!subscription) {
        subscription = nodeCache.get(key);
        if (!subscription) {
            subscription = await getKeyFromKVStore(key);
            cnsole.log('Got subscription: ', subscription);
            subscription = JSON.parse(subscription);
            nodeCache.set(key, subscription, NODE_CACHE_SET_TTL_SECONDS);
        }
    }

    const notifPayload = {
        icon: HELO_LOGO,
        ...(notificationPayload || TEST_NOTIFICATION_PAYLOAD),
        title, body,
    };
    webpush.sendNotification(subscription, JSON.stringify(notifPayload))
        .then(x => {
            cnsole.log('Web push notif response: ', x);
        })
        .catch(error => {
            cnsole.error('Error in sending web push notif: ', error, error.stack);
        });
    cnsole.log('sending pushhhhh');
};

const TEST_NOTIFICATION_PAYLOAD = {
    badge: HELO_LOGO,
    sound: 'https://www.soundjay.com/button/beep-07.mp3',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    renotify: true,
    tag: 'notif-1',
    data: {
        jobId: 'j1',
        actionFns: {
            '': '',
            'apply': 'clients.openWindow("/messages?reply="); notification.close();',
        },
    },
    actions: [
        {action: 'apply', title: '👍 Apply', icon: 'https://images-lb.heloprotocol.in/9.png-215971-78156-1552576429338.png?name=consumer'},
    ],
};
