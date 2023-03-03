import { ObjectId } from "mongodb";
import * as JsonRpc from 'node-json-rpc';



export namespace Document {
	export const enum State {
		ORPHAN,
		ADOPTED,
		CANCELLED,
		SUCCEEDED,
		FAILED,
	}

	interface Base<
		method extends string = any,
		params extends readonly unknown[] = readonly any[],
	> {
		readonly _id: ObjectId;
		readonly state: State;
	}
	namespace Base {
		export interface Detail { }
	}

	export interface Orphan<
		method extends string = any,
		params extends readonly unknown[] = readonly any[],
	> extends Base<method, params>, Orphan.Detail<method, params> {
		readonly _id: ObjectId;
		readonly state: State.ORPHAN;
	}
	export namespace Orphan {
		export interface Detail<
			method extends string,
			params extends readonly unknown[],
		> extends Base.Detail {
			readonly request: JsonRpc.Req<method, params>;
			readonly lock: string;
			readonly submitTime: number;
		}
	}

	export interface Adopted<
		method extends string = any,
		params extends readonly unknown[] = readonly any[],
	> extends Base<method, params>, Adopted.Detail<method, params> {
		readonly state: State.ADOPTED;
	}
	export namespace Adopted {
		export interface Detail<
			method extends string,
			params extends readonly unknown[],
		> extends Orphan.Detail<method, params> {
			readonly adoptTime: number;
			readonly adoptor: string;
			readonly cancellable: boolean;
		}
	}

	export interface Cancelled<
		method extends string = any,
		params extends readonly unknown[] = readonly any[],
	> extends Base<method, params>, Cancelled.Detail<method, params> {
		readonly state: State.CANCELLED;
	}
	export namespace Cancelled {
		export interface Detail<
			method extends string,
			params extends readonly unknown[],
		> extends Adopted.Detail<method, params> {
			readonly cancelTime: number;
		}
	}

	export interface Succeeded<
		method extends string = any,
		params extends readonly unknown[] = readonly any[],
		result = any,
	> extends Base<method, params>, Succeeded.Detail<method, params, result> {
		readonly state: State.SUCCEEDED;
	}
	export namespace Succeeded {
		export interface Detail<
			method extends string,
			params extends readonly unknown[],
			result,
		> extends Adopted.Detail<method, params> {
			readonly response: JsonRpc.Res.Succ<result>;
			readonly succeedTime: number;
		}
	}

	export interface Failed<
		method extends string = any,
		params extends readonly unknown[] = readonly any[],
	> extends Base<method, params>, Failed.Detail<method, params> {
		readonly state: State.FAILED;
	}
	export namespace Failed {
		export interface Detail<
			method extends string,
			params extends readonly unknown[],
		> extends Adopted.Detail<method, params> {
			readonly response: JsonRpc.Res.Fail;
			readonly failTime: number;
		}
	}
}

export type Document<
	method extends string = any,
	params extends readonly unknown[] = readonly any[],
	result = any,
> =
	Document.Orphan<method, params> |
	Document.Adopted<method, params> |
	Document.Cancelled<method, params> |
	Document.Succeeded<method, params, result> |
	Document.Failed<method, params>;
