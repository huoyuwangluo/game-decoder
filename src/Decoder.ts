module decoder {
    export class ZlibDecoder {
        decode(buffer, caller, callback, complete) {
            var contentBytes;
            var bytes = new ByteArray(buffer);
            function decodeSigle() {
                if (bytes.bytesAvailable) {
                    var name = bytes.readUTF();
                    var needReplace = bytes.readBoolean();
                    var isCompress = bytes.readBoolean();
                    var length = bytes.readUnsignedInt();
                    contentBytes = new ByteArray();
                    bytes.readBytes(contentBytes, 0, length);
                    if (isCompress) {
                        contentBytes.position = 0;
                        contentBytes = new ByteArray(ByteArray.uncompress(contentBytes.buffer));
                    }
                    var content = contentBytes.readUTFBytes(contentBytes.length);
                    if (needReplace) content = content.replace(/\/\//g, '');
                    callback.call(caller, name, content);
                    setTimeout(decodeSigle, 1000 / 60);
                    return;
                }
                complete.call(caller);
            }
            decodeSigle();
        }
    }
    export let zlibDecoder: ZlibDecoder = new ZlibDecoder();

    export class AMFDecoder {
        decode(buffer) {
            var result = {};
            var readArray = new ByteArray(buffer);
            while (readArray.bytesAvailable) {
                var s:ByteArray = new ByteArray();
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
        }
    }
    export let amfDecoder: AMFDecoder = new AMFDecoder();
}