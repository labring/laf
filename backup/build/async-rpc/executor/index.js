"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executor = void 0;
const adoption_1 = require("./adoption");
const startable_1 = require("startable");
const pollerloop_1 = require("pollerloop");
const node_time_engine_1 = require("node-time-engine");
class Executor {
    constructor(stream, adoption, success, failure, method, execute) {
        this.stream = stream;
        this.adoption = adoption;
        this.success = success;
        this.failure = failure;
        this.method = method;
        this.execute = execute;
        this.$s = (0, startable_1.createStartable)(this.rawStart.bind(this), this.rawStop.bind(this));
        this.listener = async (notif) => {
            if (notif.operationType !== 'insert')
                return;
            if (notif.fullDocument.request.method !== this.method)
                return;
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
        await this.pollerloop.$s.start(this.$s.stop);
    }
    async rawStop() {
        this.stream.off('change', this.listener);
        await this.pollerloop.$s.stop();
    }
}
exports.Executor = Executor;
//# sourceMappingURL=index.js.map