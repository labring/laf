# HTTP Calls

Each cloud function provides an API endpoint that can be called from anywhere capable of making HTTP requests.

![function-url](../../doc-images/function-url.png)

## Using `axios` for the call

Here is a simple example of using `axios` in the frontend to make a request to a cloud function.

```typescript
// get request
import axios from 'axios';

const { data } = await axios({
  url: "<FunctionURL>",
  method: "get",
});

console.log(data);
```

```typescript
// post request
import axios from 'axios';

const { data } = await axios({
  url: "<FunctionURL>",
  method: "post",
  data: {
    name: 'Jack'
  }
});

console.log(data);
```

## `curl` Invocation

You can also use `curl` to invoke cloud functions.

GET request

```shell
curl <FunctionURL>?query=hello&limit=10 \
     -H "Authorization: Bearer abc123" \
     -H "Content-Type: application/json"
```

POST request

```shell
curl -X POST <FunctionURL> \
     -H "Content-Type: application/json" \
     -d '{"name": "John", "age": 30}'
```