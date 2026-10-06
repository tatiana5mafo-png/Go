import { useMemo } from 'react';
import { POINTS_OF_INTEREST } from '../constants/pois';
import { Coordinate, PointOfInterest } from '../types';
import { haversineMeters } from '../utils/haversine';

export const INTERACTION_RADIUS_M = 20;

export interface NearbyPoi {
  poi: PointOfInterest;
  distance: number;
}

export function useNearestPoi(position: Coordinate | null): NearbyPoi | null {
  return useMemo(() => {
    if (!position) return null;

    let best: PointOfInterest | null = null;
    let bestDistance = Infinity;
    for (const poi of POINTS_OF_INTEREST) {
      const d = haversineMeters(position, poi.coordinate);
      if (d < bestDistance) {
        bestDistance = d;
        best = poi;
      }
    }
    return best && bestDistance <= INTERACTION_RADIUS_M
      ? { poi: best, distance: bestDistance }
      : null;
  }, [position]);
}