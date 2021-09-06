"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
exports.main = async function (ctx) {
    console.log(ctx);
    console.log(crypto);
    return 'ok';
};
