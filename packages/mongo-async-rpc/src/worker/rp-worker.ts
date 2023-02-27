import { ChangeStream, ChangeStreamDocument } from "mongodb";
import { Document } from "../document";
import { Adoption } from "./adoption";
import { Failure } from "./failure";
import { Success } from "./success";
import { $, AsRawStart, AsRawStop, Startable } from "@zimtsui/startable";
import { Pollerloop } from "@zimtsui/pollerloop";
import { nodeTimeEngine } from "@zimtsui/node-time-engine";
import { __ASSERT } from "../meta";



export class RpWorker<
	method extends string,
	params extends readonly unknown[],
	result,
>  {
	private pollerloop: Pollerloop;
	private rpcInstances = new Map<string, Startable>();

	public constructor(
		private stream: ChangeStream<Document, ChangeStreamDocument<Document>>,
		private adoption: Adoption,
		private success: Success,
		private failure: Failure,
		private method: method,
		private rpMaker: RpMaker<params, result>,
		private cancellable = false,
	) {
		this.pollerloop = new Pollerloop(this.loop, nodeTimeEngine);
		this.stream.on('error', $(this).stop);
	}

	private async callRemoteProcedure(
		doc: Document.Adopted<method, params>,
	) {
		const rp = this.rpMaker(...doc.request.params);
		try {
			await rp.start();

			this.rpcInstances.set(doc.request.id, rp);
			this.stream.on('change', this.cancellationListener);

			await rp.getRunning();
		} catch (err) {
			if (!(err instanceof Error)) throw new ExceptionNotAnError();
			if (err instanceof Successful) {
				this.success.succeed(doc, (<Successful<result>>err).result);
			} else if (!(err instanceof Cancelled)) {
				this.failure.fail(doc, err);
			};
		} finally {
			this.stream.off('change', this.cancellationListener);
			this.rpcInstances.delete(doc.request.id);
			await rp.stop();
		}
	}

	private cancellationListener = async (notif: ChangeStreamDocument<Document>) => {
		if (notif.operationType === 'update') {
			if (!this.rpcInstances.has(notif.fullDocument!.request.id)) return;
			const rp = this.rpcInstances.get(notif.fullDocument!.request.id)!;
			await rp.stop(new Cancelled());
		}
	}

	private listener = async (notif: ChangeStreamDocument<Document>) => {
		if (notif.operationType !== 'insert') return;
		if (notif.fullDocument.request.method !== this.method) return;

		let doc: Document.Adopted<method, params>;
		try {
			doc = await this.adoption.adopt<method, params>(this.method, this.cancellable);
		} catch (err) {
			if (err instanceof Adoption.OrphanNotFound) return;
			throw err;
		}
		await this.callRemoteProcedure(doc);
	}

	private loop: Pollerloop.Loop = async sleep => {
		try {
			for (; ; await sleep(0)) {
				const doc = await this.adoption.adopt<method, params>(this.method, this.cancellable);
				this.callRemoteProcedure(doc);
			}
		} catch (err) {
			if (err instanceof Adoption.OrphanNotFound) { }
			else throw err;
		}
	}

	@AsRawStart()
	private async rawStart() {
		this.stream.on('change', this.listener);
		await $(this.pollerloop).start($(this).stop);
	}

	@AsRawStop()
	private async rawStop() {
		this.stream.off('change', this.listener);
		await $(this.pollerloop).stop();
	}
}



export interface RpMaker<
	params extends readonly unknown[],
	result,
> {
	(...params: params): Startable;
}
export namespace RpMaker {
	export class Cancelled extends Error { }
	export class Successful<result> extends Error {
		public constructor(
			public result: result,
		) { super(); }
	}
}
import Cancelled = RpMaker.Cancelled;
import Successful = RpMaker.Successful;

export class ExceptionNotAnError extends Error { }
