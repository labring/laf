import { execFile } from "child_process";
import { promisify } from "util";
import { resolve } from "path";
import { Params, Result } from "./interfaces";
import assert = require("assert");


assert(process.env.BACKUP_MONGO_HOST_URI);
assert(process.env.BACKUP_S3_HOST_ALIAS);

export async function execute(
	db: Params.Db,
	bucket: Params.Bucket,
	object: Params.Object,
): Promise<Result> {
	return await promisify(execFile)(
		resolve(__dirname, '../../../mongo-backup'),
		[
			'restore',
			bucket,
			object,
			db,
		],
	).then(
		() => null,
		err => Promise.reject(new Error(err.stderr)),
	);
}
