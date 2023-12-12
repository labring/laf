---
title: Query Data
---

# {{ $frontmatter.title }}

Laf Cloud Database supports querying data with different conditions and processing the query results. This document will illustrate how to execute queries in cloud functions using `cloud.database()` through examples.

The data query operation mainly supports `where()`, `limit()`, `skip()`, `orderBy()`, `field()`, `get()`, `getOne()`, `count()`, etc.

Including:

[[toc]]

## Get All Records

::: tip
You can set query conditions with `where` and specify the number of items to display with `limit`.
:::

```typescript
import cloud from '@lafjs/cloud'
// Get the database reference
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // Use the get method to send a query request, without where it will query all data by default with a maximum of 100 records
  const result1 = await db.collection('user').get()
  console.log(result1) 

  // Use the get method to send a query request with where condition
  const result2 = await db.collection('user').where({
    name: 'laf'
  }).get()
  console.log(result2) 

  // Use the get method to send a query request to get more data at once, with a maximum of 1000 records
  const result3 = await db.collection('user').limit(1000).get()
  console.log(result3) 
}
```

Operations like `where()`, `limit()`, `skip()`, `orderBy()`, `field()` can be used before `get()`. They will be explained one by one below.

## Get One Record

If we only have one record to query, we can also use the `getOne` method. The difference between `getOne` and `get` is that `getOne` can only retrieve one record, and the data format is an object.

```typescript
import cloud from '@lafjs/cloud'
// Get the database reference
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  const res = await db.collection('user').getOne()
  console.log(res)  
// Result of getOne:
// {
//   ok: true,
//   data: { _id: '641d21992de2b789c963e5e0', name: 'jack' },
//   requestId: undefined
// }

  const res = await db.collection('user').get()
  console.log(res) 
// Result of get:
// {
//   data: [ { _id: '641d22292de2b789c963e5fd', name: 'jack' } ],
//   requestId: undefined,
//   ok: true
// }
}
```

Operations like `where()`, `limit()`, `skip()`, `orderBy()`, `field()` can be used before `getOne()`. They will be explained one by one below.

## Add Query Conditions

`collection.where()`

Set query conditions.
Where can accept an object as a parameter, indicating filtering out documents with the same key-value as the passed-in object. Multiple conditions can be filtered simultaneously.

For example, filter out all users with the name "jack":

```typescript
// Query records in the user collection where the name field is equal to jack
await db.collection("user").where({
 name:"jack"
});
```

:::tip
Here note that `where` does not query data directly. Please refer to our examples above and add `get()` or `getOne()`.
:::

## Query Data by ID

`collection.doc()`

The difference from `where` is that `doc` only filters based on _id.

::: warning
If the document is added using cloud.database(), the _id type is string.
If the document is added using cloud.mongo.db, the _id type is generally ObjectId.
:::

```typescript
// Query the document in the user collection with _id as '644148fd1eeb2b524dba499e'
await db.collection("user").doc('644148fd1eeb2b524dba499e');

// In fact, it is equivalent to filtering conditions where _id is the only condition
await db.collection("user").where({
  _id: '644148fd1eeb2b524dba499e'
});
```

```typescript
// Case where the type of _id is ObjectId
import { ObjectId } from 'mongodb' // Need to import the ObjectId type at the top of the cloud function

await db.collection("user").doc(ObjectId('644148fd1eeb2b524dba499e'));
```

## Advanced Query Commands

If you want to express more complex queries, you can use advanced query commands. This requires the use of database operators. For detailed usage, please refer to [Database Operators](/guide/db/command).

::: tip
`where` does not directly query data at the end. You need to follow it with `get()` or `getOne()`.
:::

### gt: Field Greater Than a Specified Value

Can be used to query fields of numeric, date, and other types. If it is string comparison, it will be compared according to lexicographical order.
  
This example filters out all users whose age is greater than 18:

```typescript
const db = cloud.database()
const _ = db.command; // Get the command here
await db.collection("user").where({
    age: _.gt(18) // Represents greater than 18
  },
);
```

### gte field greater than or equal to specified value

Can be used to query fields of numeric, date, and other types. If comparing strings, it will be compared in dictionary order.

```typescript
const db = cloud.database()
const _ = db.command; // Get command here
await db.collection("user").where({
    age: _.gte(18) // Represents greater than or equal to 18
  },
);
```

### lt field less than specified value

Can be used to query fields of numeric, date, and other types. If comparing strings, it will be compared in dictionary order.

### lte field less than or equal to specified value

Can be used to query fields of numeric, date, and other types. If comparing strings, it will be compared in dictionary order.

### eq represents field equals a certain value

The `eq` command accepts a literal, which can be a `number`, `boolean`, `string`, `object`, or `array`.

For example, to filter out all articles published by yourself, besides using the object way:

```typescript
const myOpenID = "xxx";
await db.collection("articles").where({
  _openid: myOpenID,
});
```

You can also use the command:

```typescript
const db = cloud.database()
const _ = db.command;
const myOpenID = "xxx";
await db.collection("articles").where({
  _openid: _.eq(myOpenID),
});
```

Note that the `eq` command is more flexible than the object way, as it can be used to represent cases where a field is equal to an object, for example:

```typescript
// This syntax represents matching stat.publishYear == 2018 and stat.language == 'zh-CN'
await db.collection("articles").where({
  stat: {
    publishYear: 2018,
    language: "zh-CN",
  },
});

// This syntax represents stat object equals { publishYear: 2018, language: 'zh-CN' }
const _ = db.command;
await db.collection("articles").where({
  stat: _.eq({
    publishYear: 2018,
    language: "zh-CN",
  }),
});
```

### neq represents field not equal to a certain value

Field not equal to. The `neq` command accepts a literal, which can be a `number`, `boolean`, `string`, `object`, or `array`.

For example, to filter out computers with brands other than X:

```typescript
const _ = db.command;
await db.collection("goods").where({
  category: "computer",
  type: {
    brand: _.neq("X"),
  },
});
```

### in field value within the given array

For example, to filter out users with age of 18 or 20:

```typescript
const _ = db.command;
await db.collection("user").where({
    age: _.in([18, 20]),
});
```

### nin field value not within the given array

For example, to filter out users with age not being 18 or 20:

```typescript
const _ = db.command;
await db.collection("user").where({
    age: _.nin([8, 20]),
});
```

### and represents that all specified conditions must be met at the same time

For example, to filter out users with age greater than 18 and less than 60:

Streaming syntax:

```typescript
const _ = db.command;
await db.collection("user").where({
    age: _.gt(18).and(_.lt(60)),
});
```

Prefix syntax:

```typescript
const _ = db.command;
await db.collection("user").where({
    age: _.and(_.gt(18), _.lt(60)),
});
```

### or represents that at least one of the specified conditions must be met

For example, to filter out users with age equal to 18 or equal to 60:

Streaming syntax:

```typescript
const _ = db.command;
await db.collection("user").where({
    age: _.eq(18).or(_.eq(60)),
});
```

Prefix syntax:

```typescript
const _ = db.command;
await db.collection("user").where({
    age: _.or(_.eq(18),_.eq(60)),
});
```

If you want to perform an "or" operation across fields: (for example, to filter out computers with memory of 8g or CPU of 3.2 ghz)

```typescript
const _ = db.command;
await db.collection("goods").where(
  _.or(
    {
      type: {
        memory: _.gt(8),
      },
    },
    {
      type: {
        cpu: 3.2,
      },
    }
  )
);
```

### exists determines whether a field exists

```typescript
const _ = db.command;
await db.collection("users").where(
  name: _.exists(true), // Name field exists
  age: _.exists(false), // Age field does not exist
);
```

## Regular Expression Query

`new RegExp` filters based on regular expressions.

For example, the following code can filter out records where the `version` field starts with a "number + s" and ignore case sensitivity:

```typescript
// You can directly use regular expressions
await db.collection('articles').where({
  version: /^\ds/i
})

// Or
await db.collection('articles').where({
  version: new RegExp('^\\ds','i')
})
```

## Get Query Count

`collection.count()` queries the number of documents that match the conditions.

Parameters

```typescript
await db.collection("goods").where({
  category: "computer",
  type: {
    memory: 8,
  },
}).count()
```

Response Parameters

| Field     | Type    | Required | Description                        |
| --------- | ------- | -------- | ---------------------------------- |
| code      | string  | No       | Status code, not returned if successful |
| message   | string  | No       | Error description                  |
| total     | Integer | No       | The count result                   |
| requestId | string  | No       | Request ID for error troubleshooting |

## Set Record Limit

`collection.limit()` limits the number of records displayed, up to 1000.

Parameter Explanation

| Parameter | Type    | Required | Description           |
| --------- | ------- | -------- | --------------------- |
| value     | Integer | Yes      | Number to limit display |

Usage Example

```typescript
await db.collection("user").limit(1).get()
```

## Set Starting Position

`collection.skip()` skips the displayed data.

Parameter Explanation

| Parameter | Type    | Required | Description            |
| --------- | ------- | -------- | ---------------------- |
| value     | Integer | Yes      | Data to skip displaying |

Usage Example

```typescript
await db.collection("user").skip(4).get()
```

## Pagination Query

Combining `skip()` and `limit()` can be used for pagination queries, and `getOne()` cannot be used here.

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // Number of records per page
  const pageSize = 3;
  // Page number
  const page = 2;
  const res = await db.collection('user')
  .skip((page - 1) * pageSize)
  .limit(pageSize)
  .get()
}
```

## Nested Query

If querying based on a field in an object or array:

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // Query data where userInfo.name = 'Jack' and userInfo.age = 10
  // Method 1
  const result1 = await db.collection('user')
  .where({
    userInfo: {
      name: "Jack",
      age: 10
    }
  }).get()
  // Method 2
  const result2 = await db.collection('user')
  .where({
    'userInfo.name': 'Jack',
    'userInfo.age': 10
  }).get()
}
```

For example, if the `test` collection in the database has the following data:

```json
[
  {
    "arr":[{
      "name": "item-1"
    },{
      "name": "item-2"
    }]
  },
  {
    "arr":[{
      "name": "item-3"
    },{
      "name": "item-4"
    }]
  }
]
```

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // Query data where arr[0].name = 'item-1'
  const result = await db.collection('test')
  .where({
    'arr.0.name': "item-1"
  }).get()
}
```

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // Query documents where the name of an element in arr is 'item-2'
  const result = await db.collection('test')
  .where({
    'arr.name': "item-2"
  }).get()
}
```

## Sort the Results

Use `collection.orderBy()` to sort the data before displaying it.

Parameter Description

| Parameter  | Type   | Required | Description                     |
|------------|--------|----------|---------------------------------|
| field      | string | Yes      | The field to sort by            |
| orderType  | string | Yes      | The order of sorting, either ascending (asc) or descending (desc) |

Usage Example

```typescript
// Sort in ascending order by the creation time createAt
await db.collection("user").orderBy("createAt", "asc").get()
```

## Specify the Returning Fields

Use `collection.field()` to only return specified fields.

Parameter Description

| Parameter | Type   | Required | Description                                            |
|-----------|--------|----------|--------------------------------------------------------|
| -         | object | Yes      | The fields to filter, pass 0 if not returning and 1 if returning |

::: tip
Note: You can only specify the fields to return or not return, i.e. `{'a': 1, 'b': 0}` is an incorrect parameter format. The default behavior is to display the id field.
:::

Usage Example

```typescript
await db.collection("user").field({ age: 1 });
```

Similarly, you need to add `get()` or `getOne()` afterwards to query the results.

## with Associated Query

Use `with` or `withOne` for associated queries, which allows you to query a collection and retrieve associated records from a specific field (can be across tables), such as querying "Class" and retrieving the "Students" within the class, or querying "Articles" and retrieving their "Authors".

:::info
Note: The `with` and `withOne` associated queries first query the main table internally, then query the subtable, and finally complete the concatenation locally (in cloud functions or clients) before returning the results to the application developer. If you haven't used the `with` associated query yet, it is recommended to use the aggregation operation [lookup associated query](#lookup-associated-query).
:::

### One-to-Many Relationship Query

This is mainly used for subqueries in "one-to-many" relationships and can be used for cross-table queries. Users need to have query permissions for the subtable.

```typescript
await const { data } = await db
  .collection("article")
  .with({
    query: db.collection("tag"),
    localField: "id", // Main table join key, i.e. article.id
    foreignField: "article_id", // Subtable join key, i.e. tag.article_id
    as: "tags", // Field renaming in the query result, defaults to the subtable name
  })
  .get();
console.log(data);
//  [ { id: 1, name: xxx, tags: [...] }  ]
```

### One-to-One Relationship Query

> Similar to the SQL left join query

```typescript
const { data } = await db
  .collection("article")
  .withOne({
    query: db.collection("user"),
    localField: "author_id", // Main table join key, i.e. article.id
    foreignField: "id", // Subtable join key, i.e. tag.article_id
    as: "author", // Field renaming in the query result, defaults to the subtable name
  })
  .get();

console.log(data);
//  [ { id: 1, name: xxx, author: {...} }  ]
```

## Lookup Associated Query

:::info
The lookup associated query is not a method under `collection`!

In fact, it is a method under `aggregate`, but since the previous section mentioned that the purpose of the `with` associated query is the same as this method, I will explain it here first to avoid developers thinking that lookup cannot be used, resulting in additional adaptation costs to switch to the with associated query.
:::

The purpose of the lookup associated query is basically the same as the `with` associated query. Here is an example similar to the `with` associated query: when querying the `article` collection, retrieve the tag labels of each record together.

```typescript
const { data } = await db
  .collection("article")
  .aggregate()
  .lookup({
    from: "tag",
    localField: "id", // Main table join key, i.e. article.id
    foreignField: "article_id", // Subtable join key, i.e. tag.article_id
    as: "tags", // Field renaming in the query result, defaults to the subtable name
  })
  .end();
console.log(data);
```

## Group By Query

For group by queries, please refer to the [Aggregation Operations](/guide/db/aggregate.html#bucket) document.
