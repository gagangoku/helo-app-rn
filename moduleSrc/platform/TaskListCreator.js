import React from "react";
import {TaskListCreatorUI} from "../widgets/TaskListCreatorUI";
import {firebase} from "@firebase/app";
import {getGroupInfo, sendMessageToGroup} from "../util/Util";
import {OUTPUT_TASK_LIST} from "../chat/Questions";
import window from 'global';


export class TaskListCreator extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    submitFn = async (payload) => {
        const { me, groupId, collection } = this.props;
        const db = firebase.firestore();
        const docRef = db.collection(collection).doc(groupId);
        const doc = await docRef.get();
        const groupInfo = getGroupInfo(doc.data(), doc);

        const idToDetails = {[me.sender]: { person: {...me} }};

        await sendMessageToGroup({ me, ipLocation: null, idToDetails, docRef, groupInfo, groupId, updateLastReadIdx: null,
                                   text: '', type: OUTPUT_TASK_LIST, taskList: payload });
        window.close();
    };

    render() {
        return (
            <TaskListCreatorUI {...this.props} submitFn={this.submitFn} />
        );
    }
}
