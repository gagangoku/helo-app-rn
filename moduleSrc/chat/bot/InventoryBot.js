import cnsole from "loglevel";
import speech from '@google-cloud/speech';
import fs from 'fs';
import {
    OUTPUT_AUDIO,
    OUTPUT_EXCEL,
    OUTPUT_FILE,
    OUTPUT_IMAGE,
    OUTPUT_TEXT,
    OUTPUT_VIDEO,
    SENDER_HELO
} from "../Questions";
import tmp from 'tmp';
import {downloadFile} from "../../util/FileUtil";
import {convertXLSXToHelo, getExcelFromXls} from "../../server/XLSXConverter";
import lodash from 'lodash';
import {getDateToday} from "../../util/Util";
import {OcrParser} from "../../util/OcrParser";
import {WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH} from "../../platform/Util";
import {detectTextInImage} from "../../util/Api";


export class InventoryBot {
    constructor(webSocketConnection) {
        this.webSocketConnection = webSocketConnection;
        this.messages = [];
        this.transcriptions = [];
        this.grammarPhrases = [];

        this.webSocketConnection.sendUTF(JSON.stringify([ textMessage('Helo') ]));
    }

    close = () => {
        cnsole.info('Closing');
    };

    onMessage = async (message) => {
        cnsole.log('onMessage: ', message);
        this.messages.push(message);

        const { type, text, excel, fileUrl, taskList, audioUrl, videoUrl, imageUrl } = message;
        switch (type) {
            case OUTPUT_EXCEL:
                // Treat this as the grammer for this session
                this.setGrammar(excel);
                break;

            case OUTPUT_FILE:
                if (fileUrl && fileUrl.endsWith('.xlsx')) {
                    // Treat this as the grammer for this session
                    this.setGrammarXlsx(fileUrl);
                }
                break;

            case OUTPUT_AUDIO:
                this.detectSpeech(audioUrl);
                break;

            case OUTPUT_VIDEO:
                this.detectSpeechInVideo(videoUrl);
                break;

            case OUTPUT_IMAGE:
                this.detectTextInImage(imageUrl);
                break;

            case OUTPUT_TEXT:
                const command = (text || '').toLowerCase();
                switch (command) {
                    case 'compile':
                    case 'bhejo':
                    case 'send':
                        this.compile();
                        break;
                    default:
                        this.transcriptions.push(command);
                        break;
                }
                break;
        }

        this.webSocketConnection.sendUTF(JSON.stringify([ textMessage('ok') ]));
        await this.saveToServer();
    };

    compile = () => {
        // TODO: Detect quantities from transcription
        const cells = [ { rowId: 0, colId: 0, val: 'Item' }, ...this.transcriptions.map((x, idx) => ({ rowId: idx + 1, colId: 0, val: x }))];
        const excel = {
            title: 'Inventory - ' + getDateToday() + 'T' + new Date().getTime(),
            cells,
        };

        const msg = {
            type: OUTPUT_EXCEL,
            timestamp: new Date().getTime(),
            sender: SENDER_HELO,
            text: '',
            excel,
        };
        this.webSocketConnection.sendUTF(JSON.stringify([ msg ]));
    };

    setGrammar = async (excel) => {
        const { title, cells } = excel;
        this.grammarPhrases = lodash.uniq(cells.map(x => (x.val || '').trim()).filter(x => !!x).filter(x => x !== parseInt(x) + ''));
    };

    setGrammarXlsx = async (xlsxFile) => {
        const excel = await convertXLSXToHelo({ fileUrl: xlsxFile });        // TODO: Process multiple sheets
        this.setGrammar(excel);
    };

    detectSpeech = async (audioUrl) => {
        const transcription = await detectSpeechInMp3FileUrl(audioUrl, this.grammarPhrases);
        const msg = {
            type: OUTPUT_TEXT,
            timestamp: new Date().getTime(),
            sender: SENDER_HELO,
            text: transcription,
        };
        this.webSocketConnection.sendUTF(JSON.stringify([ msg ]));
        this.transcriptions.push(transcription);
    };

    detectSpeechInVideo = async (videoUrl) => {
        const msg = {
            type: OUTPUT_TEXT,
            timestamp: new Date().getTime(),
            sender: SENDER_HELO,
            text: 'Video transcription coming soon !',
        };
        this.webSocketConnection.sendUTF(JSON.stringify([ msg ]));
    };

    detectTextInImage = async (imageUrl) => {
        const ocrParser = OcrParser({ INVENTORY_ITEMS: this.grammarPhrases, QUANTITY_TITLES, WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH });
        const imgJson = await detectTextInImage(imageUrl);
        const { texts, completeText, inventoryDetails } = ocrParser.parseOcr(imgJson, false);
        cnsole.info('texts: ', texts);
        cnsole.info('completeText: ', completeText);
        cnsole.info('inventoryDetails: ', inventoryDetails);

        const msg = {
            type: OUTPUT_TEXT,
            timestamp: new Date().getTime(),
            sender: SENDER_HELO,
            text: completeText,
        };
        this.webSocketConnection.sendUTF(JSON.stringify([ msg ]));
    };

    saveToServer = async () => {};
}


const textMessage = (text) => ({
    type: OUTPUT_TEXT,
    timestamp: new Date().getTime(),
    sender: SENDER_HELO,
    text,
});

const detectSpeechInMp3FileUrl = async (audioUrl, grammarPhrases) => {
    const tmpFile = tmp.fileSync({ prefix: 'helo-tmp-' });
    await new Promise(resolve => downloadFile(audioUrl, tmpFile.name, resolve));

    return detectSpeechInMp3File(tmpFile.name, grammarPhrases);
};

const detectSpeechInMp3File = async (filePath, grammarPhrases) => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/mnt/google-cloud-storage-credentials.json';

    // Creates a client
    const client = new speech.SpeechClient();

    // Reads a local audio file and converts it to base64
    const file = fs.readFileSync(filePath);
    const audioBytes = file.toString('base64');

    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
        content: audioBytes,
    };
    const speechContext = {
        phrases: grammarPhrases,
    };
    const config = {
        encoding: 'MP3',
        sampleRateHertz: 44100,
        languageCode: 'en-IN',
        speechContexts: [speechContext],
    };
    const request = {
        audio: audio,
        config: config,
    };

    // Detects speech in the audio file
    const startTimeMs = new Date().getTime();
    try {
        const data = await client.recognize(request);
        console.log('Detected in: ', new Date().getTime() - startTimeMs);
        const response = data[0];
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        console.log('Transcription: ', transcription);
        return transcription;
    } catch (err) {
        console.error('ERROR:', err);
        console.log('Error in: ', new Date().getTime() - startTimeMs);
    }
    return null;
};


export const detectSpeechInTestFile = async () => {
    const fileName = '/tmp/recorder-1584293045595.aac-228040-851258-1584293061615.mp3';
    const phrases = [
        '7 by 7 cake base',
        '9 by 9 cake base',
        '10 by 10 cake base',
        '12 by 12 cake base',
        '15 by 15 cake base',
        'cup cake mould',
        'paper bag big',
        'piece',
        'pieces',
        'next hai',
        'aur',
    ];
    return detectSpeechInMp3File(fileName, phrases);
};
const QUANTITY_TITLES = [
    'Quantity',
    'No.',
    'Qty',
];
