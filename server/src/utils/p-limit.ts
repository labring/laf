/**
 * author: sindresorhus
 * https://github.com/sindresorhus/p-limit
 */
class Node<T> {
  value: T
  next: Node<T>

  constructor(value: T) {
    this.value = value
  }
}

class Queue<T> {
  #head?: Node<T>
  #tail?: Node<T>
  #size: number

  constructor() {
    this.clear()
  }

  enqueue(value: T) {
    const node = new Node<T>(value)

    if (this.#head) {
      this.#tail.next = node
      this.#tail = node
    } else {
      this.#head = node
      this.#tail = node
    }

    this.#size++
  }

  dequeue() {
    const current = this.#head
    if (!current) {
      return
    }

    this.#head = this.#head.next
    this.#size--
    return current.value
  }

  clear() {
    this.#head = undefined
    this.#tail = undefined
    this.#size = 0
  }

  get size() {
    return this.#size
  }

  *[Symbol.iterator]() {
    let current = this.#head

    while (current) {
      yield current.value
      current = current.next
    }
  }
}

export default function pLimit(concurrency: number): LimitFunction {
  if (
    !(
      (Number.isInteger(concurrency) ||
        concurrency === Number.POSITIVE_INFINITY) &&
      concurrency > 0
    )
  ) {
    throw new TypeError('Expected `concurrency` to be a number from 1 and up')
  }

  const queue = new Queue<() => Promise<unknown>>()
  let activeCount = 0

  const next = () => {
    activeCount--

    if (queue.size > 0) {
      queue.dequeue()()
    }
  }

  const run = async (fn, resolve, args) => {
    activeCount++

    const result = (async () => fn(...args))()

    resolve(result)

    try {
      await result
    } catch {}

    next()
  }

  const enqueue = (fn, resolve, args) => {
    queue.enqueue(run.bind(undefined, fn, resolve, args))
    ;(async () => {
      // This function needs to wait until the next microtask before comparing
      // `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
      // when the run function is dequeued and called. The comparison in the if-statement
      // needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
      await Promise.resolve()

      if (activeCount < concurrency && queue.size > 0) {
        queue.dequeue()()
      }
    })()
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const generator: LimitFunction = (fn, ...args) =>
    new Promise((resolve) => {
      enqueue(fn, resolve, args)
    })

  Object.defineProperties(generator, {
    activeCount: {
      get: () => activeCount,
    },
    pendingCount: {
      get: () => queue.size,
    },
    clearQueue: {
      value: () => {
        queue.clear()
      },
    },
  })

  return generator
}

export interface LimitFunction {
  /**
	The number of promises that are currently running.
	*/
  readonly activeCount: number

  /**
	The number of promises that are waiting to run (i.e. their internal `fn` was not called yet).
	*/
  readonly pendingCount: number

  /**
	Discard pending promises that are waiting to run.

	This might be useful if you want to teardown the queue at the end of your program's lifecycle or discard any function calls referencing an intermediary state of your app.

	Note: This does not cancel promises that are already running.
	*/
  clearQueue: () => void

  /**
	@param fn - Promise-returning/async function.
	@param arguments - Any arguments to pass through to `fn`. Support for passing arguments on to the `fn` is provided in order to be able to avoid creating unnecessary closures. You probably don't need this optimization unless you're pushing a lot of functions.
	@returns The promise returned by calling `fn(...arguments)`.
	*/
  <Arguments extends unknown[], ReturnType>(
    fn: (...args: Arguments) => PromiseLike<ReturnType> | ReturnType,
    ...args: Arguments
  ): Promise<ReturnType>
}
