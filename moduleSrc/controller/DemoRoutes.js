import {Route} from "react-router-dom";
import React from "react";
import ChatDemo from "../demos/ChatDemo";
import GroupListDemo from "../demos/GroupListDemo";
import SpeechRecognitionDemo from "../demos/SpeechRecognitionDemo";
import PushNotifDemo from "../demos/PushNotifDemo";
import TruecallerDemo from "../demos/TruecallerDemo";
import {TopBarDemo} from "../demos/TopBarDemo";


const steps = [
    ChatDemo,
    GroupListDemo,
    SpeechRecognitionDemo,
    PushNotifDemo,
    TruecallerDemo,
    TopBarDemo,
];
export const routes = steps.flatMap(x => {
    const urls = x.URLS ? x.URLS : [x.URL];
    return urls.map(y => <Route exact path={y} component={x} key={y} />);
});
