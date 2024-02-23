---
title: Usage of Cloud Functions
---

# {{ $frontmatter.title }}

## Cloud Function Parameters

In the `main` function, you can retrieve the request information passed by the user through the `ctx` parameter. The following example demonstrates how to read the `Query` parameter `username` passed from the front-end:

![function-query](/doc-images/function-query.png)

The cloud function code is as follows:

```js
export function main(ctx: FunctionContext) {
  console.log(ctx.query.username)
};
```

You can also read the `body` parameter `username` passed from the front-end HTTP request:

![function-query](/doc-images/function-body.png)

The cloud function code is as follows:

```js
export function main(ctx: FunctionContext) {
  console.log(ctx.body.username)
};
```

`ctx` has the following properties:

| Property        | Description                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| `ctx.requestId` | The unique ID of the current request                                               |
| `ctx.method`    | The method of the current request, e.g., `GET`, `POST`                             |
| `ctx.headers`   | All headers of the request                                                         |
| `ctx.user`      | The token value parsed when using Http Bearer Token authentication                 |
| `ctx.query`     | The query parameters of the current request                                        |
| `ctx.body`      | The body parameters of the current request                                         |
| `ctx.request`   | HTTP request, consistent with the `Request` instance in `express`                  |
| `ctx.response`  | HTTP response, consistent with the `Response` instance in `express`                 |
| `ctx.socket`    | [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) instance, [Laf WebSocket Documentation](/guide/function/websocket.html) |
| `ctx.files`     | Uploaded files (an array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File) objects) |
| `ctx.env`       | Custom environment variables for the application ([env](env.md))                   |

## Cloud Function Return Values

So, how do we return data from a cloud function?

### Method 1: Using `return`

It's simple, just use `return` in the cloud function.

```js
export function main (ctx: FunctionContext) {
  // Here is an example with a string, you can return any data type.
  return "This is the data to be returned to the front-end"
};
```

Cloud function return values support various types:

```js
return Buffer.from("whoop"); // Buffer
return {
  some: "json";
} // Object, will be processed as JSON
return ("<p>some html</p>"); // HTML
return ("Sorry, we cannot find that!"); // String
```

### Method 2: Setting the response headers, status code, and response body using ctx.response

Here `ctx.response` aligns with the `Response` instance in the Express framework.

Here are some common methods of the res object:

```js
ctx.response.send(body) // Sends the response body, which can be a string, a Buffer object, a JSON object, an array, etc.
ctx.response.json(body) // Sends a JSON response
ctx.response.status(statusCode) // Sets the HTTP response status code
ctx.response.setHeader(name, value) // Sets a response header
...
```

If you need to send a status code, you can use `ctx.response.status`:

```js
ctx.response.status(403); // Sends a 403 status code
```

If you need to send data in chunks, you can use `ctx.response.write` and `ctx.response.end`:

For example:

```js
export function main (ctx: FunctionContext) {
  // Set response headers
  ctx.response.type = 'text/html';
  ctx.response.status = 200;
  // Write data chunks
  ctx.response.write('<html><body>');
  ctx.response.write('<h1>Hello, world!</h1>');
  ctx.response.write('</body></html>');
  // End the response
  ctx.response.end();
};
```

## Support for asynchronous operations

In practical applications, cloud functions may need to perform asynchronous operations such as network requests, database operations, etc.

Fortunately, cloud functions themselves support asynchronous invocation. You just need to add `async` before the function, and it will easily support asynchronous operations.

When creating a new cloud function, `async` is already added before the main function by default.

:::tip
When performing asynchronous operations in cloud functions, try to use `await` to wait for their completion.
:::

In the following example, we query the "user" collection in the database:

```js
import cloud from '@lafjs/cloud'
const db = cloud.database()

export default async function (ctx: FunctionContext) {
  // Add await before asynchronous operations like database queries
  const res = await db.collection('user').get()
  // Synchronous operations do not require await
  console.log(res.data)
};
```

## Introduction to Cloud Function Import

Now you can directly import another cloud function into a cloud function.

::: tip
The imported cloud function needs to be published before it can be imported.
:::

Import syntax:

```js
// funcName is the default function
import funcName from '@/funcName'
// Import function named func
import { func } from '@/funcName'
```

For example, import the `util` cloud function into the `test` cloud function.

```js
// util cloud function
export default async function main () {
  return "util has been imported"
};

export function add(a: number, b: number) {
  return a + b
};
```

```js
// test cloud function
import util, { add } from '@/util'

export async function main(ctx: FunctionContext) {
  // Since the default method of util is async, await is needed
  console.log(await util())
  // Output: "util has been imported"
  console.log(add(1, 2))
  // Output: 3
}
```