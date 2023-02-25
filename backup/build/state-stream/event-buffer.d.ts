/// <reference types="node" />
import EventEmitter = require("events");
export declare class EventBuffer extends EventEmitter {
    private ee;
    private event;
    private q;
    constructor(ee: EventEmitter, event: string | symbol);
    private pipe;
    flush(): Promise<void>;
    close(): void;
}
export declare namespace EventBuffer {
    class Closed extends Error {
    }
}
interface Events {
    event(...params: any[]): void;
}
export interface EventBuffer extends EventEmitter {
    on<Event extends keyof Events>(event: Event, listener: Events[Event]): this;
    once<Event extends keyof Events>(event: Event, listener: Events[Event]): this;
    off<Event extends keyof Events>(event: Event, listener: Events[Event]): this;
    emit<Event extends keyof Events>(event: Event, ...params: Parameters<Events[Event]>): boolean;
}
export {};
