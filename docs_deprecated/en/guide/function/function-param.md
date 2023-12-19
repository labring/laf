---
title: Cloud Function Parameters and Return Values
---

# {{ $frontmatter.title }}

## Parameters

In the `main` function, you can access the request information passed by the user through the first parameter `ctx`.
The following example reads the Query parameter `username` passed by the front-end:

```js
export default async function (ctx: FunctionContext) {
  return `hello, ${ctx.query.username}`;
};
```

Similarly, you can read the body parameter passed by the front-end:

```js
export default async function (ctx: FunctionContext) {
  return `hello, ${ctx.body}`;
};
```

The `ctx` object contains the following properties:

| Property        | Description                                                               |
| --------------- | ------------------------------------------------------------------------- |
| `ctx.requestId` | The unique ID of the current request                                      |
| `ctx.method`    | The method of the current request, such as `GET` or `POST`                |
| `ctx.headers`   | All headers of the request                                                |
| `ctx.auth`      | The token value parsed when using Http Bearer Token authentication         |
| `ctx.query`     | The query parameters of the current request                               |
| `ctx.body`      | The body parameters of the current request                                |
| `ctx.response`  | The HTTP response, consistent with the `Response` instance in `express`    |
| `ctx.socket`    | WebSocket instance ([WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)) |
| `ctx.files`     | Uploaded files (an array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File) objects) |

## Return Value

So how do we pass data to the frontend? It's simple, just return it in the cloud function.

```js
export default async function (ctx: FunctionContext) {
  // Here is an example using a string, but you can return any data type.
  return "This is the data returned to the frontend";
};
```