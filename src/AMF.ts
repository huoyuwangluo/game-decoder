/***
 * AMF 3 JavaScript library by Emil Malinov https://github.com/emilkm/amfjs
 */

module amf {
    let CONST:any= {
        EMPTY_STRING: "",
        NULL_STRING: "null",
        UNDEFINED_TYPE: 0,
        NULL_TYPE: 1,
        FALSE_TYPE: 2,
        TRUE_TYPE: 3,
        INTEGER_TYPE: 4,
        DOUBLE_TYPE: 5,
        STRING_TYPE: 6,
        XML_TYPE: 7,
        DATE_TYPE: 8,
        ARRAY_TYPE: 9,
        OBJECT_TYPE: 10,
        XMLSTRING_TYPE: 11,
        BYTEARRAY_TYPE: 12,
        AMF0_AMF3: 17,
        UINT29_MASK: 536870911,
        INT28_MAX_VALUE: 268435455,
        INT28_MIN_VALUE: -268435456,
        CLASS_ALIAS: "_explicitType",
        EXTERNALIZED_FIELD: "_externalizedData"
    };
    let requestPoolSize: number = 6;
    let requestPool: any[] = [];
    let doNothing: Function = function () { };

    export class ActionMessage {
        public _explicitType: string;
        public version: number;
        public headers: any[];
        public bodies: any[];
        constructor() {
            this._explicitType = "flex.messaging.io.amf.ActionMessage";
            this.version = 3;
            this.headers = [];
            this.bodies = [];
        }
    }
    export class MessageBody {
        public targetURI: string;
        public responseURI: string;
        public data: any[];
        constructor() {
            this.targetURI = "null";
            this.responseURI = '/1';
            this.data = [];
        }
    }
    export class MessageHeader {
        public name: string;
        public mustUnderstand: boolean;
        public data: any;
        constructor() {
            this.name = "";
            this.mustUnderstand = false;
            this.data = null;
        }
    }
    export class CommandMessage {
        public _explicitType: string;
        public destination: string;
        public operation: number;
        public clientId: any;
        constructor() {
            this._explicitType = "flex.messaging.messages.CommandMessage";
            this.destination = '';
            this.operation = 5;
            this.clientId = null;
        }
    }

    export class RemotingMessage {
        public _explicitType: string;
        public destination: string;
        public source: string;
        public operation: string;
        public body: any[];
        public clientId: any;
        public headers: any;
        constructor() {
            this._explicitType = "flex.messaging.messages.RemotingMessagee";
            this.destination = '';
            this.source = '';
            this.operation = '';
            this.body = [],
                this.headers = { DSId: "nil" },
                this.clientId = null;
        }
    }

    export class AcknowledgeMessage {
        public _explicitType: string;
        public body: any;
        public headers: any[];
        public messageId: any;
        public clientId: any;

        constructor() {
            this._explicitType = "flex.messaging.messages.AcknowledgeMessage";
            this.body = null,
                this.headers = [],
                this.messageId = null;
            this.clientId = null;
        }
    }
    export class Request {
        public source: any;
        public operation: any;
        public params: any;
        public onResult: any;
        public onStatus: any;
        public token: any;
        public holdQueue: any;
        constructor(source, operation, params, onResult, onStatus, token, holdQueue) {
            this.source = source,
                this.operation = operation,
                this.params = params,
                this.onResult = onResult,
                this.onStatus = onStatus,
                this.token = token,
                this.holdQueue = holdQueue
        }
    }


    export class Writer {
        public data: any[];
        private objects: any[];
        private traits: any;
        private strings: any;
        private stringCount: number;
        private traitCount: number;
        private objectCount: number;
        constructor() {
            this.data = [];
            this.objects = [];
            this.traits = {};
            this.strings = {};
            this.stringCount = 0;
            this.traitCount = 0;
            this.objectCount = 0;
        }

        write = function (v) {
            this.data.push(v);
        };

        writeShort = function (v) {
            this.write((v >>> 8) & 255);
            this.write((v >>> 0) & 255);
        };

        writeUTF = function (v, asAmf) {
            var bytearr, c, i, strlen, utflen;
            strlen = v.length;
            utflen = 0;
            for (i = 0; i < strlen; i++) {
                c = v.charCodeAt(i);
                if (c > 0 && c < 128) {
                    utflen++;
                } else if (c > 2047) {
                    utflen += 3;
                } else {
                    utflen += 2;
                }
            }
            bytearr = [];
            if (asAmf) {
                this.writeUInt29((utflen << 1) | 1);
            } else {
                bytearr.push((utflen >>> 8) & 255);
                bytearr.push(utflen & 255);
            }
            for (i = 0; i < strlen; i++) {
                c = v.charCodeAt(i);
                if (c > 0 && c < 128) {
                    bytearr.push(c);
                } else if (c > 2047) {
                    bytearr.push(224 | (c >> 12));
                    bytearr.push(128 | ((c >> 6) & 63));
                    if (asAmf) {
                        bytearr.push(128 | ((c >> 0) & 63));
                    } else {
                        bytearr.push(128 | (c & 63));
                    }
                } else {
                    bytearr.push(192 | (c >> 6));
                    if (asAmf) {
                        bytearr.push(128 | ((c >> 0) & 63));
                    } else {
                        bytearr.push(128 | (c & 63));
                    }
                }
            }
            this.writeAll(bytearr);
            return asAmf ? utflen : utflen + 2;
        };

        writeUInt29 = function (v) {
            if (v < 128) {
                this.write(v);
            } else if (v < 16384) {
                this.write(((v >> 7) & 127) | 128);
                this.write(v & 127);
            } else if (v < 2097152) {
                this.write(((v >> 14) & 127) | 128);
                this.write(((v >> 7) & 127) | 128);
                this.write(v & 127);
            } else if (v < 0x40000000) {
                this.write(((v >> 22) & 127) | 128);
                this.write(((v >> 15) & 127) | 128);
                this.write(((v >> 8) & 127) | 128);
                this.write(v & 255);
            } else {
                throw "Integer out of range: " + v;
            }
        };

        writeAll = function (bytes) {
            for (var i = 0; i < bytes.length; i++) {
                this.write(bytes[i]);
            }
        };

        writeBoolean = function (v) {
            this.write(v ? 1 : 0);
        };

        writeInt = function (v) {
            this.write((v >>> 24) & 255);
            this.write((v >>> 16) & 255);
            this.write((v >>> 8) & 255);
            this.write((v >>> 0) & 255);
        };

        writeUnsignedInt = function (v) {
            v < 0 && (v = -(v ^ 4294967295) - 1);
            v &= 4294967295;
            this.write((v >> 24) & 255);
            this.write((v >> 16) & 255);
            this.write((v >> 8) & 255);
            this.write(v & 255);
        };

        //origin unknown
        _getDouble = function (v: number) {
            var r = [0, 0];
            if (v != v) return r[0] = -524288, r;
            var d = v < 0 || v === 0 && 1 / v < 0 ? -2147483648 : 0, v = Math.abs(v);
            if (v === Number.POSITIVE_INFINITY) return r[0] = d | 2146435072, r;
            for (var e = 0; v >= 2 && e <= 1023;) e++ , v /= 2;
            for (; v < 1 && e >= -1022;) e-- , v *= 2;
            e += 1023;
            if (e == 2047) return r[0] = d | 2146435072, r;
            var i;
            e == 0
                ? (i = v * Math.pow(2, 23) / 2, v = Math.round(v * Math.pow(2, 52) / 2))
                : (i = v * Math.pow(2, 20) - Math.pow(2, 20), v = Math.round(v * Math.pow(2, 52) - Math.pow(2, 52)));
            r[0] = d | e << 20 & 2147418112 | i & 1048575;
            r[1] = v;
            return r;
        };

        writeDouble = function (v) {
            v = this._getDouble(v);
            this.writeUnsignedInt(v[0]);
            this.writeUnsignedInt(v[1])
        };

        getResult = function () {
            return this.data.join("");
        };

        reset = function () {
            this.objects = [];
            this.objectCount = 0;
            this.traits = {};
            this.traitCount = 0;
            this.strings = {};
            this.stringCount = 0;
        };

        writeStringWithoutType = function (v) {
            if (v.length == 0) {
                this.writeUInt29(1);
            } else {
                if (!this.stringByReference(v)) {
                    this.writeUTF(v, true);
                }
            }
        };

        stringByReference = function (v) {
            var ref = this.strings[v];
            if (ref) {
                this.writeUInt29(ref << 1);
            } else {
                this.strings[v] = this.stringCount++;
            }
            return ref;
        };

        objectByReference = function (v) {
            var ref = 0;
            var found = false;
            for (; ref < this.objects.length; ref++) {
                if (this.objects[ref] === v) {
                    found = true;
                    break;
                }
            }
            if (found) {
                this.writeUInt29(ref << 1);
            } else {
                this.objects.push(v);
                this.objectCount++;
            }

            return found ? ref : null;
        };

        traitsByReference = function (v, alias) {
            var s = alias + "|";
            for (var i = 0; i < v.length; i++) {
                s += v[i] + "|";
            }
            var ref = this.traits[s];
            if (ref) {
                this.writeUInt29((ref << 2) | 1);
            } else {
                this.traits[s] = this.traitCount++;
            }
            return ref;
        };

        writeAmfInt = function (v) {
            if (v >= CONST.INT28_MIN_VALUE && v <= CONST.INT28_MAX_VALUE) {
                v = v & CONST.UINT29_MASK;
                this.write(CONST.INTEGER_TYPE);
                this.writeUInt29(v);
            } else {
                this.write(CONST.DOUBLE_TYPE);
                this.writeDouble(v);
            }
        };

        writeDate = function (v) {
            this.write(CONST.DATE_TYPE);
            if (!this.objectByReference(v)) {
                this.writeUInt29(1);
                this.writeDouble(v.getTime());
            }
        };

        writeObject = function (v) {
            if (v == null) {
                this.write(CONST.NULL_TYPE);
                return;
            }
            if (v.constructor === String) {
                this.write(CONST.STRING_TYPE);
                this.writeStringWithoutType(v);
            } else if (v.constructor === Number) {
                if (v === +v && v === (v | 0)) {
                    this.writeAmfInt(v);
                } else {
                    this.write(CONST.DOUBLE_TYPE);
                    this.writeDouble(v);
                }
            } else if (v.constructor === Boolean) {
                this.write((v
                    ? CONST.TRUE_TYPE
                    : CONST.FALSE_TYPE));
            } else if (v.constructor === Date) {
                this.writeDate(v);
            } else {
                if (v.constructor === Array) {
                    this.writeArray(v);
                } else if (CONST.CLASS_ALIAS in v) {
                    this.writeCustomObject(v);
                } else {
                    this.writeMap(v);
                }
            }
        };

        writeCustomObject = function (v) {
            this.write(CONST.OBJECT_TYPE);
            if (!this.objectByReference(v)) {
                var traits = this.writeTraits(v);
                for (var i = 0; i < traits.length; i++) {
                    var prop = traits[i];
                    this.writeObject(v[prop]);
                }
            }
        };

        writeTraits = function (v) {
            var traits = [];
            var count = 0;
            var externalizable = false;
            var dynamic = false;

            for (var t in v) {
                if (t != CONST.CLASS_ALIAS) {
                    traits.push(t);
                    count++;
                }
            }
            if (!this.traitsByReference(traits, v[CONST.CLASS_ALIAS])) {
                this.writeUInt29(3 | (externalizable ? 4 : 0) | (dynamic ? 8 : 0) | (count << 4));
                this.writeStringWithoutType(v[CONST.CLASS_ALIAS]);
                if (count > 0) {
                    for (var prop in traits) {
                        this.writeStringWithoutType(traits[prop]);
                    }
                }
            }
            return traits;
        };

        /* Write map as array
        writeMap = function(v) {
            this.write(CONST.ARRAY_TYPE);
            if (!this.objectByReference(map)) {
                this.writeUInt29((0 << 1) | 1);
                for (var key in v) {
                    if (key) {
                        this.writeStringWithoutType(key);
                    } else {
                        this.writeStringWithoutType(CONST.EMPTY_STRING);
                    }
                    this.writeObject(v[key]);
                }
                this.writeStringWithoutType(CONST.EMPTY_STRING);
            }
        };*/

        writeMap = function (v) {
            this.write(CONST.OBJECT_TYPE);
            if (!this.objectByReference(v)) {
                this.writeUInt29(11);
                this.traitCount++; //bogus traits entry here
                this.writeStringWithoutType(CONST.EMPTY_STRING); //class name
                for (var key in v) {
                    if (key) {
                        this.writeStringWithoutType(key);
                    } else {
                        this.writeStringWithoutType(CONST.EMPTY_STRING);
                    }
                    this.writeObject(v[key]);
                }
                this.writeStringWithoutType(CONST.EMPTY_STRING); //empty string end of dynamic members
            }
        };

        writeArray = function (v) {
            this.write(CONST.ARRAY_TYPE);
            if (!this.objectByReference(v)) {
                this.writeUInt29((v.length << 1) | 1);
                this.writeUInt29(1); //empty string implying no named keys
                if (v.length > 0) {
                    for (var i = 0; i < v.length; i++) {
                        this.writeObject(v[i]);
                    }
                }
            }
        };
    }
    export class Reader {
        private objects: any[];
        private traits: any[];
        private strings: any[];
        public data: any;
        private pos: number;
        constructor(data) {
            this.objects = [];
            this.traits = [];
            this.strings = [];
            this.data = data;
            this.pos = 0;
        }
        read = function () {
            return this.data[this.pos++];
        };

        readUnsignedShort = function () {
            var c1 = this.read(), c2 = this.read();
            return (c1 << 8) + (c2 << 0);
        };

        readUInt29 = function () {
            // Each byte must be treated as unsigned
            var b = this.read() & 255;
            if (b < 128) {
                return b;
            }
            var value = (b & 127) << 7;
            b = this.read() & 255;
            if (b < 128) {
                return (value | b);
            }
            value = (value | (b & 127)) << 7;
            b = this.read() & 255;
            if (b < 128) {
                return (value | b);
            }
            value = (value | (b & 127)) << 8;
            b = this.read() & 255;
            return (value | b);
        };

        readFully = function (buff, start, length) {
            for (var i = start; i < length; i++) {
                buff[i] = this.read();
            }
        };

        readUTF = function (length) {
            var utflen = length ? length : this.readUnsignedShort();
            var chararr = [];
            var p = this.pos;
            var c1, c2, c3;

            while (this.pos < p + utflen) {
                c1 = this.read();
                switch (c1 >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        chararr.push(String.fromCharCode(c1));
                        break;
                    case 12:
                    case 13:
                        c2 = this.read();
                        chararr.push(String.fromCharCode(((c1 & 31) << 6) | (c2 & 63)));
                        break;
                    case 14:
                        c2 = this.read();
                        c3 = this.read();
                        chararr.push(String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | ((c3 & 63) << 0)));
                        break;
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    default:
                        break;
                }
                /*if (c1 < 128) {
                    chararr.push(String.fromCharCode(c1));
                } else if (c1 > 2047) {
                    c2 = this.read();
                    c3 = this.read();
                    chararr.push(String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
                } else {
                    c2 = this.read();
                    chararr.push(String.fromCharCode(((c1 & 31) << 6) | (c2 & 63)));
                }*/
            }
            // The number of chars produced may be less than utflen
            return chararr.join("");
        };

        reset = function () {
            this.objects = [];
            this.traits = [];
            this.strings = [];
        };

        readObject = function () {
            var type = this.read();
            return this.readObjectValue(type);
        };

        readString = function () {
            var ref = this.readUInt29();
            if ((ref & 1) == 0) {
                return this.getString(ref >> 1);
            } else {
                var len = (ref >> 1);
                if (len == 0) {
                    return CONST.EMPTY_STRING;
                }
                var str = this.readUTF(len);
                this.rememberString(str);
                return str;
            }
        };

        rememberString = function (v) {
            this.strings.push(v);
        };

        getString = function (v) {
            return this.strings[v];
        };

        getObject = function (v) {
            return this.objects[v];
        };

        getTraits = function (v) {
            return this.traits[v];
        };

        rememberTraits = function (v) {
            this.traits.push(v);
        };

        rememberObject = function (v) {
            this.objects.push(v);
        };

        readTraits = function (ref) {
            if ((ref & 3) == 1) {
                return this.getTraits(ref >> 2);
            } else {
                var count = (ref >> 4);
                var className = this.readString();
                var traits: any = {};
                if (className != null && className != "") {
                    traits[CONST.CLASS_ALIAS] = className;
                }
                traits.props = [];
                for (var i = 0; i < count; i++) {
                    traits.props.push(this.readString());
                }
                this.rememberTraits(traits);
                return traits;
            }
        };

        readScriptObject = function () {
            var ref = this.readUInt29();
            if ((ref & 1) == 0) {
                return this.getObject(ref >> 1);
            } else {
                var traits = this.readTraits(ref);
                var obj = {};
                if (CONST.CLASS_ALIAS in traits) {
                    obj[CONST.CLASS_ALIAS] = traits[CONST.CLASS_ALIAS];
                }
                this.rememberObject(obj);
                if ((ref & 4) == 4) {//externalizable
                    if (obj[CONST.CLASS_ALIAS] == "flex.messaging.io.ArrayCollection"
                        || obj[CONST.CLASS_ALIAS] == "flex.messaging.io.ObjectProxy"
                    ) {
                        return this.readObject();
                    } else {
                        obj[CONST.EXTERNALIZED_FIELD] = this.readObject();
                    }
                } else {
                    for (var i in traits.props) {
                        obj[traits.props[i]] = this.readObject();
                    }
                    if ((ref & 8) == 8) {//dynamic
                        for (; ;) {
                            var name = this.readString();
                            if (name == null || name.length == 0) {
                                break;
                            }
                            obj[name] = this.readObject();
                        }
                    }
                }
                return obj;
            }
        };

        readArray = function () {
            var ref = this.readUInt29();
            if ((ref & 1) == 0) {
                return this.getObject(ref >> 1);
            }
            var len = (ref >> 1);
            var map = null, i = 0;
            while (true) {
                var name = this.readString();
                if (!name) {
                    break;
                }
                if (!map) {
                    map = {};
                    this.rememberObject(map);
                }
                map[name] = this.readObject();
            }
            if (!map) {
                var array = new Array(len);
                this.rememberObject(array);
                for (i = 0; i < len; i++) {
                    array[i] = this.readObject();
                }
                return array;
            } else {
                for (i = 0; i < len; i++) {
                    map[i] = this.readObject();
                }
                return map;
            }
        };

        //origin unknown
        readDouble = function () {
            var c1 = this.read() & 255, c2: any = this.read() & 255;
            if (c1 === 255) {
                if (c2 === 248) return Number.NaN;
                if (c2 === 240) return Number.NEGATIVE_INFINITY
            } else if (c1 === 127 && c2 === 240) return Number.POSITIVE_INFINITY;
            var c3: any = this.read() & 255, c4 = this.read() & 255, c5 = this.read() & 255, c6: any = this.read() & 255, c7 = this.read() & 255, c8 = this.read() & 255;
            if (!c1 && !c2 && !c3 && !c4) return 0;
            for (var d = (c1 << 4 & 2047 | c2 >> 4) - 1023, c2: any = ((c2 & 15) << 16 | c3 << 8 | c4).toString(2), c3 = c2.length; c3 < 20; c3++) c2 = "0" + c2;
            c6 = ((c5 & 127) << 24 | c6 << 16 | c7 << 8 | c8).toString(2);
            for (c3 = c6.length; c3 < 31; c3++) c6 = "0" + c6;
            c5 = parseInt(c2 + (c5 >> 7 ? "1" : "0") + c6, 2);
            if (c5 == 0 && d == -1023) return 0;
            return (1 - (c1 >> 7 << 1)) * (1 + Math.pow(2, -52) * c5) * Math.pow(2, d);
        };

        readDate = function () {
            var ref = this.readUInt29();
            if ((ref & 1) == 0) {
                return this.getObject(ref >> 1);
            }
            var time = this.readDouble();
            var date = new Date(time);
            this.rememberObject(date);
            return date;
        };

        readMap = function () {
            var ref = this.readUInt29();
            if ((ref & 1) == 0) {
                return this.getObject(ref >> 1);
            }
            var length = (ref >> 1);
            var map = null;
            if (length > 0) {
                map = {};
                this.rememberObject(map);
                var name = this.readObject();
                while (name != null) {
                    map[name] = this.readObject();
                    name = this.readObject();
                }
            }
            return map;
        };

        readByteArray = function () {
            var ref = this.readUInt29();
            if ((ref & 1) == 0) {
                return this.getObject(ref >> 1);
            } else {
                var len = (ref >> 1);
                var ba = [];
                this.readFully(ba, 0, len);
                this.rememberObject(ba);
                return ba;
            }
        };

        readObjectValue = function (type) {
            var value = null;

            switch (type) {
                case CONST.STRING_TYPE:
                    value = this.readString();
                    break;
                case CONST.OBJECT_TYPE:
                    try {
                        value = this.readScriptObject();
                    } catch (e) {
                        throw "Failed to deserialize:" + e;
                    }
                    break;
                case CONST.ARRAY_TYPE:
                    value = this.readArray();
                    //value = this.readMap();
                    break;
                case CONST.FALSE_TYPE:
                    value = false;
                    break;
                case CONST.TRUE_TYPE:
                    value = true;
                    break;
                case CONST.INTEGER_TYPE:
                    value = this.readUInt29();
                    // Symmetric with writing an integer to fix sign bits for
                    // negative values...
                    value = (value << 3) >> 3;
                    break;
                case CONST.DOUBLE_TYPE:
                    value = this.readDouble();
                    break;
                case CONST.UNDEFINED_TYPE:
                case CONST.NULL_TYPE:
                    break;
                case CONST.DATE_TYPE:
                    value = this.readDate();
                    break;
                case CONST.BYTEARRAY_TYPE:
                    value = this.readByteArray();
                    break;
                case CONST.AMF0_AMF3:
                    value = this.readObject();
                    break;
                default:
                    throw "Unknown AMF type: " + type;
            }
            return value;
        };

        readBoolean = function () {
            return this.read() === 1;
        };
    }

    export class Serializer {
        private writer: Writer;
        constructor() {
            this.writer = new Writer();
        }


        writeMessage = function (message) {
            try {
                this.writer.writeShort(message.version);
                this.writer.writeShort(message.headers.length);
                for (var header in message.headers) {
                    this.writeHeader(message.headers[header]);
                }
                this.writer.writeShort(message.bodies.length);
                for (var body in message.bodies) {
                    this.writeBody(message.bodies[body]);
                }
            } catch (error) {
                console.log(error);
            }
            //return this.writer.getResult();
            return this.writer.data;
        };

        writeObject = function (object) {
            this.writer.writeObject(object);
        };

        writeHeader = function (header) {
            this.writer.writeUTF(header.name);
            this.writer.writeBoolean(header.mustUnderstand);
            this.writer.writeInt(1); //UNKNOWN_CONTENT_LENGTH used to be -1
            this.writer.reset();
            //this.writer.writeObject(header.data);
            this.writer.write(1); //boolean amf0 marker
            this.writer.writeBoolean(true);
        };

        writeBody = function (body) {
            if (body.targetURI == null) {
                this.writer.writeUTF(CONST.NULL_STRING);
            } else {
                this.writer.writeUTF(body.targetURI);
            }
            if (body.responseURI == null) {
                this.writer.writeUTF(CONST.NULL_STRING);
            } else {
                this.writer.writeUTF(body.responseURI);
            }
            this.writer.writeInt(1); //UNKNOWN_CONTENT_LENGTH used to be -1
            this.writer.reset();
            this.writer.write(CONST.AMF0_AMF3); //AMF0_AMF3
            this.writeObject(body.data);
        };
    }
    export class Deserializer {
        private reader: Reader;
        constructor(data) {
            this.reader = new Reader(data);
        }


        readMessage = function () {
            var message = new ActionMessage();
            message.version = this.reader.readUnsignedShort();
            var headerCount = this.reader.readUnsignedShort();
            for (var i = 0; i < headerCount; i++) {
                message.headers.push(this.readHeader());
            }
            var bodyCount = this.reader.readUnsignedShort();
            for (i = 0; i < bodyCount; i++) {
                message.bodies.push(this.readBody());
            }
            return message;
        };

        readHeader = function () {
            var header = new MessageHeader();
            header.name = this.reader.readUTF();
            header.mustUnderstand = this.reader.readBoolean();
            this.reader.pos += 4; //length
            this.reader.reset();
            var type = this.reader.read();
            if (type != 2) { //amf0 string
                throw "Only string header data supported.";
            }
            header.data = this.reader.readUTF();
            return header;
        };

        readBody = function () {
            var body = new MessageBody();
            body.targetURI = this.reader.readUTF();
            body.responseURI = this.reader.readUTF();
            this.reader.pos += 4; //length
            this.reader.reset();
            body.data = this.readObject();
            return body;
        };

        readObject = function () {
            return this.reader.readObject();
        };
    }
};