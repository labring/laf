import { ObjectId } from "mongodb";
import * as JsonRpc from '@lafjs/node-json-rpc';



export namespace Document {
	export const enum State {
		ORPHAN,
		ADOPTED,
		CANCELLED,
		SUCCEEDED,
		FAILED,
	}

	interface Base<
		methodName extends string = any,
		params extends readonly unknown[] = readonly any[],
	> {
		readonly _id: ObjectId;
		readonly state: State;
	}
	namespace Base {
		export interface Detail { }
	}

	export interface Orphan<
		methodName extends string = any,
		params extends readonly unknown[] = readonly any[],
	> extends Base<methodName, params>, Orphan.Detail<methodName, params> {
		readonly _id: ObjectId;
		readonly state: State.ORPHAN;
	}
	export namespace Orphan {
		export interface Detail<
			methodName extends string,
			params extends readonly unknown[],
		> extends Base.Detail {
			readonly request: JsonRpc.Req<methodName, params>;
			readonly lock: string;
			readonly submitTime: number;
		}
	}

	export interface Adopted<
		methodName extends string = any,
		params extends readonly unknown[] = readonly any[],
	> extends Base<methodName, params>, Adopted.Detail<methodName, params> {
		readonly state: State.ADOPTED;
	}
	export namespace Adopted {
		export interface Detail<
			methodName extends string,
			params extends readonly unknown[],
		> extends Orphan.Detail<methodName, params> {
			readonly adoptTime: number;
			readonly adoptor: string;
			readonly cancellable: boolean;
		}
	}

	export interface Cancelled<
		methodName extends string = any,
		params extends readonly unknown[] = readonly any[],
	> extends Base<methodName, params>, Cancelled.Detail<methodName, params> {
		readonly state: State.CANCELLED;
	}
	export namespace Cancelled {
		export interface Detail<
			methodName extends string,
			params extends readonly unknown[],
		> extends Adopted.Detail<methodName, params> {
			readonly cancelTime: number;
		}
	}

	export interface Succeeded<
		methodName extends string = any,
		params extends readonly unknown[] = readonly any[],
		result = any,
	> extends Base<methodName, params>, Succeeded.Detail<methodName, params, result> {
		readonly state: State.SUCCEEDED;
	}
	export namespace Succeeded {
		export interface Detail<
			methodName extends string,
			params extends readonly unknown[],
			result,
		> extends Adopted.Detail<methodName, params> {
			readonly response: JsonRpc.Res.Succ<result>;
			readonly succeedTime: number;
		}
	}

	export interface Failed<
		methodName extends string = any,
		params extends readonly unknown[] = readonly any[],
	> extends Base<methodName, params>, Failed.Detail<methodName, params> {
		readonly state: State.FAILED;
	}
	export namespace Failed {
		export interface Detail<
			methodName extends string,
			params extends readonly unknown[],
		> extends Adopted.Detail<methodName, params> {
			readonly response: JsonRpc.Res.Fail;
			readonly failTime: number;
		}
	}
}

export type Document<
	methodName extends string = any,
	params extends readonly unknown[] = readonly any[],
	result = any,
> =
	Document.Orphan<methodName, params> |
	Document.Adopted<methodName, params> |
	Document.Cancelled<methodName, params> |
	Document.Succeeded<methodName, params, result> |
	Document.Failed<methodName, params>;
