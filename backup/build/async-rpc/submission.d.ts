import { Collection, Db, MongoClient } from 'mongodb';
import { Document } from './interfaces';
export declare class Submission {
    private host;
    private db;
    private coll;
    constructor(host: MongoClient, db: Db, coll: Collection<Document>);
    submit<method extends string, params extends readonly unknown[]>(method: method, params: params, lock?: string): Promise<Document.Orphan<method, params>>;
}
export declare namespace Submission {
    class Locked extends Error {
        doc: Document.Orphan | Document.Adopted;
        constructor(doc: Document.Orphan | Document.Adopted);
    }
}
