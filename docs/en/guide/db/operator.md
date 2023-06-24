---
title: Database Operations
---

# {{ $frontmatter.title }}

**Equivalent to the concept of aggregation operators in MongoDB**

## Arithmetic Operators

### abs

<!--
/// meta
keyword: abs，absolute value
-->

Returns the absolute value of a number.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.abs(<number>)
```

The `abs` function takes a value that can be a numeric constant or any expression that resolves to a number.

If the expression resolves to `null` or points to a non-existent field, the result of `abs` is `null`. If the value resolves to `NaN`, the result is `NaN`.

#### Example Code

Suppose the `ratings` collection has the following records:

```typescript
{ _id: 1, start: 5, end: 8 }
{ _id: 2, start: 4, end: 4 }
{ _id: 3, start: 9, end: 7 }
{ _id: 4, start: 6, end: 7 }
```

You can find the absolute difference between the `start` and `end` values for each record as follows:

```typescript
const $ = db.command.aggregate
let res = await db.collection('ratings').aggregate()
  .project({
    delta: $.abs($.subtract(['$start', '$end']))
  })
  .end()
```

The result is as follows:

```typescript
{ "_id" : 1, "delta" : 3 }
{ "_id" : 2, "delta" : 0 }
{ "_id" : 3, "delta" : 2 }
{ "_id" : 4, "delta" : 1 }
```

### add

<!--
/// meta
keyword: addition, add, date
-->

Adds numbers or adds numbers to a date. If one of the values in the array is a date, the other values are treated as milliseconds to be added to that date.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.add([<expression1>, <expression2>, ...])
```

Expressions can be in the form of `$ + specified field` or regular strings that can be parsed into strings.

#### Example Code

Suppose the `staff` collection has the following records:

```typescript
{ _id: 1, department: "x", sales: 5, engineer: 10, lastUpdate: ISODate("2019-05-01T00:00:00Z") }
{ _id: 2, department: "y", sales: 10, engineer: 20, lastUpdate: ISODate("2019-05-01T02:00:00Z") }
{ _id: 3, department: "z", sales: 20, engineer: 5, lastUpdate: ISODate("2019-05-02T03:00:00Z") }
```

**Summing Numbers**

You can find the total number of people for each record as follows:

```typescript
const $ = db.command.aggregate
let res = await db.collection('staff').aggregate()
  .project({
    department: 1,
    total: $.add(['$sales', '$engineer'])
  })
  .end()
```

The result is as follows:

```typescript
{ _id: 1, department: "x", total: 15 }
{ _id: 2, department: "y", total: 30 }
{ _id: 3, department: "z", total: 25 }
```

**Adding Date Values**

The following operation calculates the value of `lastUpdate` plus one hour for each record:

```typescript
const $ = db.command.aggregate
let res = await db.collection('staff').aggregate()
  .project({
    department: 1,
    lastUpdate: $.add(['$lastUpdate', 60*60*1000])
  })
  .end()
```

The result is as follows:

```typescript
{ _id: 1, department: "x", lastUpdate: ISODate("2019-05-01T01:00:00Z") }
{ _id: 2, department: "y", lastUpdate: ISODate("2019-05-01T03:00:00Z") }
{ _id: 3, department: "z", lastUpdate: ISODate("2019-05-02T04:00:00Z") }
```

### ceil

Rounds up to the nearest integer greater than or equal to the given number.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.ceil(<number>)
```

`<number>` can be any expression that resolves to a number. If the expression resolves to `null` or points to a non-existent field, `null` is returned. If it resolves to `NaN`, `NaN` is returned.

#### Example Code

Suppose the `sales` collection has the following records:

```typescript
{ _id: 1, sales: 5.2 }
{ _id: 2, sales: 1.32 }
{ _id: 3, sales: -3.2 }
```

You can round each number up to the nearest integer as follows:

```typescript
const $ = db.command.aggregate
let res = await db.collection('sales').aggregate()
  .project({
    sales: $.ceil('$sales')
  })
  .end()
```

The result is as follows:

```typescript
{ _id: 1, sales: 6 }
{ _id: 2, sales: 2 }
{ _id: 3, sales: -3 }
```

### divide

Takes a dividend and a divisor and returns the quotient.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.divide([<dividend expression>, <divisor expression>])
```

The expressions can be any expressions that evaluate to a number.

#### Sample Code

Assuming the `railroads` collection has the following records:

```typescript
{ _id: 1, meters: 5300 }
{ _id: 2, meters: 64000 }
{ _id: 3, meters: 130 }
```

You can convert each number to kilometers using the following code:

```typescript
const $ = db.command.aggregate
let res = await db.collection('railroads').aggregate()
  .project({
    km: $.divide(['$meters', 1000])
  })
  .end()
```

The returned result will be:

```typescript
{ _id: 1, km: 5.3 }
{ _id: 2, km: 64 }
{ _id: 3, km: 0.13 }
```

### exp

Calculates e (the base of natural logarithms, Euler's number) raised to the power of n.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.exp(<exponent>)
```

The `<exponent>` can be any expression that evaluates to a number. If the expression evaluates to `null` or points to a non-existent field, `null` will be returned. If the expression evaluates to `NaN`, `NaN` will be returned.

#### Sample Code

Assuming the `math` collection has the following records:

```typescript
{ _id: 1, exp: 0 }
{ _id: 2, exp: 1 }
{ _id: 3, exp: 2 }
```

You can calculate the value of e raised to the power of `exp` using the following code:

```typescript
const $ = db.command.aggregate
let res = await db.collection('math').aggregate()
  .project({
    result: $.exp('$exp')
  })
  .end()
```

The returned result will be:

```typescript
{ _id: 1, result: 1 }
{ _id: 2, result: 2.71828182845905 }
{ _id: 3, result: 7.38905609893065 }
```

### floor

Rounds a number down to the nearest integer that is greater than or equal to the given number.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.floor(<number>)
```

The `<number>` can be any expression that evaluates to a number. If the expression evaluates to `null` or points to a non-existent field, `null` will be returned. If the expression evaluates to `NaN`, `NaN` will be returned.

#### Sample Code

Assuming the `sales` collection has the following records:

```typescript
{ _id: 1, sales: 5.2 }
{ _id: 2, sales: 1.32 }
{ _id: 3, sales: -3.2 }
```

You can round each number down to the nearest integer using the following code:

```typescript
const $ = db.command.aggregate
let res = await db.collection('sales').aggregate()
  .project({
    sales: $.floor('$sales')
  })
  .end()
```

The returned result will be:

```typescript
{ _id: 1, sales: 5 }
{ _id: 2, sales: 1 }
{ _id: 3, sales: -4 }
```

### ln

Calculates the natural logarithm of a given number.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.ln(<number>)
```

The `<number>` can be any expression that evaluates to a non-negative number.

`ln` is equivalent to `log([<number>, Math.E])`, where `Math.E` is the method in JavaScript to get the value of `e`.

#### Sample Code

Assuming the `curve` collection has the following records:

```typescript
{ _id: 1, x: 1 }
{ _id: 2, x: 2 }
{ _id: 3, x: 3 }
```

You can calculate the value of ln(x) using the following code:

```typescript
const $ = db.command.aggregate
let res = await db.collection('curve').aggregate()
  .project({
    log: $.ln('$x')
  })
  .end()
```

The returned result will be:

```typescript
{ _id: 1, ln: 0 }
{ _id: 2, ln: 0.6931471805599453 }
{ _id: 3, ln: 1.0986122886681098 }
```

### log

Calculates the logarithm of a given number with a given base.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.log([<number>, <base>])
```

The `<number>` can be any expression that evaluates to a non-negative number. The `<base>` can be any expression that evaluates to a number greater than 1.

If either parameter evaluates to `null` or points to a non-existent field, `log` will return `null`. If either parameter evaluates to `NaN`, `log` will return `NaN`.

#### Sample Code

Assuming the `curve` collection has the following records:

```typescript
{ _id: 1, x: 1 }
{ _id: 2, x: 2 }
{ _id: 3, x: 3 }
```

You can calculate the value of log2(x) using the following code:

```typescript
const $ = db.command.aggregate
let res = await db.collection('curve').aggregate()
  .project({
    log: $.log(['$x', 2])
  })
  .end()
```

The returned result will be:

```typescript
{ _id: 1, log: 0 }
{ _id: 2, log: 1 }
{ _id: 3, log: 1.58496250072 }
```

### log10

Calculate the logarithm of a given number with base 10.

#### API description

Syntax:

```typescript
db.command.aggregate.log(<number>)
```

`<number>` can be any expression that evaluates to a non-negative number.

`log10` is equivalent to fixing the second argument of the `log` method to be 10.

#### Example

#### db.command.aggregate.log10

Calculate the logarithm of a given number with base 10.

Syntax:

```typescript
db.command.aggregate.log(<number>)
```

`<number>` can be any expression that evaluates to a non-negative number.

`log10` is equivalent to fixing the second argument of the `log` method to be 10.

### mod

Perform the modulo operation on a number.

#### API description

Syntax:

```typescript
db.command.aggregate.mod([<dividend>, <divisor>])
```

The first number is the dividend, and the second number is the divisor. The arguments can be any expressions that evaluate to numbers.

#### Example

Suppose the `shopping` collection has the following documents:

```typescript
{ _id: 1, bags: 3, items: 5 }
{ _id: 2, bags: 2, items: 8 }
{ _id: 3, bags: 5, items: 16 }
```

Calculate the remainder (`items % bags`) for each document:

```typescript
const $ = db.command.aggregate
let res = await db.collection('shopping').aggregate()
  .project({
    overflow: $.mod(['$items', '$bags'])
  })
  .end()
```

The result is as follows:

```typescript
{ _id: 1, overflow: 2 }
{ _id: 2, overflow: 0 }
{ _id: 3, overflow: 1 }
```

### multiply

Multiply the given number arguments.

#### API description

Syntax:

```typescript
db.command.aggregate.multiply([<expression1>, <expression2>, ...])
```

The arguments can be any expressions that evaluate to numbers.

#### Example

Suppose the `fruits` collection has the following documents:

```typescript
{ "_id": 1, "name": "apple", "price": 10, "quantity": 100 }
{ "_id": 2, "name": "orange", "price": 15, "quantity": 50 }
{ "_id": 3, "name": "lemon", "price": 5, "quantity": 20 }
```

Calculate the total value of each fruit:

```typescript
const $ = db.command.aggregate
let res = await db.collection('fruits').aggregate()
  .project({
    name: 1,
    total: $.multiply(['$price', '$quantity']),
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "name": "apple", "total": 1000 }
{ "_id": 2, "name": "orange", "total": 750 }
{ "_id": 3, "name": "lemo", "total": 100 }
```

### pow

Calculate the power of a given base with an exponent.

#### API description

Syntax:

```typescript
db.command.aggregate.pow([<base>, <exponent>])
```

The arguments can be any expressions that evaluate to numbers.

#### Example

Suppose the `stats` collection has the following documents:

```typescript
{ "_id": 1, "x": 2, "y": 3 }
{ "_id": 2, "x": 5, "y": 7 }
{ "_id": 3, "x": 10, "y": 20 }
```

Calculate the sum of squares of `x` and `y`:

```typescript
const $ = db.command.aggregate
let res = await db.collection('stats').aggregate()
  .project({
    sumOfSquares: $.add([$.pow(['$x', 2]), $.pow(['$y', 2])]),
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "sumOfSquares": 13 }
{ "_id": 2, "sumOfSquares": 74 }
{ "_id": 3, "sumOfSquares": 500 }
```

### sqrt

Calculate the square root.

#### API description

Syntax:

```typescript
db.command.aggregate.sqrt([<number>])
```

The argument can be any expression that evaluates to a non-negative number.

### Example Code

Assume the collection `triangle` contains the following records of right-angle triangles:

```typescript
{ "_id": 1, "x": 2, "y": 3 }
{ "_id": 2, "x": 5, "y": 7 }
{ "_id": 3, "x": 10, "y": 20 }
```

Assume that `x` and `y` represent the lengths of the two legs, and we want to calculate the length of the hypotenuse:

```typescript
const $ = db.command.aggregate
let res = await db.collection('triangle').aggregate()
  .project({
    len: $.sqrt([$.add([$.pow(['$x', 2]), $.pow(['$y', 2])])]),
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "len": 3.605551275463989 }
{ "_id": 2, "len": 8.602325267042627 }
{ "_id": 3, "len": 22.360679774997898 }
```

### subtract

Subtracts two numbers and returns the difference, or subtracts two dates and returns the difference in milliseconds, or subtracts a number from a date and returns the resulting date.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.subtract([<expression1>, <expression2>])
```

The parameters can be any expression that evaluates to a number or date.

#### Example Code

Assume the collection `scores` contains the following records:

```typescript
{ "_id": 1, "max": 10, "min": 1 }
{ "_id": 2, "max": 7, "min": 5 }
{ "_id": 3, "max": 6, "min": 6 }
```

We want to calculate the difference between the `max` and `min` values for each record:

```typescript
const $ = db.command.aggregate
let res = await db.collection('scores').aggregate()
  .project({
    diff: $.subtract(['$max', '$min'])
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "diff": 9 }
{ "_id": 2, "diff": 2 }
{ "_id": 3, "diff": 0 }
```

### trunc

Truncates a number to an integer.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.trunc(<number>)
```

The parameter can be any expression that evaluates to a number.

#### Example Code

Assume the collection `scores` contains the following records:

```typescript
{ "_id": 1, "value": 1.21 }
{ "_id": 2, "value": 3.83 }
{ "_id": 3, "value": -4.94 }
```

We want to truncate the `value` field of each record to an integer:

```typescript
const $ = db.command.aggregate
let res = await db.collection('scores').aggregate()
  .project({
    int: $.trunc('$value')
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "value": 1 }
{ "_id": 2, "value": 3 }
{ "_id": 3, "value": -4 }
```

## Array Operators

### arrayElemAt

Returns the element at the specified index in an array.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.arrayElemAt([<array>, <index>])
```

`<array>` can be any expression that evaluates to an array.

`<index>` can be any expression that evaluates to an integer. If it is a positive number, `arrayElemAt` returns the element at the specified index. If it is a negative number, `arrayElemAt` returns the element at the index counting from the end of the array.

#### Example Code

Assume the collection `exams` contains the following records:

```typescript
{ "_id": 1, "scores": [80, 60, 65, 90] }
{ "_id": 2, "scores": [78] }
{ "_id": 3, "scores": [95, 88, 92] }
```

We want to retrieve the first and last scores for each record:

```typescript
const $ = db.command.aggregate
let res = await db.collection('exams').aggregate()
  .project({
    first: $.arrayElemAt(['$scores', 0]),
    last: $.arrayElemAt(['$scores', -1]),
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "first": 80, "last": 90 }
{ "_id": 2, "first": 78, "last": 78 }
{ "_id": 3, "first": 95, "last": 92 }
```

### arrayToObject

Converts an array into an object.

#### API Description

There are two possible syntaxes:

First, pass in a two-dimensional array where each sub-array has a length of 2, with the first value as the field name and the second value as the field value:

```typescript
db.command.aggregate.arrayToObject([
  [<key1>, <value1>],
  [<key2>, <value2>],
  ...
])
```

Second, pass in an array of objects, where each object must contain the fields `k` and `v`, specifying the field name and field value respectively:

```typescript
db.command.aggregate.arrayToObject([
  { "k": <key1>, "v": <value1> },
  { "k": <key2>, "v": <value2> },
  ...
])
```

The parameter passed to `arrayToObject` can be any expression that can be parsed as one of the above representations.

#### Sample Code

Assuming the `shops` collection has the following records:

```typescript
{ "_id": 1, "sales": [ ["max", 100], ["min", 50] ] }
{ "_id": 2, "sales": [ ["max", 70], ["min", 60] ] }
{ "_id": 3, "sales": [ { "k": "max", "v": 50 }, { "k": "min", "v": 30 } ] }
```

Converting an array to an object:

```typescript
const $ = db.command.aggregate
let res = await db.collection('shops').aggregate()
  .project({
    sales: $.arrayToObject('$sales'),
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "sales": { "max": 100, "min": 50 } }
{ "_id": 2, "sales": { "max": 70, "min": 60 } }
{ "_id": 3, "sales": { "max": 50, "min": 30 } }
```

### concatArrays

Concatenates multiple arrays into one array.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.concatArrays([ <array1>, <array2>, ... ])
```

The parameters can be any expression that evaluates to an array.

#### Sample Code

Assuming the `items` collection has the following records:

```typescript
{ "_id": 1, "fruits": [ "apple" ], "vegetables": [ "carrot" ] }
{ "_id": 2, "fruits": [ "orange", "lemon" ], "vegetables": [ "cabbage" ] }
{ "_id": 3, "fruits": [ "strawberry" ], "vegetables": [ "spinach" ] }
```

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    list: $.concatArrays(['$fruits', '$vegetables']),
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "list": [ "apple", "carrot" ] }
{ "_id": 2, "list": [ "orange", "lemon", "cabbage" ] }
{ "_id": 3, "list": [ "strawberry", "spinach" ] }
```

### filter

Returns a subset of an array that satisfies a given condition.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.filter({
  input: <array>,
  as: <string>,
  cond: <expression>
})
```

|Field |Description                                                     |
|------|---------------------------------------------------------------|
|input |An expression that evaluates to an array                        |
|as    |Optional. The variable name for each element in the array, defaults to `this`|
|cond  |An expression that evaluates to a boolean value, used to determine if each element satisfies the condition. The names of the elements are determined by the `as` parameter (parameter names should be prefixed with `$$`, e.g., `$$this`)|

The parameters can be any expression that evaluates to an array.

#### Sample Code

Assuming the `fruits` collection has the following records:

```typescript
{
  "_id": 1,
  "stock": [
    { "name": "apple", "price": 10 },
    { "name": "orange", "price": 20 }
  ],
}
{
  "_id": 2,
  "stock": [
    { "name": "lemon", "price": 15 },
  ],
}
```

```typescript
const _ = db.command
const $ = db.command.aggregate
let res = await db.collection('fruits').aggregate()
  .project({
    stock: $.filter({
      input: '$stock',
      as: 'item',
      cond: $.gte(['$$item.price', 15])
    })
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "stock": [ { "name": "orange", "price": 20} ] }
{ "_id": 2, "stock": [ { "name": "lemon", "price": 15 } ] }
```

### in

Checks whether a value exists in an array and returns `true` if it does, otherwise returns `false`.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.in([<value>, <array>])
```

`<value>` can be any expression.

`<array>` can be any expression that evaluates to an array.

#### Sample Code

Assume the collection `shops` has the following records:

```typescript
{ "_id": 1, "topsellers": ["bread", "ice cream", "butter"] }
{ "_id": 2, "topsellers": ["ice cream", "cheese", "yogurt"] }
{ "_id": 3, "topsellers": ["croissant", "cucumber", "coconut"] }
```

Mark the records that have the top-selling item "ice cream":

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    included: $.in(['ice cream', '$topsellers'])
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "included": true }
{ "_id": 2, "included": true }
{ "_id": 3, "included": false }
```

### indexOfArray

Find the index of the first element in an array that is equal to the given value. If not found, return -1.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.indexOfArray([ <array expression>, <search expression>, <start>, <end> ])
```

|Field |Type   |Description                                                        |
|----  |----   |----                                                               |
|-     |string |An expression that can be parsed into an array. If parsed as null, indexOfArray returns null.|
|-     |string |The condition matching expression applied to each element of the data.                 |
|-     |integer|Optional. Specifies the starting index for the search. Must be a non-negative integer.|
|-     |integer|Optional. Specifies the ending index for the search. Must be a non-negative integer. Specify when specifying end, otherwise default as 0.|

The parameter can be any expression that can be parsed into an array.

#### Sample Code

Assume the collection `stats` has the following records:

```typescript
{
  "_id": 1,
  "sales": [ 1, 6, 2, 2, 5 ]
}
{
  "_id": 2,
  "sales": [ 4, 2, 1, 5, 2 ]
}
{
  "_id": 3,
  "sales": [ 2, 5, 3, 3, 1 ]
}
```

```typescript
const $ = db.command.aggregate
let res = await db.collection('stats').aggregate()
  .project({
    index: $.indexOfArray(['$sales', 2, 2])
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "index": 2 }
{ "_id": 2, "index": 4 }
{ "_id": 3, "index": -1 }
```

### isArray

Check if the given expression is an array and return a boolean value.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.isArray(<expression>)
```

The parameter can be any expression.

#### Sample Code

Assume the collection `stats` has the following records:

```typescript
{
  "_id": 1,
  "base": 10,
  "sales": [ 1, 6, 2, 2, 5 ]
}
{
  "_id": 2,
  "base": 1,
  "sales": 100
}
```

Calculate the total sales. If `sales` is a number, calculate `sales * base`. If `sales` is an array, calculate the sum of the array elements multiplied by `base`.

```typescript
const $ = db.command.aggregate
let res = await db.collection('stats').aggregate()
  .project({
    sum: $.cond({
      if: $.isArray('$sales'),
      then: $.multiply([$.sum(['$sales']), '$base']),
      else: $.multiply(['$sales', '$base']),
    })
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "sum": 160 }
{ "_id": 2, "sum": 100 }
```

### map

Similar to the `map` method on JavaScript Array, it transforms each element of the given array using the specified transformation method and returns a new array.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.map({
  input: <expression>,
  as: <string>,
  in: <expression>
})
```

|Field |Description                                                        |
|----  |----                                                               |
|input |An expression that can be parsed into an array.                     |
|as    |Optional. The variable representing each element of the array. Default is "this".|
|in    |An expression applied to each element of the given array. The name of each element is determined by the "as" parameter (parameter names should be prefixed with "$$", such as "$$this").|



#### Sample Code

Assuming the collection `stats` has the following records:

```typescript
{
  "_id": 1,
  "sales": [ 1.32, 6.93, 2.48, 2.82, 5.74 ]
}
{
  "_id": 2,
  "sales": [ 2.97, 7.13, 1.58, 6.37, 3.69 ]
}
```

Truncate each number to an integer and then calculate the sum:

```typescript
const $ = db.command.aggregate
let res = await db.collection('stats').aggregate()
  .project({
    truncated: $.map({
      input: '$sales',
      as: 'num',
      in: $.trunc('$$num'),
    })
  })
  .project({
    total: $.sum('$truncated')
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "total": 16 }
{ "_id": 2, "total": 19 }
```

### objectToArray

Converts an object to an array. This method transforms each key-value pair of the object into an element of the output array, where each element is in the form `{ k: <key>, v: <value> }`.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.objectToArray(<object>)
```

#### Sample Code

Assuming the collection `items` has the following records:

```typescript
{ "_id": 1, "attributes": { "color": "red", "price": 150 } }
{ "_id": 2, "attributes": { "color": "blue", "price": 50 } }
{ "_id": 3, "attributes": { "color": "yellow", "price": 10 } }
```

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    array: $.objectToArray('$attributes')
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "array": [{ "k": "color", "v": "red" }, { "k": "price", "v": 150 }] }
{ "_id": 2, "array": [{ "k": "color", "v": "blue" }, { "k": "price", "v": 50 }] }
{ "_id": 3, "array": [{ "k": "color", "v": "yellow" }, { "k": "price", "v": 10 }] }
```

### range

Returns a sequence of generated numbers. Given the start value, end value, and non-zero step, `range` will return a sequence starting from the start value, increasing with the given step, but excluding the end value.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.range([<start>, <end>, <non-zero step>])
```

| Field         | Description                                |
| ----          | ----                                       |
| start         | Start value, an expression that can be parsed as an integer   |
| end           | End value, an expression that can be parsed as an integer     |
| non-zero step | Optional, step value, an expression that can be parsed as a non-zero integer, default is 1 |

#### Sample Code

Assuming the collection `stats` has the following records:

```typescript
{ "_id": 1, "max": 52 }
{ "_id": 2, "max": 38 }
```

```typescript
const $ = db.command.aggregate
db.collection('stats').aggregate()
  .project({
    points: $.range([0, '$max', 10])
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "points": [0, 10, 20, 30, 40, 50] }
{ "_id": 2, "points": [0, 10, 20, 30] }
```

### reduce

Similar to the `reduce` method in JavaScript, it applies an expression to each element of the array and reduces it to a single element.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.reduce({
  input: <array>
  initialValue: <expression>,
  in: <expression>
})
```

| Field         | Description                                |
| ----          | ----                                       |
| input         | The input array, which can be any expression that evaluates to an array  |
| initialValue  | The initial value                             |
| in            | The expression applied to each element, inside the `in` expression, there are two available variables: `value`, representing the accumulated value, and `this`, representing the current array element |



#### Sample Code

**Simple String Concatenation**

Suppose the `player` collection has the following records:

```typescript
{ "_id": 1, "fullname": [ "Stephen", "Curry" ] }
{ "_id": 2, "fullname": [ "Klay", "Thompson" ] }
```

Get the full name of each player with the prefix `Player:`:

```typescript
const $ = db.command.aggregate
let res = await db.collection('player').aggregate()
  .project({
    info: $.reduce({
      input: '$fullname',
      initialValue: 'Player:',
      in: $.concat(['$$value', ' ', '$$this']),
    })
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "info": "Player: Stephen Curry" }
{ "_id": 2, "info": "Player: Klay Thompson" }
```

Get the full name of each player without any prefix:

```typescript
const $ = db.command.aggregate
let res = await db.collection('player').aggregate()
  .project({
    name: $.reduce({
      input: '$fullname',
      initialValue: '',
      in: $.concat([
        '$$value',
        $.cond({
          if: $.eq(['$$value', '']),
          then: '',
          else: ' ',
        }),
        '$$this',
      ]),
    })
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "name": "Stephen Curry" }
{ "_id": 2, "name": "Klay Thompson" }
```

### reverseArray

Returns the reversed form of a given array.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.reverseArray(<array>)
```

The parameter can be any expression that evaluates to an array.

#### Sample Code

Suppose the `stats` collection has the following record:

```typescript
{
  "_id": 1,
  "sales": [ 1, 2, 3, 4, 5 ]
}
```

Get the reversed form of the `sales` array:

```typescript
const $ = db.command.aggregate
let res = await db.collection('stats').aggregate()
  .project({
    reversed: $.reverseArray('$sales'),
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "reversed": [5, 4, 3, 2, 1] }
```

### size

Returns the length of an array.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.size(<array>)
```

The `<array>` parameter can be any expression that evaluates to an array.

#### Sample Code

Suppose the `shops` collection has the following records:

```typescript
{ "_id": 1, "staff": [ "John", "Middleton", "George" ] }
{ "_id": 2, "staff": [ "Steph", "Jack" ] }
```

Calculate the number of employees for each shop:

```typescript
const $ = db.command.aggregate
let res = await db.collection('shops').aggregate()
  .project({
    totalStaff: $.size('$staff')
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "totalStaff": 3 }
{ "_id": 2, "totalStaff": 2 }
```

### slice

Similar to the JavaScript `slice` method. Returns a specified subset of a given array.

#### API Description

There are two syntax options:

Return the first or last `n` elements starting from the beginning:

```typescript
db.command.aggregate.slice([<array>, <n>])
```

Return `n` elements starting from the specified position, counting forward or backward:

```typescript
db.command.aggregate.slice([<array>, <position>, <n>])
```

The `<array>` parameter can be any expression that evaluates to an array.

The `<position>` parameter can be any expression that evaluates to an integer. If it is a positive number, the `<position>`th element of the array is considered as the start of the slice; if `<position>` is larger than the length of the array, an empty array will be returned. If it is a negative number, the `-<position>`th element from the end of the array is considered as the start; if the absolute value of `<position>` is greater than the length of the array, the starting position will be the beginning of the array.

The `<n>` parameter can be any expression that evaluates to an integer. If `<position>` is provided, `<n>` must be a positive integer. If `<n>` is positive, the first `n` elements will be returned. If `<n>` is negative, the last `n` elements will be returned.

#### Sample Code

Assuming the collection `people` has the following records:

```typescript
{ "_id": 1, "hobbies": [ "basketball", "football", "tennis", "badminton" ] }
{ "_id": 2, "hobbies": [ "golf", "handball" ] }
{ "_id": 3, "hobbies": [ "table tennis", "swimming", "rowing" ] }
```

To return only the first two hobbies:

```typescript
const $ = db.command.aggregate;
let res = await db.collection('fruits').aggregate()
  .project({
    hobbies: $.slice(['$hobbies', 2]),
  })
  .end();
```

The result will be as follows:

```typescript
{ "_id": 1, "hobbies": [ "basketball", "football" ] }
{ "_id": 2, "hobbies": [ "golf", "handball" ] }
{ "_id": 3, "hobbies": [ "table tennis", "swimming" ] }
```

### zip

Combines the elements of the second dimension arrays in a two-dimensional array by matching the corresponding indexes. For example, `[ [ 1, 2, 3 ], [ "a", "b", "c" ] ]` can be transformed into `[ [ 1, "a" ], [ 2, "b" ], [ 3, "c" ] ]`.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.zip({
  inputs: [<array1>, <array2>, ...],
  useLongestLength: <boolean>,
  defaults: <array>
})
```

`inputs` is a two-dimensional array (field references are not allowed for `inputs`), where each element's expression (which can be a field reference) can be resolved to an array. If any of the expressions return `null`, `<inputs>` will also return `null`. If any of the expressions does not point to a valid field / resolve to an array / resolve to `null`, an error will be returned.

`useLongestLength` determines whether the length of the output array should use the length of the longest array in the input arrays. The default is `false`, which means that the length of the shortest array in the input arrays is the length of each element in the output array.

`defaults` is an array that specifies the default values for each element when the lengths of the input arrays are different. If this field is specified, `useLongestLength` must also be specified; otherwise, an error will be returned. If `useLongestLength` is `true` but `defaults` is empty or not specified, `zip` will use `null` as the default value for array elements. When specifying default values for each element, the length of the `defaults` array must be the largest length among the input arrays.

#### Sample Code

Assuming the collection `stats` has the following records:

```typescript
{ "_id": 1, "zip1": [1, 2], "zip2": [3, 4], "zip3": [5, 6] }
{ "_id": 2, "zip1": [1, 2], "zip2": [3], "zip3": [4, 5, 6] }
{ "_id": 3, "zip1": [1, 2], "zip2": [3] }
```

**With only inputs**

```typescript
const $ = db.command.aggregate;
let res = await db.collection('items').aggregate()
  .project({
    zip: $.zip({
      inputs: [
        '$zip1', // field reference
        '$zip2',
        '$zip3',
      ],
    })
  })
  .end();
```

The result will be as follows:

```typescript
{ "_id": 1, "zip": [ [1, 3, 5], [2, 4, 6] ] }
{ "_id": 2, "zip": [ [1, 3, 4] ] }
{ "_id": 3, "zip": null }
```

**With useLongestLength**

If `useLongestLength` is set to `true`:

```typescript
const $ = db.command.aggregate;
let res = await db.collection('items').aggregate()
  .project({
    zip: $.zip({
      inputs: [
        '$zip1', // field reference
        '$zip2',
        '$zip3',
      ],
      useLongestLength: true,
    })
  })
  .end();
```

The result will be as follows:

```typescript
{ "_id": 1, "zip": [ [1, 3, 5], [2, 4, 6] ] }
{ "_id": 2, "zip": [ [1, 3, 4], [2, null, 5], [null, null, 6] ] }
{ "_id": 3, "zip": null }
```

**With defaults**

```typescript
const $ = db.command.aggregate;
let res = await db.collection('items').aggregate()
  .project({
    zip: $.zip({
      inputs: [
        '$zip1', // field reference
        '$zip2',
        '$zip3',
      ],
      useLongestLength: true,
      defaults: [-300, -200, -100],
    })
  })
  .end();
```

The result will be as follows:

```typescript
{ "_id": 1, "zip": [ [1, 3, 5], [2, 4, 6] ] }
{ "_id": 2, "zip": [ [1, 3, 4], [2, -200, 5], [-300, -200, 6] ] }
{ "_id": 3, "zip": null }
```

## Boolean Operators

### and

Given multiple expressions, `and` returns `true` only if all expressions return `true`, otherwise it returns `false`.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.and([<expression1>, <expression2>, ...])
```

If the expression returns `false`, `null`, `0`, or `undefined`, the expression is evaluated as `false`. Otherwise, any other return value is considered as `true`.

#### Example Code

Assume that the `price` collection has the following records:

```typescript
{ "_id": 1, "min": 10, "max": 100 }
{ "_id": 2, "min": 60, "max": 80 }
{ "_id": 3, "min": 30, "max": 50 }
```

Find the records where `min` is greater than or equal to 30 and `max` is less than or equal to 80.

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    fullfilled: $.and([$.gte(['$min', 30]), $.lte(['$max', 80])])
  })
  .end()
```

The resulting output is as follows:

```typescript
{ "_id": 1, "fullfilled": false }
{ "_id": 2, "fullfilled": true }
{ "_id": 3, "fullfilled": true }
```

### not

Given an expression, `not` returns `false` if the expression evaluates to `true`, otherwise it returns `true`. Note that the expression cannot be a logical expression (`and`, `or`, `nor`, `not`).

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.not(<expression>)
```

If the expression returns `false`, `null`, `0`, or `undefined`, the expression is evaluated as `false`. Otherwise, any other return value is considered as `true`.

#### Example Code

Assume that the `price` collection has the following records:

```typescript
{ "_id": 1, "min": 10, "max": 100 }
{ "_id": 2, "min": 60, "max": 80 }
{ "_id": 3, "min": 30, "max": 50 }
```

Find the records where `min` is not greater than 40.

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    fullfilled: $.not($.gt(['$min', 40]))
  })
  .end()
```

The resulting output is as follows:

```typescript
{ "_id": 1, "fullfilled": true }
{ "_id": 2, "fullfilled": false }
{ "_id": 3, "fullfilled": true }
```

### or

Given multiple expressions, `or` returns `true` if any of the expressions return `true`, otherwise it returns `false`.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.or([<expression1>, <expression2>, ...])
```

If the expression returns `false`, `null`, `0`, or `undefined`, the expression is evaluated as `false`. Otherwise, any other return value is considered as `true`.

#### Example Code

Assume that the `price` collection has the following records:

```typescript
{ "_id": 1, "min": 10, "max": 100 }
{ "_id": 2, "min": 50, "max": 60 }
{ "_id": 3, "min": 30, "max": 50 }
```

Find the records where `min` is less than 40 or `max` is greater than 60.

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    fullfilled: $.or([$.lt(['$min', 40]), $.gt(['$max', 60])])
  })
  .end()
```

The resulting output is as follows:

```typescript
{ "_id": 1, "fullfilled": true }
{ "_id": 2, "fullfilled": false }
{ "_id": 3, "fullfilled": true }
```

## Comparison Operators

### cmp

Given two values, `cmp` returns their comparison value:

#### API Description

If the first value is less than the second value, it returns -1. 
If the first value is greater than the second value, it returns 1. 
If the two values are equal, it returns 0.

The syntax is as follows:

```typescript
db.command.aggregate.cmp([<expression1>, <expression2>])
```

#### Example Code

Assume that the `price` collection has the following records:

```typescript
{ "_id": 1, "shop1": 10, "shop2": 100 }
{ "_id": 2, "shop1": 80, "shop2": 20 }
{ "_id": 3, "shop1": 50, "shop2": 50 }
```

Compare the prices of various items between `shop1` and `shop2`.

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    compare: $.cmp(['$shop1', '$shop2']))
  })
  .end()
```

The resulting output is as follows:

```typescript
{ "_id": 1, "compare": -1 }
{ "_id": 2, "compare": 1 }
{ "_id": 3, "compare": 0 }
```

### eq

Matches two values and returns `true` if they are equal, otherwise returns `false`.

#### API Description

Syntax:

```typescript
db.command.aggregate.eq([<value1>, <value2>])
```

#### Example Code

Assume the `price` collection has the following records:

```typescript
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

Find the record where `value` is equal to 50.

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    matched: $.eq(['$value', 50])
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "matched": false }
{ "_id": 2, "matched": false }
{ "_id": 3, "matched": true }
```

### gt

Matches two values and returns `true` if the first value is greater than the second value, otherwise returns `false`.

#### API Description

Syntax:

```typescript
db.command.aggregate.gt([<value1>, <value2>])
```

#### Example Code

Assume the `price` collection has the following records:

```typescript
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

Check if `value` is greater than 50.

```typescript
const $ = db.command.aggregate
db.collection('price').aggregate()
  .project({
    matched: $.gt(['$value', 50])
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "matched": false }
{ "_id": 2, "matched": true }
{ "_id": 3, "matched": false }
```

### gte

Matches two values and returns `true` if the first value is greater than or equal to the second value, otherwise returns `false`.

#### API Description

Syntax:

```typescript
db.command.aggregate.gte([<value1>, <value2>])
```

#### Example Code

Assume the `price` collection has the following records:

```typescript
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

Check if `value` is greater than or equal to 50.

```typescript
const $ = db.command.aggregate
let res = await b.collection('price').aggregate()
  .project({
    matched: $.gte(['$value', 50])
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "matched": false }
{ "_id": 2, "matched": true }
{ "_id": 3, "matched": true }
```

### lt

Matches two values and returns `true` if the first value is less than the second value, otherwise returns `false`.

#### API Description

Syntax:

```typescript
db.command.aggregate.lt([<value1>, <value2>])
```

#### Example Code

Assume the `price` collection has the following records:

```typescript
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

Check if `value` is less than 50.

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    matched: $.lt(['$value', 50])
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "matched": true }
{ "_id": 2, "matched": false }
{ "_id": 3, "matched": false }
```

### lte

Matches two values and returns `true` if the first value is less than or equal to the second value, otherwise returns `false`.

#### API Description

Syntax:

```typescript
db.command.aggregate.lte([<value1>, <value2>])
```

#### Example Code

Assume the `price` collection has the following records:

```typescript
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

Check if `value` is less than or equal to 50.

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    matched: $.lte(['$value', 50])
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "matched": true }
{ "_id": 2, "matched": false }
{ "_id": 3, "matched": true }
```

### neq

Matches two values and returns `true` if they are not equal, otherwise returns `false`.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.neq([<value1>, <value2>])
```

#### Sample Code

Assuming the `price` collection has the following records:

```typescript
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

To find records where `value` is not equal to 50:

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    matched: $.neq(['$value', 50])
  })
  .end()
```

The result will be:

```typescript
{ "_id": 1, "matched": true }
{ "_id": 2, "matched": true }
{ "_id": 3, "matched": false }
```

## Conditional Operators

### cond

Evaluates a boolean expression and returns one of two specified values.

#### API Description

The usage of `cond` is as follows:

```typescript
cond({ if: <boolean expression>, then: <true value>, else: <false value> })
```

Alternatively:

```typescript
cond([ <boolean expression>, <true value>, <false value> ])
```

In both forms, all three parameters (`if`, `then`, `else`) are required.

If the boolean expression is true, `$cond` will return the `<true value>`, otherwise it will return the `<false value>`.

#### Sample Code

Assuming the `items` collection has the following records:

```typescript
{ "_id": "0", "name": "item-a", "amount": 100 }
{ "_id": "1", "name": "item-b", "amount": 200 }
{ "_id": "2", "name": "item-c", "amount": 300 }
```

We can use `cond` to generate a new field `discount` based on the `amount` field:

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    name: 1,
    discount: $.cond({
        if: $.gte(['$amount', 200]),
        then: 0.7,
        else: 0.9
    })
  })
  .end()
```

The output will be:

```typescript
{ "_id": "0", "name": "item-a", "discount": 0.9 }
{ "_id": "1", "name": "item-b", "discount": 0.7 }
{ "_id": "2", "name": "item-c", "discount": 0.7 }
```

### ifNull

Calculates the given expression and returns an alternative value if the expression result is null, undefined, or does not exist.

#### API Description

The usage of `ifNull` is as follows:

```typescript
ifNull([ <expression>, <alternative value> ])
```

#### Sample Code

Assuming the `items` collection has the following records:

```typescript
{ "_id": "0", "name": "A", "description": "This is item A" }
{ "_id": "1", "name": "B", "description": null }
{ "_id": "2", "name": "C" }
```

We can use `ifNull` to add a replacement value for documents where the `description` field does not exist or is null.

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    _id: 0,
    name: 1,
    description: $.ifNull(['$description', 'Description not available'])
  })
  .end()
```

The output will be:

```typescript
{ "name": "A", "description": "This is item A" }
{ "name": "B", "description": "Description not available" }
{ "name": "C", "description": "Description not available" }
```

### switch

Calculates and returns a value based on the given `switch-case-default` conditions.

#### API Description

The usage of `switch` is as follows:

```typescript
switch({
    branches: [
        case: <expression>, then: <expression>,
        case: <expression>, then: <expression>,
        ...
    ],
    default: <expression>
})
```

#### Sample Code

Assuming the records in the `items` collection are as follows:

```typescript
{ "_id": "0", "name": "item-a", "amount": 100 }
{ "_id": "1", "name": "item-b", "amount": 200 }
{ "_id": "2", "name": "item-c", "amount": 300 }
```

We can use the `switch` operator to generate a new field `discount` based on the `amount` field:

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    name: 1,
    discount: $.switch({
        branches: [
            { case: $.gt(['$amount', 250]), then: 0.8 },
            { case: $.gt(['$amount', 150]), then: 0.9 }
        ],
        default: 1
    })
  })
  .end()
```

The output is as follows:

```typescript
{ "_id": "0", "name": "item-a", "discount": 1 }
{ "_id": "1", "name": "item-b", "discount": 0.9 }
{ "_id": "2", "name": "item-c", "discount": 0.8 }
```

## Date Operators

**Note**

- The `timezone` in the following date operators supports the following formats:

```typescript
timezone: "Asia/Shanghai" // Asia/Shanghai timezone
timezone: "+08" // utc+8 timezone
timezone: "+08:30" // timezone offset of 8 hours and 30 minutes
timezone: "+0830" // timezone offset of 8 hours and 30 minutes, same as above
```

### dateFromParts

Constructs and returns a date object based on the provided date information.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.dateFromParts({
    year: <year>,
    month: <month>,
    day: <day>,
    hour: <hour>,
    minute: <minute>,
    second: <second>,
    millisecond: <ms>,
    timezone: <tzExpression>
})
```

You can also use the ISO 8601 standard:

```typescript
db.command.aggregate.dateFromParts({
    isoWeekYear: <year>,
    isoWeek: <week>,
    isoDayOfWeek: <day>,
    hour: <hour>,
    minute: <minute>,
    second: <second>,
    millisecond: <ms>,
    timezone: <tzExpression>
})
```

#### Sample Code

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    date: $.dateFromParts({
        year: 2017,
        month: 2,
        day: 8,
        hour: 12,
        timezone: 'America/New_York'
    }),
  })
  .end()
```

The output is as follows:

```typescript
{
    "date": ISODate("2017-02-08T17:00:00.000Z")
}
```

### dateFromString

Converts a date/time string to a date object.

#### API Description

The syntax is as follows:

```typescript
db.command.aggregate.dateFromString({
    dateString: <dateStringExpression>,
    timezone: <tzExpression>
})
```

#### Sample Code

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    date: $.dateFromString({
        dateString: "2019-05-14T09:38:51.686Z"
    })
  })
  .end()
```

The output is as follows:

```typescript
{
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

### dateToString

Formats a date object into a string according to the specified expression.

#### API Description

The calling format for `dateToString` is as follows:

```typescript
db.command.aggregate.dateToString({
  date: <date expression>,
  format: <format expression>,
  timezone: <timezone expression>,
  onNull: <null value expression>
})
```

Here are the detailed explanations of the four expressions:

| Name            | Description                                                                                                            |
| ----            | ----                                                                                                                   |
| date expression | Required. Specifies the field value that should be a date that can be converted to a string.                          |
| format expression | Optional. It can be any valid string containing "format specifiers".                                                   |
| timezone expression | Optional. Specifies the timezone of the operation result. It can be a string in the format of [UTC Offset](https://en.wikipedia.org/wiki/List_of_UTC_time_offsets) or [Olson Timezone Identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). |
| null value expression | Optional. Returns the value specified by this expression when the <date expression> returns empty or does not exist. |

Here are the detailed explanations of the format specifiers:

| Specifier | Description               | Valid Values |
| ----      | ----                      | ----         |
| %d        | Day of the month (2 digits, zero-padded)           | 01 - 31     |
| %G        | ISO 8601 year              | 0000 - 9999 |
| %H        | Hour (2 digits, zero-padded, 24-hour clock)       | 00 - 23     |
| %j        | Day of the year (3 digits, zero-padded)            | 001 - 366   |
| %L        | Milliseconds (3 digits, zero-padded)               | 000 - 999   |
| %m        | Month (2 digits, zero-padded)                      | 01 - 12     |
| %M        | Minute (2 digits, zero-padded)                     | 00 - 59     |
| %S        | Second (2 digits, zero-padded)                     | 00 - 60     |
| %w        | Weekday                    | 1 - 7        |
| %u        | ISO 8601 weekday           | 1 - 7        |
| %U        | Week of the year (2 digits, zero-padded)           | 00 - 53     |
| %V        | ISO 8601 week of the year  | 1 - 53       |
| %Y        | Year (4 digits, zero-padded)                       | 0000 - 9999 |
| %z        | Timezone offset from UTC   | +/-[hh][mm]  |
| %Z        | Timezone offset from UTC in minutes | +/-mmm      |
| %%        | Percentage sign as a character                   | %            |

#### Sample Code

Assume the collection `students` has the following records:

```typescript
{ "date": "1999-12-11T16:00:00.000Z", "firstName": "Yuanxin", "lastName": "Dong" }
{ "date": "1998-11-10T16:00:00.000Z", "firstName": "Weijia", "lastName": "Wang" }
{ "date": "1997-10-09T16:00:00.000Z", "firstName": "Chengxi", "lastName": "Li" }
```

**Format Date**

The following code formats the value of the `date` field into a string in the format of `yyyy-MM-dd`:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    formatDate: $.dateToString({
      date: '$date',
      format: '%Y-%m-%d'
    })
  })
  .end()
```

The returned results are as follows:

```typescript
{ "formatDate": "1999-12-11" }
{ "formatDate": "1998-11-10" }
{ "formatDate": "1997-10-09" }
```

**Timezone**

The following code formats the value of the `date` field into Shanghai timezone:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    formatDate: $.dateToString({
      date: '$date',
      format: '%H:%M:%S',
      timezone: 'Asia/Shanghai'
    })
  })
  .end()
```

The returned results are as follows:

```typescript
{ "formatDate": "00:00:00" }
{ "formatDate": "00:00:00" }
{ "formatDate": "00:00:00" }
```

**Default Value for Missing Fields**

When the specified `<date expression>` is empty or does not exist, you can set a default value for the missing fields:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    formatDate: $.dateToString({
      date: '$empty',
      onNull: 'null'
    })
  })
  .end()
```

The returned results are as follows:

```typescript
{ "formatDate": "null" }
{ "formatDate": "null" }
{ "formatDate": "null" }
```

### dayOfMonth

Returns the day of the month for the date field, which is a number between 1 and 31.

#### API Description

There are two usage methods for this interface, the syntax is as follows:

```typescript
db.command.aggregate.dayOfMonth(<date field>)

db.command.aggregate.dayOfMonth({date:<date field>,timezone:<timezone>})
```

#### Sample Code

Assume the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We use `dayOfMonth()` to project the `date` field and get the corresponding day:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    dayOfMonth: $.dayOfMonth('$date')
  })
  .end()
```

The output is as follows:

```typescript
{
    "dayOfMonth": 14
}
```

### dayOfWeek

Returns the day of the week for the date field, which is a number between 1 (Sunday) and 7 (Saturday).

#### API Description

**Note: Sunday is the first day of the week**

There are two usage methods for this interface, the syntax is as follows:

```typescript
db.command.aggregate.dayOfWeek(<date field>)

db.command.aggregate.dayOfWeek({date:<date field>,timezone:<timezone>})
```

#### Sample Code

Assume the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We use `dayOfWeek()` to project the `date` field and get the corresponding day of the week:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    dayOfWeek: $.dayOfWeek('$date')
  })
  .end()
```

The output is as follows:

```typescript
{
    "dayOfWeek": 3
}
```

### dayOfYear

Returns the day of the year for the date field, which is a number between 1 and 366.

#### API Description

This interface has the following two usages, with the syntax as follows:

```typescript
db.command.aggregate.dayOfYear(<date field>)

db.command.aggregate.dayOfYear({date:<date field>,timezone:<time zone>})
```

#### Example Code

Assuming the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We use `dayOfYear()` to project the `date` field and get the corresponding day of the year:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    dayOfYear: $.dayOfYear('$date')
  })
  .end()
```

The output is as follows:

```typescript
{
    "dayOfYear": 134
}
```

### hour

Returns the hour value of the date field, which is an integer between 0 and 23.

#### API Description

This interface has the following two usages, with the syntax as follows:

```typescript
db.command.aggregate.hour(<date field>)

db.command.aggregate.hour({date:<date field>,timezone:<time zone>})
```

#### Example Code

Assuming the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We use `hour()` to project the `date` field and get the corresponding hour value:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    hour: $.hour('$date')
  })
  .end()
```

The output is as follows:

```typescript
{
    "hour": 9
}
```

### isoDayOfWeek

Returns the ISO 8601 standard day of the week (from 1 to 7) corresponding to the date field.

#### API Description

This interface has the following two usages, with the syntax as follows:

```typescript
db.command.aggregate.isoDayOfWeek(<date field>)

db.command.aggregate.isoDayOfWeek({date:<date field>,timezone:<time zone>})
```

#### Example Code

Assuming the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We use `isoDayOfWeek()` to project the `date` field and get the ISO 8601 standard day of the week:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    isoDayOfWeek: $.isoDayOfWeek('$date')
  })
  .end()
```

The output is as follows:

```typescript
{
    "isoDayOfWeek": 2
}
```

### isoWeek

Returns the ISO 8601 standard week number (from 1 to 53) corresponding to the date field.

#### API Description

According to the ISO 8601 standard, Monday to Sunday is considered a week, and the week in which the first Thursday of the year falls is considered the first week of the year.

For example: January 7, 2016 is the first Thursday of that year, so January 4th (Monday) to January 10th (Sunday) is the first week. Similarly, the week number for January 1st, 2016 is 53.

This interface has the following two usages, with the syntax as follows:

```typescript
db.command.aggregate.isoWeek(<date field>)

db.command.aggregate.isoWeek({date:<date field>,timezone:<time zone>})
```

#### Example Code

Assuming the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We use `isoWeek()` to project the `date` field and get the ISO 8601 standard week number:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    isoWeek: $.isoWeek('$date')
  })
  .end()
```

The output is as follows:

```typescript
{
    "isoWeek": 20
}
```

### isoWeekYear

Returns the ISO 8601 standard year corresponding to the date field.

#### API Description

The "year" here starts with the first Monday of the first week and ends with the last Sunday of the last week.

This interface has the following two usages, with the syntax as follows:

```typescript
db.command.aggregate.isoWeekYear(<date field>)

db.command.aggregate.isoWeekYear({date:<date field>,timezone:<time zone>})
```

#### Sample Code

Assuming the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We use the `isoWeekYear()` to project the `date` field and get the corresponding ISO 8601 week year:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    isoWeekYear: $.isoWeekYear('$date')
  })
  .end();
```

The output is as follows:

```typescript
{
    "isoWeekYear": 2019
}
```

### millisecond

Returns the milliseconds of the date field, which is an integer between 0 and 999.

#### API Description

There are two ways to use this interface, as shown below:

```typescript
db.command.aggregate.millisecond(<date field>)

db.command.aggregate.millisecond({date: <date field>, timezone: <timezone>})
```

#### Sample Code

Assuming the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We use the `millisecond()` function to project the `date` field and get the corresponding milliseconds:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    millisecond: $.millisecond('$date'),
  })
  .end();
```

The output is as follows:

```typescript
{
    "millisecond": 686
}
```

### minute

Returns the minutes of the date field, which is an integer between 0 and 59.

#### API Description

There are two ways to use this interface, as shown below:

```typescript
db.command.aggregate.minute(<date field>)

db.command.aggregate.minute({date: <date field>, timezone: <timezone>})
```

#### Sample Code

Assuming the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We use the `minute()` function to project the `date` field and get the corresponding minutes:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    minute: $.minute('$date')
  })
  .end();
```

The output is as follows:

```typescript
{
    "minute": 38
}
```

### month

Returns the month of the date field, which is an integer between 1 and 12.

#### API Description

There are two ways to use this interface, as shown below:

```typescript
db.command.aggregate.month(<date field>)

db.command.aggregate.month({date: <date field>, timezone: <timezone>})
```

#### Sample Code

Assuming the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We use the `month()` function to project the `date` field and get the corresponding month:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    month: $.month('$date')
  })
  .end();
```

The output is as follows:

```typescript
{
    "month": 5
}
```

### second

Returns the seconds of the date field, which is an integer between 0 and 59, and can be 60 in special cases like leap seconds.

#### API Description

There are two ways to use this interface, as shown below:

```typescript
db.command.aggregate.second(<date field>)

db.command.aggregate.second({date: <date field>, timezone: <timezone>})
```

#### Sample Code

Assuming the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We use the `second()` function to project the `date` field and get the corresponding seconds:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    second: $.second('$date')
  })
  .end();
```

The output is as follows:

```typescript
{
    "second": 51
}
```

### week

Returns the week of the date field (the week number within the year), which is an integer between 0 and 53.

#### API Description

Each week starts on Sunday, and the first Sunday of the year is considered as the start of Week 1. The days before that are considered as Week 0.

There are two ways to use this API, as shown below:

```typescript
db.command.aggregate.week(<date field>)

db.command.aggregate.week({date:<date field>,timezone:<time zone>})
```

#### Sample Code

Assuming the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We can use `week()` to project the `date` field and retrieve the corresponding week number (the week number within a year):

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    week: $.week('$date')
  })
  .end()
```

The output is as follows:

```typescript
{
    "week": 19
}
```

### year

Returns the year corresponding to the date field.

#### API Description

There are two ways to use this API, as shown below:

```typescript
db.command.aggregate.year(<date field>)

db.command.aggregate.year({date:<date field>,timezone:<time zone>})
```

#### Sample Code

Assuming the collection `dates` has the following document:

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

We can use `year()` to project the `date` field and retrieve the corresponding year:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    year: $.year('$date')
  })
  .end()
```

The output is as follows:

```typescript
{
    "year": 2019
}
```

## Constant Operators

### literal

Returns a literal value without any parsing or processing.

#### API Description

`literal` is used in the following form:

```typescript
literal(<value>)
```

If `<value>` is an expression, `literal` will **not** parse or evaluate the expression, but will directly return the expression itself.

#### Sample Code

For example, we have a collection `items` with the following data:

```typescript
{ "_id": "0", "price": "$1" }
{ "_id": "1", "price": "$5.60" }
{ "_id": "2", "price": "$8.90" }
```

**Using $ as a literal**

The following code uses `literal` to generate a new field `isOneDollar`, which indicates whether the `price` field is strictly equal to `"$1"`.

Note: We cannot use `eq(['$price', '$1'])` here because `"$1"` is an expression representing the value of the `"1"` field, not a string literal `"$1"`.

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    isOneDollar: $.eq(['$price', $.literal('$1')])
  })
  .end()
```

The output is as follows:

```typescript
{ "_id": "0", "isOneDollar": true }
{ "_id": "1", "isOneDollar": false }
{ "_id": "2", "isOneDollar": false }
```

**Projecting a field with the value 1**

The following code uses `literal` to project a new field `amount` with a value of `1`.

```typescript
const $ = db.command.aggregate
db.collection('items').aggregate()
  .project({
    price: 1,
    amount: $.literal(1)
  })
  .end()
```

The output is as follows:

```typescript
{ "_id": "0", "price": "$1", "amount": 1 }
{ "_id": "1", "price": "$5.60", "amount": 1 }
{ "_id": "2", "price": "$8.90", "amount": 1 }
```

## Object Operators

### mergeObjects

Merges multiple documents into a single document.

#### API Description

The usage is as follows:
When used in `group()`:

```typescript
mergeObjects(<document>)
```

When used in other expressions:

```typescript
mergeObjects([<document1>, <document2>, ...])
```

#### Sample Code

**Using with `group()`**

Assuming the collection `sales` has the following documents:  

```typescript
{ "_id": 1, "year": 2018, "name": "A", "volume": { "2018Q1": 500, "2018Q2": 500 } }
{ "_id": 2, "year": 2017, "name": "A", "volume": { "2017Q1": 400, "2017Q2": 300, "2017Q3": 0, "2017Q4": 0 } }
{ "_id": 3, "year": 2018, "name": "B", "volume": { "2018Q1": 100 } }
{ "_id": 4, "year": 2017, "name": "B", "volume": { "2017Q3": 100, "2017Q4": 250 } }
```

The following code uses `mergeObjects()` to merge documents with the same `name`:  

```typescript
const $ = db.command.aggregate
let res = await db.collection('sales').aggregate()
  .group({
    _id: '$name',
    mergedVolume: $.mergeObjects('$volume')
  })
  .end()
```

The output is as follows:  

```typescript
{ "_id": "A", "mergedVolume": { "2017Q1": 400, "2017Q2": 300, "2017Q3": 0, "2017Q4": 0, "2018Q1": 500, "2018Q2": 500 } }
{ "_id": "B", "mergedVolume": { "2017Q3": 100, "2017Q4": 250, "2018Q1": 100 } }
```

**General Usage**

Assuming the collection `test` has the following documents:  

```typescript
{ "_id": 1, "foo": { "a": 1 }, "bar": { "b": 2 } }
{ "_id": 2, "foo": { "c": 1 }, "bar": { "d": 2 } }
{ "_id": 3, "foo": { "e": 1 }, "bar": { "f": 2 } }
```

The following code uses `mergeObjects()` to merge the `foo` and `bar` fields into `foobar`:  

```typescript
const $ = db.command.aggregate
let res = await db.collection('sales').aggregate()
  .project({
    foobar: $.mergeObjects(['$foo', '$bar'])
  })
  .end()
```

The output is as follows:  

```typescript
{ "_id": 1, "foobar": { "a": 1, "b": 2 } }
{ "_id": 2, "foobar": { "c": 1, "d": 2 } }
{ "_id": 3, "foobar": { "e": 1, "f": 2 } }
```

## Collection Operators

### allElementsTrue

Takes an array or an expression that resolves to an array. Returns true if all elements in the array are true, otherwise returns false. An empty array always returns true.  

#### API Description

The syntax is as follows:

```typescript
allElementsTrue([<expression>])
```

#### Sample Code

Assuming the collection `test` has the following documents:  

```typescript
{ "_id": 1, "array": [ true ] }
{ "_id": 2, "array": [ ] }
{ "_id": 3, "array": [ false ] }
{ "_id": 4, "array": [ true, false ] }
{ "_id": 5, "array": [ 0 ] }
{ "_id": 6, "array": [ "stark" ] }
```

The following code uses `allElementsTrue()` to check if all elements in the `array` field are true:  

```typescript
const $ = db.command.aggregate
let res = await db.collection('price')
  .aggregate()
  .project({
    isAllTrue: $.allElementsTrue(['$array'])
  })
  .end()
```

The result is as follows:  

```typescript
{ "_id": 1, "isAllTrue": true }
{ "_id": 2, "isAllTrue": true }
{ "_id": 3, "isAllTrue": false }
{ "_id": 4, "isAllTrue": false }
{ "_id": 5, "isAllTrue": false }
{ "_id": 6, "isAllTrue": true }
```

### anyElementTrue

Takes an array or an expression that resolves to an array. Returns true if any element in the array is true, otherwise returns false. An empty array always returns false.  

#### API Description

The syntax is as follows:

```typescript
anyElementTrue([<expression>])
```



#### Sample Code

Assuming the `test` collection has the following records:

```typescript
{ "_id": 1, "array": [ true ] }
{ "_id": 2, "array": [ ] }
{ "_id": 3, "array": [ false ] }
{ "_id": 4, "array": [ true, false ] }
{ "_id": 5, "array": [ 0 ] }
{ "_id": 6, "array": [ "stark" ] }
```

The following code uses `anyElementTrue()` to determine if the `array` field contains any truth values:

```typescript
const $ = db.command.aggregate
let res = await db.collection('price')
  .aggregate()
  .project({
    isAnyTrue: $.anyElementTrue(['$array'])
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "isAnyTrue": true }
{ "_id": 2, "isAnyTrue": false }
{ "_id": 3, "isAnyTrue": false }
{ "_id": 4, "isAnyTrue": true }
{ "_id": 5, "isAnyTrue": false }
{ "_id": 6, "isAnyTrue": true }
```

### setDifference

Input two sets and output the elements that exist only in the first set.

#### API Description

It is used in the following format:

```typescript
setDifference([<expression1>, <expression2>])
```

#### Sample Code

Assuming the `test` collection has the following data:

```typescript
{ "_id": 1, "A": [ 1, 2 ], "B": [ 1, 2 ] }
{ "_id": 2, "A": [ 1, 2 ], "B": [ 2, 1, 2 ] }
{ "_id": 3, "A": [ 1, 2 ], "B": [ 1, 2, 3 ] }
{ "_id": 4, "A": [ 1, 2 ], "B": [ 3, 1 ] }
{ "_id": 5, "A": [ 1, 2 ], "B": [ ] }
{ "_id": 6, "A": [ 1, 2 ], "B": [ {}, [] ] }
{ "_id": 7, "A": [ ], "B": [ ] }
{ "_id": 8, "A": [ ], "B": [ 1 ] }
```

The following code uses `setDifference` to find the numbers that exist only in `B`:

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    isBOnly: $.setDifference(['$B', '$A'])
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "isBOnly": [] }
{ "_id": 2, "isBOnly": [] }
{ "_id": 3, "isBOnly": [3] }
{ "_id": 4, "isBOnly": [3] }
{ "_id": 5, "isBOnly": [] }
{ "_id": 6, "isBOnly": [{}, []] }
{ "_id": 7, "isBOnly": [] }
{ "_id": 8, "isBOnly": [1] }
```

### setEquals

Input two sets and determine if they contain the same elements (ignoring order and duplicates).

#### API Description

It is used in the following format:

```typescript
setEquals([<expression1>, <expression2>])
```

#### Sample Code

Assuming the `test` collection has the following data:

```typescript
{ "_id": 1, "A": [ 1, 2 ], "B": [ 1, 2 ] }
{ "_id": 2, "A": [ 1, 2 ], "B": [ 2, 1, 2 ] }
{ "_id": 3, "A": [ 1, 2 ], "B": [ 1, 2, 3 ] }
{ "_id": 4, "A": [ 1, 2 ], "B": [ 3, 1 ] }
{ "_id": 5, "A": [ 1, 2 ], "B": [ ] }
{ "_id": 6, "A": [ 1, 2 ], "B": [ {}, [] ] }
{ "_id": 7, "A": [ ], "B": [ ] }
{ "_id": 8, "A": [ ], "B": [ 1 ] }
```

The following code uses `setEquals` to determine if the two sets contain the same elements:

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    sameElements: $.setEquals(['$A', '$B'])
  })
  .end()
```

The result is as follows:

```typescript
{ "_id": 1, "sameElements": true }
{ "_id": 2, "sameElements": true }
{ "_id": 3, "sameElements": false }
{ "_id": 4, "sameElements": false }
{ "_id": 5, "sameElements": false }
{ "_id": 6, "sameElements": false }
{ "_id": 7, "sameElements": true }
{ "_id": 8, "sameElements": false }
```

### setIntersection

Input two sets and output the intersection of the two sets.

#### API Description

It is used in the following format:

```typescript
setIntersection([<expression1>, <expression2>])
```

#### Sample Code

Assuming the collection `test` contains the following data:

```typescript
{ "_id": 1, "str1": "Hello", "str2": "World" }
{ "_id": 2, "str1": "This", "str2": "is" }
{ "_id": 3, "str1": "Concatenating", "str2": "strings" }
```

The following code uses `concat` to concatenate two strings:

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    concatenated: $.concat(['$str1', ' ', '$str2'])
  })
  .end()
```

The output is as follows:

```typescript
{ "_id": 1, "concatenated": "Hello World" }
{ "_id": 2, "concatenated": "This is" }
{ "_id": 3, "concatenated": "Concatenating strings" }
```

### substr

截取字符串的子串，并返回子串。  

#### API说明

使用方式如下：

```typescript
substr(<expression>, <startIndex>, <length>)
```

- `<expression>`：要截取的字符串表达式。
- `<startIndex>`：截取开始位置的索引，从0开始计算。
- `<length>`：可选参数，截取的长度。

#### 示例代码

假设集合`test`包含以下数据：

```typescript
{ "_id": 1, "str": "Hello World" }
{ "_id": 2, "str": "This is a test" }
{ "_id": 3, "str": "Welcome" }
```

下面的代码使用 `substr`，截取字符串的子串：

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    subStr: $.substr('$str', 6, 5)
  })
  .end()
```

输出如下：

```typescript
{ "_id": 1, "subStr": "World" }
{ "_id": 2, "subStr": "is a " }
{ "_id": 3, "subStr": "" }
```

### toLower

将字符串转换为小写。  

#### API说明

使用方式如下：

```typescript
toLower(<expression>)
```

- `<expression>`：要转换为小写的字符串表达式。

#### 示例代码

假设集合`test`包含以下数据：

```typescript
{ "_id": 1, "str": "Hello World" }
{ "_id": 2, "str": "This is a test" }
{ "_id": 3, "str": "Welcome" }
```

下面的代码使用 `toLower`，将字符串转换为小写：

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    lowerCase: $.toLower('$str')
  })
  .end()
```

输出如下：

```typescript
{ "_id": 1, "lowerCase": "hello world" }
{ "_id": 2, "lowerCase": "this is a test" }
{ "_id": 3, "lowerCase": "welcome" }
```

### toUpper

将字符串转换为大写。  

#### API说明

使用方式如下：

```typescript
toUpper(<expression>)
```

- `<expression>`：要转换为大写的字符串表达式。

#### 示例代码

假设集合`test`包含以下数据：

```typescript
{ "_id": 1, "str": "Hello World" }
{ "_id": 2, "str": "This is a test" }
{ "_id": 3, "str": "Welcome" }
```

下面的代码使用 `toUpper`，将字符串转换为大写：

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    upperCase: $.toUpper('$str')
  })
  .end()
```

输出如下：

```typescript
{ "_id": 1, "upperCase": "HELLO WORLD" }
{ "_id": 2, "upperCase": "THIS IS A TEST" }
{ "_id": 3, "upperCase": "WELCOME" }
```

### split

将字符串按指定分隔符拆分为数组。  

#### API说明

使用方式如下：

```typescript
split(<expression>, <separator>)
```

- `<expression>`：要拆分的字符串表达式。
- `<separator>`：分隔字符串的字符或正则表达式。

#### 示例代码

假设集合`test`包含以下数据：

```typescript
{ "_id": 1, "str": "Hello,World" }
{ "_id": 2, "str": "This is a test" }
{ "_id": 3, "str": "Welcome" }
```

下面的代码使用 `split`，将字符串按逗号拆分为数组：

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    splitStr: $.split('$str', ',')
  })
  .end()
```

输出如下：

```typescript
{ "_id": 1, "splitStr": [ "Hello", "World" ] }
{ "_id": 2, "splitStr": [ "This is a test" ] }
{ "_id": 3, "splitStr": [ "Welcome" ] }
```

### trim

去除字符串两侧的空格。  

#### API说明

使用方式如下：

```typescript
trim(<expression>)
```

- `<expression>`：要去除空格的字符串表达式。

#### 示例代码

假设集合`test`包含以下数据：

```typescript
{ "_id": 1, "str": "  Hello World  " }
{ "_id": 2, "str": "   This is a test   " }
{ "_id": 3, "str": "   Welcome   " }
```

下面的代码使用 `trim`，去除字符串两侧的空格：

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    trimmed: $.trim('$str')
  })
  .end()
```

输出如下：

```typescript
{ "_id": 1, "trimmed": "Hello World" }
{ "_id": 2, "trimmed": "This is a test" }
{ "_id": 3, "trimmed": "Welcome" }
```

### ltrim

去除字符串左侧的空格。  

#### API说明

使用方式如下：

```typescript
ltrim(<expression>)
```

- `<expression>`：要去除空格的字符串表达式。

#### 示例代码

假设集合`test`包含以下数据：

```typescript
{ "_id": 1, "str": "  Hello World  " }
{ "_id": 2, "str": "   This is a test   " }
{ "_id": 3, "str": "   Welcome   " }
```

下面的代码使用 `ltrim`，去除字符串左侧的空格：

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    trimmed: $.ltrim('$str')
  })
  .end()
```

输出如下：

```typescript
{ "_id": 1, "trimmed": "Hello World  " }
{ "_id": 2, "trimmed": "This is a test   " }
{ "_id": 3, "trimmed": "Welcome   " }
```

### rtrim

去除字符串右侧的空格。  

#### API说明

使用方式如下：

```typescript
rtrim(<expression>)
```

- `<expression>`：要去除空格的字符串表达式。

#### 示例代码

假设集合`test`包含以下数据：

```typescript
{ "_id": 1, "str": "  Hello World  " }
{ "_id": 2, "str": "   This is a test   " }
{ "_id": 3, "str": "   Welcome   " }
```

下面的代码使用 `rtrim`，去除字符串右侧的空格：

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    trimmed: $.rtrim('$str')
  })
  .end()
```

输出如下：

```typescript
{ "_id": 1, "trimmed": "  Hello World" }
{ "_id": 2, "trimmed": "   This is a test" }
{ "_id": 3, "trimmed": "   Welcome" }
```

#### API Description

The syntax of `concat` is as follows:

```typescript
db.command.aggregate.concat([<expression1>, <expression2>, ...])
```

The expression can be a `$ + specified field` or a regular string. As long as it can be parsed into a string.

#### Example Code

Assume that the records in the "students" collection are as follows:

```typescript
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

With the help of `concat`, you can concatenate the `lastName` and `firstName` fields to get the full name of each student:

```typescript
const $ = db.command.aggregate;
db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    fullName: $.concat(['$firstName', ' ', '$lastName'])
  })
  .end()
```

The returned result is as follows:

```typescript
{ "fullName": "Yuanxin Dong" }
{ "fullName": "Weijia Wang" }
{ "fullName": "Chengxi Li" }
```

### indexOfBytes

Find a substring in the target string and return the index of the first occurrence of the `UTF-8` byte (starting from 0). If the substring does not exist, return -1.

#### API Description

The syntax of `indexOfBytes` is as follows:

```typescript
db.command.aggregate.indexOfBytes([<targetStringExpression>, <subStringExpression>, <startPositionExpression>, <endPositionExpression>])
```

Here are the detailed descriptions of the four expressions:

|Expression              |Description                              |
|----                    |----                                     |
|targetStringExpression  |Any expression that can be parsed into a string|
|subStringExpression     |Any expression that can be parsed into a string|
|startPositionExpression |Any expression that can be parsed into a non-negative integer|
|endPositionExpression   |Any expression that can be parsed into a non-negative integer|

#### Example Code

Assume that the records in the "students" collection are as follows:

```typescript
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

Using `indexOfBytes` to find the position of the character `"a"` in the `firstName` field:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    aStrIndex: $.indexOfBytes(['$firstName', 'a'])
  })
  .end()
```

The returned result is as follows:

```typescript
{ "aStrIndex": 2 }
{ "aStrIndex": 5 }
{ "aStrIndex": -1 }
```

### indexOfCP

Find a substring in the target string and return the index of the first occurrence of the `UTF-8` code point (starting from 0). If the substring does not exist, return -1.

#### API Description

A `code point` is a term used to describe Unicode code points, ranging from 0 (hexadecimal) to 10FFFF (hexadecimal), in the Unicode package.

The syntax of `indexOfCP` is as follows:

```typescript
db.command.aggregate.indexOfCP([<targetStringExpression>, <subStringExpression>, <startPositionExpression>, <endPositionExpression>])
```

Here are the detailed descriptions of the four expressions:

|Expression              |Description                              |
|----                    |----                                     |
|targetStringExpression  |Any expression that can be parsed into a string|
|subStringExpression     |Any expression that can be parsed into a string|
|startPositionExpression |Any expression that can be parsed into a non-negative integer|
|endPositionExpression   |Any expression that can be parsed into a non-negative integer|

#### Example Code

Assume that the records in the "students" collection are as follows:

```typescript
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

Using `indexOfCP` to find the position of the character `"a"` in the `firstName` field:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    aStrIndex: $.indexOfCP(['$firstName', 'a'])
  })
  .end()
```

The returned result is as follows:

```typescript
{ "aStrIndex": 2 }
{ "aStrIndex": 5 }
{ "aStrIndex": -1 }
```

### split

Split an array by a delimiter and remove the delimiter. Return an array of substrings. If the delimiter is not found in the string, return the original string as the only element in the array.

#### API Description

The syntax of `split` is as follows:

```typescript
db.command.aggregate.split([<string expression>, <delimiter expression>])
```

Both the string expression and delimiter expression can be any form of expression as long as it can be parsed as a string.

#### Example Code

Assume the records in the collection `students` are as follows:

```typescript
{ "birthday": "1999/12/12" }
{ "birthday": "1998/11/11" }
{ "birthday": "1997/10/10" }
```

Use `split` to split the value of the `birthday` field in each record into an array with 3 elements representing the year, month, and day:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    birthday: $.split(['$birthday', '/'])
  })
  .end()
```

The returned results are as follows:

```typescript
{ "birthday": [ "1999", "12", "12" ] }
{ "birthday": [ "1998", "11", "11" ] }
{ "birthday": [ "1997", "10", "10" ] }
```

### strLenBytes

Calculate and return the number of bytes in the specified string encoded in UTF-8.

#### API Description

The syntax of `strLenBytes` is as follows:

```typescript
db.command.aggregate.strLenBytes(<expression>)
```

The expression can be any form of expression as long as it can be parsed as a string.

#### Example Code

Assume the records in the collection `students` are as follows:

```typescript
{ "name": "dongyuanxin", "nickname": "心谭" }
```

Use `strLenBytes` to calculate the byte length of the values in the `name` and `nickname` fields:

```typescript
const $ = db.command.aggregate
db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    nameLength: $.strLenBytes('$name'),
    nicknameLength: $.strLenBytes('$nickname')
  })
  .end()
```

The returned results are as follows:

```typescript
{ "nameLength": 11, "nicknameLength": 6 }
```

### strLenCP

Calculate and return the number of UTF-8 code points in the specified string.

#### API Description

The syntax of `strLenCP` is as follows:

```typescript
db.command.aggregate.strLenCP(<expression>)
```

The expression can be any form of expression as long as it can be parsed as a string.

#### Example Code

Assume the records in the collection `students` are as follows:

```typescript
{ "name": "dongyuanxin", "nickname": "心谭" }
```

Use `strLenCP` to calculate the number of UTF-8 code points in the values of the `name` and `nickname` fields:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    nameLength: $.strLenCP('$name'),
    nicknameLength: $.strLenCP('$nickname')
  })
  .end()
```

The returned results are as follows:

```typescript
{ "nameLength": 11, "nicknameLength": 2 }
```

### strcasecmp

Compare two strings case-insensitively and return the result of the comparison.

#### API Description

The syntax of `strcasecmp` is as follows:

```typescript
db.command.aggregate.strcasecmp([<expression1>, <expression2>])
```

Both expression1 and expression2 can be any form of expression as long as they can be parsed as strings.

The returned comparison result can be one of the following:

- 1: The string parsed from expression1 is greater than the string parsed from expression2.
- 0: The string parsed from expression1 is equal to the string parsed from expression2.
- -1: The string parsed from expression1 is less than the string parsed from expression2.

#### Sample Code

Assuming the records in the `students` collection are as follows:

```typescript
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

Using `strcasecmp` to compare the values of the `firstName` and `lastName` fields:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    result: $.strcasecmp(['$firstName', '$lastName']),
  })
  .end();
```

The returned results are as follows:

```typescript
{ "result": 1 }
{ "result": 1 }
{ "result": -1 }
```

### substr

Returns a substring of a string starting from a specified position and with a specified length. It is an alias for `db.command.aggregate.substrBytes`, and the latter is recommended.

#### API Description

The syntax for `substr` is as follows:

```typescript
db.command.aggregate.substr([<expression1>, <expression2>, <expression3>])
```

`expression1` can be any valid expression that resolves to a string, and `expression2` and `expression3` can be any valid expressions that resolve to numbers.

If `expression2` is negative, the result will be an empty string.

If `expression3` is negative, the result will be a substring starting from the position specified by `expression2` and including the remaining part.

#### Sample Code

Assuming the records in the `students` collection are as follows:

```typescript
{ "birthday": "1999/12/12", "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "birthday": "1998/11/11", "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "birthday": "1997/10/10", "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

Using `substr` to extract the year, month, and day information from `birthday`, the code is as follows:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    year: $.substr(['$birthday', 0, 4]),
    month: $.substr(['$birthday', 5, 2]),
    day: $.substr(['$birthday', 8, -1])
  })
  .end();
```

The returned results are as follows:

```typescript
{ "day": "12", "month": "12", "year": "1999" }
{ "day": "11", "month": "11", "year": "1998" }
{ "day": "10", "month": "10", "year": "1997" }
```

### substrBytes

Returns a substring of a string starting from a specified position and with a specified length. The substring starts at the character with the specified UTF-8 byte index in the string and has the specified number of bytes.

#### API Description

The syntax for `substrBytes` is as follows:

```typescript
db.command.aggregate.substrBytes([<expression1>, <expression2>, <expression3>])
```

`expression1` can be any valid expression that resolves to a string, and `expression2` and `expression3` can be any valid expressions that resolve to numbers.

If `expression2` is negative, the result will be an empty string.

If `expression3` is negative, the result will be a substring starting from the position specified by `expression2` and including the remaining part.

#### Sample Code

Assume the records of the collection `students` are as follows:

```typescript
{ "birthday": "1999/12/12", "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "birthday": "1998/11/11", "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "birthday": "1997/10/10", "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

With the help of `substrBytes`, you can extract the year, month, and day information from `birthday`. The code is as follows:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    year: $.substrBytes(['$birthday', 0, 4]),
    month: $.substrBytes(['$birthday', 5, 2]),
    day: $.substrBytes(['$birthday', 8, -1])
  })
  .end();
```

The returned result is as follows:

```typescript
{ "day": "12", "month": "12", "year": "1999" }
{ "day": "11", "month": "11", "year": "1998" }
{ "day": "10", "month": "10", "year": "1997" }
```

### substrCP

Returns a substring of the string starting at the specified position with the specified length. The substring starts at the character specified by the byte index in the string and has a length of the specified number of bytes.

#### API Description

The syntax of `substrCP` is as follows:

```typescript
db.command.aggregate.substrCP([<expression1>, <expression2>, <expression3>])
```

`expression1` can be any valid expression that can be parsed as a string, and `expression2` and `expression3` can be any valid expressions that can be parsed as numbers.

If `expression2` is negative, the result will be `""`.

If `expression3` is negative, the result will be the substring starting from the position specified by `expression2` to the end.

#### Sample Code

Assume the records of the collection `students` are as follows:

```typescript
{ "name": "dongyuanxin", "nickname": "心谭" }
```

With the help of `substrCP`, you can extract the first Chinese character from the value of the `nickname` field:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    firstCh: $.substrCP(['$nickname', 0, 1])
  })
  .end();
```

The returned result is as follows:

```typescript
{ "firstCh": "心" }
```

### toLower

Converts a string to lowercase and returns it.

#### API Description

The syntax of `toLower` is as follows:

```typescript
db.command.aggregate.toLower(expression)
```

The expression can be parsed as a string, such as `$ + specified field`.

#### Sample Code

Assume the records of the collection `students` are as follows:

```typescript
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

With the help of `toLower`, you can convert the value of the `firstName` field to lowercase:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    result: $.toLower('$firstName'),
  })
  .end();
```

The returned result is as follows:

```typescript
{ "result": "yuanxin" }
{ "result": "weijia" }
{ "result": "chengxi" }
```

### toUpper

Converts a string to uppercase and returns it.

#### API Description

The syntax of `toUpper` is as follows:

```typescript
db.command.aggregate.toUpper(expression)
```

The expression can be parsed as a string, such as `$ + specified field`.

#### Sample Code

Assuming the records of the `students` collection are as follows:

```typescript
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

Use `toUpper` to convert the value of the `lastName` field to uppercase:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    result: $.toUpper('$lastName'),
  })
  .end()
```

The returned results are as follows:

```typescript
{ "result": "DONG" }
{ "result": "WANG" }
{ "result": "LI" }
```

## Group Aggregation Methods

### addToSet

Aggregation operator. Adds a value to an array only if it does not already exist in the array. It can only be used in the `group stage`.

#### API Description

The syntax for `addToSet` is as follows:

```typescript
db.command.aggregate.addToSet(<expression>)
```

The expression is a string in the form of `$ + specified field`. If the value of the specified field is an array, the entire array will be treated as one element.

#### Sample Code

Assuming the records of the `passages` collection are as follows:

```typescript
{ "category": "web", "tags": [ "JavaScript", "CSS" ], "title": "title1" }
{ "category": "System", "tags": [ "C++", "C" ], "title": "title2" }
```

**Non-array Field**

For each record, the `category` field corresponds to a non-array value. Use `addToSet` to count all categories:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('passages')
  .aggregate()
  .group({
    _id: null,
    categories: $.addToSet('$category')
  })
  .end()
```

The returned results are as follows:

```typescript
{ "_id": null, "categories": [ "System", "web" ] }
```

**Array Field**

For each record, the `tags` field corresponds to an array value. The array will not be automatically expanded:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('passages')
  .aggregate()
  .group({
    _id: null,
    tagsList: $.addToSet('$tags')
  })
  .end()
```

The returned results are as follows:

```typescript
{ "_id": null, "tagsList": [ [ "C++", "C" ], [ "JavaScript", "CSS" ] ] }
```

### avg

<!--
/// meta
keyword: average
-->

Returns the average value of a specified field in a group of collections.

#### API Description

The syntax for `avg` is as follows:

```typescript
db.command.aggregate.avg(<number>)
```

The value passed to `avg` can be either a numeric constant or any expression that resolves to a number. It ignores non-numeric values.

#### Sample Code

Assuming the records of the `students` collection are as follows:

```typescript
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

With the help of `avg`, you can calculate the average value of the `score` field for all records:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .group({
    _id: null,
    average: $.avg('$score')
  })
  .end()
```

The returned results are as follows:

```typescript
{ "_id": null, "average": 90 }
```

### first

Returns the value of a specified field in the first record of a group of collections. This operation only makes sense when the group is sorted in some defined order (`sort`).

#### API Description

The syntax for `first` is as follows:

```typescript
db.command.aggregate.first(<expression>)
```

The expression is a string in the form of `$ + specified field`.

`first` can only be used in the `group` stage and requires `sort` to have meaning.

#### Sample Code

Assume the records of the `students` collection are as follows:

```typescript
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

To get the minimum value of `score` in all records, you can first sort all records by `score`, and then take the `first` record.

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .sort({
    score: 1
  })
  .group({
    _id: null,
    min: $.first('$score')
  })
  .end()
```

The returned data result is as follows:

```typescript
{ "_id": null, "min": 80 }
```

### last

Returns the value corresponding to the specified field of the last record in a group of collections. This operation only makes sense when the group of collections is sorted according to a defined order (`sort`).

#### API Description

The syntax of `last` is as follows:

```typescript
db.command.aggregate.last(<expression>)
```

The expression is a string in the form of `$ + specified field`.

`last` can only be used at the `group` stage and needs to be combined with `sort` to make sense.

#### Sample Code

Assume the records of the `students` collection are as follows:

```typescript
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

To get the maximum value of `score` in all records, you can first sort all records by `score`, and then take the `last` record.

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .sort({
    score: 1
  })
  .group({
    _id: null,
    max: $.last('$score')
  })
  .end()
```

The returned data result is as follows:

```typescript
{ "_id": null, "max": 100 }
```

### max

Returns the maximum value of a group of numbers.

#### API Description

The syntax of `max` is as follows:

```typescript
db.command.aggregate.max(<expression>)
```

The expression is a string in the form of `$ + specified field`.

#### Sample Code

Assume the records of the `students` collection are as follows:

```typescript
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

With the help of `max`, you can calculate the highest score in different groups (`group`). The code is as follows:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .group({
    _id: '$group',
    maxScore: $.max('$score')
  })
  .end()
```

The returned data result is as follows:

```typescript
{ "_id": "b", "maxScore": 100 }
{ "_id": "a", "maxScore": 96 }
...
```

### min

Returns the minimum value of a group of numbers.

#### API Description

The syntax of `min` is as follows:

```typescript
db.command.aggregate.min(<expression>)
```

The expression is a string in the form of `$ + specified field`.

#### Sample Code

Assume the records of the `students` collection are as follows:

```typescript
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

With the help of `min`, you can calculate the lowest score in different groups (`group`). The code is as follows:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .group({
    _id: '$group',
    minScore: $.min('$score')
  })
  .end()
```

The returned data result is as follows:

```typescript
{ "_id": "b", "minScore": 80 }
{ "_id": "a", "minScore": 84 }
```

### push

At the `group` stage, returns an array consisting of the specified columns and their corresponding values in a group.

#### API Description

The syntax of `push` is as follows:

```typescript
db.command.aggregate.push({
  <field name 1>: <specified field 1>,
  <field name 2>: <specified field 2>,
  ...
})
```

#### Sample Code

Assuming the records of the `students` collection are as follows:

```typescript
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

Using the `push` operation, aggregate and structure the data for all records in different groups (`group`) into a new field.

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .group({
    _id: '$group',
    students: $.push({
      name: '$name',
      score: '$score'
    })
  })
  .end()
```

The output result is as follows:

```typescript
{ "_id": "b", "students": [{ "name": "stu3", "score": 80 }, { "name": "stu4", "score": 100 }] }
{ "_id": "a", "students": [{ "name": "stu1", "score": 84 }, { "name": "stu2", "score": 96 }] }
```

### stdDevPop

Returns the population standard deviation of a set of values.

#### API Description

The usage of `stdDevPop` is as follows:

```typescript
db.command.aggregate.stdDevPop(<expression>)
```

The expression passed in is the specified field. The data type of the specified field's values must be `number`, otherwise the result will be `null`.

#### Sample Code

Assuming the records of the `students` collection are as follows: The scores of group `a` students are 84 and 96, and the scores of group `b` students are 80 and 100.

You can use `stdDevPop` to calculate the standard deviation of the grades for groups `a` and `b` in order to compare which group of students has more stable grades. The code is as follows:

```typescript
const $ = db.command.aggregate
let res = await db.collection('students').aggregate()
  .group({
    _id: '$group',
    stdDev: $.stdDevPop('$score')
  })
  .end()
```

The data result returned is as follows:

```typescript
{ "_id": "b", "stdDev": 10 }
{ "_id": "a", "stdDev": 6 }
```

### stdDevSamp

Calculates the sample standard deviation of a set of values. If the input values represent the entire population or do not generalize more data, please use `db.command.aggregate.stdDevPop`.

#### API Description

The usage of `stdDevSamp` is as follows:

```typescript
db.command.aggregate.stdDevSamp(<expression>)
```

The expression passed in is the specified field. `stdDevSamp` will automatically ignore non-numeric values. If all values of the specified field are non-numeric, the result will be `null`.

#### Sample Code

Assuming the records of the `students` collection are as follows:

```typescript
{ "score": 80 }
{ "score": 100 }
```

You can use `stdDevSamp` to calculate the sample standard deviation of the scores. The code is as follows:

```typescript
const $ = db.command.aggregate
let res = await db.collection('students').aggregate()
  .group({
    _id: null,
    scoreStdDev: $.stdDevSamp('$score')
  })
  .end()
```

The data result returned is as follows:

```typescript
{ "_id": null, "scoreStdDev": 14.142135623730951 }
```

If you add a new record to the `students` collection with the `score` field as a `string`:

```typescript
{ "score": "aa" }
```

When calculating the sample standard deviation using the code above, `stdDevSamp` will automatically ignore records whose type is not `number`, and the result will remain unchanged.

### sum

Calculates and returns the sum of a set of numeric field values.

#### API Description

The usage of `sum` is as follows:

```typescript
db.command.aggregate.sum(<expression>)
```

The expression can be a specified field or a list of specified fields. `sum` will automatically ignore non-numeric values. If all values under the field are non-numeric, the result will be 0. If a numerical constant is passed in, it is treated as a constant given to the field value for all records, and the final value is the input record number multiplied by the constant.

#### Sample Code

Assume the records representing a collection of goods `goods` are as follows: `price` represents the sales amount of the goods, `cost` represents the cost of the goods.

```typescript
{ "cost": -10, "price": 100 }
{ "cost": -15, "price": 1 }
{ "cost": -10, "price": 10 }
```

**Single Field**

With the help of `sum`, we can calculate the total sales amount of all goods. The code is as follows:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('goods')
  .aggregate()
  .group({
    _id: null,
    totalPrice: $.sum('$price')
  })
  .end()
```

The returned data result is as follows: the total sales amount is 111

```typescript
{ "_id": null, "totalPrice": 111 }
```

**Field List**

If we need to calculate the total profit of all goods, we need to add the `cost` and `price` of each record to get the profit of the corresponding goods for each record. Finally, calculate the total profit of all goods.

With the help of `sum`, the code is as follows:

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('goods')
  .aggregate()
  .group({
    _id: null,
    totalProfit: $.sum(
      $.sum(['$price', '$cost'])
    )
  })
  .end()
```

The returned data result is as follows: the total profit is 76

```typescript
{ "_id": null, "totalProfit": 76 }
```

## Variable Operator

### let

Define custom variables and use them in specified expressions. The result returned is the result of the expression.

#### API Description

The syntax for `let` is as follows:

```typescript
db.command.aggregate.let({
  vars: {
    <variable1>: <variable_expression>,
    <variable2>: <variable_expression>,
    ...
  },
  in: <result_expression>
})
```

Multiple variables can be defined in `vars`, and the value of the variable is calculated by the `variable_expression`. The defined variables can only be accessed in the `result_expression` in the `in`.

When accessing custom variables in the result expression, please prefix the variable name with double dollar signs (`$$`) and enclose it in quotes.

#### Sample Code

Assuming the records representing a collection of goods called `goods` are as follows: `price` represents the price of the goods, `discount` represents the discount rate of the goods, `cost` represents the cost of the goods.

```typescript
{ "cost": -10, "discount": 0.95, "price": 100 }
{ "cost": -15, "discount": 0.98, "price": 1 }
{ "cost": -10, "discount": 1, "price": 10 }
```

Using `let`, you can define and calculate the actual selling price for each item, and assign it to a custom variable called `priceTotal`. Finally, add `priceTotal` and `cost` together to calculate the profit for each item.

Here is the code:

```typescript
const $ = db.command.aggregate;
let res = await db
  .collection('goods')
  .aggregate()
  .project({
    profit: $.let({
      vars: {
        priceTotal: $.multiply(['$price', '$discount']),
      },
      in: $.sum(['$$priceTotal', '$cost']),
    }),
  })
  .end();
```

The returned data results are as follows:

```
{ "profit": 85 }
{ "profit": -14.02 }
{ "profit": 0 }
```