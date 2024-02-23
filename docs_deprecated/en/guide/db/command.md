---
title: Database Operators
---

# {{ $frontmatter.title }}

Laf cloud functions support various database operators for executing queries, updates, deletions, and other operations.

## Initialization Operators

```typescript
const db = cloud.database()
const _ = db.command
// Use _ for subsequent operations
```

## Query - Logical Operators

### and

The `and` operator is used to represent the logical "and" relationship, which means that multiple query conditions need to be satisfied at the same time.

#### Usage

There are two ways to use `and`:

**1. Used in the root query condition**

In this case, you need to pass in multiple query conditions to represent multiple complete query conditions that need to be satisfied at the same time.

```js
const _ = db.command
let res = await db.collection('todo').where(_.and([
  {
    progress: _.gt(50)
  },
  {
    tags: 'cloud'
  }
])).get()
```

However, using `and` in the above query conditions is unnecessary because the implicitly combined fields of the passed-in object already represent the "and" relationship. The above conditions are equivalent to the more concise syntax below:

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.gt(50),
  tags: 'cloud'
}).get()
```

The explicit use of `and` is usually required when there are cross-field or cross-operation conditions.

**2. Used in field query conditions**

You need to pass in multiple query operators or constants to indicate that the field needs to satisfy or match the given conditions.

For example, the following code represents "progress field value greater than 50 and less than 100" using the prefix notation:

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.and(_.gt(50), _.lt(100))
}).get()
```

The same condition can also be represented using the postfix notation:

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.gt(50).and(_.lt(100))
}).get()
```

Note that `Command` can also directly chain other `Command` methods by default, which represents the logical "and" operation between multiple `Command`s. Therefore, the above code can be further simplified as follows:

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.gt(50).lt(100)
}).get()
```

### or

The `or` operator is used to represent the logical "or" relationship, which means that multiple query filtering conditions need to be satisfied at the same time. The `or` directive has two uses: performing "or" operations on field values, and performing "or" operations across fields.

#### "or" operation on field values

The "or" operation on field values means that a specified field value can be one of multiple values.

For example, to filter out todos with a progress greater than 80 or less than 20:

Streaming syntax:

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.gt(80).or(_.lt(20))
}).get()
```

Prefix notation:

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.or(_.gt(80), _.lt(20))
}).get()
```

The prefix notation can also accept an array:

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.or([_.gt(80), _.lt(20)])
}).get()
```

#### "or" operation across fields

The "or" operation across fields means that the condition is satisfied if any of the conditions in the `where` statements are met.

For example, to filter out todos with a progress greater than 80 or marked as completed:

```js
const _ = db.command
let res = await db.collection('todo').where(_.or([
  {
    progress: _.gt(80)
  },
  {
    done: true
  }
])).get()
```

### not

The `not` operator is used to represent the logical "not" relationship, which means that a specified condition needs to be unsatisfied.

#### Example

For example, to filter out todos with a progress not equal to 100:

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.not(_.eq(100))
}).get()
```

The `not` operator can also be used in combination with other logical directives, including `and`, `or`, `nor`, and `not`. For example, using `or`:

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.not(_.or([_.lt(50), _.eq(100)]))
}).get()
```

### nor

The `nor` operator is used to represent the logical "nor" relationship, which means that none of the specified conditions should be satisfied. If there is no corresponding field in the record, it is considered to satisfy the condition by default.

#### Example 1

Filter todos with progress not less than 20 and not greater than 80:

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.nor([_.lt(20), _.gt(80)])
}).get()
```

The above query will also filter out records that do not have the `progress` field. If you want to require the existence of the `progress` field, you can use the `exists` command:

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.exists(true).nor([_.lt(20), _.gt(80)])
  // Equivalent to the following non-chainable syntax:
  // progress: _.exists(true).and(_.nor([_.lt(20), _.gt(80)]))
}).get()
```

#### Example 2

Filter records where `progress` is not less than 20 and `tags` array does not contain the string "miniprogram":

```js
const _ = db.command
db.collection('todo').where(_.nor([{
  progress: _.lt(20),
}, {
  tags: 'miniprogram',
}])).get()
```

The above query will filter records that satisfy one of the following conditions:

1. `progress` is not less than 20 and `tags` array does not contain the string "miniprogram"
3. `progress` is not less than 20 and `tags` field does not exist
5. `progress` field does not exist and `tags` array does not contain the string "miniprogram"
7. `progress` is not less than 20 and `tags` field does not exist

If you want to require the existence of both the `progress` and `tags` fields, you can use the `exists` command:

```js
const _ = db.command
let res = await db.collection('todo').where(
  _.nor([{
    progress: _.lt(20),
  }, {
    tags: 'miniprogram',
  }])
  .and({
    progress: _.exists(true),
    tags: _.exists(true),
  })
).get()
```

## Query Comparison Operators

### eq

Query filter condition, represents a field that is equal to a specific value. The `eq` command accepts a literal, which can be a number, boolean, string, object, array, or Date.

#### Usage

For example, to filter out all articles posted by oneself using the object notation:

```js
const openID = 'xxx'
let res = await db.collection('articles').where({
  _openid: openID
}).get()
```

You can also use the command notation:

```js
const _ = db.command
const openID = 'xxx'
let res = await db.collection('articles').where({
  _openid: _.eq(openid)
}).get()
```

Note that the `eq` command provides more flexibility than the object notation and can be used to represent a field that is equal to an object, for example:

```js
// This syntax represents a match where stat.publishYear == 2018 && stat.language == 'zh-CN'
let res = await db.collection('articles').where({
  stat: {
    publishYear: 2018,
    language: 'zh-CN'
  }
}).get()

// This syntax represents stat equal to { publishYear: 2018, language: 'zh-CN' }
const _ = db.command
let res = await db.collection('articles').where({
  stat: _.eq({
    publishYear: 2018,
    language: 'zh-CN'
  })
}).get()
```

### neq

Query filter condition, represents a field that is not equal to a specific value. The `neq` command accepts a literal, which can be a number, boolean, string, object, array, or Date.

#### Usage

Represents a field that is not equal to a specific value, opposite to [eq](#eq).

### lt

Query filter operator, represents a field that is less than a specific value. Can pass a `Date` object for date comparison.

#### Example

Find todos with progress less than 50:

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.lt(50)
})
.get()
```

### lte

Query filter operator, represents a field that is less than or equal to a specific value. Can pass a `Date` object for date comparison.

#### Example

Find todos with progress less than or equal to 50:

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.lte(50)
})
.get()
```

### gt

Query filter operator, represents a field that is greater than a specific value. Can pass a `Date` object for date comparison.

#### Example

Find todos with progress greater than 50:

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.gt(50)
})
.get()
```

### gte

Query filter operator, represents a field that is greater than or equal to a specific value. Can pass a `Date` object for date comparison.

#### Example

Find todos with progress greater than or equal to 50:

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.gte(50)
})
.get()
```

### in

The query filter operator that requires the value to be within the given array.

#### Example code

Find todos with progress of 0 or 100.

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.in([0, 100])
})
.get()
```

### nin

The query filter operator that requires the value not to be within the given array.

#### Example code

Find todos with progress that is not 0 or 100.

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.nin([0, 100])
})
.get()
```

## Query Field Operators

### exists

Check if the field exists. True for existence, false for non-existence.

#### Example code

Find records with the tags field present.

```js
const _ = db.command
let res = await db.collection('todos').where({
  tags: _.exists(true)
})
.get()
```

### mod

The query filter operator that requires the field, when used as the dividend, to satisfy value % divisor = remainder.

#### Example code

Find records where the progress field is a multiple of 10.

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.mod(10, 0)
})
.get()
```

## Array Operators

### all

Array query operator. Used for querying array fields, requiring that the array field contains all elements of the given array.

#### Example code 1: Regular array

Find records with the tags array field containing both "cloud" and "database".

```js
const _ = db.command
let res = await db.collection('todos').where({
  tags: _.all(['cloud', 'database'])
})
.get()
```

#### Example code 2: Object array

If the array elements are objects, you can use `_.elemMatch` to match partial fields of the object.

Assume that the places field is defined as follows:

```js
{
  "type": string
  "area": number
  "age": number
}
```

Find records where the array field contains at least one element satisfying "area > 100 and age < 2" and another element satisfying "type is mall and age > 5".

```js
const _ = db.command
let res = await db.collection('todos').where({
  places: _.all([
    _.elemMatch({
      area: _.gt(100),
      age: _.lt(2),
    }),
    _.elemMatch({
      type: 'mall',
      age: _.gt(5),
    }),
  ]),
})
.get()
```

### elemMatch

Used for querying array fields, requiring that the array contains at least one element satisfying all conditions given by `elemMatch`.

#### Example code: Array of objects

Assume the collection example data is as follows:

```js
{
  "_id": "a0",
  "city": "x0",
  "places": [{
    "type": "garden",
    "area": 300,
    "age": 1
  }, {
    "type": "theatre",
    "area": 50,
    "age": 15
  }]
}
```

Find records where the `places` array field contains at least one element satisfying "area > 100 and age < 2".

```js
const _ = db.command
let res = await db.collection('todos').where({
  places: _.elemMatch({
    area: _.gt(100),
    age: _.lt(2),
  })
})
.get()
```

*Note*: If you don't use `elemMatch` and directly specify the conditions as follows, it means that at least one element in the `places` array field has an `area` field greater than 100 and at least one element in the `places` array field has an `age` field less than 2:

```js
const _ = db.command
let res = await db.collection('todos').where({
  places: {
    area: _.gt(100),
    age: _.lt(2),
  }
})
.get()
```

#### Example code: Array of primitive data types

Assume the collection example data is as follows:

```js
{
  "_id": "a0",
  "scores": [60, 80, 90]
}
```

Find records where the `scores` array field contains at least one element satisfying "greater than 80 and less than 100".

```js
const _ = db.command
let res = await db.collection('todos').where({
  scores: _.elemMatch(_.gt(80).lt(100))
})
.get()
```

### size

The query filter operator used for querying array fields, requiring the array length to be equal to the given value.

#### Example

Find all records with a tags array field length of 2.

```js
const _ = db.command
let res = await db.collection('todos').where({
  places: _.size(2)
})
.get()
```

## Geospatial Operators

### geoNear

Find records in order of proximity to the given point.

#### Index Requirement

A geospatial index must be created on the query field.

#### Example Code

Find records within a range of 1 km to 5 km from the given location.

```js
const _ = db.command
let res = await db.collection('restaurants').where({
  location: _.geoNear({
    geometry: new db.Geo.Point(113.323809, 23.097732),
    minDistance: 1000,
    maxDistance: 5000,
  })
}).get()
```

### geoWithin

Find records with field values within a specified area, without sorting. The specified area must be a polygon or a collection of polygons.

#### Index Requirements

A geospatial index is required for the query field.

#### Example Code 1: Given a Polygon

```js
const _ = db.command
const { Point, LineString, Polygon } = db.Geo
let res = await .collection('restaurants').where({
  location: _.geoWithin({
    geometry: new Polygon([
      new LineString([
        new Point(0, 0),
        new Point(3, 2),
        new Point(2, 3),
        new Point(0, 0)
      ])
    ]),
  })
}).get()
```

#### Example Code 2: Given a Circle

You can construct a circle using `centerSphere` instead of `geometry`.

The value of `centerSphere` is defined as: `[ [longitude, latitude], radius ]`.

The radius should be in radians. For example, if you need a radius of 10 km, divide the distance by the Earth's radius of 6378.1 km to get the number.

```js
const _ = db.command
let res = await db.collection('restaurants').where({
  location: _.geoWithin({
    centerSphere: [
      [-88, 30],
      10 / 6378.1,
    ]
  })
}).get()
```

### geoIntersects

Find records that intersect with the given geospatial shapes.

#### Index Requirements

A geospatial index is required for the query field.

#### Example Code: Find Records Intersecting with a Polygon

```js
const _ = db.command
const { Point, LineString, Polygon } = db.Geo
let res = await db.collection('restaurants').where({
  location: _.geoIntersects({
    geometry: new Polygon([
      new LineString([
        new Point(0, 0),
        new Point(3, 2),
        new Point(2, 3),
        new Point(0, 0)
      ])
    ]),
  })
}).get()
```

## Query Expression Operators

### expr

A query operator used to introduce an aggregation expression in a query statement. It takes one argument, which must be an aggregation expression.

#### Usage

1. `expr` can be used to introduce an aggregation expression in the `match` stage of an aggregation pipeline.
2. If the `match` stage is within a `lookup` stage, the `expr` expression can use variables defined in the `let` parameter of the `lookup` stage. For specific examples, refer to the example on "Specifying multiple join conditions" in the documentation for `lookup`.
3. `expr` can be used to introduce an aggregation expression in a regular query statement (`where`).

#### Example Code 1: Compare two fields in the same record

Assuming the data structure of the `items` collection is as follows:

```js
{
  "_id": string,
  "inStock": number, // Stock quantity
  "ordered": number  // Quantity ordered
}
```

Find records where the quantity ordered is greater than the stock quantity:

```js
const _ = db.command
const $ = _.aggregate
let res = await db.collection('items').where(_.expr($.gt(['$ordered', '$inStock']))).get()
```

#### Example Code 2: Combine with conditional statements

Assuming the data structure of the `items` collection is as follows:

```json
{
  "_id": string,
  "price": number
}
```

Assume that a discount of 20% is applied to prices less than or equal to 10, and a discount of 50% is applied to prices greater than 10. Query the database to return records with a discounted price less than or equal to 8:

```js
const _ = db.command
const $ = _.aggregate
let res = await db.collection('items').where(
  _.expr(
    $.lt([
      $.cond({
        if: $.gte(['$price', 10]),
        then: $.multiply(['$price', '0.5']),
        else: $.multiply(['$price', '0.8']),
      }),
      8
    ])
)).get()
```

## Update Field Operators

### set

An update operator used to set a field to a specified value.

#### Usage

This method allows specifying an object as the field value, unlike passing a plain JavaScript object.

#### Example

```js
// The following method only updates style.color to red, instead of updating the entire style object to { color: 'red' }, it does not affect other fields in style
let res = await db.collection('todos').doc('doc-id').update({
  style: {
    color: 'red'
  }
})

// The following method updates style to { color: 'red', size: 'large' }
let res = await db.collection('todos').doc('doc-id').update({
  style: _.set({
    color: 'red',
    size: 'large'
  })
})
```

### remove

Update operator used to indicate the deletion of a field.

#### Example

Remove the style field:

```js
const _ = db.command
let res = await db.collection('todos').doc('todo-id').update({
  style: _.remove()
})
```

### inc

Update operator used for atomic increment of a field.

#### Atomic Increment

When multiple users write simultaneously, the field is incremented for the database, and there is no situation where a later writer overwrites an earlier one.

#### Example

Increment the progress of a todo by 10:

```js
const _ = db.command
let res = await db.collection('todos').doc('todo-id').update({
  progress: _.inc(10)
})
```

### mul

Update operator used for atomic multiplication of a field.

#### Atomic Multiplication

When multiple users write simultaneously, the field is multiplied for the database, and there is no situation where a later writer overwrites an earlier one.

#### Example

Multiply the progress of a todo by 10:

```js
const _ = db.command
let res = await db.collection('todos').doc('todo-id').update({
  progress: _.mul(10)
})
```

### min

Update operator used to update a field with a given value only if the value is smaller than the current value of the field.

#### Example

If the progress field > 50, update it to 50:

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  progress: _.min(50)
})
```

### max

Update operator used to update a field with a given value only if the value is larger than the current value of the field.

#### Example

If the progress field < 50, update it to 50:

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  progress: _.max(50)
})
```

### rename

Update operator used to rename a field. If you need to rename a deeply nested field, use dot notation. Cannot rename fields nested in arrays.

#### Example 1: Rename top-level field

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  progress: _.rename('totalProgress')
})
```

#### Example 2: Rename nested field

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  someObject: {
    someField: _.rename('someObject.renamedField')
  }
})
```

or:

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  'someObject.someField': _.rename('someObject.renamedField')
})
```

## Update Array Operators

### push

Array update operator. Used to add one or more values to an array field. If the field does not exist, it will be created and set to the input value.

#### Parameter Description

**position**

Must be used together with the `each` parameter.

A non-negative number represents the position counting from the beginning of the array, starting from 0. If the value is greater than or equal to the length of the array, it will be added to the end. A negative number represents the position counting from the end of the array, e.g., -1 represents the second-to-last element. If the absolute value of a negative number is greater than or equal to the length of the array, it will be added to the beginning of the array.

**sort**

Must be used together with the `each` parameter.

Given 1 for ascending order and -1 for descending order.

If the array elements are records, use `{ <field>: 1 | -1 }` format to specify the field based on which to sort in ascending or descending order.

**slice**

Must be used together with the `each` parameter.

|Value|Description|
|:-:|:-:|
|0|Update the field to an empty array|
|Positive integer|Keep only the first n elements|
|Negative integer|Keep only the last n elements|

#### Example 1: Add elements to the end

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push(['mini-program', 'cloud'])
})
```

#### Example 2: Insert at the second position

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push({
    each: ['mini-program', 'cloud'],
    position: 1,
  })
})
```


#### Example 3: Sorting

Sort the entire array after inserting.

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push({
    each: ['mini-program', 'cloud'],
    sort: 1,
  })
})
```

Sort the array without inserting.

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push({
    each: [],
    sort: 1,
  })
})
```

If the field is an array of objects, you can sort it based on a field in the element object like this:

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push({
    each: [
      { name: 'miniprogram', weight: 8 },
      { name: 'cloud', weight: 6 },
    ],
    sort: {
      weight: 1,
    },
  })
})
```

#### Example 4: Truncation

Keep only the last 2 elements after inserting.

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push({
    each: ['mini-program', 'cloud'],
    slice: -2,
  })
})
```

#### Example 5: Insert at a specified position, then sort, and finally keep only the first 2 elements

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push({
    each: ['mini-program', 'cloud'],
    position: 1,
    slice: 2,
    sort: 1,
  })
})
```

### pop

Array update operator. Deletes the last element of an array field. Only the last element can be deleted.

#### Example code

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.pop()
})
```

### unshift

Array update operator. Adds one or more values to the beginning of an array field. If the field is originally empty, it creates the field and sets the array to the given value.

#### Example code

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.unshift(['mini-program', 'cloud'])
})
```

### shift

Array update operator. Deletes the first element of an array field.

#### Example code

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.shift()
})
```

### pull

Array update operator. Removes all elements in the array that match a given value or query condition.

#### Example code 1: Remove based on constant value

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.pull('database')
})
```

#### Example code 2: Remove based on query condition

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.pull(_.in(['database', 'cloud']))
})
```

#### Example code 3: Remove based on query condition when the field is an array of objects

Assume the elements in the `places` array have the following structure:

```json
{
  "type": string
  "area": number
  "age": number
}
```

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  places: _.pull({
    area: _.gt(100),
    age: _.lt(2),
  })
})
```

#### Example code 4: Remove based on query condition when the field is an array of objects with nested objects

Assume the elements in the `cities` array have the following structure:

```js
{
  "name": string
  "places": Place[]
}
```

The `Place` structure is as follows:

```js
{
  "type": string
  "area": number
  "age": number
}
```

You can use `elemMatch` to match the nested array field `places`.

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  cities: _.pull({
    places: _.elemMatch({
      area: _.gt(100),
      age: _.lt(2),
    })
  })
})
```

### pullAll

Array update operator. Removes all elements in the array that match a given value. Unlike `pull`, it can only specify constant values, and the input must be an array.

#### Example Code: Remove by Constant Matching

Remove all strings 'database' and 'cloud' from tags.

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.pullAll(['database', 'cloud'])
})
```

### addToSet

Array update operator. Atomic operation. Given one or more elements, add them to the array if they don't already exist.

#### Example Code 1: Add an element

If the tags array does not contain 'database', add it.

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.addToSet('database')
})
```

#### Example Code 2: Adding Multiple Elements

You need to pass in an object with a field `each`, whose value is an array, where each element represents the element to be added.

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.addToSet({
    $each: ['database', 'cloud']
  })
})
```