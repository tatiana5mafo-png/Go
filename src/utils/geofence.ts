import { Coordinate } from '../types';

/**
 * Ray-casting: lanza un rayo horizontal hacia el este desde el punto
 * y cuenta cuántos lados del polígono cruza. Impar = dentro, par = fuera.
 */
export function isPointInPolygon(
  point: Coordinate,
  polygon: readonly Coordinate[],
): boolean {
  const { latitude: y, longitude: x } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const yi = polygon[i].latitude;
    const xi = polygon[i].longitude;
    const yj = polygon[j].latitude;
    const xj = polygon[j].longitude;

    // ¿El lado (j→i) cruza la altura y del punto, y el cruce queda a la derecha?
    const crossesY = yi > y !== yj > y;
    if (crossesY && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}