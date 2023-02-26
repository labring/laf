import { Collection, Db, ModifyResult, MongoClient, ObjectId } from 'mongodb';
import { Document } from './interfaces';


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
				'state': {
					$in: [
						Document.State.ORPHAN,
						Document.State.ADOPTED,
					],
				},
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
}

import AlreadyExits = Cancellation.AlreadyExits;
import NotFound = Cancellation.NotFound;
