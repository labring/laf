import assert = require("assert");
import { Collection, Db, MongoClient } from "mongodb";
import { Document } from "../document";
import * as JsonRpc from 'node-json-rpc';


export class Success {
	public constructor(
		private host: MongoClient,
		private db: Db,
		private coll: Collection<Document>,
	) { }

	/**
	 *  @throws {@link Success.AdoptedTaskNotFound}
	 */
	public async succeed<
		method extends string,
		params extends readonly unknown[],
		result,
	>(
		doc: Document.Adopted<method, params>,
		result: result,
	) {
		let modifiedCount: number;

		const session = this.host.startSession();
		try {
			session.startTransaction();

			const res: JsonRpc.Res.Succ<result> = {
				jsonrpc: '2.0',
				id: doc.request.id,
				result,
			};
			({ modifiedCount } = await this.coll.updateOne({
				_id: doc._id,
				state: Document.State.ADOPTED,
			}, {
				$set: {
					'state': Document.State.SUCCEEDED,
					'succeedTime': Date.now(),
					'response': res,
				}
			}, { session }));

			await session.commitTransaction();
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			await session.endSession();
		}

		assert(modifiedCount === 1, new AdoptedTaskNotFound());
	}
}

export namespace Success {
	export class AdoptedTaskNotFound extends Error { }
}

import AdoptedTaskNotFound = Success.AdoptedTaskNotFound;
