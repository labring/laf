import EventEmitter = require("events");
import { Semque } from "../semque";


export class EventBuffer extends EventEmitter {
	private q = new Semque<any[]>();

	public constructor(
		private ee: EventEmitter,
		private event: string | symbol,
	) {
		super();
		this.ee.on(this.event, this.pipe);
	}

	private pipe = (...params: any[]): void => void this.q.push(params);

	public async flush() {
		try {
			for (; ;) {
				const params = await this.q.pop();
				this.emit('event', ...params);
			}
		} catch (err) {
			if (err instanceof EventBuffer.Closed) return;
			throw err;
		}
	}

	public close() {
		this.ee.off(this.event, this.pipe);
		this.q.throw(new EventBuffer.Closed());
	}
}

export namespace EventBuffer {
	export class Closed extends Error { }
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
