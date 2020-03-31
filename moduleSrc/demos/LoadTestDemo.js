import * as React from "react";
import {AsyncStorage, View} from "../platform/Util";
import xrange from "xrange";
import cnsole from "loglevel";
import SQLite from "react-native-sqlite-storage";


export class LoadTestDemo extends React.PureComponent {
    async componentDidMount() {
        const objs = this.prepareLoadTest(NUM_ITER, OBJ_SIZE);
        this.loadTest_AsyncStorage(objs);
        this.loadTest_Serialize(objs);
        this.loadTest_SQLite(objs);
    }

    prepareLoadTest = (NUM_ITER, OBJ_SIZE) => {
        const t1 = new Date().getTime();
        const objs = xrange(0, NUM_ITER).toArray().map(x => {
            const obj = {};
            xrange(0, OBJ_SIZE).toArray().forEach(i => {
                obj[i + ''] = Math.random() * 100;
            });
            return obj;
        });
        const t2 = new Date().getTime();
        cnsole.info('Time taken in generating objects = ', t2 - t1);

        return objs;
    };

    loadTest_AsyncStorage = async (objs) => {
        const t2 = new Date().getTime();
        for (let i = 0; i < objs.length; i++) {
            await AsyncStorage.setItem('key-' + i, JSON.stringify(objs[i]));
        }
        const t3 = new Date().getTime();
        cnsole.info('Time taken in saving to AsyncStorage = ', t3 - t2);

        const array = [];
        for (let i = 0; i < objs.length; i++) {
            const a = await AsyncStorage.getItem('key-' + i);
            array.push(a);
        }
        const t4 = new Date().getTime();
        cnsole.info('Time taken in reading from AsyncStorage = ', t4 - t3);
        cnsole.info('array.length: ', array.length);
    };

    loadTest_Serialize = async (objs) => {
        const arr = [];
        const t2 = new Date().getTime();
        for (let i = 0; i < objs.length; i++) {
            arr.push(JSON.stringify(objs[i]));
        }
        const t3 = new Date().getTime();
        cnsole.info('Time taken in serialization = ', t3 - t2);
        cnsole.info('arr.length = ', arr.length);

        const array = [];
        for (let i = 0; i < objs.length; i++) {
            const a = JSON.parse(arr[i]);
            array.push(a);
        }
        const t4 = new Date().getTime();
        cnsole.info('Time taken in parsing = ', t4 - t3);
        cnsole.info('array.length: ', array.length);
    };

    loadTest_SQLite = async (objs) => {
        const openCB = () => cnsole.info('DB opened');
        const errorCB = (e) => cnsole.error('DB error: ', e);
        const db = SQLite.openDatabase("test3.db", "1.0", "Test Database", 200000, openCB, errorCB);

        const NUM = objs.length;
        const t1 = new Date().getTime();
        await new Promise(resolve => {
            db.transaction((tx) => {
                const cbFn = (tx, results) => {
                    cnsole.info('cbFn success: ', results);
                    resolve();
                };
                const errorCbFn = (tx, error) => cnsole.error('errorCbFn failure: ', error);

                tx.executeSql(`CREATE TABLE IF NOT EXISTS Tb1 (idx tinyint, json varchar(${OBJ_SIZE * 10}))`, [], cbFn, errorCbFn);
            });
        });

        for (let i = 0; i < NUM; i++) {
            await new Promise(resolve => {
                db.transaction((tx) => {
                    const cbFn = (tx, results) => {
                        // cnsole.info('cbFn success: ', results);
                        resolve();
                    };
                    const errorCbFn = (tx, error) => cnsole.error('errorCbFn failure: ', error);

                    tx.executeSql('INSERT INTO Tb1 VALUES (?, ?)', [i, JSON.stringify(objs[i])], cbFn, errorCbFn);
                });
            });
        }

        for (let i = 0; i < NUM; i++) {
            await new Promise(resolve => {
                db.transaction((tx) => {
                    const readResultsCbFn = (tx, results) => {
                        // cnsole.info('readResultsCbFn: ', results);
                        const len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            const row = results.rows.item(i);
                            cnsole.info('Value read: ', row.json);
                        }
                        resolve();
                    };
                    const errorCbFn = (tx, error) => cnsole.error('errorCbFn failure: ', error);

                    tx.executeSql('SELECT * from Tb1 where idx = ?', [i], readResultsCbFn, errorCbFn);
                });
            });
        }

        await new Promise(resolve => {
            db.transaction((tx) => {
                const cb = (tx, results) => {
                    cnsole.info('results: ', results);
                    const len = results.rows.length;
                    for (let i = 0; i < len; i++) {
                        const row = results.rows.item(i);
                        cnsole.info('Value read: ', row);
                    }
                };
                const errorCbFn = (tx, error) => cnsole.error('errorCbFn failure: ', error);

                tx.executeSql('SELECT count(*) from Tb1 ', [], cb, errorCbFn);
                resolve();
            });
        });

        const t2 = new Date().getTime();
        cnsole.info('Time taken in loadTest_SQLite = ', t2 - t1);
    };

    render() {
        return <View />;
    }
}

const NUM_ITER = 1;
const OBJ_SIZE = 1000;
