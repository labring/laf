"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submission = void 0;
const assert = require("assert");
const mongodb_1 = require("mongodb");
class Submission {
    constructor(host, db, coll) {
        this.host = host;
        this.db = db;
        this.coll = coll;
    }
    async submit(method, params, lock) {
        const _id = new mongodb_1.ObjectId();
        const id = _id.toHexString();
        if (!lock)
            lock = id;
        let newDoc;
        let oldDoc;
        const session = this.host.startSession();
        try {
            session.startTransaction();
            newDoc = {
                _id,
                state: 0 /* Document.State.ORPHAN */,
                request: {
                    jsonrpc: '2.0',
                    id,
                    method,
                    params,
                },
                lock,
                submitTime: Date.now(),
            };
            ({ value: oldDoc } = await this.coll.findOneAndUpdate({
                'lock': lock,
                'state': {
                    $in: [
                        0 /* Document.State.ORPHAN */,
                        1 /* Document.State.ADOPTED */,
                    ],
                },
            }, {
                $setOnInsert: newDoc,
            }, {
                upsert: true,
                session,
            }));
            await session.commitTransaction();
        }
        catch (err) {
            await session.abortTransaction();
            throw err;
        }
        finally {
            await session.endSession();
        }
        assert(oldDoc === null, new Locked(oldDoc));
        return newDoc;
    }
}
exports.Submission = Submission;
(function (Submission) {
    class Locked extends Error {
        constructor(doc) {
            super();
            this.doc = doc;
        }
    }
    Submission.Locked = Locked;
})(Submission = exports.Submission || (exports.Submission = {}));
var Locked = Submission.Locked;
//# sourceMappingURL=submission.js.map