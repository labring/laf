import { ObjectId } from "mongodb";
import * as JsonRpc from '../json-rpc';
export type Req<method extends string = string, params extends readonly unknown[] = readonly unknown[]> = JsonRpc.Req<string, method, params>;
export declare namespace Res {
    type Succ<result = unknown> = JsonRpc.Res.Succ<string, result>;
    type Fail<errDesc = unknown> = JsonRpc.Res.Fail<string, errDesc>;
}
export declare namespace Document {
    export const enum State {
        ORPHAN = 0,
        ADOPTED = 1,
        CANCELLED = 2,
        SUCCEEDED = 3,
        FAILED = 4
    }
    interface Base<method extends string = string, params extends readonly unknown[] = readonly unknown[]> {
        readonly _id: ObjectId;
        readonly state: State;
    }
    namespace Base {
        interface Detail {
        }
    }
    export interface Orphan<method extends string = string, params extends readonly unknown[] = readonly unknown[]> extends Base<method, params>, Orphan.Detail<method, params> {
        readonly _id: ObjectId;
        readonly state: State.ORPHAN;
    }
    export namespace Orphan {
        interface Detail<method extends string, params extends readonly unknown[]> extends Base.Detail {
            readonly request: Req<method, params>;
            readonly lock: string;
            readonly submitTime: number;
        }
    }
    export interface Adopted<method extends string = string, params extends readonly unknown[] = readonly unknown[]> extends Base<method, params>, Adopted.Detail<method, params> {
        readonly state: State.ADOPTED;
    }
    export namespace Adopted {
        interface Detail<method extends string, params extends readonly unknown[]> extends Orphan.Detail<method, params> {
            readonly adoptTime: number;
        }
    }
    export interface Cancelled<method extends string = string, params extends readonly unknown[] = readonly unknown[]> extends Base<method, params>, Cancelled.Detail<method, params> {
        readonly state: State.CANCELLED;
    }
    export namespace Cancelled {
        interface Detail<method extends string, params extends readonly unknown[]> extends Adopted.Detail<method, params> {
            readonly cancelTime: number;
        }
    }
    export interface Succeeded<method extends string = string, params extends readonly unknown[] = readonly unknown[], result = unknown> extends Base<method, params>, Succeeded.Detail<method, params, result> {
        readonly state: State.SUCCEEDED;
    }
    export namespace Succeeded {
        interface Detail<method extends string, params extends readonly unknown[], result> extends Adopted.Detail<method, params> {
            readonly response: Res.Succ<result>;
            readonly succeedTime: number;
        }
    }
    export interface Failed<method extends string = string, params extends readonly unknown[] = readonly unknown[], errDesc = unknown> extends Base<method, params>, Failed.Detail<method, params, errDesc> {
        readonly state: State.FAILED;
    }
    export namespace Failed {
        interface Detail<method extends string, params extends readonly unknown[], errDesc> extends Adopted.Detail<method, params> {
            readonly response: Res.Fail<errDesc>;
            readonly failTime: number;
        }
    }
    export {};
}
export type Document<method extends string = string, params extends readonly unknown[] = readonly unknown[], result = unknown, errDesc = unknown> = Document.Orphan<method, params> | Document.Adopted<method, params> | Document.Cancelled<method, params> | Document.Succeeded<method, params, result> | Document.Failed<method, params, errDesc>;
