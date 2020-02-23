import {Platform, ToastAndroid as Toast} from 'react-native';
import codePush from 'react-native-code-push';
import semver from 'semver';
import cnsole from 'loglevel';
import {APP_VERSION} from '../../moduleSrc/constants/Constants';


// CODEPUSH
const handleUpdate = (update) => {
    const currentVersion = APP_VERSION;
    cnsole.info('currentVersion: ', currentVersion);
    if (update != null) {
        delete update['deploymentKey'];                         // Secret - should not be exposed
        cnsole.info('Code push remote package: ', update);

        let desc = update['description'];
        let newVersion;
        if (desc.toLowerCase().startsWith('version ')) {
            newVersion = desc.split(' ')[1];
            cnsole.info('newVersion: ', newVersion);
        } else {
            cnsole.warn('Could not infer version number from description. Ignoring codepush');
            return;
        }

        if (currentVersion === newVersion) {
            cnsole.info('Exact same version. Ignoring codepush');
            return;
        }
        if (semver.major(currentVersion) !== semver.major(newVersion)) {
            cnsole.info('Major version mismatch. Ignoring codepush');
            return;
        }
        if (semver.lt(newVersion, currentVersion)) {
            cnsole.info('Older version. Ignoring codepush');
            return;
        }

        Toast.show('There\'s a hotfix available, installing', Toast.LONG);
        setTimeout(() => {
            codePush.sync({
                updateDialog: !desc.toLowerCase().includes('force-update-do-not-ask'),
                installMode: codePush.InstallMode.IMMEDIATE,
            });
        }, 200);
    } else {
        cnsole.warn('Code push remote package: null');
    }
};
export const checkForCodepushUpdateAsync = () => {
    cnsole.info('current app version: ', APP_VERSION);
    cnsole.info('Checking for codepush update !');

    // Check for Codepush app update.
    codePush.checkForUpdate(CODEPUSH_DEPLOYMENT_KEY, (update) => {cnsole.info('handleBinaryVersionMismatchCallback: ', update)})
        .then((update) => {
            handleUpdate(update);
        })
        .catch((reason) => {
            cnsole.error('Codepush update failed: ', reason);
        });
};

// Notify to codepush that current update version was successful.
export const codepushNotifyAppReady = () => {
    cnsole.info('codePush.notifyAppReady:');
    codePush.notifyAppReady();
};


export const PLATFORM_ANDROID = 'android';
export const PLATFORM_IOS = 'ios';
export const CODEPUSH_DEPLOYMENT_KEY_ANDROID = '8229lhmVs_dwtIVO9IIyI8Ss0DZ1p255Eua-3';
export const CODEPUSH_DEPLOYMENT_KEY_IOS = '';
export const CODEPUSH_DEPLOYMENT_KEY = Platform.OS === PLATFORM_ANDROID ? CODEPUSH_DEPLOYMENT_KEY_ANDROID : CODEPUSH_DEPLOYMENT_KEY_IOS;
