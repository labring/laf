"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cancellation = void 0;
const mongodb_1 = require("mongodb");
class Cancellation {
    constructor(host, db, coll) {
        this.host = host;
        this.db = db;
        this.coll = coll;
    }
    /**
     *  @throws {@link Cancellation.AlreadyExits}
     *  @throws {@link Cancellation.NotFound}
     *  @throws {@link Cancellation.CancellationNotAllowed}
     */
    async cancel(id) {
        const _id = mongodb_1.ObjectId.createFromHexString(id);
        let newDoc;
        const session = this.host.startSession();
        try {
            session.startTransaction();
            ({ value: newDoc } = await this.coll.findOneAndUpdate({
                _id,
                $or: [{
                        'state': 0 /* ORPHAN */,
                    }, {
                        'state': 1 /* ADOPTED */,
                        'cancellable': true,
                    }],
            }, {
                $set: {
                    'state': 2 /* CANCELLED */,
                    'cancelTime': Date.now(),
                },
            }, {
                session,
                returnDocument: 'after',
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
        if (newDoc !== null)
            return newDoc;
        const doc = await this.coll.findOne({
            _id,
        });
        if (doc === null)
            throw new NotFound();
        if ([
            2 /* CANCELLED */,
            3 /* SUCCEEDED */,
            4 /* FAILED */,
        ].includes(doc.state))
            throw new AlreadyExits(doc);
        if (doc.state === 1 /* ADOPTED */ && !doc.cancellable)
            throw new CancellationNotAllowed(doc);
        throw new Error();
    }
}
exports.Cancellation = Cancellation;
(function (Cancellation) {
    class AlreadyExits extends Error {
        constructor(doc) {
            super();
            this.doc = doc;
        }
    }
    Cancellation.AlreadyExits = AlreadyExits;
    class NotFound extends Error {
    }
    Cancellation.NotFound = NotFound;
    class CancellationNotAllowed extends Error {
        constructor(doc) {
            super();
            this.doc = doc;
        }
    }
    Cancellation.CancellationNotAllowed = CancellationNotAllowed;
})(Cancellation = exports.Cancellation || (exports.Cancellation = {}));
var AlreadyExits = Cancellation.AlreadyExits;
var NotFound = Cancellation.NotFound;
var CancellationNotAllowed = Cancellation.CancellationNotAllowed;
//# sourceMappingURL=cancellation.js.map