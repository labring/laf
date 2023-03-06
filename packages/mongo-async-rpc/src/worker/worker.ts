import { ChangeStream, ChangeStreamDocument, Collection, Db, MongoClient } from "mongodb";
import { Document } from "../document";
import { Adoption } from "./adoption";
import { Failure } from "./failure";
import { Success } from "./success";
import { $, AsRawStart, AsRawStop, Startable } from "@zimtsui/startable";
import { Pollerloop } from "@zimtsui/pollerloop";
import { nodeTimeEngine } from "@zimtsui/node-time-engine";
import { RpManager } from "./rp-manager";
import { RpFactoryLike } from "./rp-factory-like";


export class Worker<
	methodName extends string,
	params extends readonly unknown[],
	result,
>  {
	private adoption: Adoption;
	private success: Success;
	private failure: Failure;
	private pollerloop: Pollerloop;
	private rpManager = new RpManager(this.coll, this.stream, this.rpFactory);

	/**
	*  @param stream `coll.watch([], { fullDocument: 'updateLookup' })`
	*/
	public constructor(
		private host: MongoClient,
		private db: Db,
		private coll: Collection<Document>,
		private stream: ChangeStream<Document, ChangeStreamDocument<Document>>,
		private methodName: methodName,
		private rpFactory: RpFactoryLike<params, result>,
		private cancellable = false,
	) {
		this.adoption = new Adoption(this.host, this.db, this.coll);
		this.success = new Success(this.host, this.db, this.coll);
		this.failure = new Failure(this.host, this.db, this.coll);

		this.pollerloop = new Pollerloop(this.loop, nodeTimeEngine);
		this.stream.on('error', $(this).stop);
	}

	private onInsert = async (notif: ChangeStreamDocument<Document>) => {
		try {
			if (notif.operationType !== 'insert') return;
			if (notif.fullDocument.request.method !== this.methodName) return;

			let doc: Document.Adopted<methodName, params>;
			try {
				doc = await this.adoption.adopt<methodName, params>(this.methodName, this.cancellable);
			} catch (err) {
				if (err instanceof Adoption.OrphanNotFound) return;
				throw err;
			}
			await this.handleDoc(doc);
		} catch (err) {
			$(this).stop(<Error>err);
		}
	}

	private async handleDoc(
		doc: Document.Adopted<methodName, params>,
	) {
		try {
			let result: result;
			try {
				result = await this.rpManager.call(doc);
			} catch (err) {
				if (err instanceof RpManager.ResultNotThrown) {
					$(this).stop(err);
					return;
				} else if (err instanceof RpFactoryLike.Cancelled)
					return;
				else
					return void await this.failure.fail(doc, <Error>err);
			}
			await this.success.succeed(doc, result);
		} catch (err) {
			if (err instanceof Success.AdoptedTaskNotFound) return;
			else if (err instanceof Failure.AdoptedTaskNotFound) return;
			else throw err;
		}
	}

	private loop: Pollerloop.Loop = async sleep => {
		try {
			for (; ; await sleep(0)) {
				const doc = await this.adoption.adopt<methodName, params>(this.methodName, this.cancellable);
				this.handleDoc(doc).catch($(this).stop);
			}
		} catch (err) {
			if (err instanceof Adoption.OrphanNotFound) { }
			else throw err;
		}
	}

	@AsRawStart()
	private async rawStart() {
		await $(this.rpManager).start($(this).stop);

		this.stream.on('change', this.onInsert);
		await $(this.pollerloop).start($(this).stop);
	}

	@AsRawStop()
	private async rawStop() {
		await $(this.pollerloop).stop();
		this.stream.off('change', this.onInsert);

		await $(this.rpManager).start();
	}
}
