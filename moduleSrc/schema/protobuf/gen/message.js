"use strict";
exports.__esModule = true;
/* eslint-disable */
var minimal_1 = require("protobufjs/minimal");
var baseMessage = {
    index: 0,
    text: ""
};
exports.Message = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.Writer.create(); }
        writer.uint32(8).uint32(message.index);
        writer.uint32(34).string(message.text);
        return writer;
    },
    decode: function (reader, length) {
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = Object.create(baseMessage);
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.index = reader.uint32();
                    break;
                case 4:
                    message.text = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = Object.create(baseMessage);
        if (object.index !== undefined && object.index !== null) {
            message.index = Number(object.index);
        }
        else {
            message.index = 0;
        }
        if (object.text !== undefined && object.text !== null) {
            message.text = String(object.text);
        }
        else {
            message.text = "";
        }
        return message;
    },
    fromPartial: function (object) {
        var message = Object.create(baseMessage);
        if (object.index !== undefined && object.index !== null) {
            message.index = object.index;
        }
        else {
            message.index = 0;
        }
        if (object.text !== undefined && object.text !== null) {
            message.text = object.text;
        }
        else {
            message.text = "";
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        obj.index = message.index || 0;
        obj.text = message.text || "";
        return obj;
    }
};
