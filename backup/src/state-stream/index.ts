import assert = require("assert");
import EventEmitter = require("events");
import { EventBuffer } from "./event-buffer";


const enum State {
	BUFFERING,
	FLUSHING,
	DETACHED,
}


export class StateStream<State> extends EventEmitter {
	private eventBuffer: EventBuffer;
	private errorBuffer: EventBuffer;
	private state = State.BUFFERING;

	public constructor(
		private currentPromise: Promise<State>,
		ee: EventEmitter,
		event: string | symbol,
		private before: (state0: State, state: State) => boolean,
	) {
		super();
		this.eventBuffer = new EventBuffer(ee, event);
		this.errorBuffer = new EventBuffer(ee, 'error');
		this.open();
	}

	private async open() {
		let current: State;
		try {
			current = await this.currentPromise;
		} catch (error) {
			this.emit('error', error);
			return;
		}
		this.eventBuffer.flush();
		this.errorBuffer.flush();
		this.state = State.FLUSHING;

		this.emit('state', current);
		let started = false;
		this.eventBuffer.on('event', state => {
			if (started ||= this.before(current, state))
				this.emit('state', state);
		});
		this.errorBuffer.on('event', error => void this.emit('error', error));
	}

	public close() {
		assert(this.state !== State.BUFFERING);
		this.state = State.DETACHED;
		this.eventBuffer.close();
		this.errorBuffer.close();
	}
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
