import {Route} from "react-router-dom";
import React from "react";
import ChatDemo from "../demos/ChatDemo";
import GroupListDemo from "../demos/GroupListDemo";
import SpeechRecognitionDemo from "../demos/SpeechRecognitionDemo";
import PushNotifDemo from "../demos/PushNotifDemo";
import TruecallerDemo from "../demos/TruecallerDemo";
import {TopBarDemo} from "../demos/TopBarDemo";
import {TempDemo} from "../demos/TempDemo";
import StringParsingDemo from "../demos/StringParsingDemo";
import {FlatbufferDemo} from "../demos/FlatbufferDemo";
import {ChattyDemo} from "../demos/ChattyDemo";
import {ChattyLoadtest} from "../demos/ChattyLoadtest";
import {ParseImage} from "../demos/ParseImage";


const steps = [
    ParseImage,
    ChatDemo,
    ChattyDemo,
    ChattyLoadtest,
    FlatbufferDemo,
    StringParsingDemo,
    GroupListDemo,
    SpeechRecognitionDemo,
    PushNotifDemo,
    TruecallerDemo,
    TopBarDemo,
    TempDemo,
];
export const routes = steps.flatMap(x => {
    const urls = x.URLS ? x.URLS : [x.URL];
    return urls.map(y => <Route exact path={y} component={x} key={y} />);
});
