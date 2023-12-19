---
title: Add Data
---

# {{ $frontmatter.title }}

In the Laf function library, adding data is very simple. More formally, it is called inserting a document. Here are the ways to insert a single document and insert multiple documents.

At the same time, Laf Cloud Database is `Schema Free`, which means you can insert any fields and data types.

::: tip
Using the method of adding data with `cloud.database()` does not allow for customizing the ID. All added data will have an automatically generated ID, which is of type `string`.

Using the `mongodb native syntax`, you can customize the ID or have it automatically generated, with the generated ID being of type `ObjectId`.
:::

## Inserting a Single Document

The following example adds a record to the `user` collection.

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database()

export default async function (ctx: FunctionContext) {
  // Add a record to the user collection
  const res = await db.collection('user').add({ name: "jack" })
  console.log(res)
}
```

## Batch Adding Documents

Of course, we can also add multiple records at once by passing in an additional object `{ multi: true }`.

```typescript
const list = [
  { name: "jack" },
  { name: "rose" }
]
// Add multiple records to the user collection
const res = await db.collection('user').add(list, { multi: true })
console.log(res)
```

## MongoDB Native Syntax

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export async function main(ctx: FunctionContext) {
  // Insert a single document into the user collection
  const result1 = db.collection('user').insertOne({ name: "jack" })
  console.log(result1)
  // Insert multiple documents into the user collection
  const documents = [
    { name: "Jane Doe", age: 25 },
    { name: "Bob Smith", age: 40 }
  ];
  const result2 = db.collection('user').insertMany(documents);
  console.log(result2)
}
```