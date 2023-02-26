import * as Generic from './json-rpc';
export import Obj = Generic.Obj;
export declare type Req<method extends string, params extends {} | readonly unknown[]> = Generic.Req<string, method, params>;
export declare type Res<id extends string | number, result, errorData> = Generic.Res<string, result, errorData>;
export declare namespace Res {
    type Succ<result> = Generic.Res.Succ<string, result>;
    type Fail<errorData> = Generic.Res.Fail<string, errorData>;
    namespace Fail {
        interface ErrorData {
            name: string;
            stack: string;
        }
        type Error = Generic.Res.Fail.Error<ErrorData>;
    }
}
