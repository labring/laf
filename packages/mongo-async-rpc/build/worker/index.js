"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionNotAnError = exports.RemoteProcedureMaker = exports.Worker = void 0;
const adoption_1 = require("./adoption");
const startable_1 = require("@zimtsui/startable");
const pollerloop_1 = require("@zimtsui/pollerloop");
const node_time_engine_1 = require("@zimtsui/node-time-engine");
class Worker {
    constructor(stream, adoption, success, failure, method, rpMaker, cancellable = false) {
        this.stream = stream;
        this.adoption = adoption;
        this.success = success;
        this.failure = failure;
        this.method = method;
        this.rpMaker = rpMaker;
        this.cancellable = cancellable;
        this.rpcInstances = new Map();
        this.cancellationListener = async (notif) => {
            if (notif.operationType === 'update') {
                if (!this.rpcInstances.has(notif.fullDocument.request.id))
                    return;
                const rp = this.rpcInstances.get(notif.fullDocument.request.id);
                await rp.stop(new Cancelled());
            }
        };
        this.listener = async (notif) => {
            if (notif.operationType !== 'insert')
                return;
            if (notif.fullDocument.request.method !== this.method)
                return;
            let doc;
            try {
                doc = await this.adoption.adopt(this.method, this.cancellable);
            }
            catch (err) {
                if (err instanceof adoption_1.Adoption.OrphanNotFound)
                    return;
                throw err;
            }
            await this.callRemoteProcedure(doc);
        };
        this.loop = async (sleep) => {
            try {
                for (;; await sleep(0)) {
                    const doc = await this.adoption.adopt(this.method, this.cancellable);
                    this.callRemoteProcedure(doc);
                }
            }
            catch (err) {
                if (err instanceof adoption_1.Adoption.OrphanNotFound) { }
                else
                    throw err;
            }
        };
        this.pollerloop = new pollerloop_1.Pollerloop(this.loop, node_time_engine_1.nodeTimeEngine);
        this.stream.on('error', (0, startable_1.$)(this).stop);
    }
    async callRemoteProcedure(doc) {
        const rp = this.rpMaker(...doc.request.params);
        try {
            await rp.start();
            this.rpcInstances.set(doc.request.id, rp);
            this.stream.on('change', this.cancellationListener);
            await rp.getRunning();
        }
        catch (err) {
            if (!(err instanceof Error))
                throw new ExceptionNotAnError();
            if (err instanceof Successful) {
                this.success.succeed(doc, err.result);
            }
            else if (!(err instanceof Cancelled)) {
                this.failure.fail(doc, err);
            }
            ;
        }
        finally {
            this.stream.off('change', this.cancellationListener);
            this.rpcInstances.delete(doc.request.id);
            await rp.stop();
        }
    }
    async rawStart() {
        this.stream.on('change', this.listener);
        await (0, startable_1.$)(this.pollerloop).start((0, startable_1.$)(this).stop);
    }
    async rawStop() {
        this.stream.off('change', this.listener);
        await (0, startable_1.$)(this.pollerloop).stop();
    }
}
__decorate([
    (0, startable_1.AsRawStart)()
], Worker.prototype, "rawStart", null);
__decorate([
    (0, startable_1.AsRawStop)()
], Worker.prototype, "rawStop", null);
exports.Worker = Worker;
var RemoteProcedureMaker;
(function (RemoteProcedureMaker) {
    class Cancelled extends Error {
    }
    RemoteProcedureMaker.Cancelled = Cancelled;
    class Successful extends Error {
        constructor(result) {
            super();
            this.result = result;
        }
    }
    RemoteProcedureMaker.Successful = Successful;
})(RemoteProcedureMaker = exports.RemoteProcedureMaker || (exports.RemoteProcedureMaker = {}));
var Cancelled = RemoteProcedureMaker.Cancelled;
var Successful = RemoteProcedureMaker.Successful;
class ExceptionNotAnError extends Error {
}
exports.ExceptionNotAnError = ExceptionNotAnError;
//# sourceMappingURL=index.js.map