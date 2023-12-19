---
title: Introduction to Databases
---

# {{ $frontmatter.title }}

Laf provides a ready-to-use database for each application, which is very easy to use. Here is a simple example of database CRUD operations to quickly understand Laf's database operations.

## Creating a Database Instance

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database() 
// db is the newly created database instance
```

## Inserting Documents in Cloud Functions

Use the `add` method to insert data into a collection.

For example, add a document with `name` as `Jack` to the `user` collection.

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database() 

export async function main(ctx: FunctionContext) {
  const res = await db.collection('user').add({
    name: 'Jack'
  })
  console.log(res)
}
```

```json
// A new document will be added to the 'test' collection, with an automatically generated _id
{
  "_id": "6442b2cac4f3afd9a186ecd9",
  "name": "Jack"
}
```

## Querying Documents in Cloud Functions

Use the `get` method to query documents in a collection.

::: tip
The `get` method can retrieve up to 100 records at a time. If you need to query more records at once, please refer to the data query documentation.
:::

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database() 

export async function main(ctx: FunctionContext) {
  const res = await db.collection('user').get()
  console.log(res)
  // Query result
  // {
  //   data: [ { _id: '6442b2cac4f3afd9a186ecd9', name: 'Jack' } ],
  //   requestId: undefined,
  //   ok: true
  // }
}
```

Use the `getOne` method to query the latest document in a collection.

::: tip
The `getOne` method retrieves one latest record at a time.
:::

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database() 

export async function main(ctx: FunctionContext) {
  const res = await db.collection('user').getOne()
  console.log(res)
  // Query result
  // {
  //   ok: true,
  //   data: { _id: '6442b2cac4f3afd9a186ecd9', name: 'Jack' },
  //   requestId: undefined
  // }
}
```

## Modifying Documents in Cloud Functions

Retrieve the `_id` of the document with `name` as `Jack`, and then update the document based on the `_id`.

Use the `update` method to modify documents.

::: tip
`where` sets the query condition, and `doc` queries based on the id.
:::

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database() 

export async function main(ctx: FunctionContext) {
  const res = await db.collection('test').where({
    name:'Jack'
  }).get()
  // console.log(res)
  const id = res.data[0]._id
  const updateRes = await db.collection('test').doc(id).update({
    name:'Tom'
  })
  console.log(updateRes)
  // Modification result: updated:1 represents successfully modified 1 document
  // {
  //   requestId: undefined,
  //   updated: 1,
  //   matched: 1,
  //   upsertId: null,
  //   ok: true
  // }
}
```

## Cloud Function: Delete Document

To delete a document in the database where the `name` is `Tom`, follow the steps below:

::: tip
By default, `remove` can only delete a single piece of data. If you need to delete multiple documents, please refer to the document on data deletion.
:::

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database() 

export async function main(ctx: FunctionContext) {
  const res = await db.collection('test').where({ name: "Tom" }).remove()
  console.log(res)
  // Deletion result: deleted:1 indicates the successful deletion of 1 document
  // { requestId: undefined, deleted: 1, ok: true }
}
```

--------

By following the documentation step by step, you should have a basic understanding of CRUD operations in the database. However, if you need to dive deeper into using database operations, you will need to carefully review the subsequent documents.