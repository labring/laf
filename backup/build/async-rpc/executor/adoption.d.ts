import { Collection, Db, MongoClient } from "mongodb";
import { Document } from "../interfaces";
export declare class Adoption {
    private host;
    private db;
    private coll;
    constructor(host: MongoClient, db: Db, coll: Collection<Document>);
    adopt<method extends string, params extends readonly unknown[]>(method: method): Promise<Document.Adopted<method, params>>;
}
export declare namespace Adoption {
    class OrphanNotFound extends Error {
    }
}
