import { Params } from "./interfaces";
export declare class Rp {
    private bucket;
    private object;
    private db;
    private cp?;
    private stderrPromise?;
    constructor(bucket: Params.Bucket, object: Params.Object, db: Params.Db);
    private rawStart;
    private rawStop;
}
export declare namespace Rp {
    class Failed extends Error {
        code: number | null;
        signal: string | null;
        constructor(code: number | null, signal: string | null, message: string);
    }
}
