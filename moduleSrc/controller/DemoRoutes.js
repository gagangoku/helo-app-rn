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
export const routes = (steps.map(x => <Route exact path={x.URL} component={x} key={x.URL} />));
