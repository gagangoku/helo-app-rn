import branch from 'react-native-branch';
import cnsole from 'loglevel';
import {getNavigationObject} from "../router/NavigationRef";
import {goToChatFnReset} from "./Navigators.native";
import {COLLECTION_BOTS, FIREBASE_GROUPS_DB_NAME} from "../constants/Constants";
import {executeOrQueueBranchAction, observeGroupByInvite} from "../router/InternalState.native";


export const initBranch = () => {
    branch.initSessionTtl = 10000;      // Set to 10 seconds
    branch.subscribe(({ error, params }) => {
        cnsole.info('Branch called: ', error, params);
        if (error) {
            cnsole.error('Error from Branch: ' + error);
            return
        }


        // params will never be null if error is null
        const { bot, group, collection } = params;
        cnsole.info('Branch: Got group: ', group, bot, collection);
        if (bot) {
            // Goto bot page
            executeOrQueueBranchAction(() => {
                cnsole.info('Branch: Navigating to bot: ', bot);
                const navigation = getNavigationObject();
                goToChatFnReset({ data: { doc: { collection: COLLECTION_BOTS, groupId: bot } }, navigation });
            });
            return;
        }
        if (group) {
            // Take to group page.
            executeOrQueueBranchAction(() => {
                observeGroupByInvite(group);

                const collection = params.collection || FIREBASE_GROUPS_DB_NAME;
                cnsole.info('Branch: Navigating to group: ', group);
                const navigation = getNavigationObject();
                goToChatFnReset({ data: { doc: { collection, groupId: group }, branchInvite: true }, navigation });
            });
            return;
        }

        if (params['+non_branch_link']) {
            const nonBranchUrl = params['+non_branch_link'];
            // Route non-Branch URL if appropriate.
            return;
        }

        if (!params['+clicked_branch_link']) {
            // Indicates initialization success and some other conditions.
            // No link was opened.
            return;
        }

        // A Branch link was opened.
        // Route link based on data in params.
    });
};
