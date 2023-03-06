import { Collection, Db, MongoClient, ObjectId, ChangeStream, ChangeStreamDocument, Filter } from 'mongodb';
import { Document } from '../document';



export class List {
	public constructor(
		private host: MongoClient,
		private db: Db,
		private coll: Collection<Document>,
	) { }

	public async list<
		methodName extends string,
		params extends readonly unknown[],
		result,
	>(
		filter: Filter<Document>
	): Promise<Document<methodName, params, result>[]> {
		const docs = await this.coll.find<Document<methodName, params, result>>(filter)
			.toArray() as Document<methodName, params, result>[];
		return docs;
	}
}
