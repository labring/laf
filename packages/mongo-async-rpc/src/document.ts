import { ObjectId } from "mongodb";
import * as JsonRpc from './json-rpc';


namespace Document {
	export interface Req<
		Method extends string = string,
		Params = unknown,
	> extends JsonRpc.Req<string, Method, Params> { }
	export namespace Res {
		export interface Succ<
			Result = unknown,
		> extends JsonRpc.Res.Succ<string, Result> { }
		export interface Fail<
			ErrDesc = unknown,
		> extends JsonRpc.Res.Fail<string, ErrDesc> { }
	}

	export const enum State {
		ORPHAN,
		ADOPTED,
		CANCELLED,
		SUCCEEDED,
		FAILED,
	}

	interface Base<
		Req extends Document.Req = Document.Req,
	> {
		readonly _id: ObjectId;
		readonly request: Req;
		readonly state: State;
	}

	export interface Orphan<
		Req extends Document.Req = Document.Req,
	> extends Base<Req> {
		readonly state: State.ORPHAN;
		readonly submitTime: number;
	}

	export interface Adopted<
		Req extends Document.Req = Document.Req,
	> extends Base<Req> {
		readonly state: State.ADOPTED;
		readonly responder: string;
		readonly adoptTime: number;
	}

	export interface Cancelled<
		Req extends Document.Req = Document.Req,
	> extends Base<Req> {
		readonly state: State.CANCELLED;
		readonly cancellTime: number;
	}

	export interface Succeeded<
		Req extends Document.Req = Document.Req,
		ResSucc extends Document.Res.Succ = Document.Res.Succ,
	> extends Base<Req> {
		readonly state: State.SUCCEEDED;
		readonly response: ResSucc;
		readonly succeedTime: number;
	}

	export interface Failed<
		Req extends Document.Req = Document.Req,
		ResFail extends Document.Res.Fail = Document.Res.Fail,
	> extends Base<Req> {
		readonly state: State.FAILED;
		readonly response: ResFail;
		readonly failTime: number;
	}
}

type Document<
	Req extends Document.Req = Document.Req,
	ResSucc extends Document.Res.Succ = Document.Res.Succ,
	ResFail extends Document.Res.Fail = Document.Res.Fail,
> =
	Document.Orphan<Req> |
	Document.Adopted<Req> |
	Document.Cancelled<Req> |
	Document.Succeeded<Req, ResSucc> |
	Document.Failed<Req, ResFail>;

export default Document;
