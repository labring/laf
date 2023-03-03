import { Params } from "./interfaces";
export declare class Rp {
    private db;
    private bucket;
    private object;
    private cp?;
    private stderrPromise?;
    constructor(db: Params.Db, bucket: Params.Bucket, object: Params.Object);
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
