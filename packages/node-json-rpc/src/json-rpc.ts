export interface Obj {
	readonly jsonrpc: '2.0';
}

export interface Req<
	id extends string | number,
	method extends string,
	params extends {} | readonly unknown[],
> extends Obj {
	readonly id: id;
	readonly method: method;
	readonly params: params;
}


export type Res<
	id extends string | number,
	result,
	errorData,
> = Res.Succ<id, result> | Res.Fail<id, errorData>;
export namespace Res {
	export interface Succ<
		id extends string | number,
		result,
	> {
		readonly id: id;
		readonly result: result;
		readonly error: undefined;
	}

	export interface Fail<
		id extends string | number,
		errorData,
	> {
		readonly id: id;
		readonly result: undefined;
		readonly error: Fail.Error<errorData>;
	}
	export namespace Fail {
		export interface Error<Data> {
			readonly code: number;
			readonly message: string;
			readonly data: Data;
		}
	}
}
