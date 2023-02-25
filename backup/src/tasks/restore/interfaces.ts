import * as AsyncRpc from "../../async-rpc/interfaces";

export type Method = 'restore';

export type Params = [Params.Bucket, Params.Object, Params.Db];
export namespace Params {
	export type Db = string;
	export type Bucket = string;
	export type Object = string;
}

export type Result = null;

export type ErrDesc = string;

export namespace Document {
	export type Orphan = AsyncRpc.Document.Orphan<Method, Params>;
	export type Adopted = AsyncRpc.Document.Adopted<Method, Params>;
	export type Cancelled = AsyncRpc.Document.Cancelled<Method, Params>;
	export type Succeeded = AsyncRpc.Document.Succeeded<Method, Params, Result>;
	export type Failed = AsyncRpc.Document.Failed<Method, Params, ErrDesc>;
}

export type Document = AsyncRpc.Document<Method, Params, Result, ErrDesc>;
