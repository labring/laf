import assert = require("assert");
import { ChangeStream, Collection, Db, MongoClient } from "mongodb";
import { Document, Worker } from "@lafjs/mongo-async-rpc";
import * as Rp from './rp';
import { Capture, Restore } from "@lafjs/backup-interfaces";
// import { adapt } from "startable-adaptor";
import { $, AsRawStart, AsRawStop } from "@zimtsui/startable";



assert(process.env.TASKLIST_HOST_URI);
assert(process.env.TASKLIST_DB);
assert(process.env.TASKLIST_COLL);

class WorkerNode {
	private host?: MongoClient;
	private db?: Db;
	private coll?: Collection<Document>;
	private stream?: ChangeStream<Document>;

	private captureWorker?: Worker.Worker<Capture.Method, Capture.Params, Capture.Result>;
	private restoreWorker?: Worker.Worker<Restore.Method, Restore.Params, Restore.Result>;

	@AsRawStart()
	private async rawStart() {
		this.host = new MongoClient(process.env.TASKLIST_HOST_URI!);
		this.host.on('close', () => void $(this).stop());
		this.db = this.host.db(process.env.TASKLIST_DB!);
		this.coll = this.db.collection<Document>(process.env.TASKLIST_COLL!);
		this.stream = this.coll.watch([], { fullDocument: 'updateLookup' });
		this.stream.on('close', () => void $(this).stop());

		this.captureWorker = new Worker.Worker(
			this.host,
			this.db,
			this.coll,
			this.stream,
			'capture',
			({ dbUri, collNames, appid }) => $(new Rp.Capture(dbUri, collNames, appid)),
		);
		this.restoreWorker = new Worker.Worker(
			this.host,
			this.db,
			this.coll,
			this.stream,
			'restore',
			({ fileName, dbUri, appid }) => $(new Rp.Restore(fileName, dbUri, appid)),
		);
		await $(this.captureWorker).start($(this).stop);
		await $(this.restoreWorker).start($(this).stop);
	}

	@AsRawStop()
	private async rawStop() {
		if (this.captureWorker) await $(this.captureWorker).stop();
		if (this.restoreWorker) await $(this.restoreWorker).stop();
		if (this.stream) await this.stream.close();
		if (this.host) await this.host.close();
	}
}

// adapt(new Worker().$s);
