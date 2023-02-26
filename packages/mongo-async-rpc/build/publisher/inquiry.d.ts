import { Collection, Db, MongoClient, ChangeStream, ChangeStreamDocument } from 'mongodb';
import { Document } from '../interfaces';
import { DeltaStream } from '@zimtsui/delta-stream';
export declare class Inquiry {
    private host;
    private db;
    private coll;
    private stream;
    private broadcast;
    constructor(host: MongoClient, db: Db, coll: Collection<Document>, stream: ChangeStream<Document, ChangeStreamDocument<Document>>);
    private find;
    inquire<method extends string, params extends readonly unknown[], result>(id: string): DeltaStream<Document<method, params, result>>;
}
export declare namespace Inquiry {
    class NotFound extends Error {
    }
}
