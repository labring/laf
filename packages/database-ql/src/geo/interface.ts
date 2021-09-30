export interface ISerializedPoint {
    type: string,
    coordinates: [number, number]
}

export interface ISerializedLineString {
    type: string,
    coordinates: [number, number][]
}

export interface ISerializedPolygon {
    type: string,
    coordinates: [number, number][][]
}

export interface ISerializedMultiPoint {
    type: string,
    coordinates: [number, number][]
}

export interface ISerializedMultiLineString {
    type: string,
    coordinates: [number, number][][]
}

export interface ISerializedMultiPolygon {
    type: string,
    coordinates: [number, number][][][]
}