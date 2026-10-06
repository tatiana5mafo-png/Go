export interface Coordinate {
  latitude: number;
  longitude: number;
}

export type PoiKind = 'pokestop' | 'gym';

export interface PointOfInterest {
  id: string;
  name: string;
  kind: PoiKind;
  coordinate: Coordinate;
}