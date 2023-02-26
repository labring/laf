import { ChildProcess, spawn } from "child_process";
import { resolve } from "path";
import { Params, Result } from "./interfaces";
import assert = require("assert");
import { $, AsRawStart, AsRawStop } from "@zimtsui/startable";


assert(process.env.BACKUP_MONGO_HOST_URI);
assert(process.env.BACKUP_S3_HOST_ALIAS);


class Child {
	private cp?: ChildProcess;
	private stderrPromise?: Promise<string>;

	public constructor(
		private db: Params.Db,
		private bucket: Params.Bucket,
		private object: Params.Object,
	) { }

	@AsRawStart()
	private rawStart() {
		this.cp = spawn(
			resolve(__dirname, '../../../mongo-backup'),
			[
				'capture',
				this.db,
				this.bucket,
				this.object,
			],
			{
				detached: true,
				stdio: ['ignore', 'ignore', 'pipe'],
			},
		);
		this.cp.once('exit', (code, signal) => $(this).stop(new ChildExit(code, signal)));

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


export async function execute(
	db: Params.Db,
	bucket: Params.Bucket,
	object: Params.Object,
): Promise<Result> {
	const child = new Child(db, bucket, object);
	await $(child).start();
	const err = await (<Promise<never>>$(child).getRunning())
		.catch((err: Error) => {
			if (err instanceof ChildExit) return err;
			else throw err;
		});
	if (err.code === 0) return null;
	throw err;
}

class ChildExit extends Error {
	public constructor(
		public code: number | null,
		public signal: string | null,
	) { super(); }
}
