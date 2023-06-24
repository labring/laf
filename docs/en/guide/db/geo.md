---
title: Geographic Information API
---

# {{ $frontmatter.title }}

Note: **If you need to search for fields of type geographic location, be sure to establish a geospatial index**.

## GEO Data Types

### Point

Used to represent a geographical location point, uniquely identified by longitude and latitude. This is a special data storage type.

Signature: `Point(longitude: number, latitude: number)`

Example:

```js
new db.Geo.Point(longitude, latitude);
```

### LineString

Used to represent a geographical path, composed of two or more `Point` lines.

Signature: `LineString(points: Point[])`

Example:

```js
new db.Geo.LineString([
  new db.Geo.Point(lngA, latA),
  new db.Geo.Point(lngB, latB),
  // ...
]);
```

### Polygon

Used to represent a polygon in geography (with or without holes), consists of one or more **closed loops** of `LineString` geometry.

A `Polygon` consisting of a single loop is a polygon without holes, while a `Polygon` consisting of multiple loops has holes. For a `Polygon` composed of multiple loops (`LineString`), the first loop is the outer loop, and all other loops are inner loops (holes).

Signature: `Polygon(lines: LineString[])`

Example:

```js
new db.Geo.Polygon([
  new db.Geo.LineString(...),
  new db.Geo.LineString(...),
  // ...
])
```

### MultiPoint

Used to represent a collection of multiple points `Point`.

Signature: `MultiPoint(points: Point[])`

Example:

```js
new db.Geo.MultiPoint([
  new db.Geo.Point(lngA, latA),
  new db.Geo.Point(lngB, latB),
  // ...
]);
```

### MultiLineString

Used to represent a collection of multiple geographical paths `LineString`.

Signature: `MultiLineString(lines: LineString[])`

Example:

```js
new db.Geo.MultiLineString([
  new db.Geo.LineString(...),
  new db.Geo.LineString(...),
  // ...
])
```

### MultiPolygon

Used to represent a collection of multiple geographical polygons `Polygon`.

Signature: `MultiPolygon(polygons: Polygon[])`

Example:

```js
new db.Geo.MultiPolygon([
  new db.Geo.Polygon(...),
  new db.Geo.Polygon(...),
  // ...
])
```

## GEO Operators

### geoNear

Finds records near the given point, in order from closest to farthest.

Signature:

```js
db.command.geoNear(options: IOptions)

interface IOptions {
  geometry: Point // Geographical location of the point
  maxDistance?: number // Optional. Maximum distance in meters
  minDistance?: number // Optional. Minimum distance in meters
}
```

Example:

```js
db.collection("user").where({
  location: db.command.geoNear({
    geometry: new db.Geo.Point(lngA, latA),
    maxDistance: 1000,
    minDistance: 0,
  }),
});
```

### geoWithin

Finds records with field values within the specified Polygon / MultiPolygon, unsorted.

Signature:

```js
db.command.geoWithin(IOptions);

interface IOptions {
  geometry: Polygon | MultiPolygon; // Geographical location
}
```

Example:

```js
// A closed area
const area = new Polygon([
  new LineString([
    new Point(lngA, latA),
    new Point(lngB, latB),
    new Point(lngC, latC),
    new Point(lngA, latA),
  ]),
]);

// Search for users with the location field within this area
db.collection("user").where({
  location: db.command.geoWithin({
    geometry: area,
  }),
});
```

### geoIntersects

Find records that intersect with a given geographic location geometry.

Signature:

```js
db.command.geoIntersects(IOptions);

interface IOptions {
  geometry:
    | Point
    | LineString
    | MultiPoint
    | MultiLineString
    | Polygon
    | MultiPolygon; // Geographic location
}
```

Example:

```js
// A line
const line = new LineString([new Point(lngA, latA), new Point(lngB, latB)]);

// Search for users whose location intersects with this line
db.collection("user").where({
  location: db.command.geoIntersects({
    geometry: line,
  }),
});
```