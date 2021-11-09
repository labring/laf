
export const websocket_type = `
// WebSocket socket.
declare class CloudWebSocket extends EventEmitter {
    /** The connection is not yet open. */
    static readonly CONNECTING: 0;
    /** The connection is open and ready to communicate. */
    static readonly OPEN: 1;
    /** The connection is in the process of closing. */
    static readonly CLOSING: 2;
    /** The connection is closed. */
    static readonly CLOSED: 3;

    binaryType: "nodebuffer" | "arraybuffer" | "fragments";
    readonly bufferedAmount: number;
    readonly extensions: string;
    readonly protocol: string;
    /** The current state of the connection */
    readonly readyState:
        | typeof WebSocket.CONNECTING
        | typeof WebSocket.OPEN
        | typeof WebSocket.CLOSING
        | typeof WebSocket.CLOSED;
    readonly url: string;

    /** The connection is not yet open. */
    readonly CONNECTING: 0;
    /** The connection is open and ready to communicate. */
    readonly OPEN: 1;
    /** The connection is in the process of closing. */
    readonly CLOSING: 2;
    /** The connection is closed. */
    readonly CLOSED: 3;

    onopen: (event: WebSocket.Event) => void;
    onerror: (event: WebSocket.ErrorEvent) => void;
    onclose: (event: WebSocket.CloseEvent) => void;
    onmessage: (event: WebSocket.MessageEvent) => void;

    constructor(address: string | URL, options?: WebSocket.ClientOptions | ClientRequestArgs);
    constructor(
        address: string | URL,
        protocols?: string | string[],
        options?: WebSocket.ClientOptions | ClientRequestArgs,
    );

    close(code?: number, data?: string | Buffer): void;
    ping(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
    pong(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
    send(data: any, cb?: (err?: Error) => void): void;
    send(
        data: any,
        options: { mask?: boolean | undefined; binary?: boolean | undefined; compress?: boolean | undefined; fin?: boolean | undefined },
        cb?: (err?: Error) => void,
    ): void;
    terminate(): void;

    // HTML5 WebSocket events
    addEventListener(
        method: "message",
        cb: (event: WebSocket.MessageEvent) => void,
        options?: WebSocket.EventListenerOptions,
    ): void;
    addEventListener(
        method: "close",
        cb: (event: WebSocket.CloseEvent) => void,
        options?: WebSocket.EventListenerOptions,
    ): void;
    addEventListener(
        method: "error",
        cb: (event: WebSocket.ErrorEvent) => void,
        options?: WebSocket.EventListenerOptions,
    ): void;
    addEventListener(
        method: "open",
        cb: (event: WebSocket.Event) => void,
        options?: WebSocket.EventListenerOptions,
    ): void;

    removeEventListener(method: "message", cb: (event: WebSocket.MessageEvent) => void): void;
    removeEventListener(method: "close", cb: (event: WebSocket.CloseEvent) => void): void;
    removeEventListener(method: "error", cb: (event: WebSocket.ErrorEvent) => void): void;
    removeEventListener(method: "open", cb: (event: WebSocket.Event) => void): void;

    // Events
    on(event: "close", listener: (this: WebSocket, code: number, reason: Buffer) => void): this;
    on(event: "error", listener: (this: WebSocket, err: Error) => void): this;
    on(event: "upgrade", listener: (this: WebSocket, request: IncomingMessage) => void): this;
    on(event: "message", listener: (this: WebSocket, data: WebSocket.RawData, isBinary: boolean) => void): this;
    on(event: "open", listener: (this: WebSocket) => void): this;
    on(event: "ping" | "pong", listener: (this: WebSocket, data: Buffer) => void): this;
    on(
        event: "unexpected-response",
        listener: (this: WebSocket, request: ClientRequest, response: IncomingMessage) => void,
    ): this;
    on(event: string | symbol, listener: (this: WebSocket, ...args: any[]) => void): this;

    once(event: "close", listener: (this: WebSocket, code: number, reason: Buffer) => void): this;
    once(event: "error", listener: (this: WebSocket, err: Error) => void): this;
    once(event: "upgrade", listener: (this: WebSocket, request: IncomingMessage) => void): this;
    once(event: "message", listener: (this: WebSocket, data: WebSocket.RawData, isBinary: boolean) => void): this;
    once(event: "open", listener: (this: WebSocket) => void): this;
    once(event: "ping" | "pong", listener: (this: WebSocket, data: Buffer) => void): this;
    once(
        event: "unexpected-response",
        listener: (this: WebSocket, request: ClientRequest, response: IncomingMessage) => void,
    ): this;
    once(event: string | symbol, listener: (this: WebSocket, ...args: any[]) => void): this;

    off(event: "close", listener: (this: WebSocket, code: number, reason: Buffer) => void): this;
    off(event: "error", listener: (this: WebSocket, err: Error) => void): this;
    off(event: "upgrade", listener: (this: WebSocket, request: IncomingMessage) => void): this;
    off(event: "message", listener: (this: WebSocket, data: WebSocket.RawData, isBinary: boolean) => void): this;
    off(event: "open", listener: (this: WebSocket) => void): this;
    off(event: "ping" | "pong", listener: (this: WebSocket, data: Buffer) => void): this;
    off(
        event: "unexpected-response",
        listener: (this: WebSocket, request: ClientRequest, response: IncomingMessage) => void,
    ): this;
    off(event: string | symbol, listener: (this: WebSocket, ...args: any[]) => void): this;

    addListener(event: "close", listener: (code: number, reason: Buffer) => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "upgrade", listener: (request: IncomingMessage) => void): this;
    addListener(event: "message", listener: (data: WebSocket.RawData, isBinary: boolean) => void): this;
    addListener(event: "open", listener: () => void): this;
    addListener(event: "ping" | "pong", listener: (data: Buffer) => void): this;
    addListener(
        event: "unexpected-response",
        listener: (request: ClientRequest, response: IncomingMessage) => void,
    ): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;

    removeListener(event: "close", listener: (code: number, reason: Buffer) => void): this;
    removeListener(event: "error", listener: (err: Error) => void): this;
    removeListener(event: "upgrade", listener: (request: IncomingMessage) => void): this;
    removeListener(event: "message", listener: (data: WebSocket.RawData, isBinary: boolean) => void): this;
    removeListener(event: "open", listener: () => void): this;
    removeListener(event: "ping" | "pong", listener: (data: Buffer) => void): this;
    removeListener(
        event: "unexpected-response",
        listener: (request: ClientRequest, response: IncomingMessage) => void,
    ): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
}
`
