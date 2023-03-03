import * as MongoAsyncRpc from "@lafjs/mongo-async-rpc";
export type Method = 'restore';
export type Params = [Params.Bucket, Params.Object, Params.Db];
export declare namespace Params {
    type Db = string;
    type Bucket = string;
    type Object = string;
}
export type Result = null;
export declare namespace Document {
    type Orphan = MongoAsyncRpc.Document.Orphan<Method, Params>;
    type Adopted = MongoAsyncRpc.Document.Adopted<Method, Params>;
    type Cancelled = MongoAsyncRpc.Document.Cancelled<Method, Params>;
    type Succeeded = MongoAsyncRpc.Document.Succeeded<Method, Params, Result>;
    type Failed = MongoAsyncRpc.Document.Failed<Method, Params>;
}
export type Document = MongoAsyncRpc.Document<Method, Params, Result>;
