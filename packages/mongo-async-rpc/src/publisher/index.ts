import { MongoClient, Db, Collection, ChangeStream, ChangeStreamDocument, Filter } from "mongodb";
import { Document } from "../document";
import { Inquiry } from "./inquiry";
import { Listing } from "./listing";
import { Submission } from "./submission";
import { Cancellation } from "./cancellation";
import { DeltaStream } from "@zimtsui/delta-stream";
import * as Exceptions from './exceptions';


export class Publisher {
	private host: MongoClient;
	private db: Db;
	private coll: Collection<Document>;
	private submission: Submission;
	private listing: Listing;
	private cancellation: Cancellation;
	private inquiry: Inquiry;
	private stream: ChangeStream<Document, ChangeStreamDocument<Document>>;

	public constructor(
		hostUri: string,
		dbName: string,
		collName: string,
	) {
		this.host = new MongoClient(hostUri);
		this.db = this.host.db(dbName);
		this.coll = this.db.collection(collName);
		this.stream = this.coll.watch([], { fullDocument: 'updateLookup' });
		this.submission = new Submission(this.host, this.db, this.coll);
		this.listing = new Listing(this.host, this.db, this.coll);
		this.cancellation = new Cancellation(this.host, this.db, this.coll);
		this.inquiry = new Inquiry(this.host, this.db, this.coll, this.stream);
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
		return this.inquiry.inquire(id);
	}

	public async list<
		methodName extends string,
		params extends readonly unknown[],
		result,
	>(
		filter: Filter<Document>
	): Promise<Document<methodName, params, result>[]> {
		return await this.listing.list(filter);
	}

	/**
	 *  @throws {@link Exceptions.AlreadyExits}
	 *  @throws {@link Exceptions.NotFound}
	 *  @throws {@link Exceptions.CancellationNotAllowed}
	 */
	public async cancel(
		id: string,
	): Promise<Document> {
		return await this.cancellation.cancel(id);
	}

	/**
	 *  @throws {@link Exceptions.Locked}
	 */
	public async submit<
		methodName extends string,
		params extends readonly unknown[],
	>(
		methodName: methodName,
		params: params,
		lock?: string,
	): Promise<Document.Orphan<methodName, params>> {
		return await this.submission.submit(methodName, params, lock);
	}
}

export namespace Publisher {
	export import NotFound = Exceptions.NotFound;
	export import AlreadyExits = Exceptions.AlreadyExits;
	export import CancellationNotAllowed = Exceptions.CancellationNotAllowed;
	export import Locked = Exceptions.Locked;
}
