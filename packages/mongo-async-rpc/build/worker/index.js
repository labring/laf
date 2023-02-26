"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executor = void 0;
const adoption_1 = require("./adoption");
const startable_1 = require("@zimtsui/startable");
const pollerloop_1 = require("@zimtsui/pollerloop");
const node_time_engine_1 = require("@zimtsui/node-time-engine");
class Executor {
    constructor(stream, adoption, success, failure, method, execute) {
        this.stream = stream;
        this.adoption = adoption;
        this.success = success;
        this.failure = failure;
        this.method = method;
        this.execute = execute;
        this.listener = async (notif) => {
            if (notif.operationType !== 'insert')
                return;
            if (notif.fullDocument.request.method !== this.method)
                return;
            // TODO catch
            const doc = await this.adoption.adopt(this.method);
            await this.execute(...doc.request.params).then(result => void this.success.succeed(doc, result), (err) => void this.failure.fail(doc, err));
        };
        this.loop = async (sleep) => {
            try {
                for (;; await sleep(0)) {
                    const doc = await this.adoption.adopt(this.method);
                    this.execute(...doc.request.params).then(result => void this.success.succeed(doc, result), (err) => void this.failure.fail(doc, err));
                }
            }
            catch (err) {
                if (err instanceof adoption_1.Adoption.OrphanNotFound) { }
                else
                    throw err;
            }
        };
        this.pollerloop = new pollerloop_1.Pollerloop(this.loop, node_time_engine_1.nodeTimeEngine);
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
], Executor.prototype, "rawStart", null);
__decorate([
    (0, startable_1.AsRawStop)()
], Executor.prototype, "rawStop", null);
exports.Executor = Executor;
//# sourceMappingURL=index.js.map