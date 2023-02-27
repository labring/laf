import { Collection, Db, MongoClient } from "mongodb";
import { Document } from "../document";
export declare class Adoption {
    private host;
    private db;
    private coll;
    constructor(host: MongoClient, db: Db, coll: Collection<Document>);
    adopt<method extends string, params extends readonly unknown[]>(method: method, cancellable: boolean): Promise<Document.Adopted<method, params>>;
}
export declare namespace Adoption {
    class OrphanNotFound extends Error {
    }
}
