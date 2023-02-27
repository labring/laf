import { $, AsRawStart, Startable } from "@zimtsui/startable";

export interface RpFactoryLike<
	params extends readonly unknown[],
	result,
> {
	(...params: params): Startable;
}

export namespace RpFactoryLike {
	export function from<
		params extends readonly unknown[],
		result,
	>(f: (...params: params) => Promise<result>): (...params: params) => Startable {
		class Rp {
			public constructor(private params: params) { }

			@AsRawStart()
			private rawStart() {
				f(...this.params).then(
					result => void $(this).stop(new Successful(result)),
					err => void $(this).stop(err),
				);
			}
		}
		return (...params: params) => $(new Rp(params));
	}

	export class Cancelled extends Error { }
	export class Successful<result> extends Error {
		public constructor(
			public result: result,
		) { super(); }
	}
}
