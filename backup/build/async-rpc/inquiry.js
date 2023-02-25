"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inquiry = void 0;
const mongodb_1 = require("mongodb");
const EventEmitter = require("events");
const state_stream_1 = require("../state-stream");
const assert = require("assert");
class Inquiry {
    constructor(host, db, coll, stream) {
        this.host = host;
        this.db = db;
        this.coll = coll;
        this.stream = stream;
        this.broadcast = new EventEmitter();
        this.broadcast.setMaxListeners(Number.POSITIVE_INFINITY);
        this.stream.on('error', err => {
            console.error(err);
            // TODO
            process.exit(1);
        });
        this.stream.on('change', notif => {
            if (notif.operationType === 'update')
                this.broadcast.emit(notif.fullDocument._id.toHexString(), notif.fullDocument);
        });
    }
    async find(id) {
        const doc = await this.coll.findOne({
            _id: mongodb_1.ObjectId.createFromHexString(id),
        });
        assert(doc !== null, new NotFound());
        return doc;
    }
    inquire(id) {
        return new state_stream_1.StateStream(this.find(id), this.broadcast, id, (doc0, doc) => doc0.state < doc.state);
    }
}
exports.Inquiry = Inquiry;
(function (Inquiry) {
    class NotFound extends Error {
    }
    Inquiry.NotFound = NotFound;
})(Inquiry = exports.Inquiry || (exports.Inquiry = {}));
var NotFound = Inquiry.NotFound;
//# sourceMappingURL=inquiry.js.map