import { Startable } from "@zimtsui/startable";
export interface RpFactoryLike<params extends readonly unknown[], result> {
    (...params: params): Startable;
}
export declare namespace RpFactoryLike {
    function from<params extends readonly unknown[], result>(f: (...params: params) => Promise<result>): (...params: params) => Startable;
    class Cancelled extends Error {
    }
    class Successful<result> extends Error {
        result: result;
        constructor(result: result);
    }
}
