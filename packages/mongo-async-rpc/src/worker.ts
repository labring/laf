import { Executor } from "./async-rpc/executor";
import assert = require("assert");
import { ChangeStream, Collection, Db, MongoClient } from "mongodb";
import { Document } from "./async-rpc/interfaces";
import { Adoption } from "./async-rpc/executor/adoption";
import { Success } from "./async-rpc/executor/success";
import { Failure } from "./async-rpc/executor/failure";
import { execute } from "./tasks/capture/execute";
import * as Capture from "./tasks/capture/interfaces";
import * as Restore from './tasks/restore/interfaces';
import { adapt } from "startable-adaptor";
import { createStartable } from "startable";



assert(process.env.TASKLIST_HOST_URI);
assert(process.env.TASKLIST_DB);
assert(process.env.TASKLIST_COLL);

class Worker {
	public $s = createStartable(
		this.rawStart.bind(this),
		this.rawStop.bind(this),
	);
	private host?: MongoClient;
	private db?: Db;
	private coll?: Collection<Document>;
	private stream?: ChangeStream<Document>;

	private adoption?: Adoption;
	private success?: Success;
	private failure?: Failure;

	private captureExecutor?: Executor<Capture.Method, Capture.Params, Capture.Result, Capture.ErrDesc>;
	private restoreExecutor?: Executor<Restore.Method, Restore.Params, Restore.Result, Restore.ErrDesc>;

	private async rawStart() {
		this.host = new MongoClient(process.env.TASKLIST_HOST_URI!);
		this.host.on('close', () => void this.$s.stop());
		this.db = this.host.db(process.env.TASKLIST_DB!);
		this.coll = this.db.collection<Document>(process.env.TASKLIST_COLL!);
		this.stream = this.coll.watch();
		this.stream.on('close', () => void this.$s.stop());

		this.adoption = new Adoption(this.host, this.db, this.coll);
		this.success = new Success(this.host, this.db, this.coll);
		this.failure = new Failure(this.host, this.db, this.coll);

		this.captureExecutor = new Executor(
			this.stream,
			this.adoption,
			this.success,
			this.failure,
			'capture',
			execute,
		);
		this.restoreExecutor = new Executor(
			this.stream,
			this.adoption,
			this.success,
			this.failure,
			'restore',
			execute,
		);
		await this.captureExecutor.$s.start(this.$s.stop);
		await this.restoreExecutor.$s.start(this.$s.stop);
	}

	private async rawStop() {
		if (this.captureExecutor) await this.captureExecutor.$s.stop();
		if (this.restoreExecutor) await this.restoreExecutor.$s.stop();
		if (this.stream) await this.stream.close();
		if (this.host) await this.host.close();
	}
}

adapt(new Worker().$s);
