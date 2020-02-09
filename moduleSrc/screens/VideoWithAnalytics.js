import React from "react";
import {differenceFn, getUrlParam, View} from "../util/Util";
import xrange from 'xrange';
import format from 'string-format';
import {hmgetKeysFromKVStore, hsetKeyFromKVStore} from "../util/Api";
import {VIDEO_ANALYTICS_INTERVAL_SECONDS} from "../constants/Constants";


export default class VideoWithAnalytics extends React.PureComponent {
    static URL = '/video-analytics';
    constructor(props) {
        super(props);
        this.state = {
        };

        const videoUrl = getUrlParam('videoUrl');
        const collection = getUrlParam('collection');
        const groupId = getUrlParam('groupId');
        const user = getUrlParam('user');
        const idx = getUrlParam('idx');
        this.detailsObj = { videoUrl, collection, groupId, user, idx };

        this.lastTime = 0;
        this.watchMap = {
            lastUpdatedAtMs: -1,
            map: {},
        };
        this.lastObjToUpdate = {};
    }

    async componentDidMount() {
        this.intervalId = setInterval(this.sync, UPDATE_INTERVAL_MS);
        const { videoUrl, collection, groupId, user, idx } = this.detailsObj;

        if (groupId && user && idx) {
            const hash = format('/analytics/group/{}', groupId);
            const key = format('/idx/{}/user/{}', idx, user);
            const rsp = await hmgetKeysFromKVStore(hash, [key]);
            const val = rsp[key];
            console.log('rsp: ', rsp, val);
            if (val) {
                const { compressed, lastUpdatedAtMs } = JSON.parse(val);
                compressed.forEach(([a,b]) => {
                    xrange(a, b+1).forEach(x => this.watchMap.map[x] = 1);
                });
                this.watchMap.lastUpdatedAtMs = lastUpdatedAtMs;
                this.lastObjToUpdate = { compressed, lastUpdatedAtMs };
                console.log('updated this.watchMap: ', this.watchMap);
            }
        }
    }

    sync = async () => {
        const keys = Object.keys(this.watchMap.map).map(x => parseInt(x)).sort(differenceFn);
        const compressed = [];
        if (keys.length > 0) {
            let prev = keys[0];
            let start = prev;
            compressed.push([start, start]);
            for (let i = 1; i < keys.length; i++) {
                const current = keys[i];
                if (current !== (prev + 1)) {
                    compressed.push([current, current]);
                    start = current;
                } else {
                    compressed[compressed.length - 1][1] = current;
                }
                prev = current;
            }
        }

        const str = compressed.map(([a,b]) => a + '-' + b).join(',');
        let numKeys = 0;
        compressed.forEach(([a,b]) => numKeys += b-a+1);
        console.log('this.watchMap duration: ', VIDEO_ANALYTICS_INTERVAL_SECONDS * numKeys, str, this.watchMap.lastUpdatedAtMs);

        const { videoUrl, collection, groupId, user, idx } = this.detailsObj;
        if (groupId && user && idx) {
            const hash = format('/analytics/group/{}', groupId);
            const key = format('/idx/{}/user/{}', idx, user);

            const objToUpdate = { compressed, lastUpdatedAtMs: this.watchMap.lastUpdatedAtMs, duration: this.duration };
            if (objToUpdate.lastUpdatedAtMs !== this.lastObjToUpdate.lastUpdatedAtMs) {
                console.log('Updating: ', objToUpdate);
                await hsetKeyFromKVStore(hash, key, JSON.stringify(objToUpdate));
            }
            this.lastObjToUpdate = objToUpdate;
        }
    };

    onTimeUpdate = (elem) => {
        const { videoUrl, collection, groupId, user, idx } = this.detailsObj;
        const currentTime = elem.target.currentTime;
        const duration = elem.target.duration;
        // console.log('[analytics] onTimeUpdate audio: ', collection, groupId, idx, user, currentTime, duration, elem.target);

        const diff = currentTime - this.lastTime;
        if (diff >= 0 && diff <= 4 * VIDEO_ANALYTICS_INTERVAL_SECONDS) {
            // Most likely the next frame
            const s = currentTime - diff;
            const e = currentTime;
            const idx1 = Math.floor(s / VIDEO_ANALYTICS_INTERVAL_SECONDS);
            const idx2 = Math.ceil(e / VIDEO_ANALYTICS_INTERVAL_SECONDS);
            const array = xrange(idx1, idx2+1).toArray();
            const numSet = array.filter(x => this.watchMap.map[x] !== 1).length;
            array.forEach(x => this.watchMap.map[x] = 1);
            if (numSet > 0) {
                this.watchMap.lastUpdatedAtMs = new Date().getTime();
            }
        }
        this.lastTime = currentTime;
        this.duration = duration;
    };

    render () {
        const { videoUrl } = this.detailsObj;
        return (
            <View style={{ height: '100%', width: '100%', backgroundColor: '#000000', paddingTop: 10,
                           display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                <video style={{ objectFit: 'fill', maxHeight: '95vh', maxWidth: '95vh' }} controls={true} autoPlay={true} onTimeUpdate={this.onTimeUpdate}>
                    <source src={videoUrl} type="video/mp4"/>
                    Your browser does not support the video tag.
                </video>
                <View style={{ width: '100%', height: '5vh', backgroundColor: '#000000' }} />
            </View>
        );
    }
}

const UPDATE_INTERVAL_MS = 5000;
