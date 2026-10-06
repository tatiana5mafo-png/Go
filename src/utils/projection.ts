import { Coordinate } from '../types';

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number): number => (deg * Math.PI) / 180;

export interface PointM {
  x: number; // metros al este del origen
  y: number; // metros al sur del origen (eje Y de pantalla crece hacia abajo)
}

/** Proyección equirectangular local: válida a escala de campus (~1 km). */
export function makeProjector(origin: Coordinate) {
  const cosLat = Math.cos(toRad(origin.latitude));
  return (c: Coordinate): PointM => ({
    x: toRad(c.longitude - origin.longitude) * cosLat * EARTH_RADIUS_M,
    y: -toRad(c.latitude - origin.latitude) * EARTH_RADIUS_M,
  });
}