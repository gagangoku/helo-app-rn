import XLSX from "xlsx";
import {firebase} from '../platform/firebase';
import {getGroupInfo, sendMessageToGroup, showToast} from "../util/Util";
import {OUTPUT_EXCEL} from "../chat/Questions";
import cnsole from 'loglevel';
import tmp from 'tmp';
import {downloadFile} from "../util/FileUtil";


export const convertXLSXToHelo = async ({ filePath, fileUrl, sheetName }) => {
    if (!filePath) {
        const tmpFile = tmp.fileSync({ prefix: 'helo-tmp-' });
        filePath = tmpFile.name;
        await new Promise(resolve => downloadFile(fileUrl, filePath, resolve));
    }
    return await getExcelFromXls({ filePath, sheetName });
};

export const convertXLSXToHeloAndPostInGroup = async ({ filePath, fileUrl, collection, groupId, sheetName, sender }) => {
    if (!filePath) {
        const tmpFile = tmp.fileSync({ prefix: 'helo-tmp-' });
        filePath = tmpFile.name;
        await new Promise(resolve => downloadFile(fileUrl, filePath, resolve));
    }
    await convertXls({ filePath, collection, groupId, sheetName, sender });
};

const getExcelFromXls = async ({ filePath, sheetName }) => {
    const wb = XLSX.readFile(filePath, {type:'binary'});

    cnsole.info('wb.SheetNames: ', wb.SheetNames);
    const wsname = sheetName && wb.SheetNames.includes(sheetName) ? sheetName : wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const data = XLSX.utils.sheet_to_json(ws, {header:1});

    const cells = [];
    data.forEach((line, y) => {
        line.forEach((val, x) => {
            if (val) {
                cells.push({ rowId: y, colId: x, val: '' + line[x] });
            }
        });
    });
    const excel = {
        title: wsname,
        cells,
        allSheets: wb.SheetNames,
    };

    cnsole.info('Parsed excel with rows: ', excel.cells.length, excel.cells.title);
    return excel;
};

const convertXls = async ({ filePath, collection, groupId, sheetName, sender }) => {
    const excel = await getExcelFromXls({ filePath, sheetName });

    cnsole.info('Creating excel with rows: ', cells.length);
    await submitFn({ collection, groupId, sender, excel });
    cnsole.info('Sheet created');
};

const submitFn = async ({ collection, groupId, sender, excel }) => {
    const [role, id] = sender.split(',');
    const me = {
        role, id,
        name: 'Helo sheet',
        sender,
    };
    const db = firebase.firestore();
    const docRef = db.collection(collection).doc(groupId);
    const doc = await docRef.get();
    const groupInfo = getGroupInfo(doc.data(), doc);

    const idToDetails = {[sender]: { person: {...me} }};

    showToast('Creating spreadsheet');
    await sendMessageToGroup({ me, ipLocation: null, idToDetails, docRef, groupInfo, groupId, updateLastReadIdx: null,
                               text: '', type: OUTPUT_EXCEL, excel });
};
