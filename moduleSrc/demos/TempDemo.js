import React from "react";
import {spacer, Text, View} from "../util/Util";
import semver from 'semver';
import cnsole from 'loglevel';
import {Switch} from "../platform/Util";


export class TempDemo extends React.Component {
    static URL = '/demos/temp';

    render() {
        const v1 = '1.0.2';
        const v2 = '1.0.3';
        cnsole.info('v1, v2:', v1, v2);

        const t1 = semver.major(v1) !== semver.major(v2) ? 'Major version mismatch. Ignoring codepush' : '';
        const t2 = semver.lt(v1, v2) ? 'Older version. Ignoring codepush' : '';
        cnsole.info('t1, t2: ', t1, t2);

        const val = true;
        const cbFn = () => {};
        const disabled = true;
        return (
            <View style={{  }}>
                <Switch size="medium" checked={true} onChange={cbFn} disabled={true} />
                {spacer(20)}
                <Switch size="medium" checked={true} onChange={cbFn} disabled={false} />
                {spacer(20)}
                <Switch size="medium" checked={false} onChange={cbFn} disabled={true} />
                {spacer(20)}
                <Switch size="medium" checked={false} onChange={cbFn} disabled={false} />
                {spacer(20)}

                <Text>{t1}</Text>
                <Text>{t2}</Text>
            </View>
        );
    }
}
