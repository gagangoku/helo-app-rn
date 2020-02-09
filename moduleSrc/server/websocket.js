import {server as WebSocketServer} from 'websocket';
import http from 'http';
import {CookOnboardingBot} from "../chat/bot/ChatBotServer";
import {SPEECH_RECOGNITION_TERMINATOR, WEBSOCKET_PORT} from "../constants/Constants";
import {Readable, Writable} from "stream";
import ffmpeg from "fluent-ffmpeg";
import {LANG_HINGLISH} from "../chat/Questions";
import {getLangCode} from "../util/Util";
import speech from '@google-cloud/speech';


export const setupWebsocket = (jobAttributesFn) => {
    // Websocket
    const wsHttpServer = http.createServer(function(request, response) {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    });
    wsHttpServer.listen(WEBSOCKET_PORT, function() {
        console.log('Server is listening on port: ', WEBSOCKET_PORT);
    });
    wsHttpServer.timeout = 60 * 60 * 1000;          // 60 minutes

    const wsServer = new WebSocketServer({
        httpServer: wsHttpServer,
        // You should not use autoAcceptConnections for production
        // applications, as it defeats all standard cross-origin protection
        // facilities built into the protocol and the browser.  You should
        // *always* verify the connection's origin and decide whether or not
        // to accept it.
        autoAcceptConnections: false
    });

    function originIsAllowed(origin) {
        // put logic here to detect whether the specified origin is allowed.
        return true;
    }

    wsServer.on('request', function(request) {
        if (!originIsAllowed(request.origin)) {
            // Make sure we only accept requests from an allowed origin
            request.reject();
            console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
            return;
        }

        const requestUrl = request.httpRequest.url;
        console.log('New request: ', requestUrl);
        const connection = request.accept('chat-protocol', request.origin);
        console.log((new Date()) + ' Connection accepted.');

        let bot, inStream;
        if (requestUrl === '/' || requestUrl === '') {
            bot = new CookOnboardingBot(connection, jobAttributesFn());
        }
        if (requestUrl === '/speech') {
            inStream = new Readable({
                read() {}
            });
            recognizeFromWebmStream(inStream, (data) => connection.sendUTF(JSON.stringify(data)));
        }

        connection.on('message', function(message) {
            if (!message) {
                console.log('Received bad message: ', message);
                return;
            }

            if (message.type === 'utf8' && message.utf8Data !== SPEECH_RECOGNITION_TERMINATOR) {
                console.log('Received Message: ', message.utf8Data);
                try {
                    bot.onMessage(JSON.parse(message.utf8Data));
                } catch (e) {
                    console.log('Exception in bot: ', e);
                }
            } else if (message.type === 'binary') {
                console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                // console.log('message.binaryData: ', typeof message.binaryData, message.binaryData);
                const aBuffer = Buffer.from(message.binaryData);
                // console.log('aBuffer: ', typeof aBuffer, aBuffer);
                inStream && inStream.push(aBuffer);
            } else if (message.type === 'utf8' && message.utf8Data === SPEECH_RECOGNITION_TERMINATOR) {
                console.log('Received end of speech recognition stream');
                inStream && inStream.push(null);
            }
        });
        connection.on('close', function(reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            inStream && inStream.push(null);
        });
    });
};

const convertToFlacUsingFFMpeg = (inStream, outStream) => {
    ffmpeg(inStream)
        .audioCodec('flac')
        .format('flac')
        .on('start', function(commandLine) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('progress', function(x) {
            // console.log('Progress: ', x);
        })
        .on('error', function(err) {
            console.log('An error occurred: ' + err.message);
        })
        .on('end', function() {
            console.log('Processing finished !');
        })
        .pipe(outStream, { end: true });
};

export const recognizeFromWebmStream = (inStream, cbFn) => {
    const dummyInStream = new Readable({
        read() {}
    });
    const outStream = new Writable({
        write(chunk, encoding, callback) {
            dummyInStream.push(chunk, encoding);
            callback();
            // console.log(typeof chunk);
            // console.log(chunk);
            // console.log('encoding: ', encoding);
        },
        final(callbackFn) {
            console.log('outStream ended');
            dummyInStream.push(null);
        }
    });

    convertToFlacUsingFFMpeg(inStream, outStream);
    recognizeFromStream(dummyInStream, 'FLAC', 44100, LANG_HINGLISH, cbFn);
};

export const readStreamFromBuffer = (buffer) => {
    const readStream = new Readable({
        read() {}
    });
    readStream.push(buffer);
    readStream.push(null);
    return readStream;
};

const recognizeFromStream = (inputStream, encoding, sampleRateHertz, language, cbFn) => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/mnt/google-cloud-storage-credentials.json';

    // Creates a client
    const client = new speech.SpeechClient();

    const languageCode = getLangCode(language);
    const request = {
        config: {
            encoding,
            sampleRateHertz,
            languageCode,
            enableWordTimeOffsets: true,
        },
        singleUtterance: false,
        interimResults: false,
    };

    // Create a recognize stream
    const recognizeStream = client.streamingRecognize(request)
        .on('error', (e) => console.log('Error: ', e))
        .on('end', () => console.log('Speech recognition ended'))
        .on('data', (data) => {
            cbFn(data);
            if (data.results[0] && data.results[0].alternatives[0]) {
                console.log('Transcription: ', data.results[0].alternatives[0].transcript);
            } else {
                console.log('Speech recognition unexpected response: ', JSON.stringify(data));
            }
        });

    console.log('Piping to Google Text to Speech api');
    inputStream.pipe(recognizeStream);
};
