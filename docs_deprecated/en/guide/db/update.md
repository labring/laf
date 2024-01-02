---
title: Update Data
---

# {{ $frontmatter.title }}

Updating data in Laf Cloud Database involves modifying documents in a collection. You can set query conditions using operators like `where`, and then use update operators like `update` or `set` to make the changes.

## Updating Documents

### Updating a Specific Document

Here, we will change the name of "jack" to "Tom".

```typescript
await db.collection('user')
.where({ name: 'jack' })
.update({ name: "Tom" })
```

Similarly, you can update multiple properties of a document at once. For example, changing the name and age together:

```typescript
await db.collection('user')
.where({ name: 'jack' })
.update({ name: "Tom", age: "18" })
```

### Updating Documents in Bulk

In this case, we are not adding any condition restrictions. We directly change the name of all records in the "user" table to "Tom". The operation is the same as before, except now we need to pass an additional object `{multi:true}`.

```typescript
await db.collection('user')
.update({ name: "Tom" },{ multi:true })
```

## Update Operators

### set

Update operator. If the data does not exist, a new document will be created.

::: warning
Note: Using `set` requires using `doc` to query the document based on its ID, and then perform the update. If the document is not found, a new document will be created.
`doc` [Usage Guide](/guide/db/find.html#根据id查询数据)
:::

```typescript
await collection.doc('644148fd1eeb2b524dba499e').set({
  name: "Hey"
})
```

### inc

Update operator. Used to increment a field by a certain value. The value must be a positive or negative integer. The advantage of using this atomic operation instead of reading the data, adding to it, and writing it back is:

1. Atomicity: Multiple users can write at the same time, and the database will increment the field for each user without overwriting each other.
2. Reducing network requests: There's no need to read before writing.

Similarly, the `mul` operator works.

For example, incrementing the number of favorite products:

```typescript
const _ = db.command;
await db.collection("user")
  .where({
    _openid: "my-open-id",
  })
  .update({
    count: {
      favorites: _.inc(1),
    },
  })
```

### mul

Update operator. Used to multiply a field by a certain value. The value must be a positive or negative integer or 0.

### remove

Update operator. Used to delete a field. For example, if someone deletes the rating in their product review:

```typescript
const _ = db.command;
await db.collection("comments")
  .doc("comment-id")
  .update({
    rating: _.remove(),
  })
```

### push

Append elements to the end of an array. You can pass a single element or an array.

```typescript
const _ = db.command;
await db.collection("comments")
  .doc("comment-id")
  .update({
    // users: _.push('aaa')
    users: _.push(["aaa", "bbb"]),
  })
```

### pop

Remove the last element of an array.

```typescript
const _ = db.command;
await db.collection("comments")
  .doc("comment-id")
  .update({
    users: _.pop(),
  })
```

### unshift

Add elements to the beginning of an array. You can pass a single element or an array. Same usage as `push`.

### shift

Removes the first element from an array. Similar to `pop`.