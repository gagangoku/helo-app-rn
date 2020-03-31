import {createQueue} from "../util/Util";


export const groupsJobQ = createQueue({ name: 'groupsJobQ' });
export const chatsJobQ = createQueue({ name: 'chatsJobQ' });
export const detailsLookupQ = createQueue({ name: 'detailsLookupQ' });
export const trainingModulesQ = createQueue({ name: 'trainingModulesQ' });
