"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const mongodb_1 = require("mongodb");
const mongo_async_rpc_1 = require("@lafjs/mongo-async-rpc");
const Capture = require("./tasks/capture");
const Restore = require("./tasks/restore");
// import { adapt } from "startable-adaptor";
const startable_1 = require("@zimtsui/startable");
assert(process.env.TASKLIST_HOST_URI);
assert(process.env.TASKLIST_DB);
assert(process.env.TASKLIST_COLL);
class WorkerNode {
    async rawStart() {
        this.host = new mongodb_1.MongoClient(process.env.TASKLIST_HOST_URI);
        this.host.on('close', () => void (0, startable_1.$)(this).stop());
        this.db = this.host.db(process.env.TASKLIST_DB);
        this.coll = this.db.collection(process.env.TASKLIST_COLL);
        this.stream = this.coll.watch([], { fullDocument: 'updateLookup' });
        this.stream.on('close', () => void (0, startable_1.$)(this).stop());
        this.adoption = new mongo_async_rpc_1.Worker.Adoption(this.host, this.db, this.coll);
        this.success = new mongo_async_rpc_1.Worker.Success(this.host, this.db, this.coll);
        this.failure = new mongo_async_rpc_1.Worker.Failure(this.host, this.db, this.coll);
        this.captureWorker = new mongo_async_rpc_1.Worker.RpWorker(this.coll, this.stream, this.adoption, this.success, this.failure, 'capture', (db, bucket, object) => (0, startable_1.$)(new Capture.Rp(db, bucket, object)));
        this.restoreWorker = new mongo_async_rpc_1.Worker.RpWorker(this.coll, this.stream, this.adoption, this.success, this.failure, 'restore', (bucket, object, db) => (0, startable_1.$)(new Restore.Rp(bucket, object, db)));
        await (0, startable_1.$)(this.captureWorker).start((0, startable_1.$)(this).stop);
        await (0, startable_1.$)(this.restoreWorker).start((0, startable_1.$)(this).stop);
    }
    async rawStop() {
        if (this.captureWorker)
            await (0, startable_1.$)(this.captureWorker).stop();
        if (this.restoreWorker)
            await (0, startable_1.$)(this.restoreWorker).stop();
        if (this.stream)
            await this.stream.close();
        if (this.host)
            await this.host.close();
    }
}
__decorate([
    (0, startable_1.AsRawStart)()
], WorkerNode.prototype, "rawStart", null);
__decorate([
    (0, startable_1.AsRawStop)()
], WorkerNode.prototype, "rawStop", null);
// adapt(new Worker().$s);
//# sourceMappingURL=worker-node.js.map