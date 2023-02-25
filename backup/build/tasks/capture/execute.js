"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = require("path");
const assert = require("assert");
assert(process.env.BACKUP_MONGO_HOST_URI);
assert(process.env.BACKUP_S3_HOST_ALIAS);
async function execute(db, bucket, object) {
    return await (0, util_1.promisify)(child_process_1.execFile)((0, path_1.resolve)(__dirname, '../../../mongo-backup'), [
        'capture',
        db,
        bucket,
        object,
    ]).then(() => null, err => Promise.reject(new Error(err.stderr)));
}
exports.execute = execute;
//# sourceMappingURL=execute.js.map