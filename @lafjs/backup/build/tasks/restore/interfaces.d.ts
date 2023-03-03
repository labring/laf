import * as MongoAsyncRpc from "mongo-async-rpc";
export declare type Method = 'restore';
export declare type Params = [Params.Bucket, Params.Object, Params.Db];
export declare namespace Params {
    type Db = string;
    type Bucket = string;
    type Object = string;
}
export declare type Result = null;
export declare namespace Document {
    type Orphan = MongoAsyncRpc.Document.Orphan<Method, Params>;
    type Adopted = MongoAsyncRpc.Document.Adopted<Method, Params>;
    type Cancelled = MongoAsyncRpc.Document.Cancelled<Method, Params>;
    type Succeeded = MongoAsyncRpc.Document.Succeeded<Method, Params, Result>;
    type Failed = MongoAsyncRpc.Document.Failed<Method, Params>;
}
export declare type Document = MongoAsyncRpc.Document<Method, Params, Result>;
