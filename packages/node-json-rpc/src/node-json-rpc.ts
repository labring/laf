import * as Generic from './json-rpc';

export import Obj = Generic.Obj;

export type Req<
	methodName extends string,
	params extends readonly unknown[],
> = Generic.Req<string, methodName, params>;


export type Res<
	result,
> = Generic.Res<string, result, Res.Fail.Error.Data>;
export namespace Res {
	export type Succ<
		result,
	> = Generic.Res.Succ<string, result>;

	export type Fail = Generic.Res.Fail<string, Fail.Error.Data>;
	export namespace Fail {
		export type Error = Generic.Res.Fail.Error<Error.Data>;
		export namespace Error {
			export interface Data {
				name: string;
				stack: string;
			}
		}
	}
}
