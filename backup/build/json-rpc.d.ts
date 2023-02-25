export interface Obj {
    readonly jsonrpc: '2.0';
}
export interface Req<id extends string | number = string | number, method extends string = string, params = unknown> extends Obj {
    readonly id: id;
    readonly method: method;
    readonly params: params;
}
export declare namespace Res {
    interface Succ<id extends string | number = string | number, result = unknown> extends Obj {
        readonly id: id;
        readonly result: result;
    }
    interface Fail<id extends string | number = string | number, errDesc = unknown> extends Obj {
        readonly id: id;
        readonly error: errDesc;
    }
}
