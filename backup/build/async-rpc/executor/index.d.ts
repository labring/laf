import { ChangeStream, ChangeStreamDocument } from "mongodb";
import { Document } from "../interfaces";
import { Adoption } from "./adoption";
import { Failure } from "./failure";
import { Success } from "./success";
import { Startable } from "startable";
interface Execute<params extends readonly unknown[], result> {
    (...params: params): Promise<result>;
}
export declare class Executor<method extends string, params extends readonly unknown[], result, errDesc> {
    private stream;
    private adoption;
    private success;
    private failure;
    private method;
    private execute;
    $s: Startable;
    private pollerloop;
    constructor(stream: ChangeStream<Document, ChangeStreamDocument<Document>>, adoption: Adoption, success: Success, failure: Failure, method: method, execute: Execute<params, result>);
    private listener;
    private loop;
    private rawStart;
    private rawStop;
}
export {};
