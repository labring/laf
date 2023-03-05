import { ChildProcess, spawn } from "child_process";
import { resolve } from "path";
import { Params, Result } from "./interfaces";
import assert = require("assert");
import { $, AsRawStart, AsRawStop } from "@zimtsui/startable";
import { Worker } from '@lafjs/mongo-async-rpc';


assert(process.env.MC_ALIAS);
assert(process.env.MC_BUCKET);
assert(process.env.MONGO_USERNAME);
assert(process.env.MONGO_PASSWORD);


export class Rp {
	private cp?: ChildProcess;
	private stderrPromise?: Promise<string>;

	public constructor(
		private dbUri: Params[0]['dbUri'],
		private collNames: Params[0]['collNames'],
		private appid: Params[0]['appid'],
	) { }

	@AsRawStart()
	private rawStart() {
		const fileName = `${this.appid}/${Date.now()}`;
		this.cp = spawn(
			resolve(__dirname, '../../../mongo-backup'),
			[
				'capture',
				this.dbUri,
				process.env.MC_BUCKET!,
				fileName,
				...this.collNames,
			],
			{
				detached: true,
				stdio: ['ignore', 'ignore', 'pipe'],
			},
		);
		this.cp.once('exit', async (code, signal) => {
			if (code === 0)
				$(this).stop(new Worker.RpFactoryLike.Successful<Result>({ fileName }));
			else {
				const stderr = await this.stderrPromise!;
				$(this).stop(new Rp.Failed(code, signal, stderr));
			}
		});

		this.stderrPromise = (async () => {
			const fragments: string[] = [];
			for await (const fragment of this.cp!.stderr!)
				fragments.push(fragment);
			return ''.concat(...fragments);
		})();
		this.stderrPromise.catch(() => { });
	}

	@AsRawStop()
	private async rawStop() {
		if (this.cp && this.cp.exitCode === null) {
			process.kill(-this.cp.pid!, 'SIGINT');
		}
	}
}

export namespace Rp {
	export class Failed extends Error {
		public constructor(
			public code: number | null,
			public signal: string | null,
			message: string,
		) { super(message); }
	}
}
