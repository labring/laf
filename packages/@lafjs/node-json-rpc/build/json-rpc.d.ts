export interface Obj {
    readonly jsonrpc: '2.0';
}
export interface Req<id extends string | number, method extends string, params extends {} | readonly unknown[]> extends Obj {
    readonly id: id;
    readonly method: method;
    readonly params: params;
}
export declare type Res<id extends string | number, result, errorData> = Res.Succ<id, result> | Res.Fail<id, errorData>;
export declare namespace Res {
    interface Succ<id extends string | number, result> extends Obj {
        readonly id: id;
        readonly result: result;
        readonly error?: undefined;
    }
    interface Fail<id extends string | number, errorData> extends Obj {
        readonly id: id;
        readonly result?: undefined;
        readonly error: Fail.Error<errorData>;
    }
    namespace Fail {
        interface Error<errorData> {
            readonly code: number;
            readonly message: string;
            readonly data: errorData;
        }
    }
}
