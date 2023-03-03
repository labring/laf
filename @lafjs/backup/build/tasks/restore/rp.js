"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rp = void 0;
const child_process_1 = require("child_process");
const path_1 = require("path");
const assert = require("assert");
const startable_1 = require("@zimtsui/startable");
const mongo_async_rpc_1 = require("mongo-async-rpc");
assert(process.env.BACKUP_MONGO_HOST_URI);
assert(process.env.BACKUP_S3_HOST_ALIAS);
class Rp {
    constructor(bucket, object, db) {
        this.bucket = bucket;
        this.object = object;
        this.db = db;
    }
    rawStart() {
        this.cp = (0, child_process_1.spawn)((0, path_1.resolve)(__dirname, '../../../mongo-backup'), [
            'restore',
            this.bucket,
            this.object,
            this.db,
        ], {
            detached: true,
            stdio: ['ignore', 'ignore', 'pipe'],
        });
        this.cp.once('exit', async (code, signal) => {
            if (code === 0)
                (0, startable_1.$)(this).stop(new mongo_async_rpc_1.Worker.RpFactoryLike.Successful(null));
            else {
                const stderr = await this.stderrPromise;
                (0, startable_1.$)(this).stop(new Rp.Failed(code, signal, stderr));
            }
        });
        this.stderrPromise = (async () => {
            const fragments = [];
            for await (const fragment of this.cp.stderr)
                fragments.push(fragment);
            return ''.concat(...fragments);
        })();
        this.stderrPromise.catch(() => { });
    }
    async rawStop() {
        if (this.cp && this.cp.exitCode === null) {
            process.kill(-this.cp.pid, 'SIGINT');
        }
    }
}
__decorate([
    (0, startable_1.AsRawStart)()
], Rp.prototype, "rawStart", null);
__decorate([
    (0, startable_1.AsRawStop)()
], Rp.prototype, "rawStop", null);
exports.Rp = Rp;
(function (Rp) {
    class Failed extends Error {
        constructor(code, signal, message) {
            super(message);
            this.code = code;
            this.signal = signal;
        }
    }
    Rp.Failed = Failed;
})(Rp = exports.Rp || (exports.Rp = {}));
//# sourceMappingURL=rp.js.map