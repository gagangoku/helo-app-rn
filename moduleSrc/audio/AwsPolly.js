import AWS from 'aws-sdk';
import {LANG_THAI} from "../chat/Questions";
import window from 'global/window';
import cnsole from 'loglevel';


AWS.config.update({
    accessKeyId: "AKIAI5HVGQ2IVQ72RY6Q",
    secretAccessKey: "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",
});

let initialized = false;
const queue = [];
let isSpeaking = false;
let intervalId = null;
const responsiveVoice = window.responsiveVoice || responsiveVoice;

export const isBotSpeaking = () => {
    return queue.length > 0 || isSpeaking;
};

export const enqueueSpeechWithPolly = (text, language) => {
    queue.push(text);
    if (!intervalId) {
        const f = async () => {
            if (queue.length > 0 && !isSpeaking) {
                isSpeaking = true;
                const n = queue.shift();
                await speak(n, language);
                isSpeaking = false;
            }
        };
        intervalId = setInterval(f, 100);
    }
};


const speak = async (text, language) => {
    cnsole.log('AwsPolly: In speak: ', text, new Date().getTime());

    if (language === LANG_THAI) {
        await new Promise((resolve, error) => {
            const onerror = () => cnsole.log('Error in Thai speech');
            const onstart = () => cnsole.log('onstart: ', new Date().getTime());
            const onend = () => {
                cnsole.log('onend: ', new Date().getTime());
                resolve();
            };
            responsiveVoice.speak(text, "Thai Female", {volume: 5, onstart, onend, onerror});
        });
        await new Promise(resolve => setTimeout(resolve, 500));
    } else {
        AWS.config.update({
            accessKeyId: "AKIAI5HVGQ2IVQ72RY6Q",
            secretAccessKey: "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",
        });
        // Create an Polly client
        const Polly = new AWS.Polly({
            signatureVersion: 'v4',
            region: 'ap-south-1',
        });

        let params = {
            'Text': text,
            'OutputFormat': 'mp3',
            'VoiceId': 'Aditi',
        };

        if (!initialized) {
            cnsole.log('AwsPolly: Waiting for initialization');
            await new Promise(resolve => setTimeout(resolve, POLLY_INITIALIZATION_WAIT_TIME_MS));
            cnsole.log('AwsPolly: initialized');
            initialized = true;
        }

        cnsole.log('AwsPolly: Speaking: ', text, new Date().getTime());
        try {
            await new Promise(resolve => Polly.synthesizeSpeech(params, (err, data) => cbFn(err, data, resolve)));
        } catch (e) {
            // Ignore
        }
    }

    cnsole.log('AwsPolly: Done speaking: ', text, new Date().getTime());
};

const cbFn = async (err, data, doneCb) => {
    cnsole.log('AwsPolly: err, data: ', err, data);
    if (!data || !(data.AudioStream instanceof Buffer)) {
        cnsole.log('AwsPolly: data.AudioStream not appropriate');
        doneCb();
        return;
    }

    const blob = new Blob([data.AudioStream], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    cnsole.log('AwsPolly: Blob url: ', url);

    const audio = new Audio(url);
    audio.onended = doneCb;
    audio.play().catch((e) => {
        // Probably because of https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
        cnsole.log('AwsPolly: Exception in Polly speak: ', e);
        doneCb();
    });
};

const POLLY_INITIALIZATION_WAIT_TIME_MS = 100;
