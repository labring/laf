"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpFactoryLike = void 0;
const startable_1 = require("@zimtsui/startable");
var RpFactoryLike;
(function (RpFactoryLike) {
    function from(f) {
        class Rp {
            constructor(params) {
                this.params = params;
            }
            rawStart() {
                f(...this.params).then(result => void (0, startable_1.$)(this).stop(new Successful(result)), err => void (0, startable_1.$)(this).stop(err));
            }
        }
        __decorate([
            (0, startable_1.AsRawStart)()
        ], Rp.prototype, "rawStart", null);
        return (...params) => (0, startable_1.$)(new Rp(params));
    }
    RpFactoryLike.from = from;
    class Cancelled extends Error {
    }
    RpFactoryLike.Cancelled = Cancelled;
    class Successful extends Error {
        constructor(result) {
            super();
            this.result = result;
        }
    }
    RpFactoryLike.Successful = Successful;
})(RpFactoryLike = exports.RpFactoryLike || (exports.RpFactoryLike = {}));
//# sourceMappingURL=rp-factory-like.js.map