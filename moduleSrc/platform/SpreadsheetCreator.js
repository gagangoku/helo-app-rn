import React from "react";
import {firebase} from "@firebase/app";
import {getGroupInfo, sendMessageToGroup, showToast} from "../util/Util";
import {OUTPUT_EXCEL} from "../chat/Questions";
import {Spreadsheet} from "./Spreadsheet";
import window from "global";


export class SpreadsheetCreator extends React.PureComponent {
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

        showToast('Creating spreadsheet');
        await sendMessageToGroup({ me, ipLocation: null, idToDetails, docRef, groupInfo, groupId, updateLastReadIdx: null,
                                   text: '', type: OUTPUT_EXCEL, excel: payload });
        window.close();
    };

    render() {
        return (
            <Spreadsheet mode={Spreadsheet.MODE_EDITING} submitFn={this.submitFn} />
        );
    }
}
