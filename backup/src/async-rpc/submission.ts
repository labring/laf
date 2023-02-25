import assert = require('assert');
import { Collection, Db, ModifyResult, MongoClient, ObjectId } from 'mongodb';
import { Document } from './interfaces';



export class Submission {
	public constructor(
		private host: MongoClient,
		private db: Db,
		private coll: Collection<Document>,
	) { }

	public async submit<
		method extends string,
		params extends readonly unknown[],
	>(
		method: method,
		params: params,
		lock?: string,
	): Promise<Document.Orphan<method, params>> {
		type orphan = Document.Orphan<method, params>;

		const _id = new ObjectId();
		const id = _id.toHexString();
		if (!lock) lock = id;

		let newDoc: orphan;
		let oldDoc: Document.Orphan | Document.Adopted | null;

		const session = this.host.startSession();
		try {
			session.startTransaction();
			newDoc = {
				_id,
				state: Document.State.ORPHAN,
				request: {
					jsonrpc: '2.0',
					id,
					method,
					params,
				},
				lock,
				submitTime: Date.now(),
			};

			({ value: oldDoc } = await this.coll.findOneAndUpdate({
				'lock': lock,
				'state': {
					$in: [
						Document.State.ORPHAN,
						Document.State.ADOPTED,
					],
				},
			}, {
				$setOnInsert: newDoc,
			}, {
				upsert: true,
				session,
			}) as ModifyResult<Document.Orphan | Document.Adopted>);

			await session.commitTransaction();
		} catch (err) {
			await session.abortTransaction();
			throw err;
		} finally {
			await session.endSession();
		}

		assert(oldDoc === null, new Locked(oldDoc!));
		return newDoc;
	}
}

export namespace Submission {
	export class Locked extends Error {
		public constructor(
			public doc: Document.Orphan | Document.Adopted,
		) { super(); }
	}
}

import Locked = Submission.Locked;
