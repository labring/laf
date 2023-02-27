import { ChangeStream, ChangeStreamDocument, Collection } from "mongodb";
import { Document } from "../document";
import { RpFactoryLike } from "./rp-factory-like";
export declare class RpManager<method extends string, params extends readonly unknown[], result> {
    private stream;
    private coll;
    private rpFactory;
    private broadcast;
    constructor(stream: ChangeStream<Document, ChangeStreamDocument<Document>>, coll: Collection<Document>, rpFactory: RpFactoryLike<params, result>);
    private onChange;
    private rawStart;
    private rawStop;
    /**
     *  @throws {@link RpFactoryLike.Cancelled}
     *  @throws {@link RpManager.ResultNotThrown}
     */
    call(doc: Document.Adopted<method, params>): Promise<result>;
}
export declare namespace RpManager {
    class ResultNotThrown extends Error {
    }
}
