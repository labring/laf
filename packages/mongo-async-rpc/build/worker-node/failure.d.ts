import { Collection, Db, MongoClient } from "mongodb";
import { Document } from "../document";
export declare class Failure {
    private host;
    private db;
    private coll;
    constructor(host: MongoClient, db: Db, coll: Collection<Document>);
    fail<method extends string, params extends readonly unknown[]>(doc: Document.Adopted<method, params>, err: Error): Promise<void>;
}
export declare namespace Failure {
    class AdoptedTaskNotFound extends Error {
    }
}
