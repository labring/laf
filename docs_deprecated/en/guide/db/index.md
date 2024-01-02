---
title: Introduction to Cloud Database
---

# {{ $frontmatter.title }}

Laf Cloud Database provides a plug-and-play database that requires no complex configuration or connection. In the cloud functions, you can use `cloud.database()` to create a new DB instance for database operations.

Laf Cloud Database uses `MongoDB` as its underlying database, which retains the native querying methods of `MongoDB` and also encapsulates more convenient methods.

Laf Cloud Database is a JSON-formatted document-oriented database, where each record in the database is a JSON-formatted document. Therefore, in the Laf database, a collection corresponds to a data table in MySQL, a document corresponds to a row in MySQL, and a field corresponds to a column in MySQL.

## Basic Concepts

### Document

Each record in the database is a JSON-formatted document, such as:

```typescript
{
  "username": "hello",
  "password": "123456",
  "extraInfo": {
    "mobile": "15912345678"
  }
}
```

### Collection

A collection is a group of documents, with each document residing in a collection. For example, all users are stored in the `users` collection.

```typescript
[
  {
    "username": "name1",
    "password": "123456",
    "extraInfo": {
      "mobile": "15912345678"
    }
  },
  {
    "username": "name2",
    "password": "12345678",
    "extraInfo": {
      "mobile": "15912345679"
    }
  }
  ...
]
```

### Database

Each Laf application has one and only one database, but a database can have multiple collections.

![dblist](/doc-images/dblist.jpg)

The above diagram represents that there are two collections, namely the `test` collection and the `messages` collection, in the current Laf application.

At the same time, in the Laf `Web IDE`, you can conveniently view the entire collection list and perform simple management.

## Data Types

The cloud database provides the following types:

__Common Data Types__

- `String`: string type, stores UTF-8 encoded strings of any length
- `Number`: number type, including integers and floating-point numbers
- `Boolean`: boolean type, including true and false
- `Date`: date type, stores dates and times
- `ObjectId`: object ID type, used to store unique identifiers for documents
- `Array`: array type, can contain any number of values, including other data types and nested arrays
- `Object`: object type, can contain any number of key-value pairs, where the value can be any data type, including other objects and nested arrays

__Other Data Types__

- `Null`: acts as a placeholder, represents a field that exists but has no value
- `GeoPoint`: geographic location point
- `GeoLineStringLine`: geographic path
- `GeoPolygon`: geographic polygon
- `GeoMultiPoint`: multiple geographic location points
- `GeoMultiLineString`: multiple geographic paths
- `GeoMultiPolygon`: multiple geographic polygons

### Date Type

The Date type is used to represent time, accurate to milliseconds, and can be created using the built-in JavaScript Date object.

::: warning
Note: the current server time may have timezone issues and may not be in GMT+8, when storing in the database, you can convert it to GMT+8 or use timestamps.
:::

In cloud functions, you can directly use `new Date()` to get the current server time.

```typescript
// Current server time
console.log(new Date())
// Output: 2023-04-21T14:47:32.697Z

const date = new Date();
const timestamp = date.getTime();
console.log(timestamp); 
// Output: a timestamp in milliseconds, e.g., 1650560477427
```

To get GMT+8 time:

```typescript
// Get the GMT+8 time of the current time
const date = new Date();
const offset = 8; // GMT+8 offset is +8

// Calculate the UTC time of the current time, and then add the offset to get the GMT+8 time
const utcTime = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
const beijingTime = new Date(utcTime + (offset * 60 * 60 * 1000));
console.log(beijingTime); // Output: Date object of GMT+8 time
```

The following demonstrates adding a record to the `test` collection in a cloud function, and adding two fields, `createTime` and `createTimestamp`, representing the creation time.

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database()

export async function main(ctx: FunctionContext) {

  // Get the GMT+8 time of the current time
  const date = new Date();
  const offset = 8; // GMT+8 offset is +8

  // Calculate the UTC time of the current time, and then add the offset to get the GMT+8 time
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
  const beijingTime = new Date(utcTime + (offset * 60 * 60 * 1000));
  console.log(beijingTime); // Output: Date object of GMT+8 time

  await db.collection('test').add({
    name: 'xiaoming',
    createTime: beijingTime,
    createTimestamp: date.getTime()
  })
}
```

### Null Type

Null is equivalent to a placeholder that indicates a field exists but has no value.