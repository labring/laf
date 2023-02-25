import Koa = require('koa');
import Router = require('@koa/router');
import * as Capture from './tasks/capture/interfaces';
import { MongoClient } from 'mongodb';
import { Document } from './async-rpc/interfaces';
import assert = require('assert');
import { KoaWsFilter } from '@zimtsui/koa-ws-filter';
import { once } from 'events';
import { Submission } from './async-rpc/submission';
import { Cancellation } from './async-rpc/cancellation';
import { Inquiry } from './async-rpc/inquiry';

assert(process.env.TASKLIST_HOST);
assert(process.env.TASKLIST_DB);
assert(process.env.TASKLIST_COLL);
assert(process.env.PORT);

const host = new MongoClient(`mongodb://${process.env.TASKLIST_HOST}`);
const db = host.db(process.env.TASKLIST_DB);
const coll = db.collection<Document>(process.env.TASKLIST_COLL);
const stream = coll.watch([], { fullDocument: 'updateLookup' });

const submission = new Submission(host, db, coll);
const cancellation = new Cancellation(host, db, coll);
const inquiry = new Inquiry(host, db, coll, stream);



const router = new Router();
const filter = new KoaWsFilter();

filter.ws(async (ctx, next) => {
	assert(typeof ctx.query.id === 'string');

	try {
		const stream = inquiry.inquire(ctx.query.id);
		stream.on('error', () => void stream.close());

		const [doc0] = <[Document]>await once(stream, 'state');
		const ws = await ctx.upgrade();
		ws.on('close', () => stream.close());
		ws.send(JSON.stringify(doc0));

		stream.on('state', doc => void ws.send(JSON.stringify(doc)));
		await next();
	} catch (err) {
		if (err instanceof Inquiry.NotFound)
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
	assert(
		typeof ctx.query.lock === 'string' ||
		typeof ctx.query.lock === 'undefined'
	);
	try {
		const doc = await submission.submit<Capture.Method, Capture.Params>(
			'capture',
			[ctx.query.db, ctx.query.bucket, ctx.query.object],
			ctx.query.lock,
		);
		ctx.status = 201;
		ctx.body = doc;
	} catch (err) {
		if (err instanceof Submission.Locked) {
			ctx.status = 409;
			ctx.body = err.doc;
		} else throw err;
	}
	await next();
});


router.delete('/', async (ctx, next) => {
	assert(typeof ctx.query.id === 'string');
	try {
		const doc = await cancellation.cancel(ctx.query.id);
		ctx.status = 200;
		ctx.body = doc;
	} catch (err) {
		if (err instanceof Cancellation.AlreadyExits) {
			ctx.status = 208;
			ctx.body = err.doc;
		} else if (err instanceof Cancellation.NotFound) {
			ctx.status = 404;
		} else throw err;
	}
});

const app = new Koa();
app.use(router.routes());

app.listen(Number.parseInt(process.env.PORT));
