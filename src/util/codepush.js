import {Platform} from 'react-native';
import Toast from 'react-native-simple-toast';
import codePush from 'react-native-code-push';
import semver from 'semver';
import cnsole from 'loglevel';
import {APP_VERSION} from '../../moduleSrc/constants/Constants';


// CODEPUSH
export const PLATFORM_ANDROID = 'android';
export const PLATFORM_IOS = 'ios';
export const CODEPUSH_DEPLOYMENT_KEY_ANDROID = '8229lhmVs_dwtIVO9IIyI8Ss0DZ1p255Eua-3';
export const CODEPUSH_DEPLOYMENT_KEY_IOS = '';
export const CODEPUSH_DEPLOYMENT_KEY = Platform.OS === PLATFORM_ANDROID ? CODEPUSH_DEPLOYMENT_KEY_ANDROID : CODEPUSH_DEPLOYMENT_KEY_IOS;

export const checkForCodepushUpdateAsync = async () => {
    cnsole.info('Current app version: ', APP_VERSION);
    cnsole.info('Checking for codepush update !');

    // Check for Codepush app update.
    try {
        const fn = (update) => cnsole.info('handleBinaryVersionMismatchCallback: ', update);
        const update = await codePush.checkForUpdate(CODEPUSH_DEPLOYMENT_KEY, fn);
        const isUpdated = await handleUpdate(update);

        if (isUpdated) {
            Toast.show('App updated !', Toast.LONG);
        }
    } catch (e) {
        cnsole.error('Codepush update failed: ', e);
    }

    // Notify to codepush that current update version was successful after a small delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    cnsole.info('codePush.notifyAppReady:');
    await codePush.notifyAppReady();
};

const handleUpdate = async (update) => {
    const currentVersion = APP_VERSION;
    cnsole.info('currentVersion: ', currentVersion);
    if (update != null) {
        delete update['deploymentKey'];                         // Secret - should not be exposed
        cnsole.info('Code push remote package: ', update);

        const desc = update['description'];
        let newVersion;
        if (desc.toLowerCase().startsWith('version ')) {
            newVersion = desc.split(' ')[1];
            cnsole.info('newVersion: ', newVersion);
        } else {
            cnsole.warn('Could not infer version number from description. Ignoring codepush');
            return false;
        }

        if (currentVersion === newVersion) {
            cnsole.info('Exact same version. Ignoring codepush');
            return false;
        }
        if (semver.major(currentVersion) !== semver.major(newVersion)) {
            cnsole.info('Major version mismatch. Ignoring codepush');
            return false;
        }
        if (semver.lt(newVersion, currentVersion)) {
            cnsole.info('Older version. Ignoring codepush');
            return false;
        }

        Toast.show('There\'s a hotfix available, installing', Toast.LONG);

        // Update the app
        await new Promise(resolve => setTimeout(resolve, 50));
        const status = await codePush.sync({
            updateDialog: !desc.toLowerCase().includes('force-update-do-not-ask'),
            installMode: codePush.InstallMode.IMMEDIATE,
        });
        cnsole.info('codepush install status: ', status);

        return status === codePush.SyncStatus.UPDATE_INSTALLED;
    } else {
        cnsole.warn('Code push remote package: null');
    }
    return false;
};
