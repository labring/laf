---
title: 地理信息API
---

# {{ $frontmatter.title }}

注意：**如果需要对类型为地理位置的字段进行搜索，一定要建立地理位置索引**。

## GEO 数据类型

### Point

用于表示地理位置点，用经纬度唯一标记一个点，这是一个特殊的数据存储类型。

签名：`Point(longitude: number, latitude: number)`

示例：

```js
new db.Geo.Point(longitude, latitude);
```

### LineString

用于表示地理路径，是由两个或者更多的 `Point` 组成的线段。

签名：`LineString(points: Point[])`

示例：

```js
new db.Geo.LineString([
  new db.Geo.Point(lngA, latA),
  new db.Geo.Point(lngB, latB),
  // ...
]);
```

### Polygon

用于表示地理上的一个多边形（有洞或无洞均可），它是由一个或多个**闭环** `LineString` 组成的几何图形。

由一个环组成的 `Polygon` 是没有洞的多边形，由多个环组成的是有洞的多边形。对由多个环（`LineString`）组成的多边形（`Polygon`），第一个环是外环，所有其他环是内环（洞）。

签名：`Polygon(lines: LineString[])`

示例：

```js
new db.Geo.Polygon([
  new db.Geo.LineString(...),
  new db.Geo.LineString(...),
  // ...
])
```

### MultiPoint

用于表示多个点 `Point` 的集合。

签名：`MultiPoint(points: Point[])`

示例：

```js
new db.Geo.MultiPoint([
  new db.Geo.Point(lngA, latA),
  new db.Geo.Point(lngB, latB),
  // ...
]);
```

### MultiLineString

用于表示多个地理路径 `LineString` 的集合。

签名：`MultiLineString(lines: LineString[])`

示例：

```js
new db.Geo.MultiLineString([
  new db.Geo.LineString(...),
  new db.Geo.LineString(...),
  // ...
])
```

### MultiPolygon

用于表示多个地理多边形 `Polygon` 的集合。

签名：`MultiPolygon(polygons: Polygon[])`

示例：

```js
new db.Geo.MultiPolygon([
  new db.Geo.Polygon(...),
  new db.Geo.Polygon(...),
  // ...
])
```

## GEO 操作符

### geoNear

按从近到远的顺序，找出字段值在给定点的附近的记录。

签名：

```js
db.command.geoNear(options: IOptions)

interface IOptions {
  geometry: Point // 点的地理位置
  maxDistance?: number // 选填，最大距离，米为单位
  minDistance?: number // 选填，最小距离，米为单位
}
```

示例：

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

找出字段值在指定 Polygon / MultiPolygon 内的记录，无排序

签名：

```js
db.command.geoWithin(IOptions);

interface IOptions {
  geometry: Polygon | MultiPolygon; // 地理位置
}
```

示例：

```js
// 一个闭合的区域
const area = new Polygon([
  new LineString([
    new Point(lngA, latA),
    new Point(lngB, latB),
    new Point(lngC, latC),
    new Point(lngA, latA),
  ]),
]);

// 搜索 location 字段在这个区域中的 user
db.collection("user").where({
  location: db.command.geoWithin({
    geometry: area,
  }),
});
```

### geoIntersects

找出字段值和给定的地理位置图形相交的记录

签名：

```js
db.command.geoIntersects(IOptions);

interface IOptions {
  geometry:
    | Point
    | LineString
    | MultiPoint
    | MultiLineString
    | Polygon
    | MultiPolygon; // 地理位置
}
```

示例：

```js
// 一条路径
const line = new LineString([new Point(lngA, latA), new Point(lngB, latB)]);

// 搜索 location 与这条路径相交的 user
db.collection("user").where({
  location: db.command.geoIntersects({
    geometry: line,
  }),
});
```
