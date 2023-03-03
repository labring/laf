import { ChildProcess, spawn } from "child_process";
import { resolve } from "path";
import { Params, Result } from "./interfaces";
import assert = require("assert");
import { $, AsRawStart, AsRawStop } from "@zimtsui/startable";
import { Worker } from '@lafjs/mongo-async-rpc';


assert(process.env.BACKUP_MONGO_HOST_URI);
assert(process.env.BACKUP_S3_HOST_ALIAS);


export class Rp {
	private cp?: ChildProcess;
	private stderrPromise?: Promise<string>;

	public constructor(
		private bucket: Params.Bucket,
		private object: Params.Object,
		private db: Params.Db,
	) { }

	@AsRawStart()
	private rawStart() {
		this.cp = spawn(
			resolve(__dirname, '../../../mongo-backup'),
			[
				'restore',
				this.bucket,
				this.object,
				this.db,
			],
			{
				detached: true,
				stdio: ['ignore', 'ignore', 'pipe'],
			},
		);
		this.cp.once('exit', async (code, signal) => {
			if (code === 0)
				$(this).stop(new Worker.RpFactoryLike.Successful<Result>(null));
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
