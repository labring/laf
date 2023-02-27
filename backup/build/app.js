"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const Router = require("@koa/router");
const mongodb_1 = require("mongodb");
const mongo_async_rpc_1 = require("mongo-async-rpc");
const assert = require("assert");
const koa_ws_filter_1 = require("@zimtsui/koa-ws-filter");
const events_1 = require("events");
assert(process.env.TASKLIST_HOST);
assert(process.env.TASKLIST_DB);
assert(process.env.TASKLIST_COLL);
assert(process.env.PORT);
const host = new mongodb_1.MongoClient(`mongodb://${process.env.TASKLIST_HOST}`);
const db = host.db(process.env.TASKLIST_DB);
const coll = db.collection(process.env.TASKLIST_COLL);
const stream = coll.watch([], { fullDocument: 'updateLookup' });
const submission = new mongo_async_rpc_1.Publisher.Submission(host, db, coll);
const cancellation = new mongo_async_rpc_1.Publisher.Cancellation(host, db, coll);
const inquiry = new mongo_async_rpc_1.Publisher.Inquiry(host, db, coll, stream);
const router = new Router();
const filter = new koa_ws_filter_1.KoaWsFilter();
filter.ws(async (ctx, next) => {
    assert(typeof ctx.params.id === 'string');
    try {
        const stream = inquiry.inquire(ctx.params.id);
        stream.on('error', () => void stream.close());
        const [doc0] = await (0, events_1.once)(stream, 'delta');
        const ws = await ctx.upgrade();
        ws.on('close', () => stream.close());
        ws.send(JSON.stringify(doc0));
        stream.on('delta', doc => void ws.send(JSON.stringify(doc)));
        await next();
    }
    catch (err) {
        if (err instanceof mongo_async_rpc_1.Publisher.Inquiry.NotFound)
            ctx.status = 404;
        else
            throw err;
    }
});
router.get('/:id', filter.protocols());
router.post('/capture', async (ctx, next) => {
    assert(typeof ctx.query.db === 'string');
    assert(typeof ctx.query.bucket === 'string');
    assert(typeof ctx.query.object === 'string');
    assert(typeof ctx.query.lock === 'string' ||
        typeof ctx.query.lock === 'undefined');
    try {
        const doc = await submission.submit('capture', [ctx.query.db, ctx.query.bucket, ctx.query.object], ctx.query.lock);
        ctx.status = 201;
        ctx.body = doc;
    }
    catch (err) {
        if (err instanceof mongo_async_rpc_1.Publisher.Submission.Locked) {
            ctx.status = 409;
            ctx.body = err.doc;
        }
        else
            throw err;
    }
    await next();
});
router.delete('/:id', async (ctx, next) => {
    assert(typeof ctx.params.id === 'string');
    try {
        const doc = await cancellation.cancel(ctx.params.id);
        ctx.status = 200;
        ctx.body = doc;
    }
    catch (err) {
        if (err instanceof mongo_async_rpc_1.Publisher.Cancellation.AlreadyExits) {
            ctx.status = 208;
            ctx.body = err.doc;
        }
        else if (err instanceof mongo_async_rpc_1.Publisher.Cancellation.NotFound) {
            ctx.status = 404;
        }
        else if (err instanceof mongo_async_rpc_1.Publisher.Cancellation.CancellationNotAllowed) {
            ctx.status = 405;
        }
        else
            throw err;
    }
});
const app = new Koa();
app.use(router.routes());
app.listen(Number.parseInt(process.env.PORT));
//# sourceMappingURL=app.js.map