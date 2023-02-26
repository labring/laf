import * as Generic from './json-rpc';

export import Obj = Generic.Obj;

export type Req<
	method extends string,
	params extends readonly unknown[],
> = Generic.Req<string, method, params>;


export type Res<
	id extends string | number,
	result,
	errorData,
> = Generic.Res<string, result, errorData>;
export namespace Res {
	export type Succ<
		result,
	> = Generic.Res.Succ<string, result>;

	export type Fail<
		errorData,
	> = Generic.Res.Fail<string, errorData>;
	export namespace Fail {
		export interface ErrorData {
			name: string;
			stack: string;
		}
		export type Error = Generic.Res.Fail.Error<ErrorData>;
	}
}
