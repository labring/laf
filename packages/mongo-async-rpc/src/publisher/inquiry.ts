import { Collection, Db, MongoClient, ObjectId, ChangeStream, ChangeStreamDocument } from 'mongodb';
import { Document } from '../document';
import EventEmitter = require('events');
import { TypedEventEmitter } from 'mongodb';
import { DeltaStream } from '@zimtsui/delta-stream';
import assert = require('assert');



export class Inquiry {
	private broadcast = new EventEmitter() as TypedEventEmitter<Record<string, (doc: Document) => void>>;

	public constructor(
		private host: MongoClient,
		private db: Db,
		private coll: Collection<Document>,
		private stream: ChangeStream<Document, ChangeStreamDocument<Document>>,
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
		method extends string,
		params extends readonly unknown[],
		result,
	>(
		id: string,
	): Promise<Document<method, params, result>> {
		const doc = await this.coll.findOne({
			_id: ObjectId.createFromHexString(id),
		}) as Document<method, params, result> | null;
		assert(doc !== null, new NotFound());
		return doc;
	}

	public inquire<
		method extends string,
		params extends readonly unknown[],
		result,
	>(
		id: string,
	): DeltaStream<Document<method, params, result>> {
		return new DeltaStream(
			this.find(id).then(doc => [doc]),
			this.broadcast,
			id,
			([doc0], doc) => doc0.state < doc.state,
		);
	}
}

export namespace Inquiry {
	export class NotFound extends Error { }
}

import NotFound = Inquiry.NotFound;