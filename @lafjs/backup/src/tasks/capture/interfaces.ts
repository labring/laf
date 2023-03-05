import * as MongoAsyncRpc from "@lafjs/mongo-async-rpc";

export type Method = 'capture';

export type Params = [{
	readonly dbUri: string;
	readonly collNames: string[];
	readonly appid: string;
}];

export interface Result {
	readonly fileName: string;
}

export namespace Document {
	export type Orphan = MongoAsyncRpc.Document.Orphan<Method, Params>;
	export type Adopted = MongoAsyncRpc.Document.Adopted<Method, Params>;
	export type Cancelled = MongoAsyncRpc.Document.Cancelled<Method, Params>;
	export type Succeeded = MongoAsyncRpc.Document.Succeeded<Method, Params, Result>;
	export type Failed = MongoAsyncRpc.Document.Failed<Method, Params>;
}

export type Document = MongoAsyncRpc.Document<Method, Params, Result>;
