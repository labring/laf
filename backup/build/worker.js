"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const executor_1 = require("./async-rpc/executor");
const assert = require("assert");
const mongodb_1 = require("mongodb");
const adoption_1 = require("./async-rpc/executor/adoption");
const success_1 = require("./async-rpc/executor/success");
const failure_1 = require("./async-rpc/executor/failure");
const execute_1 = require("./tasks/capture/execute");
const startable_adaptor_1 = require("startable-adaptor");
const startable_1 = require("startable");
assert(process.env.TASKLIST_HOST_URI);
assert(process.env.TASKLIST_DB);
assert(process.env.TASKLIST_COLL);
class Worker {
    constructor() {
        this.$s = (0, startable_1.createStartable)(this.rawStart.bind(this), this.rawStop.bind(this));
    }
    async rawStart() {
        this.host = new mongodb_1.MongoClient(process.env.TASKLIST_HOST_URI);
        this.host.on('close', () => void this.$s.stop());
        this.db = this.host.db(process.env.TASKLIST_DB);
        this.coll = this.db.collection(process.env.TASKLIST_COLL);
        this.stream = this.coll.watch();
        this.stream.on('close', () => void this.$s.stop());
        this.adoption = new adoption_1.Adoption(this.host, this.db, this.coll);
        this.success = new success_1.Success(this.host, this.db, this.coll);
        this.failure = new failure_1.Failure(this.host, this.db, this.coll);
        this.captureExecutor = new executor_1.Executor(this.stream, this.adoption, this.success, this.failure, 'capture', execute_1.execute);
        this.restoreExecutor = new executor_1.Executor(this.stream, this.adoption, this.success, this.failure, 'restore', execute_1.execute);
        await this.captureExecutor.$s.start(this.$s.stop);
        await this.restoreExecutor.$s.start(this.$s.stop);
    }
    async rawStop() {
        if (this.captureExecutor)
            await this.captureExecutor.$s.stop();
        if (this.restoreExecutor)
            await this.restoreExecutor.$s.stop();
        if (this.stream)
            await this.stream.close();
        if (this.host)
            await this.host.close();
    }
}
(0, startable_adaptor_1.adapt)(new Worker().$s);
//# sourceMappingURL=worker.js.map