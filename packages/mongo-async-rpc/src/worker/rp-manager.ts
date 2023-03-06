import { DeltaStream } from "@zimtsui/delta-stream";
import { AsRawStart, AsRawStop } from "@zimtsui/startable";
import EventEmitter = require("events");
import { ChangeStream, ChangeStreamDocument, Collection } from "mongodb";
import { Document } from "../document";
import { RpFactoryLike } from "./rp-factory-like";



export class RpManager<
	methodName extends string,
	params extends readonly unknown[],
	result,
> {
	private broadcast = new EventEmitter();

	public constructor(
		private coll: Collection<Document>,
		private stream: ChangeStream<Document, ChangeStreamDocument<Document>>,
		private rpFactory: RpFactoryLike<params, result>,
	) { }

	private onChange = (notif: ChangeStreamDocument<Document>) => {
		if (
			notif.operationType === 'update' &&
			notif.fullDocument!.state === Document.State.CANCELLED
		) this.broadcast.emit(notif.fullDocument!.request.id);
	}

	@AsRawStart()
	private rawStart() {
		this.stream.on('change', this.onChange);
	}

	@AsRawStop()
	private rawStop() {
		this.stream.off('change', this.onChange);
	}

	/**
	 *  @throws {@link RpFactoryLike.Cancelled}
	 *  @throws {@link RpManager.ResultNotThrown}
	 */
	public async call(
		doc: Document.Adopted<methodName, params>,
	): Promise<result> {
		let ee: DeltaStream<Document.Cancelled<methodName, params>> | null = null;
		const rp = this.rpFactory(...doc.request.params);
		try {
			await rp.start();

			ee = new DeltaStream(
				this.coll.findOne({
					_id: doc._id,
					'state': Document.State.CANCELLED,
				}).then(doc => {
					if (doc === null) return [];
					else return [doc];
				}),
				this.broadcast,
				doc.request.id,
				(stock, delta) => true,
			);

			ee.on('delta', () => rp.stop(new RpFactoryLike.Cancelled()));

			await rp.getRunning();
		} catch (err) {
			if (err instanceof RpFactoryLike.Successful) {
				return err.result;
			} else throw err;
		} finally {
			if (ee) ee.close();
			await rp.stop();
		}

		throw new RpManager.ResultNotThrown();
	}
}

export namespace RpManager {
	export class ResultNotThrown extends Error { }
}
