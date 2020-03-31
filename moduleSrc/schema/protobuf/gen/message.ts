/* eslint-disable */
import {Reader, Writer} from 'protobufjs/minimal';


export interface Message {
  index: number;
  text: string;
}

const baseMessage: object = {
  index: 0,
  text: "",
};

export const Message = {
  encode(message: Message, writer: Writer = Writer.create()): Writer {
    writer.uint32(8).uint32(message.index);
    writer.uint32(34).string(message.text);
    return writer;
  },
  decode(reader: Reader, length?: number): Message {
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = Object.create(baseMessage) as Message;
    while (reader.pos < end) {
      const tag = reader.uint32();
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
  fromJSON(object: any): Message {
    const message = Object.create(baseMessage) as Message;
    if (object.index !== undefined && object.index !== null) {
      message.index = Number(object.index);
    } else {
      message.index = 0;
    }
    if (object.text !== undefined && object.text !== null) {
      message.text = String(object.text);
    } else {
      message.text = "";
    }
    return message;
  },
  fromPartial(object: DeepPartial<Message>): Message {
    const message = Object.create(baseMessage) as Message;
    if (object.index !== undefined && object.index !== null) {
      message.index = object.index;
    } else {
      message.index = 0;
    }
    if (object.text !== undefined && object.text !== null) {
      message.text = object.text;
    } else {
      message.text = "";
    }
    return message;
  },
  toJSON(message: Message): unknown {
    const obj: any = {};
    obj.index = message.index || 0;
    obj.text = message.text || "";
    return obj;
  },
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T[P] extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T[P] extends Date | Function | Uint8Array | undefined
  ? T[P]
  : T[P] extends infer U | undefined
  ? DeepPartial<U>
  : T[P] extends object
  ? DeepPartial<T[P]>
  : T[P]
};
