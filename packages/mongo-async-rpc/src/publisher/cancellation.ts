import { Collection, Db, ModifyResult, MongoClient, ObjectId } from 'mongodb';
import { Document } from '../document';
import * as Exceptions from './exceptions';


export class Cancellation {
	public constructor(
		private readonly host: MongoClient,
		private readonly db: Db,
		private readonly coll: Collection<Document>,
	) { }

	/**
	 *  @throws {@link Exceptions.AlreadyExits}
	 *  @throws {@link Exceptions.NotFound}
	 *  @throws {@link Exceptions.CancellationNotAllowed}
	 */
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
		if (doc === null) throw new Exceptions.NotFound();
		if ([
			Document.State.CANCELLED,
			Document.State.SUCCEEDED,
			Document.State.FAILED,
		].includes(doc.state))
			throw new Exceptions.AlreadyExits(doc as Document.Cancelled | Document.Succeeded | Document.Failed);
		if (doc.state === Document.State.ADOPTED && !doc.cancellable)
			throw new Exceptions.CancellationNotAllowed(doc);
		throw new Error();
	}
}
