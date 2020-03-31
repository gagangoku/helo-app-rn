import Pushy from 'pushy';
import {APP_DEBUG_MODE, PUSHY_API_KEY} from "../constants/Constants";
import cnsole from 'loglevel';
import lodash from 'lodash';


const pushyAPI = new Pushy(PUSHY_API_KEY);
const notifyMember = ({ roleId, sender, message, iconUrl, clickUrl }) => {
    // Set push payload data to deliver to device(s)
    const data = { title: sender.name, message };

    // Insert target device token(s) here
    // Optionally, send to a publish/subscribe topic instead
    // to = '/topics/news';
    const to = '/topics/topic-' + roleId.replace(':', '-');

    // Set optional push notification options (such as iOS notification fields)
    const options = {
        notification: {
            badge: 1,
            sound: 'ping.aiff',
            body: 'Hello World \u270c'
        },
    };

    // Send push notification via the Send Notifications API
    // https://pushy.me/docs/api/send-notifications
    cnsole.info('Pushy: Notifying: ', to);
    pushyAPI.sendPushNotification(data, to, options, function (err, id) {
        // Log errors to console
        if (err) {
            cnsole.warn('Pushy: Error in notifying: ', to);
            cnsole.log('Pushy: Error in notifying: ', to, err);
            return;
        }

        // Log success
        cnsole.info('Pushy: Push sent successfully. ID: ', to, id);
    });
};

export const notifyPushyMembers = (obj) => {
    const { memberRoleIds, sender, message, iconUrl, clickUrl } = obj;
    const array = lodash.uniq(notifySelf ? memberRoleIds.concat(sender.sender) : memberRoleIds.filter(x => x !== sender.sender));
    array.forEach(roleId => {
        notifyMember({ roleId, sender, message });
    });
};

const notifySelf = APP_DEBUG_MODE;
