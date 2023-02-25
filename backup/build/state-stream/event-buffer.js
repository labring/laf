"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBuffer = void 0;
const EventEmitter = require("events");
const semque_1 = require("../semque");
class EventBuffer extends EventEmitter {
    constructor(ee, event) {
        super();
        this.ee = ee;
        this.event = event;
        this.q = new semque_1.Semque();
        this.pipe = (...params) => void this.q.push(params);
        this.ee.on(this.event, this.pipe);
    }
    async flush() {
        try {
            for (;;) {
                const params = await this.q.pop();
                this.emit('event', ...params);
            }
        }
        catch (err) {
            if (err instanceof EventBuffer.Closed)
                return;
            throw err;
        }
    }
    close() {
        this.ee.off(this.event, this.pipe);
        this.q.throw(new EventBuffer.Closed());
    }
}
exports.EventBuffer = EventBuffer;
(function (EventBuffer) {
    class Closed extends Error {
    }
    EventBuffer.Closed = Closed;
})(EventBuffer = exports.EventBuffer || (exports.EventBuffer = {}));
//# sourceMappingURL=event-buffer.js.map