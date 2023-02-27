"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpWorker = void 0;
const adoption_1 = require("./adoption");
const failure_1 = require("./failure");
const success_1 = require("./success");
const startable_1 = require("@zimtsui/startable");
const pollerloop_1 = require("@zimtsui/pollerloop");
const node_time_engine_1 = require("@zimtsui/node-time-engine");
const rp_manager_1 = require("./rp-manager");
const rp_factory_like_1 = require("./rp-factory-like");
class RpWorker {
    /**
    *  @param stream `coll.watch([], { fullDocument: 'updateLookup' })`
    */
    constructor(coll, stream, adoption, success, failure, method, rpFactory, cancellable = false) {
        this.coll = coll;
        this.stream = stream;
        this.adoption = adoption;
        this.success = success;
        this.failure = failure;
        this.method = method;
        this.rpFactory = rpFactory;
        this.cancellable = cancellable;
        this.rpManager = new rp_manager_1.RpManager(this.stream, this.coll, this.rpFactory);
        this.onInsert = async (notif) => {
            try {
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
                await this.handleDoc(doc);
            }
            catch (err) {
                (0, startable_1.$)(this).stop(err);
            }
        };
        this.loop = async (sleep) => {
            try {
                for (;; await sleep(0)) {
                    const doc = await this.adoption.adopt(this.method, this.cancellable);
                    this.handleDoc(doc).catch((0, startable_1.$)(this).stop);
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
    async handleDoc(doc) {
        try {
            let result;
            try {
                result = await this.rpManager.call(doc);
            }
            catch (err) {
                if (err instanceof rp_manager_1.RpManager.ResultNotThrown) {
                    (0, startable_1.$)(this).stop(err);
                    return;
                }
                else if (err instanceof rp_factory_like_1.RpFactoryLike.Cancelled)
                    return;
                else
                    return void await this.failure.fail(doc, err);
            }
            await this.success.succeed(doc, result);
        }
        catch (err) {
            if (err instanceof success_1.Success.AdoptedTaskNotFound)
                return;
            else if (err instanceof failure_1.Failure.AdoptedTaskNotFound)
                return;
            else
                throw err;
        }
    }
    async rawStart() {
        await (0, startable_1.$)(this.rpManager).start((0, startable_1.$)(this).stop);
        this.stream.on('change', this.onInsert);
        await (0, startable_1.$)(this.pollerloop).start((0, startable_1.$)(this).stop);
    }
    async rawStop() {
        await (0, startable_1.$)(this.pollerloop).stop();
        this.stream.off('change', this.onInsert);
        await (0, startable_1.$)(this.rpManager).start();
    }
}
__decorate([
    (0, startable_1.AsRawStart)()
], RpWorker.prototype, "rawStart", null);
__decorate([
    (0, startable_1.AsRawStop)()
], RpWorker.prototype, "rawStop", null);
exports.RpWorker = RpWorker;
//# sourceMappingURL=rp-worker.js.map