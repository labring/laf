import { Collection, Db, MongoClient, ObjectId, ChangeStream, ChangeStreamDocument } from 'mongodb';
import { Document } from '../document';
import EventEmitter = require('events');
import { TypedEventEmitter } from 'mongodb';
import { DeltaStream } from '@zimtsui/delta-stream';
import assert = require('assert');
import * as Exceptions from './exceptions';



export class Inquiry {
	private readonly broadcast = new EventEmitter() as TypedEventEmitter<Record<string, (doc: Document) => void>>;

	/**
	*  @param stream `coll.watch([], { fullDocument: 'updateLookup' })`
	*/
	public constructor(
		private readonly host: MongoClient,
		private readonly db: Db,
		private readonly coll: Collection<Document>,
		private readonly stream: ChangeStream<Document, ChangeStreamDocument<Document>>,
	) {
		this.broadcast.setMaxListeners(Number.POSITIVE_INFINITY);
		this.stream.on('error', err => {
			console.error(err);
			// TODO
			process.exit(1);
		});
		this.stream.on('change', notif => {
			if (notif.operationType === 'update')
				this.broadcast.emit(
					notif.fullDocument!._id.toHexString(),
					notif.fullDocument!,
				);
		});
	}

	private async find<
		methodName extends string,
		params extends readonly unknown[],
		result,
	>(
		id: string,
	): Promise<Document<methodName, params, result>> {
		const doc = await this.coll.findOne({
			_id: ObjectId.createFromHexString(id),
		}) as Document<methodName, params, result> | null;
		assert(doc !== null, new Exceptions.NotFound());
		return doc;
	}

	/**
	 *  @throws {@link Exceptions.NotFound}
	 */
	public inquire<
		methodName extends string,
		params extends readonly unknown[],
		result,
	>(
		id: string,
	): DeltaStream<Document<methodName, params, result>> {
		return new DeltaStream(
			this.find(id).then(doc => [doc]),
			this.broadcast,
			id,
			([doc0], doc) => doc0.state < doc.state,
		);
	}
}
