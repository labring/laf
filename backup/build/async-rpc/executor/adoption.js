"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adoption = void 0;
const assert = require("assert");
class Adoption {
    constructor(host, db, coll) {
        this.host = host;
        this.db = db;
        this.coll = coll;
    }
    async adopt(method) {
        let newDoc;
        const session = this.host.startSession();
        try {
            session.startTransaction();
            ({ value: newDoc } = await this.coll.findOneAndUpdate({
                'request.method': method,
                'state': 0 /* Document.State.ORPHAN */,
            }, {
                $set: {
                    'state': 1 /* Document.State.ADOPTED */,
                    'adoptTime': Date.now(),
                }
            }, {
                session,
                returnDocument: 'after',
            }));
            await session.commitTransaction();
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            await session.endSession();
        }
        assert(newDoc !== null, new OrphanNotFound());
        return newDoc;
    }
}
exports.Adoption = Adoption;
(function (Adoption) {
    class OrphanNotFound extends Error {
    }
    Adoption.OrphanNotFound = OrphanNotFound;
})(Adoption = exports.Adoption || (exports.Adoption = {}));
var OrphanNotFound = Adoption.OrphanNotFound;
//# sourceMappingURL=adoption.js.map