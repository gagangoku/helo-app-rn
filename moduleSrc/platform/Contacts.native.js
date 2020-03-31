import Contacts from 'react-native-contacts';
import cnsole from 'loglevel';
import {AsyncStorage} from "./Util";
import {CONTACTS_STORED_KEY} from "../constants/Constants";
import {PermissionsAndroid} from 'react-native';


export const getAndStoreAllContacts = async (saveToDisk) => {
    cnsole.info('Getting all contacts');
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        'title': 'Contacts',
        'message': 'Helo would needs to view your contacts.',
        'buttonPositive': 'Please accept bare mortal'
    });
    cnsole.info('Contacts permission: ', result);
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        cnsole.info('Contacts permission denied');
        return [];
    }

    const startTimeMs = new Date().getTime();
    return await new Promise(resolve => {
        try {
            Contacts.getAll(async (err, contacts) => {
                if (err) {
                    cnsole.warn('Error reading contacts: ', err);
                    resolve([]);
                    return;
                }

                // contacts returned
                const timeTakenMs = new Date().getTime() - startTimeMs;
                cnsole.info('contacts returned: ', { len: contacts.length, timeTakenMs });

                if (saveToDisk) {
                    await AsyncStorage.setItem(CONTACTS_STORED_KEY, JSON.stringify(contacts));
                }
                resolve(contacts);
            });
        } catch (e) {
            cnsole.warn('Error in contacts: ', e);
            resolve([]);
        }
    });
};
