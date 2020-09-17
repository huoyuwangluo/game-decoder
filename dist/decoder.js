var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
/***
 * AMF 3 JavaScript library by Emil Malinov https://github.com/emilkm/amfjs
 */
var amf;
(function (amf) {
    var CONST = {
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
    var requestPoolSize = 6;
    var requestPool = [];
    var doNothing = function () { };
    var ActionMessage = (function () {
        function ActionMessage() {
            this._explicitType = "flex.messaging.io.amf.ActionMessage";
            this.version = 3;
            this.headers = [];
            this.bodies = [];
        }
        return ActionMessage;
    }());
    amf.ActionMessage = ActionMessage;
    __reflect(ActionMessage.prototype, "amf.ActionMessage");
    var MessageBody = (function () {
        function MessageBody() {
            this.targetURI = "null";
            this.responseURI = '/1';
            this.data = [];
        }
        return MessageBody;
    }());
    amf.MessageBody = MessageBody;
    __reflect(MessageBody.prototype, "amf.MessageBody");
    var MessageHeader = (function () {
        function MessageHeader() {
            this.name = "";
            this.mustUnderstand = false;
            this.data = null;
        }
        return MessageHeader;
    }());
    amf.MessageHeader = MessageHeader;
    __reflect(MessageHeader.prototype, "amf.MessageHeader");
    var CommandMessage = (function () {
        function CommandMessage() {
            this._explicitType = "flex.messaging.messages.CommandMessage";
            this.destination = '';
            this.operation = 5;
            this.clientId = null;
        }
        return CommandMessage;
    }());
    amf.CommandMessage = CommandMessage;
    __reflect(CommandMessage.prototype, "amf.CommandMessage");
    var RemotingMessage = (function () {
        function RemotingMessage() {
            this._explicitType = "flex.messaging.messages.RemotingMessagee";
            this.destination = '';
            this.source = '';
            this.operation = '';
            this.body = [],
                this.headers = { DSId: "nil" },
                this.clientId = null;
        }
        return RemotingMessage;
    }());
    amf.RemotingMessage = RemotingMessage;
    __reflect(RemotingMessage.prototype, "amf.RemotingMessage");
    var AcknowledgeMessage = (function () {
        function AcknowledgeMessage() {
            this._explicitType = "flex.messaging.messages.AcknowledgeMessage";
            this.body = null,
                this.headers = [],
                this.messageId = null;
            this.clientId = null;
        }
        return AcknowledgeMessage;
    }());
    amf.AcknowledgeMessage = AcknowledgeMessage;
    __reflect(AcknowledgeMessage.prototype, "amf.AcknowledgeMessage");
    var Request = (function () {
        function Request(source, operation, params, onResult, onStatus, token, holdQueue) {
            this.source = source,
                this.operation = operation,
                this.params = params,
                this.onResult = onResult,
                this.onStatus = onStatus,
                this.token = token,
                this.holdQueue = holdQueue;
        }
        return Request;
    }());
    amf.Request = Request;
    __reflect(Request.prototype, "amf.Request");
    var Writer = (function () {
        function Writer() {
            this.write = function (v) {
                this.data.push(v);
            };
            this.writeShort = function (v) {
                this.write((v >>> 8) & 255);
                this.write((v >>> 0) & 255);
            };
            this.writeUTF = function (v, asAmf) {
                var bytearr, c, i, strlen, utflen;
                strlen = v.length;
                utflen = 0;
                for (i = 0; i < strlen; i++) {
                    c = v.charCodeAt(i);
                    if (c > 0 && c < 128) {
                        utflen++;
                    }
                    else if (c > 2047) {
                        utflen += 3;
                    }
                    else {
                        utflen += 2;
                    }
                }
                bytearr = [];
                if (asAmf) {
                    this.writeUInt29((utflen << 1) | 1);
                }
                else {
                    bytearr.push((utflen >>> 8) & 255);
                    bytearr.push(utflen & 255);
                }
                for (i = 0; i < strlen; i++) {
                    c = v.charCodeAt(i);
                    if (c > 0 && c < 128) {
                        bytearr.push(c);
                    }
                    else if (c > 2047) {
                        bytearr.push(224 | (c >> 12));
                        bytearr.push(128 | ((c >> 6) & 63));
                        if (asAmf) {
                            bytearr.push(128 | ((c >> 0) & 63));
                        }
                        else {
                            bytearr.push(128 | (c & 63));
                        }
                    }
                    else {
                        bytearr.push(192 | (c >> 6));
                        if (asAmf) {
                            bytearr.push(128 | ((c >> 0) & 63));
                        }
                        else {
                            bytearr.push(128 | (c & 63));
                        }
                    }
                }
                this.writeAll(bytearr);
                return asAmf ? utflen : utflen + 2;
            };
            this.writeUInt29 = function (v) {
                if (v < 128) {
                    this.write(v);
                }
                else if (v < 16384) {
                    this.write(((v >> 7) & 127) | 128);
                    this.write(v & 127);
                }
                else if (v < 2097152) {
                    this.write(((v >> 14) & 127) | 128);
                    this.write(((v >> 7) & 127) | 128);
                    this.write(v & 127);
                }
                else if (v < 0x40000000) {
                    this.write(((v >> 22) & 127) | 128);
                    this.write(((v >> 15) & 127) | 128);
                    this.write(((v >> 8) & 127) | 128);
                    this.write(v & 255);
                }
                else {
                    throw "Integer out of range: " + v;
                }
            };
            this.writeAll = function (bytes) {
                for (var i = 0; i < bytes.length; i++) {
                    this.write(bytes[i]);
                }
            };
            this.writeBoolean = function (v) {
                this.write(v ? 1 : 0);
            };
            this.writeInt = function (v) {
                this.write((v >>> 24) & 255);
                this.write((v >>> 16) & 255);
                this.write((v >>> 8) & 255);
                this.write((v >>> 0) & 255);
            };
            this.writeUnsignedInt = function (v) {
                v < 0 && (v = -(v ^ 4294967295) - 1);
                v &= 4294967295;
                this.write((v >> 24) & 255);
                this.write((v >> 16) & 255);
                this.write((v >> 8) & 255);
                this.write(v & 255);
            };
            //origin unknown
            this._getDouble = function (v) {
                var r = [0, 0];
                if (v != v)
                    return r[0] = -524288, r;
                var d = v < 0 || v === 0 && 1 / v < 0 ? -2147483648 : 0, v = Math.abs(v);
                if (v === Number.POSITIVE_INFINITY)
                    return r[0] = d | 2146435072, r;
                for (var e = 0; v >= 2 && e <= 1023;)
                    e++, v /= 2;
                for (; v < 1 && e >= -1022;)
                    e--, v *= 2;
                e += 1023;
                if (e == 2047)
                    return r[0] = d | 2146435072, r;
                var i;
                e == 0
                    ? (i = v * Math.pow(2, 23) / 2, v = Math.round(v * Math.pow(2, 52) / 2))
                    : (i = v * Math.pow(2, 20) - Math.pow(2, 20), v = Math.round(v * Math.pow(2, 52) - Math.pow(2, 52)));
                r[0] = d | e << 20 & 2147418112 | i & 1048575;
                r[1] = v;
                return r;
            };
            this.writeDouble = function (v) {
                v = this._getDouble(v);
                this.writeUnsignedInt(v[0]);
                this.writeUnsignedInt(v[1]);
            };
            this.getResult = function () {
                return this.data.join("");
            };
            this.reset = function () {
                this.objects = [];
                this.objectCount = 0;
                this.traits = {};
                this.traitCount = 0;
                this.strings = {};
                this.stringCount = 0;
            };
            this.writeStringWithoutType = function (v) {
                if (v.length == 0) {
                    this.writeUInt29(1);
                }
                else {
                    if (!this.stringByReference(v)) {
                        this.writeUTF(v, true);
                    }
                }
            };
            this.stringByReference = function (v) {
                var ref = this.strings[v];
                if (ref) {
                    this.writeUInt29(ref << 1);
                }
                else {
                    this.strings[v] = this.stringCount++;
                }
                return ref;
            };
            this.objectByReference = function (v) {
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
                }
                else {
                    this.objects.push(v);
                    this.objectCount++;
                }
                return found ? ref : null;
            };
            this.traitsByReference = function (v, alias) {
                var s = alias + "|";
                for (var i = 0; i < v.length; i++) {
                    s += v[i] + "|";
                }
                var ref = this.traits[s];
                if (ref) {
                    this.writeUInt29((ref << 2) | 1);
                }
                else {
                    this.traits[s] = this.traitCount++;
                }
                return ref;
            };
            this.writeAmfInt = function (v) {
                if (v >= CONST.INT28_MIN_VALUE && v <= CONST.INT28_MAX_VALUE) {
                    v = v & CONST.UINT29_MASK;
                    this.write(CONST.INTEGER_TYPE);
                    this.writeUInt29(v);
                }
                else {
                    this.write(CONST.DOUBLE_TYPE);
                    this.writeDouble(v);
                }
            };
            this.writeDate = function (v) {
                this.write(CONST.DATE_TYPE);
                if (!this.objectByReference(v)) {
                    this.writeUInt29(1);
                    this.writeDouble(v.getTime());
                }
            };
            this.writeObject = function (v) {
                if (v == null) {
                    this.write(CONST.NULL_TYPE);
                    return;
                }
                if (v.constructor === String) {
                    this.write(CONST.STRING_TYPE);
                    this.writeStringWithoutType(v);
                }
                else if (v.constructor === Number) {
                    if (v === +v && v === (v | 0)) {
                        this.writeAmfInt(v);
                    }
                    else {
                        this.write(CONST.DOUBLE_TYPE);
                        this.writeDouble(v);
                    }
                }
                else if (v.constructor === Boolean) {
                    this.write((v
                        ? CONST.TRUE_TYPE
                        : CONST.FALSE_TYPE));
                }
                else if (v.constructor === Date) {
                    this.writeDate(v);
                }
                else {
                    if (v.constructor === Array) {
                        this.writeArray(v);
                    }
                    else if (CONST.CLASS_ALIAS in v) {
                        this.writeCustomObject(v);
                    }
                    else {
                        this.writeMap(v);
                    }
                }
            };
            this.writeCustomObject = function (v) {
                this.write(CONST.OBJECT_TYPE);
                if (!this.objectByReference(v)) {
                    var traits = this.writeTraits(v);
                    for (var i = 0; i < traits.length; i++) {
                        var prop = traits[i];
                        this.writeObject(v[prop]);
                    }
                }
            };
            this.writeTraits = function (v) {
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
            this.writeMap = function (v) {
                this.write(CONST.OBJECT_TYPE);
                if (!this.objectByReference(v)) {
                    this.writeUInt29(11);
                    this.traitCount++; //bogus traits entry here
                    this.writeStringWithoutType(CONST.EMPTY_STRING); //class name
                    for (var key in v) {
                        if (key) {
                            this.writeStringWithoutType(key);
                        }
                        else {
                            this.writeStringWithoutType(CONST.EMPTY_STRING);
                        }
                        this.writeObject(v[key]);
                    }
                    this.writeStringWithoutType(CONST.EMPTY_STRING); //empty string end of dynamic members
                }
            };
            this.writeArray = function (v) {
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
            this.data = [];
            this.objects = [];
            this.traits = {};
            this.strings = {};
            this.stringCount = 0;
            this.traitCount = 0;
            this.objectCount = 0;
        }
        return Writer;
    }());
    amf.Writer = Writer;
    __reflect(Writer.prototype, "amf.Writer");
    var Reader = (function () {
        function Reader(data) {
            this.read = function () {
                return this.data[this.pos++];
            };
            this.readUnsignedShort = function () {
                var c1 = this.read(), c2 = this.read();
                return (c1 << 8) + (c2 << 0);
            };
            this.readUInt29 = function () {
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
            this.readFully = function (buff, start, length) {
                for (var i = start; i < length; i++) {
                    buff[i] = this.read();
                }
            };
            this.readUTF = function (length) {
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
            this.reset = function () {
                this.objects = [];
                this.traits = [];
                this.strings = [];
            };
            this.readObject = function () {
                var type = this.read();
                return this.readObjectValue(type);
            };
            this.readString = function () {
                var ref = this.readUInt29();
                if ((ref & 1) == 0) {
                    return this.getString(ref >> 1);
                }
                else {
                    var len = (ref >> 1);
                    if (len == 0) {
                        return CONST.EMPTY_STRING;
                    }
                    var str = this.readUTF(len);
                    this.rememberString(str);
                    return str;
                }
            };
            this.rememberString = function (v) {
                this.strings.push(v);
            };
            this.getString = function (v) {
                return this.strings[v];
            };
            this.getObject = function (v) {
                return this.objects[v];
            };
            this.getTraits = function (v) {
                return this.traits[v];
            };
            this.rememberTraits = function (v) {
                this.traits.push(v);
            };
            this.rememberObject = function (v) {
                this.objects.push(v);
            };
            this.readTraits = function (ref) {
                if ((ref & 3) == 1) {
                    return this.getTraits(ref >> 2);
                }
                else {
                    var count = (ref >> 4);
                    var className = this.readString();
                    var traits = {};
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
            this.readScriptObject = function () {
                var ref = this.readUInt29();
                if ((ref & 1) == 0) {
                    return this.getObject(ref >> 1);
                }
                else {
                    var traits = this.readTraits(ref);
                    var obj = {};
                    if (CONST.CLASS_ALIAS in traits) {
                        obj[CONST.CLASS_ALIAS] = traits[CONST.CLASS_ALIAS];
                    }
                    this.rememberObject(obj);
                    if ((ref & 4) == 4) {
                        if (obj[CONST.CLASS_ALIAS] == "flex.messaging.io.ArrayCollection"
                            || obj[CONST.CLASS_ALIAS] == "flex.messaging.io.ObjectProxy") {
                            return this.readObject();
                        }
                        else {
                            obj[CONST.EXTERNALIZED_FIELD] = this.readObject();
                        }
                    }
                    else {
                        for (var i in traits.props) {
                            obj[traits.props[i]] = this.readObject();
                        }
                        if ((ref & 8) == 8) {
                            for (;;) {
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
            this.readArray = function () {
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
                }
                else {
                    for (i = 0; i < len; i++) {
                        map[i] = this.readObject();
                    }
                    return map;
                }
            };
            //origin unknown
            this.readDouble = function () {
                var c1 = this.read() & 255, c2 = this.read() & 255;
                if (c1 === 255) {
                    if (c2 === 248)
                        return Number.NaN;
                    if (c2 === 240)
                        return Number.NEGATIVE_INFINITY;
                }
                else if (c1 === 127 && c2 === 240)
                    return Number.POSITIVE_INFINITY;
                var c3 = this.read() & 255, c4 = this.read() & 255, c5 = this.read() & 255, c6 = this.read() & 255, c7 = this.read() & 255, c8 = this.read() & 255;
                if (!c1 && !c2 && !c3 && !c4)
                    return 0;
                for (var d = (c1 << 4 & 2047 | c2 >> 4) - 1023, c2 = ((c2 & 15) << 16 | c3 << 8 | c4).toString(2), c3 = c2.length; c3 < 20; c3++)
                    c2 = "0" + c2;
                c6 = ((c5 & 127) << 24 | c6 << 16 | c7 << 8 | c8).toString(2);
                for (c3 = c6.length; c3 < 31; c3++)
                    c6 = "0" + c6;
                c5 = parseInt(c2 + (c5 >> 7 ? "1" : "0") + c6, 2);
                if (c5 == 0 && d == -1023)
                    return 0;
                return (1 - (c1 >> 7 << 1)) * (1 + Math.pow(2, -52) * c5) * Math.pow(2, d);
            };
            this.readDate = function () {
                var ref = this.readUInt29();
                if ((ref & 1) == 0) {
                    return this.getObject(ref >> 1);
                }
                var time = this.readDouble();
                var date = new Date(time);
                this.rememberObject(date);
                return date;
            };
            this.readMap = function () {
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
            this.readByteArray = function () {
                var ref = this.readUInt29();
                if ((ref & 1) == 0) {
                    return this.getObject(ref >> 1);
                }
                else {
                    var len = (ref >> 1);
                    var ba = [];
                    this.readFully(ba, 0, len);
                    this.rememberObject(ba);
                    return ba;
                }
            };
            this.readObjectValue = function (type) {
                var value = null;
                switch (type) {
                    case CONST.STRING_TYPE:
                        value = this.readString();
                        break;
                    case CONST.OBJECT_TYPE:
                        try {
                            value = this.readScriptObject();
                        }
                        catch (e) {
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
            this.readBoolean = function () {
                return this.read() === 1;
            };
            this.objects = [];
            this.traits = [];
            this.strings = [];
            this.data = data;
            this.pos = 0;
        }
        return Reader;
    }());
    amf.Reader = Reader;
    __reflect(Reader.prototype, "amf.Reader");
    var Serializer = (function () {
        function Serializer() {
            this.writeMessage = function (message) {
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
                }
                catch (error) {
                    console.log(error);
                }
                //return this.writer.getResult();
                return this.writer.data;
            };
            this.writeObject = function (object) {
                this.writer.writeObject(object);
            };
            this.writeHeader = function (header) {
                this.writer.writeUTF(header.name);
                this.writer.writeBoolean(header.mustUnderstand);
                this.writer.writeInt(1); //UNKNOWN_CONTENT_LENGTH used to be -1
                this.writer.reset();
                //this.writer.writeObject(header.data);
                this.writer.write(1); //boolean amf0 marker
                this.writer.writeBoolean(true);
            };
            this.writeBody = function (body) {
                if (body.targetURI == null) {
                    this.writer.writeUTF(CONST.NULL_STRING);
                }
                else {
                    this.writer.writeUTF(body.targetURI);
                }
                if (body.responseURI == null) {
                    this.writer.writeUTF(CONST.NULL_STRING);
                }
                else {
                    this.writer.writeUTF(body.responseURI);
                }
                this.writer.writeInt(1); //UNKNOWN_CONTENT_LENGTH used to be -1
                this.writer.reset();
                this.writer.write(CONST.AMF0_AMF3); //AMF0_AMF3
                this.writeObject(body.data);
            };
            this.writer = new Writer();
        }
        return Serializer;
    }());
    amf.Serializer = Serializer;
    __reflect(Serializer.prototype, "amf.Serializer");
    var Deserializer = (function () {
        function Deserializer(data) {
            this.readMessage = function () {
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
            this.readHeader = function () {
                var header = new MessageHeader();
                header.name = this.reader.readUTF();
                header.mustUnderstand = this.reader.readBoolean();
                this.reader.pos += 4; //length
                this.reader.reset();
                var type = this.reader.read();
                if (type != 2) {
                    throw "Only string header data supported.";
                }
                header.data = this.reader.readUTF();
                return header;
            };
            this.readBody = function () {
                var body = new MessageBody();
                body.targetURI = this.reader.readUTF();
                body.responseURI = this.reader.readUTF();
                this.reader.pos += 4; //length
                this.reader.reset();
                body.data = this.readObject();
                return body;
            };
            this.readObject = function () {
                return this.reader.readObject();
            };
            this.reader = new Reader(data);
        }
        return Deserializer;
    }());
    amf.Deserializer = Deserializer;
    __reflect(Deserializer.prototype, "amf.Deserializer");
})(amf || (amf = {}));
;
var decoder;
(function (decoder) {
    /**
     * The Endian class contains values that denote the byte order used to represent multibyte numbers.
     * The byte order is either bigEndian (most significant byte first) or littleEndian (least significant byte first).
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * Endian 类中包含一些值，它们表示用于表示多字节数字的字节顺序。
     * 字节顺序为 bigEndian（最高有效字节位于最前）或 littleEndian（最低有效字节位于最前）。
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    var Endian = (function () {
        function Endian() {
        }
        /**
         * Indicates the least significant byte of the multibyte number appears first in the sequence of bytes.
         * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits per byte). The most significant byte is 0x12. The least significant byte is 0x78. (For the equivalent decimal number, 305419896, the most significant digit is 3, and the least significant digit is 6).
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 表示多字节数字的最低有效字节位于字节序列的最前面。
         * 十六进制数字 0x12345678 包含 4 个字节（每个字节包含 2 个十六进制数字）。最高有效字节为 0x12。最低有效字节为 0x78。（对于等效的十进制数字 305419896，最高有效数字是 3，最低有效数字是 6）。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        Endian.LITTLE_ENDIAN = "littleEndian";
        /**
         * Indicates the most significant byte of the multibyte number appears first in the sequence of bytes.
         * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits per byte).  The most significant byte is 0x12. The least significant byte is 0x78. (For the equivalent decimal number, 305419896, the most significant digit is 3, and the least significant digit is 6).
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 表示多字节数字的最高有效字节位于字节序列的最前面。
         * 十六进制数字 0x12345678 包含 4 个字节（每个字节包含 2 个十六进制数字）。最高有效字节为 0x12。最低有效字节为 0x78。（对于等效的十进制数字 305419896，最高有效数字是 3，最低有效数字是 6）。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        Endian.BIG_ENDIAN = "bigEndian";
        return Endian;
    }());
    decoder.Endian = Endian;
    __reflect(Endian.prototype, "decoder.Endian");
    /**
     * The ByteArray class provides methods and attributes for optimized reading and writing as well as dealing with binary data.
     * Note: The ByteArray class is applied to the advanced developers who need to access data at the byte layer.
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/utils/ByteArray.ts
     * @language en_US
     */
    /**
     * ByteArray 类提供用于优化读取、写入以及处理二进制数据的方法和属性。
     * 注意：ByteArray 类适用于需要在字节层访问数据的高级开发人员。
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/utils/ByteArray.ts
     * @language zh_CN
     */
    var ByteArray = (function () {
        /**
         * @version Egret 2.4
         * @platform Web,Native
         */
        function ByteArray(buffer, bufferExtSize) {
            if (bufferExtSize === void 0) { bufferExtSize = 0; }
            /**
             * @private
             */
            this.bufferExtSize = 0; //Buffer expansion size
            /**
             * @private
             */
            this.EOF_byte = -1;
            /**
             * @private
             */
            this.EOF_code_point = -1;
            if (bufferExtSize < 0) {
                bufferExtSize = 0;
            }
            this.bufferExtSize = bufferExtSize;
            var bytes, wpos = 0;
            if (buffer) {
                var uint8 = void 0;
                if (buffer instanceof Uint8Array) {
                    uint8 = buffer;
                    wpos = buffer.length;
                }
                else {
                    wpos = buffer.byteLength;
                    uint8 = new Uint8Array(buffer);
                }
                if (bufferExtSize == 0) {
                    bytes = new Uint8Array(wpos);
                }
                else {
                    var multi = (wpos / bufferExtSize | 0) + 1;
                    bytes = new Uint8Array(multi * bufferExtSize);
                }
                bytes.set(uint8);
            }
            else {
                bytes = new Uint8Array(bufferExtSize);
            }
            this.write_position = wpos;
            this._position = 0;
            this._bytes = bytes;
            this.data = new DataView(bytes.buffer);
            this.endian = Endian.BIG_ENDIAN;
        }
        Object.defineProperty(ByteArray.prototype, "endian", {
            /**
             * Changes or reads the byte order; egret.EndianConst.BIG_ENDIAN or egret.EndianConst.LITTLE_EndianConst.
             * @default egret.EndianConst.BIG_ENDIAN
             * @version Egret 2.4
             * @platform Web,Native
             * @language en_US
             */
            /**
             * 更改或读取数据的字节顺序；egret.EndianConst.BIG_ENDIAN 或 egret.EndianConst.LITTLE_ENDIAN。
             * @default egret.EndianConst.BIG_ENDIAN
             * @version Egret 2.4
             * @platform Web,Native
             * @language zh_CN
             */
            get: function () {
                return this.$endian == 0 /* LITTLE_ENDIAN */ ? Endian.LITTLE_ENDIAN : Endian.BIG_ENDIAN;
            },
            set: function (value) {
                this.$endian = value == Endian.LITTLE_ENDIAN ? 0 /* LITTLE_ENDIAN */ : 1 /* BIG_ENDIAN */;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @deprecated
         * @version Egret 2.4
         * @platform Web,Native
         */
        ByteArray.prototype.setArrayBuffer = function (buffer) {
        };
        Object.defineProperty(ByteArray.prototype, "readAvailable", {
            /**
             * 可读的剩余字节数
             *
             * @returns
             *
             * @memberOf ByteArray
             */
            get: function () {
                return this.write_position - this._position;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "buffer", {
            get: function () {
                return this.data.buffer.slice(0, this.write_position);
            },
            /**
             * @private
             */
            set: function (value) {
                var wpos = value.byteLength;
                var uint8 = new Uint8Array(value);
                var bufferExtSize = this.bufferExtSize;
                var bytes;
                if (bufferExtSize == 0) {
                    bytes = new Uint8Array(wpos);
                }
                else {
                    var multi = (wpos / bufferExtSize | 0) + 1;
                    bytes = new Uint8Array(multi * bufferExtSize);
                }
                bytes.set(uint8);
                this.write_position = wpos;
                this._bytes = bytes;
                this.data = new DataView(bytes.buffer);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "rawBuffer", {
            get: function () {
                return this.data.buffer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "bytes", {
            get: function () {
                return this._bytes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "dataView", {
            /**
             * @private
             * @version Egret 2.4
             * @platform Web,Native
             */
            get: function () {
                return this.data;
            },
            /**
             * @private
             */
            set: function (value) {
                this.buffer = value.buffer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "bufferOffset", {
            /**
             * @private
             */
            get: function () {
                return this.data.byteOffset;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "position", {
            /**
             * The current position of the file pointer (in bytes) to move or return to the ByteArray object. The next time you start reading reading method call in this position, or will start writing in this position next time call a write method.
             * @version Egret 2.4
             * @platform Web,Native
             * @language en_US
             */
            /**
             * 将文件指针的当前位置（以字节为单位）移动或返回到 ByteArray 对象中。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
             * @version Egret 2.4
             * @platform Web,Native
             * @language zh_CN
             */
            get: function () {
                return this._position;
            },
            set: function (value) {
                this._position = value;
                if (value > this.write_position) {
                    this.write_position = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "length", {
            /**
             * The length of the ByteArray object (in bytes).
                      * If the length is set to be larger than the current length, the right-side zero padding byte array.
                      * If the length is set smaller than the current length, the byte array is truncated.
             * @version Egret 2.4
             * @platform Web,Native
             * @language en_US
             */
            /**
             * ByteArray 对象的长度（以字节为单位）。
             * 如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧。
             * 如果将长度设置为小于当前长度的值，将会截断该字节数组。
             * @version Egret 2.4
             * @platform Web,Native
             * @language zh_CN
             */
            get: function () {
                return this.write_position;
            },
            set: function (value) {
                this.write_position = value;
                if (this.data.byteLength > value) {
                    this._position = value;
                }
                this._validateBuffer(value);
            },
            enumerable: true,
            configurable: true
        });
        ByteArray.prototype._validateBuffer = function (value) {
            if (this.data.byteLength < value) {
                var be = this.bufferExtSize;
                var tmp = void 0;
                if (be == 0) {
                    tmp = new Uint8Array(value);
                }
                else {
                    var nLen = ((value / be >> 0) + 1) * be;
                    tmp = new Uint8Array(nLen);
                }
                tmp.set(this._bytes);
                this._bytes = tmp;
                this.data = new DataView(tmp.buffer);
            }
        };
        Object.defineProperty(ByteArray.prototype, "bytesAvailable", {
            /**
             * The number of bytes that can be read from the current position of the byte array to the end of the array data.
             * When you access a ByteArray object, the bytesAvailable property in conjunction with the read methods each use to make sure you are reading valid data.
             * @version Egret 2.4
             * @platform Web,Native
             * @language en_US
             */
            /**
             * 可从字节数组的当前位置到数组末尾读取的数据的字节数。
             * 每次访问 ByteArray 对象时，将 bytesAvailable 属性与读取方法结合使用，以确保读取有效的数据。
             * @version Egret 2.4
             * @platform Web,Native
             * @language zh_CN
             */
            get: function () {
                return this.data.byteLength - this._position;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Clears the contents of the byte array and resets the length and position properties to 0.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 清除字节数组的内容，并将 length 和 position 属性重置为 0。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.clear = function () {
            var buffer = new ArrayBuffer(this.bufferExtSize);
            this.data = new DataView(buffer);
            this._bytes = new Uint8Array(buffer);
            this._position = 0;
            this.write_position = 0;
        };
        /**
         * Read a Boolean value from the byte stream. Read a simple byte. If the byte is non-zero, it returns true; otherwise, it returns false.
         * @return If the byte is non-zero, it returns true; otherwise, it returns false.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取布尔值。读取单个字节，如果字节非零，则返回 true，否则返回 false
         * @return 如果字节不为零，则返回 true，否则返回 false
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readBoolean = function () {
            if (this.validate(1 /* SIZE_OF_BOOLEAN */))
                return !!this._bytes[this.position++];
        };
        /**
         * Read signed bytes from the byte stream.
         * @return An integer ranging from -128 to 127
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取带符号的字节
         * @return 介于 -128 和 127 之间的整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readByte = function () {
            if (this.validate(1 /* SIZE_OF_INT8 */))
                return this.data.getInt8(this.position++);
        };
        /**
         * Read data byte number specified by the length parameter from the byte stream. Starting from the position specified by offset, read bytes into the ByteArray object specified by the bytes parameter, and write bytes into the target ByteArray
         * @param bytes ByteArray object that data is read into
         * @param offset Offset (position) in bytes. Read data should be written from this position
         * @param length Byte number to be read Default value 0 indicates reading all available data
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取 length 参数指定的数据字节数。从 offset 指定的位置开始，将字节读入 bytes 参数指定的 ByteArray 对象中，并将字节写入目标 ByteArray 中
         * @param bytes 要将数据读入的 ByteArray 对象
         * @param offset bytes 中的偏移（位置），应从该位置写入读取的数据
         * @param length 要读取的字节数。默认值 0 导致读取所有可用的数据
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readBytes = function (bytes, offset, length) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            if (!bytes) {
                return;
            }
            var pos = this._position;
            var available = this.write_position - pos;
            if (available < 0) {
                console.error(1025);
                return;
            }
            if (length == 0) {
                length = available;
            }
            else if (length > available) {
                console.error(1025);
                return;
            }
            bytes.validateBuffer(offset + length);
            bytes._bytes.set(this._bytes.subarray(pos, pos + length), offset);
            this.position += length;
        };
        /**
         * Read an IEEE 754 double-precision (64 bit) floating point number from the byte stream
         * @return Double-precision (64 bit) floating point number
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个 IEEE 754 双精度（64 位）浮点数
         * @return 双精度（64 位）浮点数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readDouble = function () {
            if (this.validate(8 /* SIZE_OF_FLOAT64 */)) {
                var value = this.data.getFloat64(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
                this.position += 8 /* SIZE_OF_FLOAT64 */;
                return value;
            }
        };
        /**
         * Read an IEEE 754 single-precision (32 bit) floating point number from the byte stream
         * @return Single-precision (32 bit) floating point number
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个 IEEE 754 单精度（32 位）浮点数
         * @return 单精度（32 位）浮点数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readFloat = function () {
            if (this.validate(4 /* SIZE_OF_FLOAT32 */)) {
                var value = this.data.getFloat32(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
                this.position += 4 /* SIZE_OF_FLOAT32 */;
                return value;
            }
        };
        /**
         * Read a 32-bit signed integer from the byte stream.
         * @return A 32-bit signed integer ranging from -2147483648 to 2147483647
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个带符号的 32 位整数
         * @return 介于 -2147483648 和 2147483647 之间的 32 位带符号整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readInt = function () {
            if (this.validate(4 /* SIZE_OF_INT32 */)) {
                var value = this.data.getInt32(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
                this.position += 4 /* SIZE_OF_INT32 */;
                return value;
            }
        };
        /**
         * Read a 16-bit signed integer from the byte stream.
         * @return A 16-bit signed integer ranging from -32768 to 32767
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个带符号的 16 位整数
         * @return 介于 -32768 和 32767 之间的 16 位带符号整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readShort = function () {
            if (this.validate(2 /* SIZE_OF_INT16 */)) {
                var value = this.data.getInt16(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
                this.position += 2 /* SIZE_OF_INT16 */;
                return value;
            }
        };
        /**
         * Read unsigned bytes from the byte stream.
         * @return A 32-bit unsigned integer ranging from 0 to 255
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取无符号的字节
         * @return 介于 0 和 255 之间的 32 位无符号整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readUnsignedByte = function () {
            if (this.validate(1 /* SIZE_OF_UINT8 */))
                return this._bytes[this.position++];
        };
        /**
         * Read a 32-bit unsigned integer from the byte stream.
         * @return A 32-bit unsigned integer ranging from 0 to 4294967295
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个无符号的 32 位整数
         * @return 介于 0 和 4294967295 之间的 32 位无符号整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readUnsignedInt = function () {
            if (this.validate(4 /* SIZE_OF_UINT32 */)) {
                var value = this.data.getUint32(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
                this.position += 4 /* SIZE_OF_UINT32 */;
                return value;
            }
        };
        /**
         * Read a 16-bit unsigned integer from the byte stream.
         * @return A 16-bit unsigned integer ranging from 0 to 65535
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个无符号的 16 位整数
         * @return 介于 0 和 65535 之间的 16 位无符号整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readUnsignedShort = function () {
            if (this.validate(2 /* SIZE_OF_UINT16 */)) {
                var value = this.data.getUint16(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
                this.position += 2 /* SIZE_OF_UINT16 */;
                return value;
            }
        };
        /**
         * Read a UTF-8 character string from the byte stream Assume that the prefix of the character string is a short unsigned integer (use byte to express length)
         * @return UTF-8 character string
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个 UTF-8 字符串。假定字符串的前缀是无符号的短整型（以字节表示长度）
         * @return UTF-8 编码的字符串
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readUTF = function () {
            var length = this.readUnsignedShort();
            if (length > 0) {
                return this.readUTFBytes(length);
            }
            else {
                return "";
            }
        };
        /**
         * Read a UTF-8 byte sequence specified by the length parameter from the byte stream, and then return a character string
         * @param Specify a short unsigned integer of the UTF-8 byte length
         * @return A character string consists of UTF-8 bytes of the specified length
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 从字节流中读取一个由 length 参数指定的 UTF-8 字节序列，并返回一个字符串
         * @param length 指明 UTF-8 字节长度的无符号短整型数
         * @return 由指定长度的 UTF-8 字节组成的字符串
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.readUTFBytes = function (length) {
            if (!this.validate(length)) {
                return;
            }
            var data = this.data;
            var bytes = new Uint8Array(data.buffer, data.byteOffset + this._position, length);
            this.position += length;
            return this.decodeUTF8(bytes);
        };
        /**
         * Write a Boolean value. A single byte is written according to the value parameter. If the value is true, write 1; if the value is false, write 0.
         * @param value A Boolean value determining which byte is written. If the value is true, write 1; if the value is false, write 0.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 写入布尔值。根据 value 参数写入单个字节。如果为 true，则写入 1，如果为 false，则写入 0
         * @param value 确定写入哪个字节的布尔值。如果该参数为 true，则该方法写入 1；如果该参数为 false，则该方法写入 0
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeBoolean = function (value) {
            this.validateBuffer(1 /* SIZE_OF_BOOLEAN */);
            this._bytes[this.position++] = +value;
        };
        /**
         * Write a byte into the byte stream
         * The low 8 bits of the parameter are used. The high 24 bits are ignored.
         * @param value A 32-bit integer. The low 8 bits will be written into the byte stream
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个字节
         * 使用参数的低 8 位。忽略高 24 位
         * @param value 一个 32 位整数。低 8 位将被写入字节流
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeByte = function (value) {
            this.validateBuffer(1 /* SIZE_OF_INT8 */);
            this._bytes[this.position++] = value & 0xff;
        };
        /**
         * Write the byte sequence that includes length bytes in the specified byte array, bytes, (starting at the byte specified by offset, using a zero-based index), into the byte stream
         * If the length parameter is omitted, the default length value 0 is used and the entire buffer starting at offset is written. If the offset parameter is also omitted, the entire buffer is written
         * If the offset or length parameter is out of range, they are clamped to the beginning and end of the bytes array.
         * @param bytes ByteArray Object
         * @param offset A zero-based index specifying the position into the array to begin writing
         * @param length An unsigned integer specifying how far into the buffer to write
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 将指定字节数组 bytes（起始偏移量为 offset，从零开始的索引）中包含 length 个字节的字节序列写入字节流
         * 如果省略 length 参数，则使用默认长度 0；该方法将从 offset 开始写入整个缓冲区。如果还省略了 offset 参数，则写入整个缓冲区
         * 如果 offset 或 length 超出范围，它们将被锁定到 bytes 数组的开头和结尾
         * @param bytes ByteArray 对象
         * @param offset 从 0 开始的索引，表示在数组中开始写入的位置
         * @param length 一个无符号整数，表示在缓冲区中的写入范围
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeBytes = function (bytes, offset, length) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            var writeLength;
            if (offset < 0) {
                return;
            }
            if (length < 0) {
                return;
            }
            else if (length == 0) {
                writeLength = bytes.length - offset;
            }
            else {
                writeLength = Math.min(bytes.length - offset, length);
            }
            if (writeLength > 0) {
                this.validateBuffer(writeLength);
                this._bytes.set(bytes._bytes.subarray(offset, offset + writeLength), this._position);
                this.position = this._position + writeLength;
            }
        };
        /**
         * Write an IEEE 754 double-precision (64 bit) floating point number into the byte stream
         * @param value Double-precision (64 bit) floating point number
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个 IEEE 754 双精度（64 位）浮点数
         * @param value 双精度（64 位）浮点数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeDouble = function (value) {
            this.validateBuffer(8 /* SIZE_OF_FLOAT64 */);
            this.data.setFloat64(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 8 /* SIZE_OF_FLOAT64 */;
        };
        /**
         * Write an IEEE 754 single-precision (32 bit) floating point number into the byte stream
         * @param value Single-precision (32 bit) floating point number
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个 IEEE 754 单精度（32 位）浮点数
         * @param value 单精度（32 位）浮点数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeFloat = function (value) {
            this.validateBuffer(4 /* SIZE_OF_FLOAT32 */);
            this.data.setFloat32(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_FLOAT32 */;
        };
        /**
         * Write a 32-bit signed integer into the byte stream
         * @param value An integer to be written into the byte stream
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个带符号的 32 位整数
         * @param value 要写入字节流的整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeInt = function (value) {
            this.validateBuffer(4 /* SIZE_OF_INT32 */);
            this.data.setInt32(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_INT32 */;
        };
        /**
         * Write a 16-bit integer into the byte stream. The low 16 bits of the parameter are used. The high 16 bits are ignored.
         * @param value A 32-bit integer. Its low 16 bits will be written into the byte stream
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个 16 位整数。使用参数的低 16 位。忽略高 16 位
         * @param value 32 位整数，该整数的低 16 位将被写入字节流
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeShort = function (value) {
            this.validateBuffer(2 /* SIZE_OF_INT16 */);
            this.data.setInt16(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 2 /* SIZE_OF_INT16 */;
        };
        /**
         * Write a 32-bit unsigned integer into the byte stream
         * @param value An unsigned integer to be written into the byte stream
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个无符号的 32 位整数
         * @param value 要写入字节流的无符号整数
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeUnsignedInt = function (value) {
            this.validateBuffer(4 /* SIZE_OF_UINT32 */);
            this.data.setUint32(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_UINT32 */;
        };
        /**
         * Write a 16-bit unsigned integer into the byte stream
         * @param value An unsigned integer to be written into the byte stream
         * @version Egret 2.5
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 在字节流中写入一个无符号的 16 位整数
         * @param value 要写入字节流的无符号整数
         * @version Egret 2.5
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeUnsignedShort = function (value) {
            this.validateBuffer(2 /* SIZE_OF_UINT16 */);
            this.data.setUint16(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 2 /* SIZE_OF_UINT16 */;
        };
        /**
         * Write a UTF-8 string into the byte stream. The length of the UTF-8 string in bytes is written first, as a 16-bit integer, followed by the bytes representing the characters of the string
         * @param value Character string value to be written
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节
         * @param value 要写入的字符串值
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeUTF = function (value) {
            var utf8bytes = this.encodeUTF8(value);
            var length = utf8bytes.length;
            this.validateBuffer(2 /* SIZE_OF_UINT16 */ + length);
            this.data.setUint16(this._position, length, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 2 /* SIZE_OF_UINT16 */;
            this._writeUint8Array(utf8bytes, false);
        };
        /**
         * Write a UTF-8 string into the byte stream. Similar to the writeUTF() method, but the writeUTFBytes() method does not prefix the string with a 16-bit length word
         * @param value Character string value to be written
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 将 UTF-8 字符串写入字节流。类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的词为字符串添加前缀
         * @param value 要写入的字符串值
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        ByteArray.prototype.writeUTFBytes = function (value) {
            this._writeUint8Array(this.encodeUTF8(value));
        };
        /**
         *
         * @returns
         * @version Egret 2.4
         * @platform Web,Native
         */
        ByteArray.prototype.toString = function () {
            return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
        };
        /**
         * @private
         * 将 Uint8Array 写入字节流
         * @param bytes 要写入的Uint8Array
         * @param validateBuffer
         */
        ByteArray.prototype._writeUint8Array = function (bytes, validateBuffer) {
            if (validateBuffer === void 0) { validateBuffer = true; }
            var pos = this._position;
            var npos = pos + bytes.length;
            if (validateBuffer) {
                this.validateBuffer(npos);
            }
            this.bytes.set(bytes, pos);
            this.position = npos;
        };
        /**
         * @param len
         * @returns
         * @version Egret 2.4
         * @platform Web,Native
         * @private
         */
        ByteArray.prototype.validate = function (len) {
            var bl = this._bytes.length;
            if (bl > 0 && this._position + len <= bl) {
                return true;
            }
            else {
                console.error(1025);
            }
        };
        /**********************/
        /*  PRIVATE METHODS   */
        /**********************/
        /**
         * @private
         * @param len
         * @param needReplace
         */
        ByteArray.prototype.validateBuffer = function (len) {
            this.write_position = len > this.write_position ? len : this.write_position;
            len += this._position;
            this._validateBuffer(len);
        };
        /**
         * @private
         * UTF-8 Encoding/Decoding
         */
        ByteArray.prototype.encodeUTF8 = function (str) {
            var pos = 0;
            var codePoints = this.stringToCodePoints(str);
            var outputBytes = [];
            while (codePoints.length > pos) {
                var code_point = codePoints[pos++];
                if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                    this.encoderError(code_point);
                }
                else if (this.inRange(code_point, 0x0000, 0x007f)) {
                    outputBytes.push(code_point);
                }
                else {
                    var count = void 0, offset = void 0;
                    if (this.inRange(code_point, 0x0080, 0x07FF)) {
                        count = 1;
                        offset = 0xC0;
                    }
                    else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                        count = 2;
                        offset = 0xE0;
                    }
                    else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                        count = 3;
                        offset = 0xF0;
                    }
                    outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                    while (count > 0) {
                        var temp = this.div(code_point, Math.pow(64, count - 1));
                        outputBytes.push(0x80 + (temp % 64));
                        count -= 1;
                    }
                }
            }
            return new Uint8Array(outputBytes);
        };
        /**
         * @private
         *
         * @param data
         * @returns
         */
        ByteArray.prototype.decodeUTF8 = function (data) {
            var fatal = false;
            var pos = 0;
            var result = "";
            var code_point;
            var utf8_code_point = 0;
            var utf8_bytes_needed = 0;
            var utf8_bytes_seen = 0;
            var utf8_lower_boundary = 0;
            while (data.length > pos) {
                var _byte = data[pos++];
                if (_byte == this.EOF_byte) {
                    if (utf8_bytes_needed != 0) {
                        code_point = this.decoderError(fatal);
                    }
                    else {
                        code_point = this.EOF_code_point;
                    }
                }
                else {
                    if (utf8_bytes_needed == 0) {
                        if (this.inRange(_byte, 0x00, 0x7F)) {
                            code_point = _byte;
                        }
                        else {
                            if (this.inRange(_byte, 0xC2, 0xDF)) {
                                utf8_bytes_needed = 1;
                                utf8_lower_boundary = 0x80;
                                utf8_code_point = _byte - 0xC0;
                            }
                            else if (this.inRange(_byte, 0xE0, 0xEF)) {
                                utf8_bytes_needed = 2;
                                utf8_lower_boundary = 0x800;
                                utf8_code_point = _byte - 0xE0;
                            }
                            else if (this.inRange(_byte, 0xF0, 0xF4)) {
                                utf8_bytes_needed = 3;
                                utf8_lower_boundary = 0x10000;
                                utf8_code_point = _byte - 0xF0;
                            }
                            else {
                                this.decoderError(fatal);
                            }
                            utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                            code_point = null;
                        }
                    }
                    else if (!this.inRange(_byte, 0x80, 0xBF)) {
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        pos--;
                        code_point = this.decoderError(fatal, _byte);
                    }
                    else {
                        utf8_bytes_seen += 1;
                        utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                        if (utf8_bytes_seen !== utf8_bytes_needed) {
                            code_point = null;
                        }
                        else {
                            var cp = utf8_code_point;
                            var lower_boundary = utf8_lower_boundary;
                            utf8_code_point = 0;
                            utf8_bytes_needed = 0;
                            utf8_bytes_seen = 0;
                            utf8_lower_boundary = 0;
                            if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                                code_point = cp;
                            }
                            else {
                                code_point = this.decoderError(fatal, _byte);
                            }
                        }
                    }
                }
                //Decode string
                if (code_point !== null && code_point !== this.EOF_code_point) {
                    if (code_point <= 0xFFFF) {
                        if (code_point > 0)
                            result += String.fromCharCode(code_point);
                    }
                    else {
                        code_point -= 0x10000;
                        result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                        result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                    }
                }
            }
            return result;
        };
        /**
         * @private
         *
         * @param code_point
         */
        ByteArray.prototype.encoderError = function (code_point) {
            console.log(1026, code_point);
        };
        /**
         * @private
         *
         * @param fatal
         * @param opt_code_point
         * @returns
         */
        ByteArray.prototype.decoderError = function (fatal, opt_code_point) {
            if (fatal) {
                console.log(1027);
            }
            return opt_code_point || 0xFFFD;
        };
        /**
         * @private
         *
         * @param a
         * @param min
         * @param max
         */
        ByteArray.prototype.inRange = function (a, min, max) {
            return min <= a && a <= max;
        };
        /**
         * @private
         *
         * @param n
         * @param d
         */
        ByteArray.prototype.div = function (n, d) {
            return Math.floor(n / d);
        };
        /**
         * @private
         *
         * @param string
         */
        ByteArray.prototype.stringToCodePoints = function (string) {
            /** @type {Array.<number>} */
            var cps = [];
            // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
            var i = 0, n = string.length;
            while (i < string.length) {
                var c = string.charCodeAt(i);
                if (!this.inRange(c, 0xD800, 0xDFFF)) {
                    cps.push(c);
                }
                else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                    cps.push(0xFFFD);
                }
                else {
                    if (i == n - 1) {
                        cps.push(0xFFFD);
                    }
                    else {
                        var d = string.charCodeAt(i + 1);
                        if (this.inRange(d, 0xDC00, 0xDFFF)) {
                            var a = c & 0x3FF;
                            var b = d & 0x3FF;
                            i += 1;
                            cps.push(0x10000 + (a << 10) + b);
                        }
                        else {
                            cps.push(0xFFFD);
                        }
                    }
                }
                i += 1;
            }
            return cps;
        };
        /** compress需要引用zlib.min.js */
        ByteArray.prototype.compress = function () {
            var deflate = new Zlib.Deflate(new Uint8Array(this.buffer));
            var inbuffer = deflate.compress();
            this.buffer = inbuffer.buffer;
            this._position = 0;
        };
        /** uncompress需要引用zlib.min.js */
        ByteArray.prototype.uncompress = function () {
            var inflate = new Zlib.Inflate(new Uint8Array(this.buffer));
            var inbuffer = inflate.decompress();
            this.buffer = inbuffer.buffer;
            this._position = 0;
        };
        ByteArray.uncompress = function (inputBuffer) {
            var inflate = new Zlib.Inflate(new Uint8Array(inputBuffer));
            var inbuffer = inflate.decompress();
            return inbuffer.buffer;
        };
        return ByteArray;
    }());
    decoder.ByteArray = ByteArray;
    __reflect(ByteArray.prototype, "decoder.ByteArray");
})(decoder || (decoder = {}));
var decoder;
(function (decoder) {
    var ZlibDecoder = (function () {
        function ZlibDecoder() {
        }
        ZlibDecoder.prototype.decode = function (buffer, caller, callback, complete) {
            var contentBytes;
            var bytes = new decoder.ByteArray(buffer);
            function decodeSigle() {
                if (bytes.bytesAvailable) {
                    var name = bytes.readUTF();
                    var needReplace = bytes.readBoolean();
                    var isCompress = bytes.readBoolean();
                    var length = bytes.readUnsignedInt();
                    contentBytes = new decoder.ByteArray();
                    bytes.readBytes(contentBytes, 0, length);
                    if (isCompress) {
                        contentBytes.position = 0;
                        contentBytes = new decoder.ByteArray(decoder.ByteArray.uncompress(contentBytes.buffer));
                    }
                    var content = contentBytes.readUTFBytes(contentBytes.length);
                    if (needReplace)
                        content = content.replace(/\/\//g, '');
                    callback.call(caller, name, content);
                    setTimeout(decodeSigle, 1000 / 60);
                    return;
                }
                complete.call(caller);
            }
            decodeSigle();
        };
        return ZlibDecoder;
    }());
    decoder.ZlibDecoder = ZlibDecoder;
    __reflect(ZlibDecoder.prototype, "decoder.ZlibDecoder");
    decoder.zlibDecoder = new ZlibDecoder();
    var AMFDecoder = (function () {
        function AMFDecoder() {
        }
        AMFDecoder.prototype.decode = function (buffer) {
            var result = {};
            var readArray = new decoder.ByteArray(buffer);
            while (readArray.bytesAvailable) {
                var s = new decoder.ByteArray();
                var name = readArray.readUTF();
                var length = readArray.readInt();
                readArray.readBytes(s, 0, length);
                var d = new amf.Deserializer(new Uint8Array(s.buffer));
                s.clear();
                result[name] = d.readObject();
                //d.clean();
            }
            readArray.clear();
            buffer.clear();
            return result;
        };
        return AMFDecoder;
    }());
    decoder.AMFDecoder = AMFDecoder;
    __reflect(AMFDecoder.prototype, "decoder.AMFDecoder");
    decoder.amfDecoder = new AMFDecoder();
})(decoder || (decoder = {}));
