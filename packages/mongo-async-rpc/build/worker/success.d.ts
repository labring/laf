import { Collection, Db, MongoClient } from "mongodb";
import { Document } from "../document";
export declare class Success {
    private host;
    private db;
    private coll;
    constructor(host: MongoClient, db: Db, coll: Collection<Document>);
    /**
     *  @throws {@link Success.AdoptedTaskNotFound}
     */
    succeed<method extends string, params extends readonly unknown[], result>(doc: Document.Adopted<method, params>, result: result): Promise<void>;
}
export declare namespace Success {
    class AdoptedTaskNotFound extends Error {
    }
}
