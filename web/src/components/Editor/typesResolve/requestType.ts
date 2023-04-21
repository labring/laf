const incomingMessageType = `
  class IncomingMessage extends Readable {
    constructor(socket: Socket);
    /**
     * The 'message.aborted' property will be 'true' if the request has
     * been aborted.
     * @since v10.1.0
     * @deprecated Since v17.0.0,v16.12.0 - Check 'message.destroyed' from <a href="stream.html#class-streamreadable" class="type">stream.Readable</a>.
     */
    aborted: boolean;
    /**
     * In case of server request, the HTTP version sent by the client. In the case of
     * client response, the HTTP version of the connected-to server.
     * Probably either ''1.1'' or ''1.0''.
     *
     * Also 'message.httpVersionMajor' is the first integer and'message.httpVersionMinor' is the second.
     * @since v0.1.1
     */
    httpVersion: string;
    httpVersionMajor: number;
    httpVersionMinor: number;
    /**
     * The 'message.complete' property will be 'true' if a complete HTTP message has
     * been received and successfully parsed.
     *
     * This property is particularly useful as a means of determining if a client or
     * server fully transmitted a message before a connection was terminated:
     *
     * '''js
     * const req = http.request({
     *   host: '127.0.0.1',
     *   port: 8080,
     *   method: 'POST'
     * }, (res) => {
     *   res.resume();
     *   res.on('end', () => {
     *     if (!res.complete)
     *       console.error(
     *         'The connection was terminated while the message was still being sent');
     *   });
     * });
     * '''
     * @since v0.3.0
     */
    complete: boolean;
    /**
     * Alias for 'message.socket'.
     * @since v0.1.90
     * @deprecated Since v16.0.0 - Use 'socket'.
     */
    connection: Socket;
    /**
     * The 'net.Socket' object associated with the connection.
     *
     * With HTTPS support, use 'request.socket.getPeerCertificate()' to obtain the
     * client's authentication details.
     *
     * This property is guaranteed to be an instance of the 'net.Socket' class,
     * a subclass of 'stream.Duplex', unless the user specified a socket
     * type other than 'net.Socket' or internally nulled.
     * @since v0.3.0
     */
    socket: Socket;
    /**
     * The request/response headers object.
     *
     * Key-value pairs of header names and values. Header names are lower-cased.
     *
     * '''js
     * // Prints something like:
     * //
     * // { 'user-agent': 'curl/7.22.0',
     * //   host: '127.0.0.1:8000',
     * //   accept: '*' }
     * console.log(request.getHeaders());
     * '''
     *
     * Duplicates in raw headers are handled in the following ways, depending on the
     * header name:
     *
     * * Duplicates of 'age', 'authorization', 'content-length', 'content-type','etag', 'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since','last-modified', 'location',
     * 'max-forwards', 'proxy-authorization', 'referer','retry-after', 'server', or 'user-agent' are discarded.
     * * 'set-cookie' is always an array. Duplicates are added to the array.
     * * For duplicate 'cookie' headers, the values are joined together with '; '.
     * * For all other headers, the values are joined together with ', '.
     * @since v0.1.5
     */
    headers: IncomingHttpHeaders;
    /**
     * The raw request/response headers list exactly as they were received.
     *
     * The keys and values are in the same list. It is _not_ a
     * list of tuples. So, the even-numbered offsets are key values, and the
     * odd-numbered offsets are the associated values.
     *
     * Header names are not lowercased, and duplicates are not merged.
     *
     * '''js
     * // Prints something like:
     * //
     * // [ 'user-agent',
     * //   'this is invalid because there can be only one',
     * //   'User-Agent',
     * //   'curl/7.22.0',
     * //   'Host',
     * //   '127.0.0.1:8000',
     * //   'ACCEPT',
     * //   '*' ]
     * console.log(request.rawHeaders);
     * '''
     * @since v0.11.6
     */
    rawHeaders: string[];
    /**
     * The request/response trailers object. Only populated at the ''end'' event.
     * @since v0.3.0
     */
    trailers: NodeJS.Dict<string>;
    /**
     * The raw request/response trailer keys and values exactly as they were
     * received. Only populated at the ''end'' event.
     * @since v0.11.6
     */
    rawTrailers: string[];
    /**
     * Calls 'message.socket.setTimeout(msecs, callback)'.
     * @since v0.5.9
     */
    setTimeout(msecs: number, callback?: () => void): this;
    /**
     * **Only valid for request obtained from {@link Server}.**
     *
     * The request method as a string. Read only. Examples: ''GET'', ''DELETE''.
     * @since v0.1.1
     */
    method?: string | undefined;
    /**
     * **Only valid for request obtained from {@link Server}.**
     *
     * Request URL string. This contains only the URL that is present in the actual
     * HTTP request. Take the following request:
     *
     * '''http
     * GET /status?name=ryan HTTP/1.1
     * Accept: text/plain
     * '''
     *
     * To parse the URL into its parts:
     *
     * '''js
     * new URL(request.url, 'http://\${request.getHeaders().host}');
     * '''
     *
     * When 'request.url' is ''/status?name=ryan'' and'request.getHeaders().host' is ''localhost:3000'':
     *
     * '''console
     * $ node
     * > new URL(request.url, 'http://\${request.getHeaders().host}')
     * URL {
     *   href: 'http://localhost:3000/status?name=ryan',
     *   origin: 'http://localhost:3000',
     *   protocol: 'http:',
     *   username: '',
     *   password: '',
     *   host: 'localhost:3000',
     *   hostname: 'localhost',
     *   port: '3000',
     *   pathname: '/status',
     *   search: '?name=ryan',
     *   searchParams: URLSearchParams { 'name' => 'ryan' },
     *   hash: ''
     * }
     * '''
     * @since v0.1.90
     */
    url?: string | undefined;
    /**
     * **Only valid for response obtained from {@link ClientRequest}.**
     *
     * The 3-digit HTTP response status code. E.G. '404'.
     * @since v0.1.1
     */
    statusCode?: number | undefined;
    /**
     * **Only valid for response obtained from {@link ClientRequest}.**
     *
     * The HTTP response status message (reason phrase). E.G. 'OK' or 'Internal Server Error'.
     * @since v0.11.10
     */
    statusMessage?: string | undefined;
    /**
     * Calls 'destroy()' on the socket that received the 'IncomingMessage'. If 'error'is provided, an ''error'' event is emitted on the socket and 'error' is passed
     * as an argument to any listeners on the event.
     * @since v0.3.0
     */
    destroy(error?: Error): this;
}
`;

export const requestType = `
  ${incomingMessageType}

/**
 * @see https://expressjs.com/en/api.html#req.params
 *
 * @example
 *     app.get('/user/:id', (req, res) => res.send(req.params.id)); // implicitly 'ParamsDictionary'
 *     app.get<ParamsArray>(/user\/(.*)/, (req, res) => res.send(req.params[0]));
 *     app.get<ParamsArray>('/user/*', (req, res) => res.send(req.params[0]));
 */
interface HttpRequest extends IncomingMessage {
    /**
     * Return request header.
     *
     * The 'Referrer' header field is special-cased,
     * both 'Referrer' and 'Referer' are interchangeable.
     *
     * Examples:
     *
     *     req.get('Content-Type');
     *     // => "text/plain"
     *
     *     req.get('content-type');
     *     // => "text/plain"
     *
     *     req.get('Something');
     *     // => undefined
     *
     * Aliased as 'req.header()'.
     */
    get(name: 'set-cookie'): string[] | undefined;
    get(name: string): string | undefined;

    header(name: 'set-cookie'): string[] | undefined;
    header(name: string): string | undefined;

    /**
     * Check if the given 'type(s)' is acceptable, returning
     * the best match when true, otherwise 'undefined', in which
     * case you should respond with 406 "Not Acceptable".
     *
     * The 'type' value may be a single mime type string
     * such as "application/json", the extension name
     * such as "json", a comma-delimted list such as "json, html, text/plain",
     * or an array '["json", "html", "text/plain"]'. When a list
     * or array is given the _best_ match, if any is returned.
     *
     * Examples:
     *
     *     // Accept: text/html
     *     req.accepts('html');
     *     // => "html"
     *
     *     // Accept: text/*, application/json
     *     req.accepts('html');
     *     // => "html"
     *     req.accepts('text/html');
     *     // => "text/html"
     *     req.accepts('json, text');
     *     // => "json"
     *     req.accepts('application/json');
     *     // => "application/json"
     *
     *     // Accept: text/*, application/json
     *     req.accepts('image/png');
     *     req.accepts('png');
     *     // => undefined
     *
     *     // Accept: text/*;q=.5, application/json
     *     req.accepts(['html', 'json']);
     *     req.accepts('html, json');
     *     // => "json"
     */
    accepts(): string[];
    accepts(type: string): string | false;
    accepts(type: string[]): string | false;
    accepts(...type: string[]): string | false;

    /**
     * Returns the first accepted charset of the specified character sets,
     * based on the request's Accept-Charset HTTP header field.
     * If none of the specified charsets is accepted, returns false.
     *
     * For more information, or if you have issues or concerns, see accepts.
     */
    acceptsCharsets(): string[];
    acceptsCharsets(charset: string): string | false;
    acceptsCharsets(charset: string[]): string | false;
    acceptsCharsets(...charset: string[]): string | false;

    /**
     * Returns the first accepted encoding of the specified encodings,
     * based on the request's Accept-Encoding HTTP header field.
     * If none of the specified encodings is accepted, returns false.
     *
     * For more information, or if you have issues or concerns, see accepts.
     */
    acceptsEncodings(): string[];
    acceptsEncodings(encoding: string): string | false;
    acceptsEncodings(encoding: string[]): string | false;
    acceptsEncodings(...encoding: string[]): string | false;

    /**
     * Returns the first accepted language of the specified languages,
     * based on the request's Accept-Language HTTP header field.
     * If none of the specified languages is accepted, returns false.
     *
     * For more information, or if you have issues or concerns, see accepts.
     */
    acceptsLanguages(): string[];
    acceptsLanguages(lang: string): string | false;
    acceptsLanguages(lang: string[]): string | false;
    acceptsLanguages(...lang: string[]): string | false;

    /**
     * Parse Range header field, capping to the given 'size'.
     *
     * Unspecified ranges such as "0-" require knowledge of your resource length. In
     * the case of a byte range this is of course the total number of bytes.
     * If the Range header field is not given 'undefined' is returned.
     * If the Range header field is given, return value is a result of range-parser.
     * See more ./types/range-parser/index.d.ts
     *
     * NOTE: remember that ranges are inclusive, so for example "Range: users=0-3"
     * should respond with 4 users when available, not 3.
     *
     */
    range(size: number, options?: RangeParserOptions): RangeParserRanges | RangeParserResult | undefined;

    /**
     * Return an array of Accepted media types
     * ordered from highest quality to lowest.
     */
    accepted: MediaType[];

    /**
     * @deprecated since 4.11 Use either req.params, req.body or req.query, as applicable.
     *
     * Return the value of param 'name' when present or 'defaultValue'.
     *
     *  - Checks route placeholders, ex: _/user/:id_
     *  - Checks body params, ex: id=12, {"id":12}
     *  - Checks query string params, ex: ?id=12
     *
     * To utilize request bodies, 'req.body'
     * should be an object. This can be done by using
     * the 'connect.bodyParser()' middleware.
     */
    param(name: string, defaultValue?: any): string;

    /**
     * Check if the incoming request contains the "Content-Type"
     * header field, and it contains the give mime 'type'.
     *
     * Examples:
     *
     *      // With Content-Type: text/html; charset=utf-8
     *      req.is('html');
     *      req.is('text/html');
     *      req.is('text/*');
     *      // => true
     *
     *      // When Content-Type is application/json
     *      req.is('json');
     *      req.is('application/json');
     *      req.is('application/*');
     *      // => true
     *
     *      req.is('html');
     *      // => false
     */
    is(type: string | string[]): string | false | null;

    /**
     * Return the protocol string "http" or "https"
     * when requested with TLS. When the "trust proxy"
     * setting is enabled the "X-Forwarded-Proto" header
     * field will be trusted. If you're running behind
     * a reverse proxy that supplies https for you this
     * may be enabled.
     */
    protocol: string;

    /**
     * Short-hand for:
     *
     *    req.protocol == 'https'
     */
    secure: boolean;

    /**
     * Return the remote address, or when
     * "trust proxy" is 'true' return
     * the upstream addr.
     */
    ip: string;

    /**
     * When "trust proxy" is 'true', parse
     * the "X-Forwarded-For" ip address list.
     *
     * For example if the value were "client, proxy1, proxy2"
     * you would receive the array '["client", "proxy1", "proxy2"]'
     * where "proxy2" is the furthest down-stream.
     */
    ips: string[];

    /**
     * Return subdomains as an array.
     *
     * Subdomains are the dot-separated parts of the host before the main domain of
     * the app. By default, the domain of the app is assumed to be the last two
     * parts of the host. This can be changed by setting "subdomain offset".
     *
     * For example, if the domain is "tobi.ferrets.example.com":
     * If "subdomain offset" is not set, req.subdomains is '["ferrets", "tobi"]'.
     * If "subdomain offset" is 3, req.subdomains is '["tobi"]'.
     */
    subdomains: string[];

    /**
     * Short-hand for 'url.parse(req.url).pathname'.
     */
    path: string;

    /**
     * Parse the "Host" header field hostname.
     */
    hostname: string;

    /**
     * @deprecated Use hostname instead.
     */
    host: string;

    /**
     * Check if the request is fresh, aka
     * Last-Modified and/or the ETag
     * still match.
     */
    fresh: boolean;

    /**
     * Check if the request is stale, aka
     * "Last-Modified" and / or the "ETag" for the
     * resource has changed.
     */
    stale: boolean;

    /**
     * Check if the request was an _XMLHttpRequest_.
     */
    xhr: boolean;

    //body: { username: string; password: string; remember: boolean; title: string; };
    body: ReqBody;

    //cookies: { string; remember: boolean; };
    cookies: any;

    method: string;

    params: P;

    query: ReqQuery;

    route: any;

    signedCookies: any;

    originalUrl: string;

    url: string;

    baseUrl: string;

    app: Application;

    /**
     * After middleware.init executed, Request will contain res and next properties
     * See: express/lib/middleware/init.js
     */
    res?: Response<ResBody, Locals> | undefined;
    next?: NextFunction | undefined;
}
`;
