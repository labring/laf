"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const Router = require("@koa/router");
const mongodb_1 = require("mongodb");
const assert = require("assert");
const koa_ws_filter_1 = require("@zimtsui/koa-ws-filter");
const events_1 = require("events");
const submission_1 = require("./async-rpc/submission");
const cancellation_1 = require("./async-rpc/cancellation");
const inquiry_1 = require("./async-rpc/inquiry");
assert(process.env.TASKLIST_HOST);
assert(process.env.TASKLIST_DB);
assert(process.env.TASKLIST_COLL);
assert(process.env.PORT);
const host = new mongodb_1.MongoClient(`mongodb://${process.env.TASKLIST_HOST}`);
const db = host.db(process.env.TASKLIST_DB);
const coll = db.collection(process.env.TASKLIST_COLL);
const stream = coll.watch([], { fullDocument: 'updateLookup' });
const submission = new submission_1.Submission(host, db, coll);
const cancellation = new cancellation_1.Cancellation(host, db, coll);
const inquiry = new inquiry_1.Inquiry(host, db, coll, stream);
const router = new Router();
const filter = new koa_ws_filter_1.KoaWsFilter();
filter.ws(async (ctx, next) => {
    assert(typeof ctx.query.id === 'string');
    try {
        const stream = inquiry.inquire(ctx.query.id);
        stream.on('error', () => void stream.close());
        const [doc0] = await (0, events_1.once)(stream, 'state');
        const ws = await ctx.upgrade();
        ws.on('close', () => stream.close());
        ws.send(JSON.stringify(doc0));
        stream.on('state', doc => void ws.send(JSON.stringify(doc)));
        await next();
    }
    catch (err) {
        if (err instanceof inquiry_1.Inquiry.NotFound)
            ctx.status = 404;
        else
            throw err;
    }
});
router.get('/', filter.protocols());
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
        if (err instanceof submission_1.Submission.Locked) {
            ctx.status = 409;
            ctx.body = err.doc;
        }
        else
            throw err;
    }
    await next();
});
router.delete('/', async (ctx, next) => {
    assert(typeof ctx.query.id === 'string');
    try {
        const doc = await cancellation.cancel(ctx.query.id);
        ctx.status = 200;
        ctx.body = doc;
    }
    catch (err) {
        if (err instanceof cancellation_1.Cancellation.AlreadyExits) {
            ctx.status = 208;
            ctx.body = err.doc;
        }
        else if (err instanceof cancellation_1.Cancellation.NotFound) {
            ctx.status = 404;
        }
        else
            throw err;
    }
});
const app = new Koa();
app.use(router.routes());
app.listen(Number.parseInt(process.env.PORT));
//# sourceMappingURL=app.js.map