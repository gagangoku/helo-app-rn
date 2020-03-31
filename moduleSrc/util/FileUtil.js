import request from "request";
import cnsole from "loglevel";
import fs from "fs";


export const downloadFile = (uri, filePath, callback) => {
    request.head(uri, function(err, res, body) {
        cnsole.info('downloadFile filePath: ', filePath);
        cnsole.info('downloadFile content-type:', res.headers['content-type']);
        cnsole.info('downloadFile content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filePath)).on('close', callback);
    });
};

