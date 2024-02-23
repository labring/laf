---
title: Delete Data
---

# {{ $frontmatter.title }}

Laf Cloud Database provides the ability to delete data, including deleting documents and collections. It supports both single deletion and batch deletion.

## Deleting a Single Document by Specifying Conditions

We can use `where` and various advanced commands in conjunction with `remove` to delete a single document.

```js
  // Delete a record with name "jack" from the user collection
  const res = await db.collection('user').where({ name: "jack" }).remove()
  console.log(res)
```

## Deleting Multiple Documents by Specifying Conditions

The above example can only delete one piece of data at a time. If you want to delete multiple documents, add `{multi: true}` to `remove()`.

```js
// Delete all records in the user collection with the name "jack"
await db.collection('user')
.where({ name: "jack" })
.remove({ multi: true })
```

## Clearing a Collection (Dangerous Operation)

If we want to remove all data from a collection, we can do it like this.

```js
// Clear the user collection
await db.collection('user').remove({ multi: true })
```