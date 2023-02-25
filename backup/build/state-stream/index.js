"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateStream = void 0;
const assert = require("assert");
const EventEmitter = require("events");
const event_buffer_1 = require("./event-buffer");
class StateStream extends EventEmitter {
    constructor(currentPromise, ee, event, before) {
        super();
        this.currentPromise = currentPromise;
        this.before = before;
        this.state = 0 /* State.BUFFERING */;
        this.eventBuffer = new event_buffer_1.EventBuffer(ee, event);
        this.errorBuffer = new event_buffer_1.EventBuffer(ee, 'error');
        this.open();
    }
    async open() {
        let current;
        try {
            current = await this.currentPromise;
        }
        catch (error) {
            this.emit('error', error);
            return;
        }
        this.eventBuffer.flush();
        this.errorBuffer.flush();
        this.state = 1 /* State.FLUSHING */;
        this.emit('state', current);
        let started = false;
        this.eventBuffer.on('event', state => {
            if (started || (started = this.before(current, state)))
                this.emit('state', state);
        });
        this.errorBuffer.on('event', error => void this.emit('error', error));
    }
    close() {
        assert(this.state !== 0 /* State.BUFFERING */);
        this.state = 2 /* State.DETACHED */;
        this.eventBuffer.close();
        this.errorBuffer.close();
    }
}
exports.StateStream = StateStream;
//# sourceMappingURL=index.js.map