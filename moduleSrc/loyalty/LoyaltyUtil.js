import {getDateToday, parseDate} from "../util/Util";
import {crudsSearch, crudsUpdate, getKeyFromKVStore, setKeyValueFromKVStore} from "../util/Api";
import {
    DESCRIPTOR_GOLD_CODE,
    DESCRIPTOR_GOLD_USER,
    DESCRIPTOR_USER_CHECKIN,
    GOLD_CODE_VALIDITY_MS,
    GOLD_TABLE_CHECKIN_EXPIRY_SEC,
    PHONE_NUMBER_KEY
} from "../constants/Constants";
import AsyncStorage from "@callstack/async-storage";
import format from 'string-format';


export const REASON_CODE_DOESNT_EXIST = 'Code doesnt exist';
export const REASON_INCORRECT_ESTABLISHMENT_OR_BRANCH = 'Incorrect establishment or branch';
export const REASON_CODE_ALREADY_REDEEMED_BY_CUSTOMER = 'Code already redeemed';
export const REASON_CODE_EXPIRED = 'Code expired';
export const REASON_ALREADY_AVAILED_OFFER_BEFORE = 'Already availed offer before';
export const REASON_ALREADY_REDEEMED_AT_TABLE = 'Already redeemed at table';

export const validateCode = async (code, establishmentId, branchId) => {
    const values = await crudsSearch(DESCRIPTOR_GOLD_CODE, { code });
    console.log('DEBUG validateCode: ', code, values);
    if (!values || values.length === 0) {
        return { success: false, reason: REASON_CODE_DOESNT_EXIST };
    }
    if (values[0].establishmentId !== establishmentId || values[0].branchId !== branchId) {
        return { success: false, reason: REASON_INCORRECT_ESTABLISHMENT_OR_BRANCH };
    }

    const { isRedeemed, timestamp } = values[0];
    if (isRedeemed) {
        return { success: false, reason: REASON_CODE_ALREADY_REDEEMED_BY_CUSTOMER, details: values[0] };
    }

    if (timestamp < new Date().getTime() - GOLD_CODE_VALIDITY_MS) {
        return { success: false, reason: REASON_CODE_EXPIRED, details: values[0] };
    }

    return { success: true, code: values[0] };
};



// Check if an offer already hasn't been redeemed today
// TODO: Make it generic for other establishments
export const validateOfferForUser = async (userId, offerId) => {
    const todayStartTimestamp = parseDate(getDateToday()).getTime();
    let redeemedCodes = (await crudsSearch(DESCRIPTOR_GOLD_CODE, { userId, timestampGT: todayStartTimestamp })) || [];
    console.log('DEBUG validateOfferForUser: ', userId, redeemedCodes);
    redeemedCodes = redeemedCodes.filter(o => !!o.isRedeemed);
    console.log('DEBUG validateOfferForUser post filter: ', userId, redeemedCodes);

    if (redeemedCodes.length > 0) {
        // User has redeemed an offer today
        return { success: false, reason: REASON_ALREADY_AVAILED_OFFER_BEFORE, details: redeemedCodes[0] };
    }

    // TODO: Check if user is authorized to avail this offer
    return { success: true };
};

export const redeemOffer = async ({ code, codeObj, userId, offerId, tableId, establishmentId, branchId, force }) => {
    // NOTE: This assumes only 1 redeem per table
    const redeems = await activeRedeemsAtTable(tableId, establishmentId, branchId);
    if (redeems.length > 0 && !force) {
        // Already have some redeems at this table
        return { success: false, reason: REASON_ALREADY_REDEEMED_AT_TABLE, details: redeems };
    }

    // Force mode. Close all active redeems
    if (redeems.length > 0 && force) {
        await markRedeemAsClosed(redeems);
    }

    const key = TABLE_REDEEMS_KEY(tableId, establishmentId, branchId);
    try {
        let rsp = await setKeyValueFromKVStore(key, code + '', GOLD_TABLE_CHECKIN_EXPIRY_SEC);
        console.log('DEBUG redeemOffer: ', code, rsp);
        if (rsp === 'ok') {
            const updated = {...codeObj, isRedeemed: true, details: {...(codeObj.details || {}), tableId, redeemedAt: new Date().getTime()}};
            rsp = await crudsUpdate(DESCRIPTOR_GOLD_CODE, updated.id, updated);
            if (rsp === 'done') {
                return { success: true };
            }
        }
    } catch (e) {
        console.log('Exception in saving table active: ', e);
    }
    return { success: false };
};

// NOTE: This is important. We don't want to be too strict here, otherwise there might be too many escalations
// We set a TTL of about 10 hours on
const activeRedeemsAtTable = async (tableId, establishmentId, branchId) => {
    const key = TABLE_REDEEMS_KEY(tableId, establishmentId, branchId);

    try {
        const value = await getKeyFromKVStore(key);
        console.log('DEBUG activeRedeemsAtTable: ', key, value);
        return !value ? [] : value.split(',');
    } catch (e) {
        console.log('Exception in getting active redeems: ', e);
        return [];
    }
};

export const getGoldUserDetailsFromPhone = async (establishmentId, branchId) => {
    const phone = await AsyncStorage.getItem(PHONE_NUMBER_KEY);
    console.log('Got phone: ', phone);
    if (!phone) {
        return {};
    }

    // Lookup Gold user
    const goldUserList = await crudsSearch(DESCRIPTOR_GOLD_USER, { phone });
    console.log('Got goldUserList: ', goldUserList);
    if (goldUserList && goldUserList.length > 0) {
        const { id, name } = goldUserList[0];

        // Get checkins across all branches
        const userCheckins = await getUserCheckins(id, establishmentId);
        const points = calculatePoints(userCheckins);
        return { phone, id, name, userCheckins, points };
    }

    return { phone };
};

// TODO: Add time dimension (last month etc.) based on the establishmentId
export const getUserCheckins = async (userId, establishmentId) => {
    const userCheckins = (await crudsSearch(DESCRIPTOR_USER_CHECKIN, { userId, establishmentId })) || [];
    console.log('DEBUG userCheckins: ', userCheckins);
    return userCheckins;
};

export const calculatePoints = (userCheckins) => {
    let points = 0;
    userCheckins.forEach(c => {
        if (c.details && c.details.billAmount) {
            points += parseInt(c.details.billAmount);
        } else {
            points += 100;
        }
    });
    console.log('DEBUG  points: ', points);
    return points;
};

const TABLE_REDEEMS_KEY = (tableId, establishmentId, branchId) => format('/gold/table:{}/establishment:{}/branch:{}/redeems', tableId, establishmentId, branchId);
const markRedeemAsClosed = async (redeems) => {
    // Nothing to do for now
};
