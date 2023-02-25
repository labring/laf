"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Semque = void 0;
const coroutine_locks_1 = require("@zimtsui/coroutine-locks");
const CoroutineLocks = require("@zimtsui/coroutine-locks");
class Semque {
    constructor() {
        this.sem = new coroutine_locks_1.Semaphore();
        this.queue = [];
    }
    push(x) {
        this.sem.v();
        this.queue.push(x);
    }
    async pop() {
        await this.sem.p();
        return this.queue.pop();
    }
    throw(err) {
        this.sem.throw(err);
    }
    tryPop() {
        this.sem.tryp();
        return this.queue.pop();
    }
}
exports.Semque = Semque;
(function (Semque) {
    Semque.TryLockError = CoroutineLocks.TryLockError;
})(Semque = exports.Semque || (exports.Semque = {}));
//# sourceMappingURL=semque.js.map