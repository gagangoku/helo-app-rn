import {
    ADD_JOB_REQUIREMENT_API,
    ALL_CUSTOMER_NAMES_API,
    ALL_SUPPLY_NAMES_API,
    ALL_VISITOR_NAMES_API,
    API_URL,
    APPLY_FOR_NEW_JOB_API,
    CRUDS_CREATE_API,
    CRUDS_READ_API,
    CRUDS_SEARCH_API,
    CRUDS_UPDATE_API,
    CUSTOMER_SEARCH_API,
    DELETE_JOB_REQUIREMENT_API,
    DESCRIPTOR_CUSTOMER,
    DESCRIPTOR_JOB_REQUIREMENT,
    DETECT_TEXT_IN_IMAGE_API,
    DETECT_TEXT_IN_PDF_API,
    EXOTEL_CONNECT_API,
    FIRESTORE_INIT_CHANNEL_API,
    GET_JOB_ATTRIBUTES_API,
    GET_NEW_JOBS_API,
    GOOGLE_MAPS_API_KEY,
    KV_STORE_GET_API,
    KV_STORE_GET_SETMEMBERS_API,
    KV_STORE_HGETALL_API,
    KV_STORE_HMGET_API,
    KV_STORE_HSET_API,
    KV_STORE_MGET_API,
    KV_STORE_SET_API,
    LOG_DATA_API,
    LOOKUP_PERSON_DETAILS_BATCH_SIZE,
    MAID_RECOMMENDATION_API,
    NEW_CUSTOMER_SIGNUP_API,
    NEW_SUPPLY_SIGNUP_API,
    REJECT_JOB_API,
    SEND_OTP_TO_PHONE_API,
    SEND_SMS_API,
    SUPPLY_SEARCH_API,
    TRUECALLER_STATUS_API,
    UPDATE_DEVICE_ID_MAPPING_API,
    UPDATE_JOB_REQUIREMENT_API,
    VERIFY_OTP_API,
    X_AUTH_HEADER,
    X_AUTH_TOKEN
} from "../constants/Constants";
import format from "string-format";
import fetch from 'cross-fetch';
import {amPm, stripPII} from "./Util";
import window from "global";


export const getOtp = (phone, role, responseCb, errorCb) => {
    const url = API_URL + SEND_OTP_TO_PHONE_API + '?phoneNumber=' + phone + '&countryCode=91&role=' + role;
    _fetchUrl(url, {}, false, responseCb, errorCb);
};
export const verifyOtp = (phone, otp, responseCb, errorCb) => {
    const url = format(API_URL + VERIFY_OTP_API + '?phoneNumber={}&otp={}&countryCode=91&role=customer', phone, otp);
    _fetchUrl(url, {}, false, responseCb, errorCb);
};

export const giveMaidRecommendation = (obj, responseCb, errorCb) => {
    const url = API_URL + MAID_RECOMMENDATION_API + '?';
    _fetchUrl(url, obj, false, responseCb, errorCb, 'POST');
};

export const newCustomerSignup = async (obj) => {
    const url = format(API_URL + NEW_CUSTOMER_SIGNUP_API + '?countryCode=91&phone={}', obj.phoneNumber);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, obj, false, responseCb, errorCb, 'POST', h));
};

export const newSupplySignup = async (obj, forceUpdate) => {
    const url = format(API_URL + NEW_SUPPLY_SIGNUP_API + '?countryCode=91&phone={}&forceUpdate={}', obj.phoneNumber, forceUpdate);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, obj, false, responseCb, errorCb, 'POST', h));
};

export const getAllSupplyNames = async () => {
    const url = format(API_URL + ALL_SUPPLY_NAMES_API);
    const h = {};
    h[X_AUTH_HEADER] = X_AUTH_TOKEN;
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, true, responseCb, errorCb, 'GET', h));
};

export const crudsCreate = async (descriptor, obj) => {
    const url = format(API_URL + CRUDS_CREATE_API + '?descriptor={}', descriptor);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, obj, false, responseCb, errorCb, 'PUT', h));
};

export const crudsRead = async (descriptor, id) => {
    const url = format(API_URL + CRUDS_READ_API + '?descriptor={}&id={}', descriptor, id);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, true, responseCb, errorCb, 'GET', h));
};

export const crudsUpdate = async (descriptor, id, obj) => {
    const url = format(API_URL + CRUDS_UPDATE_API + '?descriptor={}&id={}', descriptor, id);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, obj, false, responseCb, errorCb, 'PUT', h));
};

export const crudsSearch = async (descriptor, obj) => {
    const url = format(API_URL + CRUDS_SEARCH_API + '?descriptor={}', descriptor);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, obj, true, responseCb, errorCb, 'POST', h));
};

export const getRecommendationsOfSupply = async (supplyId) => {
    return await crudsSearch('recommendation', { supplyId });
};

export const getSimilarSupply = async (supplyId) => {
    // TODO: Enable this after testing
    // const url = format(API_URL + GET_SIMILAR_PROFILES_API + '?supplyId={}&str=hi', supplyId);
    // return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, true, responseCb, errorCb, 'GET'));
    return { hello: 'world' };
};

export const searchSupply = async (obj) => {
    console.log('Searching for supply matching: ', obj);
    const url = format(API_URL + SUPPLY_SEARCH_API + '?' + Object.keys(obj).map(x => x + '=' + obj[x]).join('&'));
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, obj, true, responseCb, errorCb, 'GET', h));
};

export const searchCustomer = async (obj) => {
    console.log('Searching for customer matching: ', obj);
    const url = format(API_URL + CUSTOMER_SEARCH_API + '?' + Object.keys(obj).map(x => x + '=' + obj[x]).join('&'));
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, obj, true, responseCb, errorCb, 'GET', h));
};

export const getJobAttributes = async () => {
    const url = API_URL + GET_JOB_ATTRIBUTES_API;
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, true, responseCb, errorCb, 'GET'));
};

// TODO: Review use cases when strip is false. This is a security hole
export const getSupplyProfileById = async (id, strip=true) => {
    try {
        const supplyProfile = await crudsRead('supply', id);
        strip && stripPII(supplyProfile);
        return supplyProfile;
    } catch (e) {
        console.log('Exception in getting Supply profile: ', id, e);
        throw e;
    }
};

export const getApplicableJobs = async (supplyId) => {
    const url = format(API_URL + GET_NEW_JOBS_API + '?countryCode=91&supplyId={}', supplyId);
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, true, responseCb, errorCb));
};

export const getJobDetails = async (jobId) => {
    const jobReq = await crudsRead(DESCRIPTOR_JOB_REQUIREMENT, jobId);
    const customer = await crudsRead(DESCRIPTOR_CUSTOMER, jobReq.customerId);

    const fromHr = jobReq.workingHours[0].fromHr;
    const toHr = jobReq.workingHours[0].toHr || fromHr;
    const budget = jobReq.budget;
    const hoursWork = parseInt(toHr) - parseInt(fromHr);
    return {
        area: jobReq.location.area,
        distanceMeters: 1000,
        fromPrice: Math.max(0, budget - 500),
        toPrice: Math.max(0, budget + 500),
        timeFrom: amPm(fromHr),
        hoursWork,

        customer,
        jobRequirement: jobReq,
    };
};

export const applyForJob = async (supplyId, jobReqId) => {
    const url = format(API_URL + APPLY_FOR_NEW_JOB_API + '?countryCode=91&supplyId={}&jobReqId={}', supplyId, jobReqId);
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, false, responseCb, errorCb, 'PUT'));
};
export const rejectJob = async (supplyId, jobReqId) => {
    const url = format(API_URL + REJECT_JOB_API + '?countryCode=91&supplyId={}&jobReqId={}', supplyId, jobReqId);
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, false, responseCb, errorCb, 'PUT'));
};


const _fetchUrl = function(url, body, consumeJson, responseCb, errorCb, method, headers={}) {
    consumeJson = consumeJson || false;
    responseCb = responseCb || ((x) => {});
    errorCb = errorCb || ((x) => {});
    method = method || 'GET';
    console.log('Sending ', method, ' request to: ' + url);

    fetch(url, {
        method: method,
        body: method === 'GET' ? null : JSON.stringify(body),
        headers,
    }).then((response) => {
        console.log('response: ', response.status);
        if (response.status >= 400) {
            console.log('Bad response: ', response);
            errorCb(response);
        } else {
            const out = consumeJson ? response.json() : response.text();
            out.then((obj) => {
                // console.log('parsed response: ', obj);
                responseCb(obj);
            }).catch((ex) => {
                console.log('exception: ', ex);
                errorCb(ex);
            });
        }
    }).catch((ex) => {
        console.log('exception: ', ex);
        errorCb(ex);
    });
};


export const understandText = async (text, questionKey) => {
    // TODO: Fix this
    return {[questionKey]: text};
};

export const getJobsForDetails = async (obj) => {
    const url = format(API_URL + '/v1/new-jobs/getJobsByDetails?');
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, obj, true, responseCb, errorCb, 'POST'));
};

export const chatBotMessageInteraction = async (uuid, deviceID, obj) => {
    const url = format(API_URL + '/v1/chatbot/supply-onboarding/msg?uuid={}&deviceID={}', uuid, deviceID);
    const isDebug = window.location ? !window.location.origin.includes('heloprotocol.in') : false;
    if (isDebug) {
        // return false;
    }
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, obj, false, responseCb, errorCb, 'POST'));
};

export const getIPAddress = async (deviceID) => {
    const url = format(API_URL + '/v1/ip-address/get?deviceID={}', deviceID);
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, false, responseCb, errorCb, 'GET'));
};

export const getLocationFromIPAddress = async (deviceID) => {
    const startTimeMs = new Date().getTime();
    const url = format('https://www.googleapis.com/geolocation/v1/geolocate?key={}', GOOGLE_MAPS_API_KEY);
    const data = await new Promise((responseCb, errorCb) => _fetchUrl(url, { 'considerIp': true }, true, responseCb, errorCb, 'POST', {'Content-Type': 'application/json'}));
    console.log('getLocationFromIPAddress took: ', new Date().getTime() - startTimeMs);
    if (data && data.location) {
        return { latitude: data.location.lat, longitude: data.location.lng };
    }
    return {};
};

export const logDataToServer = async (obj) => {
    const url = format(API_URL + LOG_DATA_API + '?');
    await new Promise((responseCb, errorCb) => _fetchUrl(url, obj, false, responseCb, errorCb, 'POST'));
};


export const deleteJobReqId = async (customerId, jobReqId) => {
    const url = format(API_URL + DELETE_JOB_REQUIREMENT_API + '?customerId={}&jobReqId={}', customerId, jobReqId);
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, {}, false, responseCb, errorCb, 'POST'));
};
export const editJobReqId = async (customerId, jobReqId, req) => {
    const url = format(API_URL + UPDATE_JOB_REQUIREMENT_API + '?customerId={}&jobReqId={}', customerId, jobReqId);
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, req, false, responseCb, errorCb, 'POST'));
};
export const addJobReqId = async (customerId, req) => {
    const url = format(API_URL + ADD_JOB_REQUIREMENT_API + '?customerId={}', customerId);
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, req, false, responseCb, errorCb, 'POST'));
};

export const phoneConnectApi = async (customerId, supplyId, fromRole) => {
    const url = format(API_URL + EXOTEL_CONNECT_API + '?customerId={}&supplyId={}&fromRole={}', customerId, supplyId, fromRole);
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, false, responseCb, errorCb, 'GET'));
};
export const initiateFirestoreChannel = async (customerId, supplyId, sendIntro, initByCustomer) => {
    const url = format(API_URL + FIRESTORE_INIT_CHANNEL_API + '?customerId={}&supplyId={}&sendIntro={}&initByCustomer={}', customerId, supplyId, sendIntro, initByCustomer);
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, false, responseCb, errorCb, 'PUT'));
};


export const getPersonNamesByRoleId = async (roleIds) => {
    const customerIds = roleIds.filter(x => x.startsWith('cust')).map(x => parseInt(x.split(':')[1]));
    const supplyIds = roleIds.filter(x => x.startsWith('supply')).map(x => parseInt(x.split(':')[1]));
    const visitorIds = roleIds.filter(x => x.startsWith('visitor')).map(x => parseInt(x.split(':')[1]));

    const header = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    const map = {};

    if (supplyIds.length > 0) {
        const url = format(API_URL + ALL_SUPPLY_NAMES_API + '?supplyIds={}', supplyIds.join(','));
        const supplies = await new Promise((responseCb, errorCb) => _fetchUrl(url, null, true, responseCb, errorCb, 'GET', header));
        supplies.forEach(x => {
            map['supply:' + x.person.id] = x;
        });
    }
    if (customerIds.length > 0) {
        const url = format(API_URL + ALL_CUSTOMER_NAMES_API + '?customerIds={}', customerIds.join(','));
        const customers = await new Promise((responseCb, errorCb) => _fetchUrl(url, null, true, responseCb, errorCb, 'GET', header));
        customers.forEach(x => {
            map['cust:' + x.person.id] = x;
        });
    }
    if (visitorIds.length > 0) {
        const promises = [];
        const N = LOOKUP_PERSON_DETAILS_BATCH_SIZE;
        for (let i = 0; i < visitorIds.length; i += N) {
            const url = format(API_URL + ALL_VISITOR_NAMES_API + '?visitorIds={}', visitorIds.slice(i, i + N).join(','));
            const p = new Promise((responseCb, errorCb) => _fetchUrl(url, null, true, responseCb, errorCb, 'GET', header));
            promises.push(p);
        }
        const results = await Promise.all(promises);
        const visitors = results.flatMap(x => x);
        visitors.forEach(x => {
            const {id, name, deviceID, photo} = x;
            map['visitor:' + id] = {person: {id, name, deviceID, image: photo}};
        });
    }

    return map;
};

export const updateDeviceIDMapping = async (deviceID, phone, subscription) => {
    const url = format(API_URL + UPDATE_DEVICE_ID_MAPPING_API + '?deviceID={}&phone={}', deviceID, phone || '');
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, subscription, false, responseCb, errorCb, 'PUT', h));
};

export const getKeyFromKVStore = async (key) => {
    const url = format(API_URL + KV_STORE_GET_API + '?key={}', key);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, false, responseCb, errorCb, 'GET', h));
};

export const setKeyValueFromKVStore = async (key, value, ttlSec='') => {
    const url = format(API_URL + KV_STORE_SET_API + '?key={}&value={}&ttlSec={}', key, value, ttlSec);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, false, responseCb, errorCb, 'PUT', h));
};

export const getKeysFromKVStore = async (keys) => {
    const url = format(API_URL + KV_STORE_MGET_API);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, { keys: keys.join(',') }, true, responseCb, errorCb, 'POST', h));
};

export const hgetAllFromKVStore = async (hash) => {
    const url = format(API_URL + KV_STORE_HGETALL_API + '?hash={}', hash);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, true, responseCb, errorCb, 'GET', h));
};

export const hmgetKeysFromKVStore = async (hash, keys) => {
    const url = format(API_URL + KV_STORE_HMGET_API + '?hash={}', hash);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, keys, true, responseCb, errorCb, 'POST', h));
};

export const hsetKeyFromKVStore = async (hash, key, value) => {
    const url = format(API_URL + KV_STORE_HSET_API + '?hash={}&key={}&value={}', hash, key, encodeURIComponent(value));
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, false, responseCb, errorCb, 'PUT', h));
};

export const getSetMembersFromKVStore = async (keys) => {
    const url = format(API_URL + KV_STORE_GET_SETMEMBERS_API);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, { keys: keys.join(',') }, true, responseCb, errorCb, 'POST', h));
};

export const registerPushSubscription = async (deviceID, phone, subscription, isAlreadySubscribed) => {
    const url = format('/subscribe?deviceID={}&phone={}&isAlreadySubscribed={}', deviceID, phone || '', isAlreadySubscribed);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN, 'Content-Type': 'application/json'};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, subscription, false, responseCb, errorCb, 'POST', h));
};

export const sendNotificationToMembers = async (memberRoleIds, sender, message, iconUrl, clickUrl) => {
    const obj = { memberRoleIds, sender, message, iconUrl, clickUrl };
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN, 'Content-Type': 'application/json'};
    return await new Promise((responseCb, errorCb) => _fetchUrl('/sendNotificationToMembers', obj, false, responseCb, errorCb, 'POST', h));
};

export const getTruecallerStatus = async (requestId) => {
    const url = format(API_URL + TRUECALLER_STATUS_API + '?requestId={}', requestId);
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, false, responseCb, errorCb, 'GET'));
};

export const getGoldCode = async (obj) => {
    const url = format('/goldCode/generate?');
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN, 'Content-Type': 'application/json'};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, obj, true, responseCb, errorCb, 'POST', h));
};

export const verifyAndRedeemGoldCode = async (obj) => {
    const url = format('/goldCode/verifyAndRedeem?');
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN, 'Content-Type': 'application/json'};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, obj, true, responseCb, errorCb, 'POST', h));
};

export const sendSms = async (phoneNumber, message) => {
    const url = format(API_URL + SEND_SMS_API + '?phoneNumber={}&message={}', phoneNumber, encodeURIComponent(message));
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, {}, false, responseCb, errorCb, 'POST', h));
};

export const detectTextInImage = async (imgPath) => {
    const url = format(API_URL + DETECT_TEXT_IN_IMAGE_API + '?imgPath={}', imgPath);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, true, responseCb, errorCb, 'GET', h));
};

export const detectTextInPdf = async (filePath) => {
    const url = format(API_URL + DETECT_TEXT_IN_PDF_API + '?filePath={}', filePath);
    const h = {[X_AUTH_HEADER]: X_AUTH_TOKEN};
    return await new Promise((responseCb, errorCb) => _fetchUrl(url, null, true, responseCb, errorCb, 'GET', h));
};
