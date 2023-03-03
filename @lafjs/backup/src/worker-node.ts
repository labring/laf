import assert = require("assert");
import { ChangeStream, Collection, Db, MongoClient } from "mongodb";
import { Document, Worker } from "@lafjs/mongo-async-rpc";
import * as Capture from "./tasks/capture";
import * as Restore from './tasks/restore';
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

	private adoption?: Worker.Adoption;
	private success?: Worker.Success;
	private failure?: Worker.Failure;

	private captureWorker?: Worker.RpWorker<Capture.Method, Capture.Params, Capture.Result>;
	private restoreWorker?: Worker.RpWorker<Restore.Method, Restore.Params, Restore.Result>;

	@AsRawStart()
	private async rawStart() {
		this.host = new MongoClient(process.env.TASKLIST_HOST_URI!);
		this.host.on('close', () => void $(this).stop());
		this.db = this.host.db(process.env.TASKLIST_DB!);
		this.coll = this.db.collection<Document>(process.env.TASKLIST_COLL!);
		this.stream = this.coll.watch([], { fullDocument: 'updateLookup' });
		this.stream.on('close', () => void $(this).stop());

		this.adoption = new Worker.Adoption(this.host, this.db, this.coll);
		this.success = new Worker.Success(this.host, this.db, this.coll);
		this.failure = new Worker.Failure(this.host, this.db, this.coll);

		this.captureWorker = new Worker.RpWorker(
			this.coll,
			this.stream,
			this.adoption,
			this.success,
			this.failure,
			'capture',
			(db, bucket, object) => $(new Capture.Rp(db, bucket, object)),
		);
		this.restoreWorker = new Worker.RpWorker(
			this.coll,
			this.stream,
			this.adoption,
			this.success,
			this.failure,
			'restore',
			(bucket, object, db) => $(new Restore.Rp(bucket, object, db)),
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
