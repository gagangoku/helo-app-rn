import React from 'react';
import {
    DESCRIPTOR_HELO_CHAT_MESSAGE,
    DESCRIPTOR_HELO_GROUP,
    DESCRIPTOR_VISITOR,
    WEBSOCKET_URL
} from "../constants/Constants";
import cnsole from 'loglevel';
import {AsyncStorage} from "../platform/Util";
import {convertToNewMessageType, noOpFn} from "../util/Util";
import format from 'string-format';
import {crudsCreate, crudsUpdate} from "../util/Api";
import xrange from 'xrange';
import {
    CHANGE_TYPE_ADD,
    CHANGE_TYPE_DELETE,
    CHANGE_TYPE_UPDATE,
    MESSAGE_TYPE_ACK,
    MESSAGE_TYPE_GROUP,
    MESSAGE_TYPE_LAST_READ_IDX,
    MESSAGE_TYPE_MESSAGE,
    MESSAGE_TYPE_USER,
    TYPE_INITIAL,
    TYPE_UPDATE
} from "./Constants";


export const HeloChatClient = async ({ userId, watermarkOverride, lastUpdatedAtMsOverride, receiver }) => {
    if (!userId) {
        throw 'User id is must';
    }
    const watermark = parseInt(await AsyncStorage.getItem(WATERMARK_KEY) || '-1');
    const lastUpdatedAtMs = parseInt(await AsyncStorage.getItem(LAST_UPDATED_AT) || '-1');
    const state = {
        reconnectDelay: 10,
        websocket: null,
        watermark: watermarkOverride || watermark,
        lastUpdatedAtMs: lastUpdatedAtMsOverride || lastUpdatedAtMs,
        userId
    };

    const sendMessage = async (data) => {
        const { groupId, type, ...extra } = data;
        const payload = { groupId, timestamp: new Date().getTime(), type: MESSAGE_TYPE_MESSAGE, changeType: CHANGE_TYPE_ADD,
                          payload: { type: convertToNewMessageType(type), sender: '' + state.userId, ...extra } };
        sendMessageToWebsocket(payload);
    };
    const deleteMessage = async (data) => {
        const { id } = data;
        const payload = { id, type: MESSAGE_TYPE_MESSAGE, changeType: CHANGE_TYPE_DELETE };
        sendMessageToWebsocket(payload);
    };
    const forwardMessage = async (data, groupIds) => {
        for (let i = 0; i < groupIds.length; i++) {
            const groupId = groupIds[i];
            await sendMessage({ ...data, groupId });
        }
    };
    const createGroup = async (data) => {
        const { name, desc, photo } = data;
        const now = new Date().getTime();
        const rsp = await crudsCreate(DESCRIPTOR_HELO_GROUP, {
            type: MESSAGE_TYPE_GROUP, name, desc, photo, members: [state.userId], admins: [state.userId],
            metadata: { createdAt: now, updatedAt: now }, props: DEFAULT_PROPS });
        if (rsp.startsWith('created')) {
            const groupId = rsp.split(' ')[1];
            sendMessageToWebsocket({ id: groupId, type: MESSAGE_TYPE_GROUP, changeType: CHANGE_TYPE_ADD });
            return groupId;
        }
        return null;
    };
    const updateGroup = async (data) => {
        const { id } = data;
        const rsp = await crudsUpdate(DESCRIPTOR_HELO_GROUP, id, data);
        sendMessageToWebsocket({ id, type: MESSAGE_TYPE_GROUP, changeType: CHANGE_TYPE_UPDATE });
    };
    const updateProfile = async (data) => {
        const { id } = data;
        const rsp = await crudsUpdate(DESCRIPTOR_VISITOR, id, data);
        sendMessageToWebsocket({ id, type: MESSAGE_TYPE_USER, changeType: CHANGE_TYPE_UPDATE });
    };
    const updateLastReadIdx = async (data) => {
        const { groupId, lastReadIdx } = data;
        sendMessageToWebsocket({ type: MESSAGE_TYPE_LAST_READ_IDX, groupId, lastReadIdx, changeType: CHANGE_TYPE_UPDATE });
    };

    const onmessage = async (data) => {
        const { type, view, updatedGroups, newMessages, watermark, lastUpdatedAtMs } = data;
        cnsole.info(new Date(), 'onmessage: ', { type, newW: watermark, curw: state.watermark, oldTs: state.lastUpdatedAtMs, newTs: lastUpdatedAtMs });
        if (type === TYPE_UPDATE || type === TYPE_INITIAL) {
            await AsyncStorage.setItem(WATERMARK_KEY, '' + watermark);
            await AsyncStorage.setItem(LAST_UPDATED_AT, '' + lastUpdatedAtMs);

            state.watermark = watermark;
            state.lastUpdatedAtMs = lastUpdatedAtMs;
            cnsole.info('Acking watermark: ', watermark, lastUpdatedAtMs);
            sendMessageToWebsocket({ type: MESSAGE_TYPE_ACK, watermark, lastUpdatedAtMs });
        }

        if (type === TYPE_INITIAL) {
            receiver.onView(view);
        }
        if (type === TYPE_UPDATE) {
            const queueDelayMs = newMessages.length > 0 ? new Date().getTime() - parseInt(newMessages[newMessages.length - 1].timestamp) : 0;
            receiver.onUpdate({ updatedGroups, newMessages, queueDelayMs });
            if (newMessages.length > 0) {
                cnsole.info('queueDelayMs: ', queueDelayMs);
            }
        }
    };

    // TODO: Handle socket not connected
    const sendMessageToWebsocket = (msg) => {
        state.websocket.send(JSON.stringify(msg));
    };

    const openWebsocket = (resolve) => {
        const url = format('{}/helochat?watermark={}&roleId={}&lastUpdatedAtMs={}', WEBSOCKET_URL, state.watermark, state.userId, state.lastUpdatedAtMs);
        state.websocket = new WebSocket(url, 'chat-protocol');
        state.websocket.onopen = () => {
            cnsole.info('onopen');
            resolve(true);
        };

        state.websocket.onmessage = (e) => {
            const msg = JSON.parse(e.data || '{}');
            cnsole.info('Message received:', e.data.length, ' bytes ', msg.type);
            onmessage(msg);
        };

        state.websocket.onclose = (e) => {
            cnsole.info('Socket is closed :', e);
            resolve(false);
            reconnect();
        };

        state.websocket.onerror = (e) => {
            cnsole.error('Socket encountered error, closing: ', e.message, e);
            state.websocket.close();
            resolve(false);
        };
    };

    const reconnect = (resolve) => {
        const cbFn = resolve || noOpFn;
        cnsole.info('Reconnecting in: ', state.reconnectDelay);
        setTimeout(() => openWebsocket(cbFn), state.reconnectDelay);
        state.reconnectDelay = Math.min(MAX_RECONNECT_DELAY_MS, 2 * state.reconnectDelay);
    };

    // state.createInitialSet();
    reconnect((success) => {
        if (success) {
            sendMessageToWebsocket(['helo']);
        }
    });

    return {
        sendMessage,
        deleteMessage,
        forwardMessage,
        createGroup,
        updateGroup,
        updateProfile,
        updateLastReadIdx,
    };
};

const createInitialSet = async () => {
    const NUM_MEMBERS = 1000;
    const NUM_MESSAGES = 20000;
    const NUM_GROUPS = 1000;
    const NUM_MEMBERS_PER_GROUP = 100;

    for (let i = 0; i < NUM_MESSAGES; i++) {
        const groupId = Math.floor(NUM_GROUPS * Math.random());
        const payload = {
            type: 'TEXT',
            text: 'message ' + i,
        };
        await crudsCreate(DESCRIPTOR_HELO_CHAT_MESSAGE, { groupId, index: i, timestamp: new Date().getTime(), changeType: 'ADD', payload });
    }

    const now = new Date().getTime();
    for (let i = 0; i < NUM_GROUPS; i++) {
        const members = xrange(0, NUM_MEMBERS_PER_GROUP).toArray().map(x => Math.floor(NUM_MEMBERS * Math.random()));
        await crudsCreate(DESCRIPTOR_HELO_GROUP, { type: 'GROUP', name: 'Group-' + i, organization: 'Helo', members,
                                                        metadata: { createdAt: now, updatedAt: now } });
    }
};

const MAX_RECONNECT_DELAY_MS = 5 * 1000;
const LAST_UPDATED_AT = 'HeloChatClient.lastUpdatedAt';
const WATERMARK_KEY   = 'HeloChatClient.watermark';
const DEFAULT_PROPS = [
    { type: 'ALLOW_CHAT_BOT_PROMPT_FOR_JOBS', value: false, },
    { type: 'HAS_ANALYTICS', value: true, },
    { type: 'IS_ADMIN_POSTING', value: true, },
    { type: 'IS_PRIVATE', value: true, },
    { type: 'SHOW_MEMBER_ADD_NOTIFICATIONS', value: true, },
    { type: 'HYPERLOCAL_CONTENT', value: false, },
];
