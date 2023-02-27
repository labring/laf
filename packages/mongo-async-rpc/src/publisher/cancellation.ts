import { Collection, Db, ModifyResult, MongoClient, ObjectId } from 'mongodb';
import { Document } from '../document';


export class Cancellation {
	public constructor(
		private host: MongoClient,
		private db: Db,
		private coll: Collection<Document>,
	) { }

	public async cancel(
		id: string,
	): Promise<Document> {
		const _id = ObjectId.createFromHexString(id);

		let newDoc: Document | null;
		const session = this.host.startSession();
		try {
			session.startTransaction();
			({ value: newDoc } = await this.coll.findOneAndUpdate({
				_id,
				$or: [{
					'state': Document.State.ORPHAN,
				}, {
					'state': Document.State.ADOPTED,
					'cancellable': true,
				}],
			}, {
				$set: {
					'state': Document.State.CANCELLED,
					'cancelTime': Date.now(),
				},
			}, {
				session,
				returnDocument: 'after',
			}) as ModifyResult<Document>);

			await session.commitTransaction();
		} catch (err) {
			await session.abortTransaction();
			throw err;
		} finally {
			await session.endSession();
		}

		if (newDoc !== null) return newDoc;
		const doc = await this.coll.findOne({
			_id,
		});
		if (doc === null) throw new NotFound();
		if ([
			Document.State.CANCELLED,
			Document.State.SUCCEEDED,
			Document.State.FAILED,
		].includes(doc.state))
			throw new AlreadyExits(doc as Document.Cancelled | Document.Succeeded | Document.Failed);
		if (doc.state === Document.State.ADOPTED && !doc.cancellable)
			throw new CancellationNotAllowed(doc);
		throw new Error();
	}
}


export namespace Cancellation {
	export class AlreadyExits extends Error {
		public constructor(
			public doc: Document.Cancelled | Document.Succeeded | Document.Failed,
		) { super(); }
	}
	export class NotFound extends Error { }
	export class CancellationNotAllowed extends Error {
		public constructor(
			public doc: Document.Adopted,
		) { super(); }
	}
}

import AlreadyExits = Cancellation.AlreadyExits;
import NotFound = Cancellation.NotFound;
import CancellationNotAllowed = Cancellation.CancellationNotAllowed;
