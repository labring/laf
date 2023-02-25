"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Success = void 0;
const assert = require("assert");
class Success {
    constructor(host, db, coll) {
        this.host = host;
        this.db = db;
        this.coll = coll;
    }
    async succeed(doc, result) {
        let modifiedCount;
        const session = this.host.startSession();
        try {
            session.startTransaction();
            const res = {
                jsonrpc: '2.0',
                id: doc.request.id,
                result,
            };
            ({ modifiedCount } = await this.coll.updateOne({
                _id: doc._id,
                state: 1 /* Document.State.ADOPTED */,
            }, {
                $set: {
                    'state': 3 /* Document.State.SUCCEEDED */,
                    'succeedTime': Date.now(),
                    'response': res,
                }
            }, { session }));
            await session.commitTransaction();
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            await session.endSession();
        }
        assert(modifiedCount === 1, new AdoptedTaskNotFound());
    }
}
exports.Success = Success;
(function (Success) {
    class AdoptedTaskNotFound extends Error {
    }
    Success.AdoptedTaskNotFound = AdoptedTaskNotFound;
})(Success = exports.Success || (exports.Success = {}));
var AdoptedTaskNotFound = Success.AdoptedTaskNotFound;
//# sourceMappingURL=success.js.map