import { Collection, Db, MongoClient } from 'mongodb';
import { Document } from './interfaces';
export declare class Cancellation {
    private host;
    private db;
    private coll;
    constructor(host: MongoClient, db: Db, coll: Collection<Document>);
    cancel(id: string): Promise<Document>;
}
export declare namespace Cancellation {
    class AlreadyExits extends Error {
        doc: Document.Cancelled | Document.Succeeded | Document.Failed;
        constructor(doc: Document.Cancelled | Document.Succeeded | Document.Failed);
    }
    class NotFound extends Error {
    }
}
