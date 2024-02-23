---
title: Access Policies
---

# {{ $frontmatter.title }}

Front-end can use [laf-client-sdk](https://github.com/labring/laf/tree/main/packages/client-sdk) to "directly connect" to the database without interacting with the server.

Access policies are used to securely control client operations on the database. An access policy consists of multiple access rules for collections, and each collection can have access rules configured for read and write operations.

Developers can create multiple access policies for an application to be used by different clients.

Typically, an application can create two access policies:

- `app` is used for access policy for user-side clients, such as App, mini-programs, H5, etc.
- `admin` is used for access policy for the application's back-end management.

## Creating a Policy

First, we switch to the collections page and follow the steps below to add an access policy to the `user` collection.

:::tip
If you don't have a `user` collection yet, please create one first.
:::

![creat-polocy](../../doc-images/creat-polocy.png)

![add-polocy](../../doc-images/add-polocy.png)

After completing these two steps, we have successfully created an access policy and applied it to the `user` collection.
Let's explain the rule content here:

```js
{
  "read": true, // read permission
  "count": true, // count permission
  "update": false, // update permission
  "remove": false, // remove permission
  "add": false // add permission
}
```

Setting the value to `true` means allowed, while `false` means not allowed. According to the default rules we just mentioned, the front-end can directly perform `query` and `count` operations on our collection, but adding, updating, and removing operations are not allowed.
There is another thing worth noting here, which is the "Entry URL". We set the policy name to `app`, so the entry URL is `/proxy/app`. Let's demonstrate how to use it next.

## Front-end "Direct Connection"

Before the demonstration, let's add some data to the `user` collection.

![polocy-db-data](../../doc-images/polocy-db-data.png)

Now we come to the front-end project, and for this demonstration, we will use a Vue project, but the steps are similar for other projects.

### Install the SDK First

```bash
npm i laf-client-sdk
```

### Then Create a Cloud Object

Pay attention here that we fill in an additional parameter `dbProxyUrl`, and its value is the entry URL we just mentioned: `/proxy/app`.

```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https:/<APP_ID>.laf.run",   // <APP_ID> is obtained from the application list on the homepage
  getAccessToken: () => "",    // We don't need authorization here, so leave it blank for now
  dbProxyUrl: "/proxy/app", // Fill in the entry URL we just mentioned here
})
```

After creating the cloud object, let's try sending a query directly on the front-end.

```js
async function get() {
  const res = await cloud.database().collection("user").get();
  console.log(res);
//   {
//   "data": [
//       {
//           "_id": "641d22292de2b789c963e5fd",
//           "name": "jack"
//       },
//       {
//           "_id": "641e87d52c9ce609db4d6047",
//           "name": "rose"
//       }
//   ],
//   "ok": true
// }
}
```

Now let's try counting.

```js
async function get() {
  const res = await cloud.database().collection("user").count();
  console.log(res);
  // {
  //   "total": 2,
  //   "ok": true
  // }
}
```

As you can see, we no longer need to write a cloud function for simple query and count operations; we can directly implement them on the front-end. If you want to experience `add`, `update`, or `remove` operations, you can modify the corresponding access policy to allow them, but this is a dangerous behavior.

Access policies can also be expressed as expressions. Here is an example of an access policy for the `users` collection:
In this example, `query` is the data query condition object, and `uid === query._id` indicates that this policy only allows the current user to read their own user data.

```json
  "users"
  {
    "read": "uid === query._id"
  }
```

> Note: `uid` is a field in the JWT Payload, representing the ID of the currently logged-in user. You can generate a JWT token in a cloud function, and the fields in the payload can be used in the access policy.

## Validators

An access rule consists of one or more validators. `"read": true` uses the `condition` validator, which takes an expression to control access permission.
The above example uses the shorthand form, and the full syntax is as follows:

```json
{
  "read": {
    "condition": true
  }
}
```

Currently, the following validators are built-in:

- `condition` is a condition validator that takes an expression and returns true if access is allowed. The default available objects in the expression are:
  - `JWT Payloads` fields in the JWT token payload, such as `uid` in the example
  - `query` data query condition
  - `data` data object for update or add operations
- `data` is a data validator that takes an object and validates each field in the "data object" for update or add operations. Please refer to the following example for details.
- `query` is a validator for the query condition object, which takes an object and validates each field in the "query condition object". Please refer to the following example for details.
- `multi` is used to indicate whether batch operations are allowed. It takes an expression as configuration. By default, only the `read` operation allows batch operations. If you need to enable other batch operations, you need to explicitly specify this validator.

## Best Practices

Access rules may seem tedious and difficult to grasp at first, and it is easy to make mistakes or lack confidence in their security. Based on our extensive experience in various projects, we have some recommendations:

- Principle of least privilege: only grant the necessary access permissions to clients and only expose the necessary collections.

  - By only granting `read` permission, you can save 30% to 50% of backend API calls.
  - Additionally, by using basic `condition` checks, you can effectively reduce the number of backend API calls by 70% to 90%.

- For transactional data operations or complex form submissions, it is recommended to use cloud functions:

  - Cloud functions have the same interface as client SDKs, making them simple, lightweight, and easy to debug without the need for deployment.
  - When accessing databases in cloud functions, there is no need to write access rules because cloud functions are trusted server-side code.

- Although access rules can handle many complex validations, it is recommended to use cloud functions to implement this logic unless you are very proficient in access rules.

## Access Rule Examples

> Below are a few simple examples for reference and understanding.

### Simple Example 1: Simple personal blog

```json
"categories"
{
  "read": true,
  "update": "uid",
  "add": "uid",
  "remove": "uid"
},
"articles"
{
  "read": true,
  "update": "uid",
  "add": "uid",
  "remove": "uid"
}
```

> Note: The rule `"update": "uid"` means that `uid` should not be a falsy value (undefined | null | false, etc.).

### Simple Example 2: Multi-user blog

```json
{
  "read": true,
  "update": "uid === query.author_id",
  "add": "uid === query.author_id",
  "remove": "uid === query.author_id"
}
```

### Complex Example 1: Data validation

```json
{
  "read": true,
  "add": {
    "condition": "uid === query.author_id",
    "data": {
      "title": { "length": [1, 64], "required": true },
      "content": { "length": [1, 4096] },
      "status": { "boolean": [true, false] },
      "likes": { "number": [0], "default": 0 },
      "author_id": "$value == uid"
    }
  },
  "remove": "uid === query.author_id",
  "count": true
}
```

### Complex Example 2: Advanced data validation

> Scenario: Access rules for a table of messages between users

```json
{
  "read": "uid === query.receiver || uid === query.sender",
  "update": {
    "condition": "$uid === query.receiver",
    "data": {
      "read": { "in": [true] }
    }
  },
  "add": {
    "condition": "uid === data.sender",
    "data": {
      "read": { "in": [false] },
      "content": { "length": [1, 20480], "required": true },
      "receiver": { "exists": "/users/id" },
      "read": { "in": [true, false], "default": false }
    }
  },
  "remove": false
}
```

### Example of a data validator

```json
"categories": {
  "read": true,
  "update": "role === 'admin'",
  "add": {
    "condition": "role === 'admin'",
    "data": {
      "password": { "match": "^\\d{6,10}$" },
      "author_id": "$value == uid",
      "type": { "required": true, "in": ["choice", "fill"] },
      "title": { "length": [4, 64], "required": true, "unique": true },
      "content": { "length": [4, 20480] },
      "total": { "number": [0, 100], "default": 0, "required": true }
    }
  }
}
```