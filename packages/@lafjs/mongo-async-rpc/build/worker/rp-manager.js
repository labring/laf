"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpManager = void 0;
const delta_stream_1 = require("@zimtsui/delta-stream");
const startable_1 = require("@zimtsui/startable");
const EventEmitter = require("events");
const rp_factory_like_1 = require("./rp-factory-like");
class RpManager {
    constructor(stream, coll, rpFactory) {
        this.stream = stream;
        this.coll = coll;
        this.rpFactory = rpFactory;
        this.broadcast = new EventEmitter();
        this.onChange = (notif) => {
            if (notif.operationType === 'update' &&
                notif.fullDocument.state === 2 /* Document.State.CANCELLED */)
                this.broadcast.emit(notif.fullDocument.request.id);
        };
    }
    rawStart() {
        this.stream.on('change', this.onChange);
    }
    rawStop() {
        this.stream.off('change', this.onChange);
    }
    /**
     *  @throws {@link RpFactoryLike.Cancelled}
     *  @throws {@link RpManager.ResultNotThrown}
     */
    async call(doc) {
        let ee = null;
        const rp = this.rpFactory(...doc.request.params);
        try {
            await rp.start();
            ee = new delta_stream_1.DeltaStream(this.coll.findOne({
                _id: doc._id,
                'state': 2 /* Document.State.CANCELLED */,
            }).then(doc => {
                if (doc === null)
                    return [];
                else
                    return [doc];
            }), this.broadcast, doc.request.id, (stock, delta) => true);
            ee.on('delta', () => rp.stop(new rp_factory_like_1.RpFactoryLike.Cancelled()));
            await rp.getRunning();
        }
        catch (err) {
            if (err instanceof rp_factory_like_1.RpFactoryLike.Successful) {
                return err.result;
            }
            else
                throw err;
        }
        finally {
            if (ee)
                ee.close();
            await rp.stop();
        }
        throw new RpManager.ResultNotThrown();
    }
}
__decorate([
    (0, startable_1.AsRawStart)()
], RpManager.prototype, "rawStart", null);
__decorate([
    (0, startable_1.AsRawStop)()
], RpManager.prototype, "rawStop", null);
exports.RpManager = RpManager;
(function (RpManager) {
    class ResultNotThrown extends Error {
    }
    RpManager.ResultNotThrown = ResultNotThrown;
})(RpManager = exports.RpManager || (exports.RpManager = {}));
//# sourceMappingURL=rp-manager.js.map