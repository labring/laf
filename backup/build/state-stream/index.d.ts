/// <reference types="node" />
import EventEmitter = require("events");
export declare class StateStream<State> extends EventEmitter {
    private currentPromise;
    private before;
    private eventBuffer;
    private errorBuffer;
    private state;
    constructor(currentPromise: Promise<State>, ee: EventEmitter, event: string | symbol, before: (state0: State, state: State) => boolean);
    private open;
    close(): void;
}
interface Events<State> {
    state(state: State): void;
    error(error: unknown): void;
}
export interface StateStream<State> extends EventEmitter {
    on<Event extends keyof Events<State>>(event: Event, listener: Events<State>[Event]): this;
    once<Event extends keyof Events<State>>(event: Event, listener: Events<State>[Event]): this;
    off<Event extends keyof Events<State>>(event: Event, listener: Events<State>[Event]): this;
    emit<Event extends keyof Events<State>>(event: Event, ...params: Parameters<Events<State>[Event]>): boolean;
}
export {};
