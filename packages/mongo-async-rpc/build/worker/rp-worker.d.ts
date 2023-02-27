import { ChangeStream, ChangeStreamDocument } from "mongodb";
import { Document } from "../document";
import { Adoption } from "./adoption";
import { Failure } from "./failure";
import { Success } from "./success";
import { Startable } from "@zimtsui/startable";
export declare class RpWorker<method extends string, params extends readonly unknown[], result> {
    private stream;
    private adoption;
    private success;
    private failure;
    private method;
    private rpMaker;
    private cancellable;
    private pollerloop;
    private rpcInstances;
    constructor(stream: ChangeStream<Document, ChangeStreamDocument<Document>>, adoption: Adoption, success: Success, failure: Failure, method: method, rpMaker: RpMaker<params, result>, cancellable?: boolean);
    private callRemoteProcedure;
    private cancellationListener;
    private listener;
    private loop;
    private rawStart;
    private rawStop;
}
export interface RpMaker<params extends readonly unknown[], result> {
    (...params: params): Startable;
}
export declare namespace RpMaker {
    class Cancelled extends Error {
    }
    class Successful<result> extends Error {
        result: result;
        constructor(result: result);
    }
}
export declare class ExceptionNotAnError extends Error {
}
