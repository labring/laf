import * as Generic from './json-rpc';
export import Obj = Generic.Obj;
export type Req<method extends string, params extends readonly unknown[]> = Generic.Req<string, method, params>;
export type Res<result> = Generic.Res<string, result, Res.Fail.Error.Data>;
export declare namespace Res {
    type Succ<result> = Generic.Res.Succ<string, result>;
    type Fail = Generic.Res.Fail<string, Fail.Error.Data>;
    namespace Fail {
        type Error = Generic.Res.Fail.Error<Error.Data>;
        namespace Error {
            interface Data {
                name: string;
                stack: string;
            }
        }
    }
}
