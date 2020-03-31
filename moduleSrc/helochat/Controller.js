import React from "react";
import {HeloChatClient} from "./HeloChatClient";


export class Controller extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    async componentDidMount() {
        const userId = 1;
        this.client = await HeloChatClient({ userId, receiver: this });
    }

    onView = (view) => {
        // View is an array of items
        // Each item = { groupId, photo, title, subheading, timestamp, changeType, payload, numMessagesSinceLastWatermark }
    };
    onUpdate = ({ updatedGroups, newMessages, queueDelayMs }) => {
    };
}
