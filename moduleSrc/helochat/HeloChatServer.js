import cnsole from "loglevel";
import {createQueue, getUrlParam, newMessageSummary} from "../util/Util";
import {DESCRIPTOR_HELO_CHAT_MESSAGE, DESCRIPTOR_HELO_GROUP, WEBSOCKET_URL} from "../constants/Constants";
import {crudsCreate, crudsSearch, hsetKeyFromKVStore} from "../util/Api";
import format from 'string-format';
import redis from 'redis';
import {
    MESSAGE_TYPE_ACK,
    MESSAGE_TYPE_GROUP,
    MESSAGE_TYPE_LAST_READ_IDX,
    MESSAGE_TYPE_MESSAGE,
    REDIS_KEY_LAST_READ_IDX,
    TYPE_INITIAL,
    TYPE_UPDATE
} from "./Constants";


/**
 * Controller for a user.
 * Connects to client using websocket. Sends the client a view of whats changed since the last watermark, and periodic
 * updates to messages / groups when they happen.
 *
 * Controllers subscribe to all groups a user is part of. It publishes a message when a user sends one.
 * Other controllers subscribed to the group will read it and send to their respective websockets.
 *
 * Initial view: new messages since watermark, group / user updates since lastUpdatedAtMs
 * Updates as and when, using Redis Pubsub.
 */
export class HeloChatServer {
    constructor(webSocketConnection, requestUrl) {
        this.webSocketConnection = webSocketConnection;
        this.messageCount = 0;

        const fullUrl = !requestUrl.startsWith('/') ? requestUrl : WEBSOCKET_URL + requestUrl;
        this.watermark = getUrlParam('watermark', fullUrl);
        this.roleId = getUrlParam('roleId', fullUrl);
        this.lastUpdatedAtMs = getUrlParam('lastUpdatedAtMs', fullUrl);

        this.redisPublisher  = createClient(CLIENT_TYPE_PUBLISHER);

        this.bufferMessages = [];
        this.subscriberReady = false;
        this.redisSubscriber = createClient(CLIENT_TYPE_SUBSCRIBER);
        this.redisSubscriber.on('message', (channel, msg) => {
            cnsole.info('Redis message event2: ', CLIENT_TYPE_SUBSCRIBER);
            const groupId = this.groupIdFromChannel(channel);
            const message = JSON.parse(msg);
            if (!this.subscriberReady) {
                cnsole.info('subscriber not ready, buffering message: ', msg);
                this.bufferMessages.push([groupId, message]);
                return;
            }
            this.onMessageFromServer(groupId, message);
        });
        this.redisSubscriber.on('ready', async (x) => {
            cnsole.info('Redis ready event2: ', CLIENT_TYPE_SUBSCRIBER);
            this.sendInitialViewFn().then(() => {
                this.subscriberReady = true;
                this.bufferMessages.forEach(x => {
                    const [groupId, message] = x;
                    this.onMessageFromServer(groupId, message);
                });
                cnsole.info('Sent buffered messages: ', this.bufferMessages.length);
            });
        });
        this.redisSubscriber.on('reconnecting', (x) => {
            cnsole.info('Redis reconnecting event2: ', CLIENT_TYPE_SUBSCRIBER);
            this.subscriberReady = false;
        });

        this.jobQ = createQueue({ name: 'redis-subscriberQ', restartAfterMs: 5 });
    }

    sendInitialViewFn = async () => {
        const t1 = new Date().getTime();
        const { groupList, messages } = await this.lookupRelevant(this.watermark, this.roleId);

        const idToGroupMap = {};
        groupList.forEach(group => {
            idToGroupMap[group.id] = group;
        });
        this.subscribeToGroups(Object.keys(idToGroupMap));

        // TODO: In case lastUpdatedAtMs is 0, use the lastReadIdx to compute the number of unread messages
        const lastMsg = {};
        for (let i = messages.length - 1; i >= 0; i--) {
            const { groupId, timestamp, changeType, payload } = messages[i] || {};
            if (!changeType) {
                cnsole.error('Bad message, skipping: ', this.watermark, this.roleId, messages[i]);
                continue;
            }
            if (!lastMsg[groupId]) {
                const { photo, name } = idToGroupMap[groupId];
                const subheading = newMessageSummary(payload);
                lastMsg[groupId] = { groupId, photo, title: name, subheading, timestamp, changeType, payload, numMessagesSinceLastWatermark: 1 };
            } else {
                lastMsg[groupId].numMessagesSinceLastWatermark++;
            }
        }
        const view = Object.values(lastMsg).sort((a, b) => b.timestamp - a.timestamp);

        const initialRsp = {
            type: TYPE_INITIAL,
            watermark: this.watermark,
            lastUpdatedAtMs: this.lastUpdatedAtMs,
            view,
        };
        const initialRspStr = JSON.stringify(initialRsp);
        const t2 = new Date().getTime();
        cnsole.info('Sending initialRsp: ', { bytes: initialRspStr.length, time: t2 - t1 });
        this.webSocketConnection.sendUTF(initialRspStr);

        this.sendUpdateSinceFn(this.watermark, this.roleId, this.lastUpdatedAtMs, groupList, messages);
    };

    sendUpdateSinceFn = (watermark, roleId, lastUpdatedAtMs, groupList, messages) => {
        const t1 = new Date().getTime();
        const newWatermark = messages.length > 0 ? messages.map(x => x.id).reduce((a, b) => Math.max(a, b)) : watermark;
        const updatedGroups = groupList.filter(x => (x.metadata?.updatedAt || t1) >= lastUpdatedAtMs - GROUP_UPDATED_BUFFER_TIME_MS);

        const updateRsp = {
            type: TYPE_UPDATE,
            watermark: newWatermark,
            lastUpdatedAtMs: t1,
            updatedGroups,
            newMessages: messages,
            updatedUsers: [],
        };
        const t3 = new Date().getTime();
        const ser = JSON.stringify(updateRsp);
        const t4 = new Date().getTime();
        cnsole.info(new Date(), 'Time taken in serialization: ', { time: t4 - t3 });
        cnsole.info(new Date(), 'Total time taken in sendUpdateSinceFn: ', { time: t4 - t1, bytes: ser.length });
        this.webSocketConnection.sendUTF(ser);
    };

    lookupRelevant = async (watermark, roleId) => {
        // Find groups roleId is part of
        const t1 = new Date().getTime();
        const groupList = await crudsSearch(DESCRIPTOR_HELO_GROUP, { 'membersStr_LIKE': `%,${roleId},%` });
        const t2 = new Date().getTime();
        cnsole.info('Got groupList: ', { time: t2 - t1, num: groupList.length });

        // Find messages after watermark for groups
        const messages = await crudsSearch(DESCRIPTOR_HELO_CHAT_MESSAGE, { 'id_GT': watermark, 'groupId_IN': groupList.map(x => x.id) });
        const t3 = new Date().getTime();
        cnsole.info('Got messages: ', { num: messages.length, time: t3 - t2 });

        return { groupList, messages };
    };

    onMessageFromServer = (groupId, message) => {
        if (message.id <= this.watermark) {
            // Older message, ignore
            cnsole.warn('onMessageFromServer: Older message, skipping: ', this.watermark, message);
            return;
        }
        cnsole.info(new Date(), 'onMessageFromServer: Pushing to jobQ: ', message.id);
        this.jobQ.push((resolve) => {
            this.onMessageFromServerInt(groupId, message);
            resolve();
        });
    };
    onMessageFromServerInt = (groupId, message) => {
        cnsole.info(new Date(), 'onMessageFromServer: Executing from jobQ: ', message.id);
        const { id, timestamp, serverTs } = message;
        const updateRsp = {
            type: TYPE_UPDATE,
            watermark: id,
            lastUpdatedAtMs: timestamp,
            updatedGroups: [],
            newMessages: [message],
        };
        const ser = JSON.stringify(updateRsp);
        this.webSocketConnection.sendUTF(ser);
        cnsole.info(new Date(), 'Sending update: ', message.id, new Date().getTime() - parseInt(serverTs));
    };

    onMessage = async (message) => {
        cnsole.info(new Date(), 'onMessage: Pushing to jobQ');
        const serverMsg = {...message, serverTs: new Date().getTime()};
        this.jobQ.push((resolve) => {
            this.onMessageInt(serverMsg).then(resolve);
        });
    };
    onMessageInt = async (message) => {
        cnsole.info(new Date(), 'onMessageInt: Executing from jobQ: ', this.messageCount++, message.payload);
        const { type, watermark, lastUpdatedAtMs, lastReadIdx, groupId } = message;
        switch (type) {
            case MESSAGE_TYPE_ACK:
                this.watermark = watermark;
                this.lastUpdatedAtMs = lastUpdatedAtMs || this.lastUpdatedAtMs;
                cnsole.info('Ack, new watermark: ', watermark);
                break;
            case MESSAGE_TYPE_LAST_READ_IDX:
                const key = format('/group/{}/user/{}', groupId, this.roleId);
                await hsetKeyFromKVStore(REDIS_KEY_LAST_READ_IDX, key, lastReadIdx + '');
                cnsole.info('Updated lastReadIdx to: ', lastReadIdx);
                break;
            case MESSAGE_TYPE_MESSAGE:
                // New message / delete. Add to journal
                const messagePayload = {...message};
                crudsCreate(DESCRIPTOR_HELO_CHAT_MESSAGE, messagePayload).then(rsp => {
                    if (!rsp.startsWith('created')) {
                        // TODO: Handle retries
                        cnsole.error('Error in creating message');
                    } else {
                        messagePayload.id = parseInt(rsp.split(' ')[1]);
                        this.publish(groupId, messagePayload);
                    }
                });
                break;
            case MESSAGE_TYPE_GROUP:
                // Merge update with the current group snapshot
            default:
                cnsole.warn('Unknown message: ', message);
                break;
        }
    };
    close = () => {
        cnsole.info('HeloChatServer: closing');
        this.redisPublisher.quit();
        this.redisSubscriber.quit();
    };


    publish = (groupId, msg) => {
        const key = this.channelFromGroupId(groupId);
        cnsole.info(new Date(), 'Publishing to: ', key, msg.id);
        this.redisPublisher.publish(key, JSON.stringify(msg));
    };
    subscribeToGroups = (groupIds) => {
        this.redisSubscriber.subscribe(...groupIds.map(x => this.channelFromGroupId(x)));
    };

    channelFromGroupId = (groupId) => '/pubsub/groupId/' + groupId;
    groupIdFromChannel = (channel) => channel.split('/pubsub/groupId/')[1];
}

const createClient = (name) => {
    const client = redis.createClient(REDIS_CREATE_CLIENT_PARAMS);
    client.on('ready', (x) => cnsole.info('Redis ready event: ', name));
    client.on('connect', (x) => cnsole.info('Redis connect event: ', name));
    client.on('reconnecting', (x) => cnsole.info('Redis reconnecting event: ', name));
    client.on('error', (err) => cnsole.info('Redis error event: ', err.message));
    client.on('end', (x) => cnsole.info('Redis end event: ', name));
    client.on('warning', (err) => cnsole.info('Redis warning event: ', name, err));
    return client;
};

const REDIS_CREATE_CLIENT_PARAMS = {
    port: 6379, host: 'localhost',
    retry_strategy: (options) => {
        const retryAfterMs = Math.min(options.attempt * 100, 3000);
        cnsole.info('Redis retry_strategy: ', options.attempt, retryAfterMs);
        return retryAfterMs;
    },
};
const GROUP_UPDATE_EVERY_MS = 5000;
const GROUP_UPDATED_BUFFER_TIME_MS = 2 * GROUP_UPDATE_EVERY_MS;
const CLIENT_TYPE_PUBLISHER = 'publisher';
const CLIENT_TYPE_SUBSCRIBER = 'subscriber';

/**
 *  Database
 *  Controller
 *  Client
 *
 *
 *  Initial view : Client ==> Controller
 *
 *  Actions on client:
 *    1. Load initial view from server / local
 *    2. Load messages for a group
 *    3. Create new message
 *    4. Forward message
 *    5. Delete message
 *    6. Create group
 *    7. Group admin actions: Join / add member / leave / admins / update name / photo ...
 *    8. Update self profile
 *
 *
 *
 *
 * Client to Controller = websocket
 * Receives notifications about message / group / user updates
 * Updates redux state and re-renders
 * Updates local storage
 * Local queue of un-acked messages (per group). Once message update comes, these are removed from local storage
 *
 *
 *
 *
 */
