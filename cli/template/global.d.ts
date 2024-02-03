/**
 * The input parameters of cloud function calls
 */
declare interface FunctionContext {
  __function_name: string

  /**
   * This object is parsed from JWT Token Payload
   */
  user?: {
    [key: string]: any
  }

  /**
   * Uploaded file, the file object array
   */
  files?: File[]

  /**
   * HTTP headers
   */
  headers?: IncomingHttpHeaders

  /**
   * HTTP Query parameter (URL parameter), JSON object
   */
  query?: any

  /**
   * HTTP Body
   */
  body?: any

  /**
   *
   */
  params?: any

  /**
   * HTTP Request ID
   */
  requestId?: string

  /**
   * HTTP Method
   */
  method?: string

  /**
   * Express request object
   */
  request?: HttpRequest

  /**
   * Express response object
   */
  response?: HttpResponse

  /**
   * WebSocket object
   */
  socket?: WebSocket

  [key: string]: any
}


// ============ The following is copied from another library and generally does not require direct modification============

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


declare class OutgoingMessage extends Writable {
  readonly req: IncomingMessage;
  chunkedEncoding: boolean;
  shouldKeepAlive: boolean;
  useChunkedEncodingByDefault: boolean;
  sendDate: boolean;
  /**
   * @deprecated Use 'writableEnded' instead.
   */
  // finished: boolean;
  /**
   * Read-only. 'true' if the headers were sent, otherwise 'false'.
   * @since v0.9.3
   */
  readonly headersSent: boolean;
  /**
   * Aliases of 'outgoingMessage.socket'
   * @since v0.3.0
   * @deprecated Since v15.12.0 - Use 'socket' instead.
   */
  // readonly connection: Socket | null;
  /**
   * Reference to the underlying socket. Usually, users will not want to access
   * this property.
   *
   * After calling 'outgoingMessage.end()', this property will be nulled.
   * @since v0.3.0
   */
  readonly socket: Socket | null;
  constructor();
  /**
   * occurs, Same as binding to the 'timeout' event.
   *
   * Once a socket is associated with the message and is connected,'socket.setTimeout()' will be called with 'msecs' as the first parameter.
   * @since v0.9.12
   * @param callback Optional function to be called when a timeout
   */
  setTimeout(msecs: number, callback?: () => void): this;
  /**
   * Sets a single header value for the header object.
   * @since v0.4.0
   * @param name Header name
   * @param value Header value
   */
  setHeader(name: string, value: number | string | ReadonlyArray<string>): this;
  /**
   * Gets the value of HTTP header with the given name. If such a name doesn't
   * exist in message, it will be 'undefined'.
   * @since v0.4.0
   * @param name Name of header
   */
  getHeader(name: string): number | string | string[] | undefined;
  /**
   * Returns a shallow copy of the current outgoing headers. Since a shallow
   * copy is used, array values may be mutated without additional calls to
   * various header-related HTTP module methods. The keys of the returned
   * object are the header names and the values are the respective header
   * values. All header names are lowercase.
   *
   * The object returned by the 'outgoingMessage.getHeaders()' method does
   * not prototypically inherit from the JavaScript Object. This means that
   * typical Object methods such as 'obj.toString()', 'obj.hasOwnProperty()',
   * and others are not defined and will not work.
   *
   * outgoingMessage.setHeader('Foo', 'bar');
   * outgoingMessage.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);
   *
   * const headers = outgoingMessage.getHeaders();
   * // headers === { foo: 'bar', 'set-cookie': ['foo=bar', 'bar=baz'] }
   *
   * @since v8.0.0
   */
  getHeaders(): OutgoingHttpHeaders;
  /**
   * Returns an array of names of headers of the outgoing outgoingMessage. All
   * names are lowercase.
   * @since v8.0.0
   */
  getHeaderNames(): string[];
  /**
   * Returns 'true' if the header identified by 'name' is currently set in the
   * outgoing headers. The header name is case-insensitive.
   *
   * const hasContentType = outgoingMessage.hasHeader('content-type');
   *
   * @since v8.0.0
   */
  hasHeader(name: string): boolean;
  /**
   * Removes a header that is queued for implicit sending.
   *
   * outgoingMessage.removeHeader('Content-Encoding');
   *
   * @since v0.4.0
   */
  removeHeader(name: string): void;
  /**
   * Adds HTTP trailers (headers but at the end of the message) to the message.
   *
   * Trailers are **only** be emitted if the message is chunked encoded. If not,
   * the trailer will be silently discarded.
   *
   * HTTP requires the 'Trailer' header to be sent to emit trailers,
   * with a list of header fields in its value, e.g.
   *
   * message.writeHead(200, { 'Content-Type': 'text/plain',
   *                          'Trailer': 'Content-MD5' });
   * message.write(fileData);
   * message.addTrailers({ 'Content-MD5': '7895bf4b8828b55ceaf47747b4bca667' });
   * message.end();
   *
   * Attempting to set a header field name or value that contains invalid characters
   * will result in a 'TypeError' being thrown.
   * @since v0.3.0
   */
  addTrailers(headers: OutgoingHttpHeaders | ReadonlyArray<[string, string]>): void;
  /**
   * Compulsorily flushes the message headers
   *
   * For efficiency reason, Node.js normally buffers the message headers
   * until 'outgoingMessage.end()' is called or the first chunk of message data
   * is written. It then tries to pack the headers and data into a single TCP
   * packet.
   *
   * It is usually desired (it saves a TCP round-trip), but not when the first
   * data is not sent until possibly much later. 'outgoingMessage.flushHeaders()' bypasses the optimization and kickstarts the request.
   * @since v1.6.0
   */
  flushHeaders(): void;
}

declare class ServerResponse extends OutgoingMessage {
  statusCode: number;
  statusMessage: string;

  constructor(req: IncomingMessage);

  assignSocket(socket: Socket): void;
  detachSocket(socket: Socket): void;
  // https://github.com/nodejs/node/blob/master/test/parallel/test-http-write-callbacks.js#L53
  // no args in writeContinue callback
  writeContinue(callback?: () => void): void;
  writeHead(statusCode: number, reasonPhrase?: string, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]): this;
  writeHead(statusCode: number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]): this;
  writeProcessing(): void;
}

interface HttpResponse extends ServerResponse {
  /**
   * Set status 'code'.
   */
  status(code: StatusCode): this;

  /**
   * Set the response HTTP status code to 'statusCode' and send its string representation as the response body.
   * @link http://expressjs.com/4x/api.html#res.sendStatus
   *
   * Examples:
   *
   *    res.sendStatus(200); // equivalent to res.status(200).send('OK')
   *    res.sendStatus(403); // equivalent to res.status(403).send('Forbidden')
   *    res.sendStatus(404); // equivalent to res.status(404).send('Not Found')
   *    res.sendStatus(500); // equivalent to res.status(500).send('Internal Server Error')
   */
  sendStatus(code: StatusCode): this;

  /**
   * Set Link header field with the given 'links'.
   *
   * Examples:
   *
   *    res.links({
   *      next: 'http://api.example.com/users?page=2',
   *      last: 'http://api.example.com/users?page=5'
   *    });
   */
  links(links: any): this;

  /**
   * Send a response.
   *
   * Examples:
   *
   *     res.send(new Buffer('wahoo'));
   *     res.send({ some: 'json' });
   *     res.send('<p>some html</p>');
   *     res.status(404).send('Sorry, cant find that');
   */
  send: Send<ResBody, this>;

  /**
   * Send JSON response.
   *
   * Examples:
   *
   *     res.json(null);
   *     res.json({ user: 'tj' });
   *     res.status(500).json('oh noes!');
   *     res.status(404).json('I dont have that');
   */
  json: Send<ResBody, this>;

  /**
   * Send JSON response with JSONP callback support.
   *
   * Examples:
   *
   *     res.jsonp(null);
   *     res.jsonp({ user: 'tj' });
   *     res.status(500).jsonp('oh noes!');
   *     res.status(404).jsonp('I dont have that');
   */
  jsonp: Send<ResBody, this>;

  /**
   * Transfer the file at the given 'path'.
   *
   * Automatically sets the _Content-Type_ response header field.
   * The callback 'fn(err)' is invoked when the transfer is complete
   * or when an error occurs. Be sure to check 'res.headersSent'
   * if you wish to attempt responding, as the header and some data
   * may have already been transferred.
   *
   * Options:
   *
   *   - 'maxAge'   defaulting to 0 (can be string converted by 'ms')
   *   - 'root'     root directory for relative filenames
   *   - 'headers'  object of headers to serve with file
   *   - 'dotfiles' serve dotfiles, defaulting to false; can be '"allow"' to send them
   *
   * Other options are passed along to 'send'.
   *
   * Examples:
   *
   *  The following example illustrates how 'res.sendFile()' may
   *  be used as an alternative for the 'static()' middleware for
   *  dynamic situations. The code backing 'res.sendFile()' is actually
   *  the same code, so HTTP cache support etc is identical.
   *
   *     app.get('/user/:uid/photos/:file', function(req, res){
   *       var uid = req.params.uid
   *         , file = req.params.file;
   *
   *       req.user.mayViewFilesFrom(uid, function(yes){
   *         if (yes) {
   *           res.sendFile('/uploads/' + uid + '/' + file);
   *         } else {
   *           res.send(403, 'Sorry! you cant see that.');
   *         }
   *       });
   *     });
   *
   * @api public
   */
  sendFile(path: string, fn?: Errback): void;
  sendFile(path: string, options: any, fn?: Errback): void;

  /**
   * @deprecated Use sendFile instead.
   */
  // sendfile(path: string): void;
  /**
   * @deprecated Use sendFile instead.
   */
  // sendfile(path: string, options: any): void;
  /**
   * @deprecated Use sendFile instead.
   */
  // sendfile(path: string, fn: Errback): void;
  /**
   * @deprecated Use sendFile instead.
   */
  // sendfile(path: string, options: any, fn: Errback): void;

  /**
   * Transfer the file at the given 'path' as an attachment.
   *
   * Optionally providing an alternate attachment 'filename',
   * and optional callback 'fn(err)'. The callback is invoked
   * when the data transfer is complete, or when an error has
   * ocurred. Be sure to check 'res.headersSent' if you plan to respond.
   *
   * The optional options argument passes through to the underlying
   * res.sendFile() call, and takes the exact same parameters.
   *
   * This method uses 'res.sendfile()'.
   */
  download(path: string, fn?: Errback): void;
  download(path: string, filename: string, fn?: Errback): void;
  download(path: string, filename: string, options: any, fn?: Errback): void;

  /**
   * Set _Content-Type_ response header with 'type' through 'mime.lookup()'
   * when it does not contain "/", or set the Content-Type to 'type' otherwise.
   *
   * Examples:
   *
   *     res.type('.html');
   *     res.type('html');
   *     res.type('json');
   *     res.type('application/json');
   *     res.type('png');
   */
  contentType(type: string): this;

  /**
   * Set _Content-Type_ response header with 'type' through 'mime.lookup()'
   * when it does not contain "/", or set the Content-Type to 'type' otherwise.
   *
   * Examples:
   *
   *     res.type('.html');
   *     res.type('html');
   *     res.type('json');
   *     res.type('application/json');
   *     res.type('png');
   */
  type(type: string): this;

  /**
   * Respond to the Acceptable formats using an 'obj'
   * of mime-type callbacks.
   *
   * This method uses 'req.accepted', an array of
   * acceptable types ordered by their quality values.
   * When "Accept" is not present the _first_ callback
   * is invoked, otherwise the first match is used. When
   * no match is performed the server responds with
   * 406 "Not Acceptable".
   *
   * Content-Type is set for you, however if you choose
   * you may alter this within the callback using 'res.type()'
   * or 'res.set('Content-Type', ...)'.
   *
   *    res.format({
   *      'text/plain': function(){
   *        res.send('hey');
   *      },
   *
   *      'text/html': function(){
   *        res.send('<p>hey</p>');
   *      },
   *
   *      'appliation/json': function(){
   *        res.send({ message: 'hey' });
   *      }
   *    });
   *
   * In addition to canonicalized MIME types you may
   * also use extnames mapped to these types:
   *
   *    res.format({
   *      text: function(){
   *        res.send('hey');
   *      },
   *
   *      html: function(){
   *        res.send('<p>hey</p>');
   *      },
   *
   *      json: function(){
   *        res.send({ message: 'hey' });
   *      }
   *    });
   *
   * By default Express passes an 'Error'
   * with a '.status' of 406 to 'next(err)'
   * if a match is not made. If you provide
   * a '.default' callback it will be invoked
   * instead.
   */
  format(obj: any): this;

  /**
   * Set _Content-Disposition_ header to _attachment_ with optional 'filename'.
   */
  attachment(filename?: string): this;

  /**
   * Set header 'field' to 'val', or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    res.set('Foo', ['bar', 'baz']);
   *    res.set('Accept', 'application/json');
   *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   * Aliased as 'res.header()'.
   */
  set(field: any): this;
  set(field: string, value?: string | string[]): this;

  header(field: any): this;
  header(field: string, value?: string | string[]): this;

  // Property indicating if HTTP headers has been sent for the response.
  headersSent: boolean;

  /** Get value for header 'field'. */
  get(field: string): string;

  /** Clear cookie 'name'. */
  clearCookie(name: string, options?: any): this;

  /**
   * Set cookie 'name' to 'val', with the given 'options'.
   *
   * Options:
   *
   *    - 'maxAge'   max-age in milliseconds, converted to 'expires'
   *    - 'signed'   sign the cookie
   *    - 'path'     defaults to "/"
   *
   * Examples:
   *
   *    // "Remember Me" for 15 minutes
   *    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
   *
   *    // save as above
   *    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true })
   */
  cookie(name: string, val: string, options: CookieOptions): this;
  cookie(name: string, val: any, options: CookieOptions): this;
  cookie(name: string, val: any): this;

  /**
   * Set the location header to 'url'.
   *
   * The given 'url' can also be the name of a mapped url, for
   * example by default express supports "back" which redirects
   * to the _Referrer_ or _Referer_ headers or "/".
   *
   * Examples:
   *
   *    res.location('/foo/bar').;
   *    res.location('http://example.com');
   *    res.location('../login'); // /blog/post/1 -> /blog/login
   *
   * Mounting:
   *
   *   When an application is mounted and 'res.location()'
   *   is given a path that does _not_ lead with "/" it becomes
   *   relative to the mount-point. For example if the application
   *   is mounted at "/blog", the following would become "/blog/login".
   *
   *      res.location('login');
   *
   *   While the leading slash would result in a location of "/login":
   *
   *      res.location('/login');
   */
  location(url: string): this;

  /**
   * Redirect to the given 'url' with optional response 'status'
   * defaulting to 302.
   *
   * The resulting 'url' is determined by 'res.location()', so
   * it will play nicely with mounted apps, relative paths,
   * '"back"' etc.
   *
   * Examples:
   *
   *    res.redirect('/foo/bar');
   *    res.redirect('http://example.com');
   *    res.redirect(301, 'http://example.com');
   *    res.redirect('http://example.com', 301);
   *    res.redirect('../login'); // /blog/post/1 -> /blog/login
   */
  redirect(url: string): void;
  redirect(status: number, url: string): void;
  redirect(url: string, status: number): void;

  /**
   * Render 'view' with the given 'options' and optional callback 'fn'.
   * When a callback function is given a response will _not_ be made
   * automatically, otherwise a response of _200_ and _text/html_ is given.
   *
   * Options:
   *
   *  - 'cache'     boolean hinting to the engine it should cache
   *  - 'filename'  filename of the view being rendered
   */
  render(view: string, options?: object, callback?: (err: Error, html: string) => void): void;
  render(view: string, callback?: (err: Error, html: string) => void): void;

  locals: Locals;

  charset: string;

  /**
   * Adds the field to the Vary response header, if it is not there already.
   * Examples:
   *
   *     res.vary('User-Agent').render('docs');
   *
   */
  vary(field: string): this;

  // app: Application;

  /**
   * Appends the specified value to the HTTP response header field.
   * If the header is not already set, it creates the header with the specified value.
   * The value parameter can be a string or an array.
   *
   * Note: calling res.set() after res.append() will reset the previously-set header value.
   *
   * @since 4.11.0
   */
  append(field: string, value?: string[] | string): this;

  /**
   * After middleware.init executed, Response will contain req property
   * See: express/lib/middleware/init.js
   */
  // req?: Request;
}




// WebSocket socket.
declare class WebSocket extends EventEmitter {
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