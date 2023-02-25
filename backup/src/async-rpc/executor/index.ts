import { ChangeStream, ChangeStreamDocument } from "mongodb";
import { Document, Req, Res } from "../interfaces";
import { Adoption } from "./adoption";
import { Failure } from "./failure";
import { Success } from "./success";
import { createStartable, Startable } from "startable";
import { Loop, Pollerloop } from "pollerloop";
import { nodeTimeEngine } from "node-time-engine";


interface Execute<
	params extends readonly unknown[],
	result,
> {
	(...params: params): Promise<result>;
}

export class Executor<
	method extends string,
	params extends readonly unknown[],
	result,
	errDesc,
>  {
	public $s = createStartable(
		this.rawStart.bind(this),
		this.rawStop.bind(this),
	);

	private pollerloop: Pollerloop;

	public constructor(
		private stream: ChangeStream<Document, ChangeStreamDocument<Document>>,
		private adoption: Adoption,
		private success: Success,
		private failure: Failure,
		private method: method,
		private execute: Execute<params, result>,
	) {
		this.pollerloop = new Pollerloop(this.loop, nodeTimeEngine);
	}

	private listener = async (notif: ChangeStreamDocument<Document>) => {
		if (notif.operationType !== 'insert') return;
		if (notif.fullDocument.request.method !== this.method) return;

		const doc = await this.adoption.adopt<method, params>(this.method);
		await this.execute(...doc.request.params).then(
			result => void this.success.succeed(doc, result),
			(err: errDesc) => void this.failure.fail(doc, err),
		);
	}

	private loop: Loop = async sleep => {
		try {
			for (; ; await sleep(0)) {
				const doc = await this.adoption.adopt<method, params>(this.method);
				this.execute(...doc.request.params).then(
					result => void this.success.succeed(doc, result),
					(err: errDesc) => void this.failure.fail(doc, err),
				);
			}
		} catch (err) {
			if (err instanceof Adoption.OrphanNotFound) { }
			else throw err;
		}
	}

	private async rawStart() {
		this.stream.on('change', this.listener);
		await this.pollerloop.$s.start(this.$s.stop);
	}

	private async rawStop() {
		this.stream.off('change', this.listener);
		await this.pollerloop.$s.stop();
	}
}
