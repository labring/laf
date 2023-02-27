import { ChangeStream, ChangeStreamDocument, Collection } from "mongodb";
import { Document } from "../document";
import { Adoption } from "./adoption";
import { Failure } from "./failure";
import { Success } from "./success";
import { RpFactoryLike } from "./rp-factory-like";
export declare class RpWorker<method extends string, params extends readonly unknown[], result> {
    private coll;
    private stream;
    private adoption;
    private success;
    private failure;
    private method;
    private rpFactory;
    private cancellable;
    private pollerloop;
    private rpManager;
    /**
    *  @param stream `coll.watch([], { fullDocument: 'updateLookup' })`
    */
    constructor(coll: Collection<Document>, stream: ChangeStream<Document, ChangeStreamDocument<Document>>, adoption: Adoption, success: Success, failure: Failure, method: method, rpFactory: RpFactoryLike<params, result>, cancellable?: boolean);
    private onInsert;
    private handleDoc;
    private loop;
    private rawStart;
    private rawStop;
}
