import { Collection, Db, MongoClient, ChangeStream, ChangeStreamDocument } from 'mongodb';
import { Document } from './interfaces';
import { StateStream } from '../state-stream';
export declare class Inquiry {
    private host;
    private db;
    private coll;
    private stream;
    private broadcast;
    constructor(host: MongoClient, db: Db, coll: Collection<Document>, stream: ChangeStream<Document, ChangeStreamDocument<Document>>);
    private find;
    inquire<method extends string, params extends readonly unknown[], result, errDesc>(id: string): StateStream<Document<method, params, result, errDesc>>;
}
export declare namespace Inquiry {
    class NotFound extends Error {
    }
}
