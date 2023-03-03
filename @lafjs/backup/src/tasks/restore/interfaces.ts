import * as MongoAsyncRpc from "@lafjs/mongo-async-rpc";

export type Method = 'restore';

export type Params = [Params.Bucket, Params.Object, Params.Db];
export namespace Params {
	export type Db = string;
	export type Bucket = string;
	export type Object = string;
}

export type Result = null;

export namespace Document {
	export type Orphan = MongoAsyncRpc.Document.Orphan<Method, Params>;
	export type Adopted = MongoAsyncRpc.Document.Adopted<Method, Params>;
	export type Cancelled = MongoAsyncRpc.Document.Cancelled<Method, Params>;
	export type Succeeded = MongoAsyncRpc.Document.Succeeded<Method, Params, Result>;
	export type Failed = MongoAsyncRpc.Document.Failed<Method, Params>;
}

export type Document = MongoAsyncRpc.Document<Method, Params, Result>;
