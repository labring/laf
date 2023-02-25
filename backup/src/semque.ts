import { Semaphore } from "@zimtsui/coroutine-locks";
import * as CoroutineLocks from "@zimtsui/coroutine-locks";


export class Semque<T> {
	private sem = new Semaphore();
	private queue: T[] = [];

	public push(x: T) {
		this.sem.v();
		this.queue.push(x);
	}

	public async pop(): Promise<T> {
		await this.sem.p();
		return this.queue.pop()!;
	}

	public throw(err: Error) {
		this.sem.throw(err);
	}

	public tryPop() {
		this.sem.tryp();
		return this.queue.pop()!;
	}
}

export namespace Semque {
	export import TryLockError = CoroutineLocks.TryLockError;
}
