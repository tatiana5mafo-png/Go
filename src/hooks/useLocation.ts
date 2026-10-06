import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Coordinate } from '../types';

export type LocationStatus = 'loading' | 'granted' | 'denied';

interface UseLocationResult {
  position: Coordinate | null;
  status: LocationStatus;
}

export function useLocation(): UseLocationResult {
  const [position, setPosition] = useState<Coordinate | null>(null);
  const [status, setStatus] = useState<LocationStatus>('loading');

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (perm !== 'granted') {
        setStatus('denied');
        return;
      }
      setStatus('granted');

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 3000,   // no menor a 3 s (requisito del enunciado)
          distanceInterval: 2,  // ignora movimientos menores a 2 m
        },
        (loc) =>
          setPosition({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          }),
      );

      // Si el componente se desmontó mientras esperábamos, cerramos ya.
      if (cancelled) sub.remove();
      else subscription = sub;
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return { position, status };
}