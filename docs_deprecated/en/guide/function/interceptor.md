# Cloud Function Interceptors

Interceptors are a powerful feature in cloud functions that allow you to intercept and modify requests and responses before they are processed by the function. This can be useful for various purposes such as authentication, logging, error handling, and more.

## How Interceptors Work

When a request is made to a cloud function, it goes through a series of interceptors before reaching the actual function logic. Each interceptor has the ability to modify the request or response object, and can also choose to pass the request to the next interceptor in the chain.

## Creating an Interceptor

To create an interceptor, you need to define a function that accepts two parameters: the request object and a callback function. The callback function should be called with either an error object (if an error occurred) or the modified request object.

Here's an example of how to create an interceptor that adds a timestamp to the request object:

```javascript
function addTimestamp(request, callback) {
  request.timestamp = Date.now();
  callback(null, request);
}
```

## Registering an Interceptor

Once you have defined an interceptor, you can register it with your cloud function. This can be done using the appropriate configuration option provided by your cloud function provider.

For example, if you are using Google Cloud Functions, you can register an interceptor by defining it in the `index.js` file and adding it to the `interceptors` array in the function configuration:

```javascript
const functions = require('firebase-functions');

exports.myFunction = functions.https.onRequest((request, response) => {
  // Function logic here
});

exports.myFunction.interceptors = [addTimestamp];
```

## Conclusion

Interceptors provide a powerful way to intercept and modify requests and responses in cloud functions. They can be used for various purposes and allow for flexible customization of your function's behavior. Consider using interceptors to enhance the functionality and security of your cloud functions.

# {{ $frontmatter.title }}

If you need to use an interceptor, you need to create a cloud function named `__interceptor__`.

::: info
`__interceptor__` is a fixed name.
:::

Laf Cloud Function Interceptor is a pre-interceptor that is requested before all cloud function requests.

Only if the return value of the interceptor is `true`, the original cloud function will be requested.

Here is a simple interceptor example. If the IP is `111.111.111.111`, the original cloud function can be accessed:

```typescript
export default async function(ctx: FunctionContext) {
  // Get the actual IP of the request
  const ip = ctx.headers['x-forwarded-for']
  if(ip === '111.111.111.111'){
    return true
  }else{
    return false
  }
}
```

Feel free to explore more uses!
