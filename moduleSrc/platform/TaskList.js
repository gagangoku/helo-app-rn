import React from "react";
import {TaskListUI} from "../widgets/TaskListUI";


export class TaskList extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return <TaskListUI {...this.props} />;
    }
}
