import assert = require("assert");
import { Collection, Db, ModifyResult, MongoClient } from "mongodb";
import { Document } from "../document";


export class Adoption {
	public constructor(
		private host: MongoClient,
		private db: Db,
		private coll: Collection<Document>,
	) { }

	public async adopt<
		method extends string,
		params extends readonly unknown[],
	>(
		method: method,
		cancellable: boolean,
	): Promise<Document.Adopted<method, params>> {
		type adopted = Document.Adopted<method, params>;
		let newDoc: Document.Adopted<method, params> | null;

		const session = this.host.startSession();
		try {
			session.startTransaction();
			({ value: newDoc } = await this.coll.findOneAndUpdate({
				'request.method': method,
				'state': Document.State.ORPHAN,
			}, {
				$set: {
					'state': Document.State.ADOPTED,
					'adoptTime': Date.now(),
					'adoptor': 'unknown',
					'cancellable': cancellable,
				}
			}, {
				session,
				returnDocument: 'after',
			}) as Readonly<ModifyResult<adopted>>);
			await session.commitTransaction();
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			await session.endSession();
		}

		assert(newDoc !== null, new OrphanNotFound());
		return newDoc;
	}
}

export namespace Adoption {
	export class OrphanNotFound extends Error { }
}

import OrphanNotFound = Adoption.OrphanNotFound;
